import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableComponent from "../components/layout/TableComponent";
import { useAuth } from "../context/AuthContext";
import { X, Plus, Trash2, ChevronDown, Check, AlertCircle, Mail, RefreshCw } from "lucide-react";

const VerifierRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fixed: Destructure logout from useAuth
  const { isAuthenticated, logout } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      role: "",
    },
  });

  const base_api_url = import.meta.env.VITE_API_BASE_URL;

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const handleUnauthorized = () => {
    toast.error("Unauthorized");
    logout(); // Now this will work properly
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-role?pageSize=300`, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles: ${errorText}`);
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data) && result.data.length > 1) {
        const roles = result.data[1];
        setRoles(roles);
      } else {
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoles();
    }
  }, [isAuthenticated]);

  const openModal = (role = null) => {
    if (role) {
      reset({
        role: role.role,
      });
      setIsEditing(true);
      setEditingRoleId(role.id);
    } else {
      reset({
        role: "",
      });
      setIsEditing(false);
      setEditingRoleId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset({
      role: "",
    });
    setIsEditing(false);
    setEditingRoleId(null);
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    if (!data.role) {
      playSound("/sounds/failure.mp3");
      toast.error("Role name is required!");
      return;
    }

    const url = isEditing
      ? `${base_api_url}/mobile-verifier/v1/verifier-role/${editingRoleId}`
      : `${base_api_url}/mobile-verifier/v1/verifier-role/verifier-roles`;
    const method = isEditing ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${isEditing ? "update" : "add"} role: ${errorText}`);
      }

      const result = await response.json();

      if (isEditing) {
        setRoles(roles.map(role => role.id === editingRoleId ? result.data : role));
        playSound("/sounds/success.mp3");
        toast.success("Role updated successfully!");
      } else {
        setRoles([...roles, result.data]);
        playSound("/sounds/success.mp3");
        toast.success("Role added successfully!");
      }
      closeModal();
      fetchRoles();
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    }
  };

  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRole = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-role/${roleToDelete.id}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete role: ${errorText}`);
      }

      setRoles(roles.filter(role => role.id !== roleToDelete.id));
      playSound("/sounds/success.mp3");
      toast.success("Role deleted successfully!");
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const columns = [
    {
      header: "Role ID",
      accessorKey: "id",
    },
    {
      header: "Role Name",
      accessorKey: "role",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex justify-start gap-4 px-1">
          <button
            className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            onClick={() => openModal(row.original)}
          >
            <RefreshCw size={16} className="mr-1" />
            Edit
          </button>
          {/*<button
            className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
            onClick={() => openDeleteModal(row.original)}
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </button>*/}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Roles</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search roles..."
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium h-[42px]"
          onClick={() => openModal()}
        >
          <Plus size={16} className="mr-1" />
          Add New Role
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center pt-4 text-gray-500">Loading Roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No Roles found</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent
            columns={columns}
            data={roles}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-600 px-6 py-3 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isEditing ? "Edit Role" : "Add New Role"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              <form onSubmit={handleSubmit(onSubmit)} id="role-form">
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role Name *
                  </label>
                  <input
                    id="role"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                      errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    placeholder="Enter role name"
                    {...register("role", { required: "Role name is required" })}
                  />
                  {errors.role && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.role.message}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                * Required fields
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="role-form"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                >
                  {isEditing ? "Update Role" : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-red-100 px-6 py-3 text-red-800 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-1 hover:bg-red-200/50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-medium">{roleToDelete?.role}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                {/*<button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  onClick={handleDeleteRole}
                >
                  Delete
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierRole;