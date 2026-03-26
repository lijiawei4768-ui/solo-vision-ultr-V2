# 单对话闭环执行终版合同：SVU Standalone Demo 批次实现

## 0. 执行身份与总目标
你现在不是继续写体系文档，也不是只给建议。
你现在是本项目的受限执行代理，任务是在**同一次对话**里，基于已经封箱的母本与补充硬合同，按批次完成 standalone demo 的实现闭环。

你的目标不是“讲思路”，而是：
**审计真实基线 → 映射母本与硬合同 → 制定批次实施计划 → 分批实现 → 分批构建与自检 → 分批验收 → 自动进入下一批 → 最终总收口。**

---

## 1. 执行范围
只允许在以下目录内工作：

`C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch`

主项目：
`C:\Users\MI\Desktop\solo-vision-ultra\`
只允许审计、对照、提取结构和语言基线，不允许修改任何文件。

---

## 2. 唯一母本与硬输入
后续执行必须同时满足三层，不允许缺层：

### 第一层：封箱母本（最高层执行框架）
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\STAGE_DESIGN_SYSTEM.md`
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\stage-language.js`

状态已锁：
- 2.0 = 执行母本，已封箱
- 2.1 = 豪华执行底座，已封箱

### 第二层：真实 repo 基线
必须对照主项目里的真实页面、真实组件、真实结构、真实交互语法，但不修改主项目。

### 第三层：Batch B / Batch C 的硬输入合同
以下文档必须作为实现硬输入纳入，不得弱化，不得只当参考：

- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\solo_vision_ultra_trainer_blueprint_v2.html`
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\trainer_refactor_blueprint.html`
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SVU_Fretboard_Audio_Core_Ultimate_Master.md`
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SVU_Fretboard_Audio_Core_Execution_Contract_Final.md`
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md`
- `C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\gpt帮我制定的所有提示词和本意，目标.txt`

解释：
- Batch B 必须同时服从 trainer 蓝图合同
- Batch C 必须同时服从 fretboard / audio 三份核心 MD 合同
- 这些文档不是替代 2.0 / 2.1 母本，而是强化对应批次的实现边界

---

## 3. 绝对禁止事项
1. 不允许重写母本
2. 不允许回头改体系定义
3. 不允许另做一套 explanation demo / scrolling landing page / 假高级展示页
4. 不允许脱离真实 repo 结构另发明假产品
5. 不允许只导入外部组件却不真正落地到页面
6. 不允许手搓低配版替代白名单成熟实现
7. 不允许把计划当实现
8. 不允许 build 通过就冒充页面完成
9. 不允许在当前批次未验收通过前宣布“后面同理”
10. 不允许越过当前批次直接并行做整站
11. 不允许让 trainer 内容平权化、模板化，破坏各页面训练边界
12. 不允许把 Batch B / C 的 docx 硬边界弱化成“可选参考”

---

## 4. 总执行模式
采用：

# 页面簇单批次闭环执行制（单对话串行跑完）

定义：
- 一次处理一个 Batch
- 当前 Batch 未验收通过前，不得跳到下一批
- 但整个对话中要持续推进，不要停在“等我确认”
- 必须在同一次对话里，把每个 Batch 的闭环跑完，再自动进入下一批

---

## 5. 批次划分（终版）
### Batch A
- `Home`
- `Why Different`
- `Tabs / Product Navigation`
- `Theme System`

### Batch B
- `Intervals`
- `Notes → Fretboard Literacy`
- `Scales → Scale Systems`
- `Changes → Chords`

### Batch C
- `Fretboard Core`
- `Audio Core`
- `Live Product`

### Batch D
- `Tuner / Calibration`
- `Persona / Onboarding`
- `Product Ecosystem`
- `Closing / Brand Closure`

补充边界：
- `Why Different` 不是单独说明页，只作为 Batch A 首页后的认知镜头
- `Intervals` 属于 Batch B 内 trainer 旗舰基座，不得被弱化
- `Live Product` 属于 Batch C 内 trainer → core → runtime 的合成运行时镜头
- Batch D 必须继承 Batch C 的 core 语义，不允许重新做回独立工具页

---

## 6. 共享壳层与目录结构规则
共享壳层必须先在 Batch A 落地，后续批次复用。

目录拆分方式固定为：

- `src/components/presentation/chrome/*`：共享 stage / page / motion / chrome primitives
- `src/components/presentation/surfaces/batch-a/*`
- `src/components/presentation/surfaces/batch-b/*`
- `src/components/presentation/surfaces/batch-c/*`
- `src/components/presentation/surfaces/batch-d/*`
- `src/components/presentation/ProductSurfaces.jsx`：只保留 scene → surface 调度与 registry
- `src/data/product-scenes.js`：scene / step / 完成态 / wiring 对齐
- 如确有必要，只允许新增局部执行级 wiring constants
- 不允许修改 `stage-language.js` 母本主结构

共享壳层优先落地：
- `StageBackdrop`
- `PresentationChrome`
- progress chrome
- scene handoff
- 主 / 辅镜头容器
- typography motion
- trainer / core / utility 共用 page primitives

---

## 7. 白名单外部成熟实现
只允许优先直接接入 2.1 白名单成熟实现，并做轻量品牌化改造：

### Motion
- `AnimatePresence`
- `LayoutGroup`
- shared layout / handoff
- runtime overlay transitions

### Magic UI
- `TextAnimate`
- `BlurFade`
- `GridPattern`

### shadcn/ui
- `Tabs`
- `Card`
- `Badge`
- `Button`
- `Separator`
- 以及本批次确需的 `Dialog / Sheet`

规则：
- 优先直接接成熟实现
- 只做必要品牌化改造
- 不得自己手搓一个低配替代物
- 任何外部实现都必须明确落到：哪个页面 / 哪一层 / 哪个 scene / 哪个动作

---

## 8. 每个 Batch 内部必须严格走完的 8 步闭环
### Step 1. 真实 repo 审计
必须审计：
- 页面入口
- 路由 / 挂载点
- 真实组件树
- 当前结构状态
- 当前视觉状态
- 当前行为状态
- 与母本冲突点
- 与相邻 Batch 的耦合点

要求：
- 只写真实存在的内容
- 明确区分“当前已有”与“母本要求但当前没有”

### Step 2. 母本 + 硬合同映射
必须逐页对照：
- 2.0 / 2.1 母本
- 真实 repo 页面
- 若属于 Batch B / C，还必须额外对照 docx 硬合同

输出必须包含：
- 页面定位
- 对应 lens / scene / surface
- 对应 2.1 豪华底座层
- retain
- retainLogicOnly
- continueLanguage
- continueInteraction
- refactor
- add
- 外部成熟代码接入点
- 禁止误实现项

### Step 3. 批次实施计划
先列清楚：
- 先改哪些文件
- 后改哪些文件
- 哪些是共享壳层
- 哪些是页面层
- 哪些是组件层
- 哪些外部成熟实现直接接入
- 哪些只做轻改
- 哪些不能碰
- 风险点
- 完成后页面会变成什么状态

### Step 4. 代码实现
按计划落地：
- 只改当前 Batch 相关文件
- 不顺手扩散重构其它批次
- 不偷偷回头改母本
- 不降低质感要求
- 必须绑定真实 repo 页面与结构
- 如实现中有歧义，只允许补当前 Batch 的执行级 wiring，不允许回退改体系

### Step 5. 构建与基础验证
每个 Batch 后必须执行：
- `npm run build`
- 当前 Batch scene 入口可前进 / 回退
- 交互控件不误触全局翻页
- scene id 与 surface registry 无缺项
- 当前 Batch 外部成熟实现是“实际渲染并落地”，不是仅导入未使用
- 前一批已完成页面没有被破坏

### Step 6. 母本一致性回查
必须检查：
- 是否漂回 explanation demo
- 是否退化为普通暗色 dashboard / AI 官网
- 是否偷换成熟实现为低配手搓
- 是否破坏真实页面结构
- 是否缺失应落地的豪华底座层
- 是否把 trainer 内容做成平权模板

### Step 7. 批次验收报告
固定输出：
1. 本批次处理范围
2. 实际修改文件列表
3. 实际接入的外部成熟代码
4. retain / retainLogicOnly / refactor / add 结果
5. build / 自检结果
6. 与母本 / 硬合同一致性结果
7. 当前批次遗留问题
8. 是否允许进入下一批

### Step 8. 自动进入下一批
- 本批次通过后自动进入下一批
- 若未通过，先在当前批次修正
- 修正后重新给出本批验收结果
- 通过后再进下一批
- 不要停下来等我逐批确认

---

# Phase 0：总览与批次执行图

## Batch A
### 页面范围
- `Home`
- `Why Different`
- `Tabs / Product Navigation`
- `Theme System`

### 真实基线
- `src\views\HomeView.jsx`
- `src\components\TabBar.jsx`
- `src\App.jsx`
- `src\components\ControlCenter.jsx`

### 目标
把当前入口系统升级成：
- 主舞台
- 导航壳层
- 主题系统面

建立整站的镜头、壳层、节奏和产品 OS 基准。

### 额外绑定
- 首页必须为后续 trainer / core 提供入口与镜头壳层
- 但不能提前吞进 trainer 细节
- `Why Different` 只是一幕认知镜头，不扩成独立说明页

---

## Batch B
### 页面范围
- `Intervals`
- `Notes → Fretboard Literacy`
- `Scales → Scale Systems`
- `Changes → Chords`

### 真实基线
- `src\trainers\IntervalsTrainer.jsx`
- `src\trainers\NotesTrainer.jsx`
- `src\trainers\ScalesTrainer.jsx`
- `src\trainers\ChangesTrainer.jsx`

### 目标
把四个 trainer 全部做成真实下一阶段产品页，而不是说明板。

### 额外绑定
本批必须同时满足 trainer 蓝图合同。
不能只凭主项目代码想象升级。

### 四边界铁律（必须进入实现，不得弱化）
- `Notes 练识字`
- `Intervals 练关系`
- `Scales 练系统`
- `Chords 练和声`

### Batch B 内部实施顺序（已修正，必须执行）
1. `Intervals` 先作为 trainer 旗舰壳层基准
2. `Scales` 第二个实现
3. `Notes` 第三个实现
4. `Chords` 最后实现

理由：
- `Scales` 最能验证 `Space + Flow` 是否真的成为训练逻辑而不是装饰
- `Notes` 必须先补 `Target Type` 维度再动 UI
- `Chords` 模式边界最复杂，最后收最稳

---

## Batch C
### 页面范围
- `Fretboard Core`
- `Audio Core`
- `Live Product`

### 真实基线
- `src\engine\FretboardModel.js`
- `src\engine\AudioCore.js`
- trainer 当前已有的 prompt / feedback / runtime 语法

### 目标
把 core 做成产品系统面，把 live 训练回合做成 trainer / core 交接后的真实运行时镜头。

### 额外绑定
本批必须同时满足 fretboard / audio 三份核心 MD 合同。
不能只凭当前 engine 文件做可视化包装。

### Batch C 实现链（必须按这个顺序组织）
1. `Audio Candidate Export`
2. `Position DNA / Position Likelihood`
3. `Topology / Graph / Resolver / Harmonic Targets`
4. `Semantic / Training Meaning`
5. `Live Product` 运行时落点

---

## Batch D
### 页面范围
- `Tuner / Calibration`
- `Persona / Onboarding`
- `Product Ecosystem`
- `Closing / Brand Closure`

### 真实基线
- `src\views\TunerView.jsx`
- `src\views\PreFlightView.jsx`
- `PersonaView`
- `OnboardingView`

### 目标
把 utility、identity、entry、ecosystem、closing 全部统一到同一产品 OS 语言里，完成闭环。

### 额外绑定
Batch D 必须继承 Batch C 的 core 语义，不允许重新滑回独立工具页或总结页。

---

# Phase 1：Batch A 闭环

## 1. 真实 repo 审计
- 当前 `HomeView` 已有 hero、bento、teaching、weakness / info feed 入口语法，但仍是内容组织页，不是产品主舞台
- 当前 `TabBar` 已有成熟胶囊导航与 active indicator，可保留底部悬浮产品导航交互语法
- 当前 `App.jsx` 已有 theme state、settings / calibration / tuning sheet 入口与 tab 切换逻辑，可保留全局系统壳层逻辑
- 当前 `ControlCenter` 已有 settings / theme / language / onboarding quick entry，可保留控制中心逻辑，不保留现视觉

## 2. 母本映射
- 页面定位：`Home Launch Surface`、`Tabs / Navigation Surface`、`Theme System Surface`
- Lens：`Monolith` 为首页主镜头，`Echo Pair` 用于 why-different 对照，`Collapse Handoff` 用于首页 → trainer 交接
- 2.1 豪华层：`Page Primitives Master`、`Stage Chrome Master`、`Typography Motion Master`
- retain：入口逻辑、tab 体系、theme state 概念、control center 信息分层
- retainLogicOnly：当前 home 信息栈、theme picker 表单布局
- continueLanguage：悬浮胶囊导航、分层 sheet / control center 语法
- continueInteraction：tab handoff、全局工具入口、主题切换属于系统层而非页面层
- refactor：把“卡片堆叠首页”改成“中轴主镜头 + 侧翼弱化面 + 主题系统面”
- add：home OS shell、stage chrome、hero hold、theme surface、why-different 一幕
- 禁止误实现：不能回到 dashboard、不能一页全铺、不能 explanation board

## 3. 批次实施计划
- 先改共享壳层：`StageBackdrop.jsx`、`PresentationChrome.jsx`、`App.jsx`
- 再拆调度器：`ProductSurfaces.jsx` 只保留 registry
- 然后新增 Batch A 页面组件：
  - `HomeLaunchSurface`
  - `WhyDifferentSurface`
  - `NavigationSurface`
  - `ThemeSystemSurface`
- 最后对齐 `product-scenes.js` 的 Batch A scene / step / 完成态
- 直接接入：
  - Motion shared layout / handoff
  - Magic UI 标题与副文案 reveal
  - shadcn tabs / button / badge / card / separator
- 不能碰：
  - 主项目代码
  - 母本文件
  - Batch B–D 页面组件

## 4. 代码实现目标
- 首页变成“中心主舞台 + 两侧延后出现的弱项 / 推荐 / 系统预告”，而不是信息板
- 导航独立成为真实 `Tabs / Navigation Surface`
- Theme 独立成为真实 `Theme System Surface`
- `Why Different` 只保留一幕，作为首页后的认知镜头，不扩成说明页

## 5. 构建与基础验证
- 执行 `npm run build`
- 检查 `App.jsx` scene navigation 仍支持点击空白区、空格、左右键，交互控件不误翻页
- 检查 Batch A 新接入组件实际渲染
- 检查 `product-scenes.js` scene id 与 surface registry 完整对齐

## 6. 母本一致性回查
- 首页是否仍为 `Monolith` 主镜头而非大板块
- Tabs / Theme 是否成为真实页面面，而不是附属说明区
- stage chrome 是否来自 2.1 壳层系统，而不是“深色 + glow”
- 入口逻辑是否仍能追溯到真实 repo 页面

## 7. 批次验收报告格式
- 处理范围：Home / Why Different / Tabs / Theme
- 实际修改文件：共享壳层、Batch A surfaces、scene 数据
- 外部接入：Motion + Magic UI + shadcn 在页面中的落点
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本一致性结果
- 遗留问题
- 是否进入 Batch B

## 8. 进入下一批条件
- 入口系统不再像 explanation demo
- 导航与主题已是产品层页面
- build 通过
- scene handoff 正常
- 通过后自动进入 Batch B

---

# Phase 2：Batch B 闭环

## 1. 真实 repo 审计
- `IntervalsTrainer` 是当前最成熟旗舰页，已有 L0-L3、viewport、top rail、editor / sheet 体系，适合作为 trainer 壳层基准
- `NotesTrainer` 当前逻辑最简单，主要保留“目标 + 指板 + reveal”基本训练语法
- `ScalesTrainer` 已有最丰富的控制逻辑和 blueprint bar，应保留较多系统逻辑，不保留现视觉拼装感
- `ChangesTrainer` 已有 progression、picker sheet、big now / next 焦点，是 Chords 升级的直接结构基线

## 2. 母本 + 蓝图合同映射
- 页面定位：
  - `Intervals Page`
  - `Fretboard Literacy Page`
  - `Scale Systems Page`
  - `Chords Page`
- Lens：
  - `Deep Surface` 为四个 trainer 主镜头
  - `Runtime Overlay` 用于 trainer 控制层
  - `Triptych` 用于 Intervals 的层级关系
- 2.1 豪华层：
  - trainer product surfaces
  - typography motion
  - motion handoff
  - page primitives

### retain
- Intervals 的 L0-L3 架构与运行时层级
- Scales 的 blueprint / control 逻辑
- Changes 的 progression / connect 逻辑
- Notes 的指板主舞台语法

### retainLogicOnly
- 旧 notes 单题布局
- 旧 changes 视觉堆叠
- 旧 scales 控件摆放

### continueLanguage
- 顶部 utility rail
- 底部状态条
- 局部 tabs / segmented controls
- 训练 prompt → feedback 连续流

### continueInteraction
- 题目切换
- 模式切换
- space / flow / sequence / connect 这类训练维度切换

### refactor
- 统一 trainer shell
- 让 Notes / Scales / Chords 成为真正页面本体
- 让 Intervals 继续作为旗舰统一语法页

### add
- shared trainer chrome
- 四页一致的 page hold states
- mode-led runtime surfaces

### 禁止误实现
- 不能用四宫格说明
- 不能把升级蓝图写成标签墙
- 不能把 Intervals 弱化成说明幕
- 不能让四个 trainer 模板平权化

## 3. Batch B 强制页面落地要求（必须进入实现）
### Intervals
- 继续以真实 `L0–L3` 为旗舰基座
- 不能被 Notes / Scales / Chords 的新模式挤掉产品主位
- 必须作为所有 trainer 共用壳层、runtime strip、focus card、stage rail 的旗舰基准

### Scales
- 必须给 `System` 主位
- 绝对不能把 `System` 塞回 L2
- `CAGED / 3NPS / Horizontal / Hybrid / Sequence / Target` 必须进入主页面结构
- 它必须成为最能验证“系统层 + 训练层”统一的页面

### Notes
- 核心是 `Note / Degree / Chord Tone / Position Literacy / String-set Literacy`
- 必须补齐 `Target Type / Display / Space / Challenge`
- `Notes` 的 L1 右下必须是 `Challenge`
- `Flow` 不能进主位
- Notes 练识字，不练平权化的 Space + Flow 双主位

### Chords
- 必须从 `Changes` 正式升格为 `Chords`
- 核心必须进入：
  - `Mode`
  - `Find Chord`
  - `Find Chord Tone`
  - `Connect`
  - `Progression`
  - `Function`
  - `Voice Leading`
- `Mode` 必须给主位
- `Flow` 不进主层
- 流动本体不是“Flow 标签”，而是 `progression + voice leading`

### 四边界铁律（再次锁死）
- Notes 练识字
- Intervals 练关系
- Scales 练系统
- Chords 练和声

## 4. 批次实施计划
- 先落共享 trainer 壳层与 primitives：top rail、mode rail、status strip、runtime shell
- 再按顺序实现：
  1. Intervals
  2. Scales
  3. Notes
  4. Chords
- 最后补 `product-scenes.js` 中 trainer scene 的 step 完成态与镜头顺序
- 直接接入：
  - shadcn tabs / segmented shell
  - Motion focus migration / shared layout
  - Magic UI 标题与 microcopy reveal
- 轻定制：
  - 颜色
  - 间距
  - 文案
  - chrome 边框
  - hold states
- 不能碰：
  - core pages
  - utility / ecosystem pages
  - 母本文件

## 5. 代码实现目标
- Intervals：从当前 L0-L3 长出更统一的旗舰页，保留真实控制层，不是静态概念板
- Notes：直接长成 `Note / Degree / Chord Tone / Position Literacy / String-set Literacy` 训练页，包含 `Target Type / Display / Space / Challenge`
- Scales：直接长成 `System / Pattern / Sequence / Connection / Target` 产品页，`CAGED / 3NPS / Horizontal / Hybrid` 进主位
- Chords：直接长成 `Find Chord / Find Chord Tone / Connect / Progression / Function / Voice Leading` 页面，保留 progression 与 voice leading 基线

## 6. 构建与基础验证
- 执行 `npm run build`
- 检查四个 trainer scene 的内部 tabs / controls 可操作且不会误触全局翻页
- 检查 Intervals / Notes / Scales / Chords 的 scene id 与 surface dispatch 对齐
- 检查外部接入的 tabs / panels / motion 实际落地在 trainer 页面
- 检查 Batch B 是否真实满足蓝图合同，而不是只满足视觉升级

## 7. 母本与硬合同一致性回查
- 四个 trainer 是否都从真实 trainer 基线长出，而不是新发明假产品
- Notes / Scales / Chords 是否已经是页面本体，不是 feature explanation
- Intervals 是否仍保持当前成熟基础的旗舰地位
- trainer shell 是否已经复用 2.1 page primitives 与 motion handoff
- 四边界铁律是否被真实体现在页面结构里
- `System / Challenge / Mode` 是否确实在对应页面占据正确主位

## 8. 批次验收报告格式
- 处理范围：Intervals / Notes / Scales / Chords
- 实际修改文件：trainer shell + 四个 batch-b 页面 + scenes 数据
- 外部接入：tabs、motion handoff、text motion、panel family
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本 / 蓝图一致性结果
- 遗留问题
- 是否进入 Batch C

## 9. 进入下一批条件
- 四个 trainer 都已成为真实下一代产品页
- Intervals 旗舰地位成立
- Scales 的 `System` 已进入主位
- Notes 的 `Challenge` 已进入正确位置
- Chords 的 `Mode` / `Progression` / `Voice Leading` 已进入主轴
- build 通过
- 通过后自动进入 Batch C

---

# Phase 3：Batch C 闭环

## 1. 真实 repo 审计
- `FretboardModel.js` 已有 candidate position / best position / tuning / correctness 语义，是 Fretboard Core 的逻辑基底
- `AudioCore.js` 已有 microphone / session / analyser 真实 pipeline，是 Audio Core 的逻辑基底
- trainer 当前已有实时 prompt / feedback 语法，可被合成为 `Live Product` 页

## 2. 母本 + 核心 MD 合同映射
- 页面定位：
  - `Fretboard Core Page`
  - `Audio Core Page`
  - `Live Product Surface`
- Lens：
  - `Deep Surface` 用于 core pages
  - `Runtime Overlay` 用于 live product
  - `Collapse Handoff` 用于 trainer → core → runtime 接力
- 2.1 豪华层：
  - stage chrome
  - motion / handoff
  - product surface modules
  - atmosphere / background depth

### retain
- 候选位置推理
- session / detect / stabilize / export 逻辑语义

### retainLogicOnly
- 当前 engine 的裸技术感
- 当前工具化表达

### continueLanguage
- grid / fretboard stage
- signal status
- runtime feedback chips

### continueInteraction
- 候选变化
- 排序变化
- 语义输出
- 训练状态切换

### refactor
- 把技术说明转成产品系统面
- 把 live page 做成真实运行时镜头

### add
- `Audio Candidate Export`
- `Position DNA`
- `Position Likelihood`
- `Topology / Graph / Resolver / Harmonic Targets`
- `Semantic / Training Meaning`
- training-aware output 的页面层

### 禁止误实现
- 不能做成工程海报
- 不能做成架构图墙
- 不能做成 tuner 附属说明
- 不能只展示 engine 名词，不把它们产品化

## 3. Batch C 强制内容合同（必须进入实现）
### Audio Core
必须真实表现：
- `Session`
- `Detection`
- `Signal State`
- `Pitch Stabilizer`
- `Candidate Export`
- `Semantic Output`

### Fretboard Core
必须真实表现：
- `Position DNA`
- `Position Likelihood`
- `Topology`
- `Graph`
- `Resolver`
- `Harmonic Targets`

### 候选层与语义层
- `Position DNA / Position Likelihood` 必须作为 Candidate Ranking 层进入 Batch C
- 不能省略 candidate ranking 的可视层
- 不能只保留静态文字解释

### Live Product
必须作为：
- trainer → core → runtime 的真实落点
- 不是独立说明页
- 不是摘要页
- 必须表现 prompt → input → resolution → feedback 的真实链路

## 4. 批次实施计划
- 先做 core shared modules：
  - signal cards
  - candidate ranking strip
  - semantic feedback panel
  - runtime overlay shell
- 再按顺序组织：
  1. Audio Candidate Export
  2. Position DNA / Position Likelihood
  3. Topology / Graph / Resolver / Harmonic Targets
  4. Semantic / Training Meaning
  5. Live Product
- 直接接入：
  - Motion shared handoff / runtime overlay
  - Magic UI microcopy reveal
  - shadcn card / badge / separator
- 轻定制：
  - grid / fretboard depth
  - candidate likelihood bars
  - semantic annotations
- 不能碰：
  - Batch A / B 主体页面结构
  - 只允许调用其既有 surface language

## 5. 代码实现目标
- Fretboard Core：展示 topology / candidate / likelihood / semantic meaning 的产品化核心页
- Audio Core：展示 session / detect / stabilize / candidate export / semantic feedback 的产品化核心页
- Live Product：展示一条完整 prompt → input → resolution → feedback 运行时链路，作为训练真实瞬间

## 6. 构建与基础验证
- 执行 `npm run build`
- 检查 core scene 的 step reveal 有明显 handoff，不是静态切图
- 检查 live scene 的 runtime overlay 与 core / trainer 共享元素不冲突
- 检查外部 motion 与 text / background 组件实际渲染
- 检查 Batch C 是否真实满足 core MD 合同，而不是只满足视觉包装

## 7. 母本与硬合同一致性回查
- core 是否已经产品化，不再是技术说明板
- live 是否已经从 trainer + core 组合长出，不是临时拼页
- candidate / semantic / feedback 是否真正进入页面本体
- 2.1 chrome 与 motion 是否完整落地，而不是摆样子
- `Position DNA / Position Likelihood / Candidate Export / Semantic Output` 是否确实落地

## 8. 批次验收报告格式
- 处理范围：Fretboard Core / Audio Core / Live Product
- 实际修改文件：batch-c surfaces、shared core modules、scene 数据
- 外部接入：runtime overlay、motion handoff、panel family、typography
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本 / 核心 MD 一致性结果
- 遗留问题
- 是否进入 Batch D

## 9. 进入下一批条件
- core 已经像真实系统面
- live 已有录屏级运行时镜头
- `Position DNA / Position Likelihood` 已进入 Candidate Ranking 层
- Audio Core 六项合同已进入页面本体
- build 通过
- 通过后自动进入 Batch D

---

# Phase 4：Batch D 闭环

## 1. 真实 repo 审计
- `TunerView` 已有专业调音视觉语法，可保留精密工具感受
- `PreFlightView` 已有 wizard / setup / permission 验证链，可保留可信 setup flow 逻辑
- `PersonaView`、`OnboardingView` 属于 identity / entry 系统，应该与 theme / tabs / tuner 同属产品 OS 层
- 当前 demo 的 ecosystem / closing 仍偏总结性，需要改成真实产品 OS 页面与收束镜头

## 2. 母本映射
- 页面定位：
  - `Tuner / Calibration Surface`
  - `Persona / Onboarding Surface`
  - `Product Ecosystem Surface`
  - `Closing / Brand Closure Surface`
- Lens：
  - `Echo Pair` 用于工具与身份双向对照
  - `Monolith` 用于 ecosystem / closing 收束
  - `Collapse Handoff` 用于 product OS 汇总
- 2.1 豪华层：
  - page primitives
  - stage chrome
  - typography motion
  - closing chrome

### retain
- tuner gauge
- calibration wizard 逻辑
- persona / entry 系统地位

### retainLogicOnly
- 当前工具页分散感
- 当前收束页总结口吻

### continueLanguage
- utility precision
- wizard stepper
- persona insight
- OS chrome

### continueInteraction
- 工具切换
- setup 流
- 人格 / 弱项 / 进度切换

### refactor
- 把 utility / persona / onboarding 统一成产品 OS
- 把 closing 变成收束镜头而不是 bullet list

### add
- ecosystem OS shell
- closing final hold state

### 禁止误实现
- 不能把 utility 当附属页
- 不能把 closing 做成 PPT 终页

## 3. 批次实施计划
- 先做 utility shared shell：
  - precision panel
  - wizard rail
  - identity strip
  - OS shell
- 再做 Tuner / Calibration
- 再做 Persona / Onboarding
- 再做 Ecosystem
- 最后做 Closing，收掉多余信息，只保留品牌与产品闭环
- 直接接入：
  - shadcn card / button / separator / dialog-or-sheet
  - Magic UI 标题 / closing 文案 motion
  - Motion closing handoff
- 不能碰：
  - 前 3 批主页面的核心结构
  - 只做调用与收束

## 4. 代码实现目标
- Tuner / Calibration：成为同一语法下的精密工具与可信 setup page
- Persona / Onboarding：成为 identity + first-run + weakness routing 的真实产品面
- Ecosystem：成为 trainer / core / utility / persona / theme / tabs 的产品 OS 页面
- Closing：成为“产品已经长出来”的最终镜头，不再是总结板

## 5. 构建与基础验证
- 执行 `npm run build`
- 检查 utility / persona / onboarding / ecosystem / closing 的 scene dispatch 完整
- 检查 closing 页面没有重新滑回说明板
- 检查前几批共享 chrome 未被破坏

## 6. 母本一致性回查
- utility / persona / onboarding 是否真正进入产品 OS 层
- ecosystem 是否已经是系统页，而不是 feature 累积
- closing 是否克制、收束、有 hold state
- 2.0 / 2.1 所要求的 page primitives / chrome / motion / typography 是否完整延续
- Batch D 是否继承了 Batch C 的 core 语义，而不是重新做成孤立工具页

## 7. 批次验收报告格式
- 处理范围：Tuner / Calibration / Persona / Onboarding / Ecosystem / Closing
- 实际修改文件：batch-d surfaces、shared utility / os modules、scene 数据
- 外部接入：closing motion、wizard shell、precision shell、OS chrome
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本一致性结果
- 遗留问题
- 是否进入总收口

## 8. 进入总收口条件
- utility / identity / ecosystem / closing 全部进入统一产品语法
- build 通过
- Batch D 没有与前 3 批语义断层
- 通过后输出总收口报告

---

# Phase 5：总收口报告

## 必须输出
### 1. 汇总所有批次实际修改文件与新增 surface / chrome 模块
必须只出现在：
`standalone-demo/launch/`

### 2. 总 build 结果与关键运行入口检查结果
必须明确：
- demo 是否可独立运行
- scene 是否可推进
- 入口是否正常
- 当前批次之间是否保持连续镜头感

### 3. 逐类标记页面状态
对每个页面或系统标记：
- `已达成 2.0 / 2.1`
- `部分完成`
- `遗留尾项`

### 4. 总结输入材料
按层说明：
- Current Product Foundation
- Upgrade Product Surfaces
- Core Engine Surfaces
- Ecosystem Layer

### 5. Scene list
列出每幕名称与目的

### 6. 外部原代码 / 官方组件 / 官方示例使用说明
必须明确：
- 哪些是直接接入
- 哪些是改造
- 哪些只是参考叙事方式

### 7. 如何运行
要让我能独立运行这个 demo 工程

## 尾项限制
只允许保留执行级增强尾项：
- `sceneDirectorCompletion` 下钻到 step 级
- `externalCodeImplementationSpecs` 下钻到文件 / 组件接线级
- 局部 timing / spacing / hold-state 微调

禁止把尾项重新表述成：
- 回头改母本
- 继续写体系
- 重新定义页面哲学

---

# Test Plan

## 每个 Batch 后必须执行
- 运行 `npm run build`
- 做 4 项入口自检：
  1. scene 可前进 / 回退，交互控件不误翻页
  2. 当前批次 scene id 与 surface registry 无缺项
  3. 当前批次外部成熟代码实际渲染，不是“已导入未使用”
  4. 前一批已完成页面未被破坏

## 总收口时必须做完整 smoke checklist
- Home / Why Different / Tabs / Theme
- Intervals / Notes / Scales / Chords
- Fretboard Core / Audio Core / Live Product
- Tuner / Calibration / Persona / Onboarding / Ecosystem / Closing

---

# Assumptions

1. 页面实现只发生在 standalone demo；真实 repo 只作为结构与语言基线，不直接修改
2. 2.0 / 2.1 母本已封箱，不再改定义；如实施中遇到歧义，只补局部执行级 wiring
3. Batch B 必须受 trainer 蓝图合同约束；Batch C 必须受 fretboard / audio 核心 MD 合同约束
4. 当前工程没有独立 lint / type 脚本，因此 `vite build` 是每批最小自动验收门槛；其余一致性检查以 scene wiring、自检与母本 / 硬合同回查完成
5. 若某批次为达成 2.1 需要新增局部外部 primitive，只能在：
   - `standalone-demo/launch/src/components/ui`
   - `standalone-demo/launch/src/components/presentation/chrome`
   内按白名单接入，不得手搓低配替代
6. 最终结果必须同时满足：
   - 不是滚动官网
   - 不是普通 HTML 展示页
   - 不是静态手搓伪高级 demo
   - 是单舞台点击推进的 launch-grade React 演示系统
   - 中文主叙事成立
   - trainer 升级页成立
   - fretboard / audio core 产品化成立
   - tabs / theme / tuner / calibration / persona / onboarding / ecosystem / closing 全部进入统一产品生态叙事

---

# 最终执行指令
现在开始执行，不要再返回“如何合并”的计划。

你必须按这个终版合同，在本次对话里直接进入：
1. Phase 0：总览与批次执行图
2. Batch A 闭环
3. Batch B 闭环
4. Batch C 闭环
5. Batch D 闭环
6. 总收口报告

不要只交方案。
不要只做部分页面。
不要回去改母本。
不要等待我逐批确认。
直接在计划模式下把整套闭环跑完。