# AGENTS.md

开源论文评审：Next.js 14 App Router 单体应用，Prisma + SQLite（本地）/ Turso（线上），部署在 Vercel。项目介绍、目录结构和 API 列表见 README.md，这里只写改代码时需要知道的事。

## 环境与验证

```bash
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env   # 本地 SQLite，文件在 prisma/dev.db
npx prisma db push                            # 建表 + 生成 Prisma Client
```

改完代码后用这两步验证：

- `npx tsc --noEmit`：类型检查
- `npm run build`：生产构建（会先跑 `prisma generate`）

不要运行 `npm run lint`：项目没有 ESLint 配置，它会卡在交互式初始化向导上。项目也还没有测试；涉及接口行为的改动，用 `npm run dev` 启动后 `curl` 对应接口验证。

## 代码约定

- 路径别名 `@/*` 指向 `src/*`。
- 页面基本都是 `'use client'` 组件，在 `useEffect` 里 `fetch('/api/...')` 取数据；数据库读写只发生在 `src/app/api/**/route.ts`。
- API 路由的写法：返回 `NextResponse.json(...)`；参数校验失败返回 `{ error: '...' }` 加 400/404；数据库操作包在 `try/catch` 里，出错时 `console.error` 并返回 `{ error }` 加 500。例外是 `GET /api/papers/[id]/rate`，出错时返回 200 和 `{ userScore: null }`。
- 接口错误信息用英文，界面文字用中文。前端展示错误时用中文文案，不要直接显示接口返回的英文 `error`（`ArxivImport` 目前直接显示了，属于遗留问题）。
- 数据库只通过 `import { prisma } from '@/lib/prisma'` 访问，不要自己 `new PrismaClient()`：这个文件负责在本地 SQLite 和 Turso 之间切换。
- 动态路由参数：API 路由（`route.ts`）用 Next 14 的同步写法 `{ params }: { params: { id: string } }`，不是 Promise；页面是客户端组件，用 `useParams()`。
- 基础 UI 组件在 `src/components/ui/`，是 shadcn 风格：都用 `cn()` 合并类名，有变体的组件（button、badge）用 cva。主题色用 Tailwind 的 `primary-*`（橙色，定义在 `tailwind.config.ts`）。
- 论文详情页的数据来源：论文信息和长评来自 `GET /api/papers/[id]`（只返回最新 5 条长评）；短评由 `ShortReviewList` 单独请求 `GET /api/reviews?type=short`。`/api/papers/[id]` 返回的 `shortReviews` 页面没有用到。

## 数据模型的坑

- `Paper.authors` 和 `Paper.categories` 在 SQLite 里存的是 **JSON 字符串**。读取用 `parseAuthors()` / `parseCategories()`（`src/lib/utils.ts`），写入时 `JSON.stringify`。
- `Paper.avgRating` / `ratingCount` 和评论上的 `upvotes` / `downvotes` 是**冗余计数**，分别由 `api/papers/[id]/rate` 和 `api/reviews/[id]/vote` 维护。改评分或投票逻辑时要同步更新这些字段。
- `Vote` 同时服务短评和长评：`reviewType` 为 `short` 或 `long`，`shortReviewId` 和 `longReviewId` 二者只填其一。
- 短评 140 字的上限在前端（`ShortReviewForm`）和后端（`api/reviews`）各校验一次，改的时候两处一起改。

## 修改 schema

1. 改 `prisma/schema.prisma`，本地运行 `npx prisma db push`。
2. 线上 Turso 不会自动同步。项目没有 `prisma/migrations` 目录，旧 schema 要从 git 取，再生成增量 SQL：
   ```bash
   git show HEAD:prisma/schema.prisma > /tmp/old.prisma
   npx prisma migrate diff --from-schema-datamodel /tmp/old.prisma --to-schema-datamodel prisma/schema.prisma --script
   ```
   在 PR 说明里附上这段 SQL，提醒维护者用 `turso db shell` 执行。

## 依赖版本

- `prisma`、`@prisma/client`、`@prisma/adapter-libsql` 必须保持同一个 5.x 版本（目前是 5.22），`@libsql/client` 保持 0.8.x。只单独升级 adapter 会导致不兼容：之前升到 7.x 出过问题，在 commit a9855cd 里退回了。要升级就三个一起升，并在 Turso 上验证。
- `prisma/schema.prisma` 里的 `previewFeatures = ["driverAdapters"]` 是连接 Turso 所必需的，不要删。

## 安全

- 没有登录系统。访客身份 `visitorId` 由前端生成并随请求提交，不可信任。
- 不要新增删除或批量修改类的接口，除非同时加上鉴权（之前没有鉴权的 `DELETE /api/papers/[id]` 已经因此移除）。
- 用户提供的 URL 放进 `href` 之前必须经过 `isSafeUrl()`（`src/lib/utils.ts`），只允许 http(s)。
- 长评的 Markdown 由 `LongReviewCard.tsx` 里的 `renderMarkdown()` 渲染：它先转义 HTML，再替换 Markdown 语法。不要在别处新增 `dangerouslySetInnerHTML`，也不要调换这个先转义、后替换的顺序。

## 部署

- `next.config.js` 里的 `serverComponentsExternalPackages`（Prisma 和 libsql）是修 Vercel 部署时加上的（commit c6d72be）。其中几个包可能已经在 Next 的内置列表里，但没有验证过哪个是必需的；删之前先在 Vercel 预览部署上验证。
- 线上只需要 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN`，两个都设置时才会走 Turso。
- arXiv 导入调用的是 `export.arxiv.org`。`fetchArxivPaper()` 遇到任何失败（包括网络不通）都返回 `null`，接口因此统一报 404 "Paper not found on arXiv"。在没有外网的环境里测不了导入，看到 404 不要误以为是 ID 写错了。
