
// --- Login with PIN ---
export async function loginWithPin(ip, pin) {
  const response = await fetch(`http://${ip}:8000/api/login/pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ login_pin: pin }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  // Save token & user locally
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

// --- Logout ---
export async function logout() {
  const token = localStorage.getItem("auth_token");

  if (token) {
    try {
      await fetch(`${BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      console.error("Failed to revoke token:", err);
    }
  }

  // Remove local storage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
}