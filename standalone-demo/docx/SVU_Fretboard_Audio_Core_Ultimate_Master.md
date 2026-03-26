# Solo Vision Ultra  
# Fretboard + Audio Core 终极总母本（最终整合可执行版）

> 用途：本文件是当前阶段上传到 Codex / Claude / 其他 AI Agent 的**唯一高优先级工程母本**。  
> 它不是最小验收版，也不是只覆盖第一阶段。  
> 它覆盖：
> 1. 当前 repo 现实边界  
> 2. 完整系统愿景  
> 3. 最终主架构  
> 4. 分阶段完整落地路线  
> 5. 当前阶段禁止项  
> 6. 给 Codex 的工作方式  
> 7. Codex 做完后，如何拿最新 repoMix 做桥接、嵌入、验收与继续推进  
>
> 基线来源：
> - 当前最新 repoMix XML（用户已上传到云端）
> - `SVU_Fretboard_Audio_Core_Execution_Contract_Final.md`
> - `SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md`
> - 当前对话已确认的项目时间线、前台主线收口事实、Codex 云端支线状态与执行边界

---

# 0. 这份文档是什么，不是什么

## 0.1 这份文档是什么
这是一份：

**真正解释一切、说明一切、并且能直接指导 Codex / AI Agent 推理与实施的终极总母本。**

它的作用是统一以下几件事：

- 当前 repo 现实代码边界
- Fretboard + Audio Core 的完整目标
- 未来最终架构到底长什么样
- 当前阶段先做什么、后做什么
- 哪些系统现在不直接编码，但不是删除，而是后续完整实施目标
- Codex 应该怎么基于当前 repo 去做，而不是只知道系统名字
- Codex 做完后，如何与你最新 repoMix 做对齐、桥接和嵌入

## 0.2 这份文档不是什么
它不是：
- 只为了过第一阶段的最小实现清单
- 只为了“先过线再说”的最小收口版
- 只是一份愿景 PPT
- 只是一份审计报告
- 只是一份文件名和模块名堆砌的说明书

## 0.3 本文件的执行原则
始终遵守：

1. **先推理，后实施**
2. **先收正架构，后写代码**
3. **先建立主干，后接回 hooks / trainers / UI**
4. **不删系统，只允许保留 / 整理 / 新增 / 修改 / 迁移准备**
5. **不引入当前无关技巧扩展**
6. **不让 Codex 只知道系统名字，而必须知道每层具体怎么做**

---

# 1. 当前项目真实状态

## 1.1 当前前台主线状态
以下前台主线已经阶段性完成并通过验收，当前视为**冻结主线**：

- `HomeView`
- `OnboardingView`
- `PersonaView`

这三者当前**不属于本文件实施范围**，也不是当前架构工作的修改对象。

## 1.2 当前项目重心已正式切换
项目当前重心已经从：

**HTML → React 翻译**

切换为：

**Fretboard / 指板系统 + Audio / 音频系统 的核心层整理、收正、主干建立与完整落地。**

## 1.3 当前真实产品边界
当前这套系统首先只服务你已经存在并确认的产品模块：

- `NotesTrainer`
- `IntervalsTrainer`
- `ScalesTrainer`
- `ChangesTrainer`
- `TunerView`
- `PreFlightView`

也就是说：

这套系统不是先为“整个吉他世界”设计，  
而是先服务你当前 App 的训练闭环与可信判定。

## 1.4 当前 repo 中真实存在的技术层
当前 repo 里已经真实存在四层资产：

### A. Product Layer
- trainers
- TunerView
- PreFlightView

### B. Runtime / Hook Layer
- `useAudioEngine`
- `useTuner`
- `useCalibration`
- 以及部分 runtime hooks

### C. 旧 engine 层（第一代资产）
- `AudioCore.js`
- `YinDetector.js`
- `AcfDetector.js`
- `NoiseFloor.js`
- `FretboardModel.js`
- `GuitarModeEngine.js`
- `TwoPointSystem.js`

### D. 候选新 core 层
- `src/core/fretboard/*`

当前真正要做的，不是空想新系统，而是：

**把旧 engine 层与新 core 层收正成未来正式主干。**

---

# 2. 总目标：这套系统最终要做什么

本系统要做的，不是：

- 一个“显示指板的 UI”
- 一个“只能识别音高的调音器”
- 一个“每个 trainer 自己维护一套逻辑的杂乱系统”

而是：

**把吉他的指板空间、音高系统、训练目标、用户实际演奏、实时音频输入、设备差异、校准结果和学习分析统一到一套真正可持续的中台里。**

最终目标不是“检测出一个频率”，而是：

- 理解用户大概率弹了什么音
- 理解用户大概率弹在什么位置
- 理解这个音在当前训练中意味着什么
- 理解这个音为什么算对 / 算错 / 还不能判
- 理解用户在什么区域、什么功能、什么迁移模式上最弱
- 把这些结果反向服务给训练器、Tuner、Calibration、Home、Persona、推荐和后续产品线

---

# 3. 第一原则

## 3.1 指板不是 UI，而是认知底层
Fretboard 不是一个显示组件，而是一套空间模型。

## 3.2 音频不是单独工具，而是训练入口
Audio Core 不是调音器附属，而是整个产品可信性的根基。

## 3.3 Trainers 不能各自维护一套判断逻辑
Notes / Intervals / Scales / Changes 不能各自有一套“答案判定方式”。  
它们必须统一到：
- 同一套 topology
- 同一套 graph
- 同一套 resolver
- 同一套 audio interpretation

## 3.4 同一个音 ≠ 同一个位置 ≠ 同一个功能
必须严格区分：
- Pitch correct
- Position likely correct
- Functional target correct
- Training semantic correct

## 3.5 校准是增强层，不是唯一救命层
系统必须做到：
- 未校准也可用
- 校准后更稳、更准、更个性化

## 3.6 不能再把系统逻辑堆进 hook
未来 hooks 只能做：
- orchestration
- lifecycle
- subscription
- UI-facing bridge

不能继续承担：
- pitch 语义解释
- fretboard 空间推理
- 同音异位候选排序主逻辑
- 核心训练判定

---

# 4. 如果真正实施下来，最终架构是什么

最终架构会是：

# **5 层主架构 + 2 条冻结旁线 + 1 条后续回接线**

---

## 4.1 五层主架构

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
- 产品交互
- UI反馈
- 用户动作承载

不负责：
- 核心音频检测
- 核心空间推理
- 候选位置排序
- 训练语义解释主逻辑

---

### Layer 2 — Runtime / Hook Layer
运行时编排与桥接层。

包含：
- `useAudioEngine`
- `useTuner`
- `useCalibration`
- future bridge hooks

职责：
- session 生命周期
- 订阅与桥接
- UI-facing state
- 把 Audio Core / Fretboard Core 结果送给产品层

不负责：
- 核心检测逻辑
- resolver 主逻辑
- graph/interval/harmonic 核心定义
- DNA 排序主逻辑

---

### Layer 3 — Audio Core
回答：

**“听到了什么，以及这个结果有多可信？”**

包含 6 个正式子系统：

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

包含 6 个正式子系统：

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

包含 5 个证据子系统：

1. Pitch Fit
2. Range Fit
3. Continuity Fit
4. Context Fit
5. Timbre / Envelope Hint Fit

---

## 4.2 两条冻结旁线

### 冻结旁线 A：前台主线
- HomeView
- OnboardingView
- PersonaView

### 冻结旁线 B：trainer UI / theme / App 主流程
- trainer 页面结构
- trainer 顶栏
- App routing / overlay 主路径
- theme system

当前都冻结，不属于本轮实施范围。

---

## 4.3 一条后续回接线
在核心层稳定之后，再进行：

- hooks 回接
- trainers 回接
- tuner / calibration 统一消费
- product layer progressive adoption

这条线是**后续阶段**，不是当前阶段。

---

# 5. 非常清楚的树状图 / 分层图

## 5.1 总分层树状图

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

## 5.2 数据流分层图

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

## 5.3 Fretboard Core 内部图

```text
fretboard.json / tuning / fret range
    ↓
Topology
    ↓
Graph
    ├── same-string adjacency
    ├── cross-string neighborhood
    ├── same-note alt-position sets
    ├── interval edges
    ├── scale edges
    ├── chord edges
    └── position-shift edges
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

## 5.4 Position DNA 图

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

# 6. 到底有多少个系统和子系统

## 6.1 主系统层
共 **5 个主系统层**：

1. Product Layer
2. Runtime / Hook Layer
3. Audio Core
4. Fretboard Core
5. Position DNA / Position Likelihood Layer

## 6.2 明确展开的子系统 / 模块单元

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
6 个子系统

### Fretboard Core
6 个子系统

### Position DNA
5 个证据子系统

## 6.3 合计
按当前执行母本明确展开的模块单元计算：

- Product Layer：6
- Runtime / Hook Layer：3
- Audio Core：6
- Fretboard Core：6
- Position DNA：5

**合计 26 个明确子系统 / 模块单元。**

> 如果把未来 bridge hooks、validator、analysis adapters、device profile registry、trainer reintegration adapters 继续拆开，最终工程形态会超过 30 个模块单元。  
> 但当前明确合同定义的是：**5 层主架构 + 26 个明确模块单元。**

---

# 7. 那两份 MD 里的系统到底有没有被删

结论：

**真正重要的系统主干没有粗暴删除。**  
只是被重新分成三类：

---

## 7.1 第一类：保留并进入当前正式主架构的
这些都保留，而且属于当前或近期实施重点：

- Audio Session
- Pitch Detection
- Noise Floor / Signal State
- Stabilizer
- Calibration / Device Profile
- Audio Mapping / Candidate Export
- Fretboard Topology
- Graph
- Resolver
- Interval Geometry
- Harmonic Targets
- Analysis Bridge
- Tuner
- Calibration
- Trainers 服务链

---

## 7.2 第二类：保留为完整愿景，并且最终要真正实施，不是只写愿景
这些**不是删除**，而是：

**保留为完整实施目标，但分阶段后移，不在当前编码范围一次性塞满。**

包括：
- 更成熟的 Guitar Semantics
- 更完整的 Fretboard Twin
- 更深的 path solving / path inference
- 更正式的全局分析层
- 更高级的位置推理
- 更成熟的 timbre fingerprint / overtone modeling
- 更强的 trainer semantic integration
- 更细粒度的 weakness modeling
- 更高阶的 region / path intelligence

你的要求是：  
**这些不是仅仅“保留为愿景”，而是最终必须落地。**  
这份文档已经按这个要求来写，后面会给出完整路线。

---

## 7.3 第三类：当前不作为重点的
这些不是当前产品重点，不应该抢资源：

- 滑音
- 闷音
- 推弦
- 泛化技巧识别体系
- 与当前四个训练器无直接关系的技巧层扩展

---

# 8. 五层主架构的完整职责合同

## 8.1 Product Layer
### 包含
- NotesTrainer
- IntervalsTrainer
- ScalesTrainer
- ChangesTrainer
- TunerView
- PreFlightView

### 负责
- 训练体验
- 用户交互
- 反馈呈现

### 不负责
- pitch detection
- topology
- graph
- resolver
- candidate ranking
- DNA 主逻辑

### 当前状态
- 冻结
- 不主动修改
- 未来通过更干净的 bridge 消费核心层

---

## 8.2 Runtime / Hook Layer
### 包含
- useAudioEngine
- useTuner
- useCalibration
- future bridge hooks

### 负责
- 生命周期
- 订阅管理
- UI-facing state
- bridge 到产品层

### 不负责
- 空间推理
- 核心检测
- 同音异位排序主逻辑
- 训练语义解析主逻辑

### 当前状态
- 先冻结，不大改
- 未来目标是越来越薄

---

## 8.3 Audio Core
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

### 推荐输出合同
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

## 8.4 Fretboard Core
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

### 推荐输出合同
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

## 8.5 Position DNA / Position Likelihood
### 目标
回答：

**“在同音异位条件下，更可能来自哪根弦、哪个候选位置？”**

### 它不是什么
- 不是空想概念
- 不是当前阶段就承诺 100% 准确几弦几品绝对识别
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

### 推荐输出合同
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

### 当前阶段正确表述
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

## 9.2 新 core 不是自动真理
`src/core/fretboard/*` 是未来正式主干候选，  
但不能因为“新”就整包吞掉旧 engine。

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

# 10. 完整实施路线（不是最小实现版）

你明确要求的不是最小收口路线，而是：

**把第二类“保留为愿景”的系统也最终真正落地。**

下面给出完整实施路线。

---

## Phase 0 — 当前基线冻结与系统收正
### 目标
- 冻结前台主线
- 冻结 trainer UI / theme / App 主流程
- 基于当前 repo 做完整系统审计
- 明确旧 engine / 新 core 职责对照

### 输出
- 边界报告
- 系统职责表
- KEEP / FREEZE / MODIFY / ADD / MIGRATE LATER
- 首轮核心实施计划

---

## Phase 1 — Audio Core 正式成形
### 目标
- Audio Session / Detection / Stabilizer / Calibration Consumption 成为正式主干
- 从 hooks 中抽离不该留在那里的核心逻辑
- 统一输出候选音频结果

### 重点
- Session Manager
- Detector Fusion
- Signal State
- Stabilizer
- Calibration Bridge
- Candidate Export

### 输出
- AudioFrameResult 合同稳定
- 未校准可用，校准增强
- 为后续 DNA / resolver 提供统一输入

---

## Phase 2 — Fretboard Core 正式成形
### 目标
- Topology / Graph / Interval Geometry / Harmonic Targets / Resolver / Analysis Bridge 全部稳定成主干

### 重点
- 把旧 `FretboardModel / GuitarModeEngine / TwoPointSystem` 的价值映射到新核心层
- 建立 graph-based 指板空间
- 建立正式 resolver 合同

### 输出
- FretboardResolutionResult 稳定
- trainers 未来统一使用同一底层空间解释系统

---

## Phase 3 — Position DNA 第一阶段落地
### 目标
- 同音异位候选排序真正可用
- 系统不再只停留在 pitch correct
- 开始做到 position likely correct

### 重点
- pitch fit
- range fit
- continuity fit
- context fit
- calibration-aware bias

### 输出
- PositionLikelihoodResult 稳定
- bestCandidate + confidenceBand + needsMoreFrames 可用
- 不承诺 100% 绝对 string/fret 判定

---

## Phase 4 — Position DNA 第二阶段扩展（愿景开始实装）
这就是你要的“不止第一阶段”。

### 目标
- 把 timbre / envelope / overtone / resonance 差异，从 hint 逐步提升为更强 ranking evidence

### 重点
- string-dependent timbre hint modeling
- envelope signature analysis
- device-profile-aware evidence normalization
- candidate evidence fusion

### 输出
- timbreHintFit 不再只是预留字段
- Position DNA 从“基础排序系统”升级为“多证据位置判断系统”

### 重要说明
当前阶段不是直接宣称：
> 已完成每根弦的稳定 DNA 指纹模型

而是逐步：
- 从 hint 变成 evidence
- 从 evidence 变成更稳定的 ranking 系统

---

## Phase 5 — Fretboard Twin / Higher Semantics 落地
这也是完整愿景的一部分，不删除，只后移实施。

### 目标
- 从位置层走向语义层
- 不只是哪个音、哪个位置，而是这个位置在训练、路径、功能上的意义

### 重点
- position cluster semantics
- functional region understanding
- path continuity reasoning
- training semantic interpretation
- global weak-spot structuring

### 输出
- 更完整的 Fretboard Twin
- 更成熟的训练语义输出
- analysisBridge 升级为更正式的 analysis layer

---

## Phase 6 — trainers / tuner / calibration 回接
### 目标
- 在核心主干稳定后，分批回接产品层

### 建议顺序
1. Tuner / Calibration 先回接 Audio Core  
2. NotesTrainer 接 resolver + position ranking  
3. IntervalsTrainer 接 interval geometry + semantic target  
4. ChangesTrainer 接 chord tone / harmonic targets  
5. ScalesTrainer 接 scale membership / path semantics  

### 输出
- trainers 不再各自维护一套判断逻辑
- 全部复用统一核心层

---

## Phase 7 — 完整分析层与更高阶语义能力
这是更完整愿景的后续正式落地阶段。

包括但不限于：
- stronger analysis layer
- learning weakness modeling
- long-term progress semantics
- deeper trainer semantic feedback
- more advanced region/path intelligence
- richer recommendation semantics

注意：
这不等于：
- 学校管理
- 排名系统
- 成就系统
- 大型后端全家桶

那些是更外层产品，不属于 Fretboard + Audio Core 主干本体。

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
- routing
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

# 12. 给 Codex 的实际工作方式

## 12.1 第一轮只允许做什么
Codex 第一轮必须先输出：

# 《基于当前 repo 的 Fretboard + Audio Core 系统收正与完整实施计划》

必须包含：
1. 当前 repo 真实边界审计  
2. 当前系统职责表  
3. 旧 engine vs 新 core 对照关系  
4. KEEP / FREEZE / MODIFY / ADD / MIGRATE LATER 分类  
5. 完整实施路线在当前 repo 的具体落位  
6. Position DNA 的输入 / 输出 / 阶段边界  
7. 当前阶段的首轮代码实施计划  

**先不要写代码。**

## 12.2 第二轮才进入代码
只有在你确认计划后，Codex 才能进入代码阶段。

代码阶段顺序必须是：
1. 先 core-only  
2. 再验证  
3. 再考虑回接计划  
4. 不要直接碰 hooks / trainers / views  

## 12.3 它必须自己先推理
Codex 不能机械照抄系统名。  
它必须先回答：
- 当前 repo 里每层真实职责是什么
- 当前最该推进的是哪个层
- 哪些东西应该保留，哪些应该后移
- 哪些是第一阶段，哪些是完整愿景后续阶段
- Position DNA 现在到底能做到什么，不能做到什么

---

# 13. Codex 做完后，如何拿你的最新 repoMix 去做完美桥接、嵌入

这是你特别要求的部分。

## 13.1 大原则
Codex 云端做完后，**不能直接把它当真相塞进本地主线**。  
正确流程是：

### 第一步：重新导出本地最新 repoMix
在你本地当前认可的真实基线上，重新导出一份最新 repoMix XML。

这份 repoMix 代表：
- 当前主线真实代码
- 最新冻结前台主线
- 当前 trainers / hooks / engine 现实状态
- 当前还没被 Codex 覆盖的真实工程上下文

### 第二步：把 Codex 产出和最新 repoMix 一起对照
给 Codex 或另一个审查 Agent 同时喂：
- Codex 当前产出
- 你本地最新 repoMix
- 本文档（终极总母本）

让它做：

# 《Codex 产出 vs 最新 repoMix 的桥接与嵌入报告》

必须回答：
1. 哪些 Codex 改动与当前 repo 完全兼容  
2. 哪些改动会冲突  
3. 哪些只应 cherry-pick  
4. 哪些只应作为参考，不应直接合入  
5. hooks / trainers / product 层是否被意外污染  
6. 是否违反冻结主线规则  

### 第三步：永远先 core，再 bridge，再 UI
桥接顺序不能乱。

正确顺序：

1. **先看 core 文件能否独立并入**  
2. **再看 contracts / validators / tests 能否并入**  
3. **最后才看 hooks / trainer bridge 是否需要最小嵌入**  
4. **前台冻结主线不应该因为桥接而被拖动**

### 第四步：优先 cherry-pick，不优先整包合并
当 Codex 做完一大块工作后，不要默认整包接。

优先级：
1. core-only 资产
2. contract / test / validator 资产
3. bridge 层资产
4. trainer / hook 接线层
5. UI 层（当前阶段原则上不动）

### 第五步：桥接后的现实必须重新做 repoMix 快照
一旦你做了本地嵌入：
- 再导出一次最新 repoMix XML
- 让后续 Agent 基于这个新基线继续工作

也就是说：

**每一次 Codex 大推进后的本地嵌入，都要刷新 repoMix 真相。**

---

## 13.2 什么时候算“完美桥接”
满足下面条件，才算桥接成功：

1. 前台冻结主线未被污染  
2. trainer UI 未被意外改动  
3. App 主流程未被拖偏  
4. core-only 资产可独立运行或通过测试  
5. contracts / tests 与当前 repo 现实一致  
6. hooks 没被重新塞满系统逻辑  
7. Codex 产出的命名、职责、层级与你这份总母本一致  
8. 可以明确说出：哪些是新增主干，哪些只是过渡桥接  

---

## 13.3 桥接后的后续推进方式
桥接完成后，下一轮不要再让 Agent 从头思考“这个系统是什么”。

你应该固定这样说：

> 本地已完成最新桥接，最新 repoMix 已上传。  
> 请以最新 repoMix + 本总母本为双基线，继续下一阶段实施，不要回退到旧上下文。

---

# 14. 给 Codex 的一句话执行口径

## 当前阶段一句话
**当前阶段只做基于当前 repo 的 Fretboard Core + Audio Core 收正与正式主干建立，不碰前台主线，不碰 trainer UI，不引入无关技巧识别。**

## Position DNA 一句话
**Position DNA / Position Likelihood 是同音异位下的位置候选排序系统，当前阶段先做概率排序和证据聚合，后续再逐步把 timbre / overtone / envelope evidence 正式做强。**

## 完整实施路线一句话
**这不是最小实现路线，而是从当前 repo 出发，把 Audio Core、Fretboard Core、Position DNA、Fretboard Twin 与更高层语义能力逐步完整落地的正式路线。**

---

# 15. 给 Codex 的直接任务（第一轮）

请先做以下事情，不要写代码：

1. 基于我上传的最新 repoMix XML，按本文件重新审计当前 repo  
2. 输出你理解的完整架构分层  
3. 输出当前 repo 中每层的真实文件归属  
4. 输出旧 engine vs 新 core 的职责映射  
5. 输出 KEEP / FREEZE / MODIFY / ADD / MIGRATE LATER  
6. 输出完整实施路线中，当前 repo 最适合先落地的那一段  
7. 输出当前阶段首轮实施计划（只到 core-only，不碰前台冻结层）

**等我确认后，你再进入代码阶段。**

---

# 16. 最后的总定义

**Solo Vision Ultra Fretboard + Audio Core**  
不是普通指板 UI，也不是普通调音器。  
它是一套把吉他的指板结构、音高系统、音程功能、和声目标、实时音频、校准参数、训练语义和练习分析统一起来的中台系统。

它最终要做到的不是：

> “我做了一个强的 pitch detector。”

而是：

> “我做了一套真正理解吉他学习过程的系统：它知道用户听到了什么、弹了什么、最可能弹在哪里、这在当前训练中意味着什么、为什么算对、为什么算错、下一步应该怎么练。”

这才是整个产品真正的护城河。
