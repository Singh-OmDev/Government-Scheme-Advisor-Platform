import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full py-8 mt-12 border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 text-center">
                <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                    Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for India
                </p>
                <p className="text-gray-600 text-xs mt-2">
                    © {new Date().getFullYear()} AI Government Scheme Advisor. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
