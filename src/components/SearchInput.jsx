const SearchInput = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 hover:border-green-500 transition duration-200 text-sm"
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍 {/* You can use an icon from react-icons instead */}
      </span>
    </div>
  );
};

export default SearchInput;