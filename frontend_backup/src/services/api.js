const API_BASE = "http://127.0.0.1:8000/api";

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error("Backend unavailable");
  return response.json();
}

export async function sendCommand(text) {
  const response = await fetch(`${API_BASE}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error("Command request failed");
  }

  return response.json();
}
