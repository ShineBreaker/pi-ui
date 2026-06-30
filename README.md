# pi-ui

pi 编码 agent TUI 装饰扩展。提供三种组件：

- **Welcome Header** — 启动时显示彩虹渐变的 pi logo、当前模型/提供者、tips、loaded 统计、Agenote 健康度、recent sessions
- **Status Bar** — starship 风格 `path · git · time`，4 档宽度自适应（wide/narrow/compact），git dirty/ahead-behind/hash 实时查询（TTL 缓存避免频繁 fork）
- **Pet Widget** — ASCII 猫猫 5 种 mood（idle/listening/thinking/happy/worried/error），左列展示 model/thinking/context bar/duration

## 结构

```
pi-ui/
├── index.ts              # 入口：注册 header/footer/pet widget + 事件监听
├── widgets/
│   ├── welcome-box.ts    # WelcomeHeader Component（两栏布局）
│   ├── status-bar.ts     # 精简 status bar（setWidget aboveEditor）
│   └── pet.ts            # 桌面宠物 + 侧栏信息（belowEditor）
├── shared/
│   ├── types.ts          # FooterState / PetMood 类型（断环）
│   ├── animations.ts     # 动画原语（5s 彩虹呼吸、model flash）
│   ├── format.ts         # 纯格式化 helper（duration/bytes/tokens/bar/timeago/TTL cache）
│   └── nerd-font.ts      # Nerd Font 检测单一真相源
├── data/
│   ├── settings.ts       # settings.json 读取（XDG 兼容，静默降级）
│   └── plugin-bridge.ts  # 与 pi API / 本地文件系统的最小交互
├── package.json
├── README.md
└── LICENSE
```

## 集成

`package.json` 中声明为 pi 扩展：

```json
{
  "pi": { "extensions": ["."] },
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "@earendil-works/pi-tui": "*"
  }
}
```

入口 `index.ts` 默认导出 `piUiExtension(pi: ExtensionAPI): void`。

## 设计要点

- **非 overlay**：WelcomeHeader 永不弹覆盖层，启动直接进主界面
- **与 pi-powerline-footer 共存**：监听 `model_select` 防止其 `setHeader(undefined)` 清空白己的 header
- **宽度自适应**：
  - Status Bar: `wide(≥120) / medium(100-119) / narrow(80-99) / compact(<80)` 四级降级
  - Pet Widget: `<28 列` 隐藏 info 列；`<13 列` 隐藏整个 widget
  - Welcome Box: `<44 列` 跳过
- **动画开关**：环境变量 `PI_UI_ANIMATIONS=0` 关闭；SSH/CI/非交互终端自动关闭
- **Nerd Font 降级**：`shared/nerd-font.ts` 单点检测，不支持时图标回退到 ASCII 文本

## 行为

- `model_select` → model 名闪烁 + footer 刷新
- `tool_call` → context 用量刷新，pet mood 随用量切换（≥70% worried, ≥90% error + 一次性通知）
- `input` → pet 变为 listening 状态，input flash 动画
- `agent_start/end` → pet 切换 thinking/happy（happy 3s 后回到 idle）
