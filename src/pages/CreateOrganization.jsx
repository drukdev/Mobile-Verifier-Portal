import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddOrganizationModal from "./AddOrganizationModal";
import TableComponent from "../components/TableComponent";
import { useAuth } from "../context/AuthContext";

const CreateOrganization = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const handleUnauthorized = () => {
    toast.error("Session expired. Please login again.");
    logout();
  };

  const fetchOrganizations = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("https://staging.bhutanndi.com/ndi-mobile-verifier/v1/organization", {
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
        throw new Error(errorText || "Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data.data?.[1] || []);
    } catch (error) {
      setError(error.message);
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [isAuthenticated]);

  const handleEdit = (organization) => {
    setSelectedOrganization(organization);
    setIsEditModalOpen(true);
  };

  const handleDelete = (organizationId) => {
    setSelectedOrganization(organizations.find((org) => org.orgId === organizationId));
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://staging.bhutanndi.com/ndi-mobile-verifier/v1/organization/${selectedOrganization.orgId}`,
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
        throw new Error(errorText || "Failed to delete organization");
      }

      playSound("/sounds/success.mp3");
      toast.success("Organization deleted successfully");
      await fetchOrganizations();
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
    setIsDeleteModalOpen(false);
  };

  const handleAddSuccess = async () => {
    await fetchOrganizations();
    playSound("/sounds/success.mp3");
    toast.success("Organization added successfully");
  };

  const handleEditSuccess = async () => {
    await fetchOrganizations();
    playSound("/sounds/success.mp3");
    toast.success("Organization updated successfully");
  };

  const columns = [
    { accessorKey: "orgId", header: "Organization ID" },
    { accessorKey: "orgName", header: "Organization Name" },
    { accessorKey: "url", header: "Service URL" },
    { accessorKey: "publicDid", header: "Public DID" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];
// flex flex-col md:flex-row gap-4 mb-4 px-1 py-4 bg-gray-50 rounded-lg
  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Updated Search and Add Organization Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 mb-2">Search Organizations</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search organizations..."
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
        <div className="flex items-end">
          <button
            className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors h-[42px]"
            onClick={() => setIsModalOpen(true)}
            disabled={!isAuthenticated}
          >
            Add New Organization
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center pt-8 text-gray-500">Loading Organizations...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : organizations.length === 0 ? (
        <p className="text-center text-gray-500">No organizations found.</p>
      ) : (
        <TableComponent
          columns={columns}
          data={organizations}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}

      <AddOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {isEditModalOpen && (
        <AddOrganizationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          organization={selectedOrganization}
          onSuccess={handleEditSuccess}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 text-center">
              Are you sure you want to delete{" "}
              <strong className="text-red-600">{selectedOrganization?.orgName}</strong>?
            </p>
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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

export default CreateOrganization;