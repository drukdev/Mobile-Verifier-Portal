import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddOrganizationModal = ({ isOpen, onClose, organization, onSuccess }) => {
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

  useEffect(() => {
    if (organization) {
      console.log(`this organization`, organization);
      setFormData({
        organizationName: organization.orgName || "",
        organizationId: organization.orgId || "",
        logoUrl: organization.logoURL || "",
        serviceUrl: organization.url || "",
        clientId: organization.authentication?.data?.client_id || "",
        clientSecret: organization.authentication?.data?.client_secret || "",
        grantType: organization.authentication?.data?.grant_type || "",
        authenticationUrl: organization.authentication?.data?.url || "",
        publicDid: organization.publicDid || "",
      });
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
      const auth = {
        type: "OAuth2",
        version: "v1",
        data: {
          url: formData.authenticationUrl,
          grant_type: formData.grantType,
          client_id: formData.clientId,
          client_secret: formData.clientSecret,
        }
      };

      const payload = {
        orgId: formData.organizationId,
        orgName: formData.organizationName,
        publicDid: formData.publicDid,
        logoURL: formData.logoUrl,
        url: formData.serviceUrl,
        authentication: auth
      };

      const url = organization
        ? `https://staging.bhutanndi.com/ndi-mobile-verifier/v1/organization/${formData.organizationId}`
        : "https://staging.bhutanndi.com/ndi-mobile-verifier/v1/organization";
      
      const method = organization ? "PATCH" : "POST";
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process request");
      }

      toast.success(
        organization
          ? "Organization updated successfully!"
          : "Organization added successfully!"
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Network error, please try again!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

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
              disabled={!!organization}
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200"
              required
            />
          </div>

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