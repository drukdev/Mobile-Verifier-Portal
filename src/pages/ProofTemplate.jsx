import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TableComponent from "../components/layout/TableComponent";
import MainModal from "../components/client/MainModal";
import AddSchemaModal from "../components/client/AddSchemaModal";
import { X, Plus, Trash2, ChevronDown, Check, AlertCircle, Eye } from "lucide-react";

const ProofTemplate = () => {
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [viewMode, setViewMode] = useState(false); // New state for view mode

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      template_name: "",
      template_id: "",
      role: [],
      version: "1.0.0",
      description: "",
    },
  });

  const templateName = watch("template_name");

  useEffect(() => {
    if (templateName && !viewMode) {
      const firstLetter = templateName.charAt(0).toUpperCase();
      const uuid = crypto.randomUUID().split('-')[0];
      const suggestedId = `${firstLetter}${uuid}`;
      setValue("template_id", suggestedId);
    }
  }, [templateName, setValue, viewMode]);

  const base_api_url = import.meta.env.VITE_API_BASE_URL;

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const fetchTemplates = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/proof-template?pageSize=300`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch templates: ${errorText}`);
      }

      const result = await response.json();
      setTemplates(result.data?.[1] || []);
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/verifier-role?pageSize=300`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles: ${errorText}`);
      }

      const result = await response.json();
      setRoles(result.data?.[1] || []);
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
      fetchRoles();
    }
  }, [isAuthenticated]);

  const openMainModal = (template = null, isViewMode = false) => {
    setViewMode(isViewMode);
    if (template) {
      reset({
        template_name: template.name,
        template_id: template.templateId,
        role: template.verifierRoleIds,
        version: template.version,
        description: template.description,
      });

      try {
        const payload = JSON.parse(template.payload);
        const transformedSchemas = payload.data.map(schema => ({
          name: schema.schemaName,
          schemas: [{
            schemaId: schema.schema,
            schemaName: schema.schemaName,
            version: "1.0.0",
            attributes: [],
            attributeNames: schema.names
          }]
        }));
        setSchemas(transformedSchemas);
      } catch (e) {
        console.error("Error parsing template payload:", e);
        setSchemas([]);
      }
      setEditingTemplateId(template.id);
    } else {
      reset({
        template_name: "",
        template_id: "",
        role: [],
        version: "1.0.0",
        description: "",
      });
      setSchemas([]);
      setEditingTemplateId(null);
    }
    setIsMainModalOpen(true);
  };

  const closeMainModal = () => {
    setIsMainModalOpen(false);
    setViewMode(false);
  };

  const openSchemaModal = () => {
    setIsSchemaModalOpen(true);
  };

  const closeSchemaModal = () => {
    setIsSchemaModalOpen(false);
  };

  const saveSchema = (schemaData) => {
    setSchemas([...schemas, schemaData]);
  };

  const deleteSchemaRow = (index) => {
    setSchemas(schemas.filter((_, i) => i !== index));
  };

  const openDeleteModal = (template) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTemplate = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/proof-templates/${templateToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete template: ${errorText}`);
      }

      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      playSound("/sounds/success.mp3");
      toast.success("Template deleted successfully!");
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  const onSubmit = async (data) => {
    if (viewMode) return;
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const payloadData = schemas.flatMap(schemaGroup => 
        schemaGroup.schemas.map(schema => ({
          schemaName: schema.schemaName,
          names: schema.attributeNames,
          schema: schema.schemaId
        }))
      );

      const payload = {
        templateId: data.template_id,
        name: data.template_name,
        description: data.description,
        version: data.version,
        payload: {
          type: "dif",
          data: payloadData
        },
        verifierRoleIds: data.role.map(Number),
      };

      const url = editingTemplateId !== null
        ? `${base_api_url}/mobile-verifier/v1/proof-templates/${editingTemplateId}`
        : `${base_api_url}/mobile-verifier/v1/proof-template`;
      const method = editingTemplateId !== null ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save template: ${errorText}`);
      }

      const result = await response.json();
      playSound("/sounds/success.mp3");
      toast.success(result.message || "Template saved successfully");
      await fetchTemplates();
      setIsMainModalOpen(false);
    } catch (error) {
      playSound("/sounds/failure.mp3");
      toast.error(error.message);
    }
  };

  const columns = [
    { 
      header: "Template ID", 
      accessorKey: "templateId",
      cell: (info) => info.getValue()
    },
    { 
      header: "Template Name", 
      accessorKey: "name",
      cell: (info) => info.getValue()
    },
    { 
      header: "Version", 
      accessorKey: "version",
      cell: (info) => info.getValue()
    },
    { 
      header: "Description", 
      accessorKey: "description",
      cell: (info) => info.getValue()
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex justify-start gap-4 px-1">
          <button
            className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium"
            onClick={() => openMainModal(row.original, true)}
          >
            <Eye size={16} className="mr-1" />
            View
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Search and Add */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Templates</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search templates..."
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
          onClick={() => openMainModal()}
        >
          <Plus size={16} className="mr-1" />
          Add New Template
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center pt-4 text-gray-500">Loading Templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No Templates found</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <TableComponent
            columns={columns}
            data={templates}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      )}

      {/* Main Modal */}
      {isMainModalOpen && (
        <MainModal
          isOpen={isMainModalOpen}
          onClose={closeMainModal}
          onSubmit={onSubmit}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          schemas={schemas}
          openSchemaModal={openSchemaModal}
          deleteSchemaRow={deleteSchemaRow}
          roles={roles}
          isEditing={editingTemplateId !== null}
          viewMode={viewMode}
        />
      )}

      {/* Schema Modal */}
      {isSchemaModalOpen && (
        <AddSchemaModal
          isOpen={isSchemaModalOpen}
          onClose={closeSchemaModal}
          saveSchema={saveSchema}
          existingSchemas={schemas}
          viewMode={viewMode}
        />
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
                Are you sure you want to delete <span className="font-medium">{templateToDelete?.name}</span>? This action cannot be undone.
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
                  onClick={handleDeleteTemplate}
                >
                  Delete
                </button>*/}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofTemplate;