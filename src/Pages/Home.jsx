import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomTogglePanel from "../components/CustomTogglePanel";

// --- Data Mapping & Constants ---

const REGION_DISPLAY_NAMES = {
  indonesiacentral: "Indonesia Central",
  uaenorth: "UAE North",
  switzerlandnorth: "Switzerland North",
  israelcentral: "Israel Central",
  francecentral: "France Central",
  chilecentral: "Chile Central",
  germanywestcentral: "Germany West Central",
  mexicocentral: "Mexico Central",
  eastasia: "East Asia",
  southeastasia: "Southeast Asia",
  brazilsouth: "Brazil South",
  uswest: "US West",
  canadacentral: "Canada Central",
  westus: "West US",
  centralus: "Central US", // Default region
  northeurope: "North Europe",
  italynorth: "Italy North",
  swedencentral: "Sweden Central",
  westindia: "West India",
};

const AZURE_REGIONS = Object.keys(REGION_DISPLAY_NAMES);
const AZURE_PRICING_TYPES = [
  "Consumption",
  "Reservation",
  "DevTestConsumption",
];

// --- UPDATED CONFIGURATIONS FOR FILTERS AND COLUMNS ---
const ALL_FILTERS_CONFIG = [
  {
    key: "region",
    label: "Region",
    type: "select",
    options: AZURE_REGIONS,
    default: "centralus",
    tooltip: "Where your VM is located.",
    isVisible: true,
  },
  {
    key: "vmSizeSearch",
    label: "VM Size (Search)",
    type: "text",
    default: "",
    tooltip: "e.g., Standard_D2a_v4",
    isVisible: true,
  },
  {
    key: "priceType",
    label: "Pricing Type",
    type: "select",
    options: AZURE_PRICING_TYPES,
    default: "Consumption",
    tooltip: "How you pay for the VM.",
    isVisible: true,
  },

  // These filters are hidden by default
  {
    key: "spot",
    label: "Spot Eligible?",
    type: "select",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
    default: "",
    tooltip: "Can this be a spot instance?",
    isVisible: false,
  },
  {
    key: "minPrice",
    label: "Min Price/Hour (USD)",
    type: "number",
    default: "",
    tooltip: "Minimum hourly price.",
    isVisible: false,
  },
  {
    key: "maxPrice",
    label: "Max Price/Hour (USD)",
    type: "number",
    default: "",
    tooltip: "Maximum hourly price.",
    isVisible: false,
  },
  {
    key: "effectiveAfter",
    label: "Effective After",
    type: "date",
    default: "",
    tooltip: "Prices valid from this date.",
    isVisible: false,
  },
  {
    key: "effectiveBefore",
    label: "Effective Before",
    type: "date",
    default: "",
    tooltip: "Prices valid up to this date.",
    isVisible: false,
  },
];

const ALL_COLUMNS_CONFIG = [
  {
    label: "Region",
    key: "regionName",
    sortable: true,
    tooltip: "Geographical region of the VM.",
  },
  {
    label: "Location",
    key: "location",
    sortable: true,
    tooltip: "Specific datacenter location within the region.",
  }, // New
  {
    label: "VM Size",
    key: "vmSize",
    sortable: true,
    tooltip:
      "Specific model and configuration of the VM. Click to view details.",
  },
  {
    label: "API Name",
    key: "meterName",
    sortable: true,
    tooltip: "Backend identifier for the service meter.",
  },
  {
    label: "Product Name",
    key: "productName",
    sortable: true,
    tooltip: "The general product offering name.",
  }, // New
  {
    label: "SKU Name",
    key: "skuName",
    sortable: true,
    tooltip: "The Stock Keeping Unit name for the specific offering.",
  }, // New
  {
    label: "Pricing Type",
    key: "priceType",
    sortable: true,
    tooltip: "How the VM is billed (e.g., Consumption, Reservation).",
  },
  {
    label: "Price Category",
    key: "priceCategory",
    sortable: true,
    tooltip: "The specific category used for pricing, if applicable.",
  }, // New
  {
    label: "Price/Hour (USD)",
    key: "pricePerHour",
    sortable: true,
    tooltip: "Estimated cost per hour in USD.",
  },
  {
    label: "Currency",
    key: "currency",
    sortable: true,
    tooltip: "The currency in which the price is listed.",
  }, // New
  {
    label: "Effective Date",
    key: "effectiveDate",
    sortable: true,
    tooltip: "Date from which this price became active.",
  },
  {
    label: "Unit of Measure",
    key: "unitOfMeasure",
    sortable: true,
    tooltip: "The unit by which the service is measured (e.g., 1 Hour).",
  }, // New
  {
    label: "Spot Eligible",
    key: "spotEligible",
    sortable: true,
    tooltip: "Indicates if this VM type can be a spot instance.",
  },
  {
    label: "Product ID",
    key: "productId",
    sortable: true,
    tooltip: "Unique identifier for the product offering.",
  }, // New
  {
    label: "Meter ID",
    key: "meterId",
    sortable: true,
    tooltip: "Unique identifier for the specific meter of the service.",
  }, // New
];

const Clouddata = () => {
  const [vmData, setVmData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Helper to get initial default filters (from ALL_FILTERS_CONFIG)
  const getInitialFiltersState = useCallback(() => {
    const initial = {};
    ALL_FILTERS_CONFIG.forEach((filter) => {
      initial[filter.key] = filter.default;
    });
    return initial;
  }, []); // Empty dependency array means this function is created once

  const [filters, setFilters] = useState(getInitialFiltersState());

  // State for filter and column visibility
  // Initialize with the isVisible property from ALL_FILTERS_CONFIG/ALL_COLUMNS_CONFIG
  const [visibleFiltersConfig, setVisibleFiltersConfig] = useState(
    ALL_FILTERS_CONFIG.map((f) => ({ ...f, isVisible: f.isVisible })),
  );
  const [visibleColumnsConfig, setVisibleColumnsConfig] = useState(
    ALL_COLUMNS_CONFIG.map((c) => ({ ...c, isVisible: true })), // All columns are visible by default
  );

  const [showFilterCustomization, setShowFilterCustomization] = useState(false);
  const [showColumnCustomization, setShowColumnCustomization] = useState(false);

  // Ref to measure header height for sticky positioning
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []); // Calculate on mount

  const fetchAzurePrices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...(filters.region && { region: filters.region }),
        ...(filters.vmSizeSearch && { vmSize: filters.vmSizeSearch }),
        ...(filters.priceType && { priceType: filters.priceType }),
        ...(filters.spot !== "" && { spot: filters.spot === "true" }),
        ...(filters.minPrice && { minPrice: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: parseFloat(filters.maxPrice) }),
        ...(filters.effectiveAfter && {
          effectiveAfter: filters.effectiveAfter,
        }),
        ...(filters.effectiveBefore && {
          effectiveBefore: filters.effectiveBefore,
        }),
      };

      console.log("Fetching Azure VM prices with params:", params);
      const response = await axios.get(
        "http://localhost:3000/api/azureretailjune/prices",
        {
          params,
        },
      );
      console.log("Azure API Response:", response.data);

      const fetchedItems = response.data.data || [];

      setVmData(fetchedItems);
      setPagination((prev) => ({
        ...prev,
        page: 1, // Reset to page 1 on new data fetch
        totalCount: fetchedItems.length, // Total count based on filtered data from backend
      }));
    } catch (err) {
      console.error(
        "Error fetching Azure VM data:",
        err.response?.data || err.message,
      );
      setError(
        "Failed to fetch Azure VM data. Please try again. " +
          (err.response?.data?.message || err.message),
      );
      setVmData([]);
      setPagination((prev) => ({ ...prev, page: 1, totalCount: 0 }));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAzurePrices();
  }, [fetchAzurePrices]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters(getInitialFiltersState()); // Reset to initial defaults
    setSortConfig({ key: null, direction: "asc" }); // Reset sorting
    // Also reset visible filters/columns to their initial visible state as defined in config
    setVisibleFiltersConfig(
      ALL_FILTERS_CONFIG.map((f) => ({ ...f, isVisible: f.isVisible })),
    );
    setVisibleColumnsConfig(
      ALL_COLUMNS_CONFIG.map((c) => ({ ...c, isVisible: true })),
    ); // All remaining columns visible
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleFilterVisibility = (filterKey) => {
    setVisibleFiltersConfig((prev) =>
      prev.map((filter) =>
        filter.key === filterKey
          ? { ...filter, isVisible: !filter.isVisible }
          : filter,
      ),
    );
  };

  const toggleColumnVisibility = (columnLabel) => {
    setVisibleColumnsConfig((prev) =>
      prev.map((column) =>
        column.label === columnLabel
          ? { ...column, isVisible: !column.isVisible }
          : column,
      ),
    );
  };

  const getClientFilteredAndSortedData = () => {
    let currentData = [...vmData];

    // Apply sorting
    if (sortConfig.key) {
      currentData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return currentData;
  };

  const clientFilteredAndSortedData = getClientFilteredAndSortedData();
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalCount: clientFilteredAndSortedData.length,
    }));
  }, [clientFilteredAndSortedData.length]);

  const totalPages = Math.ceil(pagination.totalCount / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const displayedData = clientFilteredAndSortedData.slice(startIndex, endIndex);

  // Helper to determine if a record is "new" (effectiveDate within last 30 days)
  const isNewRecord = (effectiveDate) => {
    if (!effectiveDate) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recordDate;
    try {
      recordDate = new Date(effectiveDate);
      if (isNaN(recordDate.getTime()) && effectiveDate.includes("-")) {
        const [datePart, timePart] = effectiveDate.split(" ");
        const [month, day, year] = datePart.split("-");
        recordDate = new Date(
          `${year}-${month}-${day}T${timePart || "00:00:00"}Z`,
        );
      }
      if (isNaN(recordDate.getTime())) {
        console.warn("Could not parse effectiveDate:", effectiveDate);
        return false;
      }
    } catch (e) {
      console.warn("Error parsing effectiveDate:", effectiveDate, e);
      return false;
    }

    // Current date is June 7, 2025. 30 days ago is May 8, 2025.
    // "02-01-2025" (February 1, 2025) is NOT within the last 30 days.
    return recordDate > thirtyDaysAgo;
  };

  // Filter out non-visible columns for dynamic rendering
  const currentVisibleColumns = ALL_COLUMNS_CONFIG.filter(
    (col) => visibleColumnsConfig.find((vc) => vc.key === col.key)?.isVisible,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkPurple-50 to-darkPurple-100 text-darkPurple-900 font-secondary flex flex-col">
      {/* Top Header/Navigation Bar */}
      <header
        ref={headerRef}
        className="bg-darkPurple-50 p-4 border-b border-darkPurple-300 shadow-lg flex justify-between items-center z-20 sticky top-0 backdrop-blur-sm bg-opacity-90"
      >
        <div className="flex items-center space-x-4">
          {/* Logo Placeholder */}
          <div className="text-4xl text-darkPurple-500 animate-pulse">
            <i className="fas fa-cloud"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="font-scifi text-3xl text-darkPurple-800 tracking-wide text-shadow-glow">
              Cloud Price Nexus
            </h1>
            <p className="text-xs text-darkPurple-600 font-secondary mt-1">
              Real-time Insights from Cloud as a service
            </p>
          </div>
        </div>

        {/* Simplified Provider & Service Tabs */}
        <nav className="flex space-x-2 border-2 border-darkPurple-300 rounded-lg p-1 bg-darkPurple-100 shadow-inner transition-colors duration-300">
          <button className="px-4 py-2 font-scifi text-white bg-darkPurple-500 rounded-lg shadow-inner transition-all duration-300 hover:scale-105 hover:bg-darkPurple-600 focus:outline-none focus:ring-2 focus:ring-darkPurple-400">
            Azure
          </button>
          <button className="px-4 py-2 font-scifi text-darkPurple-900 bg-darkPurple-200 rounded-lg shadow-inner transition-all duration-300 hover:scale-105 hover:bg-darkPurple-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-400">
            VM
          </button>
        </nav>

        {/* Right-aligned items */}
        <div className="flex items-center space-x-6">
          <p className="text-darkPurple-700 text-sm hidden lg:block animate-fade-in">
            New data available!{" "}
            <a
              href="#"
              className="underline text-darkPurple-500 hover:text-darkPurple-600 transition-colors"
            >
              See what's updated.
            </a>
          </p>
          <button
            title="Connect via Slack"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-darkPurple-400 p-2 rounded-full"
          >
            <i className="fab fa-slack fa-lg"></i>
          </button>
          <button
            title="Star our project"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-darkPurple-400 p-2 rounded-full"
          >
            <i className="fas fa-star fa-lg"></i>
          </button>
        </div>
      </header>

      {/* Filter Bar (Sticky) */}
      <div
        className="p-6 bg-darkPurple-100 border-b border-darkPurple-300 shadow-md flex-shrink-0 z-10 sticky"
        style={{ top: headerHeight }}
      >
        <h2 className="text-xl font-scifi text-darkPurple-800 mb-5 text-shadow-glow">
          Filter Azure Virtual Machines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-4">
          {/* Dynamically render filters based on visibility */}
          {visibleFiltersConfig.map(
            (filterConfig) =>
              filterConfig.isVisible && (
                <div key={filterConfig.key}>
                  <label className="block text-darkPurple-900 text-sm font-bold mb-2">
                    {filterConfig.label}
                    <p className="text-xs text-darkPurple-700 font-normal mt-0.5">
                      {filterConfig.tooltip}
                    </p>
                  </label>
                  {filterConfig.type === "select" ? (
                    <select
                      value={filters[filterConfig.key]}
                      onChange={(e) =>
                        handleFilterChange(filterConfig.key, e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg bg-darkPurple-50 text-darkPurple-900 border border-darkPurple-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-500 transition-all duration-200 custom-select"
                      title={filterConfig.tooltip}
                    >
                      <option value="">
                        {filterConfig.label.includes("?")
                          ? "Any"
                          : `All ${filterConfig.label.split("(")[0].trim()}s`}
                      </option>
                      {filterConfig.options.map((option) => (
                        <option
                          key={option.value || option}
                          value={option.value || option}
                        >
                          {option.label ||
                            REGION_DISPLAY_NAMES[option] ||
                            option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // For text, number, date inputs
                    <input
                      type={filterConfig.type}
                      step={
                        filterConfig.type === "number" ? "0.0001" : undefined
                      }
                      value={filters[filterConfig.key]}
                      onChange={(e) =>
                        handleFilterChange(filterConfig.key, e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg bg-darkPurple-50 text-darkPurple-900 border border-darkPurple-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-500 transition-all duration-200"
                      placeholder={filterConfig.tooltip.split(". ")[0]} // Use part of tooltip as placeholder
                      title={filterConfig.tooltip}
                    />
                  )}
                </div>
              ),
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={fetchAzurePrices}
            className="px-8 py-3 bg-darkPurple-500 text-white font-scifi rounded-lg hover:bg-darkPurple-600 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 animate-pulse-once"
            title="Apply all selected filters"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-8 py-3 bg-darkPurple-200 text-darkPurple-900 font-scifi rounded-lg hover:bg-darkPurple-300 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105"
            title="Clear all filters"
          >
            Clear Filters
          </button>
          <button
            className="px-8 py-3 bg-darkPurple-400 text-white font-scifi rounded-lg hover:bg-darkPurple-500 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105"
            title="Export current data"
          >
            Export Data
          </button>

          {/* Customize Filter Button */}
          <div className="relative">
            <button
              onClick={() =>
                setShowFilterCustomization(!showFilterCustomization)
              }
              className="px-8 py-3 bg-darkPurple-300 text-darkPurple-900 font-scifi rounded-lg hover:bg-darkPurple-400 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105"
              title="Customize visible filter fields"
            >
              <i className="fas fa-filter mr-2"></i> Customize Filters
            </button>
            {showFilterCustomization && (
              <CustomTogglePanel
                title="Visible Filters"
                items={visibleFiltersConfig}
                onToggle={toggleFilterVisibility}
                onClose={() => setShowFilterCustomization(false)}
              />
            )}
          </div>

          {/* Columns Button */}
          <div className="relative">
            <button
              onClick={() =>
                setShowColumnCustomization(!showColumnCustomization)
              }
              className="px-8 py-3 bg-darkPurple-300 text-darkPurple-900 font-scifi rounded-lg hover:bg-darkPurple-400 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105"
              title="Toggle table columns visibility"
            >
              <i className="fas fa-columns mr-2"></i> Columns
            </button>
            {showColumnCustomization && (
              <CustomTogglePanel
                title="Visible Columns"
                items={visibleColumnsConfig}
                onToggle={toggleColumnVisibility}
                onClose={() => setShowColumnCustomization(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <main className="p-6 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-darkPurple-100 rounded-lg shadow-inner border border-darkPurple-300">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-darkPurple-500 mb-4"></div>
            <p className="text-darkPurple-900 font-secondary text-xl">
              Retrieving Azure VM data... Please wait.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-red-100/50 rounded-lg shadow-inner border border-red-500 text-red-700">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p className="font-secondary text-xl text-center">Error: {error}</p>
            <p className="text-sm mt-2 text-red-600">
              Please check your backend server or network connection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-xl border border-darkPurple-300">
            <table className="min-w-full table-auto bg-darkPurple-50">
              <thead>
                <tr className="bg-darkPurple-200 border-b border-darkPurple-300 text-darkPurple-900 uppercase text-sm">
                  {currentVisibleColumns.map((header) => (
                    <th
                      key={header.key} // Use key for column headers
                      className={`py-3 px-4 text-left font-scifi whitespace-nowrap text-shadow-glow ${
                        header.sortable // Only sortable if 'sortable' is true in config
                          ? "cursor-pointer hover:bg-darkPurple-300 transition-colors duration-200"
                          : ""
                      }`}
                      onClick={() => header.sortable && handleSort(header.key)}
                      title={header.tooltip}
                    >
                      {header.label}
                      {sortConfig.key === header.key && header.sortable && (
                        <span className="ml-1 text-darkPurple-500">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedData.length > 0 ? (
                  displayedData.map((item) => (
                    <tr
                      key={
                        item._id ||
                        `${item.vmSize}-${item.regionName}-${item.priceType}-${item.effectiveDate}`
                      }
                      className={`border-b border-darkPurple-200 last:border-b-0 hover:bg-darkPurple-100 transition-colors duration-200 
                        ${
                          isNewRecord(item.effectiveDate)
                            ? "bg-darkPurple-200/50 border-l-4 border-darkPurple-500"
                            : ""
                        }`}
                    >
                      {/* Dynamically render table cells based on visible columns */}
                      {currentVisibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className="py-3 px-4 text-darkPurple-900"
                        >
                          {/* Special rendering for specific columns */}
                          {col.key === "regionName" ? (
                            REGION_DISPLAY_NAMES[item.regionName] ||
                            item.regionName ||
                            "N/A"
                          ) : col.key === "vmSize" ? (
                            <Link
                              to={`/azure-vm-info/${item.regionName}/${item.vmSize}`}
                              className="text-darkPurple-500 hover:text-darkPurple-600 hover:underline font-bold transition-colors duration-200"
                              title={`View detailed info for ${item.vmSize}`}
                            >
                              {item.vmSize || "N/A"}
                            </Link>
                          ) : col.key === "pricePerHour" ? (
                            item.pricePerHour ? (
                              `$${item.pricePerHour.toFixed(5)}`
                            ) : (
                              "N/A"
                            )
                          ) : col.key === "effectiveDate" ? (
                            <>
                              {item.effectiveDate
                                ? new Date(
                                    item.effectiveDate,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                              {isNewRecord(item.effectiveDate) && (
                                <span className="ml-2 text-darkPurple-700 font-bold text-xs bg-darkPurple-300 px-2 py-1 rounded-full animate-pulse-fade">
                                  NEW!
                                </span>
                              )}
                            </>
                          ) : (
                            // Generic rendering for all other columns (location, meterName, productName, skuName, priceCategory, currency, unitOfMeasure, spotEligible, productId, meterId)
                            item[col.key] || "N/A"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={currentVisibleColumns.length} // Dynamic colSpan based on visible columns
                      className="py-12 text-center text-darkPurple-700 text-xl"
                    >
                      <i className="fas fa-search text-4xl mb-4 text-darkPurple-500"></i>
                      <p>No Azure VMs found matching your criteria.</p>
                      <p className="text-base mt-2">
                        Try adjusting your filters or clearing them.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalCount > 0 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-6 py-2 bg-darkPurple-500 text-white font-scifi rounded-lg hover:bg-darkPurple-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 disabled:hover:scale-100"
              title="Go to previous page"
            >
              <i className="fas fa-arrow-left mr-2"></i> Previous
            </button>
            <span className="text-darkPurple-900 font-secondary text-lg">
              Page{" "}
              <span className="font-bold text-darkPurple-500">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-darkPurple-500">
                {totalPages === 0 ? 1 : totalPages}
              </span>
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages || totalPages === 0}
              className="px-6 py-2 bg-darkPurple-500 text-white font-scifi rounded-lg hover:bg-darkPurple-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 disabled:hover:scale-100"
              title="Go to next page"
            >
              Next <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 bg-darkPurple-100 border-t border-darkPurple-300 shadow-inner text-sm text-darkPurple-700 text-center flex-shrink-0">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="animate-fade-in-slow">
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          <div className="space-x-4">
            <a
              href="#"
              className="hover:underline text-darkPurple-800 transition-colors hover:text-darkPurple-500"
            >
              Docs by Cloud as a service
            </a>
            <a
              href="#"
              className="hover:underline text-darkPurple-800 transition-colors hover:text-darkPurple-500"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="hover:underline text-darkPurple-800 transition-colors hover:text-darkPurple-500"
            >
              Get API Key
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Clouddata;
