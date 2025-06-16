import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableComponent from "../components/layout/TableComponent";
import { useAuth } from "../context/AuthContext";
import { X, Plus, Trash2, ChevronDown, Check, AlertCircle, Mail, RefreshCw } from "lucide-react";
import AddOrganizationModal from "../components/admin/AddOrganizationModal";
import WebHookModal from '../components/admin/WebHookModal';

const CreateOrganization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrganizationId, setEditingOrganizationId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const { isAuthenticated, logout } = useAuth();

  const auth_api_url = import.meta.env.VITE_AUTH_API_URL;

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const handleUnauthorized = () => {
    toast.error("Unauthorized");
    logout();
  };

  const fetchOrganizations = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${auth_api_url}/ndi-mobile-verifier/v1/organization`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch organizations: ${errorText}`);
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data) && result.data.length > 1) {
        const orgs = result.data[1];
        setOrganizations(orgs);
      } else {
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated]);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingOrganizationId(null);
    setSelectedOrganization(null);
    setIsAddOrgModalOpen(true);
  };

  const openEditModal = (organization) => {
    setSelectedOrganization(organization);
    setIsEditing(true);
    setEditingOrganizationId(organization.orgId);
    setIsAddOrgModalOpen(true);
  };

  const openWebhookModal = (organization) => {
    setSelectedOrganization(organization);
    setIsWebhookModalOpen(true);
  };

  const closeModal = () => {
    setIsAddOrgModalOpen(false);
    setIsWebhookModalOpen(false);
    setIsEditing(false);
    setEditingOrganizationId(null);
    setSelectedOrganization(null);
  };

  const openDeleteModal = (organization) => {
    setOrganizationToDelete(organization);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOrganization = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${auth_api_url}/ndi-mobile-verifier/v1/organization/${organizationToDelete.orgId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete organization: ${errorText}`);
      }

      setOrganizations(organizations.filter(org => org.orgId !== organizationToDelete.orgId));
      playSound("/sounds/success.mp3");
      toast.success("Organization deleted successfully!");
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(`${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setOrganizationToDelete(null);
    }
  };

  const handleAddSuccess = () => {
    playSound("/sounds/success.mp3");
    toast.success("Organization added successfully!");
    fetchOrganizations();
    closeModal();
  };

  const handleEditSuccess = () => {
    playSound("/sounds/success.mp3");
    toast.success("Organization updated successfully!");
    fetchOrganizations();
    closeModal();
  };

  const handleWebhookSuccess = () => {
    playSound("/sounds/success.mp3");
    toast.success("Webhook registered successfully!");
    closeModal();
  };

  const columns = [
    {
      header: "Organization ID",
      accessorKey: "orgId",
    },
    {
      header: "Organization Name",
      accessorKey: "orgName",
    },
    {
      header: "Service URL",
      accessorKey: "url",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex justify-start gap-4 px-1">
          <button
            className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            onClick={() => openEditModal(row.original)}
          >
            <RefreshCw size={16} className="mr-1" />
            Edit
          </button>
          <button
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            onClick={() => openWebhookModal(row.original)}
          >
            <Mail size={16} className="mr-1" />
            Webhook
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
      {/* Search and Add */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Organizations</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search organizations..."
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
          onClick={openAddModal}
        >
          <Plus size={16} className="mr-1" />
          Add New Organization
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center pt-4 text-gray-500">Loading Organizations...</p>
      ) : organizations.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No Organizations found</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent
            columns={columns}
            data={organizations}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      )}

      {/* Add/Edit Organization Modal */}
      <AddOrganizationModal
        isOpen={isAddOrgModalOpen}
        onClose={closeModal}
        onSuccess={isEditing ? handleEditSuccess : handleAddSuccess}
        organization={selectedOrganization}
        isEditing={isEditing}
      />

      {/* Webhook Modal */}
      <WebHookModal
        isOpen={isWebhookModalOpen}
        onClose={closeModal}
        onSuccess={handleWebhookSuccess}
        organization={selectedOrganization}
      />

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
                Are you sure you want to delete <span className="font-medium">{organizationToDelete?.orgName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
               {/* <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  onClick={handleDeleteOrganization}
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

export default CreateOrganization;