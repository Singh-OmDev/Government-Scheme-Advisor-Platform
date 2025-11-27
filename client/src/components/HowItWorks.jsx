import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, BrainCircuit, FileCheck } from 'lucide-react';

const HowItWorks = ({ t }) => {
    const steps = [
        {
            icon: <UserCircle2 className="w-8 h-8 text-blue-400" />,
            title: t?.step1Title || "Enter Details",
            desc: t?.step1Desc || "Provide basic information about yourself."
        },
        {
            icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
            title: t?.step2Title || "AI Analysis",
            desc: t?.step2Desc || "Our AI scans hundreds of schemes for you."
        },
        {
            icon: <FileCheck className="w-8 h-8 text-green-400" />,
            title: t?.step3Title || "Get Results",
            desc: t?.step3Desc || "Receive a personalized list of benefits."
        }
    ];

    return (
        <div className="py-10">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">{t?.howItWorks || "How It Works"}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="mb-4 p-3 bg-slate-900 rounded-xl border border-white/10">
                            {step.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-400">{step.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HowItWorks;
