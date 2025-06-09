import React, { createContext, useState, useCallback } from "react";
import axios from "axios";

export const AzureDataContext = createContext();

export const AzureDataProvider = ({ children }) => {
  const [data, setData] = useState({
    azure: {
      pricing: [], // For /api/azureretailjune/prices
      vmInfo: [], // For /api/azurevminfojune
      familyInfo: [], // For /api/azurevminfojune/by-family
    },
  });
  const [loading, setLoading] = useState({
    azure: {
      pricing: false,
      vmInfo: false,
      familyInfo: false,
    },
  });
  const [error, setError] = useState({
    azure: {
      pricing: null,
      vmInfo: null,
      familyInfo: null,
    },
  });

  const fetchAzureData = useCallback(
    async (filters = {}, endpoint = "prices") => {
      const isPricing = endpoint === "prices";
      const isFamily = endpoint === "by-family";
      const dataType = isPricing
        ? "pricing"
        : isFamily
        ? "familyInfo"
        : "vmInfo";
      const baseUrl = isPricing
        ? "http://localhost:3000/api/azureretailjune/prices"
        : isFamily
        ? "http://localhost:3000/api/azurevminfojune/by-family"
        : "http://localhost:3000/api/azurevminfojune";

      setLoading((prev) => ({
        ...prev,
        azure: { ...prev.azure, [dataType]: true },
      }));
      setError((prev) => ({
        ...prev,
        azure: { ...prev.azure, [dataType]: null },
      }));

      try {
        const params = isPricing
          ? {
              ...(filters.region && { region: filters.region }),
              ...(filters.vmSizeSearch && { vmSize: filters.vmSizeSearch }),
              ...(filters.priceType && { priceType: filters.priceType }),
              ...(filters.minPrice && { minPrice: filters.minPrice }),
              ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
              ...(filters.spot && { spot: filters.spot }),
              ...(filters.location && { location: filters.location }),
              ...(filters.meterName && { meterName: filters.meterName }),
              ...(filters.skuName && { skuName: filters.skuName }),
              ...(filters.unitOfMeasure && {
                unitOfMeasure: filters.unitOfMeasure,
              }),
              ...(filters.productId && { productId: filters.productId }),
              ...(filters.meterId && { meterId: filters.meterId }),
              ...(filters.effectiveAfter && {
                effectiveAfter: filters.effectiveAfter,
              }),
              ...(filters.effectiveBefore && {
                effectiveBefore: filters.effectiveBefore,
              }),
              ...(filters.productName && { productName: filters.productName }),
            }
          : isFamily
          ? {
              ...(filters.family && { family: filters.family }),
            }
          : {
              ...(filters.region && { region: filters.region }),
              ...(filters.name && { name: filters.name }),
              ...(filters.family && { family: filters.family }),
              ...(filters.tier && { tier: filters.tier }),
              ...(filters.size && { size: filters.size }),
              ...(filters.minVCPUs && { minVCPUs: filters.minVCPUs }),
              ...(filters.maxVCPUs && { maxVCPUs: filters.maxVCPUs }),
              ...(filters.minMemoryGB && { minMemoryGB: filters.minMemoryGB }),
              ...(filters.maxMemoryGB && { maxMemoryGB: filters.maxMemoryGB }),
              ...(filters.acceleratedNetworking && {
                acceleratedNetworking: filters.acceleratedNetworking,
              }),
              ...(filters.lowPriority && { lowPriority: filters.lowPriority }),
            };

        const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;
        console.log(`Fetching Azure ${dataType} data from: ${url}`);
        const response = await axios.get(url);
        console.log(`API Response (${dataType}):`, response.data);

        const fetchedItems = response.data.data || [];
        setData((prev) => ({
          ...prev,
          azure: {
            ...prev.azure,
            [dataType]: fetchedItems,
          },
        }));
        return fetchedItems;
      } catch (err) {
        console.error(
          `Error fetching Azure ${dataType} data:`,
          err.response?.data || err.message,
        );
        const errorMessage = `Failed to fetch ${dataType} data. ${
          err.response?.data?.message || err.message
        }`;
        setError((prev) => ({
          ...prev,
          azure: { ...prev.azure, [dataType]: errorMessage },
        }));
        setData((prev) => ({
          ...prev,
          azure: {
            ...prev.azure,
            [dataType]: [],
          },
        }));
        return [];
      } finally {
        setLoading((prev) => ({
          ...prev,
          azure: { ...prev.azure, [dataType]: false },
        }));
      }
    },
    [],
  );

  return (
    <AzureDataContext.Provider
      value={{ data, loading, error, fetchAzureData, setData }}
    >
      {children}
    </AzureDataContext.Provider>
  );
};
