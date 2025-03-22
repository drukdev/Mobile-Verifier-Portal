// ProofTemplate.jsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableComponent from "../components/TableComponent";
import SearchInput from "../components/SearchInput";
import MainModal from "../components/MainModal";
import SchemaModal from "../components/SchemaModal";

const ProofTemplate = () => {
  // State variables
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemas, setSchemas] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [editingSchemaIndex, setEditingSchemaIndex] = useState(null);
  const [editingTemplateIndex, setEditingTemplateIndex] = useState(null);
  const [roles, setRoles] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Schema state variables
  const [schemaName, setSchemaName] = useState("");
  const [schemaUrl, setSchemaUrl] = useState("");
  const [schemaFields, setSchemaFields] = useState([]);

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
      role: "",
      version: "",
      description: "",
      schemas: [],
    },
  });

  // Fetch templates and roles from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch templates
        const templatesResponse = await fetch("http://127.0.0.1:8000/templates/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);

        // Fetch roles
        const rolesResponse = await fetch("http://127.0.0.1:8000/roles/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Open main modal for adding or editing a template
  const openMainModal = (index = null) => {
    if (index !== null) {
      const template = templates[index];
      reset({
        template_name: template.template_name,
        template_id: template.template_id,
        role: template.role,
        version: template.version,
        description: template.description,
      });
      setSchemas(template.schemas); // Set schemas from the template
      setEditingTemplateIndex(index);
    } else {
      reset({
        template_name: "",
        template_id: "",
        role: "",
        version: "",
        description: "",
      });
      setSchemas([]); // Reset schemas
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
      role: "",
      version: "",
      description: "",
    });
    setSchemas([]); // Reset schemas
    setEditingTemplateIndex(null);
  };

  // Open nested schema modal
  const openSchemaModal = (index = null) => {
    if (index !== null) {
      const schemaRow = schemas[index];
      setSchemaName(schemaRow.name);
      setSchemaUrl(schemaRow.url);
      setSchemaFields(schemaRow.fields);
      setEditingSchemaIndex(index);
    } else {
      setSchemaName("");
      setSchemaUrl("");
      setSchemaFields([]);
      setEditingSchemaIndex(null);
    }
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
      name: schemaName,
      url: schemaUrl,
      fields: schemaFields,
    };

    if (editingSchemaIndex !== null) {
      const updatedSchemas = [...schemas];
      updatedSchemas[editingSchemaIndex] = newSchemaRow;
      setSchemas(updatedSchemas);
    } else {
      setSchemas([...schemas, newSchemaRow]);
    }

    closeSchemaModal();
  };

  // Remove a schema row
  const deleteSchemaRow = (index) => {
    setSchemas(schemas.filter((_, i) => i !== index));
  };

  // Handle form submission for saving the proof template
  const onSubmit = async (data) => {
    const formData = {
      ...data,
      schemas: schemas, // Include schemas in the form data
    };

    console.log("Form Data with Schemas:", formData); // Log form data with schemas

    try {
      const token = localStorage.getItem("jwtToken");
      const url =
        editingTemplateIndex !== null
          ? `http://127.0.0.1:8000/templates/${templates[editingTemplateIndex].id}/`
          : "http://127.0.0.1:8000/templates/";
      const method = editingTemplateIndex !== null ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // Use formData with schemas
      });

      if (!response.ok) {
        const errorData = await response.json(); // Log error response
        console.error("Error Response:", errorData);
        throw new Error("Failed to save template");
      }

      const result = await response.json();
      console.log("Success Response:", result); // Log success response

      if (editingTemplateIndex !== null) {
        // Update existing template
        const updatedTemplates = [...templates];
        updatedTemplates[editingTemplateIndex] = result;
        setTemplates(updatedTemplates);
        toast.success("Template updated successfully!");
      } else {
        // Create new template
        setTemplates([...templates, result]);
        toast.success("Template created successfully!");
      }

      closeMainModal();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template. Please try again.");
    }
  };

  // Delete a template
  const deleteTemplate = async (index) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const templateId = templates[index].id;
      await fetch(`http://127.0.0.1:8000/templates/${templateId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedTemplates = templates.filter((_, i) => i !== index);
      setTemplates(updatedTemplates);
      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template. Please try again.");
    }
  };

  // Define columns for TableComponent
  const columns = [
    {
      header: "Template Name",
      accessorKey: "template_name",
    },
    {
      header: "Template ID",
      accessorKey: "template_id",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Version",
      accessorKey: "version",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Schemas",
      accessorKey: "schemas",
      cell: (info) => (
        <div>
          {info.getValue().map((schemaItem, idx) => (
            <div key={idx} className="mb-2">
              <p>
                <strong>Name:</strong> {schemaItem.name}
              </p>
              <p>
                <strong>URL:</strong> {schemaItem.url}
              </p>
              <p>
                <strong>Fields:</strong>{" "}
                {schemaItem.fields.map((field, i) => (
                  <span key={i}>{field.field}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (info) => (
        <div className="text-center">
          <button
            className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium mr-2 hover:bg-emerald-50 transition-colors"
            onClick={() => openMainModal(info.row.index)}
          >
            Edit
          </button>
          <button
            className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-red-50 transition-colors"
            onClick={() => deleteTemplate(info.row.index)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 mt-4 overflow-x-auto">
      {/* Add the ToastContainer component */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Search Field & Add New Template Button */}
      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search templates..."
        />
        <button
          className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          onClick={() => openMainModal()}
        >
          Add New Proof Template
        </button>
      </div>

      {/* TableComponent */}
      <TableComponent
        columns={columns}
        data={templates}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      {/* Main Modal */}
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

      {/* Schema Modal */}
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
    </div>
  );
};

export default ProofTemplate;