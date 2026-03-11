
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";
import { searchSchemes } from '../api';
import { ChevronLeft, Search, Loader2 } from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import { translations } from '../translations';

const SearchResultsPage = ({ language }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');

    // Get translations
    const t = translations[language] || translations['en'];

    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true); // Assuming true until we get 0 new results

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            if (!isLoaded || !isSignedIn) return; // Wait for auth

            setLoading(true);
            setError(null);
            setHasMore(true);
            try {
                const token = await getToken();
                const data = await searchSchemes(query, language, token, []);
                const fetchedSchemes = data.schemes || [];
                setResults(fetchedSchemes);
                if (fetchedSchemes.length === 0) setHasMore(false);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch search results. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, language, isLoaded, isSignedIn, getToken]);

    const handleLoadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const token = await getToken();
            const excludeNames = results.map(s => s.name);
            const data = await searchSchemes(query, language, token, excludeNames);
            const newSchemes = data.schemes || [];
            if (newSchemes.length === 0) {
                setHasMore(false);
            } else {
                setResults(prev => [...prev, ...newSchemes]);
            }
        } catch (err) {
            console.error(err);
            // Optionally set an error state here, but alert is fine for a load-more failure
            alert("Failed to load more. Please try again.");
        } finally {
            setLoadingMore(false);
        }
    };

    // Show loading state while Auth is loading or while searching initial batch
    if (!isLoaded || (loading && !results.length)) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-400">Searching for "{query}"...</p>
            </div>
        );
    }

    // Redirect if not signed in
    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
                <p className="mb-4">Please sign in to search schemes.</p>
                <Link to="/sign-in" className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-500">Sign In</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 pb-20">
            {/* Header Spacer */}
            <div className="h-20" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Back Link */}
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Search className="w-6 h-6 text-blue-400" />
                        </div>
                        Search Results
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Found {results.length} schemes for <span className="text-blue-300 font-medium">"{query}"</span>
                    </p>
                </div>

                {error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center">
                        {error}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {results.map((scheme, index) => (
                                <SchemeCard key={`${scheme.name}-${index}`} scheme={scheme} language={language} t={t} />
                            ))}
                        </div>
                        
                        {hasMore && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-medium transition-all text-white disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loadingMore ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                                    ) : (
                                        "Load More Results"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No schemes found</h3>
                        <p className="text-slate-400">Try searching for a different keyword like "Housing", "Students", or "Farmers".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
