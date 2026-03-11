import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Languages, ShieldCheck, BarChart2, HelpCircle, BookmarkCheck, Search, X, Loader2 } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { useDebounce } from '../hooks/useDebounce';
import { searchSchemes } from '../api';

const Header = ({ language, setLanguage, t }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchQuery, 600);
    const { getToken, isSignedIn } = useAuth();

    const isActive = (path) => location.pathname === path;

    React.useEffect(() => {
        const fetchSearchResults = async () => {
            if (!debouncedSearchTerm.trim()) {
                setSearchResults([]);
                return;
            }
            if (!isSignedIn) return;

            setIsSearching(true);
            try {
                const token = await getToken();
                // Send only fetch 3 items for dropdown preview? The API returns up to 10.
                const data = await searchSchemes(debouncedSearchTerm, language, token);
                setSearchResults((data.schemes || []).slice(0, 3)); 
            } catch (err) {
                console.error("Live search failed", err);
            } finally {
                setIsSearching(false);
            }
        };

        fetchSearchResults();
    }, [debouncedSearchTerm, language, isSignedIn, getToken]);

    const handleSearchCheck = (e) => {
        e.preventDefault();
        const queryToSearch = typeof e === 'string' ? e : searchQuery;
        if (queryToSearch.trim()) {
            navigate(`/search?q=${encodeURIComponent(queryToSearch.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:scale-105">
                        <ShieldCheck className="w-6 h-6 text-black" />
                    </div>
                    <span className="font-display font-semibold text-2xl tracking-tight text-white">
                        Scheme<span className="text-[#f97316]">.AI</span>
                    </span>
                </Link>

                {/* Centered Navigation */}
                <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/5 shadow-inner">


                    <SignedIn>
                        <Link
                            to="/saved-schemes"
                            className={`px-6 py-2 text-base font-medium rounded-full transition-all duration-300 ${isActive('/saved-schemes') ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Saved
                        </Link>
                    </SignedIn>
                </nav>

                {/* Right Actions Group */}
                <div className="flex items-center gap-5">
                    {/* Quick Search Bar */}
                    <div className="relative">
                        <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'bg-white/5 w-56 md:w-72 border border-white/10 rounded-full' : 'w-10 rounded-full bg-transparent hover:bg-white/5'} overflow-hidden`}>
                            {isSearchOpen ? (
                                <form onSubmit={handleSearchCheck} className="flex items-center w-full">
                                    <Search className="w-5 h-5 text-neutral-400 ml-4 min-w-5" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search details..."
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white text-base px-3 py-2 placeholder:text-neutral-500 font-sans"
                                    autoFocus
                                    style={{ boxShadow: 'none' }}
                                />
                                    <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="pr-4 text-neutral-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </form>
                            ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="text-neutral-400 hover:text-white transition-colors w-10 h-10 flex items-center justify-center p-0"
                                title="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            )}
                        </div>

                        {/* Live Search Dropdown */}
                        {isSearchOpen && searchQuery.trim().length > 0 && (
                            <div className="absolute top-full mt-2 right-0 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden shadow-black/50 fade-in-up z-50">
                                {isSearching ? (
                                    <div className="p-4 flex items-center justify-center gap-2 text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching schemes...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((scheme, idx) => (
                                            <li key={idx} className="border-b border-white/5 last:border-0">
                                                <button
                                                    onClick={() => handleSearchCheck(scheme.name)}
                                                    className="w-full text-left p-4 hover:bg-white/5 transition-colors flex flex-col gap-1"
                                                >
                                                    <span className="text-sm font-medium text-white line-clamp-1">{scheme.name}</span>
                                                    <span className="text-xs text-slate-400 line-clamp-1">{scheme.description}</span>
                                                </button>
                                            </li>
                                        ))}
                                        <li>
                                            <button
                                                onClick={() => handleSearchCheck(searchQuery)}
                                                className="w-full p-3 text-center text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            >
                                                View all results for "{searchQuery}" &rarr;
                                            </button>
                                        </li>
                                    </ul>
                                ) : debouncedSearchTerm ? (
                                    <div className="p-4 text-sm text-slate-400 text-center">
                                        No quick results found. Press Enter to perform a deep search.
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Utility Tools */}
                    <div className="flex items-center gap-4 border-l border-white/5 pl-5">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-neutral-400 hover:text-white transition-colors uppercase text-[11px] tracking-widest font-bold"
                            title="Change Language"
                        >
                            {language === 'en' ? 'EN / HI' : 'HI / EN'}
                        </button>

                        <Link to="/help" className="p-2.5 text-neutral-400 hover:text-white transition-colors hover:bg-white/5 rounded-full" title="Help">
                            <HelpCircle className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <Link
                                to="/sign-in"
                                className="px-6 py-2.5 bg-white text-black text-base font-semibold rounded-full hover:bg-neutral-200 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            >
                                {language === 'hi' ? 'साइन इन' : 'Login'}
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10 rounded-full border-2 border-white/10 hover:border-white/40 transition-all shadow-sm"
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
