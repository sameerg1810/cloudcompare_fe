import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Layers, Tag } from "lucide-react";

const VariantsSection = ({ region, vmSize, selectedVm, onVmSizeChange }) => {
  const [familySizes, setFamilySizes] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region: region || "",
    family: "",
    tier: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    region: [],
    family: [],
    tier: [],
  });
  const isInitialMount = useRef(true); // Flag to run fetchInitialData only once

  const FILTER_CONFIG = [
    { key: "region", label: "Region", icon: MapPin },
    { key: "family", label: "Family", icon: Layers },
    { key: "tier", label: "Tier", icon: Tag },
  ];

  // Fetch initial data based on routing params
  const fetchInitialData = useCallback(async () => {
    if (!isInitialMount.current) return; // Prevent multiple initial calls
    setLoading(true);
    setError(null);
    setFamilySizes([]);
    setAvailableRegions([]);

    try {
      const encodedRegion = encodeURIComponent(region);
      const encodedVmSize = encodeURIComponent(vmSize);

      // Fetch initial VM info to get family
      const vmUrl = `http://localhost:3000/api/azurevminfojune?region=${encodedRegion}&name=${encodedVmSize}`;
      console.log("Fetching VM Info from:", vmUrl);
      const vmResponse = await axios.get(vmUrl);
      console.log("VM Info API Response:", vmResponse.data);

      if (vmResponse.data.data && vmResponse.data.data.length > 0) {
        const vm = vmResponse.data.data.find(
          (v) => v.Name.toLowerCase() === vmSize.toLowerCase(),
        );
        if (vm) {
          const family = vm.Family;
          setFilters((prev) => ({ ...prev, family }));

          // Fetch filtered data for Variants
          const filterUrl = `http://localhost:3000/api/azurevminfojune/filtered?region=${encodedRegion}&family=${encodeURIComponent(
            family,
          )}`;
          console.log("Fetching Initial Filtered Data from:", filterUrl);
          const filterResponse = await axios.get(filterUrl);
          console.log("Filtered Variants API Response:", filterResponse.data);

          if (filterResponse.data.data && filterResponse.data.data.length > 0) {
            const sizes = [
              ...new Set(
                filterResponse.data.data
                  .map((vm) => vm.Size)
                  .filter(Boolean)
                  .filter(
                    (size) => size.toLowerCase() !== vmSize.toLowerCase(),
                  ), // Exclude current size
              ),
            ];
            const regions = [
              ...new Set(
                filterResponse.data.data.map((vm) => vm.Region).filter(Boolean),
              ),
            ];
            const families = [
              ...new Set(
                filterResponse.data.data.map((vm) => vm.Family).filter(Boolean),
              ),
            ];
            const tiers = [
              ...new Set([
                ...filterResponse.data.data
                  .map((vm) => vm.Tier)
                  .filter(Boolean),
                "Basic",
                "Standard",
              ]),
            ];

            setFamilySizes(sizes);
            setAvailableRegions(regions);
            setFilterOptions({
              region: regions.map((r) => ({
                value: r.toLowerCase(),
                label: r,
              })),
              family: families.map((f) => ({ value: f, label: f })),
              tier: tiers.map((t) => ({ value: t, label: t })),
            });

            // Send initial VM data with availableRegions to parent
            onVmSizeChange({ ...vm, availableRegions: regions });
          } else {
            setFamilySizes([]);
            setAvailableRegions([]);
            setError(`No variants found for ${family} in ${region}`);
          }
        } else {
          setError(`VM ${vmSize} not found in region ${region}`);
        }
      } else {
        setError(`No data found for ${vmSize} in ${region}`);
      }
    } catch (err) {
      console.error(
        "Error fetching initial data:",
        err.response?.data || err.message,
      );
      setError(
        `Failed to load variants: ${
          err.response?.data?.message || err.message
        }. Check server status.`,
      );
    } finally {
      setLoading(false);
      isInitialMount.current = false; // Mark as mounted
    }
  }, [region, vmSize, onVmSizeChange]);

  // Apply filters based on user input
  const applyFilters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...(filters.region && { region: filters.region }),
        ...(filters.family && { family: filters.family }),
        ...(filters.tier && { tier: filters.tier }),
      };
      const url = `http://localhost:3000/api/azurevminfojune/filtered?${new URLSearchParams(
        params,
      ).toString()}`;
      console.log("Applying Filters for Variants, Fetching from:", url);
      const response = await axios.get(url);
      console.log("Filtered Variants API Response:", response.data);

      if (response.data.data && response.data.data.length > 0) {
        const sizes = [
          ...new Set(
            response.data.data
              .map((vm) => vm.Size)
              .filter(Boolean)
              .filter((size) => size.toLowerCase() !== vmSize.toLowerCase()), // Exclude current size
          ),
        ];
        const regions = [
          ...new Set(response.data.data.map((vm) => vm.Region).filter(Boolean)),
        ];
        const families = [
          ...new Set(response.data.data.map((vm) => vm.Family).filter(Boolean)),
        ];
        const tiers = [
          ...new Set([
            ...response.data.data.map((vm) => vm.Tier).filter(Boolean),
            "Basic",
            "Standard",
          ]),
        ];

        // Set family and region to the first record's values if tier is changed
        if (filters.tier && response.data.data.length > 0) {
          const firstRecord = response.data.data[0];
          setFilters((prev) => ({
            ...prev,
            region: firstRecord.Region || prev.region,
            family: firstRecord.Family || prev.family,
          }));
          // Send the first record as the new default VM data
          onVmSizeChange({ ...firstRecord, availableRegions: regions });
        }

        setFamilySizes(sizes);
        setAvailableRegions(regions);
        setFilterOptions({
          region: regions.map((r) => ({
            value: r.toLowerCase(),
            label: r,
          })),
          family: families.map((f) => ({ value: f, label: f })),
          tier: tiers.map((t) => ({ value: t, label: t })),
        });
      } else {
        setFamilySizes([]);
        setAvailableRegions([]);
        setError("No VMs found for the applied filters");
      }
    } catch (err) {
      console.error(
        "Error applying filters:",
        err.response?.data || err.message,
      );
      setError(
        `Failed to apply filters for Variants: ${
          err.response?.data?.message || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  }, [filters, vmSize, onVmSizeChange]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (filters.region || filters.family || filters.tier) {
      const timer = setTimeout(() => {
        applyFilters();
      }, 300); // Debounce to prevent rapid calls
      return () => clearTimeout(timer);
    }
  }, [filters, applyFilters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      region: "",
      family: "",
      tier: "",
    });
    setError(null);
  };

  return (
    <div className="lg:col-span-2 bg-darkPurple-50 p-6 rounded-lg shadow-inner border border-darkPurple-200">
      <h3 className="text-xl font-scifi text-darkPurple-700 mb-4 border-b border-darkPurple-300 pb-2">
        Variants
      </h3>
      {/* Filters */}
      <div className="space-y-4 mb-6">
        {FILTER_CONFIG.map((filter) => (
          <div key={filter.key}>
            <label className="block text-darkPurple-900 text-xs font-bold mb-1">
              {filter.label}
            </label>
            <select
              value={filters[filter.key]}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full p-1.5 rounded-lg bg-darkPurple-50 text-darkPurple-900 border border-darkPurple-300 focus:outline-none focus:ring-2 focus:ring-darkPurple-500 transition-all duration-200 text-sm"
            >
              <option value="">All {filter.label}s</option>
              {filterOptions[filter.key].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-darkPurple-200 text-darkPurple-900 font-scifi rounded-lg hover:bg-darkPurple-300 transition-all duration-300 text-sm"
        >
          Clear Filters
        </button>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-darkPurple-500 mb-2"></div>
          <p className="text-darkPurple-900 text-sm">Loading variants...</p>
        </div>
      ) : error ? (
        <div className="text-red-700 text-sm">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      ) : familySizes.length > 0 ? (
        <ul className="space-y-2">
          {familySizes.map((size) => (
            <li key={size}>
              <button
                onClick={async () => {
                  const encodedRegion = encodeURIComponent(region);
                  const encodedSize = encodeURIComponent(size);
                  const url = `http://localhost:3000/api/azurevminfojune?region=${encodedRegion}&name=${encodedSize}`;
                  console.log("Fetching Variant Data from:", url);
                  const response = await axios.get(url);
                  console.log("Variant Data API Response:", response.data);
                  if (response.data.data && response.data.data.length > 0) {
                    const vm = response.data.data[0];
                    onVmSizeChange({ ...vm, availableRegions });
                  } else {
                    setError(`No data found for ${size} in ${region}`);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedVm && selectedVm.Name === size
                    ? "bg-darkPurple-500 text-white font-bold"
                    : "bg-darkPurple-200 text-darkPurple-900 hover:bg-darkPurple-300"
                }`}
              >
                {size}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-darkPurple-700 text-sm">No variants available.</p>
      )}
    </div>
  );
};

export default VariantsSection;
