import communityStaff from '@/components/Credit/staff-community.json'
import vmStaff from '@/components/Credit/staff-vm.json'
import webStaff from '@/components/Credit/staff-web.json'
import type { CreditCategory, CreditPerson } from '@/types/credit'

export const creditCategories: CreditCategory[] = [
  {
    id: 'web',
    label: '网站开发',
    description: '负责官网开发、维护与内容呈现的贡献者。',
    people: webStaff as CreditPerson[],
  },
  {
    id: 'vm',
    label: 'VM汉化组成员',
    description: '持续参与整合包、地图、工具链与审核工作的正式成员。',
    people: vmStaff as CreditPerson[],
  },
  {
    id: 'community',
    label: '外部贡献人员',
    description: '来自社区、协作平台与开源项目的外部贡献者。',
    people: communityStaff as CreditPerson[],
  },
]
