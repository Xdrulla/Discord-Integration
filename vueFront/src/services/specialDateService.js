import api from './api'

// Rotas reais do backend (sem prefixo /api):
// GET    /datas-especiais
// POST   /datas-especiais   body: { data, nome, usuarios[] }
// DELETE /datas-especiais/:data

export async function fetchSpecialDates() {
  const { data } = await api.get('/datas-especiais')
  return data
}

export async function addSpecialDate({ data: dataParam, descricao, nome, tipo, usuarios = [] }) {
  const { data } = await api.post('/datas-especiais', {
    data: dataParam,
    nome: nome ?? descricao,
    usuarios,
  })
  return data
}

export async function deleteSpecialDate(dataParam) {
  // O backend usa DELETE /datas-especiais/:data
  const { data } = await api.delete(`/datas-especiais/${dataParam}`)
  return data
}
