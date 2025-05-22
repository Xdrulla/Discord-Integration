import { auth } from "../config/firebaseConfig";
import axios from "axios";

export async function upsertJustificativa(justificativaData) {
  const token = await auth.currentUser.getIdToken();

  const response = await fetch(`${import.meta.env.VITE_API_URL}/justificativa`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(justificativaData),
  });
  return await response.json();
}

export async function deleteJustificativa({ usuario, data }) {
  const token = await auth.currentUser.getIdToken()

  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/justificativa`, {
    data: { usuario, data },
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function uploadJustificativaFile(file) {
  const token = await auth.currentUser.getIdToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${import.meta.env.VITE_API_URL}/upload-justificativa`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Falha no upload do arquivo");
  }

  return await response.json();
}

