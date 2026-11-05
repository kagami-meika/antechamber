# Antechamber

> A minimalist, local-first sanctuary for multifaceted inner dialogue.  
> 极简主义、本地优先的私密自省场域与多向自我对话空间。

[![CI](https://github.com/kagami-meika/antechamber/actions/workflows/ci.yml/badge.svg)](https://github.com/kagami-meika/antechamber/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

---

## 理念与概念 (Design Philosophy)

Antechamber 是一个专注于**自我内在对话**的桌面软件。它不引入任何 AI 大语言模型或虚拟角色生成，也不进行自动化分析；场域中的所有言论与沉思均由使用者亲自书写。

- **Antechamber (前室 / 心灵场域)**：整体软件所构建的安静空间。
- **Cloister (廊道)**：各自独立的思维论题或对话场域。各个 Cloister 之间的数据完全隔离。
- **Presence (临在者)**：在特定 Cloister 内参与思考的自我切面身份（如理性分析、敏感情绪、旁观怀疑等）。不追求完整人格定义，仅作为思维视角的锚点。

---

## 核心特性 (Key Features)

- **Cloister 隔离与专属 Presence**：每个 Cloister 拥有独立的 Presence 集合与对话记录，支持重名保护。
- **线性连续时间线 & 连续发言融合**：单一连续时间线，同一个 Presence 连续发言时左侧指示竖线平滑连结，清晰美观。
- **划词片段引用与快捷复制**：选取任意历史消息文本即可唤出浮动菜单，选择「引用」附带溯源信息或「复制」到剪贴板。
- **不定高虚拟滚动 (Virtualization)**：采用 `react-virtuoso` 驱动消息列表，轻松支撑数万条长对话流畅渲染，彻底告别 DOM 膨胀。
- **全域独立搜索**：支持跨 Cloister 的全局检索，搜索框支持多行换行，结果按 `{Cloister} - {Presence}` 格式精准定位并支持一键跳转。
- **个性化设置与排版定制**：支持独立调整正文/引用字号与字体（中英文分离配置）、时间戳展示偏好以及可拖动侧边栏宽度。
- **本地优先与数据安全**：基于 SQLite (WAL 模式 + 外键级联 + 显式事务回滚)，数据完全保存在本机；支持原生文件选择框导出 JSON 完整备份、JSONL 与纯文本 TXT，随时无缝恢复。

---

## 常用快捷键 (Shortcuts)

| 快捷键 | 作用区域 | 说明 |
| :--- | :--- | :--- |
| <kbd>Tab</kbd> | 底部输入框 | 循环轮换当前 Cloister 下可用的 Presence 发言身份 |
| <kbd>Enter</kbd> | 底部输入框 | 发送当前编辑的消息 |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | 底部输入框 / 搜索栏 | 文本换行 |
| <kbd>Enter</kbd> | 全域搜索栏 | 立即触发全域搜索 |
| 鼠标文本划选 | 历史消息区域 | 弹出操作菜单（引用文本片段 / 复制至剪贴板） |

---

## 技术架构 (Tech Stack)

- **Desktop Framework**: [Tauri v2](https://tauri.app/) (Rust 2021)
- **Frontend Core**: React 18 + TypeScript + Vite 6
- **UI & Typography**: Tailwind CSS + Lucide Icons (Swiss Style 极简排版)
- **State Management**: Zustand 5 (LocalStorage 偏好持久化 + 异步竞态防抖)
- **Database & Storage**: SQLite via `rusqlite` (WAL Journaling + Foreign Key Constraints + Explicit Transactions)
- **Virtual List**: `react-virtuoso`
- **Testing**: Rust unit tests (`cargo test`) + Vitest (`antechamber-test`)

---

## 本地开发指南 (Development)

### 环境依赖

- [Node.js](https://nodejs.org/) (>= 18) 与 npm
- [Rust](https://www.rust-lang.org/) (>= 1.77)
- 操作系统构建依赖 (Windows: C++ Build Tools; Linux: webkit2gtk 等)

### 常用命令

```bash
# 1. 安装依赖
npm install

# 2. 运行本地开发环境 (同时启动 Vite 与 Tauri 桌面窗口)
npm run tauri dev

# 3. 运行测试套件
cd src-tauri && cargo test && cd ..

# 4. 生成 Release 绿色单文件便携版 (Windows)
npm run tauri build -- --no-bundle
# 生成的可执行文件位于: src-tauri/target/release/antechamber.exe
```

---

## 开源协议 (License)

本项目采用 [MIT License](LICENSE) 开源协议。
