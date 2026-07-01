// SPDX-FileCopyrightText: 2026 BrokenShine <xchai404@gmail.com>
//
// SPDX-License-Identifier: MIT

/**
 * icons.ts — 全扩展 Nerd Font 图标的【唯一真相源】。
 *
 * ★★★ 在这里改图标，不要去 widget 文件里找 ★★★
 *
 * 三处 widget（welcome-box / pet / status-bar）全部从这里 import。
 * 你要替换某个图标时：
 *   1. 到 https://www.nerdfonts.com/cheat-sheet 搜想要的名字
 *   2. 复制其 Unicode codepoint（如 f061a）
 *   3. 改下面对应条目的 `"\uXXXX"`（注意大小写：\u 后跟 4 位大写 hex）
 *   4. 同步更新行尾注释里的图标名，方便下次找
 *
 * ── 码点字体集速查（判断你查到的图标属于哪个集） ──────────────
 *   FA  (Font Awesome)   F000–F2FF（4 位）    ✅ v3 稳定，推荐
 *   MD  (Material Design) F0001–F1AF0（5 位） ✅ v3 稳定，推荐
 *   Devicons              E700–E8EF           ✅ 稳定（语言/技术 logo）
 *   Codicons              EA60–EC1E           ✅ 稳定（VS Code 图标）
 *   ⚠ F300–F4FF（4 位）   多为 NF v2 旧 MD/Octicons → v3 多已迁移，慎用
 *   ⚠ F500+  （4 位）     NF v2 旧 MD 区 → v3 已迁到 F0xxx+，大概率失效
 *
 * 每个图标格式：`NERD_FONTS ? "<nf 码点>" : "<ascii 降级>"`
 * 不支持 Nerd Font 的终端会显示降级文本。
 */

import { NERD_FONTS } from "./nerd-font.ts";

// ═══════════════════════════════════════════════════════════════════════════
// A. Welcome Header（启动欢迎框）— 见 widgets/welcome-box.ts
// ═══════════════════════════════════════════════════════════════════════════

/** Welcome 框右栏各区段标题 + Loaded 明细行的图标 */
export const WELCOME_ICONS = {
  /** 区段标题：Tips */
  tips: NERD_FONTS ? " " : "",
  /** 区段标题：Loaded */
  loaded: NERD_FONTS ? " " : "",
  /** 区段标题：Recent */
  recent: NERD_FONTS ? " " : "",
  /** 区段标题：Agenote */
  agenote: NERD_FONTS ? "󰎚 " : "kb",

  // ── Loaded 明细行 ──
  /** context 文件计数 */
  ctxFile: NERD_FONTS ? " " : "ctx",
  /** tool 计数 */
  tool: NERD_FONTS ? " " : "tool",
  /** skill 计数 */
  skill: NERD_FONTS ? " " : "skl",
  /** extension 计数 */
  ext: NERD_FONTS ? " " : "ext",
  /** template 计数 */
  template: NERD_FONTS ? " " : "tpl",

  // ── Recent 行前缀 ──
  /** recent session 行首小圆点 */
  dot: NERD_FONTS ? " " : "*",

  // ── Agenote 数据行行首（见 welcome-box.ts Agenote 区）──
  /** agenote cards 计数行 */
  cards: NERD_FONTS ? "󰃀 " : "#",
  /** agenote metrics 指标行行首 */
  metric: NERD_FONTS ? " " : "m",
  /** agenote feedback 行行首 */
  feedback: NERD_FONTS ? " " : "fb",
} as const;

/**
 * Agenote 健康度状态图标（metrics 行行尾，带脉冲色）。
 * ✅ 已从 emoji 改为 NF 圆形图标。
 */
export const STATUS_ICONS = {
  /** 正常 */
  ok: NERD_FONTS ? " " : "OK",
  /** 警告 */
  warn: NERD_FONTS ? " " : "!",
  /** 错误 */
  error: NERD_FONTS ? "󰅚 " : "X",
} as const;

/**
 * 时辰问候图标（welcome 左栏 "Welcome back!  ☀ morning"）。
 * ⚠ 全部是 NF v2 旧 MD 码点，v3 已迁移 → 大概率渲染不出，需重挑。
 *   在 NF cheat-sheet 搜 "weather-" 前缀（如 weather-sunny = F0994）。
 *   数组按 hour 分段：[lateNight, morning, afternoon, evening, night]
 */
export const WEATHER_ICONS = {
  /** 默认/早晨 sunny */
  sunny: NERD_FONTS ? " " : "",
  /** 深夜 */
  lateNight: NERD_FONTS ? "󰖔 " : "",
  /** 下午 */
  afternoon: NERD_FONTS ? " " : "",
  /** 傍晚 */
  evening: NERD_FONTS ? "󰖚 " : "",
  /** 夜晚 */
  night: NERD_FONTS ? "󰼱 " : "",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// B. Pet Widget（编辑框下方猫猫左侧信息栏）— 见 widgets/pet.ts
// ═══════════════════════════════════════════════════════════════════════════

/** Pet 左侧 5 行信息的行首图标 */
export const PET_ICONS = {
  /** 第 1 行 model */
  model: NERD_FONTS ? " " : "M",
  /** 第 2 行 provider */
  provider: NERD_FONTS ? "󰅟 " : "P",
  /** 第 3 行 thinking level */
  think: NERD_FONTS ? " " : "T",
  /** 第 4 行 context 用量 */
  ctx: NERD_FONTS ? "󰭹 " : "C",
  /** 第 5 行 会话时长 — FA clock-o */
  clock: NERD_FONTS ? "󱃐 " : "t",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// C. Status Bar（底部路径栏）— 见 widgets/status-bar.ts
// ═══════════════════════════════════════════════════════════════════════════

/** Status bar 各段前缀图标（path · git · ahead/behind · hash · time） */
export const BAR_ICONS = {
  /** 路径段 */
  folder: NERD_FONTS ? " " : "dir",
  /** git 分支段 */
  branch: NERD_FONTS ? " " : "b",
  /** git HEAD 提交段 */
  commit: NERD_FONTS ? " " : "@",
  /** 时间段 */
  clock: NERD_FONTS ? " " : "t",
  /** 段分隔符 */
  sep: " · ",
  /** ahead/behind 箭头 */
  ahead: " ", // ↑
  behind: " ", // ↓
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// D. 项目语言检测（status bar 的 lang 段）— 见 widgets/status-bar.ts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 按 cwd 特征文件探测项目语言，返回 [探测文件, 图标, 标签]。
 * 图标用 Devicons（E700-E8EF，语言 logo 的标准集）。
 * ⚠ 部分码点可疑（见行尾），重挑时到 cheat-sheet 搜语言名。
 */
export const LANG_PROBES: ReadonlyArray<readonly [string, string, string]> = [
  // node
  ["package.json", NERD_FONTS ? " " : "node", "Node"],
  // rust devicon
  ["Cargo.toml", NERD_FONTS ? " " : "rs", "Rust"],
  // python devicon
  ["pyproject.toml", NERD_FONTS ? " " : "py", "Python"],
  // go
  ["go.mod", NERD_FONTS ? " " : "go", "Go"],
  // nix
  ["flake.nix", NERD_FONTS ? "󱄅 " : "nix", "Nix"],
  // guix
  ["channel.scm", NERD_FONTS ? " " : "guix", "Guix"],
  // guix
  ["manifest.scm", NERD_FONTS ? " " : "guix", "Guix"],
];
