// After successful login
const login = async (credentials) => {
  const response = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("jwtToken", data.token); // Store the JWT
  }
};