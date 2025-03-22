import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, Controller } from "react-hook-form";
import TableComponent from "../components/TableComponent";
import SearchInput from "../components/SearchInput";

const VerifierUser = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [confirmSendInvitation, setConfirmSendInvitation] = useState({ open: false, user: null });
  const [globalFilter, setGlobalFilter] = useState("");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "",
      status: "Active",
    },
  });

  // Function to play sound
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  // Fetch users on component mount
  useEffect(() => {
    fetch("http://localhost:8000/users")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
      })
      .then((data) => {
        setUsers(data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        playSound("/sounds/failure.mp3");
        toast.error("Failed to fetch users", { position: "top-right", autoClose: 3000 });
      });
  }, []);

  // Fetch roles when modal is opened
  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:8000/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setErrorRoles(error.message);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch roles", { position: "top-right", autoClose: 3000 });
    } finally {
      setLoadingRoles(false);
    }
  };

  // Open modal for adding/editing user
  const openModal = (user = null) => {
    if (user) {
      const [first_name, last_name] = user.user_name.split(" ");
      reset({ ...user, first_name, last_name });
      setIsEditing(true);
      setEditingUserId(user.id);
    } else {
      reset({ first_name: "", last_name: "", email: "", role: "", status: "Active" });
      setIsEditing(false);
      setEditingUserId(null);
    }
    setIsModalOpen(true);
    setErrorRoles(null);
    fetchRoles();
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    reset({ first_name: "", last_name: "", email: "", role: "", status: "Active" });
    setIsEditing(false);
    setEditingUserId(null);
  };

  // Save or update user
  const onSubmit = async (data) => {
    const user_name = `${data.first_name} ${data.last_name}`.trim();

    if (!user_name || !data.email || !data.role) {
      playSound("/sounds/failure.mp3");
      toast.error("All fields are required!", { position: "top-right", autoClose: 3000 });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      playSound("/sounds/failure.mp3");
      toast.error("Invalid email format!", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/users/${editingUserId}`
        : "http://localhost:8000/users";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, user_name }),
      });

      if (!response.ok) throw new Error("Failed to save user");

      const result = await response.json();

      if (isEditing) {
        setUsers(users.map((user) => (user.id === editingUserId ? result : user)));
        playSound("/sounds/success.mp3");
        toast.success("User updated successfully!", { position: "top-right", autoClose: 3000 });
      } else {
        setUsers([...users, result]);
        playSound("/sounds/success.mp3");
        toast.success("User added successfully!", { position: "top-right", autoClose: 3000 });
      }
      closeModal();
    } catch (error) {
      console.error("Error saving user:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to save user", { position: "top-right", autoClose: 3000 });
    }
  };

  // Open confirmation modal for sending invitation
  const openConfirmationModal = (user) => {
    setConfirmSendInvitation({ open: true, user });
  };

  // Handle sending invitation
  const handleSendInvitation = async () => {
    const user = confirmSendInvitation.user;
    try {
      const invitationResponse = await fetch("http://localhost:8000/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (!invitationResponse.ok) throw new Error("Failed to send invitation");

      const updatedUser = { ...user, status: "Invited" };
      const updateResponse = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!updateResponse.ok) throw new Error("Failed to update user status");

      setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
      playSound("/sounds/success.mp3");
      toast.success("Invitation sent successfully!", { position: "top-right", autoClose: 3000 });
    } catch (error) {
      console.error("Error sending invitation:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to send invitation", { position: "top-right", autoClose: 3000 });
    } finally {
      setConfirmSendInvitation({ open: false, user: null });
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Handle deleting a user
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user.id !== userToDelete.id));
      playSound("/sounds/success.mp3");
      toast.success("User deleted successfully!", { position: "top-right", autoClose: 3000 });
    } catch (error) {
      console.error("Error deleting user:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to delete user", { position: "top-right", autoClose: 3000 });
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Define columns for the table
  const columns = [
    {
      header: "User Name",
      accessorKey: "user_name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Invitation",
      accessorKey: "id",
      cell: ({ row }) => (
        <>
          {row.original.status !== "Invited" && (
            <button
              className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-emerald-50 transition-colors"
              onClick={() => openConfirmationModal(row.original)}
            >
              Send Invitation
            </button>
          )}
          {row.original.status === "Invited" && (
            <span className="text-blue-500">Invitation Sent</span>
          )}
        </>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-emerald-50 transition-colors"
            onClick={() => openModal(row.original)}
          >
            Edit
          </button>
          <button
            className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-red-50 transition-colors"
            onClick={() => openDeleteModal(row.original)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer /> {/* Toast container for displaying messages */}
      {/* Search Field & Add New User Button */}
      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search users..."
        />
        <button
          className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          onClick={() => openModal()}
        >
          Add New User
        </button>
      </div>

      {/* Table Component */}
      {users ? (
        <TableComponent
          columns={columns}
          data={users}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      ) : (
        <h1>No User</h1>
      )}

      {/* Modal for adding/editing user */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? "Edit User" : "Add New User"}</h3>
            {errorRoles && (
              <div className="text-red-500 text-sm mb-4">Error loading roles: {errorRoles}</div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* First Name and Last Name in the same row */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
                    {...register("first_name", { required: "First Name is required" })}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
                    {...register("last_name", { required: "Last Name is required" })}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              {/* Role Field */}
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <select
                      id="role"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
                      {...field}
                      disabled={loadingRoles}
                    >
                      <option value="">Select Role</option>
                      {loadingRoles ? (
                        <option value="" disabled>Loading roles...</option>
                      ) : (
                        roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                />
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  disabled={loadingRoles || errorRoles}
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-sm mb-4">Are you sure you want to delete {userToDelete?.user_name}?</p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                onClick={handleDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for sending invitation */}
      {confirmSendInvitation.open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Invitation</h3>
            <p className="text-sm mb-4">
              Are you sure you want to send an invitation to {confirmSendInvitation.user.user_name}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                onClick={() => setConfirmSendInvitation({ open: false, user: null })}
              >
                Cancel
              </button>
              <button
                className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                onClick={handleSendInvitation}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierUser;