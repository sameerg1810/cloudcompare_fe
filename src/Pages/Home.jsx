import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Check, RotateCw, Download, Scale } from "lucide-react";
import CustomTogglePanel from "../components/CustomTogglePanel.jsx";
import { AzureDataContext } from "../context/AzureDataContext.jsx";
import ComparedModal from "./ComparedModal.jsx";
import axios from "axios";
import AzureTable from "./AzureTable";
import AWSTable from "./AWSTable";
import GCPTable from "./GCPTable";
import { REGION_DISPLAY_NAMES } from "../utils/constants";

const PROVIDER_CONFIG = {
  azure: {
    pricingTypes: ["Consumption", "Reservation", "DevTestConsumption"],
    fetchData: (fetchAzureData, filters) => fetchAzureData(filters, "prices"),
    initialColumns: [
      {
        label: "Region",
        key: "regionName",
        sortable: true,
        tooltip: "Geographical region.",
      },
      {
        label: "Location",
        key: "location",
        sortable: true,
        tooltip: "Specific datacenter location.",
      },
      {
        label: "Instance Type",
        key: "vmSize",
        sortable: true,
        tooltip: "Specific model of the instance. Click to view details.",
      },
      {
        label: "API Name",
        key: "meterName",
        sortable: true,
        tooltip: "Backend identifier.",
      },
      {
        label: "Product Name",
        key: "productName",
        sortable: true,
        tooltip: "General product offering name.",
      },
      {
        label: "SKU Name",
        key: "skuName",
        sortable: true,
        tooltip: "Stock Keeping Unit name.",
      },
      {
        label: "Pricing Type",
        key: "priceType",
        sortable: true,
        tooltip: "How the instance is billed.",
      },
      {
        label: "Price Category",
        key: "priceCategory",
        sortable: true,
        tooltip: "Category for pricing.",
      },
      {
        label: "Price/Hour (USD)",
        key: "pricePerHour",
        sortable: true,
        tooltip: "Estimated cost per hour.",
      },
      {
        label: "Currency",
        key: "currency",
        sortable: true,
        tooltip: "Currency of the price.",
      },
      {
        label: "Effective Date",
        key: "effectiveDate",
        sortable: true,
        tooltip: "Date price became active.",
      },
      {
        label: "Unit of Measure",
        key: "unitOfMeasure",
        sortable: true,
        tooltip: "Unit of measurement (e.g., 1 Hour).",
      },
      {
        label: "Spot Eligible",
        key: "spotEligible",
        sortable: true,
        tooltip: "Can be a spot instance.",
      },
      {
        label: "Product ID",
        key: "productId",
        sortable: true,
        tooltip: "Unique identifier for product.",
      },
      {
        label: "Meter ID",
        key: "meterId",
        sortable: true,
        tooltip: "Unique identifier for meter.",
      },
    ],
    services: ["pricing"],
  },
  aws: {
    pricingTypes: [],
    fetchData: () => Promise.resolve([]),
    initialColumns: [],
    services: ["ec2", "rds", "elasticache", "redis"],
  },
  gcp: {
    pricingTypes: [],
    fetchData: () => Promise.resolve([]),
    initialColumns: [],
    services: ["computeEngine"],
  },
};

const ALL_FILTERS_CONFIG = [
  {
    key: "region",
    label: "Region",
    type: "select",
    options: [],
    default: "centralus",
    tooltip: "Where your VM is located.",
    dynamicOptions: {
      azure: Object.keys(REGION_DISPLAY_NAMES).map((r) => ({
        value: r,
        label: REGION_DISPLAY_NAMES[r] || r,
      })),
      aws: [{ value: "dummy", label: "Dummy Region" }],
      gcp: [{ value: "dummy", label: "Dummy Region" }],
    },
  },
  {
    key: "vmSizeSearch",
    label: "Instance Type (Search)",
    type: "text",
    default: "",
    tooltip: "e.g., Standard_D2a_v4",
  },
  {
    key: "priceType",
    label: "Pricing Type",
    type: "select",
    options: [],
    default: "Consumption",
    tooltip: "How you pay for the VM.",
    dynamicOptions: {
      azure: PROVIDER_CONFIG.azure.pricingTypes.map((p) => ({
        value: p,
        label: p,
      })),
      aws: [{ value: "dummy", label: "Dummy Pricing" }],
      gcp: [{ value: "dummy", label: "Dummy Pricing" }],
    },
  },
];

const Clouddata = () => {
  const { data, loading, error, fetchAzureData } = useContext(AzureDataContext);
  const [pagination, setPagination] = useState({
    azure: { pricing: { page: 1, limit: 10, totalCount: 0 } },
    aws: {
      ec2: { page: 1, limit: 10, totalCount: 0 },
      rds: { page: 1, limit: 10, totalCount: 0 },
      elasticache: { page: 1, limit: 10, totalCount: 0 },
      redis: { page: 1, limit: 10, totalCount: 0 },
    },
    gcp: { computeEngine: { page: 1, limit: 10, totalCount: 0 } },
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedMainTabIndex, setSelectedMainTabIndex] = useState(0);
  const [selectedSubTabIndex, setSelectedSubTabIndex] = useState({
    azure: 0,
    aws: 0,
    gcp: 0,
  });
  const [filters, setFilters] = useState({
    region: "centralus",
    vmSizeSearch: "",
    priceType: "Consumption",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [visibleColumnsConfig, setVisibleColumnsConfig] = useState(
    PROVIDER_CONFIG.azure.initialColumns.map((c) => ({
      ...c,
      isVisible: true,
    })),
  );
  const [showColumnCustomization, setShowColumnCustomization] = useState(false);
  const [currentProviderName, setCurrentProviderName] = useState("azure");
  const [currentServiceKey, setCurrentServiceKey] = useState("pricing");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVms, setSelectedVms] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [aiComparisonResult, setAIComparisonResult] = useState(null);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  // Debounce filters
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(handler);
  }, [filters]);

  // Update provider and service based on tab selection
  useEffect(() => {
    const provider = ["azure", "aws", "gcp"][selectedMainTabIndex];
    const serviceMaps = PROVIDER_CONFIG[provider].services;
    const service = serviceMaps[selectedSubTabIndex[provider]];
    setCurrentProviderName(provider);
    setCurrentServiceKey(service);
    setVisibleColumnsConfig(
      PROVIDER_CONFIG[provider].initialColumns.map((c) => ({
        ...c,
        isVisible: true,
      })),
    );
  }, [selectedMainTabIndex, selectedSubTabIndex]);

  // Fetch data and dynamically update columns
  useEffect(() => {
    PROVIDER_CONFIG[currentProviderName]
      .fetchData(fetchAzureData, debouncedFilters)
      .then((items) => {
        console.log(
          `Fetched items for ${currentProviderName}/${currentServiceKey}:`,
          items,
        );
        if (items.length > 0) {
          const sampleItem = items[0];
          const availableKeys = Object.keys(sampleItem).filter((key) =>
            PROVIDER_CONFIG[currentProviderName].initialColumns.some(
              (col) => col.key === key,
            ),
          );
          const updatedColumns = PROVIDER_CONFIG[
            currentProviderName
          ].initialColumns
            .filter((col) => availableKeys.includes(col.key))
            .map((col) => ({ ...col, isVisible: true }));
          setVisibleColumnsConfig(updatedColumns);
        }
        setPagination((prev) => ({
          ...prev,
          [currentProviderName]: {
            ...prev[currentProviderName],
            [currentServiceKey]: {
              ...prev[currentProviderName][currentServiceKey],
              page: 1,
              totalCount: items.length,
            },
          },
        }));
      });
  }, [
    fetchAzureData,
    debouncedFilters,
    currentProviderName,
    currentServiceKey,
  ]);

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const clearFilters = () => {
    setFilters({
      region: "centralus",
      vmSizeSearch: "",
      priceType: "Consumption",
    });
    setSortConfig({ key: null, direction: "asc" });
    setVisibleColumnsConfig(
      PROVIDER_CONFIG[currentProviderName].initialColumns.map((c) => ({
        ...c,
        isVisible: true,
      })),
    );
    setSelectedVms([]);
    setCompareMode(false);
    setAIComparisonResult(null);
  };

  const handlePageChange = (newPage) =>
    setPagination((prev) => ({
      ...prev,
      [currentProviderName]: {
        ...prev[currentProviderName],
        [currentServiceKey]: {
          ...prev[currentProviderName][currentServiceKey],
          page: newPage,
        },
      },
    }));

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const toggleColumnVisibility = (columnLabel) =>
    setVisibleColumnsConfig((prev) =>
      prev.map((column) =>
        column.label === columnLabel
          ? { ...column, isVisible: !column.isVisible }
          : column,
      ),
    );

  const getClientFilteredAndSortedData = useMemo(() => {
    const currentData = data[currentProviderName]?.[currentServiceKey] || [];
    console.log(
      `Current data for ${currentProviderName}/${currentServiceKey}:`,
      currentData,
    );
    let filteredData = [...currentData];

    // Apply filters
    if (filters.region) {
      filteredData = filteredData.filter(
        (item) => item.regionName === filters.region,
      );
    }
    if (filters.vmSizeSearch) {
      const searchTerm = filters.vmSizeSearch.toLowerCase();
      filteredData = filteredData.filter((item) =>
        item.vmSize?.toLowerCase().includes(searchTerm),
      );
    }
    if (filters.priceType) {
      filteredData = filteredData.filter(
        (item) => item.priceType === filters.priceType,
      );
    }

    if (!sortConfig.key) return filteredData;
    return filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string")
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      return sortConfig.direction === "asc"
        ? aValue < bValue
          ? -1
          : aValue > bValue
          ? 1
          : 0
        : aValue > bValue
        ? -1
        : aValue < bValue
        ? 1
        : 0;
    });
  }, [data, currentProviderName, currentServiceKey, filters, sortConfig]);

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

  const currentLoadingState = loading[currentProviderName]?.[currentServiceKey];
  const currentErrorState =
    currentProviderName === "azure"
      ? error[currentProviderName]?.[currentServiceKey]
      : currentProviderName === "aws"
      ? "No AWS API available"
      : "No GCP API available";
  const currentPaginationData = pagination[currentProviderName]?.[
    currentServiceKey
  ] || { page: 1, limit: 10, totalCount: 0 };
  const displayedData = getClientFilteredAndSortedData.slice(
    (currentPaginationData.page - 1) * currentPaginationData.limit,
    currentPaginationData.page * currentPaginationData.limit,
  );
  const totalPages = Math.ceil(
    currentPaginationData.totalCount / currentPaginationData.limit,
  );
  const currentVisibleColumns = visibleColumnsConfig.filter(
    (col) => col.isVisible,
  );

  const handleRowSelection = (item) => {
    if (!compareMode) return;
    const itemKey = `${item.regionName || ""}-${item.vmSize || ""}-${
      item.priceType || ""
    }-${item.effectiveDate || ""}`;
    setSelectedVms((prev) => {
      const isSelected = prev.some((v) => v.itemKey === itemKey);
      if (isSelected) {
        return prev.filter((v) => v.itemKey !== itemKey);
      } else {
        return [...prev, { itemKey, ...item, provider: currentProviderName }];
      }
    });
  };

  const handleCompare = () => {
    setCompareMode((prev) => !prev); // Toggle compare mode
  };

  const handleGoCompare = async () => {
    console.log("Selected VMs for comparison:", selectedVms);
    if (selectedVms.length < 2) {
      alert("Please select at least two VMs to compare.");
      return;
    }
    try {
      const vmsForComparison = selectedVms.map((vm) => ({
        region: vm.regionName,
        name: vm.vmSize,
      }));
      console.log("Sending comparison request with:", {
        vms: vmsForComparison,
      });
      const response = await axios.post(
        "http://localhost:3000/api/azurevminfojune/compare",
        { vms: vmsForComparison },
      );
      setComparisonData(response.data);
      setShowModal(true);
    } catch (error) {
      console.error(
        "Error comparing VMs:",
        error.response?.data || error.message,
      );
      alert("Failed to compare VMs. Check console for details.");
    }
  };

  const renderTable = () => {
    switch (currentProviderName) {
      case "azure":
        return (
          <AzureTable
            data={displayedData}
            loading={currentLoadingState}
            error={currentErrorState}
            visibleColumns={currentVisibleColumns}
            compareMode={compareMode}
            onRowSelection={handleRowSelection}
            sortConfig={sortConfig}
            selectedVms={selectedVms}
          />
        );
      case "aws":
        return (
          <AWSTable
            data={[]}
            loading={currentLoadingState}
            error={currentErrorState}
            visibleColumns={[]}
            compareMode={compareMode}
            onRowSelection={() => {}}
            sortConfig={sortConfig}
          />
        );
      case "gcp":
        return (
          <GCPTable
            data={[]}
            loading={currentLoadingState}
            error={currentErrorState}
            visibleColumns={[]}
            compareMode={compareMode}
            onRowSelection={() => {}}
            sortConfig={sortConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkPurple-50 to-darkPurple-100 text-darkPurple-900 font-secondary flex flex-col p-0 m-0">
      <header
        ref={headerRef}
        className="bg-darkPurple-50 px-3 py-2 border-b border-darkPurple-300 shadow-lg flex flex-col sm:flex-row justify-between items-center sticky top-0 backdrop-blur-sm bg-opacity-90"
      >
        <div className="flex items-start w-full sm:w-auto">
          <div className="text-3xl text-darkPurple-500 animate-pulse flex-shrink-0 mt-1">
            <i className="fas fa-cloud"></i>
          </div>
          <div className="flex flex-col ml-2">
            <nav className="flex-shrink-0">
              <Tabs
                selectedIndex={selectedMainTabIndex}
                onSelect={(index) => setSelectedMainTabIndex(index)}
              >
                <TabList className="flex space-x-1 p-0.5 text-sm rounded-none border-0 bg-transparent">
                  {Object.keys(PROVIDER_CONFIG).map((provider, index) => (
                    <Tab
                      key={provider}
                      className={`inline-block px-3 py-1.5 font-scifi rounded-t-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-400
                        ${
                          selectedMainTabIndex === index
                            ? "bg-darkPurple-500 text-white shadow-inner"
                            : "bg-darkPurple-200 text-darkPurple-900 hover:bg-darkPurple-300"
                        }`}
                    >
                      {provider.toUpperCase()}
                    </Tab>
                  ))}
                </TabList>
                {Object.keys(PROVIDER_CONFIG).map((provider, index) => (
                  <TabPanel key={provider}>
                    <nav className="flex-shrink-0 mt-0">
                      <div className="flex space-x-1 p-0.5 text-xs rounded-none border-0 bg-transparent">
                        {PROVIDER_CONFIG[provider].services.map(
                          (service, idx) => (
                            <button
                              key={service}
                              onClick={() =>
                                setSelectedSubTabIndex((prev) => ({
                                  ...prev,
                                  [provider]: idx,
                                }))
                              }
                              className={`inline-block px-2 py-1 font-scifi rounded-b-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-400
                                ${
                                  selectedSubTabIndex[provider] === idx
                                    ? "bg-darkPurple-500 text-white shadow-inner"
                                    : "bg-darkPurple-200 text-darkPurple-900 hover:bg-darkPurple-300"
                                }`}
                            >
                              {provider === "azure"
                                ? "VM"
                                : service.toUpperCase()}{" "}
                              {/* Show "VM" for Azure, otherwise use service name */}
                            </button>
                          ),
                        )}
                      </div>
                    </nav>
                  </TabPanel>
                ))}
              </Tabs>
            </nav>
          </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0 ml-auto mt-2 sm:mt-0">
          <button
            title="Export Data"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-darkPurple-400 p-1.5 rounded-full"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            title="Toggle Compare Mode"
            onClick={handleCompare}
            className={`text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-darkPurple-400 p-1.5 rounded-full ${
              compareMode ? "border-green-500" : "border-red-500"
            }`}
          >
            <Scale className="h-5 w-5 inline mr-1" /> Compare
          </button>
          {compareMode && selectedVms.length >= 2 && (
            <button
              title="Let's Compare"
              onClick={handleGoCompare}
              className="px-3 py-1.5 bg-green-500 text-white font-scifi rounded-lg hover:bg-green-600 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 text-sm"
            >
              Let's Compare
            </button>
          )}
          <button
            title="Connect via Slack"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-darkPurple-400 p-1.5 rounded-full"
          >
            <i className="fab fa-slack fa-lg"></i>
          </button>
          <button
            title="Star our project"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-darkPurple-400 p-1.5 rounded-full"
          >
            <i className="fas fa-star fa-lg"></i>
          </button>
        </div>
      </header>

      {compareMode && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-4 mx-3 rounded flex items-center justify-between">
          <p className="text-sm">You are in compare mode now.</p>
          <button
            onClick={handleCompare}
            className="text-green-700 hover:text-green-900 ml-4 text-sm font-semibold"
          >
            Disable
          </button>
        </div>
      )}

      <div
        className="p-4 bg-darkPurple-100 border-b border-darkPurple-300 shadow-md flex-shrink-0 sticky"
        style={{ top: headerHeight + (compareMode ? 40 : 0) }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
            {ALL_FILTERS_CONFIG.map((filterConfig) => (
              <div key={filterConfig.key}>
                <label className="block text-darkPurple-900 text-xs font-bold mb-1">
                  {filterConfig.label}
                  <p className="text-xxs text-darkPurple-700 font-normal mt-0.5 hidden sm:block">
                    {filterConfig.tooltip}
                  </p>
                </label>
                {filterConfig.type === "select" ? (
                  <select
                    value={filters[filterConfig.key]}
                    onChange={(e) =>
                      handleFilterChange(filterConfig.key, e.target.value)
                    }
                    className="w-full p-1.5 rounded-lg bg-darkPurple-50 text-darkPurple-900 border border-darkPurple-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-500 transition-all duration-200 custom-select text-sm"
                    title={filterConfig.tooltip}
                    disabled={currentProviderName !== "azure" || compareMode}
                  >
                    <option value="">
                      {filterConfig.label.includes("?")
                        ? "Any"
                        : `All ${filterConfig.label.split("(")[0].trim()}s`}
                    </option>
                    {(
                      filterConfig.dynamicOptions?.[currentProviderName] || []
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={filters[filterConfig.key]}
                    onChange={(e) =>
                      handleFilterChange(filterConfig.key, e.target.value)
                    }
                    className="w-full p-1.5 rounded-lg bg-darkPurple-50 text-darkPurple-900 border border-darkPurple-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-500 transition-all duration-200 text-sm"
                    title={filterConfig.tooltip}
                    placeholder={filterConfig.label}
                    disabled={currentProviderName !== "azure" || compareMode}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 justify-center sm:justify-end flex-shrink-0">
            <button
              onClick={() =>
                PROVIDER_CONFIG[currentProviderName].fetchData(
                  fetchAzureData,
                  debouncedFilters,
                )
              }
              className="p-2 bg-darkPurple-500 text-white font-scifi rounded-lg hover:bg-darkPurple-600 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 animate-pulse-once"
              title="Apply Filters"
              disabled={currentProviderName !== "azure" || compareMode}
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              onClick={clearFilters}
              className="p-2 bg-darkPurple-200 text-darkPurple-900 font-scifi rounded-lg hover:bg-darkPurple-300 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105"
              title="Clear Filters"
              disabled={currentProviderName !== "azure" || compareMode}
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() =>
                  setShowColumnCustomization(!showColumnCustomization)
                }
                className="px-4 py-2 bg-darkPurple-300 text-darkPurple-900 font-scifi rounded-lg hover:bg-darkPurple-400 transition-all duration-300 shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 text-sm"
                title="Toggle table columns visibility"
                disabled={compareMode}
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
      </div>

      <main className="p-4 flex-grow overflow-x-auto">
        {renderTable()}
        {currentPaginationData.totalCount > 0 && (
          <div className="mt-6 flex justify-center items-center space-x-3">
            <button
              onClick={() => handlePageChange(currentPaginationData.page - 1)}
              disabled={currentPaginationData.page === 1}
              className="px-4 py-1.5 bg-darkPurple-500 text-white font-scifi rounded-lg hover:bg-darkPurple-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 disabled:hover:scale-100 text-sm"
              title="Go to previous page"
            >
              <i className="fas fa-arrow-left mr-1.5"></i> Previous
            </button>
            <span className="text-darkPurple-900 font-secondary text-sm">
              Page{" "}
              <span className="font-bold text-darkPurple-500">
                {currentPaginationData.page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-darkPurple-500">
                {totalPages === 0 ? 1 : totalPages}
              </span>
            </span>
            <button
              onClick={() => handlePageChange(currentPaginationData.page + 1)}
              disabled={
                currentPaginationData.page === totalPages || totalPages === 0
              }
              className="px-4 py-1.5 bg-darkPurple-500 text-white font-scifi rounded-lg hover:bg-darkPurple-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow focus:outline-none focus:ring-2 focus:ring-darkPurple-400 transform hover:scale-105 disabled:hover:scale-100 text-sm"
              title="Go to next page"
            >
              Next <i className="fas fa-arrow-right ml-1.5"></i>
            </button>
          </div>
        )}
      </main>

      <footer className="p-3 bg-darkPurple-100 border-t border-darkPurple-300 shadow-inner text-xxs text-darkPurple-700 text-center flex-shrink-0">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <p>
            Last Updated: Mon, Jun 09, 2025 at 11:53 PM IST{" "}
            {/* Updated to current date and time */}
          </p>
          <div className="space-x-2">
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

      <ComparedModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setCompareMode(false);
          setSelectedVms([]);
        }}
        comparisonData={comparisonData}
        selectedVms={selectedVms}
      />
    </div>
  );
};

export default Clouddata;
