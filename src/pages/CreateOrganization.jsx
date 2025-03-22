import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddOrganizationModal from "./AddOrganizationModal";
import TableComponent from "../components/TableComponent";
import SearchInput from "../components/SearchInput";
import { useForm } from "react-hook-form";

const CreateOrganization = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Function to play sound
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  // Fetch organizations from the API
  const fetchOrganizations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/organizations");
      const data = await response.json();
      if (response.ok) {
        setOrganizations(data);
      } else {
        throw new Error(data.detail || "Failed to fetch organizations");
      }
    } catch (error) {
      setError(error.message);
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handle edit action
  const handleEdit = (organization) => {
    setSelectedOrganization(organization);
    setIsEditModalOpen(true);
  };

  // Handle delete action
  const handleDelete = (organizationId) => {
    setSelectedOrganization(organizations.find((org) => org.organizationId === organizationId));
    setIsDeleteModalOpen(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/organizations/${selectedOrganization.organizationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        playSound("/sounds/success.mp3");
        toast.success("Organization deleted successfully");
        fetchOrganizations();
      } else {
        throw new Error("Failed to delete organization");
      }
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
    setIsDeleteModalOpen(false);
  };

  // Handle form submission for adding a new organization
  const handleAddOrganization = async (newOrganization) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch("http://127.0.0.1:8000/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOrganization),
      });
      if (response.ok) {
        playSound("/sounds/success.mp3");
        toast.success("Organization added successfully");
        fetchOrganizations();
      } else {
        throw new Error("Failed to add organization");
      }
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
  };

  // Handle form submission for editing an organization
  const handleEditOrganization = async (updatedOrganization) => {
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/organizations/${updatedOrganization.organizationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedOrganization),
        }
      );
      if (response.ok) {
        playSound("/sounds/success.mp3");
        toast.success("Organization updated successfully");
        fetchOrganizations();
      } else {
        throw new Error("Failed to update organization");
      }
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
    setIsEditModalOpen(false);
  };

  // Define columns for the table
  const columns = [
    { accessorKey: "organizationId", header: "Organization ID" },
    { accessorKey: "organizationName", header: "Organization Name" },
    { accessorKey: "serviceUrl", header: "Service URL" },
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
          <button
            onClick={() => handleDelete(row.original.organizationId)}
            className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header (Search & Add Button) */}
      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search organizations..."
        />
        <button
          className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Organization
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
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

      {/* Add Organization Modal */}
      <AddOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOrganization}
      />

      {/* Edit Organization Modal */}
      {isEditModalOpen && (
        <AddOrganizationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          organization={selectedOrganization}
          onSubmit={handleEditOrganization}
        />
      )}

      {/* Styled Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 text-center">
              Are you sure you want to delete{" "}
              <strong className="text-red-600">{selectedOrganization?.organizationName}</strong>?
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