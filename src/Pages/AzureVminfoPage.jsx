import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import VariantsSection from "./VariantsSection";
import VmInfoSection from "./VmInfoSection";

const AzureVmInfoPage = () => {
  const { region, vmSize } = useParams();
  const [vmData, setVmData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch to set vmData based on routing params
    const fetchInitialVmData = async () => {
      try {
        const encodedRegion = encodeURIComponent(region);
        const encodedVmSize = encodeURIComponent(vmSize);
        const vmUrl = `http://localhost:3000/api/azurevminfojune?region=${encodedRegion}&name=${encodedVmSize}`;
        console.log("Fetching Initial VM Data from:", vmUrl);
        const response = await fetch(vmUrl);
        const data = await response.json();
        console.log("Initial VM Data Response:", data);

        if (data.data && data.data.length > 0) {
          const vm = data.data.find(
            (v) => v.Name.toLowerCase() === vmSize.toLowerCase(),
          );
          if (vm) {
            setVmData(vm);
          } else {
            setError(`VM ${vmSize} not found in region ${region}`);
          }
        } else {
          setError(`No data found for ${vmSize} in ${region}`);
        }
      } catch (err) {
        console.error("Error fetching initial VM data:", err);
        setError(
          `Failed to load VM data: ${err.message}. Check server status.`,
        );
      }
    };

    fetchInitialVmData();
  }, [region, vmSize]);

  const handleVmSizeChange = (newVmData) => {
    setVmData(newVmData);
    setError(null);
  };

  const displayRegionName = REGION_DISPLAY_NAMES[region] || region;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkPurple-50 to-darkPurple-100 text-darkPurple-900 font-semibold flex flex-col">
      <header className="bg-darkPurple-200 p-4 border-b border-darkPurple-200 shadow-lg flex justify-between items-center z-10 sticky top-0 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center space-x-4">
          <div className="text-4xl text-darkPurple-500 animate-pulse">
            <i className="fas fa-cloud"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="font-scifi text-3xl text-darkPurple-800 tracking-wide">
              Cloud Price Nexus
            </h1>
            <p className="text-xs text-darkPurple-600 font-medium mt-1">
              Real-time Insights from Cloud as a services
            </p>
          </div>
        </div>
        <nav className="flex space-x-2 border-2 border-darkPurple-300 rounded-lg p-1 bg-darkPurple-100 shadow-inner">
          <Link
            to="/"
            className="px-4 py-2 font-scifi text-white bg-darkPurple-500 rounded-lg shadow-inner transition-all duration-300 hover:scale-105 hover:bg-darkPurple-600 focus:outline-none focus:ring-2 focus:ring-darkPurple-400"
          >
            Back to VMs
          </Link>
        </nav>
        <div className="flex items-center space-x-6">
          <p className="text-darkPurple-700 text-sm hidden lg:block">
            Detailed VM Info
          </p>
          <button
            title="Connect via Slack"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 p-2 rounded-full"
          >
            <i className="fab fa-slack fa-lg"></i>
          </button>
          <button
            title="Star our project"
            className="text-darkPurple-800 hover:text-darkPurple-500 transition-colors transform hover:scale-110 p-2 rounded-full"
          >
            <i className="fas fa-star fa-lg"></i>
          </button>
        </div>
      </header>

      <main className="flex-grow p-6 container mx-auto my-8 bg-darkPurple-100 rounded-xl shadow-xl border border-darkPurple-300 animate-fade-in">
        <Link
          to="/"
          className="inline-flex items-center text-darkPurple-600 hover:text-darkPurple-800 transition-colors mb-6 text-lg font-semibold"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to VM List
        </Link>

        <h2 className="text-3xl font-scifi text-darkPurple-800 mb-6 text-center">
          Detailed Information for {vmSize} in {displayRegionName}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <VariantsSection
            region={region}
            vmSize={vmSize}
            selectedVm={vmData}
            onVmSizeChange={handleVmSizeChange}
          />
          <VmInfoSection vmData={vmData} error={error} />
        </div>
      </main>

      <footer className="p-4 bg-darkPurple-100 border-t border-darkPurple-300 shadow-inner text-sm text-darkPurple-700 text-center flex-shrink-0">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>
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
              Docs by Cloud as a services
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

// Map backend region codes to human-readable names (moved here for scope)
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
  centralus: "Central US",
  northeurope: "North Europe",
  italynorth: "Italy North",
  swedencentral: "Sweden Central",
  westindia: "West India",
  australiaeast: "Australia East",
  northcentralus: "North Central US",
  southcentralus: "South Central US",
  westcentralus: "West Central US",
  southcentralus2: "South Central US 2",
};

export default AzureVmInfoPage;
