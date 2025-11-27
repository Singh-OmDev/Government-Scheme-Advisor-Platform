import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = ({ t }) => {
    return (
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 flex gap-4 items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
                <h4 className="text-sm font-semibold text-yellow-500 mb-1">{t?.disclaimerTitle || "Disclaimer"}</h4>
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                    {t?.disclaimerText || "This application uses Artificial Intelligence to recommend government schemes. While we strive for accuracy, please verify all details on official government portals before applying."}
                </p>
            </div>
        </div>
    );
};

export default Disclaimer;
