import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import TableComponent from "../components/layout/TableComponent";
import { useAuth } from "../context/AuthContext";
import { X, Plus, Trash2, ChevronDown, Check, AlertCircle, RefreshCw, File, Search } from "lucide-react";

const FileUploadPage = () => {
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const base_api_url = import.meta.env.VITE_AUTH_API_URL;

  const handleUnauthorized = () => {
    toast.error("Unauthorized");
    logout();
  };

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const handleUpload = async () => {
    if (!attachedFile) {
      playSound("/sounds/failure.mp3");
      toast.error("Please select a file to upload");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      playSound("/sounds/failure.mp3");
      toast.error("You are not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("file", attachedFile);

    try {
      const response = await fetch(`${base_api_url}/ndi-mobile-verifier/v1/typesense/schema-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        const errorText = result.message;
        throw new Error(`Upload failed: ${errorText}`);
      }

      playSound("/sounds/success.mp3");
      toast.success("File uploaded successfully!");
      setAttachedFile(null);
      fetchFileData();
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
  };

  const fetchFileData = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(`${base_api_url}/ndi-mobile-verifier/v1/typesense/schemas`, {
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
        throw new Error(`Failed to fetch data: ${errorText}`);
      }
      const res = await response.json();
      if (res.statusCode == 500) {
        throw new Error("No data found or server error");
      }
      const result = res.data.result;
      const parsedSchemas = result.data.map((item) => ({
        ...item,
        parsedAttributes: JSON.parse(item.attributes)
      }));

      setFileData(parsedSchemas || []);
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${base_api_url}/ndi-mobile-verifier/v1/typesense/schemas/${fileToDelete.schemaId}`,
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
        throw new Error(`Failed to delete schema: ${errorText}`);
      }

      playSound("/sounds/success.mp3");
      toast.success("Schema deleted successfully!");
      setFileData(fileData.filter(file => file.schemaId !== fileToDelete.schemaId));
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFileData();
    }
  }, [isAuthenticated]);

  const columns = [
    {
      id: "serial",
      header: "S/N",
      cell: (info) => info.row.index + 1,
      enableSorting: false,
      size: 50,
    },
    {
      accessorKey: "schemaName",
      header: "Schema Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "attributeNames",
      header: "Attributes",
      cell: (info) => {
        const names = info.getValue();
        if (!Array.isArray(names)) return "";
        return (
          <div className="flex flex-wrap gap-2">
            {names
              .filter((name) => name !== "revocation_id")
              .map((name, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded-md shadow-sm text-gray-800 text-xs"
                >
                  {name}
                </span>
              ))}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "schemaId",
      header: "Schema ID",
      cell: (info) => (
        <button
          onClick={() => window.open(info.getValue(), '_blank')}
          className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer bg-transparent border-none font-medium"
        >
          View Schema
        </button>
      ),
      enableSorting: false,
    }
  ];

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      {/* File Upload Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Attach Schema File</label>
          <div className="relative w-full">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="fileInput"
            />
            <div className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition duration-200 flex justify-between items-center">
              <span className="text-gray-500">
                {attachedFile ? attachedFile.name : "Choose a schema file (.csv) to upload..."}
              </span>
              <span className="text-gray-400">
                <File size={16} />
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {attachedFile && (
            <button
              onClick={removeFile}
              className="inline-flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium h-[42px]"
            >
              <X size={16} className="mr-1" />
              Remove
            </button>
          )}
          <button
            onClick={handleUpload}
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium h-[42px]"
            disabled={!attachedFile}
          >
            <Plus size={16} className="mr-1" />
            Upload
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Schemas</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search schemas..."
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:border-emerald-300 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center pt-4 text-gray-500">Loading Schemas...</p>
      ) : fileData.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No Schemas found</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent
            columns={columns}
            data={fileData}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
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
                Are you sure you want to delete <span className="font-medium">{fileToDelete?.schemaName}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                {/*<button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  onClick={handleDeleteFile}
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

export default FileUploadPage;