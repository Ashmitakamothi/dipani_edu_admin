import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchUserSalesAnalytics } from "../../store/slices/salesAnalyticsSlice";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Loader,
  XCircle,
  User as UserIcon,
  Mail,
  Eye,
  Award,
  Target,
  Activity,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

const User: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, userData } = useSelector(
    (state: RootState) => state.salesAnalytics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "orderCount" | "totalSpent">("totalSpent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserSalesAnalytics({ token }));
    }
  }, [dispatch]);

  // Memoized analytics calculations
  const analytics = useMemo(() => {
    if (!userData || !Array.isArray(userData)) {
      return {
        totalUsers: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageSpentPerUser: 0,
        averageOrdersPerUser: 0,
        topSpender: null,
      };
    }

    const totalUsers = userData.length;
    const totalRevenue = userData.reduce((sum, user) => sum + user.totalSpent, 0);
    const totalOrders = userData.reduce((sum, user) => sum + user.orderCount, 0);
    const averageSpentPerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    const averageOrdersPerUser = totalUsers > 0 ? totalOrders / totalUsers : 0;
    const topSpender = [...userData].sort((a, b) => b.totalSpent - a.totalSpent)[0];

    return {
      totalUsers,
      totalRevenue,
      totalOrders,
      averageSpentPerUser,
      averageOrdersPerUser,
      topSpender,
    };
  }, [userData]);

  // Filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    if (!userData || !Array.isArray(userData)) return [];

    let filtered = userData.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [userData, searchTerm, sortBy, sortOrder]);

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
            Loading User Sales Analytics...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching customer data and purchase history.
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
            Error Loading User Data
          </p>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (token) dispatch(fetchUserSalesAnalytics({ token }));
            }}
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
            <Users className="text-blue-600" size={32} />
            User Sales Analytics
          </h1>
          <p className="text-gray-600 dark:text-white/70 text-lg">
            Track customer behavior, spending patterns, and purchase history
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {analytics.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users size={40} className="text-blue-400 opacity-70" />
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
                  Avg: {formatCurrency(analytics.averageSpentPerUser)} per user
                </p>
              </div>
            </div>
          </div>
{/* 
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {analytics.averageOrdersPerUser.toFixed(1)} per user
                </p>
              </div>
              <ShoppingCart size={40} className="text-purple-400 opacity-70" />
            </div>
          </div> */}

          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-white/80">
                  Top Spender
                </p>
                <p className="text-lg font-bold text-orange-700 mt-1 truncate max-w-[120px]">
                  {analytics.topSpender?.name || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.topSpender ? formatCurrency(analytics.topSpender.totalSpent) : "No data"}
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
                  placeholder="Search users by name or email..."
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
                  <option className="dark:text-black" value="totalSpent">Total Spent</option>
                  <option className="dark:text-black" value="orderCount">Order Count</option>
                  <option className="dark:text-black" value="name">Name</option>
                  <option className="dark:text-black" value="email">Email</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 border border-gray-300 rounded-md bg-white dark:bg-white/[0.03] hover:bg-gray-100 transition-colors"
                >
                  {getSortIcon(sortBy)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Data Display */}
        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-xl">
            <Users size={50} className="mx-auto mb-4 text-gray-400" />
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-white/[0.06]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Customer {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Email {getSortIcon("email")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("orderCount")}
                    >
                      <div className="flex items-center gap-2">
                        Orders {getSortIcon("orderCount")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("totalSpent")}
                    >
                      <div className="flex items-center gap-2">
                        Total Spent {getSortIcon("totalSpent")}
                      </div>
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
                  {filteredAndSortedUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-blue-50 dark:hover:bg-white/[0.06] transition-colors ${
                        selectedUser?._id === user._id ? "bg-blue-100 dark:bg-white/[0.09]" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white/90">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-white/70">
                              Customer ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail size={16} className="text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900 dark:text-white/90">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingCart size={16} className="text-blue-500 mr-2" />
                          <span className="text-sm font-bold text-blue-600">
                            {user.orderCount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(user.totalSpent)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (user.totalSpent / analytics.totalRevenue) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-white/70 min-w-[40px]">
                            {((user.totalSpent / analytics.totalRevenue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUser(user)}
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

        {/* Selected User Details Modal */}
       {selectedUser && (
  <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center p-4 z-50 mt-10">
    <div className="bg-white dark:bg-white/[0.03] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            Customer Details
          </h2>
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle size={24} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-4">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white/90">
              {selectedUser.name}
            </h3>
            <p className="text-gray-600 dark:text-white/70">
              {selectedUser.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="text-blue-500" size={20} />
              <span className="font-medium text-gray-700 dark:text-white/80">
                Total Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {selectedUser.orderCount.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.06] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-700 dark:text-white/80">
                Total Spent
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(selectedUser.totalSpent)}
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
                selectedUser.totalSpent / selectedUser.orderCount
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
                (selectedUser.totalSpent / analytics.totalRevenue) *
                100
              ).toFixed(1)}
              %
            </p>
          </div> */}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 dark:text-white/80 mb-2">
            Customer Information
          </h4>
          <div className="text-sm text-gray-600 dark:text-white/70 space-y-1">
            <p>
              <span className="font-medium">Customer ID:</span>{" "}
              {selectedUser._id}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {selectedUser.email}
            </p>
            <p>
              <span className="font-medium">Registration Status:</span> Active
              Customer
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

export default User;