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
    const { user, isSignedIn } = useUser();
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
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
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
                setHasMore(data.schemes.length > 0);

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

    const handleLoadMore = async () => {
        if (isLoadingMore || !userProfile) return;
        setIsLoadingMore(true);
        try {
            const token = await getToken();
            const excludeSchemes = schemes.map(s => s.name);
            const data = await recommendSchemes({
                ...userProfile,
                language,
                userId: user?.id,
                excludeSchemes
            }, token);
            
            if (data.schemes && data.schemes.length > 0) {
                const newSchemes = [...schemes, ...data.schemes];
                setSchemes(newSchemes);
                sessionStorage.setItem('hs_schemes', JSON.stringify(newSchemes));
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error loading more schemes:", err);
            alert("Failed to load more schemes. Please try again.");
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className="min-h-screen relative font-sans selection:bg-[#f97316]/30 z-0">
            {/* Ambient Base Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
                <div className="absolute w-[800px] h-[400px] rounded-full bg-[#f97316]/5 top-0 left-1/2 -translate-x-1/2 blur-[120px]"></div>
            </div>

            {/* Sciemo Grid Background */}
            <div className="grid-bg"></div>

            <Header language={language} setLanguage={setLanguage} t={t} />

            <main className="container mx-auto px-6 py-8 relative z-10 mt-28">

                <div className="max-w-6xl mx-auto space-y-32">
                    {/* HERO SECTION */}
                    <div className="text-center space-y-10">

                        {/* Staggered Typography setup */}
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tighter leading-[1.05]">
                                {language === 'en' ? (
                                    <>
                                        <span className="text-white">Find Your</span>
                                        <span className="text-neutral-500"> Government</span> <br />
                                        <span className="text-[#f97316]">Schemes.</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-white">अपनी</span>
                                        <span className="text-neutral-500"> सरकारी योजनाएं</span> <br />
                                        <span className="text-[#f97316]">खोजें.</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-lg md:text-2xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light text-center">
                                {language === 'en'
                                    ? "Stop guessing your eligibility. Let AI instantly match your profile to hundreds of hidden government grants, subsidies, and schemes designed for you."
                                    : "अपनी पात्रता का अनुमान लगाना बंद करें। AI को तुरंत आपके प्रोफाइल को आपके लिए डिज़ाइन किए गए सैकड़ों छिपे हुए सरकारी अनुदानों, सब्सिडी और योजनाओं से मिलाने दें।"}
                            </p>
                        </div>

                        {!isSignedIn && (
                            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                                <a
                                    href="/sign-in"
                                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#f0f0f0] text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                                >
                                    <span className="relative z-10 flex items-center">
                                        {language === 'en' ? 'Get Started Free' : 'अभी शुरू करें'}
                                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                </a>
                                <div className="flex items-center gap-4 text-sm text-neutral-500 font-mono tracking-wide">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full border border-black bg-neutral-800 flex items-center justify-center text-[10px] text-white">OS</div>
                                        <div className="w-8 h-8 rounded-full border border-black bg-neutral-700 flex items-center justify-center text-[10px] text-white">DB</div>
                                        <div className="w-8 h-8 rounded-full border border-black bg-[#f97316] text-black flex items-center justify-center text-xs">+</div>
                                    </div>
                                    <span>500+ Schemes Indexed</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/5 p-0.5 rounded-3xl pt-0 mt-20 max-w-4xl mx-auto shadow-2xl">
                            <div className="bg-[#050505] p-10 rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter mb-2">10k+</span>
                                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-widest mono-text">{t.citizensHelped}</span>
                            </div>
                            <div className="bg-[#050505] p-10 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-[#f97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-4xl md:text-5xl font-display font-bold text-[#f97316] tracking-tighter mb-2">500+</span>
                                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-widest mono-text">{t.schemesIndexed}</span>
                            </div>
                            <div className="bg-[#050505] p-10 rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter mb-2">24/7</span>
                                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-widest mono-text">{t.aiSupport}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#262626] w-full max-w-4xl mx-auto"></div>

                    <HowItWorks language={language} t={t} />

                    <div className="border-t border-[#262626] w-full max-w-4xl mx-auto"></div>

                    <TrustSection language={language} t={t} />

                    <div className="relative z-20 max-w-4xl mx-auto">
                        {isSignedIn ? (
                            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} language={language} t={t} />
                        ) : (
                            <div className="text-center p-12 bg-[#0a0a0a] border border-[#262626] relative overflow-hidden">
                                <div className="absolute inset-0 grid-bg opacity-50"></div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-display font-bold text-white mb-4 uppercase tracking-tight">
                                        {language === 'en' ? 'Goodbye Bottlenecks. Hello Breakthroughs.' : 'योजनाएं खोजने के लिए साइन इन करें'}
                                    </h3>
                                    <p className="text-neutral-400 mb-10 max-w-xl mx-auto text-lg font-light">
                                        {language === 'en'
                                            ? 'Create an account or sign in to get hyper-personalized, data-driven scheme recommendations tailored to your unique profile.'
                                            : 'अपनी प्रोफाइल के अनुसार व्यक्तिगत योजना सिफारिशें प्राप्त करने के लिए खाता बनाएं या साइन इन करें।'}
                                    </p>
                                    <a
                                        href="/sign-in"
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                                    >
                                        {language === 'en' ? 'Sign In to Continue' : 'जारी रखने के लिए साइन इन करें'}
                                        <span className="ml-3">→</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 font-mono text-sm max-w-4xl mx-auto text-center">
                            [ERROR] {error}
                        </div>
                    )}

                    {showResults && (
                        <div id="results" className="scroll-mt-32 space-y-16 max-w-5xl mx-auto">
                            <SchemeAnalytics schemes={schemes} language={language} />
                            
                            <div>
                                <ResultsSection schemes={schemes} generalAdvice={generalAdvice} language={language} t={t} />
                                
                                {hasMore && (
                                    <div className="flex justify-center mt-10">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all text-white disabled:opacity-50 flex items-center gap-2 shadow-xl"
                                        >
                                            {isLoadingMore ? (
                                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Loading...</>
                                            ) : (
                                                "Load More Recommendations"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border border-[#262626] bg-[#0a0a0a] p-10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 bg-[#f97316] h-full"></div>
                                <h2 className="text-3xl font-display font-bold text-white mb-4 uppercase tracking-tight">
                                    {language === 'en' ? 'Where to Apply?' : 'आवेदन कहां करें?'}
                                </h2>
                                <p className="text-neutral-400 mb-8 max-w-2xl mx-auto font-light">
                                    {language === 'en'
                                        ? 'To apply for these schemes or verify your documents, please visit your nearest Common Service Center (CSC) or Government Office.'
                                        : 'इन योजनाओं के लिए आवेदन करने या अपने दस्तावेजों को सत्यापित करने के लिए, कृपया अपने निकटतम सामान्य सेवा केंद्र (CSC) या सरकारी कार्यालय पर जाएं।'}
                                </p>

                                <a
                                    href="https://locator.csccloud.in/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#262626] hover:bg-[#404040] text-white font-bold uppercase tracking-widest transition-colors border border-[#404040]"
                                >
                                    {language === 'en' ? 'Find Official CSC Center' : 'आधिकारिक CSC केंद्र खोजें'}
                                    <span aria-hidden="true" className="text-[#f97316]">&rarr;</span>
                                </a>
                                <p className="mono-text text-[10px] text-neutral-600 mt-6 tracking-widest">
                                    {language === 'en' ? 'REDIRECTS TO OFFICIAL GOV CSC LOCATOR' : 'आधिकारिक सरकारी CSC लोकेटर पर पुनर्निर्देशित करता'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-24 max-w-5xl mx-auto border-t border-[#262626] pt-12">
                        <Disclaimer language={language} t={t} />
                    </div>
                </div>
            </main >

            <Footer />
        </div >
    );
}

export default HomePage;
