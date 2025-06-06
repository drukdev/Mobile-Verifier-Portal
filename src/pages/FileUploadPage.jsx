import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import TableComponent from "../components/layout/TableComponent";
import { useAuth } from "../context/AuthContext";

const FileUploadPage = () => {
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const base_api_url = import.meta.env.VITE_AUTH_API_URL;

  const handleUnauthorized = () => {
    toast.error("Unauthorized");
    logout();
  };

  // Function to play sound
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  // Remove attached file
  const removeFile = () => {
    setAttachedFile(null);
  };

  // Upload file to server
  const handleUpload = async () => {
    if (!attachedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
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
        const errorText = result.message
        throw new Error(`Upload failed: ${errorText}`);
      }

      playSound("/sounds/success.mp3");
      toast.success("File uploaded successfully!");
      setAttachedFile(null);
      fetchFileData(); // Refresh data after upload
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
  };

  // Fetch data from server
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
      if  (res.statusCode == 500) {
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
  useEffect(() => {
    if (isAuthenticated) {
      fetchFileData();
    }
  }, [isAuthenticated]);

  // Columns for the table
  const columns = [
    {
      id: "serial", // optional ID
      header: "S/N",
      cell: (info) => info.row.index + 1, // Serial number (1-based index)
      enableSorting: false, // optional: disable sorting
      size: 50, // optional: column width
    },
    {
      accessorKey: "schemaName",
      header: "Schema Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: "schemaId",
      header: "Schema ID",
      cell: (info) => (
        <a 
          href={info.getValue()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.open(info.getValue(), '_blank');
          }}
        >
          {info.getValue()}
        </a>
      ),
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
                  className="bg-gray-100 px-2 py-1 rounded-md shadow-sm text-gray-800 text-sm"
                >
                  {name}
                </span>
              ))}
          </div>
        );
      },
      enableSorting: true,
    }
  ];
  

  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* File Upload Section */}
      <div className="bg-white  rounded-lg mb-4"> {/* Reduced margin-bottom from mb-6 to mb-4 */}
      
        <div className="flex flex-col md:flex-row gap-1 items-start md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Attach Schema File
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="fileInput"
              />
              <div className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:border-emerald-500 transition duration-200 flex justify-between items-center">
                <span className="text-gray-500">
                  {attachedFile ? attachedFile.name : "Choose a file..."}
                </span>
                <span className="text-gray-400">📁</span>
              </div>
            </div>
          </div>
          
          {attachedFile && (
            <div className="flex items-center bg-gray-50 p-2 rounded-md">
              <span className="text-sm text-gray-600 mr-2">{attachedFile.name}</span>
              <button
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors h-[42px]" // Added fixed height to match file input
          >
            Upload
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white pt-1 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-1 mb-2"> {/* Reduced gap from gap-4 to gap-2 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-500 mb-1">Search</label>
            <div className="relative w-full">
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search Schema..."
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200 h-[42px]" // Added fixed height to match file input
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center pt-8 text-gray-500">Loading data...</p>
        ) : fileData.length === 0 ? (
          <p className="text-center pt-4 text-red-400">No data found</p>
        ) : (
          <TableComponent
            columns={columns}
            data={fileData}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-500 text-center">
              Details
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">ID</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Name</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.name}</p>
              </div>
              {/* Add more details as needed */}
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;