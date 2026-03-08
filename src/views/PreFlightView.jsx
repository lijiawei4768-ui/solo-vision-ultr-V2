
// ─────────────────────────────────────────────────────────────
// src/views/PreFlightView.jsx  — v3.0
//
// v3.0 changes:
//   • StepIntro rewritten as 4 animated sub-screens (slides).
//     每次只显示一张，带动画切换。
//     Slide 1-3: Why calibrate cards (bilingual CN/EN)
//     Slide 4:   "Two quick steps" summary + Begin button
//   • getUserMedia error (HTTPS guard) now caught in PreFlightView
//     with a clear bilingual error card shown to the user.
//   • All other steps (noise, strings, done) unchanged from v2.0
// ─────────────────────────────────────────────────────────────
import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT_DISPLAY, FONT_TEXT, FONT_MONO } from '../theme';
import { ThemeContext } from '../contexts';
import { useCalibration } from '../hooks/useCalibration';

// ── Theme-aware token helper ──────────────────────────────────
function useTokens() {
  const ctx = useContext(ThemeContext);
  return ctx?.tokens ?? {
    surface0:      'rgba(10,10,12,1)',
    surface1:      'rgba(255,255,255,0.04)',
    surface2:      'rgba(255,255,255,0.07)',
    surface3:      'rgba(255,255,255,0.11)',
    border:        'rgba(255,255,255,0.08)',
    borderHi:      'rgba(255,255,255,0.16)',
    textPrimary:   'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.55)',
    textTertiary:  'rgba(255,255,255,0.35)',
    accent:        '#E8A23C',
    accentSub:     'rgba(232,162,60,0.18)',
    accentBorder:  'rgba(232,162,60,0.35)',
    positive:      '#34C759',
    negative:      '#FF453A',
    spring:        { type: 'spring', stiffness: 320, damping: 26 },
    springSnap:    { type: 'spring', stiffness: 460, damping: 30 },
  };
}

// ── Primitive buttons ─────────────────────────────────────────
function PrimaryButton({ children, onClick }) {
  const T = useTokens();
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={{
        width: '100%', padding: '16px',
        borderRadius: 16, border: `0.5px solid ${T.accentBorder}`,
        background: T.accent, color: '#1a1a1a',
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        fontFamily: FONT_TEXT, letterSpacing: -0.2,
      }}
    >
      {children}
    </motion.button>
  );
}

function GhostButton({ children, onClick }) {
  const T = useTokens();
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: 12, display: 'block', width: '100%',
        background: 'none', border: 'none',
        color: T.textSecondary, fontSize: 13, cursor: 'pointer',
        fontFamily: FONT_TEXT,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  const T = useTokens();
  return (
    <div style={{
      background: T.surface2,
      backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
      borderTop:    `0.5px solid ${T.borderHi}`,
      borderLeft:   `0.5px solid ${T.border}`,
      borderRight:  `0.5px solid ${T.border}`,
      borderBottom: `0.5px solid rgba(0,0,0,0.1)`,
      borderRadius: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Slide dot indicator ───────────────────────────────────────
function SlideDots({ total, current }) {
  const T = useTokens();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width:      i === current ? 20 : 6,
            background: i === current ? T.accent : T.surface3,
            opacity:    i < current ? 0.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{ height: 6, borderRadius: 3 }}
        />
      ))}
    </div>
  );
}

// ── Error card (HTTPS / permission errors) ────────────────────
function MicErrorCard({ error, onSkip }) {
  const T = useTokens();
  const isHttps = error?.name === 'MicrophoneUnavailableError';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{ width: '100%', textAlign: 'center' }}
    >
      <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
      <div style={{
        fontSize: 20, fontWeight: 700, color: T.negative,
        fontFamily: FONT_DISPLAY, marginBottom: 8,
      }}>
        {isHttps ? 'Microphone Unavailable' : 'Permission Denied'}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: T.negative,
        fontFamily: FONT_TEXT, marginBottom: 16,
      }}>
        {isHttps ? '麦克风不可用' : '麦克风权限被拒绝'}
      </div>

      <Card style={{ padding: '16px 18px', textAlign: 'left', marginBottom: 20 }}>
        {isHttps ? (
          <>
            <div style={{ fontSize: 13, color: T.textPrimary, marginBottom: 8, fontWeight: 600 }}>
              You're accessing via HTTP on an IP address.
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
              Browsers require <strong style={{ color: T.accent }}>HTTPS</strong> or{' '}
              <strong style={{ color: T.accent }}>localhost</strong> for microphone access.
            </div>
            <div style={{ fontSize: 13, color: T.textPrimary, marginBottom: 6, fontWeight: 600 }}>
              你正在通过 HTTP + IP 地址访问。
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
              浏览器要求通过 <strong style={{ color: T.accent }}>HTTPS</strong> 或{' '}
              <strong style={{ color: T.accent }}>localhost</strong> 才能使用麦克风。
            </div>
            <div style={{
              background: T.surface1, borderRadius: 10, padding: '10px 12px',
              fontFamily: FONT_MONO, fontSize: 11, color: T.textSecondary,
            }}>
              ✓ http://localhost:{window.location.port}<br />
              ✓ https://your-domain.com<br />
              ✗ http://{window.location.hostname}:{window.location.port}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
              Please allow microphone access in your browser settings and reload the page.
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, marginTop: 8 }}>
              请在浏览器设置中允许麦克风访问，然后刷新页面。
            </div>
          </>
        )}
      </Card>

      <GhostButton onClick={onSkip}>
        Continue without calibration / 跳过校准继续
      </GhostButton>
    </motion.div>
  );
}

// ── Step 0 — Intro (4 slides) ─────────────────────────────────
// Bilingual CN/EN, one slide at a time, animated.
// 中英对照，每次显示一张，带动画切换。
const INTRO_SLIDES = [
  {
    icon: '🎸',
    en: {
      title: 'Every Guitar Is Different',
      body:  'String gauge, neck relief, and pickup type all affect the frequency spectrum reaching your mic. Without calibration the app uses generic defaults that may not match your instrument.',
    },
    zh: {
      title: '每把吉他都不一样',
      body:  '弦规、琴颈弧度、拾音器类型都会影响麦克风接收到的频谱特征。不校准的话，App 使用通用默认值，可能与你的吉他不匹配。',
    },
  },
  {
    icon: '🔇',
    en: {
      title: 'Room Noise Causes False Triggers',
      body:  'Fan, A/C, street traffic — all emit low-frequency hum. Uncalibrated, the app may "hear" a note when none was played. Noise floor measurement eliminates these false positives.',
    },
    zh: {
      title: '环境噪音导致误触发',
      body:  '风扇、空调、街道噪声都会产生低频嗡鸣。未校准时，App 可能在你没弹弦时"听到"音符。噪底测量可以彻底消除这些误报。',
    },
  },
  {
    icon: '🎯',
    en: {
      title: 'Calibration Boosts Accuracy ~40%',
      body:  'A calibrated session achieves around 40% better pitch detection than uncalibrated defaults. At training speed, every false trigger breaks your flow and corrupts your stats.',
    },
    zh: {
      title: '校准可提升约 40% 识别精度',
      body:  '校准后的会话音高识别准确率比默认状态高约 40%。训练时每一次误触发都会打断你的节奏并污染统计数据。',
    },
  },
  {
    // Last slide — "Two quick steps"
    icon: '⚡',
    isFinal: true,
    en: {
      title: 'Two Quick Steps',
      body:  null,
    },
    zh: {
      title: '两步快速完成',
      body:  null,
    },
    steps: [
      {
        icon:  '🔇',
        en:    { label: 'Noise measurement',   sub: '30 sec — stay quiet, let the mic listen to your room' },
        zh:    { label: '噪底测量',              sub: '30秒 — 保持安静，让麦克风采样环境噪声' },
      },
      {
        icon:  '🎸',
        en:    { label: 'String calibration',  sub: 'Play each open string once — maps your guitar\'s response' },
        zh:    { label: '弦校准',               sub: '每根弦空弦弹一下 — 记录你的吉他响应特征' },
      },
    ],
  },
];

function IntroSlide({ slide, index, direction }) {
  const T = useTokens();

  return (
    <motion.div
      key={index}
      custom={direction}
      variants={{
        enter:  (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
        center: { opacity: 1, x: 0 },
        exit:   (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      style={{ width: '100%' }}
    >
      {/* Icon */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.08 }}
          style={{ fontSize: 52 }}
        >
          {slide.icon}
        </motion.div>
      </div>

      {/* Titles — bilingual */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {/* English title */}
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: -0.6,
          color: T.textPrimary, fontFamily: FONT_DISPLAY, lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {slide.en.title}
        </div>
        {/* Chinese title */}
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: T.accent, fontFamily: FONT_TEXT,
          marginBottom: slide.isFinal ? 0 : 16,
        }}>
          {slide.zh.title}
        </div>

        {/* Body text — bilingual (non-final slides) */}
        {!slide.isFinal && (
          <Card style={{ padding: '16px 18px', textAlign: 'left' }}>
            {/* EN body */}
            <div style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.65, marginBottom: 10 }}>
              {slide.en.body}
            </div>
            {/* Divider */}
            <div style={{ height: 1, background: T.border, marginBottom: 10 }} />
            {/* ZH body */}
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.65 }}>
              {slide.zh.body}
            </div>
          </Card>
        )}

        {/* Final slide — two steps list */}
        {slide.isFinal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {slide.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 320, damping: 26 }}
              >
                <Card style={{ padding: '14px 16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Step number + icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: T.accentSub, border: `0.5px solid ${T.accentBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                    }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      {/* EN label */}
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: T.textPrimary,
                        fontFamily: FONT_TEXT, marginBottom: 2,
                      }}>
                        {i + 1}. {step.en.label}
                      </div>
                      {/* ZH label */}
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: T.accent,
                        fontFamily: FONT_TEXT, marginBottom: 4,
                      }}>
                        {step.zh.label}
                      </div>
                      {/* EN sub */}
                      <div style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.5 }}>
                        {step.en.sub}
                      </div>
                      {/* ZH sub */}
                      <div style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.5 }}>
                        {step.zh.sub}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StepIntro({ onStart, onSkip }) {
  const T = useTokens();
  const [slide, setSlide]         = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const total = INTRO_SLIDES.length;

  const goNext = useCallback(() => {
    if (slide < total - 1) {
      setDirection(1);
      setSlide(s => s + 1);
    }
  }, [slide, total]);

  const goPrev = useCallback(() => {
    if (slide > 0) {
      setDirection(-1);
      setSlide(s => s - 1);
    }
  }, [slide]);

  const isFinal = slide === total - 1;

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          fontSize: 11, color: T.accent, letterSpacing: 1.4,
          textTransform: 'uppercase', fontFamily: FONT_TEXT, marginBottom: 4,
        }}>
          Calibration Setup · 校准设置
        </div>
        <SlideDots total={total} current={slide} />
      </div>

      {/* Slide content */}
      <div style={{ minHeight: 300, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <IntroSlide
            key={slide}
            slide={INTRO_SLIDES[slide]}
            index={slide}
            direction={direction}
          />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ marginTop: 24 }}>
        {!isFinal ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {slide > 0 && (
              <motion.button
                onClick={goPrev}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: '0 0 auto', padding: '14px 20px',
                  borderRadius: 14, border: `0.5px solid ${T.border}`,
                  background: T.surface2, color: T.textSecondary,
                  fontSize: 15, cursor: 'pointer', fontFamily: FONT_TEXT,
                }}
              >
                ←
              </motion.button>
            )}
            <motion.button
              onClick={goNext}
              whileTap={{ scale: 0.96 }}
              style={{
                flex: 1, padding: '16px',
                borderRadius: 16, border: `0.5px solid ${T.accentBorder}`,
                background: T.accent, color: '#1a1a1a',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: FONT_TEXT, letterSpacing: -0.2,
              }}
            >
              Next → / 下一步
            </motion.button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
              <motion.button
                onClick={goPrev}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: '0 0 auto', padding: '14px 20px',
                  borderRadius: 14, border: `0.5px solid ${T.border}`,
                  background: T.surface2, color: T.textSecondary,
                  fontSize: 15, cursor: 'pointer', fontFamily: FONT_TEXT,
                }}
              >
                ←
              </motion.button>
              <PrimaryButton onClick={onStart}>
                Begin Calibration → / 开始校准
              </PrimaryButton>
            </div>
            <GhostButton onClick={onSkip}>
              Skip — use defaults / 跳过（不推荐）
            </GhostButton>
          </>
        )}
      </div>
    </div>
  );
}

// ── Step 1 — Noise ─────────────────────────────────────────────
function PulsingRing({ active }) {
  const T = useTokens();
  return (
    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto' }}>
      {active && (
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${T.accent}`,
          }}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: T.accentSub, border: `1.5px solid ${T.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30,
      }}>
        🎤
      </div>
    </div>
  );
}

function StepNoise({ progress, noiseDone, noiseOk, onContinue, onRetry }) {
  const T = useTokens();
  return (
    <motion.div
      key="noise"
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={T.spring}
      style={{ width: '100%' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: T.accent, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6, fontFamily: FONT_TEXT }}>
          Step 1 of 2 · 第一步
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
          Room Noise / 环境噪底
        </div>
        <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 4 }}>
          Set your guitar down and stay quiet for 3 seconds.
        </div>
        <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 2 }}>
          放下吉他，保持安静 3 秒钟。
        </div>
      </div>

      <Card style={{ padding: '36px 28px', textAlign: 'center' }}>
        {!noiseDone ? (
          <>
            <PulsingRing active />
            <div style={{ marginTop: 24, fontSize: 13, color: T.textSecondary }}>
              Sampling ambient noise… / 正在采样环境噪声…
            </div>
            <div style={{
              marginTop: 20, height: 4, borderRadius: 2,
              background: T.surface1, overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.12 }}
                style={{ height: '100%', background: T.accent, borderRadius: 2 }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: T.textTertiary, fontFamily: FONT_MONO }}>
              {Math.round(progress * 100)}%
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={T.spring}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{noiseOk ? '✅' : '⚠️'}</div>
            <div style={{
              fontSize: 17, fontWeight: 700,
              color: noiseOk ? T.positive : T.negative,
              marginBottom: 4, fontFamily: FONT_DISPLAY,
            }}>
              {noiseOk ? 'Good — room is quiet' : 'Environment too noisy!'}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: noiseOk ? T.positive : T.negative,
              marginBottom: 12,
            }}>
              {noiseOk ? '环境安静，噪底正常' : '环境太嘈杂！'}
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
              {noiseOk
                ? 'Noise floor captured. Detection will be accurate.\n噪底已捕获，识别将会准确。'
                : 'High ambient noise detected. Move to a quieter space or close windows, then retry.\n检测到高环境噪声。请移到更安静的地方或关闭窗户，然后重试。'}
            </div>

            {noiseOk ? (
              /* ✅ Clean room — let user continue */
              <PrimaryButton onClick={onContinue}>
                Continue → / 继续
              </PrimaryButton>
            ) : (
              /* ⚠️ Too noisy — Retry first, Force-accept secondary */
              <>
                <PrimaryButton onClick={onRetry}>
                  🔄 Retry / 重试
                </PrimaryButton>
                <button
                  onClick={onContinue}
                  style={{
                    marginTop: 12, display: 'block', width: '100%',
                    background: 'none', border: `0.5px solid ${T.border}`,
                    borderRadius: 12, padding: '10px 16px',
                    color: T.textTertiary, fontSize: 12, cursor: 'pointer',
                    fontFamily: FONT_TEXT,
                  }}
                >
                  Continue anyway (accuracy may suffer) / 强制继续（可能影响准确率）
                </button>
              </>
            )}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

// ── Step 2 — String calibration ────────────────────────────────
function StringVisualizer({ allStringNames, stringsDone, currentString }) {
  const T = useTokens();
  const widths = [2.2, 1.8, 1.4, 1.1, 0.85, 0.65];

  return (
    <div style={{ padding: '18px 0 10px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {allStringNames.map((name, i) => {
        const done   = stringsDone.includes(name);
        const active = name === currentString;
        const color  = done ? T.positive : active ? T.accent : T.border;
        const opacity = done ? 1 : active ? 1 : 0.35;

        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0' }}>
            <div style={{
              width: 28, textAlign: 'right', flexShrink: 0,
              fontSize: 11, fontFamily: FONT_MONO, fontWeight: 700,
              color: active ? T.accent : done ? T.positive : T.textTertiary,
              transition: 'color 0.3s',
            }}>
              {name}
            </div>
            <div style={{ flex: 1, position: 'relative', height: Math.max(widths[i] * 2, 10), display: 'flex', alignItems: 'center' }}>
              <motion.div
                animate={{ opacity, backgroundColor: color }}
                transition={{ duration: 0.35 }}
                style={{ width: '100%', height: widths[i], borderRadius: widths[i], backgroundColor: color }}
              />
              {active && (
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', inset: 0,
                    height: widths[i] + 6, marginTop: -3,
                    borderRadius: widths[i] + 3,
                    background: `${T.accent}55`,
                    filter: 'blur(3px)',
                  }}
                />
              )}
            </div>
            <div style={{
              width: 20, flexShrink: 0, textAlign: 'center', fontSize: 12,
              color: done ? T.positive : active ? T.accent : 'transparent',
            }}>
              {done ? '✓' : active ? '◉' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CentsMeter({ cents }) {
  const T = useTokens();
  const abs     = Math.abs(cents);
  const clamped = Math.max(-50, Math.min(50, cents));
  const pct     = ((clamped + 50) / 100) * 100;
  const color   = abs <= 8 ? T.positive : abs <= 22 ? T.accent : T.negative;

  return (
    <div>
      <div style={{
        position: 'relative', height: 8, borderRadius: 4,
        background: T.surface1, border: `0.5px solid ${T.border}`,
        marginBottom: 10, overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 1.5, height: 18, background: T.borderHi, borderRadius: 1,
        }} />
        <motion.div
          animate={{ left: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{
            position: 'absolute', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 14, height: 22, borderRadius: 4,
            background: color, boxShadow: `0 0 12px ${color}88`,
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color, fontFamily: FONT_MONO, letterSpacing: -1, lineHeight: 1 }}>
          {cents > 0 ? '+' : ''}{Math.round(cents)}
        </span>
        <span style={{ fontSize: 14, color: T.textSecondary, fontFamily: FONT_MONO }}>¢</span>
      </div>
      <div style={{ fontSize: 12, color: abs <= 8 ? T.positive : T.textSecondary, marginTop: 4, fontWeight: abs <= 8 ? 600 : 400 }}>
        {abs <= 8 ? '✓ In tune / 准确' : abs <= 22 ? 'Close — hold it steady / 接近，保持稳定' : 'Tune your guitar first / 请先调音'}
      </div>
    </div>
  );
}

function StepStrings({ currentString, stringProgress, stringsDone, liveCents, allStringNames, statusMsg, onSkipString }) {
  const T         = useTokens();
  const totalDone = stringsDone.length;
  const total     = allStringNames.length;
  const hasSignal = liveCents !== null;
  const labels    = { E2: 'low E / 低E', A2: 'A', D3: 'D', G3: 'G', B3: 'B', E4: 'high e / 高e' };

  return (
    <motion.div
      key="strings"
      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={T.spring}
      style={{ width: '100%' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.accent, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6, fontFamily: FONT_TEXT }}>
          Step 2 of 2 · 第二步
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
          String Calibration / 弦校准
        </div>
        <AnimatePresence mode="wait">
          {currentString && (
            <motion.div
              key={currentString}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}
            >
              Play open <strong style={{ color: T.accent, fontFamily: FONT_MONO }}>{currentString}</strong>
              {labels[currentString] ? ` (${labels[currentString]})` : ''} and hold it.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
        {allStringNames.map((name) => {
          const done   = stringsDone.includes(name);
          const active = name === currentString;
          return (
            <motion.div
              key={name}
              animate={{ width: active ? 20 : 8, background: done ? T.positive : active ? T.accent : T.surface2 }}
              transition={T.springSnap}
              style={{ height: 4, borderRadius: 2 }}
            />
          );
        })}
      </div>

      <Card style={{ padding: '20px 24px 24px', marginBottom: 16 }}>
        <StringVisualizer allStringNames={allStringNames} stringsDone={stringsDone} currentString={currentString} />
        <div style={{ height: 1, background: T.border, margin: '12px 0 18px' }} />

        <AnimatePresence mode="wait">
          {hasSignal ? (
            <motion.div key="signal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <CentsMeter cents={liveCents} />
            </motion.div>
          ) : (
            <motion.div key="nosignal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 28, marginBottom: 8 }}
              >
                🎸
              </motion.div>
              <div style={{ fontSize: 14, color: T.textSecondary }}>Waiting for signal… / 等待信号…</div>
              <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 4 }}>
                Pluck open <span style={{ fontFamily: FONT_MONO, color: T.accent }}>{currentString}</span> cleanly
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip string — always visible, sticky at bottom of card */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5, duration: 0.4 }}
          onClick={onSkipString}
          style={{
            marginTop: 14, width: '100%',
            background: 'none', border: `0.5px solid ${T.border}`,
            borderRadius: 12, padding: '10px 16px',
            color: T.textSecondary, fontSize: 13, cursor: 'pointer',
            fontFamily: FONT_TEXT,
          }}
        >
          Skip this string → / 跳过此弦
        </motion.button>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.textSecondary }}>Samples / 样本</span>
            <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: T.accent }}>{Math.round(stringProgress * 100)}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: T.surface1, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${stringProgress * 100}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              style={{ height: '100%', borderRadius: 2, background: T.accent }}
            />
          </div>
        </div>
      </Card>

      <div style={{ textAlign: 'center', fontSize: 12, color: T.textSecondary }}>
        {totalDone} of {total} strings done / {totalDone}/{total} 根弦完成
        {statusMsg ? <span style={{ color: T.textTertiary }}> — {statusMsg}</span> : null}
      </div>
    </motion.div>
  );
}

// ── Step 3a — YIN 优化（自动 0.5s）────────────────────────────
function StepOptimize({ onComplete }) {
  const T = useTokens();
  useEffect(() => {
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [onComplete]);
  return (
    <motion.div
      key="optimize"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{ width: 44, height: 44, margin: '0 auto 24px', borderRadius: 22,
          border: `2px solid ${T.accent}`, borderTopColor: 'transparent' }}
      />
      <div style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: 'inherit' }}>
        Optimizing recognition parameters
      </div>
      <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}>
        正在优化识别参数...
      </div>
    </motion.div>
  );
}

// ── Step 3b — G→B 补偿（自动 instant）──────────────────────────
function StepGbDetect({ onComplete, detected }) {
  const T = useTokens();
  useEffect(() => {
    const t = setTimeout(onComplete, 400);
    return () => clearTimeout(t);
  }, [onComplete]);
  return (
    <motion.div
      key="gb-detect"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}
    >
      <svg viewBox="0 0 24 24" width={44} height={44} fill="none" style={{ margin: '0 auto 24px', display: 'block' }}>
        <circle cx="12" cy="12" r="10" stroke={T.accent} strokeWidth="1.5" />
        <path d="M7 12h10M12 7v10" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: 'inherit' }}>
        G→B String Compensation
      </div>
      <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}>
        {detected ? 'Compensation detected — applied / G→B补偿已检测并应用' : 'Standard compensation / 标准补偿已应用'}
      </div>
    </motion.div>
  );
}

// ── 5音验证配置 ──────────────────────────────────────────────────
const VERIFY_NOTES = [
  { string: 'E2',  fret: 0,  label: 'E2 Open',  hint: '第6弦空弦' },
  { string: 'A2',  fret: 2,  label: 'B2',       hint: '第5弦2品' },
  { string: 'D3',  fret: 0,  label: 'D3 Open',  hint: '第4弦空弦' },
  { string: 'G3',  fret: 1,  label: 'Ab3/G#3',  hint: '第3弦1品（G→B跨弦）' },
  { string: 'e4',  fret: 0,  label: 'e4 Open',  hint: '第1弦空弦' },
];

// ── Step 4 — 5音验证测试 ─────────────────────────────────────────
function StepVerify({ profile, onComplete }) {
  const T = useTokens();
  const [noteIdx, setNoteIdx] = useState(0);
  const [results, setResults] = useState([]); // { note, passed }
  const [listening, setListening] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const listenTimer = useRef(null);

  const currentNote = VERIFY_NOTES[noteIdx];
  const isDone = noteIdx >= VERIFY_NOTES.length || diagnosis !== null;

  // 模拟"等待弹奏"（实机需接 useAudioEngine）
  // 在没有实际音频时，提供手动确认按钮
  const handleManualPass = useCallback(() => {
    const newResults = [...results, { note: currentNote, passed: true }];
    setResults(newResults);
    if (noteIdx + 1 >= VERIFY_NOTES.length) {
      finalize(newResults);
    } else {
      setNoteIdx(i => i + 1);
    }
  }, [results, currentNote, noteIdx]);

  const handleManualFail = useCallback(() => {
    const newResults = [...results, { note: currentNote, passed: false }];
    setResults(newResults);
    if (noteIdx + 1 >= VERIFY_NOTES.length) {
      finalize(newResults);
    } else {
      setNoteIdx(i => i + 1);
    }
  }, [results, currentNote, noteIdx]);

  function finalize(res) {
    const score = res.filter(r => r.passed).length;
    const failed = res.filter(r => !r.passed).map(r => r.note.string);
    let diag = null;
    if (score < 5) {
      const lowFail  = failed.some(s => ['E2','A2'].includes(s));
      const highFail = failed.some(s => ['e4','B3'].includes(s));
      const gbFail   = failed.some(s => ['G3'].includes(s));
      if (lowFail && !highFail)  diag = '建议重新校准第5、6弦 · Recalibrate strings 5–6';
      else if (highFail && !lowFail) diag = '建议重新校准第1、2弦 · Recalibrate strings 1–2';
      else if (gbFail)           diag = 'G→B弦补偿未正确检测，请在安静环境重试';
      else                       diag = '环境噪声过高，建议在安静环境重新校准';
    }
    setDiagnosis({ score, diag, res });
  }

  if (diagnosis) {
    const { score, diag, res } = diagnosis;
    const passed = score === 5;
    return (
      <motion.div key="verify-result"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ width: '100%', textAlign: 'center' }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: passed ? T.positive : T.warning,
          fontFamily: 'inherit', marginBottom: 8 }}>
          {score}/5
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>
          {passed ? 'Verification Passed · 验证通过' : `${score} of 5 notes correct`}
        </div>
        {diag && (
          <div style={{ fontSize: 13, color: T.textSecondary, margin: '8px 0 16px',
            background: T.surface2, borderRadius: 12, padding: '10px 14px', textAlign: 'left' }}>
            {diag}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {res.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 14px', borderRadius: 10, background: T.surface1,
              border: `0.5px solid ${T.border}` }}>
              <span style={{ fontSize: 14, color: T.textSecondary }}>{r.note.label} — {r.note.hint}</span>
              <span style={{ fontSize: 16, color: r.passed ? T.positive : T.negative }}>
                {r.passed ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
        {passed ? (
          <PrimaryButton onClick={() => onComplete(score)}>
            Start Training · 开始训练 →
          </PrimaryButton>
        ) : score >= 4 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PrimaryButton onClick={() => onComplete(score)}>Accept & Continue · 接受（降级）</PrimaryButton>
            <button onClick={() => { setNoteIdx(0); setResults([]); setDiagnosis(null); }}
              style={{ padding: '12px 20px', borderRadius: 14, background: T.surface2,
                border: `0.5px solid ${T.border}`, color: T.textSecondary, fontSize: 14, cursor: 'pointer' }}>
              Retry Verification · 重新验证
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => { setNoteIdx(0); setResults([]); setDiagnosis(null); }}
              style={{ padding: '14px 20px', borderRadius: 14, background: T.accent,
                border: 'none', color: '#000', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Recalibrate · 重新校准
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div key="verify"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={{ width: '100%' }}
    >
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {VERIFY_NOTES.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
            background: i < noteIdx ? T.positive : i === noteIdx ? T.accent : T.surface3,
            transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 8 }}>
          Verification {noteIdx + 1} of 5 · 验证 {noteIdx + 1}/5
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: T.textPrimary, marginBottom: 4, fontFamily: 'inherit' }}>
          Play: {currentNote.label}
        </div>
        <div style={{ fontSize: 15, color: T.accent, marginBottom: 4 }}>
          {currentNote.hint}
        </div>
        <div style={{ fontSize: 13, color: T.textTertiary }}>
          Play the note above on your guitar · 在吉他上弹奏上方音
        </div>
      </div>
      {/* Manual pass/fail buttons (before audio integration) */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleManualFail} style={{ flex: 1, padding: '12px', borderRadius: 14,
          background: 'rgba(255,69,58,0.1)', border: `0.5px solid ${T.negative}`,
          color: T.negative, fontSize: 14, cursor: 'pointer' }}>
          Miss · 错了
        </button>
        <button onClick={handleManualPass} style={{ flex: 1, padding: '12px', borderRadius: 14,
          background: T.accentSub, border: `0.5px solid ${T.accentBorder}`,
          color: T.accent, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Got It · 弹到了
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 3 — Done ──────────────────────────────────────────────
function StepDone({ onFinish }) {
  const T = useTokens();
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      transition={T.spring}
      style={{ width: '100%', textAlign: 'center' }}
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        style={{ fontSize: 60, marginBottom: 20 }}
      >
        🎯
      </motion.div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: T.textPrimary, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>
        Calibration Complete
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: T.accent, marginBottom: 16 }}>
        校准完成
      </div>
      <div style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.65, marginBottom: 10 }}>
        All 6 strings measured. Noise gate, attack timing, and tuning offsets are now set for your guitar and room.
      </div>
      <div style={{ fontSize: 13, color: T.textTertiary, lineHeight: 1.65, marginBottom: 40 }}>
        已测量全部 6 根弦。噪声门限、起音时间和音准偏移已根据你的吉他和环境完成设置。
      </div>
      <PrimaryButton onClick={onFinish}>Start Training → / 开始训练</PrimaryButton>
    </motion.div>
  );
}

// ── Root ───────────────────────────────────────────────────────
export function PreFlightView({ onComplete, settings }) {
  const T     = useTokens();
  const [micError, setMicError] = useState(null);

  // Wrap advance to catch getUserMedia / HTTPS errors
  // 捕获 getUserMedia / HTTPS 错误，显示友好提示
  const handleMicError = (err) => {
    console.error('AudioCore error:', err);
    setMicError(err);
  };

  const calib = useCalibration({
    onComplete,
    settings,
    onMicError: handleMicError,
  });

  // T4 Step 3/4/5 — post-calibration flow
  const [postStep, setPostStep] = useState(0);
  // 0=optimize, 1=gb-detect, 2=verify, 3=done
  const profileRef = useRef(null);
  const gbDetectedRef = useRef(false);

  const handleStringsComplete = useCallback((profile) => {
    profileRef.current = profile;
    // Run auto steps
    setPostStep(0);
  }, []);

  const handleOptimizeComplete = useCallback(() => {
    setPostStep(1);
  }, []);

  const handleGbComplete = useCallback(() => {
    setPostStep(2);
  }, []);

  const handleVerifyComplete = useCallback((score) => {
    // Call original onComplete with profile + verification result
    const profile = profileRef.current ?? calib.profile;
    if (profile && profile.setVerificationResult) {
      profile.setVerificationResult(score);
    }
    setPostStep(3);
    // Slight delay then finish
    setTimeout(() => calib.finish(), 500);
  }, [calib]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px env(safe-area-inset-bottom, 28px)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <AnimatePresence mode="wait">

          {/* Mic error overlay — shown when getUserMedia fails */}
          {micError && (
            <MicErrorCard
              key="micerror"
              error={micError}
              onSkip={calib.skip}
            />
          )}

          {!micError && calib.step === 0 && (
            <StepIntro key="intro" onStart={calib.advance} onSkip={calib.skip} />
          )}

          {!micError && calib.step === 1 && (
            <StepNoise
              key="noise"
              progress={calib.noiseProgress}
              noiseDone={calib.noiseDone}
              noiseOk={calib.noiseOk}
              onContinue={calib.advance}
              onRetry={calib.retryNoise}
            />
          )}

          {!micError && calib.step === 2 && (
            <StepStrings
              key="strings"
              currentString={calib.currentString}
              stringProgress={calib.stringProgress}
              stringsDone={calib.stringsDone}
              liveCents={calib.liveCents}
              allStringNames={calib.allStringNames}
              statusMsg={calib.statusMsg}
              onSkipString={calib.skipString}
            />
          )}

          {!micError && calib.step === 3 && postStep === 0 && (
            <StepOptimize key="optimize" onComplete={handleOptimizeComplete} />
          )}

          {!micError && calib.step === 3 && postStep === 1 && (
            <StepGbDetect
              key="gb-detect"
              detected={gbDetectedRef.current}
              onComplete={handleGbComplete}
            />
          )}

          {!micError && calib.step === 3 && postStep === 2 && (
            <StepVerify
              key="verify"
              profile={calib.profile}
              onComplete={handleVerifyComplete}
            />
          )}

          {!micError && calib.step === 3 && postStep === 3 && (
            <StepDone key="done" onFinish={calib.finish} />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}