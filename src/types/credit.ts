export interface CreditPerson {
  name: string
  title?: string
  uid?: number | string
}

export interface CreditCategory {
  description: string
  id: string
  label: string
  people: CreditPerson[]
}

export interface DisplayCreditPerson extends CreditPerson {
  displayName: string
  initial: string
  nickname: string
  spaceUrl: string
  uidText: string
}
