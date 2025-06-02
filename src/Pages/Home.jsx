import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const CloudData = () => {
  const [data, setData] = useState({
    aws: [],
    azure: [],
    gcp: [],
  });
  const [pagination, setPagination] = useState({
    aws: { page: 1, limit: 10, totalCount: 0 },
    azure: { page: 1, limit: 10, totalCount: 0 },
    gcp: { page: 1, limit: 10, totalCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    aws: { instanceType: "", region: "", pricingType: "", os: "" },
    azure: { instanceType: "", region: "", pricingType: "", os: "" },
    gcp: { instanceType: "", region: "", pricingType: "", os: "" },
  });

  const regions = {
    aws: ["us-east-1", "us-west-2", "eu-west-1"],
    azure: ["westus", "eastus", "northeurope"],
    gcp: ["us-central1", "europe-west1", "asia-east1"],
  };

  const pricingTypes = {
    aws: ["on-demand", "spot"],
    azure: ["on-demand"],
    gcp: ["on-demand", "spot"],
  };

  const osOptions = ["Linux", "Windows", "N/A"];

  const fetchData = async (provider, page = 1) => {
    setLoading(true);
    try {
      const params = {
        provider,
        ...filters[provider],
        limit: pagination[provider].limit,
        page,
      };
      console.log("Fetching data with params:", params);
      const response = await axios.get("http://localhost:3000/api/cloud/data", {
        params,
      });
      console.log("API Response:", response.data);
      setData((prev) => ({
        ...prev,
        [provider]: response.data.data || [],
      }));
      setPagination((prev) => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          page,
          totalCount: response.data.count || 0,
        },
      }));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("aws");
  }, []);

  const handleFilterChange = (provider, field, value) => {
    setFilters((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const applyFilters = (provider) => {
    fetchData(provider, 1); // Reset to page 1 when applying filters
  };

  const handlePageChange = (provider, newPage) => {
    fetchData(provider, newPage);
  };

  const renderFilterSection = (provider) => (
    <div className="mb-6 p-4 bg-space-medium rounded-lg">
      <h3 className="text-lg font-scifi text-darkPurple-800 mb-4">
        Filters for {provider.toUpperCase()}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-darkPurple-900 font-secondary mb-1">
            Instance Type
          </label>
          <input
            type="text"
            value={filters[provider].instanceType}
            onChange={(e) =>
              handleFilterChange(provider, "instanceType", e.target.value)
            }
            className="w-full p-2 rounded bg-space-dark text-darkPurple-900 border border-neon-cyan focus:outline-none focus:ring-2 focus:ring-darkPurple-500"
            placeholder="e.g., c6g.xlarge"
          />
        </div>
        <div>
          <label className="block text-darkPurple-900 font-secondary mb-1">
            Region
          </label>
          <select
            value={filters[provider].region}
            onChange={(e) =>
              handleFilterChange(provider, "region", e.target.value)
            }
            className="w-full p-2 rounded bg-space-dark text-darkPurple-900 border border-neon-cyan focus:outline-none focus:ring-2 focus:ring-darkPurple-500"
          >
            <option value="">All Regions</option>
            {regions[provider].map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-darkPurple-900 font-secondary mb-1">
            Pricing Type
          </label>
          <select
            value={filters[provider].pricingType}
            onChange={(e) =>
              handleFilterChange(provider, "pricingType", e.target.value)
            }
            className="w-full p-2 rounded bg-space-dark text-darkPurple-900 border border-neon-cyan focus:outline-none focus:ring-2 focus:ring-darkPurple-500"
          >
            <option value="">All Pricing Types</option>
            {pricingTypes[provider].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-darkPurple-900 font-secondary mb-1">
            OS
          </label>
          <select
            value={filters[provider].os}
            onChange={(e) => handleFilterChange(provider, "os", e.target.value)}
            className="w-full p-2 rounded bg-space-dark text-darkPurple-900 border border-neon-cyan focus:outline-none focus:ring-2 focus:ring-darkPurple-500"
          >
            <option value="">All OS</option>
            {osOptions.map((os) => (
              <option key={os} value={os}>
                {os}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={() => applyFilters(provider)}
        className="mt-4 px-4 py-2 bg-darkPurple-500 text-space-dark font-scifi rounded hover:bg-darkPurple-400 transition-colors shadow-glow"
      >
        Apply Filters
      </button>
    </div>
  );

  const renderPagination = (provider) => {
    const { page, limit, totalCount } = pagination[provider];
    const totalPages = Math.ceil(totalCount / limit);

    return (
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => handlePageChange(provider, page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-darkPurple-500 text-space-dark font-scifi rounded hover:bg-darkPurple-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
        >
          Previous
        </button>
        <span className="text-darkPurple-900 font-secondary">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(provider, page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-darkPurple-500 text-space-dark font-scifi rounded hover:bg-darkPurple-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
        >
          Next
        </button>
      </div>
    );
  };

  const renderTable = (providerData) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-space-dark border border-neon-cyan shadow-glow">
        <thead>
          <tr className="bg-space-medium">
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Instance Type
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Region
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Pricing Type
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              OS
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Price/Hour (USD)
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Instance Family
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              vCPUs
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Memory (MB)
            </th>
            <th className="py-3 px-6 border-b border-neon-purple font-scifi text-darkPurple-800 text-shadow-neon-cyan">
              Network Performance
            </th>
          </tr>
        </thead>
        <tbody>
          {providerData && providerData.length > 0 ? (
            providerData.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-space-light transition-colors duration-300"
              >
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.instanceType}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.pricing.region}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.pricing.pricingType}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.pricing.os}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.pricing.pricePerHour.toFixed(3)}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.instanceDetails.specs.instanceFamily}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.instanceDetails.specs.vCPUs}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.instanceDetails.specs.memoryInMB}
                </td>
                <td className="py-3 px-6 border-b border-neon-purple font-secondary text-darkPurple-900">
                  {item.instanceDetails.specs.networkPerformance}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="py-3 px-6 text-center text-darkPurple-900 font-secondary"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      {/* Table of Contents */}
      <div className="mb-8">
        <h2 className="text-2xl font-scifi text-darkPurple-800 text-shadow-glow mb-4">
          Table of Contents
        </h2>
        <ul className="list-disc list-inside text-darkPurple-900 font-secondary">
          <li>
            <a
              href="#aws"
              className="hover:text-darkPurple-800 transition-colors"
            >
              AWS Pricing Data
            </a>
          </li>
          <li>
            <a
              href="#azure"
              className="hover:text-darkPurple-800 transition-colors"
            >
              Azure Pricing Data
            </a>
          </li>
          <li>
            <a
              href="#gcp"
              className="hover:text-darkPurple-800 transition-colors"
            >
              GCP Pricing Data
            </a>
          </li>
        </ul>
      </div>

      {/* Tabs for Providers */}
      <Tabs
        onSelect={(index) => {
          const providers = ["aws", "azure", "gcp"];
          fetchData(providers[index]);
        }}
        className="space-y-4"
      >
        <TabList className="flex flex-wrap space-x-2 sm:space-x-4 mb-6 border-b-2 border-space-medium">
          <Tab
            className="px-3 py-2 sm:px-4 sm:py-2 font-scifi text-darkPurple-900 cursor-pointer border-b-2 border-transparent focus:outline-none transition-colors duration-200"
            selectedClassName="border-darkPurple-500 text-darkPurple-800 text-shadow-glow"
          >
            AWS
          </Tab>
          <Tab
            className="px-3 py-2 sm:px-4 sm:py-2 font-scifi text-darkPurple-900 cursor-pointer border-b-2 border-transparent focus:outline-none transition-colors duration-200"
            selectedClassName="border-darkPurple-500 text-darkPurple-800 text-shadow-glow"
          >
            Azure
          </Tab>
          <Tab
            className="px-3 py-2 sm:px-4 sm:py-2 font-scifi text-darkPurple-900 cursor-pointer border-b-2 border-transparent focus:outline-none transition-colors duration-200"
            selectedClassName="border-darkPurple-500 text-darkPurple-800 text-shadow-glow"
          >
            GCP
          </Tab>
        </TabList>

        <TabPanel className="mt-4">
          <div id="aws">
            <h2 className="text-2xl font-scifi text-darkPurple-800 text-shadow-glow mb-4">
              AWS Pricing Data
            </h2>
            {renderFilterSection("aws")}
            {loading ? (
              <p className="text-center text-darkPurple-900 font-secondary">
                Loading...
              </p>
            ) : error ? (
              <p className="text-center text-darkPurple-900 font-secondary">
                {error}
              </p>
            ) : (
              <>
                {renderTable(data.aws)}
                {renderPagination("aws")}
              </>
            )}
          </div>
        </TabPanel>
        <TabPanel className="mt-4">
          <div id="azure">
            <h2 className="text-2xl font-scifi text-darkPurple-800 text-shadow-glow mb-4">
              Azure Pricing Data
            </h2>
            {renderFilterSection("azure")}
            {loading ? (
              <p className="text-center text-darkPurple-900 font-secondary">
                Loading...
              </p>
            ) : error ? (
              <p className="text-center text-darkPurple-900 font-secondary">
                {error}
              </p>
            ) : (
              <>
                {renderTable(data.azure)}
                {renderPagination("azure")}
              </>
            )}
          </div>
        </TabPanel>
        <TabPanel className="mt-4">
          <div id="gcp">
            <h2 className="text-2xl font-scifi text-darkPurple-800 text-shadow-glow mb-4">
              GCP Pricing Data
            </h2>
            {renderFilterSection("gcp")}
            {loading ? (
              <p className="text-center text-darkPurple-900 font-secondary">
                Loading...
              </p>
            ) : error ? (
              <p className="text-center text-darkPurple-900 font-secondary">
                {error}
              </p>
            ) : (
              <>
                {renderTable(data.gcp)}
                {renderPagination("gcp")}
              </>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default CloudData;
