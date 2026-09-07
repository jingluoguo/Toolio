# Toolio

Toolio 是一个轻量的日常工具门户。目前提供粉色扇形风格的「决策转盘」，用转动和停靠交给当前选择一点仪式感。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Yarn
- Lucide React

## 页面

| 路径 | 说明 |
| --- | --- |
| `/` | Toolio 工具集汇总页 |
| `/wheel` | 决策转盘工具页 |

## 决策转盘

- 支持 2-36 个选项
- 支持在弹窗中修改转盘名称
- 支持添加、编辑和删除选项
- 支持双列配置列表，选项较多时可滚动编辑
- 选项文字过长时会在转盘内自动换行
- 不足 24 个选项时会重复排布标签，保持转盘的扇形密度
- 点击中心天使猫开始转动
- 支持在设置中选择停止方式：手动暂停或自动暂停
- 手动模式下再次点击中心天使猫暂停；结果以暂停瞬间指针所在的扇形为准
- 自动模式会在每次随机生成的 3.2-6.8 秒等待后自动暂停，期间中心天使猫不可暂停
- 停止后只会在当前扇形内微调到扇区中线，不会跨扇区跳转
- 旋转时会触发中心天使猫、底部爱心和右上角发散爱心动画
- 旋转过程中会锁定编辑操作
- 支持恢复默认示例
- 支持 `prefers-reduced-motion`，尊重系统的减少动态效果设置

## 开始使用

### 环境要求

- Node.js 20 或更高版本
- Yarn 1.x

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

默认访问地址：<http://localhost:3000>

如果 3000 端口已经被占用，可以指定其他端口：

```bash
yarn dev --port 3001
```

### 构建生产版本

```bash
yarn build
```

### 启动生产服务器

```bash
yarn start
```

## 部署到 GitHub Pages

项目已配置 GitHub Actions 工作流：`.github/workflows/deploy-pages.yml`。

每次推送到 `master` 分支后，工作流会自动执行以下步骤：

1. 安装 Node.js 20 和 Yarn 依赖。
2. 使用 Next.js 生成静态站点。
3. 上传 `out/` 构建产物。
4. 部署到 GitHub Pages。

首次启用时，在 GitHub 仓库中打开：

`Settings` → `Pages` → `Build and deployment` → `Source` → 选择 `GitHub Actions`

当前仓库为项目站点，部署地址通常为：

<https://jingluoguo.github.io/Toolio/>

GitHub Actions 会自动将仓库名注入 `NEXT_PUBLIC_BASE_PATH`，因此项目在 `/Toolio/` 子路径下也能正常处理页面链接。

## 项目结构

```text
Toolio/
├── app/
│   ├── globals.css       # 全局样式和转盘视觉样式
│   ├── layout.tsx        # 根布局和页面元信息
│   ├── page.tsx          # 工具集汇总页
│   └── wheel/
│       └── page.tsx      # 决策转盘页面
├── next.config.ts        # Next.js 配置
├── postcss.config.mjs    # PostCSS 配置
├── tailwind.config.ts    # Tailwind CSS 配置
├── tsconfig.json         # TypeScript 配置
├── package.json          # 项目脚本和依赖
└── yarn.lock             # Yarn 依赖锁定文件
```

## 使用说明

1. 打开工具集首页，点击「决策转盘」进入工具。
2. 点击「编辑转盘」打开配置弹窗。
3. 修改名称或编辑选项，也可以添加新选项。
4. 点击「保存设置」应用配置。
5. 点击中心天使猫开始转动。
6. 手动模式下，再次点击中心天使猫暂停；自动模式则等待随机时间后自动暂停。

## 设计说明

界面采用白底、粉色放射扇形和手绘线条天使猫，形成轻盈、带一点游戏感的选择体验。转盘使用 SVG 绘制扇区，并依据扇区数量自动换行和缩放中文标签；停止时读取指针所在扇区，再平滑对齐至该扇区中线。

## 验证

当前项目已通过生产构建验证：

```bash
yarn build
```
