import api from './api'

// Rota real do backend: POST /registro/manual

export async function addManualRecord(payload) {
  const { data } = await api.post('/registro/manual', payload)
  return data
}
