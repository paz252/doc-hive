import apiClient from "./axiosClient";

const DOCUMENTS_URL = "/api/v1/documents";

export async function getDocuments() {
  const response = await apiClient.get(DOCUMENTS_URL);
  return response.data;
}

export async function getDocument(id) {
  const response = await apiClient.get(`${DOCUMENTS_URL}/${id}`);
  return response.data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    `${DOCUMENTS_URL}/upload`,
    formData
  );

  return response.data;
}

export async function deleteDocument(id) {
  await apiClient.delete(`${DOCUMENTS_URL}/${id}`);
}