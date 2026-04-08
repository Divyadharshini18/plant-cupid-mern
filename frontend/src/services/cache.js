const USER_PLANTS_CACHE_KEY = "plant_cupid_user_plants";
const AVAILABLE_PLANTS_CACHE_KEY = "plant_cupid_available_plants";
const PLANT_IMAGES_CACHE_KEY = "plant_cupid_plant_images";
const PROFILE_CACHE_KEY = "plant_cupid_profile";

export const cacheKeys = {
  userPlants: USER_PLANTS_CACHE_KEY,
  availablePlants: AVAILABLE_PLANTS_CACHE_KEY,
  plantImages: PLANT_IMAGES_CACHE_KEY,
  profile: PROFILE_CACHE_KEY,
};

export const readCache = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeCache = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore cache errors
  }
};

export const removeCache = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore cache errors
  }
};

export const clearPlantCaches = () => {
  removeCache(cacheKeys.userPlants);
  removeCache(cacheKeys.availablePlants);
  removeCache(cacheKeys.plantImages);
};

export const clearProfileCache = () => {
  removeCache(cacheKeys.profile);
};

export const clearAllAppCaches = () => {
  Object.values(cacheKeys).forEach(removeCache);
};