import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TableComponent from "../components/TableComponent";
import SearchInput from "../components/SearchInput";

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
            className="text-green-500 border border-green-500 px-2 py-1 rounded text-xs md:text-sm font-medium mr-2 hover:bg-green-50 transition-colors"
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
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
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
      {isMainModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl">
            <h3 className="text-xl font-semibold mb-4">Add/Edit Proof Template</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    id="templateName"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                    placeholder="Template Name"
                    {...register("template_name", { required: "Template Name is required" })}
                  />
                  {errors.template_name && (
                    <p className="text-red-500 text-sm">{errors.template_name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                    Template ID
                  </label>
                  <input
                    id="templateId"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                    placeholder="Template ID"
                    {...register("template_id", { required: "Template ID is required" })}
                  />
                  {errors.template_id && (
                    <p className="text-red-500 text-sm">{errors.template_id.message}</p>
                  )}
                </div>
              </div>
              {/* Role and Version */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <select
                        id="role"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                        {...field}
                      >
                        <option value="">Select a role</option>
                        {roles.map((roleOption) => (
                          <option key={roleOption.id} value={roleOption.name}>
                            {roleOption.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                </div>
                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    id="version"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                    placeholder="Version"
                    {...register("version", { required: "Version is required" })}
                  />
                  {errors.version && (
                    <p className="text-red-500 text-sm">{errors.version.message}</p>
                  )}
                </div>
              </div>
              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                  placeholder="Description"
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>
              {/* Schemas Section */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">Schemas</h4>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Schema Name</th>
                      <th className="border p-2">Schema URL</th>
                      <th className="border p-2">Fields</th>
                      <th className="border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemas.map((schemaItem, index) => (
                      <tr key={index} className="border-b">
                        <td className="border p-2">{schemaItem.name}</td>
                        <td className="border p-2">{schemaItem.url}</td>
                        <td className="border p-2">
                          {schemaItem.fields.map((field, idx) => (
                            <div key={idx}>
                              <p>{field.field}</p>
                            </div>
                          ))}
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            className="text-green-500 border border-green-500 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-green-50 transition-colors"
                            onClick={() => openSchemaModal(index)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-red-50 transition-colors"
                            onClick={() => deleteSchemaRow(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4 hover:bg-green-600 transition-colors"
                  onClick={() => openSchemaModal()}
                >
                  Add Schema
                </button>
              </div>
              {/* Main Modal Footer Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  onClick={closeMainModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nested Schema Modal */}
      {isSchemaModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl">
            <h3 className="text-xl font-semibold mb-4">Add/Edit Schema</h3>
            {/* Schema Name and URL */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="schemaName" className="block text-sm font-medium text-gray-700 mb-2">
                  Schema Name
                </label>
                <input
                  id="schemaName"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                  placeholder="Schema Name"
                  value={schemaName}
                  onChange={(e) => setSchemaName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="schemaUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Schema URL
                </label>
                <input
                  id="schemaUrl"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                  placeholder="Schema URL"
                  value={schemaUrl}
                  onChange={(e) => setSchemaUrl(e.target.value)}
                />
              </div>
            </div>
            {/* Nested Schema Fields */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Schema Fields</h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Field</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaFields.map((field, index) => (
                    <tr key={index} className="border-b">
                      <td className="border p-2">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition duration-200"
                          placeholder="Field"
                          value={field.field}
                          onChange={(e) => {
                            const updatedFields = [...schemaFields];
                            updatedFields[index].field = e.target.value;
                            setSchemaFields(updatedFields);
                          }}
                        />
                      </td>
                      <td className="border p-2 text-center">
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors"
                          onClick={() => {
                            const updatedFields = schemaFields.filter((_, i) => i !== index);
                            setSchemaFields(updatedFields);
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4 hover:bg-green-600 transition-colors"
                onClick={addSchemaField}
              >
                Insert Field
              </button>
            </div>
            {/* Nested Schema Modal Footer Buttons */}
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                onClick={closeSchemaModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                onClick={saveSchemaRow}
              >
                Create Schema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofTemplate;