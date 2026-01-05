import React from 'react';
import { ShieldCheck, Database, UserX, Building2 } from 'lucide-react';

const TrustSection = ({ language, t }) => {
    const isHindi = language === 'hi';

    const cards = [
        {
            icon: UserX,
            title: isHindi ? 'आधार की आवश्यकता नहीं' : 'No Aadhaar Required',
            desc: isHindi ? 'ब्राउज़ करने के लिए किसी भी आईडी को लिंक करने की आवश्यकता नहीं है।' : 'No need to link any ID just to browse schemes.'
        },
        {
            icon: Database,
            title: isHindi ? 'कोई व्यक्तिगत डेटा संग्रहीत नहीं' : 'No Personal Data Stored',
            desc: isHindi ? 'हम आपकी गोपनीयता का सम्मान करते हैं और संवेदनशील डेटा संग्रहीत नहीं करते हैं।' : 'We respect your privacy. No sensitive data is saved.'
        },
        {
            icon: ShieldCheck,
            title: isHindi ? 'गुमनाम एआई प्रोसेसिंग' : 'Anonymous AI Processing',
            desc: isHindi ? 'एआई आपके नाम को जाने बिना आपकी प्रोफाइल का विश्लेषण करता है।' : 'AI analyzes your profile without ever knowing your name.'
        },
        {
            icon: Building2,
            title: isHindi ? 'सरकारी डेटा स्रोत' : 'Gov Data Sources Only',
            desc: isHindi ? 'विश्वसनीयता के लिए केवल आधिकारिक स्रोतों से जानकारी।' : 'Information curated from official sources for reliability.'
        }
    ];

    return (
        <div className="py-16 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full -z-10"></div>

            <div className="text-center mb-12 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <ShieldCheck className="w-4 h-4" />
                    {isHindi ? '100% सुरक्षित और निजी' : '100% Secure & Private'}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                    {isHindi ? 'विश्वास और सुरक्षा' : 'Trusted & Privacy First'}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    {isHindi
                        ? 'आपकी गोपनीयता हमारी priorité है। बिना किसी डर के योजनाओं का लाभ उठाएं।'
                        : 'We prioritize your data security above all else. Explore government schemes anonymously and safely.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
                {cards.map((card, index) => (
                    <div key={index} className="group relative p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-emerald-900/10">
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all shadow-inner">
                                <card.icon className="w-7 h-7 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-100 transition-colors">{card.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{card.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrustSection;
