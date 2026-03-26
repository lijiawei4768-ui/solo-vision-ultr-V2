
// ─────────────────────────────────────────────────────────────
// PersonaView.jsx — Solo Vision Ultra v6.0
// HTML母本: PersonaView_visual.html + PersonaView_auth.html
//
// 双态:
//   未登录态 (auth) — 登录/注册卡 + 模糊数据预览
//   已登录态 (visual) — 完整数据仪表板
//
// 认证: 轻量 localStorage (svultra_user)，前端 only，不做真实后端
// ─────────────────────────────────────────────────────────────
import React, { useContext, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DT, FONT_DISPLAY, FONT_TEXT, SPRINGS } from "../theme";
import { ThemeContext } from "../contexts";
import { useLang } from "../i18n";

function useT()      { return useContext(ThemeContext)?.tokens ?? DT; }
function useIsDark() { return useContext(ThemeContext)?.dark   ?? false; }

// ── glass helper ─────────────────────────────────────────────
// v6: T.glass.surface1 takes full priority — supports all theme surfaces
function gs(T, isDark, extra = {}) {
  const fallbackBg = isDark ? "rgba(20,22,50,0.70)" : "rgba(255,255,255,0.80)";
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

// ── Lightweight auth hook (localStorage only) ─────────────────
function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("svultra_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login    = (userData) => {
    const u = { name: userData.name || "吉他手", email: userData.email || "", ...userData };
    localStorage.setItem("svultra_user", JSON.stringify(u));
    setUser(u);
  };
  const logout   = () => { localStorage.removeItem("svultra_user"); setUser(null); };
  return { user, login, logout, isLoggedIn: !!user };
}

// ─────────────────────────────────────────────────────────────
// AUTH STATE — Persona for logged-out users
// ─────────────────────────────────────────────────────────────

// Blurred preview mini cards
function BlurPreview({ T, isDark, accent }) {
  const cards = [
    { label: "准确率", val: "84%", barW: "84%", barColor: accent },
    { label: "连续天数", val: "12天", barW: "60%", barColor: T.positive ?? "#22a672" },
    { label: "五维图谱", val: "A-",  barW: "78%", barColor: accent },
  ];
  return (
    <div style={{ filter: "blur(4px)", opacity: 0.55, pointerEvents: "none", marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            flex:         1, padding: "10px 10px 8px",
            background:   `${accent}0a`,
            border:       `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
            borderRadius: 10,
          }}>
            <div style={{
              fontSize:      8, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.09em", color: T.textTertiary, marginBottom: 4,
              fontFamily: FONT_TEXT,
            }}>
              {c.label}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: T.textPrimary, letterSpacing: "-0.8px" }}>
              {c.val}
            </div>
            <div style={{
              height: 2.5, borderRadius: 2, marginTop: 6,
              background: `${c.barColor}48`,
              width: c.barW,
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Input field component
function InputField({ type = "text", placeholder, value, onChange, icon, hasEye, style }) {
  const T      = useT();
  const isDark = useIsDark();
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div style={{
      display:     "flex", alignItems: "center",
      background:  isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)",
      border:      `0.5px solid ${T.border ?? "rgba(110,120,180,0.18)"}`,
      borderRadius: 13, padding: "0 14px", ...style,
    }}>
      {icon && (
        <div style={{ marginRight: 8, opacity: 0.55, flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <input
        type={hasEye ? (showPwd ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        style={{
          flex:        1, border: "none", background: "transparent",
          fontSize:    14, color: T.textPrimary,
          fontFamily:  FONT_TEXT, padding: "13px 0",
          outline:     "none",
        }}
      />
      {hasEye && (
        <div onClick={() => setShowPwd(v => !v)} style={{ opacity: showPwd ? 1 : 0.5, cursor: "pointer", marginLeft: 8 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke={T.textTertiary} strokeWidth="1.4" strokeLinecap="round">
            <path d="M1 8C1 8 3.5 3.5 8 3.5S15 8 15 8S12.5 12.5 8 12.5S1 8 1 8Z" />
            <circle cx="8" cy="8" r="2" />
          </svg>
        </div>
      )}
    </div>
  );
}

// Auth card (login + register tabs)
function AuthCard({ T, isDark, accent, onLogin }) {
  const [tab,   setTab]   = useState("login");
  const [email, setEmail] = useState("");
  const [pwd,   setPwd]   = useState("");
  const [code,  setCode]  = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const resolvedEmail = (email || "").trim() || "demo@svultra.local";
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ email: resolvedEmail, name: resolvedEmail.split("@")[0] || "Demo" });
    }, 800);
  };
  const handleRegister = () => {
    if (!agreed) return;
    const resolvedEmail = (email || "").trim() || "demo@svultra.local";
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ email: resolvedEmail, name: resolvedEmail.split("@")[0] || "Demo" });
    }, 1000);
  };

  return (
    <div style={{
      ...gs(T, isDark, { borderRadius: 22 }),
      padding: "22px 20px 20px",
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
    }}>
      {/* Tabs */}
      <div style={{
        display:      "flex",
        background:   `${accent}0a`,
        border:       `0.5px solid ${T.border ?? "rgba(110,120,180,0.13)"}`,
        borderRadius: 14, padding: 3, marginBottom: 22,
      }}>
        {["login", "register"].map((t) => (
          <div key={t} onClick={() => setTab(t)} style={{
            flex:         1, textAlign: "center",
            padding:      "8px 12px", borderRadius: 11,
            fontSize:     13, fontWeight: 700, cursor: "pointer",
            fontFamily:   FONT_TEXT,
            background:   tab === t
              ? (isDark ? "rgba(255,255,255,0.14)" : "white")
              : "transparent",
            color:        tab === t ? T.textPrimary : T.textTertiary,
            boxShadow:    tab === t && !isDark
              ? "0 1px 6px rgba(60,70,150,0.10), inset 0 0.5px 0 rgba(255,255,255,0.90)"
              : "none",
            transition:   "all 0.22s ease",
          }}>
            {t === "login" ? "登录" : "注册"}
          </div>
        ))}
      </div>

      {/* WeChat button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          const resolvedEmail = (email || "").trim() || "wechat@svultra.local";
          onLogin({ email: resolvedEmail, name: "微信用户" });
        }}
        style={{
          width:          "100%", padding: "14px 16px",
          borderRadius:   16, border: "none",
          background:     "#07C160",
          color:          "#fff",
          fontSize:       15, fontWeight: 700,
          cursor:         "pointer",
          display:        "flex", alignItems: "center",
          justifyContent: "center", gap: 10,
          fontFamily:     FONT_TEXT,
          boxShadow:      "0 4px 16px rgba(7,193,96,0.32)",
          marginBottom:   16,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M9.5 7.5C9.5 7.5 5 8.5 5 12.5C5 14.8 6.5 16.8 9 17.8L8.5 20L11.5 18.5C12 18.6 12.5 18.6 13 18.6C17.5 18.6 21 15.8 21 12.4C21 9 17.5 6.2 13 6.2C11.8 6.2 10.6 6.4 9.5 7.5Z" opacity="0.85" />
        </svg>
        {tab === "login" ? "微信一键登录" : "微信快速注册"}
      </motion.button>

      {/* Divider */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
      }}>
        <div style={{ flex: 1, height: 0.5, background: T.border ?? "rgba(110,120,180,0.18)" }} />
        <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT, whiteSpace: "nowrap" }}>
          或使用邮箱{tab === "register" ? "注册" : ""}
        </span>
        <div style={{ flex: 1, height: 0.5, background: T.border ?? "rgba(110,120,180,0.18)" }} />
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <InputField
          type="email" placeholder="邮箱地址"
          value={email} onChange={setEmail}
          icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={T.textTertiary} strokeWidth="1.5" strokeLinecap="round"><rect x="1.5" y="3.5" width="13" height="9" rx="2"/><polyline points="1.5,4 8,9 14.5,4"/></svg>}
        />

        {tab === "register" && (
          <div style={{ display: "flex", gap: 8 }}>
            <InputField
              type="text" placeholder="验证码"
              value={code} onChange={setCode}
              style={{ flex: 1 }}
              icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={T.textTertiary} strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="5" width="14" height="8" rx="2"/><path d="M1 8h14M5 5V3.5M11 5V3.5" strokeWidth="1.3"/></svg>}
            />
            <motion.button
              whileTap={{ scale: 0.94 }}
              style={{
                flexShrink:   0, padding: "0 14px",
                borderRadius: 13, border: `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.22)"}`,
                background:   T.accentSub ?? "rgba(90,90,214,0.10)",
                color:        accent, fontSize: 12, fontWeight: 700,
                cursor:       "pointer", whiteSpace: "nowrap", fontFamily: FONT_TEXT,
              }}
            >
              发送验证码
            </motion.button>
          </div>
        )}

        <InputField
          type="password" placeholder={tab === "register" ? "设置密码（至少8位）" : "密码"}
          value={pwd} onChange={setPwd} hasEye
          icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={T.textTertiary} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="7" width="10" height="7.5" rx="2"/><path d="M5.5 7V5.5a2.5 2.5 0 015 0V7"/></svg>}
        />
      </div>

      {/* Agree row (register) */}
      {tab === "register" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          marginBottom: 14, cursor: "pointer",
        }}
          onClick={() => setAgreed(v => !v)}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 5,
            border: `1.5px solid ${agreed ? accent : (T.border ?? "rgba(110,120,180,0.28)")}`,
            background: agreed ? accent : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: 1,
          }}>
            {agreed && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <polyline points="1,3.5 3.5,6 8,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: 11.5, color: T.textSecondary, lineHeight: 1.5, fontFamily: FONT_TEXT }}>
            我已阅读并同意{" "}
            <span style={{ color: accent }}>《服务协议》</span>
            {" "}和{" "}
            <span style={{ color: accent }}>《隐私政策》</span>
          </span>
        </div>
      )}

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={tab === "login" ? handleLogin : handleRegister}
        disabled={tab === "register" && !agreed}
        style={{
          width:          "100%", padding: "14px",
          borderRadius:   16, border: "none",
          background:     (tab === "register" && !agreed) ? T.surface2 : accent,
          color:          (tab === "register" && !agreed) ? T.textTertiary : "#fff",
          fontSize:       15, fontWeight: 700,
          cursor:         (tab === "register" && !agreed) ? "not-allowed" : "pointer",
          fontFamily:     FONT_TEXT,
          boxShadow:      (tab === "register" && !agreed) ? "none" : `0 4px 18px ${accent}48`,
        }}
      >
        {loading ? "处理中…" : tab === "login" ? "登录" : "创建账号"}
      </motion.button>

      {/* Footnote */}
      <div style={{
        textAlign: "center", marginTop: 12,
        fontSize: 11.5, color: T.textTertiary, fontFamily: FONT_TEXT,
      }}>
        {tab === "login" ? (
          <>还没有账号？<span style={{ color: accent, cursor: "pointer" }} onClick={() => setTab("register")}>立即注册</span></>
        ) : (
          <>已有账号？<span style={{ color: accent, cursor: "pointer" }} onClick={() => setTab("login")}>直接登录</span></>
        )}
      </div>
    </div>
  );
}

// Full auth view (guest state)
function AuthView({ T, isDark, accent, onLogin }) {
  const features = [
    { color: accent,                      text: "五维能力图谱 · 清晰看到你的强项和弱点" },
    { color: "#07C160",                   text: "训练历史同步 · 换设备不丢数据" },
    { color: T.positive ?? "#22a672",     text: "全球排名 · 和同水平学员对比进步速度" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 96, width: "100%", minWidth: 0 }}>
      {/* Header */}
      <div style={{ padding: "14px 4px 8px" }}>
        <div style={{
          fontFamily:    FONT_DISPLAY, fontSize: 30, color: T.textPrimary,
          letterSpacing: "-0.4px", lineHeight: 1.1,
        }}>
          我的训练
        </div>
        <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 5, fontFamily: FONT_TEXT }}>
          登录后查看你的专属训练地图
        </div>
      </div>

      {/* Unlock preview card */}
      <div style={{
        ...gs(T, isDark, { borderRadius: 22 }),
        padding: "20px 18px",
        position: "relative", overflow: "hidden",
        width: "100%",
        minWidth: 0,
        alignSelf: "stretch",
        boxSizing: "border-box",
      }}>
        {/* Accent stripe top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${accent}4a, rgba(160,100,255,0.3), transparent)`,
          pointerEvents: "none",
        }} />

        <div style={{
          fontSize: 16, fontWeight: 800, color: T.textPrimary,
          letterSpacing: "-0.3px", marginBottom: 4, fontFamily: FONT_DISPLAY,
        }}>
          登录后解锁全部数据
        </div>
        <div style={{
          fontSize: 12, color: T.textSecondary,
          lineHeight: 1.5, marginBottom: 16, fontFamily: FONT_TEXT,
        }}>
          你的训练记录、成长轨迹和能力图谱会保存在这里
        </div>

        <BlurPreview T={T} isDark={isDark} accent={accent} />

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: f.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.4, fontFamily: FONT_TEXT }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Auth card */}
      <AuthCard T={T} isDark={isDark} accent={accent} onLogin={onLogin} />

      {/* Guest note */}
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT }}>
          不登录也可以训练 · 数据保存在本设备
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VISUAL STATE — Logged in data dashboard
// ─────────────────────────────────────────────────────────────

// Stat pills row (SVG icons, no emoji)
function StatPills({ T, isDark, progress, accent }) {
  const green = T.positive ?? "#22a672";
  const neg   = T.negative ?? "#c24050";
  const stats = [
    {
      label: "今日", val: progress?.todayMinutes ?? 22, unit: "分钟",
      color: accent,
      icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v4l3 2"/><circle cx="8" cy="8" r="6.5"/></svg>,
      iconBg: T.accentSub ?? "rgba(90,90,214,0.10)",
    },
    {
      label: "连续", val: progress?.streakDays ?? 12, unit: "天",
      color: green,
      icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={green} strokeWidth="1.4" strokeLinecap="round"><path d="M8 2C8 2 12 5.5 12 9C12 11.8 10.2 13.5 8 13.5S4 11.8 4 9C4 5.5 8 2 8 2Z"/><path d="M7 9.5C7 9.5 7.8 8 9 9" strokeWidth="1.2"/></svg>,
      iconBg: green + "18",
    },
    {
      label: "弱点", val: (progress?.weakIntervals ?? []).length || 3, unit: "音程",
      color: neg,
      icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={neg} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 6.5v3M8 11v.5" strokeWidth="1.6"/></svg>,
      iconBg: neg + "18",
    },
  ];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          ...gs(T, isDark, { flex: 1, borderRadius: 14, padding: "12px 10px 10px" }),
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: s.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {s.icon}
            </div>
            <span style={{ fontSize: 9.5, color: T.textTertiary, fontFamily: FONT_TEXT }}>{s.label}</span>
          </div>
          <div style={{
            fontFamily:    FONT_DISPLAY, fontSize: 26, lineHeight: 1,
            letterSpacing: "-1px", color: s.color,
          }}>
            {s.val}
          </div>
          <div style={{ fontSize: 9.5, color: T.textTertiary, marginTop: 2, fontFamily: FONT_TEXT }}>
            {s.unit}
          </div>
        </div>
      ))}
    </div>
  );
}

// Radar chart (SVG-based 5-axis)
function RadarChart({ T, isDark, accent, scores }) {
  // scores: { root, forms, chord, scale, harmonic } — 0..1
  const s = {
    root:     scores?.root     ?? 0.84,
    forms:    scores?.forms    ?? 0.62,
    chord:    scores?.chord    ?? 0.70,
    scale:    scores?.scale    ?? 0.55,
    harmonic: scores?.harmonic ?? 0.48,
  };

  // Pentagon math (5 axes, top = root)
  const cx = 140, cy = 130, maxR = 100;
  const angles = [-90, -18, 54, 126, 198].map(d => d * Math.PI / 180);
  const pt = (score, ai) => ({
    x: cx + score * maxR * Math.cos(angles[ai]),
    y: cy + score * maxR * Math.sin(angles[ai]),
  });

  const dataPts = [s.root, s.forms, s.chord, s.scale, s.harmonic].map((v, i) => pt(v, i));
  const polyStr = dataPts.map(p => `${p.x},${p.y}`).join(" ");

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1].map(r =>
    angles.map((_, i) => pt(r, i)).map(p => `${p.x},${p.y}`).join(" ")
  );

  const labels = [
    { text: "Root",     x: cx + 0 * maxR * Math.cos(angles[0]) - 0, y: cy + 1 * maxR * Math.sin(angles[0]) - 12 },
    { text: "48 Forms", x: cx + 1.14 * maxR * Math.cos(angles[1]),   y: cy + 1.1 * maxR * Math.sin(angles[1]) },
    { text: "Chord",    x: cx + 1.14 * maxR * Math.cos(angles[2]),   y: cy + 1.1 * maxR * Math.sin(angles[2]) },
    { text: "Scale",    x: cx + 1.12 * maxR * Math.cos(angles[3]),   y: cy + 1.15* maxR * Math.sin(angles[3]) },
    { text: "Harmonic", x: cx + 1.14 * maxR * Math.cos(angles[4]),   y: cy + 1.1 * maxR * Math.sin(angles[4]) },
  ];

  const scoreItems = [
    { name: "Root",     val: Math.round(s.root     * 100) },
    { name: "48 Forms", val: Math.round(s.forms    * 100) },
    { name: "Chord",    val: Math.round(s.chord    * 100) },
    { name: "Scale",    val: Math.round(s.scale    * 100) },
    { name: "Harm.",    val: Math.round(s.harmonic * 100) },
  ];

  return (
    <div style={{
      ...gs(T, isDark, { borderRadius: 22, padding: "18px 16px 16px" }),
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
            五维能力图谱
          </div>
          <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2, fontFamily: FONT_TEXT }}>
            单色 · 专业工具视角
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: accent, fontFamily: FONT_TEXT,
          padding: "4px 10px", borderRadius: 8,
          background: T.accentSub ?? "rgba(90,90,214,0.10)",
          border: `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.18)"}`,
          cursor: "pointer",
        }}>
          详细分析
        </div>
      </div>

      {/* SVG radar */}
      <div style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
        <svg width="280" height="240" viewBox="-20 -20 320 300" style={{ overflow: "visible", maxWidth: "100%" }}>
          {/* Grid rings */}
          {rings.map((pts, ri) => (
            <polygon key={ri} points={pts}
              fill="none"
              stroke={isDark ? "rgba(90,90,214,0.12)" : "rgba(90,90,214,0.09)"}
              strokeWidth="0.8"
            />
          ))}
          {/* Axis lines */}
          {angles.map((_, i) => {
            const edge = pt(1, i);
            return <line key={i} x1={cx} y1={cy} x2={edge.x} y2={edge.y}
              stroke={isDark ? "rgba(90,90,214,0.13)" : "rgba(90,90,214,0.10)"}
              strokeWidth="0.8" />;
          })}
          {/* Data fill */}
          <polygon points={polyStr}
            fill={`${accent}0c`} stroke="none" />
          {/* Data stroke */}
          <polygon points={polyStr}
            fill="none" stroke={`${accent}cc`} strokeWidth="1.8" strokeLinejoin="round" />
          {/* Data dots */}
          {dataPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={accent} />
          ))}
          {/* Labels */}
          {labels.map((l, i) => (
            <text key={i}
              x={l.x} y={l.y}
              textAnchor={Math.abs(Math.cos(angles[i])) < 0.1 ? "middle" : Math.cos(angles[i]) > 0 ? "start" : "end"}
              fontSize="10" fontWeight="700"
              fill={i === 0 ? accent : (T.textTertiary ?? "#9898b8")}
              fontFamily="sans-serif"
            >
              {l.text}
            </text>
          ))}
        </svg>
      </div>

      {/* Score breakdown */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {scoreItems.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: T.textTertiary, fontFamily: FONT_TEXT, marginBottom: 3 }}>
              {s.name}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? accent : T.textPrimary, fontFamily: FONT_DISPLAY }}>
              {s.val}%
            </div>
            <div style={{ height: 2.5, borderRadius: 2, background: T.surface2 ?? "rgba(0,0,0,0.06)", marginTop: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${s.val}%`, borderRadius: 2, background: accent, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Staggered analysis grid — 7-day sparkline + weak spot
function AnalysisGrid({ T, isDark, accent, historyData, progress }) {
  const green = T.positive ?? "#22a672";
  const neg   = T.negative ?? "#c24050";

  // Fake sparkline data from historyData or defaults
  const weekPoints = (historyData?.weekly ?? []).slice(-7);
  const raw = weekPoints.length === 7
    ? weekPoints.map(d => d.accuracy ?? d)
    : [0.55, 0.60, 0.62, 0.65, 0.68, 0.70, 0.72];
  const min = Math.min(...raw), max = Math.max(...raw);
  const normalized = raw.map(v => (v - min) / (max - min + 0.001));
  const H = 70, W = 170;
  const pts = normalized.map((v, i) => `${(i / 6) * W},${H - v * (H - 10)}`).join(" ");
  const fillPts = `0,${H} ${pts} ${W},${H}`;

  const weakInterval = (progress?.weakIntervals ?? [])[0] ?? "b3";
  const weakAcc = progress?.intervalHeatmap?.[weakInterval]
    ? Math.round((progress.intervalHeatmap[weakInterval].correct / progress.intervalHeatmap[weakInterval].attempts) * 100)
    : 41;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 8 }}>

      {/* Left: 7-day sparkline */}
      <div style={{ ...gs(T, isDark, { borderRadius: 18, padding: "16px 14px 14px" }) }}>
        <div style={{ fontSize: 9.5, color: T.textTertiary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_TEXT, marginBottom: 4 }}>
          近 7 天趋势
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.2px", fontFamily: FONT_DISPLAY, marginBottom: 2 }}>
          总体上升
        </div>
        <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: FONT_TEXT, marginBottom: 12 }}>
          平均准确率 {Math.round(raw.reduce((a, b) => a + b, 0) / raw.length * 100)}%
        </div>
        <svg width="100%" height="80" viewBox={`0 0 ${W} 80`} preserveAspectRatio="none">
          <line x1="0" y1="20" x2={W} y2="20" stroke={`${accent}10`} strokeWidth="0.5" />
          <line x1="0" y1="40" x2={W} y2="40" stroke={`${accent}10`} strokeWidth="0.5" />
          <line x1="0" y1="60" x2={W} y2="60" stroke={`${accent}10`} strokeWidth="0.5" />
          <polygon points={fillPts} fill={`${accent}0e`} stroke="none" />
          <polyline points={pts} fill="none" stroke={`${accent}c0`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {normalized.map((v, i) => (
            <circle key={i} cx={(i / 6) * W} cy={H - v * (H - 10)} r={i === 6 ? 3.5 : 2.5}
              fill={accent} opacity="0.9" />
          ))}
          {["一","二","三","四","五","六","日"].map((d, i) => (
            <text key={i} x={(i / 6) * W} y="78" textAnchor="middle"
              fontSize="7.5" fill={T.textTertiary} fontWeight="600" fontFamily="sans-serif">
              {d}
            </text>
          ))}
        </svg>
      </div>

      {/* Right: Weak interval */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Weak spot card */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          style={{ ...gs(T, isDark, { borderRadius: 14, padding: "12px 12px 10px", flex: 1, cursor: "pointer" }) }}
        >
          <div style={{ fontSize: 9.5, color: neg, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: FONT_TEXT }}>
            弱点
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 38, color: T.textPrimary, letterSpacing: "-2px", lineHeight: 1, marginBottom: 2 }}>
            {weakInterval}
          </div>
          <div style={{ fontSize: 10, color: T.textTertiary, marginBottom: 8, fontFamily: FONT_TEXT }}>Minor 3rd</div>
          <div style={{ height: 3, borderRadius: 2, background: neg + "20", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${weakAcc}%`, background: neg, borderRadius: 2 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 9, color: T.textTertiary, fontFamily: FONT_TEXT }}>准确率</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: neg, fontFamily: FONT_TEXT }}>{weakAcc}%</span>
          </div>
        </motion.div>

        {/* Calibration reminder */}
        <div style={{ ...gs(T, isDark, { borderRadius: 14, padding: "10px 12px", background: T.surface1 }) }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textPrimary, marginBottom: 3, fontFamily: FONT_DISPLAY }}>
            校准状态
          </div>
          <div style={{ fontSize: 9.5, color: T.textTertiary, fontFamily: FONT_TEXT, lineHeight: 1.4 }}>
            已校准 · 7天前
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent training records feed
function TrainingFeed({ T, isDark, accent, historyData }) {
  const recent = historyData?.recent ?? [
    { trainer: "interval", duration: 12, accuracy: 0.78, date: "今天" },
    { trainer: "note",     duration: 8,  accuracy: 0.85, date: "昨天" },
    { trainer: "changes",  duration: 15, accuracy: 0.64, date: "2天前" },
  ];

  const TRAINER_COLOR = {
    interval: accent,
    note:     T.positive ?? "#22a672",
    changes:  T.warning  ?? "#c07830",
    scale:    "#4A9EFF",
  };
  const TRAINER_LABEL = {
    interval: "音程训练器",
    note:     "音符识别",
    changes:  "和弦进行",
    scale:    "音阶导航",
  };

  return (
    <div style={{ ...gs(T, isDark, { borderRadius: 18, padding: "14px 16px", background: T.surface1 }) }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT_TEXT }}>
          训练记录
        </span>
        <span style={{ fontSize: 10, color: accent, fontWeight: 600, fontFamily: FONT_TEXT, cursor: "pointer" }}>
          全部 ›
        </span>
      </div>

      {recent.slice(0, 4).map((r, i) => {
        const color = TRAINER_COLOR[r.trainer] ?? accent;
        const label = TRAINER_LABEL[r.trainer] ?? r.trainer;
        return (
          <div key={i} style={{
            display:   "flex", alignItems: "center", gap: 10,
            padding:   "9px 0",
            borderTop: i > 0 ? `0.5px solid ${T.border ?? "rgba(110,120,180,0.12)"}` : "none",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: color + "18",
              border:     `0.5px solid ${color}38`,
              display:    "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: FONT_DISPLAY }}>
                {label}
              </div>
              <div style={{ fontSize: 10.5, color: T.textTertiary, marginTop: 1, fontFamily: FONT_TEXT }}>
                {r.duration} 分钟 · {r.date}
              </div>
            </div>
            <div style={{
              fontSize:   12, fontWeight: 700, color: color,
              fontFamily: FONT_TEXT,
            }}>
              {Math.round((r.accuracy ?? 0.7) * 100)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Settings section (collapsible)
function SettingsSection({ T, isDark, isZh, accent, lang, settings, onChangeLang, onToggleTheme, onResetProgress, onRecalibrate, user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(v => !v)}
        style={{
          ...gs(T, isDark, { borderRadius: 16, padding: "13px 16px", cursor: "pointer" }),
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary, fontFamily: FONT_TEXT }}>
          设置 · 账号
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={T.textTertiary} strokeWidth="2" strokeLinecap="round">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0, 0.22, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Language */}
              <div style={{ ...gs(T, isDark, { borderRadius: 14, padding: "14px 16px" }) }}>
                <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 8, fontFamily: FONT_TEXT }}>语言 / Language</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{id:"zh",label:"中文"},{id:"en",label:"English"},{id:"mixed",label:"中英"}].map(opt => (
                    <button key={opt.id} onClick={() => onChangeLang?.(opt.id)} style={{
                      flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
                      background: lang === opt.id ? accent : T.surface2,
                      color:      lang === opt.id ? "#fff" : T.textSecondary,
                      fontSize:   12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_TEXT,
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div style={{ ...gs(T, isDark, { borderRadius: 14, padding: "14px 16px" }) }}>
                <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 8, fontFamily: FONT_TEXT }}>主题 / Theme</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{dark:true,label:"深色",icon:"🌙"},{dark:false,label:"浅色",icon:"☀️"}].map(opt => (
                    <button key={String(opt.dark)} onClick={onToggleTheme} style={{
                      flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
                      background: isDark === opt.dark ? accent : T.surface2,
                      color:      isDark === opt.dark ? "#fff" : T.textSecondary,
                      fontSize:   12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_TEXT,
                    }}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recalibrate */}
              <button onClick={onRecalibrate} style={{
                ...gs(T, isDark, { borderRadius: 14 }),
                padding: 13, fontSize: 13, fontWeight: 600, color: T.textSecondary,
                cursor: "pointer", textAlign: "left", display: "flex",
                alignItems: "center", justifyContent: "space-between", border: `0.5px solid ${T.border}`,
              }}>
                <span>🎛 重新校准音高检测</span>
                <span style={{ fontSize: 12, color: T.textTertiary }}>→</span>
              </button>

              {/* Logout + Reset */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onLogout} style={{
                  flex: 1, padding: 12, borderRadius: 12, border: `0.5px solid ${T.border}`,
                  background: T.surface1, color: T.textSecondary, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT_TEXT,
                }}>
                  退出登录
                </button>
                <button onClick={() => onResetProgress?.()} style={{
                  flex: 1, padding: 12, borderRadius: 12, border: "none",
                  background: "rgba(194,64,80,0.10)", color: T.negative ?? "#c24050",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_TEXT,
                }}>
                  重置训练数据
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visual dashboard (logged-in)
function VisualView({ T, isDark, accent, user, progress, historyData, isZh, lang, settings, onSettingsChange, onRecalibrate, onToggleTheme, onResetProgress, onLogout }) {
  const { setLang } = useLang();
  const radarScores = useMemo(() => {
    const hm = progress?.intervalHeatmap ?? {};
    const vals = Object.values(hm);
    const avg  = vals.length > 0
      ? vals.reduce((s, v) => s + (v.correct / (v.attempts || 1)), 0) / vals.length
      : 0.65;
    return {
      root:     Math.min(1, avg * 1.15),
      forms:    Math.min(1, avg * 0.92),
      chord:    Math.min(1, avg * 1.05),
      scale:    Math.min(1, avg * 0.88),
      harmonic: Math.min(1, avg * 0.82),
    };
  }, [progress?.intervalHeatmap]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 96, width: "100%", minWidth: 0, alignSelf: "stretch" }}>
      {/* Header */}
      <div style={{
        display:        "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        padding:        "14px 4px 4px",
      }}>
        <div>
          <div style={{
            fontFamily:    FONT_DISPLAY, fontSize: 26, fontWeight: 900,
            color:         T.textPrimary, letterSpacing: "-0.5px",
          }}>
            {isZh ? "我的训练" : "My Training"}
          </div>
          <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 4, fontFamily: FONT_TEXT }}>
            {user?.name ?? "吉他手"} · {isZh ? "你的专属训练地图" : "Your personal training map"}
          </div>
        </div>
        {/* Stage badge */}
        <div style={{
          display:    "flex", alignItems: "center", gap: 5,
          padding:    "5px 11px", borderRadius: 12,
          background: T.accentSub    ?? "rgba(90,90,214,0.10)",
          border:     `0.5px solid ${T.accentBorder ?? "rgba(90,90,214,0.20)"}`,
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
            stroke={accent} strokeWidth="1.5" strokeLinecap="round">
            <polyline points="1,7 4,4 7,6 11,2" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 800, color: accent, fontFamily: FONT_TEXT }}>
            Stage 2
          </span>
          <span style={{ fontSize: 9.5, color: T.textTertiary, fontFamily: FONT_TEXT }}>
            进行中
          </span>
        </div>
      </div>

      {/* Stat pills */}
      <StatPills T={T} isDark={isDark} progress={progress} accent={accent} />

      {/* Radar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <RadarChart T={T} isDark={isDark} accent={accent} scores={radarScores} />
      </motion.div>

      {/* 7-day + weak grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <AnalysisGrid T={T} isDark={isDark} accent={accent} historyData={historyData} progress={progress} />
      </motion.div>

      {/* Training feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.20 }}
      >
        <TrainingFeed T={T} isDark={isDark} accent={accent} historyData={historyData} />
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
      >
        <SettingsSection
          T={T} isDark={isDark} isZh={isZh} accent={accent}
          lang={lang} settings={settings}
          onChangeLang={setLang}
          onToggleTheme={onToggleTheme}
          onResetProgress={onResetProgress}
          onRecalibrate={onRecalibrate}
          user={user}
          onLogout={onLogout}
        />
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export function PersonaView({
  settings,
  onSettingsChange,
  historyData,
  calibData,
  onRecalibrate,
  isDark: _isDark,
  onToggleTheme,
  progress,
  onResetProgress,
}) {
  const T      = useT();
  const isDark = useIsDark();
  const { lang } = useLang();
  const isZh   = lang !== "en";
  const accent = T.accent ?? "#5a5ad6";

  const { user, login, logout, isLoggedIn } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {isLoggedIn ? (
        <motion.div
          key="visual"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={SPRINGS.pageTransition}
          style={{ width: "100%", minWidth: 0, alignSelf: "stretch", display: "flex", flexDirection: "column" }}
        >
          <VisualView
            T={T} isDark={isDark} accent={accent}
            user={user}
            progress={progress}
            historyData={historyData}
            isZh={isZh} lang={lang}
            settings={settings}
            onSettingsChange={onSettingsChange}
            onRecalibrate={onRecalibrate}
            onToggleTheme={onToggleTheme}
            onResetProgress={onResetProgress}
            onLogout={logout}
          />
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={SPRINGS.pageTransition}
          style={{ width: "100%", minWidth: 0, alignSelf: "stretch", display: "flex", flexDirection: "column" }}
        >
          <AuthView T={T} isDark={isDark} accent={accent} onLogin={login} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

