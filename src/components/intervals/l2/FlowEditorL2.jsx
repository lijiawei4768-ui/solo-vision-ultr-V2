// components/intervals/l2/FlowEditorL2.jsx — v3 iOS Focus Mode 全屏
//
// 完全对照 iOS 专注模式截图：
//   - 全屏覆盖，背景模糊显示后方 L0 内容
//   - 预设行：大圆角 pill，左图标 + 标题副标题 + ···，行间有呼吸间距
//   - 选中行：整行背景加亮 + 右侧勾
//   - 底部：+ 圆形按钮 + "新预设" 文字，支持用户自定义添加
//   - 关闭：点击背景区域 / 右上角 × / 下拉

import React, { useContext, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../../contexts';
import { FONT_TEXT } from '../../../theme';
import { FLOW_PRESETS } from '../../../trainers/intervals/constants';

function useIsDark() { return (useContext(ThemeContext)?.dark) ?? true; }

// ── 图标 ──────────────────────────────────────────────────────
function FlowIcon({ id, size = 22, color }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 };
  switch (id) {
    case 'free':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
          <path d="M16 3l5 5-5 5M8 21l-5-5 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 8H8a5 5 0 00-5 5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M3 16h13a5 5 0 005-5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case 'low-high':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 18v-4M8 18v-7M12 18V8M16 18V5M20 18V2" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      );
    case 'high-low':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 6v4M8 4v7M12 3v11M16 2v13M20 2v16" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      );
    case 'custom':
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
          <circle cx="6"  cy="8"  r="2" stroke={color} strokeWidth="1.7"/>
          <circle cx="18" cy="8"  r="2" stroke={color} strokeWidth="1.7"/>
          <circle cx="12" cy="16" r="2" stroke={color} strokeWidth="1.7"/>
          <path d="M2 8h2M10 8h6M20 8h2M2 16h8M16 16h6" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      );
    default:
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8"/>
          <path d="M12 8v4l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
  }
}

// ── 自定义图标（用户添加的 preset 用音符图标）────────────────
function CustomPresetIcon({ size = 22, color }) {
  return (
    <svg style={{ width: size, height: size, display: 'block' }} viewBox="0 0 24 24" fill="none">
      <path d="M9 18V5l12-2v13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6"  cy="18" r="3" stroke={color} strokeWidth="1.8"/>
      <circle cx="18" cy="16" r="3" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}

// ── 单行 Pill（完全对照截图）────────────────────────────────
function PresetRow({ preset, isActive, onSelect, onMore, isDark, isCustom = false }) {
  const rowBg = isDark
    ? (isActive ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)')
    : (isActive ? 'rgba(0,0,0,0.10)'        : 'rgba(255,255,255,0.55)');
  const rowBorder = isDark
    ? (isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.09)')
    : (isActive ? 'rgba(0,0,0,0.14)'        : 'rgba(0,0,0,0.06)');
  const iconBg = isDark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.08)';
  const iconColor = isDark
    ? (isActive ? '#fff' : 'rgba(255,255,255,0.70)')
    : (isActive ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.52)');
  const titleColor = isDark
    ? (isActive ? '#fff' : 'rgba(255,255,255,0.80)')
    : (isActive ? 'rgba(0,0,0,0.90)' : 'rgba(0,0,0,0.68)');
  const subColor = isDark
    ? 'rgba(255,255,255,0.38)'
    : 'rgba(0,0,0,0.38)';
  const dotColor = isDark
    ? 'rgba(255,255,255,0.30)'
    : 'rgba(0,0,0,0.25)';

  return (
    <motion.div
      onClick={() => onSelect(preset.id)}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           14,
        padding:       '15px 18px',
        borderRadius:  20,
        background:    rowBg,
        border:        `0.5px solid ${rowBorder}`,
        cursor:        'pointer',
        userSelect:    'none',
        position:      'relative',
        boxShadow:     isActive
          ? (isDark
              ? 'inset 0 0.5px 0 rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.20)'
              : 'inset 0 0.5px 0 rgba(255,255,255,0.90), 0 2px 6px rgba(0,0,0,0.08)')
          : 'none',
      }}
    >
      {/* 图标 */}
      <div style={{
        width: 48, height: 48,
        borderRadius: 14,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {isCustom
          ? <CustomPresetIcon size={22} color={iconColor} />
          : <FlowIcon id={preset.id} size={22} color={iconColor} />
        }
      </div>

      {/* 文字 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 17, fontWeight: isActive ? 600 : 400,
          color: titleColor, fontFamily: FONT_TEXT,
          lineHeight: 1.25, letterSpacing: '-0.015em',
        }}>
          {preset.label}
        </div>
        {preset.summary && (
          <div style={{
            fontSize: 13, color: subColor,
            fontFamily: FONT_TEXT, marginTop: 2, lineHeight: 1.3,
          }}>
            {preset.summary}
          </div>
        )}
      </div>

      {/* 右侧：选中勾 或 三点 */}
      <AnimatePresence mode="wait" initial={false}>
        {isActive ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          >
            <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10.25"
                fill={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)'}
                stroke={isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.12)'}
                strokeWidth="0.5"
              />
              <path d="M6.5 11l3 3 6-7"
                stroke={isDark ? '#fff' : 'rgba(0,0,0,0.78)'}
                strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { e.stopPropagation(); onMore?.(preset.id); }}
            style={{ display: 'flex', gap: 3.5, padding: '6px 2px', cursor: 'pointer' }}
          >
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: dotColor }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── 添加自定义 preset 对话框（内嵌在页面底部）────────────────
function AddPresetRow({ onAdd, isDark }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (name.trim()) { onAdd(name.trim()); setName(''); }
    setEditing(false);
  };

  const plusBg = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';
  const plusBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const labelColor = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.40)';

  return (
    <AnimatePresence mode="wait">
      {editing ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            borderRadius: 20,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
            border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') { setEditing(false); setName(''); }
            }}
            placeholder="预设名称"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 16, fontFamily: FONT_TEXT,
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.80)',
            }}
          />
          <motion.div
            onClick={handleConfirm}
            whileTap={{ scale: 0.90 }}
            style={{
              padding: '5px 14px', borderRadius: 14, cursor: 'pointer',
              background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
              border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.10)'}`,
            }}
          >
            <span style={{ fontSize: 13, color: isDark ? '#fff' : 'rgba(0,0,0,0.72)', fontFamily: FONT_TEXT }}>
              添加
            </span>
          </motion.div>
          <motion.div
            onClick={() => { setEditing(false); setName(''); }}
            whileTap={{ scale: 0.90 }}
            style={{ padding: '5px 8px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 13, color: labelColor, fontFamily: FONT_TEXT }}>取消</span>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="add-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 4 }}
        >
          {/* + 圆圈（对照截图）*/}
          <motion.div
            onClick={() => setEditing(true)}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: plusBg,
              border: `0.5px solid ${plusBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12"
                stroke={isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.55)'}
                strokeWidth={1.8} strokeLinecap="round"
              />
            </svg>
          </motion.div>
          {/* 标签文字（对照截图"新专注模式"）*/}
          <span style={{ fontSize: 12, color: labelColor, fontFamily: FONT_TEXT, letterSpacing: '0.01em' }}>
            新预设
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 主组件 ────────────────────────────────────────────────────
export function FlowEditorL2({ isOpen, onClose, flowPreset, onFlowChange, onOpenL3 }) {
  const isDark = useIsDark();
  const [customPresets, setCustomPresets] = useState([]);

  const handleSelect = useCallback((id) => {
    onFlowChange?.(id);
  }, [onFlowChange]);

  const handleAddPreset = useCallback((name) => {
    setCustomPresets(prev => [
      ...prev,
      { id: `custom-${Date.now()}`, label: name, summary: '自定义预设', order: 'random', enabled: true },
    ]);
  }, []);

  // ── 背景：对照截图，整个屏幕是带色的毛玻璃
  const backdropBg = isDark
    ? 'rgba(8, 8, 16, 0.72)'
    : 'rgba(195, 200, 210, 0.55)';

  const closeColor = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.40)';
  const closeBtnBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)';

  const allPresets = [...FLOW_PRESETS, ...customPresets];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          // 点击背景关闭
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: backdropBg,
            backdropFilter: 'blur(36px)',
            WebkitBackdropFilter: 'blur(36px)',
            display: 'flex',
            flexDirection: 'column',
            // 内容区域在屏幕垂直中心偏下（对照截图）
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          {/* 整个内容区 — stopPropagation 防止穿透关闭 */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0 24px',
              // 顶部留出状态栏高度
              paddingTop: 'max(env(safe-area-inset-top, 0px), 56px)',
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)',
              minHeight: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* ── 右上角关闭按钮 ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <motion.div
                onClick={onClose}
                whileTap={{ scale: 0.85 }}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: closeBtnBg,
                  border: `0.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke={closeColor} strokeWidth={1.5} strokeLinecap="round"/>
                </svg>
              </motion.div>
            </div>

            {/* ── Preset 列表（垂直居中，占据屏幕主要空间）── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {allPresets.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 32 }}
                  >
                    <PresetRow
                      preset={p}
                      isActive={flowPreset === p.id}
                      onSelect={handleSelect}
                      onMore={onOpenL3}
                      isDark={isDark}
                      isCustom={p.id.startsWith('custom-')}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── 底部：+ 新预设（对照截图底部区域）── */}
            <div style={{ paddingTop: 32 }}>
              <AddPresetRow onAdd={handleAddPreset} isDark={isDark} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
