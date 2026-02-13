import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchBundleSalesAnalytics } from "../../store/slices/salesAnalyticsSlice";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Loader,
  XCircle,
  Eye,
  Award,
  Target,
  Activity,
  BarChart2,
  Gift,
} from "lucide-react";

interface BundleData {
  _id: string;
  title: string;
  orderCount: number;
  totalSales: number;
  bundleId?: string;
}

const Bundle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, bundleData } = useSelector(
    (state: RootState) => state.salesAnalytics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "orderCount" | "totalSales">("totalSales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedBundle, setSelectedBundle] = useState<BundleData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      dispatch(fetchBundleSalesAnalytics({ token }));
    }
  }, [dispatch, token]);

  // Memoized analytics calculations
  const analytics = useMemo(() => {
    if (!bundleData || !Array.isArray(bundleData)) {
      return {
        totalBundles: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageRevenuePerBundle: 0,
        averageOrdersPerBundle: 0,
        topPerformingBundle: null,
      };
    }

    const totalBundles = bundleData.length;
    const totalRevenue = bundleData.reduce((sum, bundle) => sum + bundle.totalSales, 0);
    const totalOrders = bundleData.reduce((sum, bundle) => sum + bundle.orderCount, 0);
    const averageRevenuePerBundle = totalBundles > 0 ? totalRevenue / totalBundles : 0;
    const averageOrdersPerBundle = totalBundles > 0 ? totalOrders / totalBundles : 0;
    const topPerformingBundle = [...bundleData].sort((a, b) => b.totalSales - a.totalSales)[0];

    return {
      totalBundles,
      totalRevenue,
      totalOrders,
      averageRevenuePerBundle,
      averageOrdersPerBundle,
      topPerformingBundle,
    };
  }, [bundleData]);

  // Filtered and sorted bundles
  const filteredAndSortedBundles = useMemo(() => {
    if (!bundleData || !Array.isArray(bundleData)) return [];

    let filtered = bundleData.filter((bundle) =>
      bundle.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filtered;
  }, [bundleData, searchTerm, sortBy, sortOrder]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return <Filter size={16} className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <SortAsc size={16} className="text-blue-500" />
    ) : (
      <SortDesc size={16} className="text-blue-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-white/[0.03]">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-white/[0.06] rounded-lg shadow-xl">
          <Loader className="animate-spin h-10 w-10 text-blue-600 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-white/90">
            Loading Bundle Sales Analytics...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching bundle performance data and sales metrics.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-white/[0.03]">
        <div className="flex flex-col items-center p-6 bg-white dark:bg-white/[0.06] rounded-lg shadow-xl">
          <XCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-white/90">
            Error Loading Bundle Data
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={() => token && dispatch(fetchBundleSalesAnalytics({ token }))}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-white/[0.03] text-gray-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white/90 border-b-4 border-blue-600 pb-4 flex items-center gap-3 mb-2">
            <Package className="text-blue-600" size={32} />
            Bundle Sales Analytics
          </h1>
          <p className="text-gray-600 dark:text-white/70 text-lg">
            Track bundle performance, revenue, and sales trends across product collections
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Active Bundles
                </p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {analytics.totalBundles.toLocaleString()}
                </p>
              </div>
              <Package size={40} className="text-purple-400 opacity-70" />
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {formatCurrency(analytics.averageRevenuePerBundle)} per bundle
                </p>
              </div>
              {/* <DollarSign size={40} className="text-green-400 opacity-70" /> */}
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {analytics.averageOrdersPerBundle.toFixed(1)} per bundle
                </p>
              </div>
              <ShoppingCart size={40} className="text-blue-400 opacity-70" />
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Top Bundle
                </p>
                <p className="text-lg font-bold text-orange-700 mt-1 truncate max-w-[120px]">
                  {analytics.topPerformingBundle?.title.substring(0, 20) || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.topPerformingBundle ? 
                    formatCurrency(analytics.topPerformingBundle.totalSales) : "No data"}
                </p>
              </div>
              <Award size={40} className="text-orange-400 opacity-70" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-300 focus-within:border-blue-500 transition-colors duration-200 shadow-sm overflow-hidden">
                <Search className="text-gray-500 ml-3" size={20} />
                <input
                  type="text"
                  placeholder="Search bundles by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-gray-700 dark:text-white/90 px-3 py-2.5 focus:outline-none placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mr-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-white/80">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] dark:text-white/90 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option className="dark:text-black" value="totalSales">Revenue</option>
                  <option className="dark:text-black" value="orderCount">Orders</option>
                  <option className="dark:text-black" value="title">Bundle Title</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] hover:bg-gray-100 transition-colors"
                >
                  {getSortIcon(sortBy)}
                </button>
              </div>

              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white dark:bg-white/[0.03] text-gray-600"}`}
                >
                  <Gift size={16} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 ${viewMode === "table" ? "bg-blue-500 text-white" : "bg-white dark:bg-white/[0.03] text-gray-600"}`}
                >
                  <BarChart2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Data Display */}
        {filteredAndSortedBundles.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-xl">
            <Package size={50} className="mx-auto mb-4 text-gray-400" />
            <p>No bundles found matching your criteria.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedBundles.map((bundle) => (
              <div
                key={bundle._id}
                className={`bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedBundle?._id === bundle._id ? "border-blue-500 bg-blue-50 dark:bg-white/[0.06]" : "border-gray-200"
                }`}
                onClick={() => setSelectedBundle(bundle)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="text-purple-500" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 line-clamp-2">
                      {bundle.title}
                    </h3>
                  </div>
                  <Eye size={20} className="text-gray-400 hover:text-blue-500 transition-colors" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white/70">Revenue:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(bundle.totalSales)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white/70">Orders:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {bundle.orderCount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white/70">Avg per Order:</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/80">
                      {formatCurrency(bundle.totalSales / bundle.orderCount)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Bundle ID: {bundle._id.substring(0, 8)}...</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-green-500" size={16} />
                      <span className="text-green-600 font-medium">
                        {((bundle.totalSales / analytics.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-white/[0.06]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        Bundle Title {getSortIcon("title")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("totalSales")}
                    >
                      <div className="flex items-center gap-2">
                        Total Revenue {getSortIcon("totalSales")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("orderCount")}
                    >
                      <div className="flex items-center gap-2">
                        Order Count {getSortIcon("orderCount")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider"
                    >
                      Avg per Order
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider"
                    >
                      Performance
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200">
                  {filteredAndSortedBundles.map((bundle) => (
                    <tr
                      key={bundle._id}
                      className={`hover:bg-blue-50 dark:hover:bg-white/[0.06] transition-colors ${
                        selectedBundle?._id === bundle._id ? "bg-blue-100 dark:bg-white/[0.09]" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                              <Package className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white/90 max-w-xs truncate">
                              {bundle.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-white/70">
                              ID: {bundle._id.substring(0, 12)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(bundle.totalSales)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">
                          {bundle.orderCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white/90">
                          {formatCurrency(bundle.totalSales / bundle.orderCount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (bundle.totalSales / analytics.totalRevenue) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-white/70 min-w-[40px]">
                            {((bundle.totalSales / analytics.totalRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBundle(bundle)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Bundle Details Modal */}
       {selectedBundle && (
  <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            Bundle Details
          </h2>
          <button
            onClick={() => setSelectedBundle(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle size={24} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-4">
            <Package className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white/90">
              {selectedBundle.title}
            </h3>
            <p className="text-gray-600 dark:text-white/70">
              Bundle Collection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {/* <DollarSign className="text-green-500" size={20} /> */}
              <span className="font-medium text-gray-700 dark:text-white/80">
                Total Revenue (₹)
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(selectedBundle.totalSales)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="text-blue-500" size={20} />
              <span className="font-medium text-gray-700 dark:text-white/80">
                Total Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {selectedBundle.orderCount.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-500" size={20} />
              <span className="font-medium text-gray-700 dark:text-white/80">
                Average per Order
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                selectedBundle.totalSales / selectedBundle.orderCount
              )}
            </p>
          </div>

          {/* <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-orange-500" size={20} />
              <span className="font-medium text-gray-700 dark:text-white/80">
                Revenue Share
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {(
                (selectedBundle.totalSales / analytics.totalRevenue) *
                100
              ).toFixed(1)}
              %
            </p>
          </div> */}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 dark:text-white/80 mb-2">
            Bundle Information
          </h4>
          <div className="text-sm text-gray-600 dark:text-white/70 space-y-1">
            <p>
              <span className="font-medium">Bundle ID:</span>{" "}
              {selectedBundle._id}
            </p>
            <p>
              <span className="font-medium">Title:</span>{" "}
              {selectedBundle.title}
            </p>
            <p>
              <span className="font-medium">Status:</span> Active Bundle
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default Bundle;