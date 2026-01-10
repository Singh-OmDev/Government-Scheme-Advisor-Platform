import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getSavedSchemes, removeSavedScheme } from '../api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SchemeCard from '../components/SchemeCard';
import { translations } from '../translations';
import { Bookmark, Loader2 } from 'lucide-react';

const SavedSchemesPage = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [savedSchemes, setSavedSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en');
    const t = translations[language];

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            setLoading(false);
            return;
        }

        const fetchSaved = async () => {
            try {
                const data = await getSavedSchemes(user.id);
                setSavedSchemes(data);
            } catch (err) {
                console.error("Failed to load saved schemes", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSaved();
    }, [isLoaded, isSignedIn, user]);

    const handleRemove = async (id) => {
        try {
            await removeSavedScheme(id);
            setSavedSchemes(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            console.error("Failed to remove", err);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col">
                <Header language={language} setLanguage={setLanguage} t={t} />
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-xl text-gray-400">Please sign in to view your saved schemes.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Header language={language} setLanguage={setLanguage} t={t} />

            <main className="flex-grow container mx-auto px-4 py-8 mt-16">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Bookmark className="w-8 h-8 text-blue-500" />
                    {language === 'hi' ? 'मेरी सुरक्षित योजनाएं' : 'My Saved Schemes'}
                </h1>

                {savedSchemes.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900 border border-white/10 rounded-2xl">
                        <Bookmark className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl text-gray-300 mb-2">No Saved Schemes</h3>
                        <p className="text-gray-500">Bookmarked schemes will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {savedSchemes.map((item, index) => {
                            // Map saved schema back to SchemeCard expected format
                            const scheme = {
                                ...item.schemeData,
                                // Ensure ID is passed if needed, though SchemeCard mainly uses display data
                            };
                            return (
                                <div key={item._id} className="relative group">
                                    <SchemeCard
                                        scheme={scheme}
                                        index={index}
                                        t={t}
                                        language={language}
                                        initialSavedState={true}
                                        onRemove={() => handleRemove(item._id)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SavedSchemesPage;
