export interface AnnouncementMessage {
  action: string
  body: string
  label: string
}

export const announcementConfig = {
  enabled: true,
  link: '/modpacks/fractured-opolis',
  messages: {
    // 修改简体中文公告时，请务必同步更新同一文件下方的英文公告，避免两个语言版本内容不同步。
    'zh-CN': {
      label: '站点公告',
      body: '8月最新成果！破碎城汉化现已发布！',
      action: '查看',
    },
    'en-US': {
      label: 'Site announcement',
      body: 'Latest August release: Fractured Opolis localization is now available!',
      action: 'View',
    },
  },
} satisfies {
  enabled: boolean
  link: string
  messages: Record<'zh-CN' | 'en-US', AnnouncementMessage>
}
