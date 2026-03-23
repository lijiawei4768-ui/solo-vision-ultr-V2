# Solo Vision Ultra — 最终整合版 Fretboard + Audio Core 执行合同（完整版）

> 用途：本文件用于上传到 Codex / Claude / 其他 AI Agent，作为当前阶段 **唯一工程执行母本**。  
> 基线来源：  
> 1. 当前最新 repoMix XML（已上传云端）  
> 2. `SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md`  
> 3. 当前对话中已确认的前台主线收口事实  
> 4. 当前对话中已确认的 Fretboard + Audio Core 分层、Position DNA 定义、阶段推进方式  
>
> 重要原则：**先推理，后实施。先收正架构，后写代码。先建立主干，后接回 hooks / trainers / UI。**

---

# 0. 当前项目状态与本文件定位

## 0.1 当前前台主线状态
以下前台主线已阶段性完成并通过验收，当前视为 **冻结主线**：

- `HomeView`
- `OnboardingView`
- `PersonaView`

它们不属于本文件当前实施范围。

## 0.2 当前重心已正式切换
当前项目重心已经从「HTML → React 翻译」切换到：

**Fretboard / 指板系统 + Audio / 音频系统 的核心层整理、收正与完整落地。**

## 0.3 本文件不是“最小验收版”
本文件不是一个只为第一阶段过线而写的最小计划。  
本文件覆盖的是：

- 当前阶段的工程落地合同
- 完整架构形态
- 保留为愿景但后续要继续直接实施的系统
- 从当前 repo 走到完整 Fretboard + Audio 主干的全过程

换句话说：

**这里不是“只做最小实现”，而是“明确完整架构怎么落地，只是分阶段执行”。**

---

# 1. 执行总则（给 Codex / AI Agent）

## 1.1 最高优先级基线
你必须以我已上传的 **最新 repoMix XML** 为最高优先级基线。  
不要以旧分支上下文、旧假设、旧页面、旧 trainer 状态作为主判断依据。

## 1.2 先推理，后实施
本文件要求你遵守以下执行顺序：

1. 先基于当前 repo 做真实边界审计
2. 先说明你理解的架构、系统职责、迁移关系
3. 先输出收正与实施计划
4. 经确认后才进入代码阶段

**禁止一上来直接写代码。**

## 1.3 不允许只知道名字
你不能只知道这些系统名称：
- Audio Core
- Fretboard Core
- Resolver
- Topology
- Position DNA
- Calibration
- Mapping

你必须明确：
- 每层做什么
- 不做什么
- 输入是什么
- 输出是什么
- 当前阶段做到什么程度
- 与当前 repo 现有代码怎么衔接

## 1.4 不允许删减系统
我的要求是：

- 现有系统子系统不要删减
- 当前推进以 **保留 / 整理 / 新增 / 修改 / 迁移准备** 为主
- 不允许简单粗暴“删掉旧系统重来”

## 1.5 不允许引入当前无关技巧体系
当前不要扩展：
- 滑音
- 闷音
- 推弦
- 泛化技巧训练系统
- 与当前四个训练器无直接关系的技巧识别体系

这些不是当前执行重点。

---

# 2. 当前 repo 真实边界（工程现实）

本文件只服务于当前 repo 中已经真实存在的产品与底层系统。

## 2.1 当前真实产品模块
- `NotesTrainer`
- `IntervalsTrainer`
- `ScalesTrainer`
- `ChangesTrainer`
- `TunerView`
- `PreFlightView`

## 2.2 当前真实 runtime / hook 层
- `useAudioEngine`
- `useTuner`
- `useCalibration`
- 以及部分 trainer 使用的其他 runtime hooks

## 2.3 当前真实旧 engine 层
- `AudioCore.js`
- `YinDetector.js`
- `AcfDetector.js`
- `NoiseFloor.js`
- `FretboardModel.js`
- `GuitarModeEngine.js`
- `TwoPointSystem.js`

## 2.4 当前候选新 core 层
- `src/core/fretboard/*`

## 2.5 当前项目真正要做的事
不是再空想一套系统，而是：

**把旧 engine 层与新 core 层收正成未来正式主干，并为 trainers / tuner / calibration 提供可信底座。**

---

# 3. 完整目标：如果真正实施下来，最终架构是什么

最终会形成一个：

# **5 层主架构 + 2 条冻结旁线 + 1 条后续回接线**

---

## 3.1 五层主架构

### Layer 1 — Product Layer
承载用户可见训练与反馈体验。

包含：
- NotesTrainer
- IntervalsTrainer
- ScalesTrainer
- ChangesTrainer
- TunerView
- PreFlightView

职责：
- 承载交互与反馈
- 显示结果
- 不负责核心识别、核心推理、核心空间解释

---

### Layer 2 — Runtime / Hook Layer
运行时编排与桥接层。

包含：
- useAudioEngine
- useTuner
- useCalibration
- 后续 trainer bridge hooks

职责：
- 生命周期管理
- 订阅管理
- 把 Audio Core / Fretboard Core 输出桥接给产品层
- 不应再承担核心检测、核心推理和核心空间解释

---

### Layer 3 — Audio Core
回答：

**“听到了什么，以及这个结果有多可信？”**

下面包含 6 个正式子系统：

1. Audio Session Manager
2. Pitch Detection Layer
3. Signal State Layer
4. Pitch Stabilizer
5. Calibration / Device Profile Bridge
6. Audio Candidate Export Layer

---

### Layer 4 — Fretboard Core
回答：

**“这个音在吉他空间里意味着什么？”**

下面包含 6 个正式子系统：

1. Topology
2. Graph
3. Interval Geometry
4. Harmonic Targets
5. Resolver
6. Analysis Bridge

---

### Layer 5 — Position DNA / Position Likelihood Layer
回答：

**“在同音异位条件下，更可能是哪根弦、哪个候选位置？”**

下面包含 5 个证据子系统：

1. Pitch Fit
2. Range Fit
3. Continuity Fit
4. Context Fit
5. Timbre / Envelope Hint Fit

---

## 3.2 两条冻结旁线

### 冻结旁线 A：前台主线
- HomeView
- OnboardingView
- PersonaView

当前冻结，不属于本轮实施范围。

### 冻结旁线 B：trainer UI / theme / App 主流程
- trainer 页面 UI
- 顶栏
- settings / tab / app routing
- theme system

当前冻结，不属于本轮实施范围。

---

## 3.3 一条后续回接线
当核心层稳定之后，再进行：

- hooks 回接
- trainers 回接
- calibration / tuner 统一消费
- product 层逐步复用核心能力

这条线是**后续阶段**，不是当前阶段。

---

# 4. 架构树状图 / 分层图（可直接给 Codex 看）

## 4.1 总分层图

```text
Solo Vision Ultra
├── A. Frozen Frontend Mainline
│   ├── HomeView
│   ├── OnboardingView
│   └── PersonaView
│
├── B. Product Layer
│   ├── NotesTrainer
│   ├── IntervalsTrainer
│   ├── ScalesTrainer
│   ├── ChangesTrainer
│   ├── TunerView
│   └── PreFlightView
│
├── C. Runtime / Hook Layer
│   ├── useAudioEngine
│   ├── useTuner
│   ├── useCalibration
│   └── future bridge hooks
│
├── D. Audio Core
│   ├── D1. Audio Session Manager
│   ├── D2. Pitch Detection Layer
│   ├── D3. Signal State Layer
│   ├── D4. Pitch Stabilizer
│   ├── D5. Calibration / Device Profile Bridge
│   └── D6. Audio Candidate Export Layer
│
├── E. Fretboard Core
│   ├── E1. Topology
│   ├── E2. Graph
│   ├── E3. Interval Geometry
│   ├── E4. Harmonic Targets
│   ├── E5. Resolver
│   └── E6. Analysis Bridge
│
├── F. Position DNA / Position Likelihood
│   ├── F1. Pitch Fit
│   ├── F2. Range Fit
│   ├── F3. Continuity Fit
│   ├── F4. Context Fit
│   └── F5. Timbre / Envelope Hint Fit
│
└── G. Later Reintegration Line
    ├── hook reintegration
    ├── trainer reintegration
    ├── tuner/calibration unified consumption
    └── product-layer progressive adoption
```

---

## 4.2 数据流分层图

```text
Mic / Device Input
    ↓
Audio Session Manager
    ↓
Pitch Detection Layer
    ↓
Signal State Layer
    ↓
Pitch Stabilizer
    ↓
Calibration / Device Profile Bridge
    ↓
Audio Candidate Export Layer
    ↓
Position DNA / Position Likelihood
    ↓
Fretboard Core Resolver
    ↓
Semantic / Training Meaning
    ↓
Runtime / Hook Bridge
    ↓
Trainer / Tuner / PreFlight / Product Layer
```

---

## 4.3 Fretboard Core 内部图

```text
fretboard.json / tuning / fret range
    ↓
Topology
    ↓
Graph
    ├── same-string adjacency
    ├── cross-string neighborhood
    ├── enharmonic / same-note-position sets
    └── functional edges
    ↓
Interval Geometry
    ↓
Harmonic Targets
    ↓
Resolver
    ↓
Analysis Bridge
```

---

## 4.4 Position DNA 图

```text
Audio Candidate
├── freq / midi / note
├── confidence / stability
├── rms / onset / envelope
├── calibration profile
├── tuning / active strings / fret range
├── current trainer context
└── previous locked position

            ↓

Position DNA / Position Likelihood
├── Pitch Fit
├── Range Fit
├── Continuity Fit
├── Context Fit
└── Timbre / Envelope Hint Fit

            ↓

Candidate Position Ranking
├── bestCandidate
├── confidenceBand
├── needsMoreFrames
└── evidence breakdown
```

---

# 5. 总共有多少个系统和子系统

## 5.1 主系统层
共 **5 个主系统层**：

1. Product Layer
2. Runtime / Hook Layer
3. Audio Core
4. Fretboard Core
5. Position DNA / Position Likelihood Layer

## 5.2 明确展开的子系统/模块单元
### Product Layer
6 个：
- NotesTrainer
- IntervalsTrainer
- ScalesTrainer
- ChangesTrainer
- TunerView
- PreFlightView

### Runtime / Hook Layer
3 个：
- useAudioEngine
- useTuner
- useCalibration

### Audio Core
6 个

### Fretboard Core
6 个

### Position DNA
5 个

## 5.3 合计
按当前执行合同明确展开的系统单元来数：

- Product Layer：6
- Runtime / Hook Layer：3
- Audio Core：6
- Fretboard Core：6
- Position DNA：5

**合计 26 个明确子系统/模块单元。**

> 如果把未来 bridge hooks、test harness、analysis validators、device profile registry、trainer reintegration adapters 也拆开，最终完整工程形态会超过 30 个模块单元。  
> 但当前合同清晰定义的核心单元是 **5 个主系统层 + 26 个明确子系统/模块单元**。

---

# 6. MD 里的系统都保留了吗？有没有删？

结论：

**真正重要的系统主干基本都保留了，没有粗暴删除。**

但被重新分成了三类：

---

## 6.1 第一类：保留并进入当前主架构的
这些都进入了正式架构，而且是当前或后续重点：

- Audio Session
- Pitch Detection
- Noise Floor
- Stabilizer
- Calibration / Device Profile
- Audio Mapping
- Fretboard Topology
- Graph
- Resolver
- Interval Geometry
- Harmonic Target
- Analysis Bridge
- Tuner
- Calibration
- Trainers 服务链

---

## 6.2 第二类：保留为愿景，但不再停留在“只写愿景”
这些不是删掉，而是：

**保留为完整实施目标，但分阶段落地，不在当前阶段一次性硬塞进去。**

包括：
- 更成熟的 Guitar Semantics
- 更完整的 Fretboard Twin
- 更深的 path solving / path inference
- 更成熟的全局分析层
- 更高级的位置推理
- 更成熟的 timbre fingerprint / overtone modeling
- 更强的 trainer semantic integration

重要的是：  
**这些不是移出项目，而是移出“当前直接编码范围”，进入完整实施路线的后续阶段。**

---

## 6.3 第三类：当前明确不作为重点的
这些是你明确不需要现在展开的：

- 滑音
- 闷音
- 推弦
- 泛化技巧识别体系
- 与当前四个训练器无直接关系的技巧层扩展

这些不是主干，不应该抢当前架构实现资源。

---

# 7. 核心优化：不是删系统，而是重构执行方式

这个合同版最大的优化，不是加更多名字，而是：

## 7.1 从“名字堆砌”变成“分层架构”
以前是：
- AudioCore
- Fretboard Twin
- DNA
- Calibration
- Resolver
- Mapping
- Tuner

一堆并列名字。  
现在变成：
- Product
- Runtime / Hook
- Audio Core
- Fretboard Core
- Position DNA

先有层级，再有子系统。

---

## 7.2 hook 不再做主逻辑仓库
过去容易变成：
- useTuner 里堆系统逻辑
- useCalibration 里堆系统逻辑
- trainer 里也有自己的判断逻辑

现在优化成：
- hook 只做编排
- 真实逻辑进入核心层

---

## 7.3 旧 engine 与新 core 不再硬冲突
过去容易陷入：
- 全删旧 engine
- 或整包吞新 core

现在改为：
- 旧 engine = 第一代可运行资产
- 新 core = 未来正式主干候选
- 当前阶段先做收正与迁移准备

---

## 7.4 把同音异位问题正式变成系统层
你提出的“DNA 系统”不再只是模糊概念，  
而是被正式定义为：

**Position DNA / Position Likelihood Layer**

并且明确：
- 输入
- 输出
- 第一阶段能力边界
- 后续完整扩展方向

---

## 7.5 把“不做什么”写进合同
这会极大减少 AI 跑偏：

当前不做：
- trainer UI 重写
- 前台主线重写
- 主题系统大改
- 滑音 / 闷音 / 推弦扩展
- 第二产品线
- 大型后端系统

---

# 8. 五层主架构的完整职责合同

---

## 8.1 Product Layer（冻结但未来仍服务）
### 包含
- NotesTrainer
- IntervalsTrainer
- ScalesTrainer
- ChangesTrainer
- TunerView
- PreFlightView

### 负责
- 产品体验
- UI反馈
- 用户交互

### 不负责
- pitch detection
- fretboard topology
- candidate ranking
- semantic resolution

### 当前状态
- 冻结
- 不主动修改
- 未来通过更干净的 bridge 回接核心层

---

## 8.2 Runtime / Hook Layer（编排层）
### 包含
- useAudioEngine
- useTuner
- useCalibration
- future bridge hooks

### 负责
- session 生命周期
- 订阅
- UI-facing state
- 桥接核心层输出

### 不负责
- 空间推理
- 核心检测
- 同音异位判断主逻辑
- resolver 主逻辑

### 当前状态
- 先冻结，不大改
- 未来目标是越来越薄

---

## 8.3 Audio Core（正式主干）
### 目标
回答：

**“听到了什么，以及这个结果有多可信？”**

### 6 个正式子系统
1. Audio Session Manager  
2. Pitch Detection Layer  
3. Signal State Layer  
4. Pitch Stabilizer  
5. Calibration / Device Profile Bridge  
6. Audio Candidate Export Layer  

### 输出合同
```ts
type AudioFrameResult = {
  freq: number | null,
  midi: number | null,
  noteName: string | null,
  cents: number | null,
  rms: number,
  confidence: number,
  stable: boolean,
  onsetState: "silence" | "attack" | "sustain" | "release" | "noise",
  calibrationApplied: boolean,
  profileId?: string | null,
  rawCandidates?: Array<{
    freq: number,
    confidence: number
  }>
}
```

---

## 8.4 Fretboard Core（正式主干）
### 目标
回答：

**“这个音在吉他空间里意味着什么？”**

### 6 个正式子系统
1. Topology  
2. Graph  
3. Interval Geometry  
4. Harmonic Targets  
5. Resolver  
6. Analysis Bridge  

### 输出合同
```ts
type FretboardResolutionResult = {
  pitchClassMatch: boolean,
  noteMatch: boolean,
  candidatePositions: Array<{
    stringIndex: number,
    fret: number,
    midi: number,
    noteName: string,
    score: number,
    reasons: string[]
  }>,
  bestCandidate: null | {
    stringIndex: number,
    fret: number,
    score: number
  },
  semanticResult: {
    targetType: "note" | "interval" | "scale" | "chordTone" | "unknown",
    matched: boolean,
    detail?: string
  },
  certainty: "low" | "medium" | "high",
  unresolvedReason?: string | null
}
```

---

## 8.5 Position DNA / Position Likelihood（正式新增层）
### 目标
回答：

**“在同音异位条件下，更可能来自哪根弦、哪个候选位置？”**

### 它不是什么
- 不是空想概念
- 不是当前阶段就承诺 100% 准确识别几弦几品
- 不是脱离 Audio Core / Fretboard Core 独立存在的神秘模块

### 它是什么
它是：

**Audio Candidate → Candidate Position Ranking**  
之间的 ranking / likelihood layer。

### 5 个证据子系统
1. Pitch Fit  
2. Range Fit  
3. Continuity Fit  
4. Context Fit  
5. Timbre / Envelope Hint Fit  

### 输出合同
```ts
type PositionLikelihoodResult = {
  candidates: Array<{
    stringIndex: number,
    fret: number,
    likelihood: number,
    evidence: {
      pitchFit: number,
      continuityFit: number,
      rangeFit: number,
      timbreHintFit?: number,
      contextFit?: number
    }
  }>,
  bestCandidate: null | {
    stringIndex: number,
    fret: number,
    likelihood: number
  },
  confidenceBand: "weak" | "moderate" | "strong",
  needsMoreFrames: boolean
}
```

### 当前阶段的正确表述
**Position DNA = 候选位置排序系统。**  
允许消费音色/包络/泛音相关 hint，但当前阶段先以概率排序和证据聚合为主。

---

# 9. 旧 engine 与新 core 的关系合同

## 9.1 不删旧 engine
旧 engine 不是垃圾。  
它是：
- 第一代可运行资产
- 已验证现实输入/检测/训练逻辑来源
- 可迁移资产

## 9.2 新 core 也不是自动真理
`src/core/fretboard/*` 是未来正式主干候选，  
但不能因为新就直接整包替换旧 engine。

## 9.3 正确关系
- 旧 engine = 第一代资产
- 新 core = 未来正式主干候选
- 当前阶段任务 = 收正、分层、迁移准备，不是二选一

## 9.4 当前处理原则
对现有系统做：
- KEEP
- FREEZE
- MODIFY
- ADD
- MIGRATE LATER

而不是：
- DELETE EVERYTHING
- REBUILD EVERYTHING

---

# 10. 不是“只做第一阶段”——完整实施路线（愿景直接落地方式）

你要求的不是最小验收版，而是：

**完整阶段，到底怎么把第二类“愿景保留项”也真正落地。**

下面给出完整实施路线。

---

## Phase 0 — 当前基线冻结与系统收正
目标：
- 冻结前台主线
- 冻结 trainer UI / theme / App 主流程
- 以当前 repo 为基线做完整系统审计
- 明确旧 engine / 新 core 的职责对照

输出：
- 边界报告
- 系统职责表
- KEEP / FREEZE / MODIFY / ADD / MIGRATE LATER

---

## Phase 1 — Audio Core 正式成形
目标：
- 把 Audio Session / Detection / Stabilizer / Calibration Consumption 收成正式主干
- 从 hooks 中抽离不该留在那里的核心逻辑
- 统一输出候选音频结果

重点：
- Session Manager
- Detector Fusion
- Signal State
- Stabilizer
- Calibration Bridge
- Candidate Export

输出：
- AudioFrameResult 合同稳定
- 未校准可用，校准增强
- 为后续 DNA / resolver 提供统一输入

---

## Phase 2 — Fretboard Core 正式成形
目标：
- Topology / Graph / Interval Geometry / Harmonic Targets / Resolver / Analysis Bridge 全部稳定成主干

重点：
- 把旧 `FretboardModel / GuitarModeEngine / TwoPointSystem` 的价值映射到新核心层
- 建立 graph-based 指板空间
- 建立正式 resolver 合同

输出：
- FretboardResolutionResult 稳定
- trainers 未来统一使用同一底层空间解释系统

---

## Phase 3 — Position DNA 第一阶段落地
目标：
- 同音异位候选排序开始真正可用
- 不再只停留在 pitch correct
- 开始做到 position likely correct

重点：
- pitch fit
- range fit
- continuity fit
- context fit
- calibration-aware bias

输出：
- PositionLikelihoodResult 稳定
- bestCandidate + confidenceBand + needsMoreFrames 可用
- 不承诺 100% string/fret 绝对判定

---

## Phase 4 — Position DNA 第二阶段扩展（愿景开始落地）
这是你说的“不要只停在第一阶段”的部分。

目标：
- 把 timbre / envelope / overtone / resonance 差异，逐步从 hint 提升为更强的 ranking evidence

重点：
- string-dependent timbre hint modeling
- envelope signature analysis
- device-profile-aware evidence normalization
- candidate evidence fusion

说明：
- 当前阶段不是直接宣称“已完成每根弦 DNA 指纹模型”
- 而是逐步把它从 hint 变成正式 evidence

输出：
- timbreHintFit 不再只是预留字段
- Position DNA 从“基础排序系统”升级为“多证据位置判断系统”

---

## Phase 5 — Fretboard Twin / Higher Semantics 落地
这是完整愿景的一部分，不删除，只后移实施。

目标：
- 从位置层进一步走向语义层
- 不只是哪个音、哪个位置，而是这个位置在训练、路径、功能上的意义

重点：
- position cluster semantics
- functional region understanding
- path continuity reasoning
- training semantic interpretation
- global weak-spot structuring

输出：
- 更完整的 Fretboard Twin
- 更成熟的训练语义输出
- analysisBridge 升级为更正式的 analysis layer

---

## Phase 6 — trainers / tuner / calibration 回接
目标：
- 在核心主干稳定后，分批回接产品层

顺序建议：
1. Tuner / Calibration 先回接 Audio Core
2. NotesTrainer 先接 resolver + position ranking
3. IntervalsTrainer 再接 interval geometry + semantic target
4. ChangesTrainer 接 chord tone / harmonic targets
5. ScalesTrainer 最后接 scale membership / path semantics

输出：
- trainers 不再各自维护一套判断逻辑
- 全部复用统一核心层

---

## Phase 7 — 完整分析层与更高阶产品能力
这是更完整愿景的后续正式落地阶段，不删减，只后移。

包括但不限于：
- stronger analysis layer
- learning weakness modeling
- long-term progress semantics
- deeper trainer semantic feedback
- more advanced region/path intelligence

注意：
这阶段依然不等于“学校/排名/成就/后端全家桶”。  
那些是更外层产品，不属于 Fretboard + Audio Core 主干本身。

---

# 11. 当前阶段禁止项（再次强调）

以下内容当前明确禁止：

## 11.1 禁止碰前台冻结主线
- HomeView
- OnboardingView
- PersonaView

## 11.2 禁止碰 trainer UI
- 页面结构
- 顶栏
- 交互外观
- 前台体验细节

## 11.3 禁止大改 App 主流程
- App.jsx
- 路由
- overlay 主路径

## 11.4 禁止大改主题系统
当前阶段不是 theme 收正阶段。

## 11.5 禁止引入无关技巧体系
- 滑音
- 闷音
- 推弦
- 泛化技巧识别

## 11.6 禁止虚假完成叙述
不要出现：
- “已支持完整几弦几品绝对识别”但实际没有
- “Scales 已完整接入”但实际没接
- “已完成全局分析层”但实际只是 coarse summary

---

# 12. 给 Codex 的实际工作方式（必须遵守）

## 12.1 第一轮只允许做什么
你必须先输出：

# 《基于当前 repo 的 Fretboard + Audio Core 系统收正与完整实施计划》

内容必须包含：
1. 当前 repo 真实边界审计  
2. 当前系统职责表  
3. 旧 engine vs 新 core 对照关系  
4. KEEP / FREEZE / MODIFY / ADD / MIGRATE LATER 分类  
5. 完整实施路线在当前 repo 的具体落位  
6. Position DNA 的输入/输出/阶段边界  
7. 当前阶段的首轮代码实施计划  

**先不要写代码。**

---

## 12.2 第二轮才进入代码
只有在我确认了计划后，你才进入代码阶段。

代码阶段顺序必须是：

1. 先 core-only
2. 再验证
3. 再考虑回接计划
4. 不要直接碰 hooks/trainers/views

---

## 12.3 你必须自己先推理
你不能机械照抄系统名。  
你必须先推理并回答：

- 当前 repo 里每层真实职责是什么
- 当前最该推进的是哪个层
- 哪些东西应该保留，哪些应该后移
- 哪些是第一阶段，哪些是完整愿景后续阶段
- Position DNA 现在到底能做到什么，不能做到什么

---

# 13. 一句话总括（给 Agent 的口径）

## 13.1 当前阶段一句话
**当前阶段只做基于当前 repo 的 Fretboard Core + Audio Core 收正与正式主干建立，不碰前台主线，不碰 trainer UI，不引入无关技巧识别。**

## 13.2 Position DNA 一句话
**Position DNA / Position Likelihood 是同音异位下的位置候选排序系统，当前阶段先做概率排序和证据聚合，后续再逐步把 timbre / overtone / envelope evidence 正式做强。**

## 13.3 完整实施路线一句话
**这不是最小实现路线，而是从当前 repo 出发，把 Audio Core、Fretboard Core、Position DNA、Fretboard Twin 与更高层语义能力逐步完整落地的正式路线。**

---

# 14. 你接下来现在要做什么（给 Codex 的直接任务）

请先做以下事情，不要写代码：

1. 基于我上传的最新 repoMix XML，按本文件重新审计当前 repo  
2. 输出你理解的完整架构分层  
3. 输出当前 repo 中每层的真实文件归属  
4. 输出旧 engine vs 新 core 的职责映射  
5. 输出 KEEP / FREEZE / MODIFY / ADD / MIGRATE LATER  
6. 输出完整实施路线中，当前 repo 最适合先落地的那一段  
7. 输出当前阶段首轮实施计划（只到 core-only，不碰前台冻结层）

**等我确认后，你再进入代码阶段。**
