import api from "../api/api";
import { cacheKeys, readCache, writeCache, clearProfileCache } from "./cache";

const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getProfile = async (token, { force = false } = {}) => {
  if (!force) {
    const cached = readCache(cacheKeys.profile, null);
    if (cached) return cached;
  }

  const res = await api.get("/users/profile", getAuthHeaders(token));
  writeCache(cacheKeys.profile, res.data);
  return res.data;
};

export const refreshProfile = async (token) => {
  clearProfileCache();
  return getProfile(token, { force: true });
};

export const deleteAccount = async (token) => {
  const res = await api.delete("/users/profile", getAuthHeaders(token));

  // clear cache after deletion
  clearProfileCache();

  return res.data;
};