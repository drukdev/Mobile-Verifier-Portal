import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TableComponent from "../components/layout/TableComponent";
import MainModal from "../components/client/MainModal";
import AddSchemaModal from "../components/client/AddSchemaModal";

const ProofTemplate = () => {
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemas, setSchemas] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [editingTemplateIndex, setEditingTemplateIndex] = useState(null);
  const [roles, setRoles] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

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
    if (templateName) {
      const firstLetter = templateName.charAt(0).toUpperCase();
      const uuid = crypto.randomUUID().split('-')[0]; // Get first part of UUID
      const suggestedId = `${firstLetter}${uuid}`;
      setValue("template_id", suggestedId);
    }
  }, [templateName, setValue]);

  const base_api_url = import.meta.env.VITE_API_BASE_URL;

  const fetchTemplates = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

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
        throw new Error("Failed to fetch templates");
      }

      const result = await response.json();
      setTemplates(result.data?.[1] || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    const token = localStorage.getItem("authToken");

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
        throw new Error("Failed to fetch roles");
      }

      const result = await response.json();
      setRoles(result.data?.[1] || []);
    } catch (error) {
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

  const openMainModal = (index = null) => {
    if (index !== null) {
      const template = templates[index];
      reset({
        template_name: template.name,
        template_id: template.templateId,
        role: template.verifierRoleIds,
        version: template.version,
        description: template.description,
      });
      
      try {
        const payload = JSON.parse(template.payload);
        // Transform the payload data back to our schema structure
        const transformedSchemas = payload.data.map(schema => ({
          name: schema.schemaName,
          schemas: [{
            schemaId: schema.schema,
            schemaName: schema.schemaName,
            version: "1.0.0", // Default version as it's not in payload
            attributes: [], // Not in payload
            attributeNames: schema.names
          }]
        }));
        setSchemas(transformedSchemas);
      } catch (e) {
        console.error("Error parsing template payload:", e);
        setSchemas([]);
      }
      
      setEditingTemplateIndex(index);
    } else {
      reset({
        template_name: "",
        template_id: "",
        role: [],
        version: "1.0.0",
        description: "",
      });
      setSchemas([]);
      setEditingTemplateIndex(null);
    }
    setIsMainModalOpen(true);
  };

  const closeMainModal = () => {
    setIsMainModalOpen(false);
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

  const onSubmit = async (data) => {
    const token = localStorage.getItem("authToken");

    try {
      // Transform schemas into the required format
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
      console.log("Payload to be sent:", payload);
      const url = editingTemplateIndex !== null
        ? `${base_api_url}/mobile-verifier/v1/proof-templates/${templates[editingTemplateIndex].id}`
        : `${base_api_url}/mobile-verifier/v1/proof-template`;
      const method = editingTemplateIndex !== null ? "PATCH" : "POST";

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
        throw new Error("Failed to save template");
      }

      const result = await response.json();
      toast.success(result.message || "Template saved successfully");
      await fetchTemplates();
      setIsMainModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns = [
    { accessorKey: "templateId", header: "Template ID", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "name", header: "Template Name", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "version", header: "Version", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "description", header: "Description", cell: (info) => info.getValue(), enableSorting: true }
  ];

  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 mb-1">Search Templates</label>
          <div className="relative w-full">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
        <div className="flex items-end">
          <button
            className="bg-emerald-400 text-white px-6 py-1 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors h-[42px]"
            onClick={() => openMainModal()}
          >
            Add New Template
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center pt-8 text-gray-500">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No templates found</p>
      ) : (
        <TableComponent
          columns={columns}
          data={templates}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          onRowClick={(row) => openMainModal(row.index)}
        />
      )}

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
          editingTemplateIndex={editingTemplateIndex}
        />
      )}

      {isSchemaModalOpen && (
        <AddSchemaModal
          isOpen={isSchemaModalOpen}
          onClose={closeSchemaModal}
          saveSchema={saveSchema}
          existingSchemas={schemas}
        />
      )}
    </div>
  );
};

export default ProofTemplate;