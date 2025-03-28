import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import TableComponent from "../components/TableComponent";
import MainModal from "../components/MainModal";
import SchemaModal from "../components/SchemaModal";
import { useAuth } from "../context/AuthContext";

const ProofTemplate = () => {
  // State variables
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemas, setSchemas] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [editingTemplateIndex, setEditingTemplateIndex] = useState(null);
  const [roles, setRoles] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [orgId, setOrgId] = useState("");
  const [organizationRoles, setOrganizationRoles] = useState([]);
  const [selectedOrgRole, setSelectedOrgRole] = useState("");

  // Schema state variables
  const [schemaName, setSchemaName] = useState("");
  const [schemaUrl, setSchemaUrl] = useState("");
  const [schemaFields, setSchemaFields] = useState([]);

  // Auth and navigation
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      template_name: "",
      template_id: "",
      role: [],
      version: "",
      description: "",
      schemas: [],
    },
  });

  // Function to play sound
  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  // Fetch organization-specific templates
  const fetchOrganizationTemplates = async () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    if (!selectedOrgRole || !orgId) {
      toast.error("Please select a role and enter Organization ID");
      return;
    }

    try {
      console.log(`role ${selectedOrgRole} and org ${orgId}`)
      const url = `https://staging.bhutanndi.com/ndi-mobile-verifier/v1/organization/proof-templates?roleId=${encodeURIComponent(selectedOrgRole)}&orgId=${encodeURIComponent(orgId)}`;
      
      console.log(`i am triggered url ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch organization templates: ${errorText}`);
      }

      const result = await response.json();
      console.log("Organization Templates Response:", result);

      if (result.data && Array.isArray(result.data)) {
        setTemplates(result.data);
        playSound("/sounds/success.mp3");
        toast.success("Organization templates fetched successfully");
      } else {
        console.error("Invalid data format:", result);
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      console.error("Error fetching organization templates:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch organization templates");
    }
  };

  // Fetch organization roles
  const fetchOrganizationRoles = async () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      const url = "/api/mobile-verifier/v1/verifier-role";
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch roles: ${errorText}`);
      }

      const result = await response.json();
      console.log("Organization Roles Response:", result);

      if (result.data && Array.isArray(result.data) && result.data.length > 1) {
        const roles = result.data[1];
        setOrganizationRoles(roles);
      } else {
        console.error("Invalid data format:", result);
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      console.error("Error fetching organization roles:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch organization roles");
    }
  };

  // Fetch templates and roles from the backend
  const fetchTemplates = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);

    if (!token) {
      console.error("No token found");
      toast.error("You are not authenticated");
      return;
    }

    try {
      const url = "/api/mobile-verifier/v1/proof-templates";
      console.log("Fetching templates from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch templates: ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.data && Array.isArray(result.data)) {
        setTemplates(result.data);
      } else {
        console.error("Invalid data format:", result);
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch templates");
    }
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);

    if (!token) {
      console.error("No token found");
      toast.error("You are not authenticated");
      return;
    }

    try {
      const url = "/api/mobile-verifier/v1/verifier-role?pageSize=300";
      console.log("Fetching roles from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch roles: ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.data && Array.isArray(result.data) && result.data.length > 1) {
        const roles = result.data[1];
        setRoles(roles);
      } else {
        console.error("Invalid data format:", result);
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      playSound("/sounds/failure.mp3");
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      //fetchTemplates();
     // fetchROles fetches for pip up
     fetchRoles();
     //fetches for pulling role manually
      fetchOrganizationRoles();
    }
  }, [isAuthenticated]);

  // Open main modal for adding or editing a template
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
      setSchemas(JSON.parse(template.payload).data);
      setEditingTemplateIndex(index);
    } else {
      reset({
        template_name: "",
        template_id: "",
        role: [],
        version: "",
        description: "",
      });
      setSchemas([]);
      setEditingTemplateIndex(null);
    }
    setIsMainModalOpen(true);
  };

  // Close main modal
  const closeMainModal = () => {
    setIsMainModalOpen(false);
    reset({
      template_name: "",
      template_id: "",
      role: [],
      version: "",
      description: "",
    });
    setSchemas([]);
    setEditingTemplateIndex(null);
  };

  // Open nested schema modal
  const openSchemaModal = (index = null) => {
    setSchemaName("");
    setSchemaUrl("");
    setSchemaFields([]);
    setIsSchemaModalOpen(true);
  };

  // Close nested schema modal
  const closeSchemaModal = () => {
    setIsSchemaModalOpen(false);
  };

  // Add a new schema field
  const addSchemaField = () => {
    setSchemaFields([...schemaFields, { field: "" }]);
  };

  // Save schema row
  const saveSchemaRow = () => {
    if (!schemaName || !schemaUrl) {
      alert("Please enter Schema Name and Schema URL.");
      return;
    }

    const newSchemaRow = {
      schemaName: schemaName,
      schema: schemaUrl,
      names: schemaFields.map((field) => field.field),
    };

    setSchemas([...schemas, newSchemaRow]);
    closeSchemaModal();
  };

  // Remove a schema row
  const deleteSchemaRow = (index) => {
    setSchemas(schemas.filter((_, i) => i !== index));
  };

  // Handle form submission for saving the proof template
  const onSubmit = async (data) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    const semVerRegex = /^\d+\.\d+\.\d+$/;
    if (!semVerRegex.test(data.version)) {
      toast.error("Version must follow the Semantic Versioning format (e.g., 1.0.0)");
      return;
    }

    const verifierRoleIds = data.role.map((roleId) => Number(roleId));
    if (verifierRoleIds.length === 0) {
      toast.error("At least one role must be selected");
      return;
    }

    const payload = {
      templateId: data.template_id,
      name: data.template_name,
      description: data.description,
      version: data.version,
      payload: {
        type: "dif",
        data: schemas.map((schema) => ({
          schemaName: schema.schemaName,
          names: schema.names,
          schema: schema.schema,
        })),
      },
      verifierRoleIds: verifierRoleIds,
    };

    const url = editingTemplateIndex !== null
      ? `/api/mobile-verifier/v1/proof-templates/${templates[editingTemplateIndex].id}`
      : "/api/mobile-verifier/v1/proof-templates";
    const method = editingTemplateIndex !== null ? "PATCH" : "POST";

    try {
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
        throw new Error(`Failed to ${editingTemplateIndex !== null ? "update" : "add"} template: ${errorText}`);
      }

      const result = await response.json();

      if (editingTemplateIndex !== null) {
        const updatedTemplates = [...templates];
        updatedTemplates[editingTemplateIndex] = result.data.proofTemplate;
        setTemplates(updatedTemplates);
        playSound("/sounds/success.mp3");
        toast.success(result.message || "Template updated successfully");
        setIsMainModalOpen(false);
        reset();
        setTimeout(() => {
          navigate("/dashboard/proof-templates");
        }, 2000);
      } else {
        setTemplates((prevTemplates) => [...prevTemplates, result.data.proofTemplate]);
        playSound("/sounds/success.mp3");
        toast.success(result.message || "Template created successfully");
        setIsMainModalOpen(false);
        reset();
        setTimeout(() => {
          navigate("/dashboard/proof-templates");
        }, 2000);
      }
    } catch (error) {
      console.error(`Error ${editingTemplateIndex !== null ? "updating" : "adding"} template:`, error);
      playSound("/sounds/failure.mp3");
      toast.error(`Failed to ${editingTemplateIndex !== null ? "update" : "add"} template`);
    }
  };

  // Columns for the table
  const columns = [
    { accessorKey: "id", header: "Template ID", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "name", header: "Template Name", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "version", header: "Version", cell: (info) => info.getValue(), enableSorting: true },
    { accessorKey: "description", header: "Description", cell: (info) => info.getValue(), enableSorting: true },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        return (
          <div className="flex justify-end gap-2">
            <button
              className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-green-50 transition-colors"
              onClick={() => openMainModal(info.row.index)}
            >
              Edit
            </button>
          </div>
        );
      },
    },
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

      {/* Organization Templates Section */}
      
      <div className="flex flex-col md:flex-row gap-4 mb-3 py-1">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 mb-1">Select Role</label>
          <select
            value={selectedOrgRole}
            onChange={(e) => setSelectedOrgRole(e.target.value)}
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select a role</option>
            {organizationRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {`${role.id}: ${role.role}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 mb-1">Organization ID</label>
          <input
            type="text"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter Organization ID"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchOrganizationTemplates}
            className="bg-emerald-400 text-white px-6 py-1 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors h-[42px]"
          >
            Get Proof Template
          </button>
        </div>
      </div>

      {/* Search and Add Template Section */}
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
            onClick={() => {
              setIsMainModalOpen(true);
              setEditingTemplateIndex(null);
              reset();
            }}
          >
            Add New Template
          </button>
        </div>
      </div>

      {/* Table Component */}
      {templates.length === 0 ? (
        <p className="text-center pt-4 text-red-400">No templates found/Fetched</p>
      ) : (
        <TableComponent
          columns={columns}
          data={templates}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}

      {/* Modal for Adding/Editing Template */}
      {isMainModalOpen && (
        <MainModal
          isOpen={isMainModalOpen}
          onClose={closeMainModal}
          onSubmit={onSubmit}
          register={register}
          handleSubmit={handleSubmit}
          control={control}
          errors={errors}
          schemas={schemas}
          openSchemaModal={openSchemaModal}
          deleteSchemaRow={deleteSchemaRow}
          roles={roles}
          editingTemplateIndex={editingTemplateIndex}
        />
      )}

      {/* Schema Modal */}
      {isSchemaModalOpen && (
        <SchemaModal
          isOpen={isSchemaModalOpen}
          onClose={closeSchemaModal}
          schemaName={schemaName}
          setSchemaName={setSchemaName}
          schemaUrl={schemaUrl}
          setSchemaUrl={setSchemaUrl}
          schemaFields={schemaFields}
          setSchemaFields={setSchemaFields}
          saveSchemaRow={saveSchemaRow}
          addSchemaField={addSchemaField}
        />
      )}
    </div>
  );
};

export default ProofTemplate;