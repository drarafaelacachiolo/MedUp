export type TipoAtendimento = 'Plantão' | 'Consulta'
export type StatusAtendimento = 'Pendente' | 'Recebido'

/** Linha da tabela `atendimentos` (sem status) */
export interface Atendimento {
  id: string
  created_at: string
  data_atendimento: string        // "YYYY-MM-DD"
  tipo: TipoAtendimento
  tempo: string
  local: string
  paciente: string | null
  observacoes: string | null
  valor_a_receber: number
  data_prevista_pagamento: string // "YYYY-MM-DD"
  data_recebimento: string | null // "YYYY-MM-DD"
  valor_recebido: number | null
  banco: string | null
}

/** Linha da view `atendimentos_view` (com status computado) */
export interface AtendimentoWithStatus extends Atendimento {
  status: StatusAtendimento
}

/** Dados do formulário de novo lançamento */
export interface NovoAtendimentoInput {
  data_atendimento: string
  tipo: TipoAtendimento
  tempo: string
  local: string
  paciente?: string | null
  observacoes?: string | null
  valor_a_receber: number
  data_prevista_pagamento: string
  data_recebimento?: string | null
  valor_recebido?: number | null
  banco?: string | null
}

/** Dados do formulário de edição de um atendimento */
export interface EditAtendimentoInput {
  data_atendimento: string
  tipo: TipoAtendimento
  tempo: string
  local: string
  paciente: string | null
  observacoes: string | null
  valor_a_receber: number
  data_prevista_pagamento: string
  data_recebimento: string | null
  valor_recebido: number | null
  banco: string | null
}

/** Categoria de atendimento (ex: "Plantão 12h") */
export interface Categoria {
  id: string
  nome: string
  tipo: TipoAtendimento
  tempo: string
  ordem: number
}

/** Dados do modal de confirmação de recebimento */
export interface ConfirmReceiptInput {
  id: string
  data_recebimento: string
  valor_recebido: number
  banco: string
}
