import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.67.199.233:3000",
});
