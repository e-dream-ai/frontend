import axios from "axios";
import { URL } from "@/constants/api.constants";

export const axiosClient = axios.create({
  baseURL: URL,
  withCredentials: true,
});
