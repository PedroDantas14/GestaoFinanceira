export type TipoTransacao = 'ENTRADA' | 'SAIDA'

export interface LoginRequest {
  email: string
  senha: string
}

export interface UsuarioRequest {
  nome: string
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  tipo: string
  usuarioId: number
  email: string
  nome: string
}

export interface CategoriaRequest {
  nome: string
  descricao?: string
}

export interface CategoriaResponse {
  id: number
  nome: string
  descricao: string | null
}

export interface TransacaoRequest {
  data: string
  valor: number
  tipo: TipoTransacao
  descricao?: string
  categoriaId: number
}

export interface TransacaoResponse {
  id: number
  data: string
  valor: number
  tipo: TipoTransacao
  descricao: string | null
  categoriaId: number
  categoriaNome: string
}

export interface ResumoPorCategoria {
  categoriaId: number
  categoriaNome: string
  total: number
  tipo: TipoTransacao
}

export interface RelatorioMensalResponse {
  ano: number
  mes: number
  totalEntradas: number
  totalSaidas: number
  saldo: number
  porCategoria: ResumoPorCategoria[]
  transacoes: TransacaoResponse[]
}
