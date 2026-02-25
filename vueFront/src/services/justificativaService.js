import api from './api'

// Rotas reais do backend (sem prefixo /api):
// PUT  /justificativa
// DELETE /justificativa
// POST /upload-justificativa

export async function upsertJustificativa(payload) {
  const { data } = await api.put('/justificativa', payload)
  return data
}

export async function deleteJustificativa({ usuario, data: dataParam }) {
  const { data } = await api.delete('/justificativa', { data: { usuario, data: dataParam } })
  return data
}

export async function uploadJustificativaFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/upload-justificativa', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
