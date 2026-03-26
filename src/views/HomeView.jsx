
// ─────────────────────────────────────────────────────────────
// HomeView.jsx — Solo Vision Ultra v6.0
// HTML母本: HomeView_v2.html
//
// 结构层级:
//   Greeting → Hero Carousel (3 slides) → Bento Grid
//   → Teaching L0 → Weak+Knowledge → Info Feed
// ─────────────────────────────────────────────────────────────
import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT, SPRINGS } from "../theme";
import { ThemeContext } from "../contexts";
import { useLang } from "../i18n";

function useT()      { return useContext(ThemeContext)?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark   ?? false; }

// ── Glass surface helper ──────────────────────────────────────
// v6: T.glass.surface1 takes full priority — supports all theme surfaces
function glassStyle(T, isDark, extra = {}) {
  const fallbackBg = isDark ? "rgba(20,20,40,0.65)" : "rgba(255,255,255,0.80)";
  return {
    background:          T.glass?.surface1 ?? fallbackBg,
    backdropFilter:      T.glass?.blur ?? "blur(22px) saturate(180%)",
    WebkitBackdropFilter:T.glass?.blur ?? "blur(22px) saturate(180%)",
    border:              `0.5px solid ${T.glass?.border ?? T.border ?? "rgba(110,120,180,0.13)"}`,
    boxShadow:           T.glass?.shadow ?? (isDark
      ? "0 2px 16px rgba(0,0,0,0.25)"
      : "0 2px 16px rgba(60,70,150,0.08), inset 0 0.5px 0 rgba(255,255,255,0.90)"),
    ...extra,
  };
}

// ── Greeting ──────────────────────────────────────────────────
function getGreeting(lang) {
  const h = new Date().getHours();
  if (lang === "en") {
    if (h < 12) return "Good Morning.";
    if (h < 18) return "Good Afternoon.";
    return "Good Evening.";
  }
  if (h < 12) return "早上好。";
  if (h < 18) return "下午好。";
  return "晚上好。";
}

// ── Hero Slides data ──────────────────────────────────────────
function buildHeroSlides(T, progress, isZh, accent) {
  const weakInterval = (progress?.weakIntervals ?? [])[0] ?? "b3";
  const weakAcc      = progress?.intervalHeatmap?.[weakInterval]
    ? Math.round((progress.intervalHeatmap[weakInterval].correct /
        progress.intervalHeatmap[weakInterval].attempts) * 100)
    : 41;
  const todayPct     = Math.min(100, Math.round((progress?.todayMinutes ?? 0) / 20 * 100));

  return [
    {
      badge:     isZh ? "继续上次" : "Resume",
      badgeVariant: "a",
      statBig:   `${todayPct}`,
      statUnit:  isZh ? "% 完成" : "% done",
      statSub:   isZh ? "今日目标进度" : "Today's goal",
      title:     isZh ? <>音程训练器<br /><em>Find Root · All 11</em></> : <>Interval Trainer<br /><em>Find Root · All 11</em></>,
      progLabel: isZh ? "今日目标进度" : "Today's goal",
      progValue: todayPct,
      ctaLabel:  isZh ? "继续 ›" : "Resume ›",
      ctaColor:  accent,
      trainer:   "interval",
    },
    {
      badge:     isZh ? "今日推荐" : "Recommended",
      badgeVariant: "g",
      title:     isZh ? <>专注练习<br /><em>{weakInterval}</em></> : <>Focus Practice<br /><em>{weakInterval}</em></>,
      desc:      isZh
        ? `你的 ${weakInterval} 准确率仅 ${weakAcc}%。今天花 12 分钟，只练这一个音程形状。`
        : `Your ${weakInterval} accuracy is only ${weakAcc}%. Spend 12 min on this one shape today.`,
      progLabel: isZh ? `${weakInterval} 准确率` : `${weakInterval} accuracy`,
      progValue: weakAcc,
      progColor: T.negative ?? "#c24050",
      ctaLabel:  isZh ? "开始 ›" : "Start ›",
      ctaColor:  T.positive ?? "#22a672",
      trainer:   "interval",
    },
    {
      badge:     isZh ? "教学引导" : "Teaching",
      badgeVariant: "o",
      title:     isZh ? <>根音是你的<br /><em>视觉锚点</em></> : <>Root Is Your<br /><em>Visual Anchor</em></>,
      desc:      isZh
        ? "每次找音程，都从最近的根音出发。先找根，再找形状，大声说出来。"
        : "Find root first, then the shape. Say it out loud every time.",
      footerNote: isZh ? "共 3 分钟 · L0 教学" : "3 min · L0 Teaching",
      ctaLabel:  isZh ? "了解 ›" : "Learn ›",
      ctaColor:  T.warning ?? "#c07830",
      trainer:   null,
    },
  ];
}

// Badge colors
function heroBadgeStyle(variant, T) {
  const MAP = {
    a: { bg: T.accentSub ?? "rgba(90,90,214,0.10)", color: T.accent ?? "#5a5ad6", border: T.accentBorder ?? "rgba(90,90,214,0.20)" },
    g: { bg: (T.positive ?? "#22a672") + "18",      color: T.positive ?? "#22a672",  border: (T.positive ?? "#22a672") + "38" },
    o: { bg: (T.warning  ?? "#c07830") + "18",      color: T.warning  ?? "#c07830",  border: (T.warning  ?? "#c07830") + "38" },
  };
  return MAP[variant] ?? MAP.a;
}

// ── Hero Carousel ─────────────────────────────────────────────
function HeroCarousel({ T, isDark, progress, isZh, accent, onGoTrainer }) {
  const [cur, setCur]     = useState(0);
  const [dir, setDir]     = useState(1);
  const timerRef          = useRef(null);
  const slides            = buildHeroSlides(T, progress, isZh, accent);

  const goSlide = useCallback((n, d = 1) => {
    setDir(d);
    setCur(n);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCur(prev => {
        setDir(1);
        return prev === 0 ? 1 : (prev + 1) % slides.length;
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const stopTimer = () => clearInterval(timerRef.current);

  const slide = slides[cur];
  const badge = heroBadgeStyle(slide.badgeVariant, T);

  return (
    <div style={{ position: "relative" }}>
      {/* Card */}
      <div
        onTouchStart={stopTimer}
        onClick={() => slide.trainer && onGoTrainer(slide.trainer)}
        style={{
          ...glassStyle(T, isDark),
          minHeight:    210,
          padding:      "22px 22px 20px",
          borderRadius: 28,
          cursor:       slide.trainer ? "pointer" : "default",
          position:     "relative",
          overflow:     "hidden",
          background:   T.surface1,
          border: `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.18)"}`,
          boxShadow: isDark
            ? "0 8px 32px rgba(90,90,214,0.22)"
            : "0 8px 32px rgba(90,90,214,0.12), 0 2px 8px rgba(90,90,214,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        {/* Top accent stripe */}
        <div style={{
          position:   "absolute", top: 0, left: 20, right: 20, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${accent}58, rgba(160,100,240,0.4), transparent)`,
          pointerEvents: "none",
        }} />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={cur}
            custom={dir}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.36, ease: [0.32, 0, 0.22, 1] }}
            style={{ height: "100%" }}
          >
            {/* Badge */}
            <div style={{
              display:       "inline-flex", alignItems: "center", gap: 5,
              padding:       "4px 10px",   borderRadius: 8,
              fontSize:      9.5,          fontWeight: 700,
              letterSpacing: "0.10em",     textTransform: "uppercase",
              marginBottom:  14,           alignSelf: "flex-start",
              background:    badge.bg,
              color:         badge.color,
              border:        `0.5px solid ${badge.border}`,
              fontFamily:    FONT_TEXT,
            }}>
              {slide.badge}
            </div>

            {/* Big stat (slide 0 only) */}
            {slide.statBig && (
              <div style={{ display: "flex", gap: 14, alignItems: "baseline", marginBottom: 14 }}>
                <div style={{
                  fontFamily:    FONT_DISPLAY,
                  fontSize:      56,
                  color:         accent,
                  lineHeight:    1,
                  letterSpacing: "-2px",
                }}>
                  {slide.statBig}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: T.textSecondary, fontWeight: 600 }}>
                    {slide.statUnit}
                  </div>
                  {slide.statSub && (
                    <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>
                      {slide.statSub}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <div style={{
              fontFamily:    FONT_DISPLAY,
              fontSize:      slide.statBig ? 22 : 26,
              color:         T.textPrimary,
              lineHeight:    1.18,
              letterSpacing: "-0.5px",
              marginBottom:  slide.desc ? 8 : 18,
              flex:          1,
            }}>
              {React.Children.map(
                typeof slide.title === "string" ? [slide.title] : [slide.title],
                (child) => React.cloneElement
                  ? React.isValidElement(child)
                    ? React.cloneElement(child, {}, ...React.Children.map(child.props.children, c =>
                        React.isValidElement(c) && c.type === "em"
                          ? <em style={{ fontStyle: "italic", color: accent }}>{c.props.children}</em>
                          : c
                      ))
                    : child
                  : child
              )}
            </div>

            {/* Desc */}
            {slide.desc && (
              <div style={{
                fontSize:     13, color: T.textSecondary,
                lineHeight:   1.55, marginBottom: 18, fontFamily: FONT_TEXT,
              }}>
                {slide.desc}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {slide.progLabel ? (
                <div style={{ flex: 1, marginRight: 14 }}>
                  <div style={{ fontSize: 10, color: T.textTertiary, marginBottom: 5, letterSpacing: "0.02em", fontFamily: FONT_TEXT }}>
                    {slide.progLabel}
                  </div>
                  <div style={{
                    height: 3.5, borderRadius: 2,
                    background: isDark ? "rgba(90,90,214,0.15)" : "rgba(90,90,214,0.10)",
                    overflow: "hidden",
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${slide.progValue}%` }}
                      transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                      style={{
                        height: "100%", borderRadius: 2,
                        background: slide.progColor
                          ? `linear-gradient(90deg, ${slide.progColor}, ${slide.progColor}bb)`
                          : `linear-gradient(90deg, ${accent}, rgba(160,100,240,0.8))`,
                      }}
                    />
                  </div>
                </div>
              ) : slide.footerNote ? (
                <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT }}>
                  {slide.footerNote}
                </div>
              ) : <div />}

              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 16px", borderRadius: 12,
                background: slide.ctaColor,
                color: "#fff",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                flexShrink: 0,
                boxShadow: `0 2px 8px ${slide.ctaColor}48`,
                fontFamily: FONT_TEXT,
              }}>
                {slide.ctaLabel}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {slides.map((_, i) => (
          <motion.div
            key={i}
            onClick={() => goSlide(i, i > cur ? 1 : -1)}
            animate={{
              width:      i === cur ? 20 : 6,
              background: i === cur ? accent : (isDark ? "rgba(90,90,214,0.22)" : "rgba(90,90,214,0.18)"),
            }}
            transition={SPRINGS.feather}
            style={{ height: 6, borderRadius: 3, cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Bento Grid ────────────────────────────────────────────────
function BentoGrid({ T, isDark, progress, isZh, accent, onGoTrainer }) {
  const [activePill, setActivePill] = useState(0);
  const weakInterval = (progress?.weakIntervals ?? [])[0] ?? "b3";
  const todayMin     = progress?.todayMinutes ?? 22;
  const streakDays   = progress?.streakDays   ?? 12;

  const PILLS = [
    { label: isZh ? "Track A — 入门" : "Track A — Beginner", sub: isZh ? "根音 → b3 / 5 / b7" : "Root → b3 / 5 / b7" },
    { label: isZh ? "Track B — 进阶" : "Track B — Advanced", sub: isZh ? "全 11 音程"           : "All 11 Intervals"   },
    { label: isZh ? "Track C — 和声" : "Track C — Harmony",  sub: isZh ? "Changes + Scale"      : "Changes + Scale"    },
  ];

  // Week calendar
  const today   = new Date().getDay(); // 0=Sun
  const daysZh  = ["日","一","二","三","四","五","六"];
  const daysEn  = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const days    = isZh ? daysZh : daysEn;
  const weekItems = days.map((d, i) => {
    const isToday  = i === today;
    const isPast   = streakDays > 0 && !isToday && (
      (today >= i && today - i <= streakDays) ||
      (today < i && 7 - i + today <= streakDays)
    );
    // simplified: mark a few days as done based on streak
    const doneCount = Math.min(streakDays, 7);
    const todayIdx  = today;
    const dist      = (todayIdx - i + 7) % 7;
    const done      = !isToday && dist > 0 && dist <= doneCount;
    return { label: d, isToday, done };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

      {/* Main suggestion card — full width */}
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={() => onGoTrainer("interval")}
        style={{
          ...glassStyle(T, isDark),
          gridColumn:  "1 / -1",
          padding:     "18px 18px 16px",
          borderRadius: 22,
          position:    "relative",
          overflow:    "hidden",
          cursor:      "pointer",
        }}
      >
        {/* Decorative orb */}
        <div style={{
          position:     "absolute", top: -20, right: -20,
          width:        140, height: 140, borderRadius: "50%",
          background:   `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          pointerEvents:"none",
        }} />
        <div style={{
          fontSize:      9, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: T.textTertiary, marginBottom: 8,
          fontFamily: FONT_TEXT,
        }}>
          {isZh ? "今日训练组合" : "Today's Session"}
        </div>
        <div style={{
          fontSize:      18, fontWeight: 800, color: T.textPrimary,
          letterSpacing: "-0.4px", lineHeight: 1.2, marginBottom: 6,
          fontFamily: FONT_DISPLAY,
        }}>
          {isZh ? "音程 + 和弦进行" : "Intervals + Changes"}
        </div>
        <div style={{
          fontSize: 12, color: T.textSecondary, lineHeight: 1.5, marginRight: 40,
          fontFamily: FONT_TEXT,
        }}>
          {isZh
            ? `${weakInterval} / 5 / b7 重点练习 · Changes Dm7–G7 · 约 25 分钟`
            : `${weakInterval} / 5 / b7 focus · Changes Dm7–G7 · ~25 min`}
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
          {[weakInterval, "5", "b7"].map(chip => (
            <span key={chip} style={{
              padding:    "3px 9px", borderRadius: 8,
              fontSize:   10, fontWeight: 700,
              background: T.accentSub    ?? "rgba(90,90,214,0.08)",
              color:      T.accent       ?? "#5a5ad6",
              border:     `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.18)"}`,
              fontFamily: FONT_TEXT,
            }}>
              {chip}
            </span>
          ))}
          <span style={{
            padding:    "3px 9px", borderRadius: 8,
            fontSize:   10, fontWeight: 700,
            background: (T.positive ?? "#22a672") + "18",
            color:      T.positive  ?? "#22a672",
            border:     `0.5px solid ${(T.positive ?? "#22a672")}38`,
            fontFamily: FONT_TEXT,
          }}>
            {isZh ? "Find Root" : "Find Root"}
          </span>
        </div>
        {/* Arrow btn */}
        <div style={{
          position:       "absolute", bottom: 16, right: 16,
          width:          32, height: 32, borderRadius: 10,
          background:     accent,
          display:        "flex", alignItems: "center", justifyContent: "center",
          boxShadow:      `0 2px 8px ${accent}48`,
          fontSize:       18, fontWeight: 700, color: "#fff",
        }}>
          ›
        </div>
      </motion.div>

      {/* Today minutes stat card */}
      <div style={{
        ...glassStyle(T, isDark, { background: T.surface1 }),
        padding:      "14px 14px 12px",
        borderRadius: 14,
        display:      "flex", flexDirection: "column",
        justifyContent: "space-between",
        minHeight:    96,
      }}>
        <div>
          <div style={{
            fontSize:      9.5, fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase", color: T.textTertiary, fontFamily: FONT_TEXT,
          }}>
            {isZh ? "今日练习" : "Today"}
          </div>
          <div style={{
            fontFamily:    FONT_DISPLAY,
            fontSize:      36, lineHeight: 1,
            letterSpacing: "-1.5px", marginTop: 4, color: accent,
          }}>
            {todayMin}
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, fontWeight: 500, marginTop: 2, fontFamily: FONT_TEXT }}>
            {isZh ? "分钟" : "min"}
          </div>
        </div>
        {/* Mini bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginTop: 8 }}>
          {[12, 20, 28, 22, 30, 16, 24].map((h, i) => (
            <div key={i} style={{
              width:        6, height: h, borderRadius: 2,
              background:   h >= 28
                ? accent
                : h >= 20
                  ? accent + "72"
                  : isDark ? "rgba(90,90,214,0.18)" : "rgba(90,90,214,0.15)",
              transition:   "height 0.4s ease",
            }} />
          ))}
        </div>
      </div>

      {/* Streak stat card */}
      <div style={{
        ...glassStyle(T, isDark, { background: T.surface1 }),
        padding:      "14px 14px 12px",
        borderRadius: 14,
        display:      "flex", flexDirection: "column",
        justifyContent: "space-between",
        minHeight:    96,
      }}>
        <div>
          <div style={{
            fontSize:      9.5, fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase", color: T.textTertiary, fontFamily: FONT_TEXT,
          }}>
            {isZh ? "连续天数" : "Streak"}
          </div>
          <div style={{
            fontFamily:    FONT_DISPLAY,
            fontSize:      36, lineHeight: 1,
            letterSpacing: "-1.5px", marginTop: 4, color: T.positive ?? "#22a672",
          }}>
            {streakDays}
          </div>
          <div style={{ fontSize: 11, color: T.textTertiary, fontWeight: 500, marginTop: 2, fontFamily: FONT_TEXT }}>
            {isZh ? "天" : "days"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <svg width="12" height="14" viewBox="0 0 12 16" fill="none">
            <path d="M6 1C6 1 10 5 10 9C10 12 8.2 14 6 14C3.8 14 2 12 2 9C2 5 6 1 6 1Z"
              stroke={T.warning ?? "#c07830"} strokeWidth="1.2"
              fill={isDark ? "rgba(192,120,48,0.15)" : "rgba(192,120,48,0.12)"} />
            <path d="M5 9C5 9 6 7.5 7 9" stroke={T.warning ?? "#c07830"}
              strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 10, color: T.warning ?? "#c07830", fontWeight: 700, fontFamily: FONT_TEXT }}>
            {isZh ? "个人最长 28 天" : "Best 28 days"}
          </span>
        </div>
      </div>

      {/* Weekly calendar — full width */}
      <div style={{
        ...glassStyle(T, isDark, { background: T.surface1 }),
        gridColumn:   "1 / -1",
        padding:      "14px 16px 12px",
        borderRadius: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
            {isZh ? "本周练习" : "This Week"}
          </span>
          <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT }}>
            {Math.min(streakDays, 7)} / 7 {isZh ? "天" : "days"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {weekItems.map((item, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                height:         36, width: "100%", borderRadius: 9,
                display:        "flex", alignItems: "center", justifyContent: "center",
                fontSize:       item.isToday ? 9 : 10, fontWeight: 700,
                background:     item.isToday
                  ? (T.accentSub ?? "rgba(90,90,214,0.18)")
                  : item.done
                    ? accent
                    : (isDark ? "rgba(110,120,180,0.10)" : "rgba(110,120,180,0.07)"),
                color:          item.isToday
                  ? accent
                  : item.done
                    ? "#fff"
                    : T.textTertiary,
                border:         item.isToday
                  ? `1px solid ${accent}48`
                  : "none",
                letterSpacing:  item.isToday ? "0.05em" : undefined,
              }}>
                {item.done ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <polyline points="1,4 4,7 9,1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : item.isToday ? (isZh ? "今" : "Now") : null}
              </div>
              <span style={{
                fontSize:   8.5, fontWeight: item.isToday ? 700 : 500,
                color:      item.isToday ? accent : T.textTertiary,
                fontFamily: FONT_TEXT,
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Track pills — full width, horizontal scroll */}
      <div style={{
        gridColumn:  "1 / -1",
        display:     "flex",
        gap:         8,
        overflowX:   "auto",
        scrollbarWidth: "none",
        margin:      "0 -16px",
        padding:     "0 16px 2px",
      }}>
        {PILLS.map((pill, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActivePill(i)}
            style={{
              flexShrink:    0,
              padding:       "10px 14px",
              borderRadius:  12,
              cursor:        "pointer",
              whiteSpace:    "nowrap",
              ...glassStyle(T, isDark, {
                background:  i === activePill
                  ? (T.accentSub ?? "rgba(90,90,214,0.10)")
                  : T.surface1,
                border: `0.5px solid ${i === activePill
                  ? (T.accentBorder ?? "rgba(90,90,214,0.28)")
                  : (T.border ?? "rgba(110,120,180,0.13)")}`,
              }),
            }}
          >
            <div style={{
              fontSize:      11.5, fontWeight: 700,
              color:         i === activePill ? accent : T.textSecondary,
              letterSpacing: "-0.1px", fontFamily: FONT_DISPLAY,
            }}>
              {pill.label}
            </div>
            <div style={{ fontSize: 9.5, color: T.textTertiary, marginTop: 2, fontFamily: FONT_TEXT }}>
              {pill.sub}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Teaching L0 Card ──────────────────────────────────────────
const TEACH_TIPS = [
  {
    title:   "两点音程形状系统",
    titleEn: "Two-Point Shape System",
    body:    "每个音程在指板上都有固定的视觉形状。从根音出发，找到形状，大声说出名字。共 48 个基本形状，全部可以练习。",
    bodyEn:  "Every interval has a fixed visual shape on the fretboard. Start from root, find the shape, say it aloud. 48 basic shapes, all trainable.",
  },
  {
    title:   "Root First 原则",
    titleEn: "Root First Principle",
    body:    "每道题都先弹根音，确认位置后再找目标音程。这个顺序不能反。先建立参考点，再导航到目标。",
    bodyEn:  "Always play root first, confirm position, then find the target interval. Establish reference before navigating.",
  },
  {
    title:   "大声说出来",
    titleEn: "Vocalize It",
    body:    "找到音程后，大声说出音程名和形状方向。说出来能激活主动记忆，而不只是肌肉反应。",
    bodyEn:  "After finding the interval, say its name and direction aloud. This activates active memory, not just muscle reflex.",
  },
];

function TeachCard({ T, isDark, isZh, accent }) {
  const [tipIdx, setTipIdx] = useState(0);
  const tip = TEACH_TIPS[tipIdx];

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      style={{
        ...glassStyle(T, isDark),
        padding:      "20px 20px 18px",
        borderRadius: 22,
        position:     "relative",
        overflow:     "hidden",
        cursor:       "pointer",
      }}
    >
      {/* Accent line top */}
      <div style={{
        position:     "absolute", top: 0, left: 0, right: 0, height: 1,
        background:   `linear-gradient(90deg, transparent 0%, ${accent} 40%, rgba(160,100,255,0.6) 70%, transparent 100%)`,
        opacity:      0.3, pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          display:    "flex", alignItems: "center", gap: 6,
          padding:    "4px 10px", borderRadius: 8,
          background: T.accentSub    ?? "rgba(90,90,214,0.10)",
          border:     `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.18)"}`,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={accent} strokeWidth="1.8" strokeLinecap="round">
            <circle cx="6"  cy="16" r="2.5" fill={accent} stroke="none" />
            <circle cx="18" cy="16" r="2.5" />
            <path d="M8.5 14Q12 9 15.5 14" />
          </svg>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase", color: accent, fontFamily: FONT_TEXT,
          }}>
            {isZh ? "音程训练系统" : "Interval System"}
          </span>
        </div>
        <div style={{
          fontSize:      9, fontWeight: 700, letterSpacing: "0.10em",
          textTransform: "uppercase", color: T.textTertiary,
          padding:       "3px 7px", borderRadius: 6,
          border:        `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
          fontFamily:    FONT_TEXT,
        }}>
          L0
        </div>
      </div>

      {/* Title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tipIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28 }}
        >
          <div style={{
            fontFamily:    FONT_DISPLAY,
            fontSize:      22, color: T.textPrimary,
            letterSpacing: "-0.3px", lineHeight: 1.25, marginBottom: 9,
          }}>
            {isZh ? tip.title : tip.titleEn}
          </div>
          <div style={{
            fontSize:     13, color: T.textSecondary, lineHeight: 1.65,
            marginBottom: 14, fontFamily: FONT_TEXT,
            borderLeft:   `2px solid ${accent}28`,
            paddingLeft:  12,
          }}>
            {isZh ? tip.body : tip.bodyEn}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <motion.div
          whileTap={{ scale: 0.93 }}
          onClick={() => setTipIdx(i => (i + 1) % TEACH_TIPS.length)}
          style={{
            display:    "flex", alignItems: "center", gap: 5,
            fontSize:   12, fontWeight: 700, color: accent, fontFamily: FONT_TEXT,
            padding:    "6px 12px", borderRadius: 10,
            background: T.accentSub    ?? "rgba(90,90,214,0.10)",
            border:     `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.18)"}`,
            cursor:     "pointer",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6M7 4l2 2-2 2" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {isZh ? "下一条" : "Next"}
        </motion.div>
        <div style={{ display: "flex", gap: 4 }}>
          {TEACH_TIPS.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setTipIdx(i)}
              animate={{
                width:      i === tipIdx ? 12 : 4,
                background: i === tipIdx ? accent : (T.border ?? "rgba(110,120,180,0.22)"),
              }}
              style={{ height: 4, borderRadius: 2, cursor: "pointer" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Weak + Knowledge (asymmetric grid) ────────────────────────
function WeakKnowledgeRow({ T, isDark, progress, isZh, accent, onGoTrainer }) {
  const weakInterval = (progress?.weakIntervals ?? [])[0] ?? "b3";
  const hm           = progress?.intervalHeatmap ?? {};
  const weakData     = hm[weakInterval];
  const weakAcc      = weakData
    ? Math.round((weakData.correct / weakData.attempts) * 100)
    : 41;
  const neg          = T.negative ?? "#c24050";
  const warn         = T.warning  ?? "#c07830";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 8 }}>

      {/* Weak interval card */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        onClick={() => onGoTrainer("interval")}
        style={{
          ...glassStyle(T, isDark),
          padding:      "16px 14px 14px",
          borderRadius: 14,
          cursor:       "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: neg, flexShrink: 0 }} />
          <span style={{
            fontSize:      9.5, fontWeight: 700, letterSpacing: "0.10em",
            textTransform: "uppercase", color: neg, fontFamily: FONT_TEXT,
          }}>
            {isZh ? "需要练习" : "Needs Work"}
          </span>
        </div>

        <div style={{
          fontFamily:    FONT_DISPLAY,
          fontSize:      48, color: T.textPrimary,
          lineHeight:    1, letterSpacing: "-2px", marginBottom: 2,
        }}>
          {weakInterval}
        </div>
        <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 10, fontFamily: FONT_TEXT }}>
          Minor 3rd
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 5,
          }}>
            <span style={{ fontSize: 9.5, color: T.textTertiary, fontFamily: FONT_TEXT }}>
              {isZh ? "准确率" : "Accuracy"}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: neg, fontFamily: FONT_TEXT }}>
              {weakAcc}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: neg + "20", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weakAcc}%` }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 2, background: neg }}
            />
          </div>
        </div>

        <div style={{
          display:    "flex", alignItems: "center", gap: 5,
          fontSize:   11, fontWeight: 700, color: neg, fontFamily: FONT_TEXT,
          padding:    "6px 10px", borderRadius: 9,
          background: neg + "18", alignSelf: "flex-start",
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polygon points="2,1 9,5 2,9" fill={neg} />
          </svg>
          {isZh ? "立即练习" : "Practice"}
        </div>
      </motion.div>

      {/* Knowledge card */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        style={{
          ...glassStyle(T, isDark, { background: T.surface1 }),
          padding:        "14px 13px 13px",
          borderRadius:   14,
          display:        "flex",
          flexDirection:  "column",
          cursor:         "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 7,
            background: warn + "18",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"
              stroke={warn} strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 7v5M8 5.5v.5" />
            </svg>
          </div>
          <span style={{
            fontSize:      9, fontWeight: 700, letterSpacing: "0.09em",
            textTransform: "uppercase", color: warn, fontFamily: FONT_TEXT,
          }}>
            {isZh ? "今日知识" : "Insight"}
          </span>
        </div>

        <div style={{
          fontSize:      12.5, fontWeight: 800, color: T.textPrimary,
          lineHeight:    1.35, marginBottom: 7, letterSpacing: "-0.2px",
          fontFamily:    FONT_DISPLAY,
        }}>
          {isZh ? "同一形状适用多种和声场景" : "One shape, many contexts"}
        </div>
        <div style={{
          fontSize:   10.5, color: T.textSecondary,
          lineHeight: 1.55, flex: 1, fontFamily: FONT_TEXT,
        }}>
          {isZh
            ? "上行 b3 出现在 Dorian、Phrygian 等多种调式中，一次练习，多处通用。"
            : "Ascending b3 appears in Dorian, Phrygian, and more. One drill, multiple contexts."}
        </div>
        <div style={{
          display:       "flex", alignItems: "center", justifyContent: "flex-end",
          marginTop:     10,
          fontSize:      10, fontWeight: 700, color: accent, fontFamily: FONT_TEXT,
          gap:           3,
        }}>
          {isZh ? "阅读" : "Read"}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 2l4 3-4 3" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

// ── Info Feed Card ────────────────────────────────────────────
function InfoFeed({ T, isDark, isZh, accent, onRecalibrate }) {
  const neg  = T.negative ?? "#c24050";
  const pos  = T.positive ?? "#22a672";
  const warn = T.warning  ?? "#c07830";

  const rows = [
    {
      iconBg: T.accentSub ?? "rgba(90,90,214,0.10)",
      icon:   <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 2v4l3 2" /><circle cx="8" cy="8" r="6.5" />
              </svg>,
      label:  isZh ? "主题系统 v10.1 已更新" : "Theme system v10.1 updated",
      meta:   isZh ? "22 个主题 · 刚刚" : "22 themes · just now",
      right:  isZh ? "查看更新 ›" : "View ›",
      rightColor: accent,
    },
    {
      iconBg: pos + "18",
      icon:   <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={pos} strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 8h10M10 5l3 3-3 3" />
              </svg>,
      label:  isZh ? "长按把手进入控制台" : "Long-press handle for Control Center",
      meta:   isZh ? "使用技巧 · L0 教学" : "Tip · L0 Teaching",
      right:  isZh ? "直达 ›" : "Go ›",
      rightColor: pos,
    },
    {
      iconBg: warn + "18",
      icon:   <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke={warn} strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6.5" /><path d="M8 7v5M8 5.5v.5" />
              </svg>,
      label:  isZh ? "校准已超过 7 天" : "Calibration is over 7 days old",
      meta:   isZh ? "识别准确度可能下降" : "Detection accuracy may have dropped",
      right:  isZh ? "重新校准 ›" : "Recalibrate ›",
      rightColor: warn,
      onClick: onRecalibrate,
    },
  ];

  return (
    <div style={{
      ...glassStyle(T, isDark, { background: T.surface1 }),
      padding:      "14px 16px",
      borderRadius: 14,
      overflow:     "hidden",
    }}>
      <div style={{
        display:       "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 10,
      }}>
        <span style={{
          fontSize:      11, fontWeight: 700, color: T.textTertiary,
          letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT_TEXT,
        }}>
          {isZh ? "系统动态" : "Updates"}
        </span>
        <span style={{ fontSize: 10, color: accent, fontWeight: 600, fontFamily: FONT_TEXT, cursor: "pointer" }}>
          {isZh ? "全部 ›" : "All ›"}
        </span>
      </div>

      {rows.map((row, i) => (
        <motion.div
          key={i}
          whileTap={{ opacity: 0.6 }}
          onClick={row.onClick}
          style={{
            display:    "grid",
            gridTemplateColumns: "1fr 14px 1fr",
            alignItems: "center",
            gap:        0,
            padding:    "9px 0",
            borderTop:  i > 0 ? `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}` : "none",
            cursor:     row.onClick ? "pointer" : "default",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: row.iconBg,
              display:    "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {row.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize:     11, fontWeight: 600, color: T.textPrimary,
                whiteSpace:   "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                fontFamily:   FONT_TEXT,
              }}>
                {row.label}
              </div>
              <div style={{ fontSize: 9.5, color: T.textTertiary, marginTop: 1, fontFamily: FONT_TEXT }}>
                {row.meta}
              </div>
            </div>
          </div>

          {/* divider line */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 1, height: "100%", minHeight: 32, background: T.border ?? "rgba(110,120,180,0.13)" }} />
          </div>

          <div style={{
            display:       "flex", alignItems: "center", justifyContent: "flex-end",
            fontSize:      11, fontWeight: 700, color: row.rightColor,
            whiteSpace:    "nowrap", fontFamily: FONT_TEXT,
          }}>
            {row.right}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function HomeView({
  settings,
  onTabChange,
  historyData,
  T: _T,
  isDark: _isDark,
  progress,
  onOpenStageMap,
  onRecalibrate,
}) {
  const T      = useT();
  const isDark = useIsDark();
  const { lang } = useLang();
  const isZh   = lang !== "en";
  const accent = T.accent ?? "#5a5ad6";

  const greeting = getGreeting(lang);

  const goToTrainer = useCallback((trainerId) => {
    onTabChange?.(trainerId);
  }, [onTabChange]);

  return (
    <>
      {/* Global shimmer keyframe */}
      <style>{`
        @keyframes svuShimmer { from { left: -100%; } to { left: 120%; } }
      `}</style>

      <div style={{ paddingBottom: 24 }}>

        {/* ── Greeting ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding:        "14px 4px 16px",
            display:        "flex",
            alignItems:     "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{
              fontFamily:    FONT_DISPLAY,
              fontSize:      32, color: T.textPrimary,
              letterSpacing: "-0.4px", lineHeight: 1.1,
            }}>
              {greeting}
            </div>
            <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 5, fontFamily: FONT_TEXT }}>
              {isZh
                ? `继续你的 ${(progress?.weakIntervals ?? [])[0] ?? "b3"} 形状练习`
                : `Continue your ${(progress?.weakIntervals ?? [])[0] ?? "b3"} shape practice`}
            </div>
          </div>

          {/* Avatar / user icon */}
          <div style={{
            width:          36, height: 36, borderRadius: 12,
            background:     T.accentSub    ?? "rgba(90,90,214,0.12)",
            border:         `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.22)"}`,
            display:        "flex", alignItems: "center", justifyContent: "center",
            flexShrink:     0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={accent} strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        </motion.div>

        {/* ── Content sections ──────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* LAYER 1 — Hero Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroCarousel
              T={T} isDark={isDark} progress={progress}
              isZh={isZh} accent={accent}
              onGoTrainer={goToTrainer}
            />
          </motion.div>

          {/* LAYER 2 — Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <BentoGrid
              T={T} isDark={isDark} progress={progress}
              isZh={isZh} accent={accent}
              onGoTrainer={goToTrainer}
            />
          </motion.div>

          {/* LAYER 3 — Teaching L0 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <TeachCard T={T} isDark={isDark} isZh={isZh} accent={accent} />
          </motion.div>

          {/* LAYER 5 — Weak + Knowledge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <WeakKnowledgeRow
              T={T} isDark={isDark} progress={progress}
              isZh={isZh} accent={accent}
              onGoTrainer={goToTrainer}
            />
          </motion.div>

          {/* LAYER 6 — Info Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <InfoFeed
              T={T} isDark={isDark} isZh={isZh} accent={accent}
              onRecalibrate={onRecalibrate}
            />
          </motion.div>

        </div>
      </div>
    </>
  );
}

// ── Re-export TrainerIcon for backward compat ─────────────────
export function TrainerIcon({ id, size = 28, color = "currentColor" }) {
  switch (id) {
    case "note":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="9" cy="16" r="3" fill={color} stroke="none" />
          <line x1="12" y1="16" x2="12" y2="5" strokeLinecap="round" />
          <line x1="12" y1="5" x2="18" y2="7" strokeLinecap="round" />
        </svg>
      );
    case "interval":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="6" cy="14" r="2.5" fill={color} stroke="none" />
          <circle cx="18" cy="14" r="2.5" />
          <path d="M8.5 12 Q12 7 15.5 12" strokeLinecap="round" />
        </svg>
      );
    case "changes":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <rect x="2" y="8" width="8" height="8" rx="2" />
          <rect x="14" y="8" width="8" height="8" rx="2" />
          <line x1="10" y1="12" x2="14" y2="12" strokeLinecap="round" />
          <polyline points="12.5,10 14,12 12.5,14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="4"  cy="19" r="1.8" fill={color} stroke="none" />
          <circle cx="9"  cy="16" r="1.8" fill={color} stroke="none" />
          <circle cx="14" cy="13" r="1.8" fill={color} stroke="none" />
          <circle cx="19" cy="10" r="1.8" fill={color} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

