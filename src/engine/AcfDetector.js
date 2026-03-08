// ─────────────────────────────────────────────────────────────
// src/engine/AcfDetector.js  — v1.0
//
// 自相关函数（ACF）音高检测器
// 专为吉他低频弦（E2 82Hz、A2 110Hz）设计，弥补 YIN 在低频的不稳定性。
//
// 使用场景：
//   • YIN 报告 < 150 Hz 时，用 ACF 交叉验证
//   • YIN 检测到 2nd harmonic（约 164Hz = E2×2）时，ACF 纠正回基频
//
// 算法：自相关函数 + 抛物线亚采样插值（与 YIN 精度对齐）
//
// 无副作用，无状态，纯函数。
// ─────────────────────────────────────────────────────────────

/**
 * ACF 音高检测。
 * 适合 60–350 Hz 范围（吉他 E2–F4），对低频比 YIN 更稳定。
 *
 * @param {Float32Array} buffer     - 时域 PCM 样本（推荐 length ≥ 2048）
 * @param {number}       sampleRate - 采样率（通常 44100）
 * @returns {number | null} 基频 Hz，或 null（静音 / 检测失败）
 */
export function detectPitchACF(buffer, sampleRate) {
  const n = buffer.length;

  // ── 静音门限：RMS 太低直接返回 null ────────────────────────
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += buffer[i] * buffer[i];
  const rms = Math.sqrt(sumSq / n);
  if (rms < 0.004) return null;   // 静音，不检测

  // ── 检测范围：60 Hz（B1 bass margin）到 350 Hz（吉他高把位）
  const minLag = Math.floor(sampleRate / 350);
  const maxLag = Math.floor(sampleRate / 60);
  const halfN  = Math.floor(n / 2);
  const lagEnd = Math.min(maxLag, halfN - 1);

  if (minLag >= lagEnd) return null;  // buffer 太短

  // ── 计算自相关函数 ──────────────────────────────────────────
  // acf[lag] = Σ buffer[i] * buffer[i + lag]，i ∈ [0, n-lag)
  const acf = new Float32Array(lagEnd + 1);
  for (let lag = minLag; lag <= lagEnd; lag++) {
    let sum = 0;
    const iEnd = n - lag;
    for (let i = 0; i < iEnd; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    acf[lag] = sum;
  }

  // ── 归一化（防止幅度差异影响峰值比较）─────────────────────
  const acf0 = acf[0] > 0 ? acf[0] : 1;

  // ── 找第一个局部最大值（对应基频周期）─────────────────────
  let bestLag = -1;
  let bestVal = -Infinity;

  for (let lag = minLag + 1; lag < lagEnd; lag++) {
    const v = acf[lag];
    if (
      v > acf[lag - 1] &&    // 局部最大
      v > acf[lag + 1] &&
      v > bestVal
    ) {
      bestVal = v;
      bestLag = lag;
    }
  }

  // 峰值强度检查：必须至少是 acf[0] 的 25%
  // 避免无调性噪声产生假阳性
  if (bestLag === -1 || bestVal < acf0 * 0.25) return null;

  // ── 抛物线插值（亚采样精度，与 YIN 一致）────────────────────
  const y1 = acf[bestLag - 1];
  const y2 = acf[bestLag];
  const y3 = acf[bestLag + 1];
  const denom = 2 * (2 * y2 - y1 - y3);
  const refinedLag = denom !== 0
    ? bestLag - (y3 - y1) / denom
    : bestLag;

  return sampleRate / refinedLag;
}

/**
 * YIN + ACF 混合检测。
 *
 * 逻辑：
 *   1. yinFreq ≥ 150 Hz → 直接信任 YIN（高频表现好）
 *   2. yinFreq < 150 Hz → 运行 ACF 交叉验证：
 *      a. 两者吻合（±5%）→ 使用 ACF（低频更准）
 *      b. YIN ≈ ACF × 2（倍频误检）→ 用 ACF 基频纠正
 *      c. 无 ACF 结果 → 回退到 YIN
 *
 * @param {Float32Array} buffer     - 时域 PCM 样本
 * @param {number}       sampleRate - 采样率
 * @param {number | null} yinFreq   - YIN 检测结果（Hz），≤0 表示未检测到
 * @returns {number | null} 最终频率 Hz，或 null
 */
export function hybridDetect(buffer, sampleRate, yinFreq) {
  // YIN 没检测到 → 直接跑 ACF 兜底（对低弦有帮助）
  if (!yinFreq || yinFreq <= 0) {
    const acf = detectPitchACF(buffer, sampleRate);
    return acf ?? null;
  }

  // 高频（≥ 150 Hz）：信任 YIN，不调用 ACF（节省 CPU）
  if (yinFreq >= 150) return yinFreq;

  // 低频（< 150 Hz）：ACF 交叉验证
  const acfFreq = detectPitchACF(buffer, sampleRate);
  if (!acfFreq) return yinFreq;  // ACF 失败，回退 YIN

  // a. 两者相近（±5%）→ ACF 更准
  const ratio = Math.abs(acfFreq - yinFreq) / yinFreq;
  if (ratio < 0.05) return acfFreq;

  // b. 倍频纠正：YIN 报告了 ACF 的 2nd harmonic
  //    例：E2(82Hz) → YIN 返回 164Hz，ACF 返回 82Hz
  if (yinFreq > acfFreq) {
    const harmonicRatio = Math.abs(yinFreq - acfFreq * 2) / (acfFreq * 2);
    if (harmonicRatio < 0.05) return acfFreq;  // 纠正为基频

    // 3rd harmonic 纠正（少见但存在）
    const h3Ratio = Math.abs(yinFreq - acfFreq * 3) / (acfFreq * 3);
    if (h3Ratio < 0.05) return acfFreq;
  }

  // c. 两者差异大但无规律 → 信任 YIN（更经过测试）
  return yinFreq;
}
