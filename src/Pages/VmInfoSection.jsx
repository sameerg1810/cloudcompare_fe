import React from "react";
import {
  MapPin,
  Server,
  Layers,
  Tag,
  HardDrive,
  MemoryStick,
  Cpu,
  BarChart2,
  Network,
  Shield,
  Settings,
  Radio,
  Database,
  Globe,
  Monitor,
  Download,
  Activity,
  Zap,
} from "lucide-react";

// Map backend region codes to human-readable names
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

const VmInfoSection = ({ vmData, error }) => {
  if (error) {
    return (
      <div className="lg:col-span-3 bg-darkPurple-50 p-6 rounded-lg shadow-inner border border-darkPurple-200 max-w-2xl">
        <div className="flex flex-col items-center justify-center h-64 bg-red-100/50 rounded-lg shadow-inner border border-red-500 text-red-700">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p className="font-medium text-xl text-center">{error}</p>
          <p className="text-sm mt-2 text-red-600">
            Ensure backend `azurevminfojune` endpoint is correct and has data.
          </p>
        </div>
      </div>
    );
  }

  if (!vmData) {
    return (
      <div className="lg:col-span-3 bg-darkPurple-50 p-6 rounded-lg shadow-inner border border-darkPurple-200 max-w-2xl">
        <div className="text-center text-darkPurple-700 text-xl py-12">
          <i className="fas fa-info-circle text-4xl mb-4 text-darkPurple-500"></i>
          <p>No detailed information available for this VM.</p>
          <p className="text-base mt-2">
            Ensure the region and VM size are correct.
          </p>
        </div>
      </div>
    );
  }

  const FIELD_CONFIG = [
    {
      section: "General",
      fields: [
        {
          key: "Region",
          label: "Region",
          icon: MapPin,
          format: (v) => REGION_DISPLAY_NAMES[v.toLowerCase()] || v,
        },
        { key: "Name", label: "VM Size", icon: Server },
        { key: "Family", label: "Family", icon: Layers },
        { key: "Tier", label: "Tier", icon: Tag },
        { key: "Size", label: "Size", icon: HardDrive },
        {
          key: "VMGenerationsSupported",
          label: "VM Generations Supported",
          icon: Settings,
        },
        {
          key: "VMDeploymentMethod",
          label: "VM Deployment Method",
          icon: Monitor,
        },
        {
          key: "LowPriority",
          label: "Low Priority Available",
          icon: BarChart2,
          format: (v) => (v ? "Yes" : "No"),
        },
      ],
    },
    {
      section: "Compute & Storage",
      fields: [
        { key: "vCPUs", label: "vCPUs", icon: Cpu },
        {
          key: "MemoryGB",
          label: "Memory",
          icon: MemoryStick,
          format: (v) => `${v} GB`,
        },
        { key: "vCPUsPerCore", label: "vCPUs Per Core", icon: Cpu },
        {
          key: "MemoryPervCPU",
          label: "Memory per vCPU",
          icon: MemoryStick,
          format: (v) => `${v} GB`,
        },
        {
          key: "MaxResourceVolumeMB",
          label: "Max Resource Volume",
          icon: Database,
          format: (v) => `${v / 1024} GB`,
        },
        {
          key: "OSVhdSizeMB",
          label: "OS VHD Size",
          icon: HardDrive,
          format: (v) => `${(v / 1024).toFixed(2)} GB`,
        },
        {
          key: "MaxDataDiskCount",
          label: "Max Data Disk Count",
          icon: HardDrive,
        },
        {
          key: "LocalTempStorageGB",
          label: "Local Temp Storage",
          icon: Database,
          format: (v) => `${v} GB`,
        },
        {
          key: "CapacitySupported",
          label: "Capacity Supported",
          icon: Globe,
          format: (v) => (v ? "Yes" : "No"),
        },
        {
          key: "EphemeralOSDiskSupported",
          label: "Ephemeral OS Disk Supported",
          icon: HardDrive,
          format: (v) => (v ? "Yes" : "No"),
        },
      ],
    },
    {
      section: "Networking & Advanced",
      fields: [
        {
          key: "AcceleratedNetworking",
          label: "Accelerated Networking",
          icon: Network,
          format: (v) => (v ? "Yes" : "No"),
        },
        {
          key: "PremiumIO",
          label: "Premium I/O",
          icon: Download,
          format: (v) => (v ? "Yes" : "No"),
        },
        {
          key: "RDMA",
          label: "RDMA",
          icon: Radio,
          format: (v) => (v ? "Yes" : "No"),
        },
        {
          key: "Encryption",
          label: "Encryption Supported",
          icon: Shield,
          format: (v) => (v ? "Yes" : "No"),
        },
        {
          key: "MemoryMaintenance",
          label: "Memory Maintenance",
          icon: Settings,
          format: (v) => (v ? "Yes" : "No"),
        },
        {
          key: "MaxNetworkInterfaces",
          label: "Max Network Interfaces",
          icon: Network,
        },
        { key: "CpuArchitecture", label: "CPU Architecture", icon: Cpu },
      ],
    },
    {
      section: "Disk I/O Performance",
      fields: [
        {
          key: "UncachedDiskIOPS",
          label: "Uncached Disk IOPS",
          icon: Activity,
        },
        {
          key: "UncachedDiskBytesPerSecond",
          label: "Uncached Disk Throughput",
          icon: Zap,
          format: (v) => `${(v / (1024 * 1024)).toFixed(2)} MB/s`,
        },
        {
          key: "TempDiskAndCachedIOPS",
          label: "Cached Disk IOPS",
          icon: Activity,
        },
        {
          key: "TempDiskAndCachedReadBps",
          label: "Cached Read Throughput",
          icon: Download,
          format: (v) => `${(v / (1024 * 1024)).toFixed(2)} MB/s`,
        },
        {
          key: "TempDiskAndCachedWriteBps",
          label: "Cached Write Throughput",
          icon: Download,
          format: (v) => `${(v / (1024 * 1024)).toFixed(2)} MB/s`,
        },
      ],
    },
  ];

  return (
    <div className="lg:col-span-3 bg-darkPurple-50 p-6 rounded-lg shadow-inner border border-darkPurple-200 max-w-2xl">
      <div className="space-y-8">
        {FIELD_CONFIG.map((section) => (
          <div key={section.section} className="space-y-3">
            <h3 className="text-lg font-bold text-darkPurple-700 mb-3 border-b border-darkPurple-300 pb-2">
              {section.section}
            </h3>
            <div className="grid grid-cols-[200px_1fr] gap-x-60 gap-y-2 items-center">
              {section.fields.map((field) => (
                <React.Fragment key={field.key}>
                  <div className="flex items-center space-x-2 text-darkPurple-900 text-sm font-medium">
                    <field.icon className="h-4 w-4 text-darkPurple-500 flex-shrink-0" />
                    <span>{field.label}:</span>
                  </div>
                  <div className="text-darkPurple-900 text-sm">
                    {field.format
                      ? field.format(vmData[field.key])
                      : vmData[field.key] || "N/A"}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {/* Available Regions */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-darkPurple-700 mb-3 border-b border-darkPurple-300 pb-2">
            Available Regions
          </h3>
          {vmData &&
          vmData.availableRegions &&
          vmData.availableRegions.length > 0 ? (
            <ul className="list-disc list-inside">
              {vmData.availableRegions.map((r) => (
                <li key={r} className="text-darkPurple-900 text-sm">
                  {REGION_DISPLAY_NAMES[r.toLowerCase()] || r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-darkPurple-700 text-sm">No regions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VmInfoSection;
