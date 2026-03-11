
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SavedSchemesPage from './pages/SavedSchemesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import HelpPage from './pages/HelpPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    const [language, setLanguage] = useState('en');

    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path="/dashboard" element={
                    <>
                        <SignedIn>
                            <DashboardPage language={language} setLanguage={setLanguage} />
                        </SignedIn>
                        <SignedOut>
                            <Navigate to="/sign-in" />
                        </SignedOut>
                    </>
                } />

                <Route path="/saved-schemes" element={
                    <>
                        <SignedIn>
                            <SavedSchemesPage language={language} />
                        </SignedIn>
                        <SignedOut>
                            <Navigate to="/sign-in" />
                        </SignedOut>
                    </>
                } />

                <Route path="/search" element={
                    <>
                        <SignedIn>
                            <SearchResultsPage language={language} />
                        </SignedIn>
                        <SignedOut>
                            <Navigate to="/sign-in" />
                        </SignedOut>
                    </>
                } />

                <Route path="/help" element={<HelpPage />} />
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
