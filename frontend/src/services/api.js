import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_URL });

export async function uploadPDF(file, onProgress) {
  const formData = new FormData();
  formData.append("pdf", file);

  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return data;
}

export async function sendChatMessage(question, docId, history = []) {
  const { data } = await api.post("/chat", { question, docId, history });
  return data;
}

export async function getDocuments() {
  const { data } = await api.get("/documents");
  return data;
}

export async function deleteDocument(docId) {
  const { data } = await api.delete(`/documents/${docId}`);
  return data;
}

export default api;
