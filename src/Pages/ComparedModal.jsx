import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const ComparedModal = ({ show, onHide, comparisonData, selectedVms }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const modalRef = useRef(null);
  const [aiComparisonResult, setAiComparisonResult] = useState(null);

  // Match backend VM data with frontend pricing data and calculate performance/savings
  const enrichedData = comparisonData?.data.map((vm) => {
    const selectedVm = selectedVms.find(
      (sv) => sv.regionName === vm.Region && sv.vmSize === vm.Name,
    );
    const pricePerHour = selectedVm ? selectedVm.pricePerHour : 0;
    const retailPrice = selectedVm ? selectedVm.retailPrice || 0 : 0;
    const unitPrice = selectedVm ? selectedVm.unitPrice || 0 : 0;
    const effectiveStartDate = selectedVm
      ? selectedVm.effectiveDate || vm.effectiveDate
      : vm.effectiveDate;

    // Calculate performance metrics
    const iopsPerVcpu = vm.vCPUs ? vm.UncachedDiskIOPS / vm.vCPUs : 0;
    const memoryPerVcpu = vm.vCPUs ? vm.MemoryGB / vm.vCPUs : 0;
    const storagePerVcpu = vm.vCPUs ? vm.LocalTempStorageGB / vm.vCPUs : 0;

    // Calculate savings
    const spotSavings = vm.LowPriority ? retailPrice * 0.2 : 0; // Assuming LowPriority indicates spot eligibility
    const reservationSavings =
      vm.priceType === "Reservation" ? retailPrice * 0.3 : 0;
    const effectivePrice = pricePerHour > 0 ? pricePerHour : retailPrice;

    return {
      ...vm,
      pricePerHour,
      retailPrice,
      unitPrice,
      effectiveStartDate,
      iopsPerVcpu: iopsPerVcpu.toFixed(2),
      memoryPerVcpu: memoryPerVcpu.toFixed(2),
      storagePerVcpu: storagePerVcpu.toFixed(2),
      spotSavings: spotSavings.toFixed(2),
      reservationSavings: reservationSavings.toFixed(2),
      effectivePrice,
    };
  });

  // Function to calculate star rating (1-5) based on relative performance
  const getStarRating = (value, maxValue, minValue) => {
    const normalizedValue =
      maxValue === minValue
        ? 0.5 // Avoid division by zero, default to neutral
        : (value - minValue) / (maxValue - minValue);
    const stars = Math.round(normalizedValue * 4) + 1; // Scale to 1-5 stars
    return Math.min(Math.max(stars, 1), 5); // Ensure rating is between 1 and 5
  };

  // Calculate max and min values for rating normalization
  const calculateRatings = () => {
    if (!enrichedData || enrichedData.length === 0) return {};

    const vCPUsMax = Math.max(...enrichedData.map((vm) => vm.vCPUs || 0));
    const vCPUsMin = Math.min(...enrichedData.map((vm) => vm.vCPUs || 0));
    const memoryGBMax = Math.max(...enrichedData.map((vm) => vm.MemoryGB || 0));
    const memoryGBMin = Math.min(...enrichedData.map((vm) => vm.MemoryGB || 0));
    const effectivePriceMax = Math.max(
      ...enrichedData.map((vm) => vm.effectivePrice || 0),
    );
    const effectivePriceMin = Math.min(
      ...enrichedData.map((vm) => vm.effectivePrice || 0),
    );
    const iopsPerVcpuMax = Math.max(
      ...enrichedData.map((vm) => vm.iopsPerVcpu || 0),
    );
    const iopsPerVcpuMin = Math.min(
      ...enrichedData.map((vm) => vm.iopsPerVcpu || 0),
    );
    const storagePerVcpuMax = Math.max(
      ...enrichedData.map((vm) => vm.storagePerVcpu || 0),
    );
    const storagePerVcpuMin = Math.min(
      ...enrichedData.map((vm) => vm.storagePerVcpu || 0),
    );

    return enrichedData.map((vm) => ({
      ...vm,
      vCPUsRating: getStarRating(vm.vCPUs || 0, vCPUsMax, vCPUsMin),
      memoryGBRating: getStarRating(vm.MemoryGB || 0, memoryGBMax, memoryGBMin),
      priceRating: getStarRating(
        effectivePriceMax - (vm.effectivePrice || 0), // Higher price = lower rating
        effectivePriceMax - effectivePriceMin,
        0,
      ),
      iopsPerVcpuRating: getStarRating(
        vm.iopsPerVcpu || 0,
        iopsPerVcpuMax,
        iopsPerVcpuMin,
      ),
      storagePerVcpuRating: getStarRating(
        vm.storagePerVcpu || 0,
        storagePerVcpuMax,
        storagePerVcpuMin,
      ),
    }));
  };

  const ratedData = calculateRatings();

  useEffect(() => {
    if (show && comparisonData && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy previous chart instance
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: comparisonData.analysis.vmNames,
          datasets: [
            {
              label: "vCPUs",
              data: comparisonData.analysis.vCPUs,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
            {
              label: "MemoryGB",
              data: comparisonData.analysis.memoryGB,
              backgroundColor: [
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(201, 203, 207, 0.2)",
                "rgba(54, 162, 235, 0.2)",
              ],
              borderColor: [
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(201, 203, 207, 1)",
                "rgba(54, 162, 235, 1)",
              ],
              borderWidth: 1,
            },
            {
              label: "Price/Hour",
              data: ratedData.map((vm) => vm.effectivePrice || 0),
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { font: { size: 10 } } },
            title: { display: true, text: "VM Comparison", font: { size: 12 } },
          },
          layout: {
            padding: 10,
          },
        },
      });
    }

    // Handle click outside to close
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onHide();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, comparisonData, selectedVms, onHide]);

  const handleSendToAI = async () => {
    try {
      const vmInput = ratedData.map((vm) => ({
        name: vm.Name,
        region: vm.Region,
      }));

      const response = await fetch(
        "http://localhost:3000/api/azurevminfojune/compare-vms-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vms: vmInput }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          "Failed to get AI recommendation: " +
            (result.message || "Unknown error"),
        );
        return;
      }

      setAiComparisonResult(result.recommendation); // Update state to display recommendation
    } catch (error) {
      console.error("AI Compare Error:", error);
      alert("Something went wrong while fetching AI recommendation.");
    }
  };

  if (!show) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050"
    >
      <div
        className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full transform translate-y-[-20px] transition-transform duration-300 ease-in-out hover:translate-y-[-25px]"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-900">VM Comparison</h2>
          <button
            onClick={onHide}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="py-2">
          {comparisonData && (
            <>
              <div className="mb-3">
                <canvas
                  ref={chartRef}
                  style={{ maxHeight: "250px", maxWidth: "100%" }}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        VM Name (Region)
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        vCPUs <span className="text-yellow-500">★</span>
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        Memory (GB) <span className="text-yellow-500">★</span>
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        Price/Hour ($){" "}
                        <span className="text-yellow-500">★</span>
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        IOPS/vCPU <span className="text-yellow-500">★</span>
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        Storage/vCPU (GB){" "}
                        <span className="text-yellow-500">★</span>
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        Spot Savings ($)
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        Reservation Savings ($)
                      </th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">
                        Effective Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratedData.map((vm, index) => (
                      <tr key={vm.Name} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b text-xs text-gray-900">
                          {vm.Name} ({vm.Region})
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.vCPUs || "N/A"}{" "}
                          {Array.from({ length: vm.vCPUsRating }, (_, i) => (
                            <span key={i} className="text-yellow-500">
                              ★
                            </span>
                          ))}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.MemoryGB || "N/A"}{" "}
                          {Array.from({ length: vm.memoryGBRating }, (_, i) => (
                            <span key={i} className="text-yellow-500">
                              ★
                            </span>
                          ))}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.effectivePrice
                            ? `$${vm.effectivePrice.toFixed(5)}`
                            : "N/A"}{" "}
                          {Array.from({ length: vm.priceRating }, (_, i) => (
                            <span key={i} className="text-yellow-500">
                              ★
                            </span>
                          ))}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.iopsPerVcpu || "N/A"}{" "}
                          {Array.from(
                            { length: vm.iopsPerVcpuRating },
                            (_, i) => (
                              <span key={i} className="text-yellow-500">
                                ★
                              </span>
                            ),
                          )}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.storagePerVcpu || "N/A"}{" "}
                          {Array.from(
                            { length: vm.storagePerVcpuRating },
                            (_, i) => (
                              <span key={i} className="text-yellow-500">
                                ★
                              </span>
                            ),
                          )}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.spotSavings ? `$${vm.spotSavings}` : "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.reservationSavings
                            ? `$${vm.reservationSavings}`
                            : "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b text-xs text-gray-700">
                          {vm.effectiveStartDate
                            ? new Date(
                                vm.effectiveStartDate,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {aiComparisonResult && (
                <div className="mt-3 bg-gray-100 p-2 rounded shadow border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-900">
                    AI Recommendation
                  </h4>
                  <p className="text-xxs text-gray-700 whitespace-pre-wrap">
                    {aiComparisonResult}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={handleSendToAI}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 mr-2"
          >
            AI Recommendation
          </button>
          <button
            onClick={onHide}
            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparedModal;
