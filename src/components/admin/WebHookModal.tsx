import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WebHookModal = ({ isOpen, onClose, organization, onSuccess }) => {
  const [formData, setFormData] = useState({
    webhookId: "",
    webhookURL: "",
    authVersion: "v1",
    authUrl: "",
    grantType: "client_credentials",
    clientId: "",
    clientSecret: "",
    token: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (organization) {
      const auth = organization.authentication || {};
      setFormData({
        webhookId: organization.orgId || "",
        webhookURL: organization.webhookURL || "",
        authVersion: auth.version || "v1",
        authUrl: auth.data?.url || "",
        grantType: auth.data?.grant_type || "client_credentials",
        clientId: auth.data?.client_id || "",
        clientSecret: auth.data?.client_secret || "",
        token: auth.data?.token || ""
      });
    } else {
      setFormData({
        webhookId: "",
        webhookURL: "",
        authVersion: "v1",
        authUrl: "",
        grantType: "client_credentials",
        clientId: "",
        clientSecret: "",
        token: ""
      });
    }
    setErrors({});
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.webhookId.trim()) {
      newErrors.webhookId = "Webhook ID is required";
    }

    if (formData.authVersion === "v1") {
      if (!formData.clientId.trim()) {
        newErrors.clientId = "Client ID is required";
      }

      if (!formData.clientSecret.trim()) {
        newErrors.clientSecret = "Client Secret is required";
      }
    } 
    if (formData.authVersion === "v2") {
      if (!formData.token.trim()) {
        newErrors.token = "Access Token is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        webhookId: formData.webhookId,
        webhookURL: formData.webhookURL,
        authentication: {
          type: "OAuth2",
          version: formData.authVersion,
          data: formData.authVersion === "v1" ? {
            url: formData.authUrl,
            grant_type: formData.grantType,
            client_id: formData.clientId,
            client_secret: formData.clientSecret
          } : {
            token: formData.token
          }
        }
      };

      const webhook_api_url = import.meta.env.VITE_WEBHOOK_URL;
      const url = `${webhook_api_url}/webhook/v1/register`;
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register webhook");
      }

      const responseData = await response.json();
      onSuccess(responseData.data);
      onClose();
    } catch (error) {
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
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
              {organization ? "Update WebHook" : "Register New WebHook"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            <div className="space-y-6">
              {/* Webhook ID and Authentication Version */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="webhookId" className="block text-sm font-medium text-gray-700">
                    Webhook ID *
                  </label>
                  <input
                    id="webhookId"
                    type="text"
                    name="webhookId"
                    value={formData.webhookId}
                    onChange={handleChange}
                    disabled={true}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm opacity-60 cursor-not-allowed ${
                      errors.webhookId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.webhookId && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.webhookId}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="authVersion" className="block text-sm font-medium text-gray-700">
                    Authentication Version *
                  </label>
                  <select
                    id="authVersion"
                    name="authVersion"
                    value={formData.authVersion}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm border-gray-200 hover:border-emerald-300"
                  >
                    <option value="v1">Version 1 (OAuth)</option>
                    <option value="v2">Version 2 (Token)</option>
                  </select>
                </div>
              </div>

              {/* Webhook URL - Full Width */}
              <div className="space-y-1">
                <label htmlFor="webhookURL" className="block text-sm font-medium text-gray-700">
                  Webhook URL *
                </label>
                <input
                  id="webhookURL"
                  type="text"
                  name="webhookURL"
                  value={formData.webhookURL}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                    errors.webhookURL ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                />
                {errors.webhookURL && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.webhookURL}
                  </div>
                )}
              </div>

              {/* Conditional Authentication Fields */}
              <div className="transition-all duration-300 ease-in-out">
                {formData.authVersion === "v1" ? (
                  <div className="space-y-6">
                    {/* Authentication URL - Full Width */}
                    <div className="space-y-1">
                      <label htmlFor="authUrl" className="block text-sm font-medium text-gray-700">
                        Authentication URL *
                      </label>
                      <input
                        id="authUrl"
                        type="url"
                        name="authUrl"
                        value={formData.authUrl}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                          errors.authUrl ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      />
                      {errors.authUrl && (
                        <div className="flex items-center text-red-600 text-xs mt-1">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.authUrl}
                        </div>
                      )}
                    </div>

                    {/* Client ID and Client Secret */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                    </div>

                    {/* Hidden Grant Type Field */}
                    <div className="hidden">
                      <input
                        type="text"
                        name="grantType"
                        value={formData.grantType}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="transition-all duration-300 ease-in-out overflow-hidden">
                    <div className="space-y-1">
                      <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                        Access Token *
                      </label>
                      <input
                        id="token"
                        type="password"
                        name="token"
                        value={formData.token}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono text-sm ${
                          errors.token ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      />
                      {errors.token && (
                        <div className="flex items-center text-red-600 text-xs mt-1">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.token}
                        </div>
                      )}
                    </div>
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : organization ? "Update Webhook" : "Register Webhook"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebHookModal;