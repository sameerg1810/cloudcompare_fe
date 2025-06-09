import React from "react";
import { REGION_DISPLAY_NAMES } from "../utils/constants"; // Import REGION_DISPLAY_NAMES
import { Link } from "react-router-dom";
const AzureTable = ({
  data,
  loading,
  error,
  visibleColumns,
  compareMode,
  onRowSelection,
  sortConfig,
  selectedVms,
}) => {
  const isNewRecord = (effectiveDate) => {
    if (!effectiveDate) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let recordDate;
    try {
      recordDate = new Date(effectiveDate);
      if (isNaN(recordDate.getTime()) && effectiveDate.includes("-")) {
        const [month, day, year, time] = effectiveDate.split(/[- :]/);
        recordDate = new Date(`${year}-${month}-${day}T${time || "00:00:00"}Z`);
      }
      if (isNaN(recordDate.getTime())) return false;
    } catch (e) {
      return false;
    }
    return recordDate > thirtyDaysAgo;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-darkPurple-100 rounded-lg shadow-inner border border-darkPurple-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-darkPurple-500 mb-4"></div>
        <p className="text-darkPurple-900 font-secondary text-xl">
          Retrieving Azure data... Please wait.
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
          Please check your backend server or network connection.
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
                onClick={() =>
                  header.sortable &&
                  sortConfig.key !== header.key &&
                  onRowSelection({ key: header.key, direction: "asc" })
                }
                title={header.tooltip}
              >
                {header.label}
                {sortConfig.key === header.key && (
                  <span className="ml-1 text-darkPurple-500">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => {
              const itemKey = `${item.regionName || ""}-${item.vmSize || ""}-${
                item.priceType || ""
              }-${item.effectiveDate || ""}`;
              const isSelected = selectedVms.some((v) => v.itemKey === itemKey);
              return (
                <tr
                  key={item._id || itemKey}
                  className={`border-b border-darkPurple-200 last:border-b-0 hover:bg-darkPurple-100 transition-colors duration-200 ${
                    isNewRecord(item.effectiveDate)
                      ? "bg-darkPurple-200/50 border-l-4 border-darkPurple-500"
                      : ""
                  } ${isSelected && compareMode ? "bg-green-100" : ""}`}
                >
                  {compareMode && (
                    <td className="py-2 px-2 text-darkPurple-900 text-xs">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onRowSelection(item)}
                        className="mr-2"
                      />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className="py-2 px-2 text-darkPurple-900 text-xs"
                    >
                      {(() => {
                        switch (col.key) {
                          case "regionName":
                            return (
                              REGION_DISPLAY_NAMES[item.regionName] ||
                              item.regionName ||
                              "N/A"
                            ); // Now defined
                          case "location":
                            return item.location || "N/A";
                          case "vmSize":
                            return (
                              <Link
                                to={`/azure-vm-info/${
                                  item.regionName || "unknown"
                                }/${item.vmSize || "unknown"}`}
                                className="text-darkPurple-500 hover:text-darkPurple-600 hover:underline font-bold transition-colors duration-200"
                                title={`View detailed info for ${
                                  item.vmSize || "N/A"
                                }`}
                              >
                                {item.vmSize || "N/A"}
                              </Link>
                            );
                          case "meterName":
                            return item.meterName || "N/A";
                          case "productName":
                            return item.productName || "N/A";
                          case "skuName":
                            return item.skuName || "N/A";
                          case "priceType":
                            return item.priceType || "N/A";
                          case "priceCategory":
                            return item.priceCategory || "N/A";
                          case "pricePerHour":
                            return item.pricePerHour != null
                              ? new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: item.currency || "USD",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 5,
                                }).format(item.pricePerHour)
                              : "N/A";
                          case "currency":
                            return item.currency || "N/A";
                          case "effectiveDate":
                            try {
                              let date = new Date(item.effectiveDate);
                              if (
                                isNaN(date.getTime()) &&
                                item.effectiveDate.includes("-")
                              ) {
                                const [month, day, year, time] =
                                  item.effectiveDate.split(/[- :]/);
                                date = new Date(
                                  `${year}-${month}-${day}T${
                                    time || "00:00:00"
                                  }Z`,
                                );
                              }
                              return (
                                <>
                                  {isNaN(date.getTime())
                                    ? "N/A"
                                    : date.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                  {isNewRecord(item.effectiveDate) && (
                                    <span className="ml-1 text-darkPurple-700 font-bold text-xxs bg-darkPurple-300 px-1 py-0.5 rounded-full animate-pulse-fade">
                                      NEW!
                                    </span>
                                  )}
                                </>
                              );
                            } catch (e) {
                              return "N/A";
                            }
                          case "unitOfMeasure":
                            return item.unitOfMeasure || "N/A";
                          case "spotEligible":
                            return item.spotEligible === "Yes" ||
                              item.spotEligible === true
                              ? "Yes"
                              : "No";
                          case "productId":
                            return item.productId || "N/A";
                          case "meterId":
                            return item.meterId || "N/A";
                          default:
                            return item[col.key] != null
                              ? item[col.key]
                              : "N/A";
                        }
                      })()}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={visibleColumns.length + (compareMode ? 1 : 0)}
                className="py-8 text-center text-darkPurple-700 text-base"
              >
                <i className="fas fa-search text-3xl mb-3 text-darkPurple-500"></i>
                <p>No data found matching your criteria.</p>
                <p className="text-sm mt-1">
                  Try adjusting your filters or clearing them.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AzureTable;
