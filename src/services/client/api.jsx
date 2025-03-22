const API_BASE_URL = "http://localhost:8000";

// Fetch users
export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

// Fetch roles
export const fetchRoles = async () => {
  const response = await fetch(`${API_BASE_URL}/roles`);
  if (!response.ok) throw new Error("Failed to fetch roles");
  return response.json();
};

// Save or update user
export const saveUser = async (user, isEditing, editingUserId, token) => {
  const url = isEditing ? `${API_BASE_URL}/users/${editingUserId}` : `${API_BASE_URL}/users`;
  const method = isEditing ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) throw new Error("Failed to save user");
  return response.json();
};

// Delete user
export const deleteUser = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
};

// Send invitation
export const sendInvitation = async (email, token) => {
  const response = await fetch(`${API_BASE_URL}/send-invitation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Failed to send invitation");
  return response.json();
};

// Update user status
export const updateUserStatus = async (userId, updatedUser, token) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedUser),
  });

  if (!response.ok) throw new Error("Failed to update user status");
  return response.json();
};