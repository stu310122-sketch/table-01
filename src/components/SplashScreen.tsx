import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2500); // 2.5 seconds visibility
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#02111d] overflow-hidden"
                >
                    {/* Background effects consistent with the app theme */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                        className="relative z-10 text-center px-6"
                    >
                        <motion.h1 
                            className="text-3xl md:text-5xl font-black text-white mb-6 tracking-widest glowing-text"
                            animate={{ 
                                textShadow: [
                                    "0 0 10px rgba(0, 240, 255, 0.5)", 
                                    "0 0 25px rgba(0, 240, 255, 0.8)", 
                                    "0 0 10px rgba(0, 240, 255, 0.5)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            歡迎來到恆河水元素週期表
                        </motion.h1>
                        
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                            className="h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent max-w-sm mx-auto shadow-[0_0_8px_#00f0ff]"
                        />
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="mt-6 text-[#00f0ff] font-mono text-xs tracking-widest uppercase"
                        >
                            Loading Exploratory Systems...
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
