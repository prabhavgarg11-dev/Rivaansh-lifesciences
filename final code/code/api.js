const BASE_URL = "https://rivaansh-lifesciences.onrender.com";

async function api(endpoint) {
  try {
    const res = await fetch(BASE_URL + endpoint);

    if (!res.ok) {
      throw new Error("Failed to fetch");
    }

    const data = await res.json();
    return data;

  } catch (err) {
    console.error("API ERROR:", err);
    return [];
  }
}

export default api;