import api from './api'

// O ID do registro no Firestore é "{usuario}_{YYYY-MM-DD}".
// A data tem sempre 10 chars (YYYY-MM-DD), então extraímos de trás para frente.
function parseRegistroId(registroId) {
  const data = registroId.slice(-10)        // últimos 10 chars = data
  const usuario = registroId.slice(0, -11)  // tudo antes de "_YYYY-MM-DD"
  return { usuario, data }
}

// Rotas reais do backend (sem prefixo /api):
// PUT  /justificativa
// DELETE /justificativa
// POST /upload-justificativa

export async function upsertJustificativa({ registroId, texto, fileUrl, status, observacaoAdmin }) {
  const { usuario, data } = parseRegistroId(registroId)
  const payload = {
    usuario,
    data,
    text: texto,
  }
  if (fileUrl !== undefined) payload.file = fileUrl
  if (status !== undefined) payload.status = status
  if (observacaoAdmin !== undefined) payload.observacaoAdmin = observacaoAdmin

  const { data: res } = await api.put('/justificativa', payload)
  return res
}

export async function deleteJustificativa({ registroId }) {
  const { usuario, data } = parseRegistroId(registroId)
  const { data: res } = await api.delete('/justificativa', { data: { usuario, data } })
  return res
}

export async function uploadJustificativaFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/upload-justificativa', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
