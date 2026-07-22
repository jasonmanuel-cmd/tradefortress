export type TradeKind = 'customer' | 'job' | 'permit' | 'document' | 'proposal' | 'material'

export type TradeRecord = {
  id: string
  kind: TradeKind
  title: string
  status: string
  customer_id: string | null
  job_id: string | null
  customer_name: string | null
  job_name: string | null
  phone: string | null
  due_date: string | null
  amount: number | null
  quantity: number | null
  unit: string | null
  notes: string | null
}

export type TradeRecordsResponse = { records: TradeRecord[] }
