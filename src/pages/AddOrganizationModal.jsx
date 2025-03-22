import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddOrganizationModal = ({ isOpen, onClose, organization, onSubmit }) => {
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationId: "",
    logoUrl: "",
    serviceUrl: "",
    clientId: "",
    clientSecret: "",
    grantType: "",
    authenticationUrl: "",
    publicDid: "",
  });

  // Pre-fill form if editing an organization
  useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else {
      setFormData({
        organizationName: "",
        organizationId: "",
        logoUrl: "",
        serviceUrl: "",
        clientId: "",
        clientSecret: "",
        grantType: "",
        authenticationUrl: "",
        publicDid: "",
      });
    }
  }, [organization]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = organization
        ? `http://127.0.0.1:8000/organizations/${formData.organizationId}`
        : "http://127.0.0.1:8000/organizations";
      const method = organization ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          organization
            ? "Organization updated successfully!"
            : "Organization added successfully!"
        );
        onSubmit(formData); // Pass the updated/added organization to the parent component
        onClose(); // Close modal on success
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to process request");
      }
    } catch (error) {
      toast.error(error.message || "Network error, please try again!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {organization ? "Edit Organization" : "Add New Organization"}
          </h2>
          <button
            className="text-gray-600 hover:text-gray-900 transition-colors"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Organization Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Organization ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization ID
            </label>
            <input
              type="text"
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
              disabled={!!organization} // Disable if editing
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
            />
          </div>

          {/* Service URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service URL
            </label>
            <input
              type="text"
              name="serviceUrl"
              value={formData.serviceUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="text"
              name="clientSecret"
              value={formData.clientSecret}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Grant Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grant Type
            </label>
            <input
              type="text"
              name="grantType"
              value={formData.grantType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Authentication URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authentication URL
            </label>
            <input
              type="text"
              name="authenticationUrl"
              value={formData.authenticationUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Public DID */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public DID
            </label>
            <input
              type="text"
              name="publicDid"
              value={formData.publicDid}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex justify-end space-x-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-400 rounded-md hover:bg-green-700 transition-colors"
            >
              {organization ? "Update Organization" : "Add Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganizationModal;