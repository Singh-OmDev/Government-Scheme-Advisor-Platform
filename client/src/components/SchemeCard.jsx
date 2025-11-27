import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, FileText, CheckCircle, MessageSquare, Send, Share2, Gift } from 'lucide-react';
import { chatWithScheme } from '../api';

const SchemeCard = ({ scheme, index, t, language }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleShare = () => {
        const text = `Check out this government scheme: *${scheme.name}*\n\n${scheme.description}\n\nFind more at AI Government Scheme Advisor!`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = { role: 'user', content: chatInput };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const data = await chatWithScheme(scheme, userMsg.content, language);
            const aiMsg = { role: 'ai', content: data.answer };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors group print:break-inside-avoid print:bg-white print:border-gray-300 print:text-black"
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${scheme.type === 'Central'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 print:text-orange-600 print:border-orange-600'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20 print:text-green-600 print:border-green-600'
                            }`}>
                            {scheme.type === 'Central' ? t.central : t.state}
                        </span>
                        <h3 className="text-lg font-semibold text-white mt-2 leading-tight group-hover:text-blue-400 transition-colors print:text-black">
                            {scheme.name}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 print:text-blue-600 print:border-blue-600">
                            <span className="font-bold">{scheme.usefulnessScore}%</span> {t.match}
                        </div>
                        <button
                            onClick={handleShare}
                            className="text-gray-400 hover:text-green-400 transition-colors print:hidden"
                            title={t.share}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {scheme.categoryTags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 print:text-gray-600 print:border-gray-400">
                            {tag}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-gray-300 mb-4 line-clamp-2 print:text-gray-700">
                    {scheme.description}
                </p>

                <div className="flex gap-4 print:hidden">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                        {isExpanded ? t.showLess : t.viewDetails}
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </button>

                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`text-sm font-medium flex items-center gap-1 transition-colors ${showChat ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {t.askAI}
                    </button>
                </div>
            </div>

            {/* Chat Section */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-900/50 border-t border-white/5 print:hidden"
                    >
                        <div className="p-4 space-y-4">
                            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{t.chatTitle}</h4>

                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                                {chatHistory.length === 0 && (
                                    <p className="text-xs text-gray-500 italic">{t.chatPlaceholder}</p>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-700 text-gray-200'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-700 rounded-lg px-3 py-2">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={t.typeQuestion}
                                    className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isChatLoading}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`${isExpanded ? 'block' : 'hidden'} print:block`}>
                <AnimatePresence>
                    {(isExpanded || true) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="bg-slate-900/30 border-t border-white/5 p-6 space-y-6 print:bg-transparent print:border-gray-300 print:text-black">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                        <h4 className="font-semibold text-white text-base flex items-center gap-2 mb-3 print:text-black">
                                            <CheckCircle className="w-5 h-5 text-green-400 print:text-green-600" /> {t.eligibility}
                                        </h4>
                                        <ul className="space-y-2 ml-1">
                                            {scheme.eligibilitySummary.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {scheme.benefits && scheme.benefits.length > 0 && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                            <h4 className="font-semibold text-white text-base flex items-center gap-2 mb-3 print:text-black">
                                                <Gift className="w-5 h-5 text-pink-400 print:text-pink-600" /> {t.benefits}
                                            </h4>
                                            <ul className="space-y-2 ml-1">
                                                {scheme.benefits.map((benefit, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                                                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                        <h4 className="font-semibold text-white text-base flex items-center gap-2 mb-3 print:text-black">
                                            <FileText className="w-5 h-5 text-purple-400 print:text-purple-600" /> {t.documents}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {scheme.requiredDocuments.map((doc, i) => (
                                                <span key={i} className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-sm border border-white/10 print:text-gray-700 print:border-gray-400">
                                                    {doc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                        <h4 className="font-semibold text-white text-base flex items-center gap-2 mb-3 print:text-black">
                                            <ExternalLink className="w-5 h-5 text-blue-400 print:text-blue-600" /> {t.steps}
                                        </h4>
                                        <ol className="space-y-2 ml-1">
                                            {scheme.applicationSteps.map((step, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-200 text-sm">
                                                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold border border-blue-500/30">
                                                        {i + 1}
                                                    </span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default SchemeCard;
