import axios from "axios"; // axios promise-based http client for node.js and the browser also isomorphic

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use( // interceptors are middleware for axios : runs before every request is sent
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}` // ? optional chaining to avoid crash and safer logging
    );
    return config;
  },
  (error) => Promise.reject(error) // if something fails before request is sent, reject promise
);

api.interceptors.response.use( // after response is received
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `API Error Response: ${error.response.status} ${error.config?.url}`,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

export default api;