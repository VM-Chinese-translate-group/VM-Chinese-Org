# D1 内容管理

这个版本不使用 Cloudflare Access、不需要任何 Cloudflare 环境变量，也不需要 GitHub 内容提交。

内容保存在 D1；管理员访问 `/admin` 使用单一 6 位数字密码登录。发布内容时，后台从 D1 读取你保存的 Pages Deploy Hook URL，并触发一次完整构建。

## 只需配置三步

1. 创建 D1 数据库，例如 `vmct-site-content`，在 SQL Editor 中执行 [content-cms.sql](../database/content-cms.sql)。
2. 在现有 Pages 项目的 **Settings → Bindings** 添加 D1：

   ```text
   Variable name: CONTENT_DB
   Database: vmct-site-content
   ```

   保存后重新部署一次。

3. 打开 `https://vmct-cn.top/admin`，首次设置一个 6 位数字密码。登录后展开“部署设置”，粘贴在 Pages 项目 **Settings → Builds → Deploy Hooks** 创建的 Production Hook URL 并保存。

此后，保存草稿只写 D1；点击“发布并完整构建”才会触发一次 Pages 完整构建。

## 导入现有 Markdown

完成上述三步后，在本地运行：

```powershell
pnpm content:migrate
```

脚本会在终端要求输入后台 6 位密码，随后导入 `src/pages/**/*.md` 并触发完整构建。确认线上页面正常后，再删除旧 Markdown。

## 安全提示

6 位数字密码比强密码弱得多。后台实现了单 IP 连续失败 5 次锁定 15 分钟、PBKDF2 密码哈希和安全 Cookie，但这不能替代长密码或额外访问保护。不要把后台密码或 Pages Deploy Hook URL 发给任何人。
