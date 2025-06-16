import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableComponent from "../components/layout/TableComponent";
import { useAuth } from "../context/AuthContext";
import { X, Plus, Trash2, ChevronDown, Check, AlertCircle, Mail, RefreshCw } from "lucide-react";

const VerifierUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const [userIdExists, setUserIdExists] = useState(false);
  const [userIdChecking, setUserIdChecking] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);

  const { isAuthenticated } = useAuth();
  const base_api_url = import.meta.env.VITE_API_BASE_URL;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      user_id: "",
      email: "",
      foundationID: "",
      role: "",
      status: "ACTIVE",
    },
  });

  const watchFirstName = watch("first_name");
  const watchLastName = watch("last_name");

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("authToken");
    toast.error("Session expired. Please log in again.", { autoClose: 5000 });
    setTimeout(() => window.location.reload(), 1000);
  }, []);
  const checkUsernameAvailability = useCallback(async (username) => {
    const base_api_url = import.meta.env.VITE_API_BASE_URL;

    const token = localStorage.getItem("authToken");
    if (!token) return false;
    try {
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user/check-username?username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return false;
        }
        throw new Error(`Failed to check username: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  }, [handleUnauthorized]);

  const generateAndCheckUsername = useCallback(async (firstName, lastName) => {
    setIsGeneratingUsername(true);
    try {
      const base = `${firstName || ''}_${lastName || ''}`
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      if (!base) {
        return "";
      }

      let attempts = 0;
      const maxAttempts = 3;
      let candidate = "";
      let isAvailable = false;

      while (attempts < maxAttempts && !isAvailable) {
        const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
        candidate = `${base}_${uuid}`;
        isAvailable = await checkUsernameAvailability(candidate);
        attempts++;
      }

      return isAvailable ? candidate : "";
    } catch (error) {
      console.error("Error generating username:", error);
      return "";
    } finally {
      setIsGeneratingUsername(false);
    }
  }, [checkUsernameAvailability]);

  useEffect(() => {
    const generateUsername = async () => {
      if (watchFirstName || watchLastName) {
        try {
          const suggestedUsername = await generateAndCheckUsername(
            watchFirstName,
            watchLastName
          );
          if (suggestedUsername) {
            setGeneratedUsername(suggestedUsername);
          } else {
            setGeneratedUsername(`${watchFirstName || ''}_${watchLastName || ''}`.toLowerCase());
          }
        } catch (error) {
          console.error("Error generating username:", error);
          setGeneratedUsername(`${watchFirstName || ''}_${watchLastName || ''}`.toLowerCase());
        }
      } else {
        setGeneratedUsername("");
      }
    };

    const timeoutId = setTimeout(generateUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [watchFirstName, watchLastName, generateAndCheckUsername]);

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const checkUserIdExists = async (userId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      setUserIdChecking(true);
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user/check-userid?userId=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return false;
        }
        throw new Error("Failed to check user ID");
      }

      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error("Error checking user ID:", error);
      return false;
    } finally {
      setUserIdChecking(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user?pageSize=300`, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (response.status === 404) {
          setUsers([]);
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      console.log("Fetched users:", result);
      if (!result.data || !Array.isArray(result.data) || result.data.length < 2) {
        setUsers([]);
        return;
      }

      const users = result.data[1];
      setUsers(users);
    } catch (error) {
      playSound("/sounds/failure.mp3");
      if (error.message === "Failed to fetch") {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error(error.message);
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }
    try {
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-role?pageSize=300`, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
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
      setErrorRoles(error.message);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAuthenticated]);

  const openModal = (user = null) => {
    if (user) {
      const nameParts = user.username.split(" ");
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "";
      const roleValue = user.verifierRole ? `${user.verifierRole.id}:${user.verifierRole.role}` : "";
      const formValues = {
        first_name,
        last_name,
        user_id: user.userId || "",
        email: user.email,
        foundationID: user.foundationID,
        role: roleValue,
        status: user.statusId === 1 ? "CREATED" : user.statusId === 2 ? "INVITED" : user.statusId === 3 ? "ACTIVE" : user.statusId === 4 ? "SUSPENDED" : "REVOKED",
      };
      reset(formValues);
      setIsEditing(true);
      setEditingUserId(user.id);
    } else {
      reset({
        first_name: "",
        last_name: "",
        user_id: "",
        email: "",
        foundationID: "",
        role: "",
        status: "ACTIVE",
      });
      setIsEditing(false);
      setEditingUserId(null);
      setGeneratedUsername("");
    }
    setIsModalOpen(true);
    setErrorRoles(null);
    setUserIdExists(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset({
      first_name: "",
      last_name: "",
      user_id: "",
      email: "",
      foundationID: "",
      role: "",
      status: "ACTIVE",
    });
    setIsEditing(false);
    setEditingUserId(null);
    setUserIdExists(false);
    setGeneratedUsername("");
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    const username = data.user_id || generatedUsername;

    if (!data.first_name || !data.last_name || !data.foundationID || !data.role || !data.email) {
      playSound("/sounds/failure.mp3");
      toast.error("All fields are required!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      playSound("/sounds/failure.mp3");
      toast.error("Invalid email format!");
      return;
    }

    const [roleId, roleName] = data.role.split(":");
    const selectedRole = roles.find((role) => role.id === parseInt(roleId));

    if (!selectedRole) {
      playSound("/sounds/failure.mp3");
      toast.error("Invalid role selected");
      return;
    }

    if (data.user_id && !isEditing) {
      const exists = await checkUserIdExists(data.user_id);
      if (exists) {
        setUserIdExists(true);
        playSound("/sounds/failure.mp3");
        toast.error("User ID already exists. Please choose a different one.");
        return;
      }
    }

    const payload = {
      firstName: data.first_name,
      lastName: data.last_name,
      username: username,
      foundationID: data.foundationID,
      email: data.email,
      verifierRoleId: selectedRole.id
    };

    try {
      if (isEditing) {
        const updateResponse = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user/${editingUserId}`, {
          method: "PATCH",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!updateResponse.ok) {
          if (updateResponse.status === 401) {
            handleUnauthorized();
            return;
          }
          const errorText = await updateResponse.text();
          throw new Error(`Failed to update user: ${errorText}`);
        }

        playSound("/sounds/success.mp3");
        toast.success("User updated successfully!");
      } else {
        const createResponse = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user`, {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!createResponse.ok) {
          if (createResponse.status === 401) {
            handleUnauthorized();
            return;
          }
          throw new Error("Failed to create user");
        }

        const result = await createResponse.json();
        setUsers((prevUsers) => [...prevUsers, result.data]);
        playSound("/sounds/success.mp3");
        toast.success("User added successfully!");
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    }
  };

  const handleUserIdChange = async (e) => {
    const userId = e.target.value;
    if (userId && userId.length > 3) {
      const exists = await checkUserIdExists(userId);
      setUserIdExists(exists);
    } else {
      setUserIdExists(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${errorText}`);
      }

      setUsers(users.filter((user) => user.id !== userToDelete.id));
      playSound("/sounds/success.mp3");
      toast.success("User deleted successfully!");
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const openConfirmationModal = (user) => {
    setConfirmSendInvitation({ open: true, user });
  };

  const handleSendInvitation = async () => {
    const token = localStorage.getItem("authToken");
    const user = confirmSendInvitation.user;

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    setIsSendingInvitation(true);

    try {
      const response = await fetch(`${base_api_url}/mobile-verifier/v1/verifier-user/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed to send invitation: ${errorText}`);
      }

      playSound("/sounds/success.mp3");
      toast.success("Invitation email sent successfully!");
      setConfirmSendInvitation({ open: false, user: null });
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    } finally {
      setIsSendingInvitation(false);
      fetchUsers();
    }
  };

  const openStatusModal = (user) => {
    setSelectedUserForStatus(user);
    setSelectedStatus(
      user.statusId === 3 ? "ACTIVE" :
      user.statusId === 4 ? "SUSPENDED" :
      "REVOKED"
    );
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedUserForStatus(null);
    setSelectedStatus("ACTIVE");
  };

  const handleStatusUpdate = async () => {
    const token = localStorage.getItem("authToken");

    if (!token || !selectedUserForStatus) {
      toast.error("You are not authenticated or no user selected");
      return;
    }

    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/verifier-user/revoke_suspend?id=${
          encodeURIComponent(selectedUserForStatus.id)}&status=${encodeURIComponent(selectedStatus)}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed to update status: ${errorText}`);
      }
      playSound("/sounds/success.mp3");
      toast.success(`User status updated to ${selectedStatus}`);
      closeStatusModal();
      fetchUsers();
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    }
  };

  const columns = [
    {
      header: "Foundation ID",
      accessorKey: "foundationID",
    },
    {
      header: "Username",
      accessorKey: "username",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "verifierRole.role",
    },
    {
      header: "Status",
      accessorKey: "statusId",
      cell: ({ row }) => {
        const statusId = row.original.statusId;
        let statusText = "Unknown";
        let statusColor = "bg-gray-100 text-gray-800";
        switch (statusId) {
          case 1:
            statusText = "CREATED";
            statusColor = "bg-blue-100 text-blue-800";
            break;
          case 2:
            statusText = "INVITED";
            statusColor = "bg-purple-100 text-purple-800";
            break;
          case 3:
            statusText = "ACTIVE";
            statusColor = "bg-emerald-100 text-emerald-800";
            break;
          case 4:
            statusText = "SUSPENDED";
            statusColor = "bg-amber-100 text-amber-800";
            break;
          case 5:
            statusText = "REVOKED";
            statusColor = "bg-red-100 text-red-800";
            break;
          default:
            statusText = "Unknown";
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      header: "Invitation",
      id: "invite",
      cell: ({ row }) => {
        const statusId = row.original.statusId;
        return (
          <>
            {statusId <= 3 && (
              <button
                className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium"
                onClick={() => openConfirmationModal(row.original)}
              >
                <Mail size={16} className="mr-1" />
                Re-Invite
              </button>
            )}
            {statusId >= 4 && (
              <span className="text-gray-400">-</span>
            )}
          </>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => { 
        const statusId = row.original.statusId;
        return (
          <div className="flex justify-start gap-4 px-1">
            {statusId !== 5 && (
            <button
              className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium"
              onClick={() => openStatusModal(row.original)}
            >
              <RefreshCw size={16} className="mr-1" />
              Update Status
            </button> )}
          </div>
        )}
    },
  ];

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      {/* Header and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <div className="relative w-full">
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search users..."
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
                    Add New User
                  </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center pt-4 text-gray-500">Loading Users...</p>
      ) : users.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No Users found</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent
            columns={columns}
            data={users}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-600 px-6 py-3 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isEditing ? "Edit User" : "Add New User"}
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
              {errorRoles && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex items-center text-red-700">
                    <AlertCircle size={16} className="mr-2" />
                    <span>Error loading roles: {errorRoles}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} id="user-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                        errors.first_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                      }`}
                      placeholder="Enter first name"
                      {...register("first_name", { required: "First Name is required" })}
                    />
                    {errors.first_name && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.first_name.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                        errors.last_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                      }`}
                      placeholder="Enter last name"
                      {...register("last_name", { required: "Last Name is required" })}
                    />
                    {errors.last_name && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.last_name.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
                    User ID <span className="ml-1 text-gray-500">(Recommended to use the suggested name)</span>
                  </label>
                  <input
                    id="user_id"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                      userIdExists ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    placeholder="Enter user ID"
                    {...register("user_id")}
                    onChange={handleUserIdChange}
                  />
                  {userIdExists && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      User ID already exists. Please choose a different one.
                    </div>
                  )}
                  {!isEditing && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <span>Name Suggestion: </span>
                      {isGeneratingUsername ? (
                        <span className="ml-1 italic">Generating...</span>
                      ) : generatedUsername ? (
                        <button
                          type="button"
                          className="text-emerald-600 hover:underline cursor-pointer bg-transparent border-none p-0 ml-1"
                          onClick={() => {
                            setValue('user_id', generatedUsername);
                            handleUserIdChange({ target: { value: generatedUsername } });
                          }}
                        >
                          {generatedUsername}
                        </button>
                      ) : (
                        <span className="ml-1">Enter first and last name to see suggestions</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label htmlFor="foundationID" className="block text-sm font-medium text-gray-700">
                      Foundation ID *
                    </label>
                    <input
                      id="foundationID"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                        errors.foundationID ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                      }`}
                      placeholder="Enter foundation ID"
                      {...register("foundationID", { required: "Foundation ID is required" })}
                    />
                    {errors.foundationID && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.foundationID.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                        errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                      }`}
                      placeholder="Enter email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email format",
                        },
                      })}
                    />
                    {errors.email && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <select
                        id="role"
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                          errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                        } ${loadingRoles ? 'opacity-50 cursor-not-allowed' : ''}`}
                        {...field}
                        disabled={loadingRoles}
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option
                            key={role.id}
                            value={`${role.id}:${role.role}`}
                          >
                            {role.id}: {role.role}
                          </option>
                        ))}
                      </select>
                    )}
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
                  form="user-form"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loadingRoles || errorRoles || userIdChecking || userIdExists || isGeneratingUsername}
                >
                  {isEditing ? "Update User" : "Create User"}
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
                Are you sure you want to delete <span className="font-medium">{userToDelete?.username}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Confirmation Modal */}
      {confirmSendInvitation.open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-emerald-600 px-6 py-3 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Confirm Invitation</h3>
                <button
                  onClick={() => setConfirmSendInvitation({ open: false, user: null })}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={isSendingInvitation}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to send an invitation to <span className="font-medium">{confirmSendInvitation.user.email}</span>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={() => setConfirmSendInvitation({ open: false, user: null })}
                  disabled={isSendingInvitation}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  onClick={handleSendInvitation}
                  disabled={isSendingInvitation}
                >
                  {isSendingInvitation ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} className="mr-1" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedUserForStatus && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-emerald-600 px-6 py-3 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Update User Status</h3>
                <button
                  onClick={closeStatusModal}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Updating status for: <span className="font-medium">{selectedUserForStatus.username}</span>
              </p>
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Status
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition-all text-sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="REVOKED">REVOKED</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={closeStatusModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                  onClick={handleStatusUpdate}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierUser;