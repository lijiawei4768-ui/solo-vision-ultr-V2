# IntervalsTrainer v5.1 完整实现 — 7步闭环

## 执行原则
- **严格按 MD**：所有修改必须来自 INT_MASTER_SPEC_v5.md 或 INT_SPEC_v5_1_corrections.md
- **禁止自主创新**：不添加 MD 中未规定的样式或逻辑
- **每步可验证**：修改后 npm run build 必须成功

---

## Step 1: L0 Height 分配 + 指板呼吸空间

**目标**：按 v5.1 1.1-1.2 修正 Mobile 布局

**修改文件**：`src/trainers/IntervalsTrainer.jsx` - Mobile return 块

**具体任务**：
1. Height 分配：TopBar 48px, FindModeCapsules 34px (原40→34), FocusCard max(140px,22dvh), PositionStrip 18px, BottomBar 52px
2. FretboardArea 外层：flex:1, minHeight:0, padding: 8px 0
3. FretboardSurface GlassCard 内：paddingTop:12px, paddingBottom:16px, paddingLeft:8px, background: rgba(18,18,26,1), borderRadius:12px, border:0.5px solid rgba(255,255,255,0.05)
4. 弦线粗细渐变：e4 0.4/B3 0.55/G3 0.7/D3 0.85/A2 1.05/E2 1.3

**验证**：npm run build 成功

---

## Step 2: PositionStrip 品格追踪条

**目标**：按 v5.1 1.3 添加

**修改文件**：`src/trainers/IntervalsTrainer.jsx`

**具体任务**：
1. 在 FocusCard 和 FretboardArea 之间添加 PositionStrip 组件
2. 高度 18px，显示 12 品格轨道
3. 显示当前视窗区域高亮（viewportMin 到 viewportMin+4）
4. 显示根音点（琥珀色圆点）和目标音点
5. 显示把位标记点 (3/5/7/9)
6. 追踪动画：CSS transition 0.35s cubic-bezier

**验证**：npm run build 成功

---

## Step 3: L0 TopBar 完整工具栏

**目标**：按 v5.1 7 + v5 2.2-2.3 实现

**修改文件**：`src/trainers/IntervalsTrainer.jsx`

**具体任务**：
1. TopBar 右侧 4 个按钮（从左到右）：MicButton, Stats, Theme Toggle, GlobalSettings
2. 每个按钮 34×34px，圆角 10px
3. Stats 按钮：bar chart SVG 图标
4. Theme Toggle：太阳/月亮 SVG（不用 emoji）
5. Settings 按钮：齿轮 SVG（不用 emoji）
6. MicButton 状态机：OFF(灰色), ON+listening(绿+RMS条), ON+correct(绿+Correct), ON+wrong(橙色+Again)
7. 5 根 RMS 信号条，宽度 3px 间距 2px，高度 4-20px，动画 80ms linear

**验证**：npm run build 成功

---

## Step 4: L1 控制中心修正

**目标**：按 v5 3.3-3.5 + v5.1 2.1-2.3 实现

**修改文件**：`src/trainers/IntervalsTrainer.jsx` - ControlCenter 组件

**具体任务**：
1. VerticalCardStack 物理：visible 3张, current scale:1.0, adjacent scale:0.9, SPRINGS.jelly 吸附
2. Mode VerticalCardStack 下方添加 Zone 条（blind/coreDrill 时显示）
3. SpaceChip：顶部 preset 名(11px), 中间迷你品格轨道(8px高), 底部 fretRange(10px)
4. FlowChip：点击展开选择列表（iOS 专注模式风格），每行 44px
5. 长按气泡 Tooltip：500ms 触发，显示中英说明，3s 自动淡出

**验证**：npm run build 成功

---

## Step 5: L2 编辑器视觉化

**目标**：按 v5 4.4-4.5 实现

**修改文件**：`src/trainers/IntervalsTrainer.jsx`

**具体任务**：
1. SpaceEditorContent：
   - 品格轨道可视化（44px 高，12 格，把位标记，数字刻度）
   - Quick Set 网格 [Open 0-5] [Mid 4-9] [High 7-12] [Full 0-12]
   - 实时应用（每次改变立即 setSpace + onApply）
2. FlowEditorContent：
   - 6 行弦选择（E2 最粗到 e4 最细）
   - Order 分段控制 3 列 [Low→Hi] [Hi→Low] [Random]
   - 实时应用

**验证**：npm run build 成功

---

## Step 6: iPad + macOS 布局

**目标**：按 v5.1 4.2-4.3 实现

**修改文件**：`src/trainers/IntervalsTrainer.jsx` - Tablet 和 PC return 块

**具体任务**：
1. iPad Portrait：左侧 Fretboard (flex:1) + 右侧 Bento Panel (220px，固定不折叠)
2. iPad Landscape：左 200px 设置 + 中 flex:1 舞台 + 右 180px 统计
3. macOS：左侧 Sidebar 200px（MODE/INTERVALS/SPACE/FLOW + 底部 Stats） + 中央舞台 + 无右侧面板
4. macOS Sidebar 底部：Accuracy Ring SVG + Streak 卡片

**验证**：npm run build 成功

---

## Step 7: 呼吸动画 + 最终验证

**目标**：按 v5.1 5.1-5.3 实现

**修改文件**：`src/trainers/IntervalsTrainer.jsx` + `src/theme.js`

**具体任务**：
1. SPRINGS.pulse：stiffness:150, damping:12, mass:1.5
2. BottomHandle 横线呼吸：opacity 0.4→0.6, 3s 周期
3. 答对动画：FocusCard 扩散光环，PositionStrip 点位 scale 1→1.3
4. 答错动画：FocusCard x轴微震
5. 切题动画：FocusCard blur 6px + scale 0.9

**验证**：npm run build 成功 + git status 确认修改文件
