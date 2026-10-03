# 开源论文评审 · Open Paper Review

一个面向计算机科学 / AI 论文的开放评审平台：添加论文（支持从 arXiv 一键导入），匿名打分、写短评和长评，并对评论点赞或点踩。

## 功能

- **论文**：浏览、搜索（标题 / 作者 / 摘要）、按分类筛选，可按最新、评分最高或评分最多排序
- **arXiv 导入**：输入 arXiv ID，自动填写标题、作者、摘要、分类和 PDF 链接
- **评分**：1–5 星，每位访客对每篇论文只保留一个评分，可以修改
- **短评**：140 字以内
- **长评**：带标题，支持简单的 Markdown（标题、粗体、斜体、代码、链接）
- **投票**：对评论点赞或点踩，再点一次取消
- **中英双语**：界面支持简体中文和英文，右上角切换（URL 前缀 `/zh-CN/...`、`/en/...`）

没有账号体系。访客身份是浏览器 `localStorage` 里随机生成的 `visitorId`，昵称在评论时自填。

## 技术栈

Next.js 14（App Router）· React 18 · TypeScript · next-intl · Prisma 5 · SQLite（本地）/ Turso（线上）· Tailwind CSS

## 本地开发

需要 Node.js 18.17 或更高版本（推荐 20）。

```bash
npm install

# 本地用 SQLite，数据库文件会生成在 prisma/dev.db
echo 'DATABASE_URL="file:./dev.db"' > .env

# 按 prisma/schema.prisma 建表，同时生成 Prisma Client
npx prisma db push

npm run dev    # http://localhost:3000
```

## 环境变量

| 变量 | 用途 | 何时需要 |
| --- | --- | --- |
| `DATABASE_URL` | 本地 SQLite 路径，例如 `file:./dev.db`（相对于 `prisma/` 目录） | 本地开发 |
| `TURSO_DATABASE_URL` | Turso 数据库地址（`libsql://...`） | 线上 |
| `TURSO_AUTH_TOKEN` | Turso 访问令牌 | 线上 |

`TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN` **两个都设置**时连接 Turso；否则使用 `DATABASE_URL` 指向的本地 SQLite（见 `src/lib/prisma.ts`）。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | `prisma generate` 后进行生产构建 |
| `npm run start` | 运行构建产物 |
| `npm run db:push` | 把 `schema.prisma` 同步到本地数据库 |
| `npm run db:studio` | 打开 Prisma Studio 查看数据 |
| `npx tsc --noEmit` | 类型检查 |

> `npm run lint` 目前还不能用：项目里没有 ESLint 配置，运行后会弹出交互式的初始化向导。

## 目录结构

```
prisma/schema.prisma      数据模型：Paper、Rating、ShortReview、LongReview、Vote
messages/                 界面文案：zh-CN.json、en.json
src/middleware.ts         语言路由：没有语言前缀的地址跳转到 /zh-CN/...
src/i18n/                 next-intl 配置：支持的语言、服务端加载文案、带语言前缀的 Link / useRouter
src/app/                  页面（App Router）
  [locale]/page.tsx                首页：论文列表、搜索、筛选
  [locale]/paper/add/              添加论文（手动填写或 arXiv 导入）
  [locale]/paper/[id]/             论文详情：评分、短评、长评
  [locale]/paper/[id]/review/new/  写长评
  api/                    后端接口（见下表，不带语言前缀）
src/components/           业务组件；ui/ 下是通用基础组件
src/lib/                  prisma.ts（数据库客户端）、arxiv.ts（arXiv API）、utils.ts
```

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/papers` | 论文列表，参数：`search`、`category`、`sort`（`newest` / `rating` / `popular`）、`page`、`limit` |
| POST | `/api/papers` | 新增论文；arXiv ID 重复时返回 409 和已有论文的 `paperId` |
| GET | `/api/papers/[id]` | 论文详情，附带最新 10 条短评和 5 条长评 |
| GET / POST | `/api/papers/[id]/rate` | 查询 / 提交当前访客的评分 |
| GET / POST | `/api/reviews` | 查询（`paperId`、`type`、`sort`）/ 发表评论 |
| POST | `/api/reviews/[id]/vote` | 点赞 / 点踩，重复点击则取消 |
| GET | `/api/arxiv?id=` | 从 arXiv 拉取论文信息 |

## 部署（Vercel + Turso）

1. 在 [Turso](https://turso.tech) 创建数据库，拿到数据库 URL 和 token。
2. 在 Turso 上建表。`prisma db push` 不能直接作用于 Turso，需要先生成 SQL 再执行：
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
   turso db shell <数据库名> < schema.sql
   ```
   之后修改 schema 时，用 `--from-schema-datamodel <旧 schema 文件>` 代替 `--from-empty` 生成增量 SQL，再同样执行。
3. 在 Vercel 导入本仓库，设置环境变量 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN`。构建命令就是默认的 `npm run build`，其中已经包含 `prisma generate`。

## 已知限制

- 没有登录和管理后台，也没有删除论文或评论的接口
- `visitorId` 由前端生成，接口直接信任请求里传来的值，所以换一个 `visitorId` 就能重新评分或投票，用脚本也能批量刷。目前没有防刷机制
- 论文详情页只显示最新 5 条长评，没有分页
- arXiv ID 查重是精确字符串匹配：导入时 ID 通常带版本号（如 `2301.00234v1`），和手动填写的 `2301.00234` 不会被判为重复
