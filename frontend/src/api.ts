import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:5001/fiets-meetsysteem/us-central1",
  headers: {
    "Content-Type": "application/json",
  },
});