import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink, Calendar, MapPin, Briefcase } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { API_URL } from '../api';

const UserHistory = ({ language }) => {
    const { user } = useUser();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        fetch(`${API_URL}/history/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load history", err);
                setLoading(false);
            });
    }, [user]);

    if (!user) return (
        <div className="p-8 text-center bg-slate-900 rounded-2xl border border-white/10">
            <p className="text-gray-400">Please sign in to view your search history.</p>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-gray-400">Loading history...</div>;

    if (history.length === 0) return (
        <div className="p-8 text-center bg-slate-900 rounded-2xl border border-white/10">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
            <p className="text-gray-400">Your recent scheme searches will appear here.</p>
        </div>
    );

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                {language === 'hi' ? 'मेरा इतिहास' : 'My Search History'}
            </h3>

            <div className="space-y-4">
                {history.map((item) => (
                    <div key={item._id} className="bg-slate-800/50 border border-white/5 p-4 rounded-xl hover:bg-slate-800 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {item.profile.state}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {item.profile.occupation}
                                    </span>
                                </div>
                                <h4 className="text-white font-medium">
                                    Found <span className="text-green-400">{item.schemesFound} Schemes</span>
                                </h4>
                                {item.topSchemes && item.topSchemes.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-1 truncate max-w-lg">
                                        {item.topSchemes.join(", ")}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserHistory;
