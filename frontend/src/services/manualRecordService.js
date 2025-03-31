import { auth } from "../firebaseConfig";
import axios from "axios"

export const addManualRecord = async (payload) => {
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/registro/manual`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error("Erro ao adicionar registro manual:", error)
    return {
      success: false,
      error: error.response?.data?.error || "Erro na requisição.",
    }
  }
}
