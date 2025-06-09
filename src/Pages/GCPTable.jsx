import React from "react";

const GCPTable = ({
  data,
  loading,
  error,
  visibleColumns,
  compareMode,
  onRowSelection,
  sortConfig,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-darkPurple-100 rounded-lg shadow-inner border border-darkPurple-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-darkPurple-500 mb-4"></div>
        <p className="text-darkPurple-900 font-secondary text-xl">
          Retrieving GCP data... Please wait.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-100/50 rounded-lg shadow-inner border border-red-500 text-red-700">
        <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
        <p className="font-secondary text-xl text-center">Error: {error}</p>
        <p className="text-sm mt-2 text-red-600">
          This provider is not yet supported.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-xl border border-darkPurple-300">
      <table className="min-w-full table-auto bg-darkPurple-50">
        <thead>
          <tr className="bg-darkPurple-200 border-b border-darkPurple-300 text-darkPurple-900 uppercase text-xxs">
            {compareMode && (
              <th className="py-2 px-2 text-left font-scifi whitespace-nowrap text-shadow-glow">
                Select
              </th>
            )}
            {visibleColumns.map((header) => (
              <th
                key={header.key}
                className={`py-2 px-2 text-left font-scifi whitespace-nowrap text-shadow-glow ${
                  header.sortable
                    ? "cursor-pointer hover:bg-darkPurple-300 transition-colors duration-200"
                    : ""
                }`}
                title={header.tooltip}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr
                key={item.id || Math.random().toString(36).substr(2, 9)}
                className="border-b border-darkPurple-200 last:border-b-0 hover:bg-darkPurple-100"
              >
                {compareMode && (
                  <td className="py-2 px-2 text-darkPurple-900 text-xs">
                    <input type="checkbox" className="mr-2" />
                  </td>
                )}
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className="py-2 px-2 text-darkPurple-900 text-xs"
                  >
                    {item[col.key] || "N/A"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={visibleColumns.length + (compareMode ? 1 : 0)}
                className="py-8 text-center text-darkPurple-700 text-base"
              >
                <i className="fas fa-search text-3xl mb-3 text-darkPurple-500"></i>
                <p>No data found matching your criteria.</p>
                <p className="text-sm mt-1">
                  This provider is not yet supported.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GCPTable;
