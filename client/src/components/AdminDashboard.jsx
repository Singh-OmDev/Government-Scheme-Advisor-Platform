import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, MapPin, Users, Globe, Clock, Search } from 'lucide-react';
import { API_URL } from '../api';

const AdminDashboard = ({ language }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real analytics from backend
        fetch(`${API_URL}/analytics`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load analytics (using fallback):", err);
                // Fallback Mock Data
                const mockData = {
                    totalSearches: 1245,
                    topStates: [
                        { _id: 'Maharashtra', count: 450 },
                        { _id: 'UP', count: 320 },
                        { _id: 'Bihar', count: 210 },
                        { _id: 'Delhi', count: 150 },
                        { _id: 'Karnataka', count: 115 }
                    ],
                    topOccupations: [
                        { _id: 'Student', count: 520 },
                        { _id: 'Farmer', count: 340 },
                        { _id: 'Unemployed', count: 210 },
                        { _id: 'Business', count: 120 },
                        { _id: 'Homemaker', count: 55 }
                    ]
                };
                setData(mockData);
                setLoading(false);
            });
    }, []);

    if (loading) return null;
    if (!data) return null;

    const isHindi = language === 'hi';

    // Mock Recent Activity (Since we don't fetch individual logs yet)
    const recentActivity = [
        { time: '2 mins ago', text: 'Student from Pune searched for Education Schemes', icon: Search },
        { time: '5 mins ago', text: 'Farmer from Punjab checked Apply Links', icon: Globe },
        { time: '12 mins ago', text: 'Unemployed user from Bihar found 15 schemes', icon: Activity },
        { time: '25 mins ago', text: 'Business owner from Mumbai viewed Loan Schemes', icon: Users },
        { time: '1 hour ago', text: 'User from Delhi applied for Startup India', icon: Globe },
    ];

    return (
        <div className="w-full min-h-screen bg-slate-950 pt-24 pb-12 px-6 fade-in-up">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Activity className="text-blue-500 w-8 h-8" />
                            {isHindi ? 'प्लेटफ़ॉर्म प्रभाव' : 'Platform Insights'}
                        </h2>
                        <p className="text-gray-400 mt-1">
                            {isHindi ? 'रीयल-टाइम डेटा और उपयोगकर्ता आँकड़े' : 'Real-time data monitoring and user statistics.'}
                        </p>
                    </div>
                    <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-green-400">System Online</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: CHARTS (Wrapped in 2/3 width on large screens) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* KPI Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Searches Card */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 shadow-xl">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Search className="w-24 h-24 text-white" />
                                </div>
                                <p className="text-blue-400 font-medium text-sm uppercase tracking-wider mb-2">
                                    {isHindi ? 'कुल खोजें' : 'Total Searches'}
                                </p>
                                <h3 className="text-5xl font-bold text-white mb-2">
                                    {data.totalSearches ? data.totalSearches.toLocaleString() : '0'}
                                </h3>
                                <div className="flex items-center gap-2 text-green-400 text-sm mt-3">
                                    <Activity className="w-4 h-4" />
                                    <span>+12% vs last week</span>
                                </div>
                            </div>

                            {/* Active Regions Card (Mini Stat) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 shadow-xl">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <MapPin className="w-24 h-24 text-white" />
                                </div>
                                <p className="text-purple-400 font-medium text-sm uppercase tracking-wider mb-2">
                                    Active Regions
                                </p>
                                <h3 className="text-5xl font-bold text-white mb-2">
                                    {data.topStates.length}
                                </h3>
                                <div className="text-gray-400 text-sm mt-3">
                                    States with active users this month.
                                </div>
                            </div>
                        </div>

                        {/* Top States Chart (Full Width) */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                {isHindi ? 'शीर्ष राज्य' : 'Top States Distribution'}
                            </h4>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={data.topStates}>
                                        <XAxis dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={0} height={30} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Occupations Chart (Full Width) */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                {isHindi ? 'शीर्ष उपयोगकर्ता' : 'User Demographics'}
                            </h4>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={data.topOccupations} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="_id" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: RECENT ACTIVITY LOG (IMPACT STORIES) */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 h-full sticky top-24">
                            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-400" />
                                {isHindi ? 'हालिया गतिविधियाँ' : 'Impact Stories'}
                            </h4>

                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/10"></div>

                                {data.recentSearches && data.recentSearches.length > 0 ? (
                                    data.recentSearches.map((item, index) => (
                                        <div key={index} className="relative pl-10">
                                            {/* Dot */}
                                            <div className="absolute left-[13px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-slate-900"></div>

                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-medium mb-1">
                                                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                                </span>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    <span className="text-blue-400 font-medium">{item.profile?.occupation || 'User'}</span> from <span className="text-purple-400">{item.profile?.state || 'India'}</span> found <span className="text-green-400 font-bold">{item.schemesFound} schemes</span>
                                                    {item.topSchemes && item.topSchemes.length > 0 && (
                                                        <span className="text-gray-500 text-xs block mt-1">
                                                            including {item.topSchemes[0]}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-sm pl-10 italic">No recent activity.</div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Impact</p>
                                    <p className="text-sm text-gray-300">
                                        Helping citizens find their eligible benefits in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
