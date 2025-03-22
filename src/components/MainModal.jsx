// components/MainModal.jsx
import React from "react";
import { useForm, Controller } from "react-hook-form";

const MainModal = ({
  isOpen,
  onClose,
  onSubmit,
  register,
  handleSubmit,
  control,
  errors,
  schemas,
  openSchemaModal,
  deleteSchemaRow,
  roles,
  editingTemplateIndex,
}) => {
  if (!isOpen) return null;

  return (
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400 transition duration-200"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400 transition duration-200"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
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
                        className="text-emerald-400 border border-emerald-400 px-2 py-1 rounded text-xs md:text-sm font-medium hover:bg-emerald-50 transition-colors"
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
              className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4 hover:bg-emerald-600 transition-colors"
              onClick={() => openSchemaModal()}
            >
              Add Schema
            </button>
          </div>
          {/* Main Modal Footer Buttons */}
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainModal;