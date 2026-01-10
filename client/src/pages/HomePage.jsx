import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InputForm from '../components/InputForm';
import ResultsSection from '../components/ResultsSection';
import Disclaimer from '../components/Disclaimer';
import HowItWorks from '../components/HowItWorks';
import { recommendSchemes } from '../api';
import { translations } from '../translations';
import SchemeAnalytics from '../components/SchemeAnalytics';
import TrustSection from '../components/TrustSection';

import { useUser, useAuth } from '@clerk/clerk-react';

function HomePage() {
    const { user } = useUser();
    const { getToken } = useAuth();

    // Initialize state from sessionStorage if available
    const [schemes, setSchemes] = useState(() => {
        const saved = sessionStorage.getItem('hs_schemes');
        return saved ? JSON.parse(saved) : [];
    });
    const [generalAdvice, setGeneralAdvice] = useState(() => {
        const saved = sessionStorage.getItem('hs_advice');
        return saved ? JSON.parse(saved) : [];
    });
    const [userProfile, setUserProfile] = useState(() => {
        const saved = sessionStorage.getItem('hs_profile');
        return saved ? JSON.parse(saved) : null;
    });
    const [showResults, setShowResults] = useState(() => {
        return sessionStorage.getItem('hs_show') === 'true';
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('en');

    const t = translations[language];

    // Clear results when language changes to encourage re-search
    React.useEffect(() => {
        setSchemes([]);
        setGeneralAdvice([]);
        setShowResults(false);
        setUserProfile(null);
    }, [language]);

    const handleFormSubmit = async (formData) => {
        setIsLoading(true);
        setError(null);
        setShowResults(false);
        setUserProfile(formData);
        try {
            const token = await getToken();
            const data = await recommendSchemes({
                ...formData,
                language,
                userId: user?.id
            }, token);
            if (data.schemes) {
                setSchemes(data.schemes);
                setGeneralAdvice(data.generalAdvice || []);
                setShowResults(true);

                // Persist to Session Storage
                sessionStorage.setItem('hs_schemes', JSON.stringify(data.schemes));
                sessionStorage.setItem('hs_advice', JSON.stringify(data.generalAdvice || []));
                sessionStorage.setItem('hs_profile', JSON.stringify(formData));
                sessionStorage.setItem('hs_show', 'true');
            } else {
                setError("No schemes found. Please try again.");
            }
        } catch (err) {
            console.error("Error fetching schemes:", err);
            setError("Failed to fetch recommendations. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative font-sans selection:bg-purple-500/30">
            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="blob w-[500px] h-[500px] rounded-full bg-purple-600/20 top-[-10%] left-[-10%] mix-blend-screen"></div>
                <div className="blob w-[600px] h-[600px] rounded-full bg-blue-600/20 bottom-[-10%] right-[-10%] mix-blend-screen animation-delay-2000"></div>
                <div className="blob w-[300px] h-[300px] rounded-full bg-pink-600/20 top-[40%] left-[40%] mix-blend-screen animation-delay-4000"></div>
            </div>

            <Header language={language} setLanguage={setLanguage} />

            <main className="container mx-auto px-4 py-8 relative z-10 mt-20">

                <div className="max-w-5xl mx-auto space-y-20">
                    <div className="text-center space-y-8 pt-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-purple-500/30 bg-purple-900/20 backdrop-blur-sm text-xs font-medium text-purple-300 mb-4">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                            AI-Powered Government Intelligence
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            {language === 'en' ? (
                                <>
                                    Discover Government <br />
                                    <span className="gradient-text">Schemes for You</span>
                                </>
                            ) : (
                                <>
                                    <span className="gradient-text">अपने लिए सरकारी</span> <br />
                                    योजनाएं खोजें
                                </>
                            )}
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                            {t.subtitle}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto">
                            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-all">
                                <span className="text-3xl font-bold text-white tabular-nums tracking-tight">10k+</span>
                                <span className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">{t.citizensHelped}</span>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-all">
                                <span className="text-3xl font-bold text-white tabular-nums tracking-tight">500+</span>
                                <span className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">{t.schemesIndexed}</span>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-all">
                                <span className="text-3xl font-bold text-white tabular-nums tracking-tight">24/7</span>
                                <span className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">{t.aiSupport}</span>
                            </div>
                        </div>
                    </div>

                    <HowItWorks language={language} t={t} />

                    {/* New Trust & Privacy Section */}
                    <TrustSection language={language} t={t} />

                    <div className="relative z-20">
                        <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} language={language} t={t} />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-center max-w-2xl mx-auto">
                            {error}
                        </div>
                    )}

                    {showResults && (
                        <div id="results" className="scroll-mt-24 space-y-12">
                            <SchemeAnalytics schemes={schemes} language={language} />
                            <ResultsSection schemes={schemes} generalAdvice={generalAdvice} language={language} t={t} />

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-center">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    {language === 'en' ? 'Where to Apply?' : 'आवेदन कहां करें?'}
                                </h2>
                                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                                    {language === 'en'
                                        ? 'To apply for these schemes or verify your documents, please visit your nearest Common Service Center (CSC) or Government Office.'
                                        : 'इन योजनाओं के लिए आवेदन करने या अपने दस्तावेजों को सत्यापित करने के लिए, कृपया अपने निकटतम सामान्य सेवा केंद्र (CSC) या सरकारी कार्यालय पर जाएं।'}
                                </p>

                                <a
                                    href="https://locator.csccloud.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {language === 'en' ? 'Find Official CSC Center' : 'आधिकारिक CSC केंद्र खोजें'}
                                    <span aria-hidden="true">&rarr;</span>
                                </a>
                                <p className="text-xs text-gray-500 mt-4">
                                    {language === 'en' ? 'Redirects to the official Government CSC Locator' : 'आधिकारिक सरकारी CSC लोकेटर पर पुनर्निर्देशित करता'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-16">
                        <Disclaimer language={language} t={t} />
                    </div>
                </div>
            </main >

            <Footer />
        </div >
    );
}

export default HomePage;
