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

  // Reset state when modal closes
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

  // Debounced search function
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

  // Get all existing attribute names across all schemas
  const getAllExistingAttributeNames = () => {
    const allAttributes = [];
    existingSchemas.forEach(group => {
      group.schemas.forEach(schema => {
        allAttributes.push(...schema.attributeNames);
      });
    });
    return allAttributes;
  };

  // Check if any of the selected attributes already exist in the template
  const hasDuplicateAttributes = (attributes) => {
    const existingAttributes = getAllExistingAttributeNames();
    return attributes.some(attr => existingAttributes.includes(attr));
  };

  // Fetch autocomplete results
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

  // Fetch schema details when an option is selected
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

  // Handle attribute selection - modified for multiple selections
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
    const selectedAttrs = selectedAttributes[item.schemaId];
    if (!selectedAttrs || selectedAttrs.length === 0) {
      toast.warning("Please select at least one attribute");
      return;
    }

    // Check for duplicate attributes
    if (hasDuplicateAttributes(selectedAttrs)) {
      toast.warning("One or more selected attributes already exist in the template");
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
    toast.success(`Added ${selectedAttrs.length} unique attribute(s) to ${item.schemaName}`);
    
    // Clear selection for this schema
    setSelectedAttributes(prev => {
      const newState = {...prev};
      delete newState[item.schemaId];
      return newState;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-semibold mb-4 text-gray-500">Search and Add Schemas</h3>
        
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Search Schemas
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search schemas..."
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedSchema === item ? 'bg-gray-100' : ''}`}
                  onClick={() => {
                    setSelectedSchema(item);
                    fetchSchemaDetails(item);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {schemaDetails.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              Found {schemaDetails.length} schema(s) matching your search
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schemaDetails.map((item, index) => {
                const currentSelectedAttrs = selectedAttributes[item.schemaId] || [];
                const existingAttributes = getAllExistingAttributeNames();
                
                return (
                  <div 
                    key={`${item.schemaId}-${index}`} 
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      selectedSchema === item.schemaName
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:shadow-md hover:border-emerald-400'
                    }`}
                    onClick={() => setSelectedSchema(item.schemaName)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{item.schemaName}</h4>
                        <p className="text-xs text-gray-500 mt-1">Version: {item.version}</p>
                        <p className="text-xs text-wrap text-gray-500 truncate">ID: {item.schemaId}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Attributes:</h5>
                      <div className="flex flex-wrap gap-1">
                        {item.attributeNames.map((attr, idx) => {
                          const isSelected = currentSelectedAttrs.includes(attr);
                          const isHighlighted = attr === highlightedAttribute;
                          const isAdded = existingAttributes.includes(attr);
                          
                          return (
                            <span 
                              key={idx} 
                              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-200 text-emerald-800'
                                  : isAdded
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                    : isHighlighted
                                      ? 'bg-blue-200 text-blue-800'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAdded) {
                                  handleAttributeSelect(item.schemaId, attr);
                                }
                              }}
                              title={isAdded ? "This attribute is already in the template" : ""}
                            >
                              {attr}
                              {isAdded && " ✓"}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <button
                        className={`text-sm font-medium ${
                          currentSelectedAttrs.length > 0
                            ? 'text-emerald-500 hover:text-emerald-700'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(item);
                        }}
                        disabled={currentSelectedAttrs.length === 0}
                      >
                        {currentSelectedAttrs.length > 0
                          ? `+ Add ${currentSelectedAttrs.length} Attribute(s)`
                          : '+ Add to Template'}
                      </button>
                      {currentSelectedAttrs.length > 0 && (
                        <span className="text-xs text-gray-500 block mt-1">
                          {currentSelectedAttrs.length} attribute(s) selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4 text-gray-500">Searching schemas...</div>
        )}
        
        {isFetchingDetails && (
          <div className="text-center py-4 text-gray-500">Loading schema details...</div>
        )}

        {!isLoading && !isFetchingDetails && schemaDetails.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            {searchQuery 
              ? "No schemas found. Try a different search term." 
              : "Search for schemas to display results"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSchemaModal;