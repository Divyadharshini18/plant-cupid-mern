import api from "../api/api";
import { cacheKeys, readCache, writeCache, clearPlantCaches } from "./cache";

const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getAvailablePlants = async ({ force = false } = {}) => {
  if (!force) {
    const cached = readCache(cacheKeys.availablePlants, null);
    if (cached) return cached;
  }

  const res = await api.get("/plants");
  const plants = Array.isArray(res.data) ? res.data : [];
  writeCache(cacheKeys.availablePlants, plants);
  return plants;
};

export const getUserPlants = async (token, { force = false } = {}) => {
  if (!force) {
    const cached = readCache(cacheKeys.userPlants, null);
    if (cached) return cached;
  }

  const res = await api.get("/user-plants", getAuthHeaders(token));
  const plants = Array.isArray(res.data) ? res.data : [];
  writeCache(cacheKeys.userPlants, plants);
  return plants;
};

export const addUserPlant = async (token, payload) => {
  const res = await api.post("/user-plants", payload, getAuthHeaders(token));
  clearPlantCaches();
  return res.data;
};

export const updateUserPlantNickname = async (token, id, nickname) => {
  const res = await api.patch(
    `/user-plants/${id}`,
    { nickname },
    getAuthHeaders(token)
  );
  clearPlantCaches();
  return res.data;
};

export const deleteUserPlant = async (token, id) => {
  const res = await api.delete(`/user-plants/${id}`, getAuthHeaders(token));
  clearPlantCaches();
  return res.data;
};

export const waterUserPlant = async (token, id) => {
  const res = await api.post(`/user-plants/${id}/water`, {}, getAuthHeaders(token));
  clearPlantCaches();
  return res.data;
};

export const getPlantImage = async (plantName) => {
  const imageCache = readCache(cacheKeys.plantImages, {});
  const imageKey = plantName?.toLowerCase();

  if (!imageKey) return "";

  if (imageCache[imageKey]) return imageCache[imageKey];

  const res = await api.get(`/images?query=${encodeURIComponent(plantName)}`);
  const imageUrl = res.data.imageUrl || "";

  const updated = { ...imageCache, [imageKey]: imageUrl };
  writeCache(cacheKeys.plantImages, updated);

  return imageUrl;
};