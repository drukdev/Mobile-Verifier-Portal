import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, Plus, Trash2, ChevronDown, Check, AlertCircle } from "lucide-react";

const MainModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  handleSubmit,
  errors,
  schemas,
  openSchemaModal,
  deleteSchemaRow,
  roles,
  isEditing,
  viewMode,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const dropdownRef = useRef(null);

  // Group schemas by ID
  const groupedSchemas = useMemo(() => {
    const groupsMap = {}; 
    schemas.forEach((group, groupIndex) => {
      group.schemas.forEach(schema => {
        const id = schema.schemaId;
        if (!groupsMap[id]) {
          groupsMap[id] = {
            ...schema,
            groupIndices: [groupIndex],
            attributeNames: [...schema.attributeNames]
          };
        } else {
          // Merge attributes
          schema.attributeNames.forEach(attr => {
            if (!groupsMap[id].attributeNames.includes(attr)) {
              groupsMap[id].attributeNames.push(attr);
            }
          });
          // Track group indices
          groupsMap[id].groupIndices.push(groupIndex);
        }
      });
    });
    return Object.values(groupsMap);
  }, [schemas]);

  useEffect(() => {
    if (register) {
      const currentRoles = register("role").value || [];
      setSelectedRoles(currentRoles);
    }
  }, [register]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelection = (roleId) => {
    if (viewMode) return;
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleFormSubmit = (data) => {
    if (viewMode) return;
    if (selectedRoles.length === 0) {
      alert("At least one role must be selected");
      return;
    }

    data.role = selectedRoles;
    onSubmit(data);
  };

  const handleDeleteGroup = (schema) => {
    // Sort indices in descending order to prevent index shifting issues
    const indicesToDelete = [...schema.groupIndices].sort((a, b) => b - a);
    indicesToDelete.forEach(index => {
      deleteSchemaRow(index);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-3 text-white ${
          viewMode ? "bg-emerald-600" : isEditing ? "bg-emerald-600" : "bg-emerald-600"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {viewMode 
                ? "View Template" 
                : isEditing 
                  ? "Edit Template" 
                  : "Create Template"}
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
            {/* Basic Information */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
                    Template Name *
                  </label>
                  <input
                    id="templateName"
                    type="text"
                    readOnly={viewMode}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                      viewMode 
                        ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                        : errors.template_name 
                          ? 'border-red-300 focus:ring-red-500 bg-gray-50' 
                          : 'border-gray-200 hover:border-emerald-300 bg-gray-50 focus:bg-white focus:ring-emerald-500'
                    }`}
                    placeholder="Enter template name"
                    {...register("template_name", {
                      required: !viewMode && "Template Name is required"
                    })}
                  />
                  {errors.template_name && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.template_name.message}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">
                    Template ID *
                  </label>
                  <input
                    id="templateId"
                    type="text"
                    readOnly={viewMode}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
                      viewMode 
                        ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                        : errors.template_id 
                          ? 'border-red-300 focus:ring-red-500 bg-gray-50' 
                          : 'border-gray-200 hover:border-emerald-300 bg-gray-50 focus:bg-white focus:ring-emerald-500'
                    }`}
                    placeholder="template_001"
                    {...register("template_id", {
                      required: !viewMode && "Template ID is required"
                    })}
                  />
                  {errors.template_id && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.template_id.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role and Version */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Roles *
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      disabled={viewMode}
                      className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between text-sm ${
                        viewMode 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' 
                          : errors.role 
                            ? 'border-red-300 bg-gray-50' 
                            : 'border-gray-200 hover:border-emerald-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                      }`}
                      onClick={() => !viewMode && setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    >
                      <span className={selectedRoles.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedRoles.length > 0
                          ? `${selectedRoles.length} role${selectedRoles.length > 1 ? 's' : ''} selected`
                          : "Select roles"}
                      </span>
                      {!viewMode && (
                        <ChevronDown
                          size={16}
                          className={`text-gray-400 transition-transform duration-200 ${
                            isRoleDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {isRoleDropdownOpen && !viewMode && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-1">
                          {roles.map((role) => (
                            <div
                              key={role.id}
                              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                              onClick={() => handleRoleSelection(role.id)}
                            >
                                <div className="relative mr-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role.id)}
                                    readOnly
                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 accent-emerald-600"
                                    style={{
                                      accentColor: '#059669'
                                    }}
                                  />
                                  {selectedRoles.includes(role.id) && (
                                    <Check size={12} className="absolute top-0.5 left-0.5 text-white pointer-events-none" />
                                  )}
                                </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{role.role}</span>
                                <span className="text-xs text-gray-500 ml-2">ID: {role.id}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedRoles.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {roles
                          .filter((role) => selectedRoles.includes(role.id))
                          .map((role) => (
                            <span
                              key={role.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                            >
                              {role.role}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {errors.role && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.role.message}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                    Version *
                  </label>
                  <input
                    id="version"
                    type="text"
                    readOnly={viewMode}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
                      viewMode 
                        ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                        : errors.version 
                          ? 'border-red-300 focus:ring-red-500 bg-gray-50' 
                          : 'border-gray-200 hover:border-emerald-300 bg-gray-50 focus:bg-white focus:ring-emerald-500'
                    }`}
                    placeholder="1.0.0"
                    {...register("version", {
                      required: !viewMode && "Version is required",
                      pattern: {
                        value: /^\d+\.\d+\.\d+$/,
                        message: "Version must follow Semantic Versioning (e.g., 1.0.0)",
                      },
                    })}
                  />
                  {errors.version && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.version.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Template Description *
                </label>
                <textarea
                  id="description"
                  rows="3"
                  readOnly={viewMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm ${
                    viewMode 
                      ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                      : errors.description 
                        ? 'border-red-300 focus:ring-red-500 bg-gray-50' 
                        : 'border-gray-200 hover:border-emerald-300 bg-gray-50 focus:bg-white focus:ring-emerald-500'
                  }`}
                  placeholder="Describe the purpose and use case of this proof template..."
                  {...register("description", {
                    required: !viewMode && "Description is required"
                  })}
                />
                {errors.description && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle size={12} className="mr-1" />
                    {errors.description.message}
                  </div>
                )}
              </div>
            </div>

            {/* Schemas */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-gray-800">
                  Schemas
                  {schemas.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {groupedSchemas.reduce((total, group) => total + group.attributeNames.length, 0)}
                    </span>
                  )}
                </h4>
                {!viewMode && (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                    onClick={(e) => { e.preventDefault(); openSchemaModal(); }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Schema
                  </button>
                )}
              </div>

              {groupedSchemas.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Version</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Attributes</th>
                          {!viewMode && (
                            <th className="px-4 py-2 text-center font-medium text-gray-700">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {groupedSchemas.map((schema) => (
                          <tr key={schema.schemaId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2">
                              <div className="font-medium text-gray-900 text-sm">{schema.schemaName}</div>
                            </td>
                            <td className="px-4 py-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
                                {schema.schemaId}
                              </code>
                            </td>
                            <td className="px-2 py-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                v{schema.version}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {schema.attributeNames.slice(0, 3).map((attr, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                    {attr}
                                  </span>
                                ))}
                                {schema.attributeNames.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                                    +{schema.attributeNames.length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>
                            {!viewMode && (
                              <td className="px-4 py-2 text-center">
                                <button
                                  type="button"
                                  className="inline-flex items-center p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  onClick={() => handleDeleteGroup(schema)}
                                  title="Remove all instances of this schema"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  className={`text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 transition-colors ${
                    !viewMode ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={!viewMode ? (e) => { e.preventDefault(); openSchemaModal(); } : undefined}
                >
                  <div className="text-emerald-600 mb-2">
                    <Plus size={32} className="mx-auto" />
                  </div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">No schemas added yet</h5>
                  <p className="text-xs text-gray-500">Add schemas to define the structure</p>
                </div>
              )}
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              onClick={onClose}
            >
              {viewMode ? "Close" : "Cancel"}
            </button>
            {!viewMode && (
              <button
                type="submit"
                form="main-form"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                onClick={handleSubmit(handleFormSubmit)}
              >
                {isEditing ? "Update" : "Create Template"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainModal;