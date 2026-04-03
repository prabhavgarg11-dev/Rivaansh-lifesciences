const BASE_URL = "http://localhost:5000";

async function api(endpoint) {
  try {
    const res = await fetch(BASE_URL + endpoint);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    return [];
  }
}