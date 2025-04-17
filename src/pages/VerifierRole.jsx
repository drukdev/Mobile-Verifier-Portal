import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import TableComponent from "../components/layout/TableComponent";
import { useAuth } from "../context/AuthContext";

const VerifierRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const base_api_url = import.meta.env.VITE_API_BASE_URL;

  const handleUnauthorized = () => {
      toast.error("Session expired. Please login again.");
      logout();
    };

  // Function to play sound
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  // Fetch roles from the server with JWT token
  const fetchRoles = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const url = `${base_api_url}/mobile-verifier/v1/verifier-role?pageSize=300`;
      //sconst API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


      const response = await fetch(url, {
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
      toast.error(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoles();
    }
  }, [isAuthenticated]);

  // Handle form submission for adding or updating a role
  const onSubmit = async (data) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    const url = editingRole
      ? `${base_api_url}/mobile-verifier/v1/verifier-role/${editingRole.id}`
      : `${base_api_url}/mobile-verifier/v1/verifier-role/verifier-roles`;
    const method = editingRole ? "PATCH" : "POST";
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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${editingRole ? "update" : "add"} role: ${errorText}`);
      }

      const result = await response.json();

      if (editingRole) {
        setRoles((prevRoles) =>
          prevRoles.map((role) => (role.id === editingRole.id ? result.data : role))
        );
        playSound("/sounds/success.mp3");
        toast.success(result.message || "Role updated successfully");
        setIsModalOpen(false);
        reset();
        setTimeout(() => {
          navigate("/dashboard/verifier-role");
        }, 2000);
      } else {
        setRoles((prevRoles) => [...prevRoles, result.data]);
        playSound("/sounds/success.mp3");
        toast.success(result.message || "Role created successfully");
        setIsModalOpen(false);
        reset();
        setTimeout(() => {
          navigate("/dashboard/verifier-role");
        }, 2000);
      }
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`Failed to ${editingRole ? "update" : "add"} role. ${error}`);
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
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/verifier-role/${roleToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete role: ${errorText}`);
      }

      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleToDelete.id));
      playSound("/sounds/success.mp3");
      toast.success("Role deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`Failed to delete role: ${error}`);
    }
  };

  // Open modal for editing a role
  const handleEditRole = (role) => {
    setEditingRole(role);
    setValue("role", role.role);
    setIsModalOpen(true);
  };

  // Columns for the table
  const columns = [
    { accessorKey: "id", header: "Role ID", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "role", header: "Role Name", cell: (info) => info.getValue(), enableSorting: true },
  ];
{/*{
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const role = info.row.original;
        return (
          <div className="flex justify-start gap-4">
            <button
              className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-green-50 transition-colors"
              onClick={() => handleEditRole(role)}
            >
              Update
            </button>
            
          </div>
        );
      },
    }, */}
  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Updated Search and Add Role Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 mb-1">Search Roles</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search roles..."
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
        <div className="flex items-end">
          <button
            className="bg-emerald-400 text-white px-6 py-1 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors h-[42px]"
            onClick={() => {
              setIsModalOpen(true);
              setEditingRole(null);
              reset();
            }}
          >
            Add New Role
          </button>
        </div>
      </div>

      {/* Table Component */}
      {loading ? (
        <p className="text-center pt-8 text-gray-500">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No roles found</p>
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
            <h3 className="text-xl font-semibold mb-4 text-gray-500 text-center">
              {editingRole ? "Edit Role" : "Add New Role"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-500 mb-2">
                  Role Name
                </label>
                <input
                  id="role"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-600 transition duration-200"
                  {...register("role", { required: "Role name is required" })}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
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
                  className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  {editingRole ? "Update" : "Create Role"}
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
              <strong className="text-red-500">{roleToDelete?.role}</strong>?
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