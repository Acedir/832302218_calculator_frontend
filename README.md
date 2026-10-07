# 832302218_calculator_frontend
前后端分离计算器系统的**前端客户端**，提供计算器界面与历史记录展示。

后端仓库：https://github.com/Acedir/832302218_calculator_backend

## 技术栈

- 原生 HTML5
- 原生 CSS3
- 原生 JavaScript (ES6+)
- Fetch API

无任何构建工具，无需 npm。

## 目录结构
832302218_calculator_frontend/
├── src/
│ ├── index.html # 页面结构
│ ├── style.css # 样式
│ └── app.js # 交互逻辑与 API 调用
├── codestyle.md # 代码规范
└── README.md

text

## 运行环境

- 任意现代浏览器（Chrome / Edge / Firefox / Safari）

## 启动

**方式一：直接打开**

双击 `src/index.html`，用浏览器打开即可。

**方式二：VS Code Live Server（推荐）**

1. 安装 VS Code 插件 `Live Server`
2. 右键 `src/index.html` → `Open with Live Server`

## 配置

后端地址在 `src/app.js` 顶部：

const API_BASE = "http://127.0.0.1:5000";
本地开发用 http://127.0.0.1:5000，部署后改为后端公网地址。