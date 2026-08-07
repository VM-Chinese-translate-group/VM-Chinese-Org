# VM Chinese Translation Feedback Worker

该 Worker 只服务于汉化意见征集页面，并绑定独立的 D1 数据库 `vm-chinese-translation-feedback`。Worker 名称、D1 binding、数据库 ID、生产路由和已应用迁移都必须保持不变。

编辑人员不需要维护 Worker 源码，也不需要调用接口。日常项目状态、封面、类型、名称、别名和来源维护，请按照 [汉化意见征集后台编辑指南](../docs/translation-feedback-cloudflare.zh-CN.md) 在 Cloudflare Dashboard 的 D1 SQL Editor 中完成。

## 自动封面

提交新项目或补充来源时，Worker 会尝试从 Modrinth 或 CurseForge 获取封面，并只在 `cover_url` 为空时写入。Modrinth 使用公开 API；CurseForge 必须在 Cloudflare Dashboard 的 Worker 设置 → Variables and Secrets 中添加名为 `CURSEFORGE_API_KEY` 的 Secret。密钥不应写入源码、`wrangler.toml`、前端环境变量或文档。

未配置 CurseForge 密钥、接口失败、限流或项目没有封面时，提交不会失败，编辑人员仍可按后台指南手动设置 `cover_url`。`CURSEFORGE_GAME_ID` 可选，未配置时使用 Minecraft 的默认值 `432`。

请勿删除或重建 D1，不要修改 `worker/migrations/`，不要清空业务表，也不要对生产库执行测试种子。
