import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Folder } from "lucide-react"; // Import Folder icon
import ComparedModal from "./ComparedModal";

const ComparisonVault = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [vaultItems, setVaultItems] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem("selectedVms");
    if (savedItems) {
      setVaultItems(JSON.parse(savedItems));
    }
  }, []);

  const handleItemSelection = (itemKey) => {
    setSelectedItems((prev) => {
      const isSelected = prev.includes(itemKey);
      return isSelected
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey];
    });
  };

  const handleCompareSelected = async () => {
    if (selectedItems.length < 2) {
      alert("Please select at least two items to compare.");
      return;
    }
    try {
      const vmsForComparison = vaultItems
        .filter((item) => selectedItems.includes(item.itemKey))
        .map((item) => ({
          region: item.regionName,
          name: item.vmSize,
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

  const handleBack = () => {
    navigate("/");
  };

  const handleGoToProvider = (provider) => {
    navigate("/", { state: { selectedTab: provider } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkPurple-50 to-darkPurple-100 text-darkPurple-900 font-secondary flex flex-col p-4">
      <div className="flex items-center mb-4">
        <Folder className="h-8 w-8 text-darkPurple-500 mr-2" />{" "}
        {/* Vault Logo */}
        <h2 className="text-2xl font-semibold text-gray-900">
          Comparison Vault
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["azure", "aws", "gcp"].map((provider) => {
          const providerItems = vaultItems.filter(
            (item) => item.provider === provider,
          );
          return providerItems.length > 0 ? (
            <div key={provider} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {provider.toUpperCase()}
              </h3>
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Select
                    </th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Instance Type
                    </th>
                    <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Region
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {providerItems.map((item) => (
                    <tr key={item.itemKey} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.itemKey)}
                          onChange={() => handleItemSelection(item.itemKey)}
                          className="mr-2"
                        />
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {item.vmSize}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {item.regionName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              key={provider}
              className="bg-gray-100 p-4 rounded-lg shadow flex flex-col items-center justify-center"
            >
              <p className="text-sm text-gray-600 mb-2">
                No {provider.toUpperCase()} items selected.
              </p>
              <button
                onClick={() => handleGoToProvider(provider)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Go to {provider.toUpperCase()} Table
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={handleCompareSelected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Compare Selected
        </button>
      </div>

      <ComparedModal
        show={showModal}
        onHide={() => setShowModal(false)}
        comparisonData={comparisonData}
        selectedVms={vaultItems.filter((item) =>
          selectedItems.includes(item.itemKey),
        )}
      />
    </div>
  );
};

export default ComparisonVault;
