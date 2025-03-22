import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableComponent from "../components/TableComponent";
import SearchInput from "../components/SearchInput";

const VerifierRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Function to play sound
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  // Fetch roles from the server with JWT token
  const fetchRoles = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch("http://127.0.0.1:8000/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle form submission for adding or updating a role
  const onSubmit = async (data) => {
    const token = localStorage.getItem("jwtToken");
    const url = editingRole
      ? `http://127.0.0.1:8000/roles/${editingRole.id}`
      : "http://127.0.0.1:8000/roles";
    const method = editingRole ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to ${editingRole ? "update" : "add"} role`);
      const result = await response.json();
      if (editingRole) {
        setRoles((prevRoles) =>
          prevRoles.map((role) => (role.id === editingRole.id ? result : role))
        );
        playSound("/sounds/success.mp3");
        toast.success("Role updated successfully");
      } else {
        setRoles((prevRoles) => [...prevRoles, result]);
        playSound("/sounds/success.mp3");
        toast.success("Role added successfully");
      }
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error(`Error ${editingRole ? "updating" : "adding"} role:`, error);
      playSound("/sounds/failure.mp3");
      toast.error(`Failed to ${editingRole ? "update" : "add"} role`);
    }
  };

  // Open delete confirmation modal
  const handleDeleteRole = (roleId) => {
    const role = roles.find((role) => role.id === roleId);
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(`http://127.0.0.1:8000/roles/${roleToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete role");
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleToDelete.id));
      playSound("/sounds/success.mp3");
      toast.success("Role deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting role:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to delete role");
    }
  };

  // Open modal for editing a role
  const handleEditRole = (role) => {
    setEditingRole(role);
    setValue("name", role.name);
    setIsModalOpen(true);
  };

  // Columns for the table
  const columns = [
    { accessorKey: "id", header: "Role ID", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "name", header: "Role Name", cell: (info) => info.getValue(), enableSorting: true },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const role = info.row.original;
        return (
          <div className="flex justify-end gap-2">
            <button
              className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-green-50 transition-colors"
              onClick={() => handleEditRole(role)}
            >
              Edit
            </button>
            <button
              className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-red-50 transition-colors"
              onClick={() => handleDeleteRole(role.id)}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Search Field & Add Role Button */}
      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search roles..."
        />
        <button
          className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          onClick={() => {
            setIsModalOpen(true);
            setEditingRole(null);
            reset();
          }}
        >
          Add New Role
        </button>
      </div>

      {/* Table Component */}
      {loading ? (
        <p className="text-center text-gray-500">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-center text-red-400">No roles added</p>
      ) : (
        <TableComponent
          columns={columns}
          data={roles}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}

      {/* Modal for Adding/Editing Role */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              {editingRole ? "Edit Role" : "Add New Role"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-600 transition duration-200"
                  {...register("name", { required: "Role name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  {editingRole ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-center">Confirm Deletion</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete the role{" "}
              <strong className="text-red-500">{roleToDelete?.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierRole;