import { auth } from "../firebaseConfig";

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
