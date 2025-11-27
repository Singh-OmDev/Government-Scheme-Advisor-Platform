import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Loader2, ChevronDown, Check } from 'lucide-react';

const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

const genders = ["Male", "Female", "Other"];
const incomes = ["Less than 1 Lakh", "1 Lakh - 3 Lakhs", "3 Lakhs - 5 Lakhs", "More than 5 Lakhs"];
const categories = ["General", "OBC", "SC", "ST"];
const occupations = ["Student", "Unemployed", "Farmer", "Self-Employed", "Salaried"];

const CustomSelect = ({ label, name, value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange({ target: { name, value: option } });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-800 border ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700'} rounded-xl px-4 py-3.5 text-white cursor-pointer flex justify-between items-center transition-all hover:border-slate-600`}
            >
                <span className={value ? 'text-white' : 'text-slate-500'}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        {options.map((option) => (
                            <div
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center text-sm text-slate-200 hover:text-white transition-colors"
                            >
                                {option}
                                {value === option && <Check className="w-4 h-4 text-blue-500" />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InputForm = ({ onSubmit, isLoading, t }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        state: 'Uttar Pradesh',
        city: '',
        annualIncome: 'Less than 1 Lakh',
        category: 'General',
        occupation: 'Student',
        educationLevel: 'Graduate',
        specialConditions: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-600";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1.5 ml-1";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel rounded-3xl p-8 md:p-10 w-full max-w-3xl mx-auto shadow-2xl shadow-blue-900/10 border border-white/10 relative"
        >
        
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{t.findSchemes}</h2>
                <p className="text-slate-400">{t.enterDetails}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClasses}>{t.fullName}</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Om Singh"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>{t.age}</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="21"
                            required
                            className={inputClasses}
                        />
                    </div>

                    <CustomSelect
                        label={t.gender}
                        name="gender"
                        value={formData.gender}
                        options={genders}
                        onChange={handleChange}
                    />

                    <CustomSelect
                        label={t.state}
                        name="state"
                        value={formData.state}
                        options={states}
                        onChange={handleChange}
                    />

                    <div>
                        <label className={labelClasses}>{t.city}</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Agra"
                            className={inputClasses}
                        />
                    </div>

                    <CustomSelect
                        label={t.annualIncome}
                        name="annualIncome"
                        value={formData.annualIncome}
                        options={incomes}
                        onChange={handleChange}
                    />

                    <CustomSelect
                        label={t.category}
                        name="category"
                        value={formData.category}
                        options={categories}
                        onChange={handleChange}
                    />

                    <div className="col-span-1 md:col-span-2">
                        <CustomSelect
                            label={t.occupation}
                            name="occupation"
                            value={formData.occupation}
                            options={occupations}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-8"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t.analyzing}
                        </>
                    ) : (
                        <>
                            {t.analyzeButton}
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default InputForm;
