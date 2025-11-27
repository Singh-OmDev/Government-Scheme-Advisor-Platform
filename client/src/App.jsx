import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputForm from './components/InputForm';
import ResultsSection from './components/ResultsSection';
import Disclaimer from './components/Disclaimer';
import HowItWorks from './components/HowItWorks';
import { recommendSchemes } from './api';
import { translations } from './translations';

function App() {
    const [schemes, setSchemes] = useState([]);
    const [generalAdvice, setGeneralAdvice] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [language, setLanguage] = useState('en');

    const t = translations[language];

    // Clear results when language changes to encourage re-search
    React.useEffect(() => {
        setSchemes([]);
        setGeneralAdvice([]);
        setShowResults(false);
    }, [language]);

    const handleFormSubmit = async (userProfile) => {
        setIsLoading(true);
        setError(null);
        setShowResults(false);
        try {
            // Pass language along with profile
            const data = await recommendSchemes({ ...userProfile, language });
            if (data.schemes) {
                setSchemes(data.schemes);
                setGeneralAdvice(data.generalAdvice || []);
                setShowResults(true);
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
        <div className="min-h-screen relative overflow-hidden text-gray-100 font-sans selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-20 bg-[#0f172a]"></div>
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -z-10"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -z-10"></div>

            <Header language={language} setLanguage={setLanguage} />

            <main className="container mx-auto px-4 py-8 relative z-10 mt-16">

                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-6 pt-10">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
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
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            {t.subtitle}
                        </p>

                        <div className="flex justify-center gap-8 pt-4">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-white">10k+</span>
                                <span className="text-xs text-gray-400">{t.citizensHelped}</span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-white">500+</span>
                                <span className="text-xs text-gray-400">{t.schemesIndexed}</span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-white">24/7</span>
                                <span className="text-xs text-gray-400">{t.aiSupport}</span>
                            </div>
                        </div>
                    </div>

                    <HowItWorks language={language} t={t} />

                    <div className="relative z-20">
                        <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} language={language} t={t} />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-center max-w-2xl mx-auto">
                            {error}
                        </div>
                    )}

                    {showResults && (
                        <div id="results" className="scroll-mt-24">
                            <ResultsSection schemes={schemes} generalAdvice={generalAdvice} language={language} t={t} />
                        </div>
                    )}

                    <div className="mt-16">
                        <Disclaimer language={language} t={t} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default App;
