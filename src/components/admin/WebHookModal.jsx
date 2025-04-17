import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";


const WebHookModal = ({ isOpen, onClose, organization, onSuccess }) => {
  const { webhookAuth } = useAuth();
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
  useEffect(() => {
    if (organization) {
      webhookAuth()
      
      const auth = {};
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
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const webhook_api_url = import.meta.env.VITE_API_BASE_URL;
      const url = `${webhook_api_url}/webhook/v1/register`
            const token = localStorage.getItem("webhookToken");
            const response = await fetch(url, {
              method: "POST",
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
      console.log("Submitting:", payload);
      toast.success(`Webhook Created Successfully for ${response.webhookId}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
    localStorage.removeItem('authToken');

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {organization ? "Register WebHook" : "Register New WebHook"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook ID
            </label>
            <input
              type="text"
              name="webhookId"
              value={formData.webhookId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              required
              disabled={!!organization}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authentication Version
            </label>
            <select
              name="authVersion"
              value={formData.authVersion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            >
              <option value="v1">Version 1 (OAuth)</option>
              <option value="v2">Version 2 (Token)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <input
              type="text"
              name="webhookURL"
              value={formData.webhookURL}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              required
            />
          </div>

          <div className="transition-all duration-300 ease-in-out overflow-hidden">
            {formData.authVersion === "v1" ? (
              <div className="space-y-4 border-t pt-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authentication URL
                  </label>
                  <input
                    type="text"
                    name="authUrl"
                    value={formData.authUrl}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grant Type
                  </label>
                  <input
                    type="text"
                    name="grantType"
                    value={formData.grantType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    required
                  />
                  </div>
                </div>
            ) : (
              <div className="border-t pt-4 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <input
                  type="text"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-400 rounded-md hover:bg-emerald-600 transition-colors"
            >
              {organization ? "Register New Webhook" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebHookModal;