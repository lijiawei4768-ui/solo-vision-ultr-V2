# Solo Vision Ultra  
# Fretboard 吉他指板系统与音频系统完整总纲 MD  
## 基于当前对话构思版（非 repo 抽取版）

---

# 0. 文档定位

这份文档不是代码审计报告，也不是对现有仓库文件的复述。  
它是基于我们当前对话中已经逐步收敛出来的产品方向、训练逻辑、音频问题、指板建模理念、Two-Point 思维、训练器边界，以及你要做成 **2026 年最强吉他学习软件** 这个目标，整理出来的一份 **Fretboard + Audio System 总蓝图**。

它的作用有三个：

1. 作为未来 Fretboard Core / Audio Core 的统一母规范  
2. 作为 Claude / Codex / Cursor 这类执行代理的高层约束文档  
3. 作为后续训练器、分析系统、校准系统、Tuner、Intervals、Scales、Changes 的共同底层认知依据

---

# 1. 总目标

本系统不是做一个“能显示指板的 UI”，也不是做一个“能识别音高的调音器”。

它要做的是：

**把吉他的指板空间、音高系统、训练目标、用户实际演奏、实时音频输入、设备差异、校准结果和学习分析统一到一套中台里。**

最终目标不是“检测出一个频率”，而是：

- 理解用户大概率弹了什么音
- 理解用户大概率弹在什么位置
- 理解这个音在当前训练中意味着什么
- 理解这个音为什么算对 / 算错 / 还不能判
- 理解用户在哪些指板区域、哪些功能音、哪些和声目标上最弱
- 把这些结果反向服务给训练器、Home、Persona、推荐、挑战、成就、后续学校系统

---

# 2. 系统总名称与范围

建议统一命名为：

## Solo Vision Ultra Fretboard & Audio Core

由两大核心组成：

## A. Fretboard Core
负责：
- 吉他指板本体建模
- 音与位置的关系建模
- 音程 / 音阶 / 和声目标的指板语义建模
- 训练目标的统一表示
- 弱点热区与空间分析

## B. Audio Core
负责：
- 麦克风 / 输入设备接入
- 原始音频处理
- 基频检测与稳定化
- 静音 / 噪声 / attack / sustain / release 状态判断
- 校准与设备画像
- 把音频候选结果交给 Fretboard Core 解释

两者关系不是并列孤岛，而是：

**Audio Core 负责“听到了什么”，Fretboard Core 负责“这意味着什么”。**

---

# 3. 现阶段必须服务的产品模块

这套系统不是抽象平台，首先只服务你现有 App 的核心模块：

- NotesTrainer
- IntervalsTrainer
- ScalesTrainer
- ChangesTrainer
- TunerView
- PreFlight / Calibration
- HomeView
- PersonaView
- OnboardingView

也就是说，这份文档虽然是底层总纲，但不是泛化吉他产品宇宙。  
它优先围绕你现在已经确定的训练闭环来设计。

---

# 4. 第一原则

## 4.1 指板不是 UI，而是认知底层
指板不是一个可视化组件，而是一套音乐空间模型。

## 4.2 音频不是单独工具，而是训练入口
音频系统不是附属调音器，而是整个产品是否可信的根本。

## 4.3 训练器不能各自维护一套音高/位置逻辑
Notes、Intervals、Scales、Changes 不能各自有一套“目标判断规则”，必须统一到同一个指板核心上。

## 4.4 同一个音 ≠ 同一个位置 ≠ 同一个功能
吉他天然有同音异位。  
所以必须区分：
- 音高正确
- 位置正确
- 功能正确
- 训练语义正确

## 4.5 校准是增强层，不是唯一救命层
校准应该提升稳定性与精度，但系统不能做到“没校准就完全不能用”。

## 4.6 系统必须分层，不允许再把逻辑全堆进 hook
后续任何实现都要避免把输入、检测、稳定化、训练解释、UI 状态全塞进一个 hook 或一个 trainer。

---

# 5. Fretboard Core 总结构

Fretboard Core 推荐拆成 6 个一级子系统：

1. Fretboard Topology System  
2. Fretboard Graph System  
3. Target Resolver System  
4. Interval Geometry Engine  
5. Harmonic Target Engine  
6. Analysis Bridge System  

---

# 6. Fretboard Topology System

## 6.1 目标
定义“这把吉他在数学和音乐意义上到底是什么”。

## 6.2 必须回答的问题
- 一共有几根弦
- 每根弦空弦是什么音
- 每个品位是什么音
- 每个位置对应什么 MIDI / 频率 / 音名 / 八度
- 标准调弦和自定义调弦下如何变化
- 哪些位置是同音异位
- 哪些位置属于哪一把位区间

## 6.3 核心数据字段
每个指板节点至少要有：

- `stringIndex`
- `fret`
- `noteName`
- `pitchClass`
- `octave`
- `midi`
- `idealFrequency`
- `positionRegion`
- `isOpenString`
- `alternatePositionGroup`

## 6.4 设计要求
- 默认支持 6 弦吉他
- 默认支持 0–12 品，结构上兼容到 24 品
- 默认标准调弦 E A D G B E
- 支持 Drop、Open、自定义调弦
- 所有训练器都只能读同一份 topology，而不是各自硬编码

---

# 7. Fretboard Graph System

## 7.1 目标
把指板从“表格”升级成“图”。

## 7.2 为什么必须是图
因为吉他的真实学习与演奏，不是按表格扫描，而是按关系移动：

- 同弦上下
- 跨弦平移
- 同音异位
- 音程跳转
- 换把
- 和声目标迁移
- 音阶路径连通

这些都天然适合图，而不是二维数组。

## 7.3 节点
节点就是一个 `(string, fret)` 位置。

## 7.4 边的类型
至少包含：

### a. adjacent_same_string
同弦相邻品位

### b. adjacent_cross_string
相邻弦之间的近邻关系

### c. same_pitch_alt_position
同音异位关系

### d. interval_edge
任意两个节点之间满足某功能音程关系的连接

### e. scale_edge
属于同一音阶集合内的局部连通边

### f. chord_edge
属于同一和弦目标集合内的连接

### g. position_shift_edge
同一 musical idea 在不同把位之间的迁移边

## 7.5 图的意义
这层不是为了炫技，而是为了支持：

- 两点系统形状生成
- 音阶路径生成
- 和弦目标移动
- 弱点热区统计
- 未来的最短路径 / 最低运动成本推理

---

# 8. Target Resolver System

## 8.1 目标
把“训练题目”统一翻译成“允许答案集合”。

这是未来所有 trainer 统一的关键。

## 8.2 统一目标对象
所有训练器的题目，最终都应该抽象成：

- 当前 trainer 类型
- 当前目标音 / 功能
- 当前允许位置集合
- 当前允许弦组
- 当前允许把位范围
- 是否要求严格位置
- 是否允许同音异位等价
- 是否允许不同八度

## 8.3 NotesTrainer 中的作用
给一个音名，结合当前范围限制，返回所有允许的答案位置。

## 8.4 IntervalsTrainer 中的作用
给一个 root 和一个功能音程，返回所有可接受的目标节点集合。

## 8.5 ScalesTrainer 中的作用
给定 root、scale type、position window，返回合法路径或合法节点区。

## 8.6 ChangesTrainer 中的作用
给定当前和弦与目标功能音，返回所有合法的目标位置集合。

---

# 9. Interval Geometry Engine

## 9.1 目标
这是 IntervalsTrainer 的灵魂层，也是 Tom Quayle 两点系统产品化的核心。

## 9.2 它不是什么
它不是“算几个半音”的小函数。

## 9.3 它必须负责什么
- 给定 root 节点，生成功能音程候选位置
- 区分上下行
- 区分同音高但不同功能命名
- 处理 G→B 弦补偿逻辑
- 表达形状而不只是表达距离
- 服务 two-point 训练语义

## 9.4 为什么必须保留功能语义
因为在训练里：
- b3 不只是 3 个半音
- #9 不只是某个 enharmonic pitch
- 7、b7、6、13 在训练意义上不等价

系统不能因为音高相同，就把功能关系抹平。

## 9.5 形状层
它要能回答：
- 这个 interval 在哪里
- 它是哪一类 shape
- 是同弦、跨弦、斜向、水平，还是其他模式
- 当前 shape 是否经过 G/B 补偿
- 当前 shape 是否属于训练要求的集合

---

# 10. Scale Path Engine（作为 Resolver/Graph 的扩展）

## 10.1 目标
服务 ScalesTrainer，但当前阶段不必做成全能大系统。

## 10.2 它必须支持
- 某 root + 某 scale 的节点集合
- 某把位窗口内的合法节点
- 当前路径是否仍在 scale 内
- 当前用户是否偏离目标区域

## 10.3 当前阶段不必过度承诺
第一阶段不必马上做到：
- 最优音阶路线
- 全颈智能路径
- 高级片段推理

第一阶段做到：
- 合法集合
- 局部路径
- 区域约束  
就已经有很高价值。

---

# 11. Harmonic Target Engine

## 11.1 目标
专门服务 ChangesTrainer。

## 11.2 它负责什么
- 解析当前和弦
- 给出目标功能音集合
- 将目标功能音映射到指板位置
- 结合上一个目标点，给出更合理的迁移候选

## 11.3 它为什么重要
ChangesTrainer 不是“和弦里随便弹一个音都行”。

真正高质量的和声训练应该关心：
- 你命中了哪个功能音
- 你是否从上一和弦合理地移动过来
- 你是否在做更接近 voice leading 的选择

## 11.4 第一阶段目标
第一阶段不要求做到完整的高级和声导航 AI。  
但至少要做到：
- chord symbol → function targets
- function target → candidate fretboard nodes
- previous node → preferred next targets

---

# 12. Analysis Bridge System

## 12.1 目标
把训练结果沉淀为“指板空间上的弱点”。

## 12.2 它要连接什么
- 训练器的正确/错误记录
- 反应时间
- 哪些功能音程最慢
- 哪些音常错
- 哪些和弦目标常错
- 哪些把位 / 区域表现差

## 12.3 输出给谁
- HomeView 的今日推荐
- PersonaView 的能力概览
- 后续 streak / 成就 / 挑战
- 未来学校系统与老师端分析

## 12.4 第一阶段要求
先从“符号级”走向“位置级”：

- weakNotes 不只是 noteName
- weakIntervals 不只是 label
- weakChords 不只是 chord name

而要逐渐变成：
- 哪个区域的哪些音总错
- 哪些 two-point 关系最弱
- 哪种 harmonic target 迁移最差

---

# 13. Audio Core 总结构

Audio Core 推荐拆成 7 个一级子系统：

1. Audio Session Layer  
2. Input Analysis Layer  
3. Pitch Detection Layer  
4. Pitch Stabilizer Layer  
5. Calibration & Device Profile Layer  
6. Audio-to-Fretboard Mapping Layer  
7. Product State Layer  

---

# 14. Audio Session Layer

## 14.1 目标
统一管理输入设备、音频上下文和生命周期。

## 14.2 必须负责
- 获取麦克风权限
- 初始化 AudioContext
- 维护单例 session
- suspend / resume
- 页面切换后的恢复
- 输入设备切换
- 错误状态回报

## 14.3 必须避免
- 每个页面自己开一个新 audio context
- 频繁 close / recreate
- 切页后必须重启整个链路
- 权限失败和无信号状态混为一谈

## 14.4 为什么这层重要
你之前遇到的“只能识别一次”“切回来不恢复”“需要去设置里翻找”，很多并不是 detector 的锅，而是 session 生命周期没管理好。

---

# 15. Input Analysis Layer

## 15.1 目标
对原始音频流做最基础的前置判断。

## 15.2 必须输出
- RMS / loudness
- noise floor estimate
- 是否可能有有效信号
- attack onset 迹象
- 当前是不是静音
- 当前是不是只有环境噪声

## 15.3 意义
这层能防止：
- 静音乱跳
- 背景噪音误判
- 轻微碰弦就当有效答案
- 过低输入幅度进入 pitch 误判

---

# 16. Pitch Detection Layer

## 16.1 目标
给出可靠的 pitch 候选，而不是武断答案。

## 16.2 推荐原则
不要依赖单一 detector 神话。  
推荐采用“双检测 + 融合”思路：

- 主检测：YIN / CMNDF 类
- 辅检测：ACF / MPM 类
- 输出候选而不是唯一真理

## 16.3 标准输出字段
每次检测至少输出：

- `freq`
- `confidence`
- `clarity / periodicity`
- `rms`
- `octaveRisk`
- `engine`
- `timestamp`

## 16.4 设计目标
这层只回答：
- 现在最可能检测到什么频率

它不负责直接决定：
- 这是哪根弦
- 这是不是训练答案
- 这是不是应该推进

---

# 17. Pitch Stabilizer Layer

## 17.1 目标
把“跳动的原始 pitch 候选”变成“可用的稳定判定候选”。

## 17.2 必须负责
- silence gate
- noise rejection
- median / weighted median
- lock / unlock
- attack 抑制
- release 延迟
- octave guard
- low-string special handling

## 17.3 为什么这层极其关键
用户体感中的“垃圾音频系统”，很多其实不是 detector 算不出来，而是没有稳定层。

比如：
- 静音时还在跳
- 低 E 老八度翻倍
- 明明已经接近稳定，但 UI 每帧闪烁
- 拨一下之后长时间卡住不恢复

这些问题都应该在 stabilizer 层解决。

## 17.4 低频策略
低 E / A 弦需要额外保守策略：
- 更宽容的锁窗
- 更强的 octave guard
- 更稳的 sustain 判断
- 更严格的 harmonic filtering

---

# 18. Calibration & Device Profile Layer

## 18.1 目标
把“当前用户 + 当前设备 + 当前环境”的差异参数化。

## 18.2 必须包含
- noise floor
- gain window
- per-string sensitivity
- per-string confidence
- low-string risk profile
- G/B compensation 相关参数
- calibration timestamp
- verification status

## 18.3 它服务什么
- Tuner
- Calibration
- 训练阶段的运行时先验
- 未来按设备区分不同 profile

## 18.4 它不应该是什么
不是一锤子买卖。  
它应该允许：
- 更新
- 过期
- 重校
- 记住某设备的 profile

---

# 19. Audio-to-Fretboard Mapping Layer

## 19.1 目标
把已经稳定下来的音频结果，交给指板语义层解释。

## 19.2 输入
- 当前稳定频率
- confidence
- rms
- octaveRisk
- 当前调弦
- 当前 trainer 上下文
- 当前 calibration profile

## 19.3 输出
- noteName
- pitchClass
- candidate fretboard nodes
- matched target or not
- should advance or not
- confidence of interpretation

## 19.4 核心价值
这层让系统从：

“我听到 110Hz 左右”

变成：

“我当前最可能听到的是 A2；在当前训练上下文里，它最可能对应这些位置；其中这些位置是合法答案；当前可以推进 / 不能推进。”

---

# 20. Product State Layer

## 20.1 目标
不同模式必须有不同的状态机，不允许用同一套“听到频率就推进”的粗暴逻辑。

## 20.2 最少要有的状态
- idle
- requesting_permission
- listening
- no_signal
- noise_only
- attack_detected
- unstable_pitch
- locked_pitch
- calibration_in_progress
- calibration_success
- calibration_failed

## 20.3 为什么必须做
因为：
- Tuner 的规则和 Intervals 不一样
- Calibration 的规则和 Notes 不一样
- ChangesTrainer 的推进条件和 Tuner 完全不同

状态层不分开，体验必然混乱。

---

# 21. Tuner 系统定位

## 21.1 Tuner 的职责
- 识别当前目标弦
- 显示偏高偏低
- 给用户直观的调音反馈
- 提供足够稳的 cent 偏差显示

## 21.2 Tuner 不是训练器
Tuner 的容忍逻辑、目标逻辑、UI反馈都应该更直接、更宽容。

## 21.3 Tuner 与 Fretboard Core 的关系
Tuner 不需要完整的位置推理，但需要：
- 调弦语义
- 目标弦频率
- 每弦 profile
- 低频特殊处理

---

# 22. Calibration 系统定位

## 22.1 Calibration 的职责
- 获取噪底
- 验证设备是否适合当前场景
- 估计每弦可识别性
- 为后续训练和 Tuner 提供运行时参数

## 22.2 Calibration 不等于 Tuner
它们都依赖 Audio Core，但：
- Tuner 是即时工具
- Calibration 是环境/设备准备层

## 22.3 Calibration 第一阶段输出
至少包括：
- noise floor
- verification score
- basic per-string confidence
- calibration passed / failed

---

# 23. 四大训练器如何接入

---

# 24. NotesTrainer 接入方式

## 24.1 目标
训练“音”和“位置”的快速对应。

## 24.2 依赖
- Topology
- Resolver
- Audio Mapping
- Analysis Bridge

## 24.3 判定层级
- 音高对不对
- 是否命中允许位置集合
- 是否需要严格位置
- 是否允许同音异位等价

## 24.4 记录层
- 哪些音常错
- 哪些区域常错
- 哪些位置反应时间慢

---

# 25. IntervalsTrainer 接入方式

## 25.1 目标
训练 root 与 function 的空间关系。

## 25.2 依赖
- Topology
- Graph
- Resolver
- Interval Geometry
- Audio Mapping
- Analysis Bridge

## 25.3 判定层级
- root 是否正确
- interval function 是否正确
- shape 是否属于合法集合
- 是否需要区分 enharmonic function

## 25.4 记录层
- 哪些功能音程最慢
- 哪些 shape 最弱
- 哪些区域内的 interval 判断最差

---

# 26. ScalesTrainer 接入方式

## 26.1 目标
训练 scale 节点与区域路径感。

## 26.2 依赖
- Topology
- Graph
- Resolver
- Scale Path 支撑
- Analysis Bridge

## 26.3 第一阶段不要吹太满
第一阶段优先做到：
- 合法节点集合
- 局部路径
- 区域限制
- 偏离检测

不必立刻做到完整的 AI 路径分析。

---

# 27. ChangesTrainer 接入方式

## 27.1 目标
训练和声目标与声部移动。

## 27.2 依赖
- Topology
- Graph
- Resolver
- Harmonic Target Engine
- Audio Mapping
- Analysis Bridge

## 27.3 判定层级
- 当前和弦目标是否命中
- 命中了哪类功能音
- 是否有更合理的前后连接路径
- 是否属于当前任务允许的答案集合

---

# 28. Home / Persona / 推荐系统如何使用这套底层

## 28.1 Home
不只推荐“今天练 Intervals”，而应该能推荐：
- 你在 5–7 品区域的某类音程明显更慢
- 你在某两个和弦间的目标迁移命中率低
- 你低音区域的 notes trainer 准确率差

## 28.2 Persona
不只显示 streak 和时长，还应逐步显示：
- 最弱区域
- 最弱功能音程
- 最弱和声目标
- 近期改善最明显的区域

## 28.3 后续成就与挑战
这套底层会让成就变得更像“音乐成长”而不是“刷时长”。

---

# 29. 系统输出的四层裁判模型

任何训练判定，最终建议都分成四层：

## Layer 1: Pitch Correctness
音高是否正确

## Layer 2: Position Correctness
位置是否在允许集合中

## Layer 3: Functional Correctness
功能是否正确

## Layer 4: Contextual Correctness
在当前训练语境里是否应推进

这四层分开后，系统才能给出更高级反馈：

- 音对了，但位置不对
- 位置可以接受，但功能不对
- 功能对了，但当前训练不允许这个答案
- 当前证据还不够，不推进

---

# 30. 第一阶段与后续阶段边界

---

# 31. 第一阶段必须完成的

## Fretboard Core
- Topology
- Graph 基础
- Resolver
- Interval Geometry 基础
- Harmonic Target 基础
- Analysis Bridge 基础

## Audio Core
- Session 管理
- Pitch Detection
- Stabilizer
- Calibration 基础
- Audio Mapping 基础

## 训练接入
- Notes 第一轮接入
- Intervals 第一轮接入
- Changes 第一轮接入
- Tuner / Calibration 稳定化
- Home / Persona 读取弱点结果

---

# 32. 第一阶段不强求一次做满的

- 完整的 scale 智能路径
- 完整的 position inference AI
- 高级 technique recognition
- 全颈最优路线计算
- 全自动个体化生成训练计划
- 多模态视觉辅助定位

这些都是第二阶段甚至更后面的事。

---

# 33. 未来可扩展但当前不强推的方向

## 33.1 Position Inference Engine
结合：
- 音频
- 上下文
- 上一位置
- 允许区域
- 用户习惯  
输出最可能位置概率分布

## 33.2 Personal Guitar Model
学习用户：
- 常错区域
- 常用把位
- 常见误判路径
- 对某弦更稳还是更差

## 33.3 Technique Awareness
未来可加：
- slide
- bend
- hammer-on
- pull-off
- harmonic
- muted

但不是第一阶段核心。

---

# 34. 架构与文件层级建议

推荐最终形成类似这样的核心分层：

```text
src/core/fretboard/
  fretboard.json
  topology
  graph
  resolver
  intervalGeometry
  harmonicTargets
  analysisBridge

src/core/audio/
  session
  inputAnalysis
  detectors
  stabilizer
  calibration
  audioMapping
  state
```

Trainer 层只调用这些核心能力，不自己发明另一套判断规则。

---

# 35. 实施优先级建议

## P1
先立底座：
- Fretboard Topology
- Fretboard Graph
- Audio Session
- Pitch Detector
- Stabilizer

## P2
先解决命脉：
- Tuner 稳定
- Calibration 基础闭环
- Notes / Intervals 初步统一到核心

## P3
加强训练语义：
- Interval Geometry
- Harmonic Target
- ChangesTrainer 第一轮正确接入

## P4
加强分析与推荐：
- Analysis Bridge
- Home / Persona 读取更结构化结果

## P5
再做更深的 Scale / Position / Personalization

---

# 36. 这套系统最终要达到的体验标准

## 音频层
- 静音不乱跳
- 低 E / A 稳定
- 切页回来能恢复
- Tuner 可信
- Calibration 不折腾

## 指板层
- 同一份 topology 被所有 trainer 共享
- 所有题目都能落成统一目标集合
- interval / harmony 不再各说各话

## 训练层
- Notes / Intervals / Changes 的判定统一
- 错误不再只是“错了”，而是知道错在哪一层
- Home / Persona 的推荐有真实空间依据

---

# 37. 一句话总定义

**Solo Vision Ultra Fretboard & Audio Core**  
是一套把吉他的指板结构、音高系统、音程功能、和声目标、实时音频、校准参数、训练语义和练习分析统一起来的中台系统。

它不是普通指板 UI，也不是普通调音器。  
它是未来所有训练器、Tuner、Calibration、Home、Persona、推荐、分析，乃至更远期教育系统的共同底层。

---

# 38. 最终产品级目标

这套系统的最终目标不是：

> “我做了一个很强的 pitch detector。”

而是：

> “我做了一套真正理解吉他学习过程的系统：它知道用户听到了什么、弹了什么、最可能弹在哪里、这在当前训练中意味着什么、为什么算对、为什么算错、下一步应该怎么练。”

这才是你这整个产品真正的护城河。

---

# 39. 结语

如果只做 UI，产品不成立。  
如果只做音频检测，产品也不成立。  
如果只做理论图谱，产品还是不成立。

真正成立的是：

**Fretboard Core + Audio Core + Trainer Semantics + Progress Analysis**  
四者统一之后的完整系统。

这份文档就是这套系统的母定义。
