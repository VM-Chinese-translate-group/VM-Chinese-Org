# VM 汉化组网站内容编辑指南

这份文档面向维护网站内容的编辑者。它说明如何新增或修改整合包、地图等资源页面，以及如何在提交前检查页面。

文档放在仓库根目录，只用于 GitHub 上的编辑参考，不会被网站路由加载。网站页面仍然放在 `src/pages/` 下。

## 先看这几条

- 新整合包放在 `src/pages/modpacks/`，新地图放在 `src/pages/map/`。
- 文件名会成为 URL 的一部分。建议使用小写英文、数字和短横线，例如 `my-new-pack.md`；页面发布后不要随意改名。
- 资源页面使用 `<DownloadLayout :meta="frontmatter">`。整合包和地图的标题、封面、状态、右上角下载按钮和侧栏信息都由它生成。
- Frontmatter 中的 `links` 是“相关链接”，正文中的 `<DownloadLinks>` 才是下载入口。两者不要混用。
- 繁体中文由网站自动转换，编辑时只维护简体中文正文；不要为了繁中另建一份页面。
- 不要直接修改 `dist/`。它是构建产物，源文件在 `src/` 和 `public/`。

## 一次编辑的完整流程

1. 从最新代码创建自己的分支，先确认没有未保存的他人修改。
2. 复制一个内容结构相近的现有页面，或参考 `src/pages/modpacks/example.md`。
3. 把文件放进正确的目录并改成稳定的 slug（文件名）。
4. 填写 Frontmatter，再编写正文和下载链接。
5. 把页面需要的图片放到 `public/imgs/`，在 Markdown 或 Frontmatter 中使用 `/imgs/...` 路径。
6. 启动本地预览，检查简体中文、繁体中文和英文界面下的标题、链接、图片和下载按钮。
7. 查看变更内容后再提交到仓库。本文档不要求也不会替你执行 Git 提交或推送。

## 目录速查

| 位置                                             | 用途                                         |
| ------------------------------------------------ | -------------------------------------------- |
| `src/pages/modpacks/`                            | 整合包资源页                                 |
| `src/pages/map/`                                 | 地图资源页                                   |
| `src/pages/<name>.md`                            | “加入社区”“支持我们”等普通内容页             |
| `public/imgs/`                                   | 页面可直接引用的图片和图标                   |
| `src/components/DownloadPage/DownloadLinks.vue`  | 下载按钮组件的实现，通常不需要编辑者修改     |
| `src/components/DownloadPage/downloadMethods.ts` | 下载方式字段和合并规则，通常不需要编辑者修改 |
| `dist/`                                          | 构建输出，不是内容源文件                     |

`src/pages` 下的 Markdown 会自动生成路由，不需要手动登记路由。例如：

```text
src/pages/modpacks/my-new-pack.md  ->  /modpacks/my-new-pack
src/pages/map/example-map.md       ->  /map/example-map
src/pages/modpacks/my-pack/index.md -> /modpacks/my-pack
```

`src/pages/modpacks/example.md` 只是模板参考。资源列表会排除 `example.md`、`secret.md` 以及 `fc5-wiki` 目录中的页面，因此不要直接把示例文件当成正式资源页。

## 创建普通内容页

如果要写“加入社区”“支持我们”之外的说明页，而不是一个可下载的资源页，可以直接在 `src/pages/` 下新建 Markdown 文件。例如，`src/pages/installation.md` 会生成 `/installation`。

普通内容页使用 `DocLayout`，不会出现资源封面、版本侧栏和下载按钮：

```md
---
title: 安装说明
description: 网站资源的通用安装说明
---

<DocLayout :meta="frontmatter">

## 开始之前

这里写面向读者的说明。

## 操作步骤

1. 第一步。
2. 第二步。

</DocLayout>
```

新建文件会自动得到路由，但不会自动出现在导航栏、首页卡片或搜索推荐区。若页面需要加入导航、首页入口或新的通用翻译，先保留 Markdown 内容，再请熟悉前端代码的维护者补充对应配置。

## 创建整合包页面

### 1. 复制模板并命名

在 `src/pages/modpacks/` 中复制 `example.md`，将副本改成简短、稳定的英文文件名。例如：

```text
src/pages/modpacks/create-mekanized.md
```

文件名只影响 URL 和文件识别，不会自动翻译成页面标题。页面中文名写在 `title` 中。

### 2. 填写 Frontmatter

下面是一个可以直接改写的整合包模板。链接、名称和版本均为占位内容，发布前必须换成真实信息。

```md
---
title: 示例整合包汉化下载
originalName: 'Example Modpack'
icon: /imgs/example-modpack.webp
description: |
  这里写整合包的玩法、主题和汉化范围。控制在一两段，方便首页卡片阅读。
updateDate: 2026-8-6
featured: false
status:
  type: maintaining
compatibility:
  loader: forge
  minecraft: '1.20.1'
  pack: '1.0.0'
authors:
  - '原作者团队（作者）'
  - 'VM 汉化组（翻译）'
links:
  - id: curseforge
    text: CurseForge 原帖
    link: https://www.curseforge.com/minecraft/modpacks/example
  - id: modrinth
    text: Modrinth 页面
    link: https://modrinth.com/modpack/example
---

<DownloadLayout :meta="frontmatter">

::: warning 下载前请确认
这里写需要玩家先确认的事项，例如适用的 Minecraft 版本、加载器和整合包版本。
:::

## 整合包简介

这里写玩家会实际体验到的内容。不要把下载地址、安装步骤和简介混在同一段。

<DownloadLinks :methods="[
  {
    id: 'patch',
    text: '下载汉化补丁',
    link: 'https://example.com/example-zh.zip'
  },
  {
    id: 'lazy',
    text: '懒汉下载',
    link: 'https://example.com/example-zh.zip'
  }
]" />

## 安装说明

1. 下载对应版本的整合包和汉化补丁。
2. 按页面说明将文件放入对应目录。
3. 启动游戏后检查语言和汉化是否生效。

<DocSupport />

</DownloadLayout>
```

### 3. 编写正文

整合包页面可以按下面的顺序组织，读者打开页面后能先看到下载入口，再决定是否阅读详细介绍：

1. 重要兼容性或授权说明。
2. `<DownloadLinks>` 下载方式选择。
3. 整合包玩法和汉化范围。
4. 安装、更新或卸载说明。
5. 已知问题、鸣谢和反馈方式。
6. `<DocSupport />`（需要展示支持与社区信息时使用）。

Frontmatter 已经会在页面顶部显示名称、封面、作者、更新日期、状态和版本信息，正文不必重复整块元数据。可以在正文中补充更具体的安装要求或版本差异。

## 创建地图页面

### 1. 放置文件

地图页面放在 `src/pages/map/`，例如：

```text
src/pages/map/example-map.md  ->  /map/example-map
```

地图和整合包使用相同的 `DownloadLayout`，因此右上角下载按钮、下载方式选择和侧栏信息的写法一致。地图特有的信息（存档目录、游玩人数、地图规则）写在正文中。

### 2. 地图模板

```md
---
title: 示例地图汉化下载
originalName: 'Example Map'
icon: /imgs/maps/example-map.webp
description: |
  这里写地图类型、适合人数和主要玩法。首页卡片会使用这段简介。
updateDate: 2026-8-6
status:
  type: translating
compatibility:
  loader: vanilla
  minecraft: '1.21.1'
  pack: '1.0'
authors:
  - '原作者（作者）'
  - 'VM 汉化组（翻译）'
links:
  - id: bilibili
    text: 介绍视频
    link: https://www.bilibili.com/video/BVxxxxxxxxx
  - id: minecraftmaps
    text: 地图原帖
    link: https://www.minecraftmaps.com/example-map
---

<DownloadLayout :meta="frontmatter">

## 地图信息

原名：Example Map

这里写地图背景、玩法目标和玩家人数。原页面已有的介绍、规则和授权信息都应保留，不要因为改成统一布局而删掉。

::: warning 安装前确认
这里只写地图专属提醒，例如“仅支持 Java 版”“请把解压后的文件夹放进 `saves`”。
:::

<DownloadLinks :methods="[
  {
    id: 'lanzou-quark-mapdl',
    text: '下载地图和汉化',
    lanzouLink: 'https://example.com/map-lanzou',
    quarkLink: 'https://pan.quark.cn/s/example'
  },
  {
    id: 'lazy',
    text: '懒汉下载',
    link: 'https://example.com/map-lanzou'
  }
]" />

## 游玩方式

### 目标

写清楚玩家要完成什么。

### 安装步骤

1. 解压地图文件。
2. 将存档文件夹放入 Minecraft 的 `saves` 目录。
3. 启动对应版本并进入存档。

<DocSupport />

</DownloadLayout>
```

地图原帖、介绍视频和授权说明属于 `links` 或正文；地图文件和汉化补丁的实际下载地址属于 `<DownloadLinks>`。这样页面顶部按钮和下载方式选择都会指向正确的下载流程。

## Frontmatter 字段说明

Frontmatter 必须位于文件第一行，使用两行 `---` 包住。缩进建议统一使用两个空格，列表项前使用 `-`。带有冒号、井号或其他 YAML 特殊字符的值请加引号。

| 字段                      | 必填 | 写法和用途                                                                                                          |
| ------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| `title`                   | 是   | 中文页面标题。资源页建议以“汉化下载”结尾，例如 `某整合包汉化下载`。首页卡片会去掉这个后缀，页面标题仍保留完整写法。 |
| `originalName`            | 建议 | 原作名称，使用原文拼写。英文界面会优先显示它；没有该字段时英文页面只能使用中文标题。                                |
| `icon`                    | 建议 | 首页卡片和详情页顶部封面。站内图片使用 `/imgs/...`，也可以使用可靠的远程 HTTPS 地址。                               |
| `image`                   | 可选 | 需要单独指定大图或首页展示图时使用；没有时通常会回退到 `icon`。                                                     |
| `description`             | 建议 | 首页卡片、搜索结果和页面简介使用的短介绍。使用块文本写法可以保留多行（模板中有示例）。                              |
| `updateDate`              | 建议 | 更新日期，也用于资源排序。推荐 `2026-8-6` 或 `2026-08-06`，不要写“待定”。                                           |
| `featured`                | 可选 | 写 `true` 可让资源优先出现在热门内容中；不需要时省略或写 `false`。                                                  |
| `status.type`             | 可选 | 只能使用 `maintaining`、`translating`、`stopped`。分别表示持续跟进、汉化进行中、暂不跟进更新。                      |
| `compatibility.loader`    | 建议 | 加载器，如 `forge`、`fabric`、`neoforge` 或 `vanilla`。                                                             |
| `compatibility.minecraft` | 建议 | 适用的 Minecraft 版本，例如 `'1.20.1'`。                                                                            |
| `compatibility.pack`      | 可选 | 整合包版本或地图版本；没有明确版本时可以省略。                                                                      |
| `authors`                 | 建议 | 列表格式。建议在名字后标明角色，如 `（作者）`、`（翻译）`。第一位作者也会用于首页卡片。                             |
| `links`                   | 可选 | 页面侧栏中的原帖、视频、项目仓库等相关链接，不是下载按钮。                                                          |

一个最小的资源页至少应有 `title`、`icon`、`description`、`updateDate`、`authors`，并在正文中放置 `<DownloadLinks>`。信息暂时不完整时，可以省略对应可选字段，不要填入猜测内容。

### 状态怎么选

状态描述的是 VM 汉化组对该页面或汉化补丁的跟进情况，不代表原作者是否停止开发：

| 值            | 页面显示     | 适用情况                                         |
| ------------- | ------------ | ------------------------------------------------ |
| `maintaining` | 持续跟进     | 会主动关注版本变化并维护汉化。                   |
| `translating` | 汉化进行中   | 翻译或校对尚未完成。                             |
| `stopped`     | 暂不跟进更新 | 当前不主动追踪新版本，但已有汉化仍可能可以使用。 |

如果使用 `stopped`，建议在正文提示具体的适用版本和现状。不要自定义状态值，未知值不会自动生成合适的中文标签。

### 相关链接 `links`

常用的 `id` 包括：

`bilibili`、`curseforge`、`github`、`modrinth`、`minecraftmaps`、`xisumavoid`、`i18n`、`paratranz`。

共享链接可以少写一些字段，例如：

```yaml
links:
  - id: i18n
  - id: paratranz
    project: 12345
```

不确定某个 `id` 是否有内置图标时，直接写完整的 `text` 和 `link` 最稳妥：

```yaml
links:
  - id: original-page
    text: 原作页面
    link: https://example.com/original-page
```

同一个 `id` 可以出现多次，只要 `text` 和 `link` 不同即可。例如，一个页面可以有多个 GitHub 仓库。

## 下载链接怎么写

### `links` 和 `<DownloadLinks>` 的区别

| 写法                     | 显示位置                         | 用来放什么                             |
| ------------------------ | -------------------------------- | -------------------------------------- |
| Frontmatter 的 `links`   | 详情页右侧“相关链接”             | 原帖、介绍视频、项目仓库、翻译项目等。 |
| 正文的 `<DownloadLinks>` | 下载方式选择，顶部按钮也会调用它 | 汉化补丁、地图、整合包和网盘下载方式。 |

如果只在 `links` 中写了下载地址，页面右上角的下载按钮不会得到正确的下载方式。实际下载请始终使用 `<DownloadLinks>`。

### 普通单链接

```md
<DownloadLinks :methods="[
  {
    id: 'patch',
    text: '下载汉化补丁',
    link: 'https://example.com/patch.zip',
    subText: '适用于 Minecraft 1.20.1'
  }
]" />
```

只有一个可用方式时，顶部按钮会直接打开它；有多个方式时，顶部按钮会打开下载选择框。

### 整合包的蓝奏云与夸克网盘

整合包页面通常使用 `quark-lanzou`，它会在下载弹窗中提供蓝奏云和夸克网盘：

```md
<DownloadLinks :methods="[
  {
    id: 'quark-lanzou',
    text: '下载汉化',
    lanzouLink: 'https://example.com/pack-lanzou',
    quarkLink: 'https://pan.quark.cn/s/example'
  },
  {
    id: 'lazy',
    link: 'https://example.com/pack-lanzou'
  }
]" />
```

### 地图的蓝奏云与夸克网盘

地图常用双网盘写法如下：

```md
<DownloadLinks :methods="[
  {
    id: 'lanzou-quark-mapdl',
    text: '下载地图和汉化',
    lanzouLink: 'https://example.com/lanzou',
    quarkLink: 'https://pan.quark.cn/s/example'
  },
  {
    id: 'lazy',
    text: '懒汉下载',
    link: 'https://example.com/lanzou'
  }
]" />
```

`lanzou-quark-mapdl` 会在下载弹窗中提供蓝奏云和夸克网盘选项；同时提供 `lazy` 时，懒汉链接会被合并到同一组下载方式里。链接失效后应及时替换，并保留其他仍然有效的渠道。

### 可用字段

```ts
{
  id?: string          // 稳定的方式标识，例如 patch、lazy
  text?: string        // 按钮名称
  subText?: string     // 按钮下方的补充说明
  icon?: string        // 自定义图标路径
  link?: string        // 普通直链或懒汉下载链接
  lanzouLink?: string  // 蓝奏云链接
  quarkLink?: string   // 夸克网盘链接
  lazyLink?: string    // 供其他下载方式使用的懒汉链接
}
```

大多数页面只需要 `id`、`text` 和 `link`；网盘下载再按需要增加 `lanzouLink`、`quarkLink`。下载方式的 `id` 尽量保持稳定，方便通过带 `?q=` 的链接直接跳转到指定方式。

## 正文、提示块和组件

### 标题与段落

页面标题由 Frontmatter 的 `title` 和布局生成，正文从 `##` 开始即可：

```md
## 地图信息

这里写一段简介。

### 安装步骤

1. 第一步。
2. 第二步。
```

每个段落之间留一个空行。链接、列表、代码块和引用都可以使用标准 Markdown。

### 图片

把图片放到 `public/imgs/` 下后，用从 `/imgs/` 开始的路径引用：

```md
![地图大厅截图](/imgs/maps/example-map-lobby.webp)
```

也可以指定显示宽度：

```md
![安装位置示意图 =640x](/imgs/example-install.png)
```

图片外层已经接入统一的加载占位效果，加载期间会显示“图片加载中…”，不需要在正文里额外写占位文字。图片加载完成后占位效果会自动隐藏；如果图片地址错误，编辑者仍应修正地址，不要把占位效果当成正常结果。

编辑图片时请注意：

- `public/` 是文件系统目录，但页面路径不要写成 `/public/imgs/...`。
- 优先使用尺寸适当的 WebP、PNG 或 JPG，避免把原始超大截图直接作为首页封面。
- `icon` 是卡片和页面头部的小封面；`image` 适合需要单独展示的大图。没有专门大图时只填 `icon` 即可。
- `alt` 文本要说明图片内容，不要只写“图片”。
- 外部图片可以使用 HTTPS 地址，但本地图片更容易长期维护，也不受第三方防盗链影响。

### 提示块

网站支持四种提示块：`warning`、`info`、`tip`、`details`。

```md
::: warning 重要提示
这里写必须在下载或安装前阅读的内容。
:::

::: info 补充说明
这里写不会阻止安装、但对理解页面有帮助的信息。
:::

::: tip 小提示
这里写可选的操作建议。
:::

::: details 查看完整变更记录
这里的内容默认折叠，适合放较长的版本记录。
:::
```

提示块必须成对关闭，开头和结尾的类型要对应。不要使用代码中没有配置的其他类型。

### `<DocSupport />`

`<DocSupport />` 会显示“支持我们”和“加入社区”相关内容，并根据当前语言选择对应链接。通常把它放在资源正文末尾：

```md
<DocSupport />
```

它不需要传参数，也不需要在每个资源页重复写一套社区文案。

## 语言与名称

- 资源页面的中文标题、简介和正文只维护一份简体中文版本。
- 切换到繁体中文时，网站会自动转换页面正文和图片加载提示；不要手动复制一份繁体页面。
- 英文界面会优先使用 `originalName` 作为资源名称，因此原名、大小写和版本后缀要准确。
- 资源正文中的专有名词、模组名、链接和代码标识应保持官方写法；不要为了翻译而修改 URL、文件名或命令。
- 站点导航、按钮和通用提示的翻译在 `src/locales/` 中维护。内容编辑者新增资源时通常不需要修改这些语言文件；如果发现通用界面缺少翻译，应单独提出代码变更。

## 修改已有页面

打开对应的 Markdown 文件后，优先只改需要更新的部分：

- 汉化补丁有新版本时，更新 `updateDate`、`compatibility.pack` 和 `<DownloadLinks>`。
- Minecraft 或加载器发生变化时，同时检查 `compatibility.minecraft`、`compatibility.loader` 以及正文安装说明。
- 下载地址变化时，更新所有仍会展示给用户的渠道，并实际打开链接确认可用。
- 项目暂时不再主动跟进时，将 `status.type` 改为 `stopped`，并在正文说明最后适用的版本；不要删除已有介绍或下载信息。
- 封面替换时，先把新图片放进 `public/imgs/`，确认路径正确，再修改 `icon` 或 `image`。
- 只修正文错别字时，不必为了形式更新版本号；如果内容或下载方式有变化，再更新日期。

不要随意改文件名。改名会改变 URL，也可能影响外部分享、搜索索引和站内链接；确需改名时，要同时搜索旧路径并检查所有引用。

## 本地预览与检查

### 启动开发服务器

在仓库根目录执行：

```powershell
pnpm install
pnpm run dev
```

浏览器打开终端显示的本地地址，通常是 `http://localhost:5173/`。修改 `src/pages` 下的 Markdown 后，开发服务器会自动刷新页面。

如果 VS Code 提示找不到 `pnpm`，先在同一个终端确认：

```powershell
node --version
pnpm --version
```

安装或启用 Node.js、pnpm 后需要重新打开 VS Code 终端，让新的 PATH 生效。使用 Corepack 的环境可以执行 `corepack enable`；如果团队已有固定的 Node.js 管理方式，应沿用团队配置，不要在项目中提交个人机器的路径设置。

### 建议检查的页面

至少打开以下地址：

```text
/                       首页资源卡片
/modpacks/<slug>        整合包详情页
/map/<slug>             地图详情页
```

逐项确认：

- 首页卡片名称、封面、简介、状态和更新日期正确。
- 详情页顶部标题、作者、状态、右上角按钮和版本侧栏正确。
- 点击顶部下载按钮后能直接打开链接或打开下载选择框。
- 下载方式选择、相关链接和外部链接没有混淆。
- 图片会显示加载提示，并在加载完成后正常显示。
- 切换简体中文、繁体中文和英文时，原名、按钮、提示块和链接文字没有错位。
- 移动端窄屏下没有横向溢出，长 URL 不会把页面撑开。

### 格式与构建

编辑单页后可以运行：

```powershell
pnpm exec prettier --check src/pages/modpacks/my-new-pack.md
pnpm exec prettier --check CONTENT_EDITOR_GUIDE.md
git diff --check
pnpm run build
```

`pnpm run build` 会重新生成站点和预渲染页面。构建成功后，可以再打开 `dist/` 中的结果做抽查，但不要把构建产物当作内容源文件编辑。

## 常见问题

### 页面没有出现在首页资源列表

检查文件是否位于 `src/pages/modpacks/` 或 `src/pages/map/` 的直接资源目录中，文件名是否为 `.md`，以及是否误用了 `example.md`、`secret.md` 或 `fc5-wiki` 子目录。页面仍可能有路由，但不会进入首页资源列表。

### 首页显示“未命名整合包”或卡片信息不完整

检查 Frontmatter 是否从第一行开始、两侧 `---` 是否闭合、字段缩进是否正确。`title`、`description`、`icon`、`authors` 等字段拼写必须准确，不能写成自定义别名。

### 更新日期排序异常

使用 `YYYY-M-D` 或 `YYYY年M月D日` 的真实日期。`待定`、`最新` 等文字无法参与日期排序，可能会被排到很前或很后。

### 右上角下载按钮没有反应

确认 `<DownloadLinks>` 在 `<DownloadLayout>` 内部，并且每个下载方式至少有 `link`，或有可识别的 `lanzouLink` / `quarkLink`。只写 Frontmatter 的 `links` 不会注册下载方式。

### 相关链接显示为空

确认每项都有可解析的 `link`，或者使用带内置链接的共享 `id`。自定义 `id` 时同时填写 `text` 和 `link`。

### 图片一直显示“图片加载中…”

先在浏览器中直接打开图片 URL。站内图片应以 `/imgs/` 开头，并且文件确实位于 `public/imgs/`；远程图片要确认 HTTPS 地址没有失效或防盗链。文件名大小写也要与实际文件一致。

### Frontmatter 解析失败

检查 YAML 缩进、引号和冒号。包含冒号、井号或复杂括号的值用单引号或双引号包起来；多行简介使用 `description: |`，不要把正文内容放进 Frontmatter 的缩进块里。

## 提交前清单

- [ ] 文件在正确目录，slug 小写且稳定。
- [ ] Frontmatter 从第一行开始，两个 `---` 已闭合。
- [ ] `title`、`originalName`、`icon`、`description`、`updateDate` 已核对。
- [ ] `status`、Minecraft 版本、加载器和整合包/地图版本与正文一致。
- [ ] 作者和翻译者写在 `authors` 列表中，并标明角色。
- [ ] 原帖、视频、仓库放在 `links`；地图或汉化补丁下载放在 `<DownloadLinks>`。
- [ ] 每个下载地址都能打开，多个渠道的名称和用途清楚。
- [ ] 图片已放入 `public/imgs/`，路径以 `/imgs/` 开头，且有合适的替代文本。
- [ ] 简体中文、繁体中文和英文界面都已快速检查。
- [ ] `pnpm exec prettier --check`、`git diff --check` 和 `pnpm run build` 均通过。
- [ ] `git diff` 中只有本次内容编辑相关的改动，没有误改 `dist/` 或其他人的文件。

如果页面规则与本文档不一致，以当前代码和现有可正常访问的资源页为准，并在下次维护时同步更新本指南。
