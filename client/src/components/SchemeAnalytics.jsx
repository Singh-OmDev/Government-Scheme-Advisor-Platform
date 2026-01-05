import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SchemeAnalytics = ({ schemes, language }) => {
    // 1. Process Data for Central vs State (Pie Chart)
    const typeCount = schemes.reduce((acc, scheme) => {
        // Normalize type to handle potential casing differences
        const type = (scheme.type || 'Unknown').toLowerCase();
        // Map to display categories
        const key = type.includes('central') ? 'Central Gov' : 'State Gov';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(typeCount).map(key => ({
        name: key,
        value: typeCount[key]
    }));

    // 2. Process Data for Categories/Tags (Bar Chart)
    const tagCount = schemes.reduce((acc, scheme) => {
        let tagsFound = false;

        // Try using existing tags
        if (scheme.tags && Array.isArray(scheme.tags) && scheme.tags.length > 0) {
            scheme.tags.forEach(tag => {
                const cleanTag = tag.trim();
                // Filter out generic tags that don't add value
                if (cleanTag && !['Central', 'State', 'Government', 'Scheme'].includes(cleanTag)) {
                    acc[cleanTag] = (acc[cleanTag] || 0) + 1;
                    tagsFound = true;
                }
            });
        }

        // Fallback: If no valid tags, guess category from Title
        if (!tagsFound && scheme.name) {
            const nameLower = scheme.name.toLowerCase();
            let category = 'General Welfare'; // Default

            if (nameLower.includes('kisan') || nameLower.includes('farmer') || nameLower.includes('krishi')) category = 'Agriculture';
            else if (nameLower.includes('student') || nameLower.includes('scholarship') || nameLower.includes('shiksha')) category = 'Education';
            else if (nameLower.includes('health') || nameLower.includes('ayushman') || nameLower.includes('swasthya')) category = 'Health';
            else if (nameLower.includes('pension') || nameLower.includes('old age')) category = 'Pension';
            else if (nameLower.includes('woman') || nameLower.includes('mahila') || nameLower.includes('girl')) category = 'Women Welfare';
            else if (nameLower.includes('loan') || nameLower.includes('credit') || nameLower.includes('mudra')) category = 'Finance/Loan';
            else if (nameLower.includes('home') || nameLower.includes('awas')) category = 'Housing';

            acc[category] = (acc[category] || 0) + 1;
        }

        return acc;
    }, {});

    const barData = Object.entries(tagCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Sort descending
        .slice(0, 5); // Take top 5

    // Colors
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const BAR_COLOR = '#8b5cf6';

    const isHindi = language !== 'en';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

            {/* Chart 1: Distribution */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-2">
                    {isHindi ? 'योजना वितरण (Scheme Distribution)' : 'Scheme Distribution'}
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#E2E8F0' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Top Focus Areas */}
            <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-2">
                    {isHindi ? 'मुख्य फोकस क्षेत्र (Key Focus Areas)' : 'Key Focus Areas'}
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="value" fill={BAR_COLOR} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default SchemeAnalytics;
