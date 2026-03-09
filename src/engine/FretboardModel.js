/**
 * FretboardModel.js — 频率转弦位建模
 * Phase 1: freqToFretPositions
 * 
 * 把频率检测升级为"频率 + 弦位"检测
 * 用于 Flow 模块检验用户是否在正确弦上弹奏
 */

const OPEN_FREQ = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63]; // E2~e4 (标准调弦)
const SEMITONE = Math.pow(2, 1/12);

/**
 * 把频率转换为可能的弦位列表
 * @param {number} freq - 检测到的频率 (Hz)
 * @param {Object} options - 选项
 * @param {Object} options.fretRange - 品格范围 {min: 0, max: 12}
 * @param {number[]} options.activeStrings - 活跃弦索引 [0,1,2,3,4,5]
 * @param {Object} options.lastPosition - 上一次弹奏位置 {string, fret}
 * @returns {Array<{string: number, fret: number, cents: number, distance: number}>}
 */
export function freqToFretPositions(freq, { fretRange = { min: 0, max: 12 }, activeStrings = [0, 1, 2, 3, 4, 5], lastPosition = null } = {}) {
  const candidates = [];

  for (const s of activeStrings) {
    for (let f = fretRange.min; f <= fretRange.max; f++) {
      // 计算该弦该品的期望频率
      const expected = OPEN_FREQ[s] * Math.pow(SEMITONE, f);
      // 计算 cents 偏差 (1200 cents = 1 octave)
      const cents = 1200 * Math.log2(freq / expected);

      // 偏差在 ±50 cents 内认为匹配
      if (Math.abs(cents) < 50) {
        // 计算与上次弹奏位置的距离（用于平滑过渡）
        const distance = lastPosition
          ? Math.abs(s - lastPosition.string) + Math.abs(f - lastPosition.fret)
          : 0;

        candidates.push({
          string: s,
          fret: f,
          cents: Math.round(cents),
          distance,
          // 综合评分：cents 偏差 + 距离（距离越小越好）
          score: Math.abs(cents) + distance * 2,
        });
      }
    }
  }

  // 按评分排序（分数越低越好）
  return candidates.sort((a, b) => a.score - b.score);
}

/**
 * 获取最佳弦位匹配
 * @param {number} freq - 检测到的频率
 * @param {Object} options - 同 freqToFretPositions
 * @returns {Object|null} 最佳匹配 {string, fret, cents} 或 null
 */
export function getBestFretPosition(freq, options) {
  const candidates = freqToFretPositions(freq, options);
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * 判断是否在正确弦上弹奏
 * @param {number} freq - 检测到的频率
 * @param {number} targetString - 目标弦索引 (0-5)
 * @param {number} targetFret - 目标品格 (0-12)
 * @param {Object} options - 同 freqToFretPositions
 * @returns {boolean} 是否匹配
 */
export function isCorrectString(freq, targetString, targetFret, options = {}) {
  const best = getBestFretPosition(freq, options);
  return best !== null && best.string === targetString && best.fret === targetFret;
}

/**
 * 计算当前练习的弦位掌握度
 * @param {Array<{string: number, fret: number, correct: boolean}>} attempts - 尝试记录
 * @returns {Object} 每弦的掌握度统计
 */
export function getStringMastery(attempts) {
  const mastery = {};

  for (let s = 0; s < 6; s++) {
    mastery[s] = { total: 0, correct: 0 };
  }

  for (const attempt of attempts) {
    if (attempt.string >= 0 && attempt.string < 6) {
      mastery[attempt.string].total++;
      if (attempt.correct) {
        mastery[attempt.string].correct++;
      }
    }
  }

  // 转换为百分比
  for (const s in mastery) {
    const m = mastery[s];
    m.percentage = m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0;
  }

  return mastery;
}

/**
 * 标准调弦频率表
 */
export const STANDARD_TUNING = {
  "6-String Guitar": [82.41, 110.00, 146.83, 196.00, 246.94, 329.63],
  "7-String Guitar": [82.41, 110.00, 146.83, 196.00, 246.94, 329.63, 440.00],
  "Ukulele GCEA": [392.00, 493.88, 587.33, 659.25],
  "Bass 4-String": [41.20, 55.00, 73.42, 98.00],
};

/**
 * 根据弦索引获取弦名
 * @param {number} stringIdx - 弦索引 (0=E2, 5=e4)
 * @returns {string} 弦名
 */
export function getStringName(stringIdx) {
  const names = ["E2", "A2", "D3", "G3", "B3", "e4"];
  return names[stringIdx] ?? `String${stringIdx}`;
}
