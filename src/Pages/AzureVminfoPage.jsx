import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"; // Import useParams and Link

// Map backend region codes to human-readable names (same as in main component)
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
};

const AzureVmInfoPage = () => {
  const { region, vmSize } = useParams(); // Get params from URL
  const [vmInfo, setVmInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVmInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVmInfo(null); // Clear previous data

    try {
      // Encode parameters for URL safety
      const encodedRegion = encodeURIComponent(region);
      const encodedVmSize = encodeURIComponent(vmSize);

      const apiUrl = `http://localhost:3000/api/azurevminfojune?region=${encodedRegion}&name=${encodedVmSize}`;
      console.log("Fetching VM Info from:", apiUrl);

      const response = await axios.get(apiUrl);
      console.log("VM Info API Response:", response.data);

      if (response.data.data && response.data.data.length > 0) {
        setVmInfo(response.data.data[0]); // Assuming API returns an array, take the first item
      } else {
        setError(
          "No detailed information found for this VM size in this region.",
        );
      }
    } catch (err) {
      console.error(
        "Error fetching VM Info:",
        err.response?.data || err.message,
      );
      setError(
        `Failed to load VM details: ${
          err.response?.data?.message || err.message
        }. Please check region/VM size.`,
      );
    } finally {
      setLoading(false);
    }
  }, [region, vmSize]); // Depend on region and vmSize from URL

  useEffect(() => {
    fetchVmInfo();
  }, [fetchVmInfo]);

  const displayRegionName = REGION_DISPLAY_NAMES[region] || region;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkPurple-50 to-darkPurple-100 text-darkPurple-900 font-secondary flex flex-col">
      {/* Header (can be extracted to a common layout component later) */}
      <header className="bg-darkPurple-50 p-4 border-b border-darkPurple-300 shadow-lg flex justify-between items-center z-10 sticky top-0 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center space-x-4">
          <div className="text-4xl text-darkPurple-500 animate-pulse">
            <i className="fas fa-cloud"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="font-scifi text-3xl text-darkPurple-800 tracking-wide text-shadow-glow">
              Cloud Price Nexus
            </h1>
            <p className="text-xs text-darkPurple-600 font-secondary mt-1">
              Real-time Insights from Vantage
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

        <h2 className="text-3xl font-scifi text-darkPurple-800 text-shadow-glow mb-6 text-center">
          Detailed Information for {vmSize} in {displayRegionName}
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-darkPurple-100 rounded-lg shadow-inner border border-darkPurple-300">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-darkPurple-500 mb-4"></div>
            <p className="text-darkPurple-900 font-secondary text-xl">
              Loading VM specifications...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-red-100/50 rounded-lg shadow-inner border border-red-500 text-red-700">
            <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p className="font-secondary text-xl text-center">Error: {error}</p>
            <p className="text-sm mt-2 text-red-600">
              Ensure backend `azurevminfojune` endpoint is correct and has data.
            </p>
          </div>
        ) : vmInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg bg-darkPurple-50 p-8 rounded-lg shadow-inner border border-darkPurple-200">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-scifi text-darkPurple-700 mb-4 border-b border-darkPurple-300 pb-2">
                General
              </h3>
              <p>
                <span className="font-bold text-darkPurple-800">Region:</span>{" "}
                {displayRegionName || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">VM Size:</span>{" "}
                {vmInfo.Name || vmInfo.vmSize || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">Family:</span>{" "}
                {vmInfo.Family || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">Tier:</span>{" "}
                {vmInfo.Tier || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Zones Supported:
                </span>{" "}
                {vmInfo.Zones || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Low Priority Available:
                </span>{" "}
                {vmInfo.LowPriority ? "Yes" : "No"}
              </p>
            </div>

            {/* Compute & Storage */}
            <div className="space-y-4">
              <h3 className="text-xl font-scifi text-darkPurple-700 mb-4 border-b border-darkPurple-300 pb-2">
                Compute & Storage
              </h3>
              <p>
                <span className="font-bold text-darkPurple-800">vCPUs:</span>{" "}
                {vmInfo.vCPUs || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">Memory:</span>{" "}
                {vmInfo.MemoryGB ? `${vmInfo.MemoryGB} GB` : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  vCPUs Per Core:
                </span>{" "}
                {vmInfo.vCPUsPerCore || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Local Temp Storage:
                </span>{" "}
                {vmInfo.LocalTempStorageGB
                  ? `${vmInfo.LocalTempStorageGB} GB`
                  : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  OS VHD Size:
                </span>{" "}
                {vmInfo.OSVhdSizeMB
                  ? `${(vmInfo.OSVhdSizeMB / 1024).toFixed(2)} GB`
                  : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Max Data Disk Count:
                </span>{" "}
                {vmInfo.MaxDataDiskCount || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Ephemeral OS Disk Supported:
                </span>{" "}
                {vmInfo.EphemeralOSDiskSupported ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Ephemeral OS Disk Placements:
                </span>{" "}
                {vmInfo.EphemeralOSDiskPlacements || "N/A"}
              </p>
            </div>

            {/* Networking & Advanced */}
            <div className="space-y-4">
              <h3 className="text-xl font-scifi text-darkPurple-700 mb-4 border-b border-darkPurple-300 pb-2">
                Networking & Advanced
              </h3>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Accelerated Networking:
                </span>{" "}
                {vmInfo.AcceleratedNetworking ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Premium I/O:
                </span>{" "}
                {vmInfo.PremiumIO ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">RDMA:</span>{" "}
                {vmInfo.RDMA ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Encryption Supported:
                </span>{" "}
                {vmInfo.Encryption ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Memory Maintenance:
                </span>{" "}
                {vmInfo.MemoryMaintenance ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Max Network Interfaces:
                </span>{" "}
                {vmInfo.MaxNetworkInterfaces || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  CPU Architecture:
                </span>{" "}
                {vmInfo.CpuArchitecture || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  VM Generations Supported:
                </span>{" "}
                {vmInfo.VMGenerationsSupported || "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  VM Deployment Method:
                </span>{" "}
                {vmInfo.VMDeploymentMethod || "N/A"}
              </p>
            </div>

            {/* Disk IOPS/Throughput (if available and relevant) */}
            <div className="space-y-4">
              <h3 className="text-xl font-scifi text-darkPurple-700 mb-4 border-b border-darkPurple-300 pb-2">
                Disk I/O Performance
              </h3>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Uncached Disk IOPS:
                </span>{" "}
                {vmInfo.UncachedDiskIOPS ? `${vmInfo.UncachedDiskIOPS}` : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Uncached Disk Throughput:
                </span>{" "}
                {vmInfo.UncachedDiskBytesPerSecond
                  ? `${(
                      vmInfo.UncachedDiskBytesPerSecond /
                      (1024 * 1024)
                    ).toFixed(2)} MB/s`
                  : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Cached Disk IOPS:
                </span>{" "}
                {vmInfo.TempDiskAndCachedIOPS
                  ? `${vmInfo.TempDiskAndCachedIOPS}`
                  : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Cached Read Throughput:
                </span>{" "}
                {vmInfo.TempDiskAndCachedReadBps
                  ? `${(
                      vmInfo.TempDiskAndCachedReadBps /
                      (1024 * 1024)
                    ).toFixed(2)} MB/s`
                  : "N/A"}
              </p>
              <p>
                <span className="font-bold text-darkPurple-800">
                  Cached Write Throughput:
                </span>{" "}
                {vmInfo.TempDiskAndCachedWriteBps
                  ? `${(
                      vmInfo.TempDiskAndCachedWriteBps /
                      (1024 * 1024)
                    ).toFixed(2)} MB/s`
                  : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-darkPurple-700 text-xl py-12">
            <i className="fas fa-info-circle text-4xl mb-4 text-darkPurple-500"></i>
            <p>No detailed information available for this VM.</p>
            <p className="text-base mt-2">
              Ensure the region and VM size are correct.
            </p>
          </div>
        )}
      </main>

      {/* Footer (can be extracted to a common layout component later) */}
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
              Docs by Vantage
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

export default AzureVmInfoPage;
