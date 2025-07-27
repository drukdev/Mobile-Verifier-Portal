import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (organization) {
      const authData = organization.authentication?.data || {};
      setFormData({
        organizationName: organization.orgName || "",
        organizationId: organization.orgId || "",
        logoUrl: organization.logoURL || organization.logoUrl || "",
        serviceUrl: organization.url || organization.serviceUrl || "",
        clientId: authData.client_id || organization.clientId || "",
        clientSecret: authData.client_secret || organization.clientSecret || "",
        grantType: authData.grant_type || organization.grantType || "",
        authenticationUrl: authData.url || organization.authenticationUrl || "",
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
    setErrors({});
  }, [organization, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization Name is required";
    }
    if (!formData.organizationId.trim()) {
      newErrors.organizationId = "Organization ID is required";
    }
    if (!formData.serviceUrl.trim()) {
      newErrors.serviceUrl = "Service URL is required";
    }
    if (!formData.clientId.trim()) {
      newErrors.clientId = "Client ID is required";
    }
    if (!formData.clientSecret.trim()) {
      newErrors.clientSecret = "Client Secret is required";
    }
    if (!formData.grantType.trim()) {
      newErrors.grantType = "Grant Type is required";
    }
    if (!formData.authenticationUrl.trim()) {
      newErrors.authenticationUrl = "Authentication URL is required";
    }
    if (!formData.publicDid.trim()) {
      newErrors.publicDid = "Public DID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

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

      const token = localStorage.getItem("authToken");
      const auth_api_url = import.meta.env.VITE_AUTH_API_URL;
      const method = organization ? "PUT" : "POST";
      const url = organization
        ? `${auth_api_url}/ndi-mobile-verifier/v1/organization/${organization.orgId}`
        : `${auth_api_url}/ndi-mobile-verifier/v1/organization`;
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save organization");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving organization:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-3 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {organization ? "Edit Organization" : "Add New Organization"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Organization Name - Full Width */}
            <div className="mb-6">
              <div className="space-y-1">
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                  Organization Name *
                </label>
                <input
                  id="organizationName"
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                    errors.organizationName ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                />
                {errors.organizationName && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.organizationName}
                  </div>
                )}
              </div>
            </div>

            {/* Organization ID and Logo URL */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700">
                    Organization ID *
                  </label>
                  <input
                    id="organizationId"
                    type="text"
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    disabled={!!organization}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm ${
                      errors.organizationId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    } ${!organization ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {errors.organizationId && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.organizationId}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    id="logoUrl"
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm border-gray-200 hover:border-emerald-300"
                  />
                </div>
              </div>
            </div>

            {/* Service URL and Client ID */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="serviceUrl" className="block text-sm font-medium text-gray-700">
                    Service URL *
                  </label>
                  <input
                    id="serviceUrl"
                    type="text"
                    name="serviceUrl"
                    value={formData.serviceUrl}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                      errors.serviceUrl ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  />
                  {errors.serviceUrl && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.serviceUrl}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                    Client ID *
                  </label>
                  <input
                    id="clientId"
                    type="text"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm ${
                      errors.clientId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  />
                  {errors.clientId && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.clientId}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Secret and Grant Type */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700">
                    Client Secret *
                  </label>
                  <input
                    id="clientSecret"
                    type="password"
                    name="clientSecret"
                    value={formData.clientSecret}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm ${
                      errors.clientSecret ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  />
                  {errors.clientSecret && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.clientSecret}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="grantType" className="block text-sm font-medium text-gray-700">
                    Grant Type *
                  </label>
                  <input
                    id="grantType"
                    type="text"
                    name="grantType"
                    value={formData.grantType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm ${
                      errors.grantType ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  />
                  {errors.grantType && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.grantType}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Authentication URL */}
            <div className="mb-6">
              <div className="space-y-1">
                <label htmlFor="authenticationUrl" className="block text-sm font-medium text-gray-700">
                  Authentication URL *
                </label>
                <input
                  id="authenticationUrl"
                  type="text"
                  name="authenticationUrl"
                  value={formData.authenticationUrl}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                    errors.authenticationUrl ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                />
                {errors.authenticationUrl && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.authenticationUrl}
                  </div>
                )}
              </div>
            </div>

            {/* Public DID */}
            <div className="mb-6">
              <div className="space-y-1">
                <label htmlFor="publicDid" className="block text-sm font-medium text-gray-700">
                  Public DID *
                </label>
                <input
                  id="publicDid"
                  type="text"
                  name="publicDid"
                  value={formData.publicDid}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm ${
                    errors.publicDid ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                />
                {errors.publicDid && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.publicDid}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            * Required fields
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
              onClick={handleSubmit}
            >
              {organization ? "Update Organization" : "Add Organization"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrganizationModal;