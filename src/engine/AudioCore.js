// ─────────────────────────────────────────────────────────────
// src/engine/AudioCore.js
//
// v1.2 HTTPS-guard fix:
//   navigator.mediaDevices is undefined on HTTP (non-localhost) origins.
//   访问 IP 地址（如 192.168.x.x:3000）时 mediaDevices 为 undefined。
//   Fix: check → legacy API fallback → friendly error with instructions.
//
// v1.1 mobile fix:
//   getUserMedia now tries ideal constraints first, then falls back to
//   { audio: true } if the browser rejects them.
// ─────────────────────────────────────────────────────────────

const AUDIO_CONSTRAINTS_IDEAL = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl:  false,
    channelCount:     1,
  },
  video: false,
};

const AUDIO_CONSTRAINTS_FALLBACK = { audio: true, video: false };

// ── HTTPS Guard ───────────────────────────────────────────────
// navigator.mediaDevices is only available on secure origins (https://)
// or localhost. Accessing via an IP address (e.g. 172.20.10.8:3000) on
// HTTP will leave mediaDevices undefined → TypeError at getUserMedia.
//
// 在非安全域（HTTP + IP地址）下 navigator.mediaDevices 为 undefined。
// This helper normalises access so we get a clear error message.
function getGetUserMedia() {
  // Modern API — only available on HTTPS or localhost
  if (navigator.mediaDevices?.getUserMedia) {
    return (constraints) => navigator.mediaDevices.getUserMedia(constraints);
  }
  // Legacy prefixed API (older Chrome/Firefox, some Android WebViews)
  // 旧版浏览器前缀 API
  const legacy =
    navigator.getUserMedia         ||
    navigator.webkitGetUserMedia   ||
    navigator.mozGetUserMedia      ||
    navigator.msGetUserMedia;

  if (legacy) {
    return (constraints) =>
      new Promise((resolve, reject) => legacy.call(navigator, constraints, resolve, reject));
  }

  // No API available — likely HTTP + IP address
  // 没有找到任何 getUserMedia 实现，通常是通过 IP 地址的 HTTP 访问导致
  return null;
}

class AudioCoreManager {
  constructor() {
    this._ctx          = null;
    this._analyser     = null;
    this._eqLow        = null;
    this._eqMid        = null;
    this._source       = null;
    this._stream       = null;
    this._refCount     = 0;
    this._startPromise = null;
  }

  get analyser()   { return this._analyser; }
  get sampleRate() { return this._ctx?.sampleRate ?? 44100; }
  get isRunning()  { return this._source !== null; }

  async start({ fftSize = 2048 } = {}) {
    this._refCount++;
    if (this._source) {
      if (this._analyser) this._analyser.fftSize = fftSize;
      return;
    }
    if (this._startPromise) { await this._startPromise; return; }
    this._startPromise = this._init(fftSize);
    try { await this._startPromise; }
    finally { this._startPromise = null; }
  }

  stop() {
    this._refCount = Math.max(0, this._refCount - 1);
    if (this._refCount > 0) return;
    this._teardown();
  }

  destroy() {
    this._refCount = 0;
    this._teardown();
    this._ctx?.suspend();
  }

  async _init(fftSize) {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') await this._ctx.resume();

    // ── getUserMedia with HTTPS guard ─────────────────────────
    const getUserMedia = getGetUserMedia();

    if (!getUserMedia) {
      // Provide a clear, actionable error message.
      // 给出清晰可操作的错误提示
      const isHttp     = window.location.protocol === 'http:';
      const isIp       = /^\d{1,3}(\.\d{1,3}){3}$/.test(window.location.hostname);
      const suggestion = isHttp && isIp
        ? `You are accessing the app via HTTP on an IP address (${window.location.hostname}). ` +
          `Browsers block microphone access on non-secure origins. ` +
          `Please use one of:\n` +
          `  • http://localhost:${window.location.port} (same machine)\n` +
          `  • HTTPS with a valid certificate\n` +
          `  • ngrok / Expo tunnel for remote testing\n\n` +
          `你正在通过 IP 地址的 HTTP 访问应用。浏览器在非安全域名下禁止麦克风访问。` +
          `请改用 localhost 或 HTTPS 访问。`
        : 'Microphone API (getUserMedia) is not available in this browser. ' +
          'Please use a modern browser (Chrome, Firefox, Safari) on HTTPS or localhost.\n\n' +
          '当前浏览器不支持麦克风 API，请使用现代浏览器并通过 HTTPS 或 localhost 访问。';

      const err = new Error(suggestion);
      err.name = 'MicrophoneUnavailableError';
      throw err;
    }

    // Try ideal constraints; fall back to plain { audio: true } on mobile
    let stream;
    try {
      stream = await getUserMedia(AUDIO_CONSTRAINTS_IDEAL);
    } catch (err) {
      if (err.name === 'OverconstrainedError' ||
          err.name === 'NotSupportedError'    ||
          err.name === 'TypeError') {
        console.warn('AudioCore: constraints rejected, using fallback.', err.message);
        stream = await getUserMedia(AUDIO_CONSTRAINTS_FALLBACK);
      } else {
        throw err; // NotAllowedError — permission denied, let caller handle
      }
    }

    this._stream = stream;
    this._source = this._ctx.createMediaStreamSource(stream);

    this._eqLow              = this._ctx.createBiquadFilter();
    this._eqLow.type         = 'lowshelf';
    this._eqLow.frequency.value = 100;
    this._eqLow.gain.value   = 3;

    this._eqMid              = this._ctx.createBiquadFilter();
    this._eqMid.type         = 'peaking';
    this._eqMid.frequency.value = 220;
    this._eqMid.Q.value      = 1.4;
    this._eqMid.gain.value   = -1;

    this._analyser                        = this._ctx.createAnalyser();
    this._analyser.fftSize                = fftSize;
    this._analyser.smoothingTimeConstant  = 0;

    this._source.connect(this._eqLow);
    this._eqLow.connect(this._eqMid);
    this._eqMid.connect(this._analyser);
  }

  _teardown() {
    this._source?.disconnect();  this._source  = null;
    this._eqLow?.disconnect();   this._eqLow   = null;
    this._eqMid?.disconnect();   this._eqMid   = null;
    this._stream?.getTracks().forEach(t => t.stop());
    this._stream = null;
    this._analyser = null;
  }
}

export const audioCore = new AudioCoreManager();
