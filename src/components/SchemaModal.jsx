import React from "react";

const SchemaModal = ({
  isOpen,
  onClose,
  schemaName,
  setSchemaName,
  schemaUrl,
  setSchemaUrl,
  schemaFields,
  setSchemaFields,
  saveSchemaRow,
  addSchemaField,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl">
        <h3 className="text-xl font-semibold mb-4">Add Schema</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="schemaName" className="block text-sm font-medium text-gray-700 mb-2">
              Schema Name
            </label>
            <input
              id="schemaName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
              placeholder="Schema URL"
              value={schemaUrl}
              onChange={(e) => setSchemaUrl(e.target.value)}
            />
          </div>
        </div>
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400 transition duration-200"
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
            className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4 hover:bg-emerald-600 transition-colors"
            onClick={addSchemaField}
          >
            Insert Attributes
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            onClick={saveSchemaRow}
          >
            Save Schema
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaModal;