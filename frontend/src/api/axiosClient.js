import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://dochive-backend.onrender.com",
  headers: {
    Accept: "application/json",
  },
});

export default apiClient;