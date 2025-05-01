import { auth } from "../config/firebaseConfig";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchSpecialDates() {
  const token = await auth.currentUser.getIdToken();

  const response = await axios.get(`${BASE_URL}/datas-especiais`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function addSpecialDate({ data, nome, usuarios = [] }) {
  const token = await auth.currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/datas-especiais`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data, nome, usuarios }),
  });

  return await response.json();
}

export async function deleteSpecialDate(data) {
  const token = await auth.currentUser.getIdToken();

  const response = await axios.delete(`${BASE_URL}/datas-especiais/${data}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
