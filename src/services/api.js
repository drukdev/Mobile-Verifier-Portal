const BASE_URL = "http://localhost:8000";

export const fetchUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export const fetchRoles = async () => {
  const response = await fetch(`${BASE_URL}/roles`);
  if (!response.ok) throw new Error("Failed to fetch roles");
  return response.json();
};

export const saveUser = async (user, isEditing, editingUserId) => {
  const url = isEditing ? `${BASE_URL}/users/${editingUserId}` : `${BASE_URL}/users`;
  const method = isEditing ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) throw new Error("Failed to save user");
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
};

export const sendInvitation = async (email) => {
  const response = await fetch(`${BASE_URL}/send-invitation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Failed to send invitation");
  return response.json();
};