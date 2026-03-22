// components/intervals/l2/IntervalsEditorL2.jsx  — v7
//
// 修复 v6 三个问题：
//   1. 框住感 — 不再用 L2Overlay，改用专属全屏 overlay，面板更宽更高
//   2. 点击退 L0 — L2Overlay 的 drag="y" 与 arcball 冲突，已移除
//      专属 overlay 无 framer-motion drag，backdrop onClick 与 canvas 严格隔离
//   3. 窗口晃动 — ArcballControl pointermove 加 e.preventDefault()
//      + setPointerCapture 确保 pointer 不逃逸

import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { SPRINGS_IV } from '../../../motion/springs';
import { INTERVAL_PRESETS } from '../../../trainers/intervals/constants';
import { INTERVAL_LABELS } from '../../../constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

const ALL_INTERVALS = INTERVAL_LABELS.filter(l => l !== 'R');

const INTERVAL_FULL = {
  'b2': 'Minor 2nd',  '2': 'Major 2nd',
  'b3': 'Minor 3rd',  '3': 'Major 3rd',
  '4':  'Perfect 4th','b5': 'Tritone',
  '5':  'Perfect 5th','b6': 'Minor 6th',
  '6':  'Major 6th',  'b7': 'Minor 7th',
  '7':  'Major 7th',
};

const INTERVAL_ITEMS = ALL_INTERVALS.map(ivl => ({
  id:          ivl,
  title:       ivl,
  description: INTERVAL_FULL[ivl] ?? '',
}));

// ── GLSL shaders — 官网原版，未改动 ────────────────────────────
const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
#define PI 3.141593
void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);
    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }
    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;
    float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;
    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}`;

// ── 几何类 — 官网原版 ───────────────────────────────────────────
class Face { constructor(a,b,c){this.a=a;this.b=b;this.c=c;} }
class Vertex {
  constructor(x,y,z){ this.position=vec3.fromValues(x,y,z); this.normal=vec3.create(); this.uv=vec2.create(); }
}
class Geometry {
  constructor(){this.vertices=[];this.faces=[];}
  addVertex(...a){for(let i=0;i<a.length;i+=3)this.vertices.push(new Vertex(a[i],a[i+1],a[i+2]));return this;}
  addFace(...a){for(let i=0;i<a.length;i+=3)this.faces.push(new Face(a[i],a[i+1],a[i+2]));return this;}
  get lastVertex(){return this.vertices[this.vertices.length-1];}
  subdivide(d=1){
    const c={};let f=this.faces;
    for(let i=0;i<d;++i){
      const nf=new Array(f.length*4);
      f.forEach((face,ndx)=>{
        const mAB=this.getMidPoint(face.a,face.b,c),mBC=this.getMidPoint(face.b,face.c,c),mCA=this.getMidPoint(face.c,face.a,c);
        const j=ndx*4;nf[j]=new Face(face.a,mAB,mCA);nf[j+1]=new Face(face.b,mBC,mAB);nf[j+2]=new Face(face.c,mCA,mBC);nf[j+3]=new Face(mAB,mBC,mCA);
      });f=nf;
    }this.faces=f;return this;
  }
  spherize(r=1){this.vertices.forEach(v=>{vec3.normalize(v.normal,v.position);vec3.scale(v.position,v.normal,r);});return this;}
  get data(){return{vertices:this.vertexData,indices:this.indexData,normals:this.normalData,uvs:this.uvData};}
  get vertexData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.position)));}
  get normalData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.normal)));}
  get uvData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.uv)));}
  get indexData(){return new Uint16Array(this.faces.flatMap(f=>[f.a,f.b,f.c]));}
  getMidPoint(a,b,cache){
    const k=a<b?`k_${b}_${a}`:`k_${a}_${b}`;
    if(Object.prototype.hasOwnProperty.call(cache,k))return cache[k];
    const va=this.vertices[a].position,vb=this.vertices[b].position;
    const ndx=this.vertices.length;cache[k]=ndx;
    this.addVertex((va[0]+vb[0])*.5,(va[1]+vb[1])*.5,(va[2]+vb[2])*.5);return ndx;
  }
}
class IcosahedronGeometry extends Geometry {
  constructor(){
    super();const t=Math.sqrt(5)*.5+.5;
    this.addVertex(-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1)
        .addFace(0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1);
  }
}
class DiscGeometry extends Geometry {
  constructor(steps=4,radius=1){
    super();steps=Math.max(4,steps);const alpha=(2*Math.PI)/steps;
    this.addVertex(0,0,0);this.lastVertex.uv[0]=.5;this.lastVertex.uv[1]=.5;
    for(let i=0;i<steps;++i){
      const x=Math.cos(alpha*i),y=Math.sin(alpha*i);
      this.addVertex(radius*x,radius*y,0);this.lastVertex.uv[0]=x*.5+.5;this.lastVertex.uv[1]=y*.5+.5;
      if(i>0)this.addFace(0,i,i+1);
    }this.addFace(0,steps,1);
  }
}

// ── WebGL helpers — 官网原版 ────────────────────────────────────
function createShader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(gl.getShaderParameter(s,gl.COMPILE_STATUS))return s;console.error(gl.getShaderInfoLog(s));gl.deleteShader(s);return null;}
function createProgram(gl,srcs,tfv,locs){
  const p=gl.createProgram();
  [gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].forEach((t,i)=>{const s=createShader(gl,t,srcs[i]);if(s)gl.attachShader(p,s);});
  if(tfv)gl.transformFeedbackVaryings(p,tfv,gl.SEPARATE_ATTRIBS);
  if(locs)for(const a in locs)gl.bindAttribLocation(p,locs[a],a);
  gl.linkProgram(p);if(gl.getProgramParameter(p,gl.LINK_STATUS))return p;console.error(gl.getProgramInfoLog(p));gl.deleteProgram(p);return null;
}
function makeVertexArray(gl,pairs,idx){
  const va=gl.createVertexArray();gl.bindVertexArray(va);
  for(const[b,loc,n]of pairs){if(loc===-1)continue;gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0);}
  if(idx){const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);}
  gl.bindVertexArray(null);return va;
}
function resizeCanvas(canvas){
  const dpr=Math.min(2,window.devicePixelRatio);
  const w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);
  const need=canvas.width!==w||canvas.height!==h;if(need){canvas.width=w;canvas.height=h;}return need;
}
function makeBuffer(gl,data,usage){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,usage);gl.bindBuffer(gl.ARRAY_BUFFER,null);return b;}
function setupTexture(gl,minF,magF,wS,wT){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wS);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,minF);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,magF);return t;}

// ── ArcballControl — 官网原版 + 修复窗口晃动 ───────────────────
// 修复：pointermove 加 preventDefault + setPointerCapture 防止 pointer 逃逸
class ArcballControl {
  isPointerDown=false; orientation=quat.create(); pointerRotation=quat.create();
  rotationVelocity=0; rotationAxis=vec3.fromValues(1,0,0);
  snapDirection=vec3.fromValues(0,0,-1); EPSILON=0.1; IDENTITY_QUAT=quat.create();

  constructor(canvas, updateCallback) {
    this.canvas=canvas; this.updateCallback=updateCallback||(() => null);
    this.pointerPos=vec2.create(); this.previousPointerPos=vec2.create();
    this._rotationVelocity=0; this._combinedQuat=quat.create();

    // Fix 修复3：setPointerCapture 确保 pointer 不逃逸到 backdrop
    canvas.addEventListener('pointerdown', e => {
      e.stopPropagation();                       // ← 阻止冒泡到 backdrop
      canvas.setPointerCapture(e.pointerId);     // ← 捕获 pointer，防止逃逸
      vec2.set(this.pointerPos, e.clientX, e.clientY);
      vec2.copy(this.previousPointerPos, this.pointerPos);
      this.isPointerDown=true;
    });
    canvas.addEventListener('pointerup', e => {
      e.stopPropagation();
      canvas.releasePointerCapture(e.pointerId);
      this.isPointerDown=false;
    });
    canvas.addEventListener('pointerleave', e => {
      e.stopPropagation();
      this.isPointerDown=false;
    });
    canvas.addEventListener('pointermove', e => {
      e.preventDefault();                        // ← Fix 修复3：阻止窗口晃动
      e.stopPropagation();
      if(this.isPointerDown) vec2.set(this.pointerPos, e.clientX, e.clientY);
    });
    // Fix 修复2：阻止 click 冒泡到 backdrop 触发 onClose
    canvas.addEventListener('click', e => e.stopPropagation());
    canvas.style.touchAction='none';
    canvas.style.userSelect='none';
  }

  update(dt, tfd=16) {
    const ts=dt/tfd+0.00001; let af=ts; let sr=quat.create();
    if(this.isPointerDown){
      const INT=0.3*ts, AMP=5/ts;
      const mid=vec2.sub(vec2.create(),this.pointerPos,this.previousPointerPos);
      vec2.scale(mid,mid,INT);
      if(vec2.sqrLen(mid)>this.EPSILON){
        vec2.add(mid,this.previousPointerPos,mid);
        const p=this.#project(mid),q=this.#project(this.previousPointerPos);
        vec2.copy(this.previousPointerPos,mid);
        af*=AMP;
        this.quatFromVectors(vec3.normalize(vec3.create(),p),vec3.normalize(vec3.create(),q),this.pointerRotation,af);
      } else { quat.slerp(this.pointerRotation,this.pointerRotation,this.IDENTITY_QUAT,INT); }
    } else {
      quat.slerp(this.pointerRotation,this.pointerRotation,this.IDENTITY_QUAT,0.1*ts);
      if(this.snapTargetDirection){
        const sq=vec3.squaredDistance(this.snapTargetDirection,this.snapDirection);
        af*=0.2*Math.max(0.1,1-sq*10);
        this.quatFromVectors(this.snapTargetDirection,this.snapDirection,sr,af);
      }
    }
    const cq=quat.multiply(quat.create(),sr,this.pointerRotation);
    this.orientation=quat.multiply(quat.create(),cq,this.orientation);
    quat.normalize(this.orientation,this.orientation);
    quat.slerp(this._combinedQuat,this._combinedQuat,cq,0.8*ts);
    quat.normalize(this._combinedQuat,this._combinedQuat);
    const rad=Math.acos(Math.max(-1,Math.min(1,this._combinedQuat[3])))*2;
    const s=Math.sin(rad/2); let rv=0;
    if(s>0.000001){rv=rad/(2*Math.PI);this.rotationAxis[0]=this._combinedQuat[0]/s;this.rotationAxis[1]=this._combinedQuat[1]/s;this.rotationAxis[2]=this._combinedQuat[2]/s;}
    this._rotationVelocity+=(rv-this._rotationVelocity)*(0.5*ts);
    this.rotationVelocity=this._rotationVelocity/ts;
    this.updateCallback(dt);
  }

  quatFromVectors(a,b,out,af=1){
    const axis=vec3.cross(vec3.create(),a,b); vec3.normalize(axis,axis);
    quat.setAxisAngle(out,axis,Math.acos(Math.max(-1,Math.min(1,vec3.dot(a,b))))*af);
    return{q:out,axis};
  }

  #project(pos){
    const r=2,w=this.canvas.clientWidth,h=this.canvas.clientHeight,s=Math.max(w,h)-1;
    const x=(2*pos[0]-w-1)/s,y=(2*pos[1]-h-1)/s;
    const xySq=x*x+y*y,rSq=r*r;
    return vec3.fromValues(-x,y,xySq<=rSq/2?Math.sqrt(rSq-xySq):rSq/Math.sqrt(xySq));
  }
}

// ── InfiniteGridMenu — 官网原版，initTexture 改为 canvas 文字 ──
class InfiniteGridMenu {
  TARGET_FRAME_DURATION=1000/60; SPHERE_RADIUS=2;
  #time=0; #deltaTime=0; #deltaFrames=0; #frames=0;
  camera={matrix:mat4.create(),near:0.1,far:40,fov:Math.PI/4,aspect:1,position:vec3.fromValues(0,0,3),up:vec3.fromValues(0,1,0),matrices:{view:mat4.create(),projection:mat4.create(),inversProjection:mat4.create()}};
  smoothRotationVelocity=0; scaleFactor=1.0; movementActive=false;

  constructor(canvas,items,onActiveItemChange,onMovementChange,onInit=null,scale=1.0){
    this.canvas=canvas; this.items=items||[];
    this.onActiveItemChange=onActiveItemChange||(() => {}); this.onMovementChange=onMovementChange||(() => {});
    this.scaleFactor=scale; this.camera.position[2]=3*scale; this.#init(onInit);
  }
  resize(){
    this.viewportSize=vec2.set(this.viewportSize||vec2.create(),this.canvas.clientWidth,this.canvas.clientHeight);
    const gl=this.gl; if(resizeCanvas(gl.canvas))gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
    this.#updateProjectionMatrix(gl);
  }
  run(time=0){
    this.#deltaTime=Math.min(32,time-this.#time); this.#time=time;
    this.#deltaFrames=this.#deltaTime/this.TARGET_FRAME_DURATION; this.#frames+=this.#deltaFrames;
    this.#animate(this.#deltaTime); this.#render();
    this._rafId=requestAnimationFrame(t=>this.run(t));
  }
  destroy(){if(this._rafId)cancelAnimationFrame(this._rafId);}

  #init(onInit){
    this.gl=this.canvas.getContext('webgl2',{antialias:true,alpha:true});
    const gl=this.gl; if(!gl)throw new Error('No WebGL2!');
    this.viewportSize=vec2.fromValues(this.canvas.clientWidth,this.canvas.clientHeight);
    this.discProgram=createProgram(gl,[discVertShaderSource,discFragShaderSource],null,{aModelPosition:0,aModelNormal:1,aModelUvs:2,aInstanceMatrix:3});
    this.discLocations={
      aModelPosition:gl.getAttribLocation(this.discProgram,'aModelPosition'),
      aModelUvs:gl.getAttribLocation(this.discProgram,'aModelUvs'),
      aInstanceMatrix:gl.getAttribLocation(this.discProgram,'aInstanceMatrix'),
      uWorldMatrix:gl.getUniformLocation(this.discProgram,'uWorldMatrix'),
      uViewMatrix:gl.getUniformLocation(this.discProgram,'uViewMatrix'),
      uProjectionMatrix:gl.getUniformLocation(this.discProgram,'uProjectionMatrix'),
      uCameraPosition:gl.getUniformLocation(this.discProgram,'uCameraPosition'),
      uScaleFactor:gl.getUniformLocation(this.discProgram,'uScaleFactor'),
      uRotationAxisVelocity:gl.getUniformLocation(this.discProgram,'uRotationAxisVelocity'),
      uTex:gl.getUniformLocation(this.discProgram,'uTex'),
      uFrames:gl.getUniformLocation(this.discProgram,'uFrames'),
      uItemCount:gl.getUniformLocation(this.discProgram,'uItemCount'),
      uAtlasSize:gl.getUniformLocation(this.discProgram,'uAtlasSize'),
    };
    this.discGeo=new DiscGeometry(56,1); this.discBuffers=this.discGeo.data;
    this.discVAO=makeVertexArray(gl,[
      [makeBuffer(gl,this.discBuffers.vertices,gl.STATIC_DRAW),this.discLocations.aModelPosition,3],
      [makeBuffer(gl,this.discBuffers.uvs,gl.STATIC_DRAW),this.discLocations.aModelUvs,2],
    ],this.discBuffers.indices);
    this.icoGeo=new IcosahedronGeometry(); this.icoGeo.subdivide(1).spherize(this.SPHERE_RADIUS);
    this.instancePositions=this.icoGeo.vertices.map(v=>v.position);
    this.DISC_INSTANCE_COUNT=this.icoGeo.vertices.length;
    this.#initDiscInstances(this.DISC_INSTANCE_COUNT);
    this.worldMatrix=mat4.create(); this.#initTexture();
    this.control=new ArcballControl(this.canvas,dt=>this.#onControlUpdate(dt));
    this.#updateCameraMatrix(); this.#updateProjectionMatrix(gl); this.resize();
    if(onInit)onInit(this);
  }

  #initTexture(){
    const gl=this.gl;
    this.tex=setupTexture(gl,gl.LINEAR_MIPMAP_LINEAR,gl.LINEAR,gl.CLAMP_TO_EDGE,gl.CLAMP_TO_EDGE);
    const itemCount=Math.max(1,this.items.length); this.atlasSize=Math.ceil(Math.sqrt(itemCount));
    const cellSize=512; const canvas=document.createElement('canvas'); const ctx=canvas.getContext('2d');
    canvas.width=this.atlasSize*cellSize; canvas.height=this.atlasSize*cellSize;
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    this.items.forEach((item,i)=>{
      const cx=(i%this.atlasSize)*cellSize+cellSize/2;
      const cy=Math.floor(i/this.atlasSize)*cellSize+cellSize/2;
      const grad=ctx.createRadialGradient(cx,cy-30,10,cx,cy,cellSize*0.48);
      grad.addColorStop(0,'#1a1a24'); grad.addColorStop(1,'#0a0a10');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(cx,cy,cellSize*0.48,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,cellSize*0.465,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font=`bold 190px "SF Mono","Courier New",monospace`;
      ctx.textAlign='center'; ctx.textBaseline='alphabetic'; ctx.fillText(item.title,cx,cy+50);
      ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font=`58px -apple-system,"Helvetica Neue",sans-serif`;
      ctx.textBaseline='top'; ctx.fillText(item.description,cx,cy+80);
    });
    gl.bindTexture(gl.TEXTURE_2D,this.tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  #initDiscInstances(count){
    const gl=this.gl;
    this.discInstances={matricesArray:new Float32Array(count*16),matrices:[],buffer:gl.createBuffer()};
    for(let i=0;i<count;++i){const a=new Float32Array(this.discInstances.matricesArray.buffer,i*16*4,16);a.set(mat4.create());this.discInstances.matrices.push(a);}
    gl.bindVertexArray(this.discVAO); gl.bindBuffer(gl.ARRAY_BUFFER,this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.discInstances.matricesArray.byteLength,gl.DYNAMIC_DRAW);
    const bpm=16*4;
    for(let j=0;j<4;++j){const loc=this.discLocations.aInstanceMatrix+j;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,bpm,j*4*4);gl.vertexAttribDivisor(loc,1);}
    gl.bindBuffer(gl.ARRAY_BUFFER,null); gl.bindVertexArray(null);
  }

  #animate(dt){
    const gl=this.gl; this.control.update(dt,this.TARGET_FRAME_DURATION);
    const pos=this.instancePositions.map(p=>vec3.transformQuat(vec3.create(),p,this.control.orientation));
    const SI=0.6;
    pos.forEach((p,ndx)=>{
      const s=(Math.abs(p[2])/this.SPHERE_RADIUS)*SI+(1-SI); const fs=s*0.25;
      const m=mat4.create();
      mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),vec3.negate(vec3.create(),p)));
      mat4.multiply(m,m,mat4.targetTo(mat4.create(),[0,0,0],p,[0,1,0]));
      mat4.multiply(m,m,mat4.fromScaling(mat4.create(),[fs,fs,fs]));
      mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),[0,0,-this.SPHERE_RADIUS]));
      mat4.copy(this.discInstances.matrices[ndx],m);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER,this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    this.smoothRotationVelocity=this.control.rotationVelocity;
  }

  #render(){
    const gl=this.gl; gl.useProgram(this.discProgram);
    gl.enable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix,false,this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix,false,this.camera.matrices.view);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix,false,this.camera.matrices.projection);
    gl.uniform3f(this.discLocations.uCameraPosition,...this.camera.position);
    gl.uniform4f(this.discLocations.uRotationAxisVelocity,this.control.rotationAxis[0],this.control.rotationAxis[1],this.control.rotationAxis[2],this.smoothRotationVelocity*1.1);
    gl.uniform1i(this.discLocations.uItemCount,this.items.length); gl.uniform1i(this.discLocations.uAtlasSize,this.atlasSize);
    gl.uniform1f(this.discLocations.uFrames,this.#frames); gl.uniform1f(this.discLocations.uScaleFactor,this.scaleFactor);
    gl.uniform1i(this.discLocations.uTex,0); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.tex);
    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(gl.TRIANGLES,this.discBuffers.indices.length,gl.UNSIGNED_SHORT,0,this.DISC_INSTANCE_COUNT);
  }

  #updateCameraMatrix(){mat4.targetTo(this.camera.matrix,this.camera.position,[0,0,0],this.camera.up);mat4.invert(this.camera.matrices.view,this.camera.matrix);}
  #updateProjectionMatrix(gl){
    this.camera.aspect=gl.canvas.clientWidth/gl.canvas.clientHeight;
    const h=this.SPHERE_RADIUS*0.35,d=this.camera.position[2];
    this.camera.fov=this.camera.aspect>1?2*Math.atan(h/d):2*Math.atan(h/this.camera.aspect/d);
    mat4.perspective(this.camera.matrices.projection,this.camera.fov,this.camera.aspect,this.camera.near,this.camera.far);
    mat4.invert(this.camera.matrices.inversProjection,this.camera.matrices.projection);
  }
  #onControlUpdate(dt){
    const ts=dt/this.TARGET_FRAME_DURATION+0.0001; let damping=5/ts,ctz=3*this.scaleFactor;
    const isMoving=this.control.isPointerDown||Math.abs(this.smoothRotationVelocity)>0.01;
    if(isMoving!==this.movementActive){this.movementActive=isMoving;this.onMovementChange(isMoving);}
    if(!this.control.isPointerDown){
      const ni=this.#findNearestVertexIndex();
      this.onActiveItemChange(ni%Math.max(1,this.items.length));
      this.control.snapTargetDirection=vec3.normalize(vec3.create(),this.#getVertexWorldPos(ni));
    } else { ctz+=this.control.rotationVelocity*80+2.5; damping=7/ts; }
    this.camera.position[2]+=(ctz-this.camera.position[2])/damping; this.#updateCameraMatrix();
  }
  #findNearestVertexIndex(){
    const iq=quat.conjugate(quat.create(),this.control.orientation);
    const nt=vec3.transformQuat(vec3.create(),this.control.snapDirection,iq);
    let maxD=-1,idx;
    for(let i=0;i<this.instancePositions.length;++i){const d=vec3.dot(nt,this.instancePositions[i]);if(d>maxD){maxD=d;idx=i;}}
    return idx;
  }
  #getVertexWorldPos(i){return vec3.transformQuat(vec3.create(),this.instancePositions[i],this.control.orientation);}
}

// ── WebGLIntervalMenu React wrapper ─────────────────────────────
function WebGLIntervalMenu({ items, activeSet, onToggle, scale = 1.0 }) {
  const canvasRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isMoving,   setIsMoving]   = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !items.length) return;
    let sketch;
    try {
      sketch = new InfiniteGridMenu(canvas, items,
        idx => setActiveItem(items[idx % items.length]),
        setIsMoving,
        sk => sk.run(),
        scale,
      );
    } catch(e) { console.error('WebGL2 init failed:', e); }
    const onResize = () => sketch?.resize();
    window.addEventListener('resize', onResize);
    onResize();
    return () => { window.removeEventListener('resize', onResize); sketch?.destroy(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, scale]);

  const handleToggle = () => { if (activeItem) onToggle?.(activeItem); };
  const isSelected   = activeItem ? activeSet.has(activeItem.id) : false;
  const active       = !isMoving;

  return (
    // Fix 修复2：容器本身也阻止所有事件冒泡，确保不触发外层 backdrop onClose
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <canvas
        ref={canvasRef}
        style={{ cursor: 'grab', width: '100%', height: '100%', display: 'block', outline: 'none', touchAction: 'none' }}
      />

      {activeItem && (<>
        {/* face-title */}
        <h2 style={{
          userSelect:'none', position:'absolute', margin:0,
          fontWeight:900, fontSize:'2rem', color:'#fff',
          left:'1.6em', top:'50%',
          opacity: active ? 1 : 0,
          transform: 'translate(20%, -50%)',
          pointerEvents: active ? 'auto' : 'none',
          transition: active ? '0.5s ease' : '0.1s ease',
        }}>
          {activeItem.title}
        </h2>

        {/* face-description */}
        <p style={{
          userSelect:'none', position:'absolute', margin:0,
          maxWidth:'10ch', top:'50%', fontSize:'1rem',
          right:'1%', color:'rgba(255,255,255,0.72)',
          opacity: active ? 1 : 0,
          transform: active ? 'translate(-90%, -50%)' : 'translate(-60%, -50%)',
          pointerEvents: active ? 'auto' : 'none',
          transition: active ? '0.5s ease' : '0.1s ease',
        }}>
          {activeItem.description}
        </p>

        {/* action button — toggle 选中 */}
        <div
          onClick={e => { e.stopPropagation(); handleToggle(); }}
          style={{
            position:'absolute', left:'50%', zIndex:10,
            width:60, height:60, display:'grid', placeItems:'center',
            background: isSelected ? '#5227ff' : 'rgba(255,255,255,0.13)',
            border: `5px solid ${isSelected ? '#000' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:'50%', cursor:'pointer',
            opacity:      active ? 1 : 0,
            bottom:       active ? '3.8em' : '-80px',
            transform:    active ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0)',
            pointerEvents:active ? 'auto' : 'none',
            transition:   active ? '0.5s ease' : '0.1s ease',
          }}
        >
          <p style={{ userSelect:'none', margin:0, color:'#fff', fontSize: isSelected ? 22 : 26, lineHeight:1 }}>
            {isSelected ? '✓' : '↗'}
          </p>
        </div>
      </>)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 专属全屏 Overlay — 替换 L2Overlay
// Fix 修复1：面板更宽更高，不限制 WebGL 球面
// Fix 修复2：无 framer-motion drag，彻底隔离 arcball 与关闭手势
// ════════════════════════════════════════════════════════════════
function IntervalsL2Shell({ isOpen, onClose, children, isDark, onDeepDive }) {
  const backdropBg  = isDark ? 'rgba(0,0,0,0.60)' : 'rgba(0,0,0,0.40)';
  const panelBg     = isDark ? 'rgba(12,12,20,0.96)' : 'rgba(250,250,254,0.96)';
  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const titleColor  = isDark ? 'rgba(235,235,245,0.90)' : 'rgba(0,0,0,0.84)';
  const mutedColor  = isDark ? 'rgba(235,235,245,0.32)' : 'rgba(0,0,0,0.32)';
  const closeBg     = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)';
  const divider     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  return (
    <AnimatePresence>
      {isOpen && (
        // backdrop — 点击关闭
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.20 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: backdropBg,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
          }}
        >
          {/* 面板 — onClick stopPropagation，NO framer drag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{   opacity: 0, scale: 0.92,   y: 10  }}
            transition={SPRINGS_IV.layerExpand ?? { type:'spring', stiffness:360, damping:30 }}
            onClick={e => e.stopPropagation()}
            // 注意：这里故意不加 drag="y"，是修复点击退L0的核心
            style={{
              width: '100%',
              // Fix 修复1：更宽，最大 680px（比原来 400px 大 70%）
              maxWidth: 680,
              // Fix 修复1：更高，给球面更多空间
              maxHeight: '88vh',
              background: panelBg,
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: `0.5px solid ${borderColor}`,
              borderRadius: 26,
              boxShadow: isDark
                ? '0 32px 96px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.40), inset 0 0.5px 0 rgba(255,255,255,0.07)'
                : '0 16px 56px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.90)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 18px 12px',
              borderBottom:`0.5px solid ${divider}`,
              flexShrink: 0,
            }}>
              <span style={{ fontSize:14, fontWeight:600, color:titleColor, fontFamily:FONT_TEXT, letterSpacing:'-0.01em' }}>
                Intervals
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {onDeepDive && (
                  <span
                    onClick={e => { e.stopPropagation(); onDeepDive(); }}
                    style={{ fontSize:11, color:mutedColor, fontFamily:FONT_TEXT, cursor:'pointer' }}
                  >
                    深度设置 →
                  </span>
                )}
                <motion.button
                  onClick={e => { e.stopPropagation(); onClose(); }}
                  whileTap={{ scale:0.84 }}
                  style={{
                    width:26, height:26, borderRadius:13,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:closeBg,
                    border:`0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                    cursor:'pointer',
                  }}
                >
                  <svg width={9} height={9} viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke={isDark?'rgba(235,235,245,0.55)':'rgba(0,0,0,0.45)'} strokeWidth={1.4} strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content — 可滚动 */}
            <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'14px 18px 18px' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 主组件 ───────────────────────────────────────────────────────
export function IntervalsEditorL2({
  isOpen, onClose,
  intervalsPreset, selectedIntervals,
  onPresetChange, onToggleInterval,
  onOpenL3,
}) {
  const isDark = useIsDark();

  const titleC  = isDark ? 'rgba(235,235,245,0.86)' : 'rgba(0,0,0,0.80)';
  const mutedC  = isDark ? 'rgba(235,235,245,0.34)' : 'rgba(0,0,0,0.32)';
  const selBg   = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)';
  const selBord = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)';
  const defBg   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const defBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  const activeSet = selectedIntervals?.length > 0
    ? new Set(selectedIntervals)
    : new Set(ALL_INTERVALS);

  const handleToggle = useCallback((item) => {
    onToggleInterval?.(item.id);
    onPresetChange?.('custom');
  }, [onToggleInterval, onPresetChange]);

  const selectedCount = selectedIntervals?.length > 0 ? selectedIntervals.length : ALL_INTERVALS.length;

  return (
    <IntervalsL2Shell isOpen={isOpen} onClose={onClose} isDark={isDark} onDeepDive={onOpenL3}>

      {/* Preset 胶囊 */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        {INTERVAL_PRESETS.map(p => {
          const act = intervalsPreset === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => onPresetChange?.(p.id)}
              whileTap={{ scale:0.90 }}
              transition={SPRINGS_IV.capsuleSelect}
              style={{
                padding:'5px 13px', borderRadius:18, cursor:'pointer',
                background: act ? selBg : defBg,
                border:`0.5px solid ${act ? selBord : defBord}`,
              }}
            >
              <span style={{ fontSize:12, fontWeight:act?600:400, color:act?titleC:mutedC, fontFamily:FONT_TEXT }}>
                {p.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* WebGL 球面 — Fix 修复1：高度更大，充分利用宽面板 */}
      <div style={{ height: 480, position:'relative', borderRadius:12, overflow:'hidden', background:'#000' }}>
        <WebGLIntervalMenu
          items={INTERVAL_ITEMS}
          activeSet={activeSet}
          onToggle={handleToggle}
          scale={1.0}
        />
      </div>

      {/* 选中摘要 */}
      <div style={{
        marginTop:10, paddingTop:10,
        borderTop:`0.5px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`,
        fontSize:11, color:mutedC, fontFamily:FONT_TEXT, textAlign:'center',
      }}>
        {selectedIntervals?.length > 0
          ? `${selectedCount} selected · ${selectedIntervals.join(' · ')}`
          : 'All 11 intervals'}
      </div>
    </IntervalsL2Shell>
  );
}
