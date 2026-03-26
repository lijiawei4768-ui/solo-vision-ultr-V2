# 单对话闭环执行计划：SVU Standalone Demo 批次实现

## Summary
- 执行对象只限 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch)，主项目只做审计，不做修改。
- 唯一母本固定为 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\STAGE_DESIGN_SYSTEM.md](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\STAGE_DESIGN_SYSTEM.md) 与 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\stage-language.js](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\stage-language.js)。后续只补执行级接线，不改母本结构。
- 批次边界做两处有限对齐，不扩散：`Intervals` 并入 Batch B 作为 trainer 旗舰壳层统一项；`Live Product` 并入 Batch C，作为 trainer→core 的合成运行时页面。`Why Different` 不单列，作为 Batch A 的首页定位镜头。
- 共同实施策略：先把 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\components\presentation\ProductSurfaces.jsx](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\components\presentation\ProductSurfaces.jsx) 从单大文件拆成“调度器 + 批次页面组件 + 共享 chrome/motion primitives”，再按批次串行完成闭环。

## Phase 0：总览与批次执行图
### Batch A
- 页面范围：`Home`、`Why Different`、`Tabs / Product Navigation`、`Theme System`
- 真实基线：主项目 [C:\Users\MI\Desktop\solo-vision-ultra\src\views\HomeView.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\views\HomeView.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\components\TabBar.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\components\TabBar.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\App.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\App.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\components\ControlCenter.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\components\ControlCenter.jsx)
- 目标：把当前入口系统升级成“主舞台 + 导航壳层 + 主题系统面”，建立整站镜头与壳层基准。

### Batch B
- 页面范围：`Intervals`、`Notes → Fretboard Literacy`、`Scales → Scale Systems`、`Changes → Chords`
- 真实基线：主项目四个 trainer 页面，尤其 [C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\IntervalsTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\IntervalsTrainer.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\NotesTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\NotesTrainer.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ScalesTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ScalesTrainer.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ChangesTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ChangesTrainer.jsx)
- 目标：把四个 trainer 都做成真实下一阶段产品页，不再是说明板。

### Batch C
- 页面范围：`Fretboard Core`、`Audio Core`、`Live Product`
- 真实基线：主项目 [C:\Users\MI\Desktop\solo-vision-ultra\src\engine\FretboardModel.js](C:\Users\MI\Desktop\solo-vision-ultra\src\engine\FretboardModel.js)、[C:\Users\MI\Desktop\solo-vision-ultra\src\engine\AudioCore.js](C:\Users\MI\Desktop\solo-vision-ultra\src\engine\AudioCore.js) 与 trainer 实时交互语法
- 目标：把 core 做成产品系统面，把 live 训练回合做成 trainer/core 交接后的真实运行时镜头。

### Batch D
- 页面范围：`Tuner / Calibration`、`Persona / Onboarding`、`Product Ecosystem`、`Closing`
- 真实基线：主项目 [C:\Users\MI\Desktop\solo-vision-ultra\src\views\TunerView.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\views\TunerView.jsx)、[C:\Users\MI\Desktop\solo-vision-ultra\src\views\PreFlightView.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\views\PreFlightView.jsx)、`PersonaView`、`OnboardingView`
- 目标：把 utility、identity、entry、ecosystem 和收束页统一到同一产品 OS 语言，完成闭环。

## 实施总规则
- 共享壳层先在 Batch A 落地：`StageBackdrop`、`PresentationChrome`、progress chrome、scene handoff、主/辅镜头容器、typography motion。
- 页面组件拆分方式固定：
  - `src/components/presentation/chrome/*`：共享 stage/page primitives
  - `src/components/presentation/surfaces/batch-a/*`
  - `src/components/presentation/surfaces/batch-b/*`
  - `src/components/presentation/surfaces/batch-c/*`
  - `src/components/presentation/surfaces/batch-d/*`
  - `ProductSurfaces.jsx` 仅保留 scene→surface 调度
- 共享数据层只改：
  - `src/data/product-scenes.js`：scene/step 与完成态对齐
  - 必要时补局部执行级 scene wiring constants；不改 `stage-language.js`
- 外部成熟实现只从 2.1 白名单直接接入并轻量品牌化：
  - Motion：`AnimatePresence`、`LayoutGroup`、shared layout/handoff、runtime overlay transitions
  - Magic UI：`TextAnimate`、`BlurFade`、`GridPattern`
  - shadcn/ui：`Tabs`、`Card`、`Badge`、`Button`、`Separator`，以及本批次确需的 `Dialog/Sheet` 骨架
- 所有批次都必须过 `npm run build`；当前工程没有 lint/type 脚本，因此构建成功 + import/scene wiring 自检就是最小自动验证基线。

## Phase 1：Batch A 闭环
### 1. 真实 repo 审计
- 当前 `HomeView` 已有 hero、bento、teaching、weakness/info feed 入口语法，但仍是内容组织页，不是产品主舞台。
- 当前 `TabBar` 已有成熟胶囊导航与 active indicator，可保留“底部悬浮产品导航”交互语法。
- 当前 `App.jsx` 已有 theme state、settings/calibration/tuning sheet 入口与 tab 切换逻辑，可保留“全局系统壳层”逻辑。
- 当前 `ControlCenter` 已有 settings/theme/language/onboarding quick entry，可保留控制中心逻辑，不保留现有视觉。

### 2. 母本映射
- 页面定位：`Home Launch Surface`、`Tabs / Navigation Surface`、`Theme System Surface`
- Lens：`Monolith` 为首页主镜头，`Echo Pair` 用于 why-different 对照，`Collapse Handoff` 用于首页→trainer 交接
- 2.1 豪华层：`Page Primitives Master`、`Stage Chrome Master`、`Typography Motion Master`
- retain：入口逻辑、tab 体系、theme state 概念、control center 信息分层
- retainLogicOnly：当前 home 信息栈、theme picker 表单布局
- continueLanguage：悬浮胶囊导航、分层 sheet/control center 语法
- continueInteraction：tab handoff、全局工具入口、主题切换属于系统层而非页面层
- refactor：把“卡片堆叠首页”改成“中轴主镜头 + 侧翼弱化面 + 主题系统面”
- add：home OS shell、stage chrome、hero hold、theme surface、why-different 场景
- 禁止误实现：不能回到 dashboard、不能一页全铺、不能解释型 board

### 3. 批次实施计划
- 先改共享壳层：`StageBackdrop.jsx`、`PresentationChrome.jsx`、`App.jsx`
- 再拆调度器：`ProductSurfaces.jsx` 只保留 registry
- 然后新增 Batch A 页面组件：`HomeLaunchSurface`、`WhyDifferentSurface`、`NavigationSurface`、`ThemeSystemSurface`
- 最后对齐 `product-scenes.js` 的 Batch A scene/step 完成态
- 直接接入：Motion shared layout/handoff、Magic UI 标题与副文案 reveal、shadcn tabs/button/badge/card/separator
- 不能碰：主项目代码、母本文件、Batch B–D 页面组件

### 4. 代码实现目标
- 首页变成“中心主舞台 + 两侧延后出现的弱项/推荐/系统预告”，而不是大面积信息板。
- 导航独立成为真实 `Tabs / Navigation Surface`，展示从当前 `TabBar` 升级出的产品导航系统。
- Theme 独立成为真实 `Theme System Surface`，展示 current theme axes 如何升级成下一代系统控制面。
- `Why Different` 只保留一幕，作为首页后的认知镜头，不单独扩成说明页。

### 5. 构建与基础验证
- 执行 `npm run build`
- 检查 `App.jsx` scene navigation 仍支持点击空白区、空格、左右键、交互控件不误翻页
- 检查 Batch A 新接入组件实际渲染，不出现“导入未使用”
- 检查 `product-scenes.js` scene id 与 surface registry 完整对齐

### 6. 母本一致性回查
- 首页是否仍为 `Monolith` 主镜头而非大板块
- Tabs/Theme 是否成为真实页面面，而不是附属说明区
- stage chrome 是否来自 2.1 壳层系统，而不是“深色 + glow”
- 入口逻辑是否仍能追溯到真实 repo 页面

### 7. 批次验收报告格式
- 处理范围：Home / Why Different / Tabs / Theme
- 实际修改文件：共享壳层、Batch A surfaces、scene 数据
- 外部接入：Motion + Magic UI + shadcn 在页面中的落点
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本一致性结果
- 遗留问题
- 是否进入 Batch B

### 8. 进入下一批条件
- 条件：入口系统不再像 explanation demo；导航与主题已是产品层页面；build 通过；scene handoff 正常
- 通过后自动进入 Batch B，不等待人工确认

## Phase 2：Batch B 闭环
### 1. 真实 repo 审计
- `IntervalsTrainer` 是当前最成熟旗舰页，已有 L0-L3、viewport、top rail、editor/sheet 体系，适合作为 trainer 壳层基准。
- `NotesTrainer` 当前逻辑最简单，主要保留“目标 + 指板 + reveal”基本训练语法。
- `ScalesTrainer` 已有最丰富的控制逻辑和 blueprint bar，应保留较多系统逻辑，不保留现视觉拼装感。
- `ChangesTrainer` 已有 progression、picker sheet、big now/next 焦点，是 Chords 升级的最直接结构基线。

### 2. 母本映射
- 页面定位：`Intervals Page`、`Fretboard Literacy Page`、`Scale Systems Page`、`Chords Page`
- Lens：`Deep Surface` 为三大升级页主镜头，`Runtime Overlay` 用于 trainer 控制层，`Triptych` 用于 Intervals 层级关系
- 2.1 豪华层：trainer product surfaces、typography motion、motion handoff、page primitives
- retain：Intervals 的 L0-L3 架构与运行时层级；Scales 的 blueprint/control 逻辑；Changes 的 progression/connect 逻辑；Notes 的指板主舞台语法
- retainLogicOnly：旧 notes 单题布局、旧 changes 视觉堆叠、旧 scales 控件摆放
- continueLanguage：顶部 utility rail、底部状态条、局部 tabs/segmented controls、训练 prompt→feedback 连续流
- continueInteraction：题目切换、模式切换、space/flow/sequence/connect 这类训练维度切换
- refactor：统一 trainer shell；让 Notes/Scales/Chords 成为真正页面本体；让 Intervals 变成旗舰统一语法页
- add：shared trainer chrome、四页一致的 page hold states、mode-led runtime surfaces
- 禁止误实现：不能用四宫格说明、不能把升级蓝图写成标签墙、不能把 Intervals 弱化成说明幕

### 3. 批次实施计划
- 先落共享 trainer 壳层与 primitives：top rail、mode rail、status strip、runtime shell
- 再改 Intervals，作为 trainer 旗舰基准页
- 然后依次做 Notes、Scales、Chords，确保三者共用同一壳层和 handoff 语法
- 最后补 `product-scenes.js` 中 trainer scene 的 step 完成态与镜头顺序
- 直接接入：shadcn tabs/segmented shell、Motion focus migration/shared layout、Magic UI 标题与 microcopy reveal
- 轻定制：颜色、间距、文案、chrome 边框、hold states
- 不能碰：core pages、utility/ecosystem pages、母本文件

### 4. 代码实现目标
- Intervals：从当前 L0-L3 长出更统一的旗舰页，保留真实控制层，不再只是当前 demo 的静态概念板。
- Notes：直接长成 `Note / Degree / Chord Tone / Pressure` 真实训练页，包含 `Target Type / Display / Space / Challenge`。
- Scales：直接长成 `System / Pattern / Sequence / Connection / Target` 产品页，`CAGED / 3NPS / Horizontal / Hybrid` 进主位。
- Chords：直接长成 `Find Chord / Chord Tone / Connect / Progression / Function` 页面，保留 progression 与 voice leading 基线。

### 5. 构建与基础验证
- 执行 `npm run build`
- 检查四个 trainer scene 的内部 tabs/controls 可操作且不会误触全局翻页
- 检查 Intervals/Notes/Scales/Chords 的 scene id 与 surface dispatch 对齐
- 检查外部接入的 tabs/panels/motion 实际落地在 trainer 页面

### 6. 母本一致性回查
- 四个 trainer 是否都从真实 trainer 基线长出，而不是新发明假产品
- Notes/Scales/Chords 是否已是页面本体，不是 feature explanation
- Intervals 是否仍保持当前成熟基础的旗舰地位
- trainer shell 是否已经复用 2.1 page primitives 与 motion handoff

### 7. 批次验收报告格式
- 处理范围：Intervals / Notes / Scales / Chords
- 实际修改文件：trainer shell + 四个 batch-b 页面 + scenes 数据
- 外部接入：tabs、motion handoff、text motion、panel family
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本一致性结果
- 遗留问题
- 是否进入 Batch C

### 8. 进入下一批条件
- 条件：四个 trainer 都已成为真实下一代产品页；Intervals 旗舰地位成立；build 通过
- 通过后自动进入 Batch C

## Phase 3：Batch C 闭环
### 1. 真实 repo 审计
- `FretboardModel.js` 已有 candidate position / best position / tuning / correctness 语义，是 Fretboard Core 的逻辑基底。
- `AudioCore.js` 已有 microphone/session/analyser 真实 pipeline，是 Audio Core 的逻辑基底。
- trainer 当前已有实时 prompt/feedback 语法，可被合成为 `Live Product` 页。

### 2. 母本映射
- 页面定位：`Fretboard Core Page`、`Audio Core Page`、`Live Product Surface`
- Lens：`Deep Surface` 用于 core pages，`Runtime Overlay` 用于 live product，`Collapse Handoff` 用于 trainer→core→runtime 接力
- 2.1 豪华层：stage chrome、motion/handoff、product surface modules、atmosphere/background depth
- retain：候选位置推理、session/detect/stabilize/export 逻辑语义
- retainLogicOnly：当前 engine 的裸技术感与工具化表达
- continueLanguage：grid/fretboard stage、signal status、runtime feedback chips
- continueInteraction：候选变化、排序变化、语义输出、训练状态切换
- refactor：把技术说明转成产品系统面；把 live page 做成真实运行时镜头
- add：Position DNA / likelihood / semantic bridge / training-aware output 的页面层
- 禁止误实现：不能做成工程海报、不能做成架构图墙、不能做成 tuner 附属说明

### 3. 批次实施计划
- 先做 core shared modules：signal cards、candidate ranking strip、semantic feedback panel、runtime overlay shell
- 再做 Fretboard Core
- 再做 Audio Core
- 最后做 Live Product，把 Batch B trainer 页面与 core 输出组合成 runtime 镜头
- 直接接入：Motion shared handoff/runtime overlay、Magic UI microcopy reveal、shadcn card/badge/separator
- 轻定制：grid/fretboard depth、candidate likelihood bars、semantic annotations
- 不能碰：Batch A/B 主体页面结构，只允许调用其既有 surface language

### 4. 代码实现目标
- Fretboard Core：展示 topology / candidate / likelihood / semantic meaning 的产品化核心页。
- Audio Core：展示 session / detect / stabilize / candidate export / semantic feedback 的产品化核心页。
- Live Product：展示一条完整 prompt→input→resolution→feedback 运行时链路，作为训练真实瞬间，而不是单独说明页。

### 5. 构建与基础验证
- 执行 `npm run build`
- 检查 core scene 的 step reveal 有明显 handoff，不是静态切图
- 检查 live scene 的 runtime overlay 与 core/trainer 共享元素不冲突
- 检查外部 motion 与 text/background 组件实际渲染

### 6. 母本一致性回查
- core 是否已经产品化，不再是技术说明板
- live 是否已经从 trainer + core 组合长出，不是临时拼页
- candidate / semantic / feedback 是否真正进入页面本体
- 2.1 chrome 与 motion 是否完整落地，而不是摆样子

### 7. 批次验收报告格式
- 处理范围：Fretboard Core / Audio Core / Live Product
- 实际修改文件：batch-c surfaces、shared core modules、scene 数据
- 外部接入：runtime overlay、motion handoff、panel family、typography
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本一致性结果
- 遗留问题
- 是否进入 Batch D

### 8. 进入下一批条件
- 条件：core 已经像真实系统面；live 已有录屏级运行时镜头；build 通过
- 通过后自动进入 Batch D

## Phase 4：Batch D 闭环
### 1. 真实 repo 审计
- `TunerView` 已有专业调音视觉语法，可保留“精密工具”感受。
- `PreFlightView` 已有 wizard/setup/permission 验证链，可保留“可信 setup flow”逻辑。
- `PersonaView`、`OnboardingView` 属于 identity/entry 系统，应该与 theme/tabs/tuner 同属产品 OS 层。
- 当前 demo 的 ecosystem/closing 仍偏总结性，需要改成真实产品 OS 页面与收束镜头。

### 2. 母本映射
- 页面定位：`Tuner / Calibration Surface`、`Persona / Onboarding Surface`、`Product Ecosystem Surface`、`Closing / Brand Closure Surface`
- Lens：`Echo Pair` 用于工具与身份双向对照，`Monolith` 用于 ecosystem/closing 收束，`Collapse Handoff` 用于 product OS 汇总
- 2.1 豪华层：page primitives、stage chrome、typography motion、closing chrome
- retain：tuner gauge、calibration wizard 逻辑、persona/entry 系统地位
- retainLogicOnly：当前工具页分散感、当前收束页总结口吻
- continueLanguage：utility precision、wizard stepper、persona insight、OS chrome
- continueInteraction：工具切换、setup 流、人格/弱项/进度切换
- refactor：把 utility/persona/onboarding 统一成产品 OS；把 closing 变成收束镜头而不是 bullet list
- add：ecosystem OS shell、closing final hold state
- 禁止误实现：不能把 utility 当附属页，不能把 closing 做成 PPT 终页

### 3. 批次实施计划
- 先做 utility shared shell：precision panel、wizard rail、identity strip、OS shell
- 再做 Tuner/Calibration
- 再做 Persona/Onboarding
- 再做 Ecosystem
- 最后做 Closing，收掉多余信息，只保留品牌与产品闭环
- 直接接入：shadcn card/button/separator/dialog-or-sheet 骨架、Magic UI 标题/closing 文案 motion、Motion closing handoff
- 不能碰：前 3 批主页面的核心结构，只做调用与收束

### 4. 代码实现目标
- Tuner/Calibration：成为同一语法下的精密工具与可信 setup page。
- Persona/Onboarding：成为 identity + first-run + weakness routing 的真实产品面。
- Ecosystem：成为 trainer/core/utility/persona/theme/tabs 的产品 OS 页面。
- Closing：成为“产品已经长出来”的最终镜头，不再是总结板。

### 5. 构建与基础验证
- 执行 `npm run build`
- 检查 utility/persona/onboarding/ecosystem/closing 的 scene dispatch 完整
- 检查 closing 页面没有重新滑回说明板
- 检查前几批共享 chrome 未被破坏

### 6. 母本一致性回查
- utility/persona/onboarding 是否真正进入产品 OS 层
- ecosystem 是否已经是系统页，而不是 feature 累积
- closing 是否克制、收束、有 hold state
- 2.0/2.1 所要求的 page primitives / chrome / motion / typography 是否完整延续

### 7. 批次验收报告格式
- 处理范围：Tuner / Calibration / Persona / Onboarding / Ecosystem / Closing
- 实际修改文件：batch-d surfaces、shared utility/os modules、scene 数据
- 外部接入：closing motion、wizard shell、precision shell、OS chrome
- retain / retainLogicOnly / refactor / add 结果
- build 结果
- 母本一致性结果
- 遗留问题
- 是否进入总收口

### 8. 进入总收口条件
- 条件：utility/identity/ecosystem/closing 全部进入统一产品语法；build 通过
- 通过后输出总收口报告

## Phase 5：总收口报告
- 汇总所有批次实际修改文件与新增 surface/chrome 模块
- 给出总 build 结果与关键运行入口检查结果
- 逐类标记页面状态：`已达成 2.0/2.1`、`部分完成`、`遗留尾项`
- 明确尾项只允许是执行级增强：
  - sceneDirectorCompletion 下钻到 step 级
  - externalCodeImplementationSpecs 下钻到文件/组件接线级
  - 局部 timing/spacing/hold-state 微调
- 不允许把尾项重新表述成“回头改母本”或“继续写体系”

## Test Plan
- 每个 Batch 后执行 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\package.json](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\package.json) 中的 `npm run build`
- 每个 Batch 后做 4 项入口自检：
  - scene 可前进/回退，交互控件不误翻页
  - 当前批次 scene id 与 surface registry 无缺项
  - 当前批次外部成熟代码实际渲染，不是“已导入未使用”
  - 前一批已完成页面未被破坏
- 总收口时做完整 smoke checklist：
  - Home / Why Different / Tabs / Theme
  - Intervals / Notes / Scales / Chords
  - Fretboard Core / Audio Core / Live Product
  - Tuner / Calibration / Persona / Onboarding / Ecosystem / Closing

## Assumptions
- 页面实现继续发生在 standalone demo；真实 repo 只作为结构与语言基线，不直接修改。
- 母本 2.0 / 2.1 封箱，不再改定义；如实施中遇到歧义，只补局部执行级 wiring。
- 当前工程没有 lint/type 单独脚本，因此 `vite build` 是每批最小自动验收门槛；其余一致性检查以 scene wiring、自检与母本回查完成。
- 若某批次为达成 2.1 需要新增局部外部 primitive，只能在 `standalone-demo/launch/src/components/ui` 或 `.../presentation/chrome` 内按白名单接入，不得手搓低配替代。


# 执行计划修正版：把 `standalone-demo/docx` 作为 Batch B/C 的硬输入并绑定到实现

## Summary
- 后续执行基线不是只有 2.0/2.1 母本和真实 repo，还必须再加一层硬输入：`C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx`
- 我已经完成定向审计，确认这里面真正会约束实现的核心文件是：
  - `solo_vision_ultra_trainer_blueprint_v2.html`
  - `trainer_refactor_blueprint.html`
  - `SVU_Fretboard_Audio_Core_Ultimate_Master.md`
  - `SVU_Fretboard_Audio_Core_Execution_Contract_Final.md`
  - `SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md`
  - `gpt帮我制定的所有提示词和本意，目标.txt`
- 后续不重写母本，但所有页面实现必须同时满足三层：
  - 封箱母本：`STAGE_DESIGN_SYSTEM.md` + `src/data/stage-language.js`
  - 真实 repo 页面与结构
  - `docx` 里的 trainer/core/audio 升级合同

## 新的执行约束
- Batch B 必须以 trainer 蓝图为硬合同，不能只凭主项目代码“升级想象”。
- Batch C 必须以三份 Fretboard/Audio MD 为硬合同，不能只凭当前 engine 文件做可视化包装。
- `docx` 中写死的边界必须进入实现，不得弱化：
  - 四边界铁律：`Notes 练识字 / Intervals 练关系 / Scales 练系统 / Chords 练和声`
  - `Scales` 必须给 `System` 主位，不得塞回 L2
  - `Notes` 的 L1 右下必须是 `Challenge`，`Flow` 不能进主位
  - `Chords` 必须给 `Mode` 主位，`Flow` 不进主层，流动本体是 `progression + voice leading`
  - `Position DNA / Position Likelihood` 必须作为 Candidate Ranking 层进入 Batch C
  - `Audio Core` 必须表现 `Session / Detection / Signal State / Pitch Stabilizer / Candidate Export / Semantic Output`

## Batch 边界与顺序修正
### Batch A
- 范围不变：`Home`、`Tabs / Navigation`、`Theme System`
- 额外绑定：首页必须为后续 trainer/core 提供入口与镜头壳层，但不提前吞入 trainer 细节

### Batch B
- 页面范围维持：`Intervals`、`Notes`、`Scales`、`Chords`
- 但内部实施顺序改为：
  1. `Intervals` 先作为 trainer 旗舰壳层基准
  2. `Scales` 第二个实现
  3. `Notes` 第三个实现
  4. `Chords` 最后实现
- 这样做的理由来自蓝图原文：
  - `Scales` 是最能验证 `Space + Flow` 成为训练逻辑而非装饰的页面
  - `Notes` 必须先补 `Target Type` 维度再动 UI
  - `Chords` 模式边界最复杂，应该在前两者跑通后最后收

### Batch C
- 页面范围维持：`Fretboard Core`、`Audio Core`、`Live Product`
- 但实现时必须按这条链组织：
  1. `Audio Candidate Export`
  2. `Position DNA / Position Likelihood`
  3. `Topology / Graph / Resolver / Harmonic Targets`
  4. `Semantic / Training Meaning`
  5. `Live Product` 运行时落点

### Batch D
- 范围不变：`Tuner / Calibration`、`Persona / Onboarding`、`Product Ecosystem`、`Closing`
- 但必须继承 Batch C 的 core 语义，而不是重新做独立工具页

## Batch B：强制页面落地要求
### Intervals
- 继续以真实 `L0–L3` 为旗舰基座
- 不能被 Notes/Scales/Chords 的新模式挤掉产品主位
- 必须作为所有 trainer 共用壳层、runtime strip、focus card、stage rail 的标准页

### Notes → Fretboard Literacy
- 必须直接落成 4 modes：
  - `Note`
  - `Degree`
  - `Chord Tone`
  - `Pressure`
- 必须直接落成 L0/L1/L2 结构：
  - L0：`NotesFocusCard`、`ModeCapsules`、`BottomQuickStatusBar`、`FretboardStageCard`
  - L1：`Target Type / Display / Space / Challenge`
  - L2：至少体现 `TargetTypeEditorL2`、`DisplayEditorL2`
- 明确禁止：
  - 把 `Flow` 放回 Notes L1 主位
  - 只做“找音名”的旧版单模式 Notes 页

### Scales → Scale Systems
- 必须直接落成 5 modes：
  - `Pattern`
  - `System`
  - `Sequence`
  - `Connection`
  - `Target Tone`
- 必须直接体现 4 个系统面：
  - `CAGED`
  - `3NPS`
  - `Horizontal`
  - `Phrase Cells / Hybrid`
- L1 必须体现：
  - `System`
  - `Sequence`
  - `Space + Flow` 双轴
- L2 必须可视化承接：
  - `SystemEditorL2`
  - `SequenceEditorL2`
  - `SpaceFlowEditorL2`
  - `TargetToneEditorL2`
- 明确禁止：
  - 把 `System` 藏进 L2
  - 只把 CAGED/3NPS 做成标签或 badge

### Changes → Chords
- 必须直接落成 5 modes：
  - `Find Chord`
  - `Chord Tone`
  - `Connect`
  - `Progression`
  - `Function`
- 必须保留并升级：
  - `MiniProgressionStrip`
  - `computeVoiceLead` 对应的 voice-leading 语义
  - `Now / Next` 双焦点结构
- 必须体现：
  - progression navigation
  - guide tones
  - common tones
  - harmonic function
- 明确禁止：
  - 把 Chords 做回旧 Changes 换皮
  - 用 `Flow` 冒充 progression / voice leading

## Batch C：强制页面落地要求
### Fretboard Core
- 必须按三份 MD 的共同约束落成：
  - `Topology`
  - `Graph`
  - `Interval Geometry`
  - `Harmonic Targets`
  - `Resolver`
  - `Analysis Bridge`
- 页面里必须让观众看到：
  - 同音异位不是同一位置
  - graph-based musical space
  - resolver 如何把训练目标翻译成允许答案集合

### Audio Core
- 必须按合同落成 6 段：
  - `Audio Session Manager`
  - `Pitch Detection Layer`
  - `Signal State Layer`
  - `Pitch Stabilizer`
  - `Calibration / Device Profile Bridge`
  - `Audio Candidate Export Layer`
- 页面里必须明确区分：
  - `Pitch correct`
  - `Position likely correct`
  - `Functional target correct`
  - `Training semantic correct`

### Position DNA / Position Likelihood
- 必须作为 Batch C 页面内的独立语义层出现，不得只做一句文案
- 最少要直接可视化：
  - `candidates`
  - `likelihood`
  - `bestCandidate`
  - `needsMoreFrames`
  - `confidenceBand`
- 其角色是：
  - `Audio Candidate → Candidate Position Ranking`
  - 不是“猜一个位置”，而是“同音异位下的位置候选排序系统”

### Live Product
- 必须直接把 trainer + audio + fretboard 三者合在一个运行时镜头里
- 不再是概念页
- 至少体现：
  - prompt
  - live input
  - candidate export
  - position ranking
  - semantic coach output

## 实施级文件约束
- 后续实现仍只允许改 `standalone-demo/launch/`
- 但 Batch B/C 的代码结构要新增一层“文档绑定常量/执行级接线”：
  - trainer page 内明确标注 mode sets、L1/L2 控制面、禁止项
  - core page 内明确标注 Audio pipeline、Position DNA、Resolver 输出
- 这层只属于执行接线，不属于改母本

## 验收新增项
- Batch B 验收必须逐页对照 trainer blueprint：
  - 是否按 modes 真落地
  - 是否按 L1/L2 真落位
  - 是否遵守边界铁律
- Batch C 验收必须逐页对照三份 core/audio MD：
  - 是否出现 Position DNA
  - 是否出现 Candidate Ranking
  - 是否区分 pitch / position / semantic 三层真值
  - 是否体现 Audio Candidate Export → Resolver → Training Meaning

## Assumptions
- `docx` 目录中，trainer 蓝图与三份 core/audio MD 为最高优先的实现合同；`txt` 继续作为总意图约束。
- 那个“Claude 第一版交付”文件不作为实现依据；当前已确认最重要的是 trainer、fretboard、audio 这几份。
- 下一次进入正式执行时，不会再把 Batch B/C 当作普通页面美化，而是按这些文件直接长成真实页面与系统面。


# 单对话闭环执行终版工作流

## 总则
- 执行对象只限 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch)。
- 主项目只做审计，不做修改。真实 repo 仅作为结构、行为、视觉语言和产品边界的基线来源。
- 唯一封箱母本是：
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\STAGE_DESIGN_SYSTEM.md](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\STAGE_DESIGN_SYSTEM.md)
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\stage-language.js](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\stage-language.js)
- 2.0 执行母本已封箱，2.1 豪华执行底座已封箱。后续不允许重写母本，不允许回头改体系定义，只允许补当前批次的执行级接线说明。
- Batch B 与 Batch C 额外受 `docx` 执行输入约束，但这些文档只能强化对应批次的实现边界，不能改写 2.0/2.1 母本：
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\solo_vision_ultra_trainer_blueprint_v2.html](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\solo_vision_ultra_trainer_blueprint_v2.html)
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\trainer_refactor_blueprint.html](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\trainer_refactor_blueprint.html)
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SVU_Fretboard_Audio_Core_Ultimate_Master.md](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SVU_Fretboard_Audio_Core_Ultimate_Master.md)
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SVU_Fretboard_Audio_Core_Execution_Contract_Final.md](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SVU_Fretboard_Audio_Core_Execution_Contract_Final.md)
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md)
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\gpt帮我制定的所有提示词和本意，目标.txt](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\docx\gpt帮我制定的所有提示词和本意，目标.txt)
- 本次执行采用页面簇单批次闭环执行制：一次处理一个页面簇；当前页面簇未通过前不得进入下一簇；但在同一次对话内必须自动串行推进到全部批次完成。
- 所有页面必须绑定真实 repo 页面和真实结构，不得漂移成 explanation demo，不得脱离真实产品长出一套假界面。
- 所有实现必须服从 2.1 豪华执行底座：
  - `Page Primitives Master`
  - `Stage Chrome Master`
  - `Typography Motion Master`
  - `Motion / Handoff Master`
  - `External Source Catalog`
- 外部成熟实现必须优先直接接入并轻量品牌化改造，不允许手搓低配替代：
  - Motion：`AnimatePresence`、`LayoutGroup`、shared layout/handoff、runtime overlay transitions
  - Magic UI：`TextAnimate`、`BlurFade`、`GridPattern`
  - shadcn/ui：`Tabs`、`Card`、`Badge`、`Button`、`Separator`，以及本批次确需的 `Dialog/Sheet` 骨架
- 所有高级感必须克制、系统、厚重、真实，不能回到普通深色官网、AI 官网、dashboard、card wall、说明板、廉价 glow、廉价 glass、廉价 blob。

## 禁止事项
- 不允许重写母本。
- 不允许回头改体系定义。
- 不允许把任务转回“继续补哲学”。
- 不允许漂移成 explanation demo。
- 不允许脱离真实 repo 页面与真实结构另做假界面。
- 不允许一口气无控制并行改整站。
- 不允许只给思路不落地。
- 不允许只改视觉而不对真实结构负责。
- 不允许手搓低配版替代白名单成熟实现。
- 不允许跳过 build / 自检 / 母本回查就宣布完成。
- 不允许把“计划、导入、占位”说成“已完成”。

## 共享执行架构
- 共享壳层必须先落地，再分批推进页面层。
- 独立 demo 内部结构固定为：
  - 共享壳层与 page primitives
  - scene → surface 调度器
  - 按批次拆分的页面组件
  - 当前批次需要的执行级接线常量
- 页面组件拆分原则：
  - `src/components/presentation/chrome/*`：共享 stage/page primitives
  - `src/components/presentation/surfaces/batch-a/*`
  - `src/components/presentation/surfaces/batch-b/*`
  - `src/components/presentation/surfaces/batch-c/*`
  - `src/components/presentation/surfaces/batch-d/*`
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\components\presentation\ProductSurfaces.jsx](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\components\presentation\ProductSurfaces.jsx) 只保留 scene → surface 调度
- 数据层只允许改：
  - [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\product-scenes.js](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\src\data\product-scenes.js)
  - 当前批次必要的执行级 wiring constants
- 不允许改：
  - 封箱母本
  - 主项目文件
  - 与当前批次无关的页面

## 页面簇与执行顺序
### Batch A
- `Home`
- `Why Different`
- `Tabs / Product Navigation`
- `Theme System`

### Batch B
- `Intervals`
- `Scales → Scale Systems`
- `Notes → Fretboard Literacy`
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

## 每一批次必须严格走完的 8 步
### Step 1. 真实 repo 审计
- 审计当前批次相关页面在真实 repo 中的：
  - 页面入口
  - 路由 / 页面挂载位置
  - 真实组件树
  - 共享壳层依赖
  - 当前结构状态
  - 当前视觉状态
  - 当前行为状态
  - 与母本冲突点
  - 与相邻页面簇的耦合点
- 审计输出只写真实存在的内容，不允许臆测。
- 必须明确区分：
  - 当前代码已有
  - 母本要求但当前没有
  - `docx`/蓝图/MD 强制要求补入

### Step 2. 母本映射
- 当前批次逐页对照 2.0 / 2.1 母本与对应 `docx` 执行合同。
- 每页必须输出：
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
- Batch B / C 还必须额外写明：
  - 对应蓝图或 MD 的哪一条结构级合同正在生效
  - 哪些边界是硬约束，不得弱化

### Step 3. 批次实施计划
- 在不写代码前，必须明确：
  - 先改哪些文件
  - 后改哪些文件
  - 哪些属于壳层
  - 哪些属于页面层
  - 哪些属于组件层
  - 哪些外部成熟代码直接接入
  - 哪些只做轻定制
  - 哪些不能碰
  - 风险点
  - 预期完成后页面会变成什么状态
- 计划必须细到文件级与页面状态级，不能是空泛顺序。

### Step 4. 代码实现
- 只改当前批次相关文件。
- 不得顺手扩散重构无关页面。
- 不得偷偷改母本。
- 不得为了省事降低质感要求。
- 优先直接接成熟实现，不允许低配手搓替代。
- 必须绑定真实 repo 页面和真实结构。
- 如果实现中仍有歧义，只允许补当前批次执行级接线说明，不允许回退成改体系定义。

### Step 5. 构建与基础验证
- 每一批实现后，至少执行：
  - `npm run build`
  - import / scene wiring / compile 错误检查
  - 页面入口是否仍可运行
  - 当前批次关键依赖是否断裂
  - 外部接入是否真正落入页面，而不是只是导入未使用
- 不得只说“理论上可行”。

### Step 6. 母本一致性回查
- 每批实现后必须回查是否仍符合：
  - 2.0 执行母本
  - 2.1 豪华执行底座
  - 当前批次对应的 `docx` 执行合同
- 重点检查：
  - 是否漂移成 explanation demo
  - 是否退回普通网页风
  - 是否偷换成低配实现
  - 是否破坏真实页面结构
  - 是否少接了应接入的成熟代码
  - 是否把豪华系统降成几个代表项摆样子

### Step 7. 批次验收报告
- 每批结束后必须固定输出：
  1. 本批次处理范围
  2. 实际修改文件列表
  3. 实际接入的外部成熟代码
  4. retain / retainLogicOnly / refactor / add 落地结果
  5. build / 校验结果
  6. 与母本一致性结果
  7. 与 `docx` 执行合同一致性结果
  8. 当前批次遗留问题
  9. 是否允许进入下一批
- 必须诚实区分：
  - 已完成
  - 部分完成
  - 未完成
  - 风险项
  - 下一步处理动作

### Step 8. 进入下一批
- 当前批次通过后自动进入下一批。
- 当前批次未通过，必须先在本批内修正，再重新给出验收报告。
- 本次对话必须自行完成：
  - 审计
  - 映射
  - 计划
  - 实现
  - 验证
  - 汇报
  - 下一批
  - 直到全部批次完成

## Phase 0：总览与批次执行图
- 先识别 4 个批次及页面范围。
- 明确本次对话将按 Batch A → B → C → D 串行闭环完成。
- Batch A 负责先把整站入口系统、共享壳层、镜头基准、主导航与主题系统落定。
- Batch B 负责 trainer 主体页，且受 trainer blueprint 强约束。
- Batch C 负责 core systems 与 live runtime，且受 fretboard/audio 三份 MD 强约束。
- Batch D 负责 utility、identity、ecosystem 与收束页。
- 任何批次边界微调必须只为减少耦合，不得扩散并行。

## Phase 1：Batch A 闭环
### Step 1. 真实 repo 审计目标
- 审计：
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\views\HomeView.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\views\HomeView.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\components\TabBar.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\components\TabBar.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\App.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\App.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\components\ControlCenter.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\components\ControlCenter.jsx)
- 必须确认：
  - Home 当前是内容/入口结构，不是主舞台
  - TabBar 已有成熟胶囊导航语法
  - theme state、settings、control center 已有全局系统壳层逻辑
  - 当前 home / tab / theme 的冲突点是什么

### Step 2. 母本映射要求
- 页面定位：
  - `Home Launch Surface`
  - `Why Different`
  - `Tabs / Product Navigation Surface`
  - `Theme System Surface`
- 对应 lens：
  - `Monolith`：首页主镜头
  - `Echo Pair`：Why Different 对照
  - `Collapse Handoff`：首页 → trainer 交接
- 2.1 豪华层必须直接绑定：
  - Page primitives
  - Stage chrome
  - Typography motion
  - Motion handoff
- retain：
  - 入口逻辑
  - tab 体系
  - theme state 概念
  - control center 信息分层
- retainLogicOnly：
  - 当前 home 信息堆叠布局
  - theme picker 表单布局
- refactor：
  - 入口页从内容页改为主舞台
  - 导航从附属栏升级为产品 OS chrome
  - theme 从设置项升级为 Theme System 页面
- add：
  - Home OS shell
  - Why Different 镜头
  - Navigation Surface
  - Theme Surface

### Step 3. 批次实施顺序
1. 先改共享壳层：
   - `StageBackdrop`
   - `PresentationChrome`
   - `App.jsx`
2. 再拆调度器：
   - `ProductSurfaces.jsx` 只保留 registry
3. 再建 Batch A 页面组件：
   - `HomeLaunchSurface`
   - `WhyDifferentSurface`
   - `NavigationSurface`
   - `ThemeSystemSurface`
4. 最后对齐 `product-scenes.js` 的 Batch A scene/step 完成态

### Step 4. 页面落地要求
- 首页必须是中轴主镜头，不是大板块说明板。
- 两侧信息必须延后出现，不能一拍全亮。
- 导航必须成为独立页面面，而不是 header 饰品。
- Theme System 必须成为产品层页面，不是设置弹层截图。
- Why Different 只保留必要镜头，不扩成文案墙。

### Step 5. 构建与基础验证
- `npm run build`
- 全局点击推进、空格推进、左右键切换仍正常
- 页面内部控件不误触全局翻页
- Batch A scene id 与 surface registry 对齐
- 外部成熟代码在页面里实际落地

### Step 6. 母本一致性回查
- 首页是否仍是 `Monolith`
- Tabs / Theme 是否已成为真实页面
- stage chrome 是否来自 2.1 而非普通深色 glow
- 页面是否仍追溯到真实 repo 入口逻辑

### Step 7. 批次验收报告
- 范围：Home / Why Different / Tabs / Theme
- 文件、外部接入、retain/refactor/add、build 结果、母本一致性、遗留项、是否进入 Batch B

### Step 8. 进入下一批条件
- 首页、导航、主题系统已成立为产品层页面
- 入口系统不再像 explanation demo
- build 通过
- 通过后自动进入 Batch B

## Phase 2：Batch B 闭环
### Batch B 的额外生效合同
- 本批次除 2.0/2.1 外，必须同时服从：
  - `solo_vision_ultra_trainer_blueprint_v2.html`
  - `trainer_refactor_blueprint.html`
  - `gpt帮我制定的所有提示词和本意，目标.txt`
- 这些文档在本批次是“页面与模式边界合同”，优先级高于当前独立 demo 旧实现，但低于封箱母本。
- 训练器四边界铁律必须写死进本批次：
  - `Notes 练识字`
  - `Intervals 练关系`
  - `Scales 练系统`
  - `Chords 练和声`
- 边界不得互吞。

### Step 1. 真实 repo 审计目标
- 审计：
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\IntervalsTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\IntervalsTrainer.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\NotesTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\NotesTrainer.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ScalesTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ScalesTrainer.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ChangesTrainer.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\trainers\ChangesTrainer.jsx)
- 必须确认：
  - Intervals 当前是最成熟旗舰页
  - Notes 当前结构最轻，只保留最核心训练语法
  - Scales 当前已有最丰富的控制逻辑与 blueprint 基础
  - Changes 当前已具备 progression / voice-leading 逻辑基线

### Step 2. 母本与蓝图映射要求
#### Intervals
- 页面定位：`Current flagship trainer surface`
- 对应 lens：`Triptych` + `Runtime Overlay`
- retain：
  - L0–L3
  - Top rail
  - Focus card
  - Fretboard stage
  - Viewport / editor / overlay 语法
- continueLanguage：
  - runtime overlays
  - stage rail
  - utility strip
- refactor：
  - 统一到下一代 trainer shell
- add：
  - 与 Scales/Notes/Chords 共用的旗舰 trainer chrome
- 硬约束：
  - Intervals 必须保持当前成熟基础的旗舰地位，不能被其它 trainer 抢走主位

#### Scales → Scale Systems
- 页面定位：`Scale Systems Page`
- 对应 lens：`Deep Surface`
- retain：
  - 当前 scale 控制逻辑
  - blueprint 基础
  - sequence 相关逻辑
- retainLogicOnly：
  - 旧控件摆放
- add 的硬合同：
  - 5 modes：`Pattern / System / Sequence / Connection / Target Tone`
  - 4 systems：`CAGED / 3NPS / Horizontal / Phrase Cells / Hybrid`
  - L1 主位必须有：`System`、`Sequence`、`Space + Flow`
  - L2 必须可承接：`SystemEditorL2`、`SequenceEditorL2`、`SpaceFlowEditorL2`、`TargetToneEditorL2`
- 禁止误实现：
  - `System` 不能进 L2
  - 不能只做几个 system 标签
  - 不能让 Flow 比 System 更重要

#### Notes → Fretboard Literacy
- 页面定位：`Fretboard Literacy Page`
- 对应 lens：`Deep Surface`
- retain：
  - 基本目标页 + 指板回答语法
- add 的硬合同：
  - 4 modes：`Note / Degree / Chord Tone / Pressure`
  - L0：`NotesFocusCard / ModeCapsules / BottomQuickStatusBar / FretboardStageCard`
  - L1：`Target Type / Display / Space / Challenge`
  - L2 最少承接：`TargetTypeEditorL2 / DisplayEditorL2`
- 禁止误实现：
  - `Flow` 不进 Notes L1 主位
  - L1 右下必须是 `Challenge`
  - 不能只做单模式找音页

#### Changes → Chords
- 页面定位：`Chords / Harmonic Navigation Page`
- 对应 lens：`Deep Surface`
- retain：
  - `MiniProgressionStrip`
  - `computeVoiceLead`
  - Now/Next 双焦点
- add 的硬合同：
  - 5 modes：`Find Chord / Chord Tone / Connect / Progression / Function`
  - progression、guide tones、common tones、harmonic function 必须进页面本体
- 禁止误实现：
  - `Mode` 必须在主位
  - `Flow` 不进主层
  - “流动”的本体是 `progression + voice leading`
  - 不能只是旧 Changes 换皮

### Step 3. 批次实施顺序
1. 先落 trainer 共享壳层与 primitives
2. 先做 `Intervals`，作为 trainer 旗舰壳层基准
3. 再做 `Scales`
4. 再做 `Notes`
5. 最后做 `Chords`
6. 最后统一回收 Batch B 的 scene/step 完成态

### Step 4. 页面落地要求
- 四个 trainer 都必须是页面本体，不是 feature 说明板。
- Scales 必须成为 Batch B 里第一个真正按蓝图升级的 trainer 页面。
- Notes 必须直接长出四模式与 Target Type 维度。
- Chords 必须直接长出 progression / voice-leading / function 页面。
- Intervals 必须成为整个 trainer family 的旗舰母页。

### Step 5. 构建与基础验证
- `npm run build`
- trainer 内部 tabs、segmented controls、按钮不误触全局翻页
- 四个 trainer scene id 与 dispatch 对齐
- 外部接入的 tabs / cards / motion / text 真正落地在 trainer 页面

### Step 6. 母本与蓝图一致性回查
- 是否严格遵守四边界铁律
- Notes 是否没有错误引入 Flow 主位
- Scales 是否给了 System 主位
- Chords 是否给了 Mode / Progression / Voice Leading 主位
- Intervals 是否仍保持旗舰地位
- 是否退回成“四张升级说明页”

### Step 7. 批次验收报告
- 范围：Intervals / Scales / Notes / Chords
- 文件、外部接入、retain / retainLogicOnly / refactor / add、build 结果
- 与 2.0 / 2.1 一致性
- 与 trainer blueprint 一致性
- 遗留问题
- 是否进入 Batch C

### Step 8. 进入下一批条件
- 四个 trainer 都成为真实下一代产品页
- trainer 四边界铁律被落实
- build 通过
- 通过后自动进入 Batch C

## Phase 3：Batch C 闭环
### Batch C 的额外生效合同
- 本批次除 2.0/2.1 外，必须同时服从：
  - `SVU_Fretboard_Audio_Core_Ultimate_Master.md`
  - `SVU_Fretboard_Audio_Core_Execution_Contract_Final.md`
  - `SoloVisionUltra_Fretboard_Audio_System_Complete_Spec.md`
  - `gpt帮我制定的所有提示词和本意，目标.txt`
- 这些文档在本批次是“core systems 与语义层合同”，优先级高于当前独立 demo 旧实现，但低于封箱母本。
- 本批次不是做技术海报，而是把 core 做成产品系统面。

### Step 1. 真实 repo 审计目标
- 审计：
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\engine\FretboardModel.js](C:\Users\MI\Desktop\solo-vision-ultra\src\engine\FretboardModel.js)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\engine\AudioCore.js](C:\Users\MI\Desktop\solo-vision-ultra\src\engine\AudioCore.js)
  - 当前 trainer 实时 prompt / feedback / input 语法
- 必须确认：
  - FretboardModel 当前有哪些候选位置、best position、tuning、correctness 语义
  - AudioCore 当前有哪些 session、detect、signal/analyser 管线
  - 当前 live training 语法能否承接 core 输出

### Step 2. 母本与 MD 映射要求
#### Fretboard Core
- 页面定位：`Fretboard Core System Surface`
- 对应 lens：`Deep Surface`
- 必须写死的内容合同：
  - `Topology`
  - `Graph`
  - `Interval Geometry`
  - `Harmonic Targets`
  - `Resolver`
  - `Analysis Bridge`
- 页面必须让观众看到：
  - 指板不是表格，而是 graph-based musical space
  - Resolver 把训练题翻译成允许答案集合
  - 同一个 pitch 不等于同一个位置，不等于同一个训练语义

#### Audio Core
- 页面定位：`Audio Core System Surface`
- 对应 lens：`Deep Surface`
- 必须写死的 6 段：
  - `Audio Session Manager`
  - `Pitch Detection Layer`
  - `Signal State Layer`
  - `Pitch Stabilizer`
  - `Calibration / Device Profile Bridge`
  - `Audio Candidate Export Layer`
- 页面必须明确区分：
  - `Pitch correct`
  - `Position likely correct`
  - `Functional target correct`
  - `Training semantic correct`

#### Position DNA / Position Likelihood
- 页面定位：`Candidate ranking layer`
- 必须作为正式系统层，不得只做文案
- 必须可视化：
  - `candidates`
  - `likelihood`
  - `bestCandidate`
  - `confidenceBand`
  - `needsMoreFrames`
- 定位写死为：
  - `Audio Candidate → Candidate Position Ranking`
  - 同音异位下的位置候选排序系统

#### Live Product
- 页面定位：`Runtime training surface`
- 对应 lens：`Runtime Overlay` + `Collapse Handoff`
- 必须将三层合并成一个真实运行时镜头：
  - trainer prompt
  - audio input
  - candidate export
  - position ranking
  - semantic coach output

### Step 3. 批次实施顺序
1. 先做 core shared modules：
   - signal cards
   - candidate ranking strip
   - semantic feedback panel
   - runtime overlay shell
2. 再做 `Audio Core`
3. 再做 `Position DNA / Position Likelihood` 相关可视层
4. 再做 `Fretboard Core`
5. 最后做 `Live Product`
6. 最后统一回收 Batch C 的 scene/step 完成态

### Step 4. 页面落地要求
- Fretboard Core 不得是技术说明板，必须是系统产品面。
- Audio Core 不得是 tuner 附属说明页，必须是训练引擎另一半。
- Position DNA 必须成为正式视觉与语义层。
- Live Product 必须是 trainer/core/audio 的实时合成镜头，不是概念页。

### Step 5. 构建与基础验证
- `npm run build`
- core scene 的 step reveal 必须有 handoff，不是静态切图
- runtime overlay 与 trainer/core 共享元素不冲突
- 外部 motion / text / background 组件实际渲染
- Position DNA 的 ranking/likelihood 层不是导入未使用

### Step 6. 母本与 MD 一致性回查
- core 是否真正产品化，而不是技术海报
- 是否出现 Position DNA / Position Likelihood
- 是否出现 Audio Candidate Export → Candidate Ranking → Resolver → Training Meaning
- 是否区分 pitch / position / semantic 多层真值
- 是否仍符合 2.0 / 2.1 的 chrome / motion / typography 系统

### Step 7. 批次验收报告
- 范围：Audio Core / Position DNA / Fretboard Core / Live Product
- 文件、外部接入、retain / retainLogicOnly / refactor / add、build 结果
- 与 2.0 / 2.1 一致性
- 与三份 core/audio MD 一致性
- 遗留问题
- 是否进入 Batch D

### Step 8. 进入下一批条件
- core 已像真实系统面
- live 已是可录屏运行时镜头
- Position DNA 已正式进入页面本体
- build 通过
- 通过后自动进入 Batch D

## Phase 4：Batch D 闭环
### Step 1. 真实 repo 审计目标
- 审计：
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\views\TunerView.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\views\TunerView.jsx)
  - [C:\Users\MI\Desktop\solo-vision-ultra\src\views\PreFlightView.jsx](C:\Users\MI\Desktop\solo-vision-ultra\src\views\PreFlightView.jsx)
  - `PersonaView`
  - `OnboardingView`
- 必须确认：
  - tuner 已有精密工具视觉语法
  - calibration / preflight 已有 wizard/setup/permission 验证链
  - persona / onboarding 属于 identity 与 entry 系统，而不是附属页

### Step 2. 母本映射要求
#### Tuner / Calibration
- 页面定位：`Precision + Setup Surface`
- 对应 lens：`Echo Pair`
- retain：
  - tuner gauge
  - calibration wizard 逻辑
- refactor：
  - 工具页进入产品主语言
- add：
  - shared utility shell
  -可信 setup flow

#### Persona / Onboarding
- 页面定位：`Identity + Entry Surface`
- 对应 lens：`Echo Pair`
- retain：
  - identity / first-run / weakness routing 概念
- refactor：
  - 从单独页提升为产品 OS 层

#### Product Ecosystem
- 页面定位：`Product OS Surface`
- 对应 lens：`Monolith`
- 必须收纳：
  - Theme
  - Tabs
  - Tuner
  - Calibration
  - Persona
  - Onboarding
  - trainer / core / utility continuity

#### Closing
- 页面定位：`Brand Closure Surface`
- 对应 lens：`Monolith` + `Collapse Handoff`
- 必须是收束镜头，不是总结板

### Step 3. 批次实施顺序
1. 先做 utility shared shell
2. 再做 `Tuner / Calibration`
3. 再做 `Persona / Onboarding`
4. 再做 `Product Ecosystem`
5. 最后做 `Closing`

### Step 4. 页面落地要求
- Utility、identity、entry 都必须成为产品 OS 语言的一部分。
- Ecosystem 必须成为系统页，不是 feature 拼盘。
- Closing 必须只保留品牌与产品闭环，不得回到 bullet list 终页。

### Step 5. 构建与基础验证
- `npm run build`
- utility / persona / onboarding / ecosystem / closing scene dispatch 完整
- closing 没有滑回说明板
- 前几批共享 chrome 未被破坏

### Step 6. 母本一致性回查
- utility/persona/onboarding 是否进入统一产品 OS
- ecosystem 是否成为系统页
- closing 是否克制、收束、有 hold state
- 2.1 的 page primitives / chrome / motion / typography 是否完整延续

### Step 7. 批次验收报告
- 范围：Tuner / Calibration / Persona / Onboarding / Ecosystem / Closing
- 文件、外部接入、retain / retainLogicOnly / refactor / add、build 结果
- 与 2.0 / 2.1 一致性
- 遗留问题
- 是否进入总收口

### Step 8. 进入总收口条件
- utility、identity、ecosystem、closing 全部进入统一产品语法
- build 通过
- 通过后进入总收口报告

## Phase 5：总收口报告
- 汇总全部批次的实际修改文件与新增 surface / chrome 模块。
- 汇总总 build 结果与关键运行入口检查结果。
- 逐类标记页面状态：
  - 已达成 2.0 / 2.1
  - 部分完成
  - 遗留尾项
- 明确尾项只允许是执行级增强，不允许回头改母本：
  - `sceneDirectorCompletion` 下钻到 step 级
  - `externalCodeImplementationSpecs` 下钻到文件/组件接线级
  - 局部 timing / spacing / hold state 微调
- 任何尾项都不得重新表述成“继续补体系”或“继续写定义”。

## 总 Test Plan
- 每个 Batch 后执行 [C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\package.json](C:\Users\MI\Desktop\solo-vision-ultra\standalone-demo\launch\package.json) 中的 `npm run build`
- 每个 Batch 后做 4 项入口自检：
  - scene 可前进/回退，交互控件不误翻页
  - 当前批次 scene id 与 surface registry 无缺项
  - 当前批次外部成熟代码实际渲染，不是“已导入未使用”
  - 前一批已完成页面未被破坏
- Batch B 额外对照 trainer blueprint：
  - modes 是否真落地
  - L1 / L2 是否真落位
  - 四边界铁律是否被守住
- Batch C 额外对照三份 core/audio MD：
  - Position DNA 是否进入页面本体
  - Candidate Ranking 是否成立
  - pitch / position / semantic 多层真值是否明确
  - Audio Candidate Export → Resolver → Training Meaning 是否成立
- 总收口时做完整 smoke checklist：
  - Home / Why Different / Tabs / Theme
  - Intervals / Scales / Notes / Chords
  - Audio Core / Position DNA / Fretboard Core / Live Product
  - Tuner / Calibration / Persona / Onboarding / Ecosystem / Closing

## 最终执行默认
- 后续正式进入实施时，必须严格按本工作流从 Phase 0 开始，串行完成 Batch A → B → C → D → Phase 5。
- 不再回头读取第一版或修正版作为并列参考。
- 后续执行只认这份终版工作流。

