import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    Users, 
    DollarSign, 
    ShoppingBag, 
    Calendar,
    Filter,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { fetchPartnerAnalytics } from '../../store/slices/partners';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const PartnerEarningsDashboard = () => {
    const dispatch = useAppDispatch();
    const { analytics, loading } = useSelector((state: any) => state.partners);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        dispatch(fetchPartnerAnalytics(dateRange));
    }, [dispatch, dateRange]);

    const stats = analytics?.overall || {};
    const topPartners = analytics?.byPartner || [];
    const timeSeries = analytics?.timeSeries || [];

    const StatCard = ({ title, value, icon: Icon, trend, subValue, color }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/50 min-h-screen">
            <PageBreadcrumb pageTitle="Partner Earnings Dashboard" />

            {/* Header / Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm font-medium text-gray-700">Analytics Overview</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <input 
                        type="date" 
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                    <input 
                        type="date" 
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                    <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Referral Sales" 
                    value={`₹${stats.totalRevenue || 0}`} 
                    icon={ShoppingBag} 
                    color="bg-blue-600"
                    subValue={`${stats.totalOrders || 0} Successful Orders`}
                />
                <StatCard 
                    title="Partner Commissions" 
                    value={`₹${stats.totalCommission || 0}`} 
                    icon={DollarSign} 
                    color="bg-orange-500"
                    subValue={`Avg Rate: ${stats.commissionRate || 10}%`}
                />
                <StatCard 
                    title="Net Platform Revenue" 
                    value={`₹${stats.netRevenue || 0}`} 
                    icon={TrendingUp} 
                    color="bg-green-600"
                    subValue="After partner payouts"
                />
                <StatCard 
                    title="Referred Students" 
                    value={stats.totalStudents || 0} 
                    icon={Users} 
                    color="bg-purple-600"
                    subValue="Active student conversions"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 text-lg">Sales & Commission Trends</h3>
                        <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5 text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Revenue</div>
                            <div className="flex items-center gap-1.5 text-orange-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Commission</div>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value}`, '']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="commission" stroke="#f97316" strokeWidth={3} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <TrendingUp size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800">Partner Performance</h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-[200px]">Top partners contribute to 85% of total referral revenue this month.</p>
                    <div className="mt-8 space-y-4 w-full">
                        {topPartners.slice(0, 3).map((p: any, i: number) => (
                            <div key={p.partnerId} className="w-full">
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5 uppercase">
                                    <span>{p.partnerName}</span>
                                    <span>₹{p.totalRevenue}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-orange-500' : 'bg-purple-600'}`} 
                                        style={{ width: `${(p.totalRevenue / stats.totalRevenue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">Partner Leaderboard</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search partners..." 
                            className="pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-tighter text-[11px]">
                            <tr>
                                <th className="px-6 py-4">Partner Details</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Revenue Generated</th>
                                <th className="px-6 py-4">Commission Paid</th>
                                <th className="px-6 py-4">Conversion</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {topPartners.map((partner: any) => (
                                <tr key={partner.partnerId} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold p-1 border-2 border-white shadow-sm">
                                                {partner.partnerName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none">{partner.partnerName}</p>
                                                <p className="text-xs text-gray-400 mt-1.5 font-mono">{partner.referralCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-700">{partner.totalOrders}</td>
                                    <td className="px-6 py-4 font-bold text-blue-600">₹{partner.totalRevenue}</td>
                                    <td className="px-6 py-4 font-bold text-orange-500">₹{partner.totalCommission}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                                            {partner.totalStudents} Students
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PartnerEarningsDashboard;
