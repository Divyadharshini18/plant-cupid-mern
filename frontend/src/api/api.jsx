const API_URL = "http://localhost:5000/api";

export const apiRequest = async (url, method = "GET", body) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
};
