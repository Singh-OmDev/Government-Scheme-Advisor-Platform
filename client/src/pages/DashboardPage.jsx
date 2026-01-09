import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminDashboard from '../components/AdminDashboard';
import { translations } from '../translations';
import { SignedIn } from '@clerk/clerk-react';
import UserHistory from '../components/UserHistory';

const DashboardPage = () => {

    const [language, setLanguage] = useState('en');
    const t = translations[language];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 flex flex-col">
            <Header language={language} setLanguage={setLanguage} t={t} />

            <main className="flex-grow container mx-auto px-4 py-8 space-y-8 mt-16">
                <SignedIn>
                    <UserHistory language={language} />
                </SignedIn>

                <AdminDashboard language={language} />
            </main>

            <Footer />
        </div>
    );
};

export default DashboardPage;
