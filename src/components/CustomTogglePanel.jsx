import React from "react";

const CustomTogglePanel = ({ title, items, onToggle, onClose }) => {
  return (
    <div className="absolute top-full right-0 mt-2 p-4 bg-white border border-darkPurple-300 rounded-lg shadow-xl z-50 text-darkPurple-900 animate-fade-in-down min-w-[200px]">
      <h3 className="font-bold text-lg mb-3 border-b border-darkPurple-200 pb-2">
        {title}
      </h3>
      <div className="flex flex-col space-y-2">
        {items.map((item) => (
          <label
            key={item.key || item.label}
            className="inline-flex items-center cursor-pointer hover:text-darkPurple-700 transition-colors"
          >
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-darkPurple-500 rounded focus:ring-darkPurple-400 transition duration-150 ease-in-out border-darkPurple-300 checked:bg-darkPurple-500 checked:border-darkPurple-500"
              checked={item.isVisible}
              onChange={() => onToggle(item.key || item.label)} // Use key for filters, label for columns
            />
            <span className="ml-2 font-medium">{item.label}</span>
          </label>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-4 w-full py-2 bg-darkPurple-200 text-darkPurple-900 rounded-lg hover:bg-darkPurple-300 transition-colors font-scifi focus:outline-none focus:ring-2 focus:ring-darkPurple-400"
      >
        Close
      </button>
    </div>
  );
};

export default CustomTogglePanel;
