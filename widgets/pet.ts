// SPDX-FileCopyrightText: 2026 BrokenShine <xchai404@gmail.com>
//
// SPDX-License-Identifier: MIT

/**
 * pi-pet widget — 桌面宠物 + 会话信息侧栏
 *
 * Placement: belowEditor（紧贴 editor 之下、footer 之上）。
 * 原因：pi 的 aboveEditor widget 顺序由 setWidget 注册顺序决定（Map.values()），
 * pet startup 注册在前、agent 创建的 todos widget 注册在后，todos 会插到 pet 之下、
 * 把 pet 推离 editor。改用 belowEditor 与 chat 区域隔离，永远紧贴 editor。
 *
 * 内容：左列 5 行会话信息（model / provider / thinking / context bar / duration），
 * 与右列 5 行猫猫 pet ASCII art 一一配对。所有信息按语义上色：
 *   - model/provider：accent/muted
 *   - thinking：off→dim / low→muted / medium→success / high→warning / max→彩虹动画
 *   - context bar+百分比：<50% 绿 / 50-70% 黄 / 70-90% 橙 / ≥90% 红
 *   - 猫猫本身按 mood 上色（idle 蓝灰 / listening 青 / thinking 紫 / happy 绿 / worried 黄 / error 红）
 * 无边框、无 emoji。
 * 极窄终端退化：放不下 info 列时只显示 pet；放不下 pet 时整个 widget 隐藏。
 */

import type { ExtensionUIContext, Theme } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { fg, RESET, type AnimationState } from "../shared/animations.ts";
import type { FooterState, PetMood } from "../shared/types.ts";
import { fmtDuration, fmtTokens, shortModel } from "../shared/format.ts";
import { PET_ICONS as IC } from "../shared/icons.ts";

// 图标集中在 shared/icons.ts（PET_ICONS），这里别名 IC 供本模块简写引用。

// ═══════════════════════════════════════════════════════════════════════════
// 配色：cat 按心情上色 / thinking 分级 / context 按百分比
// ═══════════════════════════════════════════════════════════════════════════

/** Pet mood → 猫猫配色（HSL）；情绪越强烈饱和度越高 */
const MOOD_HSL: Record<PetMood, [number, number, number]> = {
  idle: [210, 0.22, 0.62], // 柔和蓝灰（待机）
  listening: [190, 0.7, 0.6], // 青（聆听输入）
  thinking: [270, 0.7, 0.65], // 紫（推理中）
  happy: [140, 0.6, 0.62], // 绿（完成任务）
  worried: [45, 0.85, 0.6], // 黄（context 偏高）
  error: [0, 0.85, 0.62], // 红（context ≥90%）
};

/** 给猫猫 ASCII 帧整体上色（行级包裹，空格仍渲染为空白） */
function colorizePet(lines: string[], mood: PetMood): string[] {
  const [h, s, l] = MOOD_HSL[mood] ?? MOOD_HSL.idle;
  const color = fg(h, s, l);
  return lines.map((line) => color + line + RESET);
}

/**
 * thinking level 分级配色：
 *   off→dim / low→muted / medium→success / high→warning / max→彩虹动画
 * 最高档（max/ultra/extreme）用随 phase 循环的彩虹，呼应“火力全开”。
 */
function renderThinking(theme: Theme, level: string, anim: AnimationState): string {
  const text = `${IC.think} ${level}`;
  const lv = level.toLowerCase();
  if (lv === "max" || lv === "ultra" || lv === "extreme") {
    const h = (anim.phase * 12) % 360;
    return fg(h, 0.85, 0.62) + text + RESET;
  }
  if (lv === "off") return theme.fg("dim", text);
  if (lv === "low" || lv === "minimal") return theme.fg("muted", text);
  if (lv === "medium") return theme.fg("success", text);
  if (lv === "high") return theme.fg("warning", text);
  return theme.fg("accent", text); // 未知档位
}

/** context 百分比 → 色相：<50 绿 / 50-70 黄 / 70-90 橙 / ≥90 红 */
function ctxHue(pct: number): number {
  if (pct >= 90) return 0;
  if (pct >= 70) return 30;
  if (pct >= 50) return 50;
  return 140;
}

/** 渲染 context 行：进度条 + 百分比 + 总窗口，颜色随用量分级 */
function renderContext(
  theme: Theme,
  pct: number,
  pctStr: string,
  windowTokens: number,
): string {
  const hue = ctxHue(pct);
  const filled = Math.max(0, Math.min(8, Math.round(pct / 12.5)));
  const bar =
    fg(hue, 0.75, 0.55) + "\u2593".repeat(filled) + RESET +
    theme.fg("dim", "\u2591".repeat(8 - filled));
  const pctColored = fg(hue, 0.8, 0.62) + pctStr + RESET;
  const win = theme.fg("dim", ` / ${fmtTokens(windowTokens)}`);
  return `${theme.fg("dim", IC.ctx)} ${bar} ${pctColored}${win}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Pet 帧表（5 行 × 11 字符，无边框）
// ═══════════════════════════════════════════════════════════════════════════

const FRAMES: Record<PetMood, string[]> = {
  idle: [
    "   /\\_/\\  ",
    "  ( o.o ) ",
    "   > ~ <  ",
    "  /|   |\\ ",
    " (_|   |_)",
  ],
  listening: [
    "   /\\_/\\  ",
    "  ( @.@ ) ",
    "   > ~ <  ",
    "  /|   |\\ ",
    " (_|   |_)",
  ],
  thinking: [
    "   /\\_/\\  ",
    "  ( O.O ) ",
    "   > ~ <  ",
    "  /|   |\\ ",
    " (_|   |_)",
  ],
  happy: [
    "   /\\_/\\  ",
    "  ( ^ω^ ) ",
    "   > ~ <  ",
    "  /|   |\\ ",
    " (_|   |_)",
  ],
  worried: [
    "   /\\_/\\  ",
    "  ( O.O )!",
    "   > △ <  ",
    "  /| ~ |\\ ",
    " (_|   |_)",
  ],
  error: [
    "   /\\_/\\  ",
    "  ( X.X )~",
    "   > △ <! ",
    "  /| ~ |\\ ",
    " (_| ~ |_)",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Pet mood helper
// ═══════════════════════════════════════════════════════════════════════════

export function setPetMood(anim: AnimationState, mood: PetMood): void {
  anim.petMood = mood;
  anim.petMoodStartMs = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════
// Widget 注册
// ═══════════════════════════════════════════════════════════════════════════

const PET_WIDTH = 11; // pet art 每行宽（含末尾空格）
const INFO_LINES = 5; // 信息行数（与猫猫 5 行一一配对）
const MIN_WIDTH_FOR_INFO = 28; // 显示左列信息需要的最小终端宽度

/**
 * 注册 aboveEditor 的 pi-pet widget。
 *
 * 签名：
 *   export function createPetWidget(
 *     ui: ExtensionUIContext,
 *     getState: () => FooterState,
 *     getAnim: () => AnimationState,
 *   ): void
 */
export function createPetWidget(
  ui: ExtensionUIContext,
  getState: () => FooterState,
  getAnim: () => AnimationState,
): void {
  ui.setWidget(
    "pi-pet",
    (_tui, theme) => ({
      invalidate(): void {},
      render(width: number): string[] {
        // 极窄终端退化：连 pet 都放不下
        if (width < PET_WIDTH + 2) return [];

        const state = getState();
        const anim = getAnim();
        const mood = anim.petMood;
        const petLines = colorizePet(FRAMES[mood] ?? FRAMES.idle, mood);

        const showInfo = width >= MIN_WIDTH_FOR_INFO;
        const gap = showInfo ? 2 : 0;
        const leftWidth = showInfo ? width - PET_WIDTH - gap : 0;

        // 5 行信息（与 pet 5 行一一配对）
        const elapsed = Date.now() - state.sessionStartMs;
        const pct = state.contextPercent ?? 0;
        const pctStr = `${Math.round(pct)}%`;
        const thinkingLabel = state.thinkingLevel || "off";
        const provider = state.providerName || "?";

        const infoLines: string[] = showInfo
          ? [
              theme.fg("accent", `${IC.model} ${shortModel(state.modelName || "?")}`),
              theme.fg("muted", `${IC.provider} ${provider}`),
              renderThinking(theme, thinkingLabel, anim),
              renderContext(theme, pct, pctStr, state.contextWindow || 0),
              theme.fg("muted", `${IC.clock} ${fmtDuration(elapsed)}`),
            ]
          : [];


        // 5 行 widget 输出：info 行按可见宽度右填充到 leftWidth + 上色后的 pet 行
        // 注意：着色后字符串含 ANSI 转义，raw length ≠ 可见宽度，必须用
        // visibleWidth 对齐，否则 cat 会错位。
        const out: string[] = [];
        for (let i = 0; i < 5; i++) {
          const raw = i < INFO_LINES ? (infoLines[i] ?? "") : "";
          const vw = visibleWidth(raw);
          const pad = vw < leftWidth ? " ".repeat(leftWidth - vw) : "";
          out.push(raw + pad + (petLines[i] ?? ""));
        }
        return out;
      },
    }),
    { placement: "belowEditor" },
  );
}
