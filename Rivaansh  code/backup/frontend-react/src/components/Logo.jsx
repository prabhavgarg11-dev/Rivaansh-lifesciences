import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Logo = ({ showText = true, className = "" }) => {
    return (
        <Link 
            to="/" 
            className={`flex items-center gap-3 shrink-0 group ${className}`}
        >
            <div className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-primary/30 transition-all rounded-xl" />
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="relative w-full h-full bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center p-2 shadow-lg shadow-primary/20"
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        <path d="M12 2L12 4M12 20L12 22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </motion.div>
            </div>

            {showText && (
                <div className="hidden sm:flex flex-col leading-none">
                    <h1 className="text-xl font-display font-black text-slate-900 tracking-tight leading-none mb-0.5">
                        Rivaansh
                    </h1>
                    <p className="text-[9px] font-black text-secondary tracking-[0.25em] uppercase leading-none opacity-80">
                        LifeSciences
                    </p>
                </div>
            )}
        </Link>
    );
};

export default Logo;
