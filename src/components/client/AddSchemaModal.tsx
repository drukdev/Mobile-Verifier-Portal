import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const AddSchemaModal = ({ isOpen, onClose, saveSchema, existingSchemas = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [schemaDetails, setSchemaDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [highlightedAttribute, setHighlightedAttribute] = useState(null);

  const base_api_url = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSchemaDetails([]);
      setShowDropdown(false);
      setSelectedAttributes({});
      setSelectedSchema(null);
      setHighlightedAttribute(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchAutoCompleteResults(searchQuery);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getAllExistingAttributeNames = () => {
    const allAttributes = [];
    existingSchemas.forEach(group => {
      group.schemas.forEach(schema => {
        allAttributes.push(...schema.attributeNames);
      });
    });
    return allAttributes;
  };

  const fetchAutoCompleteResults = async (query) => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/typesense/schema/autoComplete?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch autocomplete results");
      }

      const result = await response.json();
      setSearchResults(result.data?.result || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchemaDetails = async (selectedOption) => {
    setIsFetchingDetails(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${base_api_url}/mobile-verifier/v1/typesense/schema/search?q=${encodeURIComponent(selectedOption)}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schema details");
      }

      const result = await response.json();
      if (result.data?.result?.length > 0) {
        const processedSchemas = result.data.result.map(schema => {
          let parsedAttributes = [];
          try {
            parsedAttributes = JSON.parse(schema.attributes);
          } catch (e) {
            console.error("Error parsing attributes:", e);
          }

          return {
            schemaId: schema.schemaId,
            schemaName: schema.schemaName,
            version: schema.version,
            attributes: parsedAttributes,
            attributeNames: schema.attributeNames || []
          };
        });

        setSchemaDetails(processedSchemas);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsFetchingDetails(false);
      setSearchQuery("");
      setShowDropdown(false);
    }
  };

  // Handle attribute selection
  const handleAttributeSelect = (schemaId, attribute) => {
    setSelectedAttributes(prev => {
      const currentAttributes = prev[schemaId] || [];
      if (currentAttributes.includes(attribute)) {
        // Remove attribute if already selected
        return {
          ...prev,
          [schemaId]: currentAttributes.filter(attr => attr !== attribute)
        };
      } else {
        // Check if attribute already exists in the template
        const existingAttributes = getAllExistingAttributeNames();
        if (existingAttributes.includes(attribute)) {
          toast.warning(`Attribute "${attribute}" already exists in the template`);
          return prev;
        }
        // Add attribute if not selected and not duplicate
        return {
          ...prev,
          [schemaId]: [...currentAttributes, attribute]
        };
      }
    });
    setHighlightedAttribute(attribute);
  };

  // Handle card click - add to main model
  const handleCardClick = (item) => {
    const selectedAttrs = selectedAttributes[item.schemaId] || [];
    if (selectedAttrs.length === 0) {
      toast.warning("Please select at least one attribute");
      return;
    }

    // Check if any selected attributes already exist
    const existingAttributes = getAllExistingAttributeNames();
    const duplicateAttributes = selectedAttrs.filter(attr => 
      existingAttributes.includes(attr)
    );
    if (duplicateAttributes.length > 0) {
      toast.warning(
        `The following attributes already exist: ${duplicateAttributes.join(", ")}`
      );
      return;
    }

    // Filter attributes to only include the selected ones
    const filteredAttributes = item.attributes.filter(attr => 
      selectedAttrs.includes(attr.name)
    );
    const schemaData = {
      name: item.schemaName,
      schemas: [{
        schemaId: item.schemaId,
        schemaName: item.schemaName,
        version: item.version,
        attributes: filteredAttributes,
        attributeNames: selectedAttrs
      }],
    };

    saveSchema(schemaData);
    toast.success(`Added ${selectedAttrs.length} attribute(s) from ${item.schemaName}`);
    // Clear selection for this schema
    setSelectedAttributes(prev => {
      const newState = {...prev};
      delete newState[item.schemaId];
      return newState;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-3 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Schemas</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search Section */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search and select Schemas to use
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search schemas..."
                  className="w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-all duration-200 text-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors text-sm ${
                        selectedSchema === item ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedSchema(item);
                        fetchSchemaDetails(item);
                      }}
                    >
                      <span className="text-gray-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="p-3">
            {isFetchingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading schema details...</p>
                </div>
              </div>
            ) : schemaDetails.length > 0 ? (
              <div>
                <div className="flex items-center justify-around mb-1">
                  <h6 className="text-sm font-semibold text-gray-800">
                    Found {schemaDetails.length} schema{schemaDetails.length !== 1 ? 's' : ''}
                  </h6>
                  <div className="text-sm text-gray-900">
                    Click attributes to select, then add to template
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {schemaDetails.map((item, index) => {
                    const currentSelectedAttrs = selectedAttributes[item.schemaId] || [];
                    const existingAttributes = getAllExistingAttributeNames();
                    return (
                      <div
                        key={`${item.schemaId}-${index}`} 
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between p-1 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <h6 className="font-semibold text-gray-900 text-sm " title={item.schemaName}>
                            {item.schemaName}
                          </h6>
                          <span className="bg-emerald-100 text-emerald-800 px-1 py-1 rounded-full text-xs">
                              {item.version}
                            </span>
                        </div>
                        <div className="mt-1 p-2 text-xs text-gray-500">
                            <span className="flex-wrap max-w-32" title={item.schemaId}>
                              <b className="text-black">ID</b>: {item.schemaId}
                            </span>
                          </div>
                        {/* Attributes Section */}
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <h6 className="text-sm font-semibold text-gray-700">
                              Attributes ({item.attributeNames.length})
                            </h6>
                            {currentSelectedAttrs.length > 0 && (
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                {currentSelectedAttrs.length} selected
                              </span>
                            )}
                          </div>
                          <div className="max-h-32 overflow-y-auto mb-4">
                            <div className="flex flex-wrap gap-1">
                              {item.attributeNames.map((attr, idx) => {
                                const isSelected = currentSelectedAttrs.includes(attr);
                                const isHighlighted = attr === highlightedAttribute;
                                const isAdded = existingAttributes.includes(attr);
                                return (
                                  <button
                                    key={idx} 
                                    className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-medium ${
                                      isSelected
                                        ? 'bg-emerald-500 text-white shadow-sm transform scale-105'
                                        : isAdded
                                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                          : isHighlighted
                                            ? 'bg-emerald-200 text-emerald-800 shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isAdded) {
                                        handleAttributeSelect(item.schemaId, attr);
                                      }
                                    }}
                                    disabled={isAdded}
                                    title={isAdded ? "This attribute is already in the template" : "Click to select/deselect"}
                                  >
                                    {attr}
                                    {isAdded && (
                                      <span className="ml-1">✓</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Add Button */}
                          <button
                            className={`w-full py-2 px-3 rounded-md font-medium transition-all duration-200 text-sm ${
                              currentSelectedAttrs.length > 0
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transform hover:scale-[1.02]'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(item);
                            }}
                            disabled={currentSelectedAttrs.length === 0}
                          >
                            {currentSelectedAttrs.length > 0
                              ? `Add ${currentSelectedAttrs.length} Attribute${currentSelectedAttrs.length !== 1 ? 's' : ''}`
                              : 'Select attributes to add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? "No schemas found" : "Search to get started"}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search terms or check the spelling." 
                      : "Enter a search term above to find and add schemas to your template."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSchemaModal;