import { auth } from "../firebaseConfig";
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

  const response = await axios.delete("http://localhost:5000/justificativa", {
    data: { usuario, data },
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.data;
}
