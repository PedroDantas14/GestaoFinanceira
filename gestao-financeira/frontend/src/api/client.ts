import axios from 'axios'

const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // 401 = não autenticado; 403 em /api = token inválido/expirado (backend pode retornar 403 em alguns casos)
    const status = err.response?.status
    const isApi = err.config?.url?.includes?.('/api/')
    if (status === 401 || (status === 403 && isApi)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<import('@/types/api').LoginResponse>(`${API_PREFIX}/auth/login`, { email, senha }),
  registrar: (nome: string, email: string, senha: string) =>
    api.post<import('@/types/api').LoginResponse>(`${API_PREFIX}/auth/registrar`, { nome, email, senha }),
}

export const categoriasApi = {
  listar: () => api.get<import('@/types/api').CategoriaResponse[]>(`${API_PREFIX}/categorias`),
  criar: (data: import('@/types/api').CategoriaRequest) =>
    api.post<import('@/types/api').CategoriaResponse>(`${API_PREFIX}/categorias`, data),
  atualizar: (id: number, data: import('@/types/api').CategoriaRequest) =>
    api.put<import('@/types/api').CategoriaResponse>(`${API_PREFIX}/categorias/${id}`, data),
  excluir: (id: number) => api.delete(`${API_PREFIX}/categorias/${id}`),
}

export const transacoesApi = {
  listar: () => api.get<import('@/types/api').TransacaoResponse[]>(`${API_PREFIX}/transacoes`),
  criar: (data: import('@/types/api').TransacaoRequest) =>
    api.post<import('@/types/api').TransacaoResponse>(`${API_PREFIX}/transacoes`, data),
  atualizar: (id: number, data: import('@/types/api').TransacaoRequest) =>
    api.put<import('@/types/api').TransacaoResponse>(`${API_PREFIX}/transacoes/${id}`, data),
  excluir: (id: number) => api.delete(`${API_PREFIX}/transacoes/${id}`),
}

export const relatoriosApi = {
  mensal: (ano: number, mes: number) =>
    api.get<import('@/types/api').RelatorioMensalResponse>(`${API_PREFIX}/relatorios/mensal`, { params: { ano, mes } }),
  exportPdf: (ano: number, mes: number) =>
    api.get<Blob>(`${API_PREFIX}/relatorios/mensal/export/pdf`, { params: { ano, mes }, responseType: 'blob' }),
  exportExcel: (ano: number, mes: number) =>
    api.get<Blob>(`${API_PREFIX}/relatorios/mensal/export/excel`, { params: { ano, mes }, responseType: 'blob' }),
}
