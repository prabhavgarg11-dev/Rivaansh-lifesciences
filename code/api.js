const BASE_URL = (() => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;

  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  return `${protocol}//${host}`;
})();

async function api(endpoint) {
  try {
    const res = await fetch(BASE_URL + endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    return [];
  }
}