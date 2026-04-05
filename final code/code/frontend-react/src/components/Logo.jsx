import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo Component - Reusable Brand Logo
 * Displays the Rivaansh Lifesciences logo with responsive sizing
 * Clicking navigates to home page using React Router
 */
const Logo = ({ showText = true, className = "" }) => {
    return (
        <Link 
            to="/" 
            className={`flex items-center gap-3 shrink-0 p-1 rounded-lg transition-all duration-200 hover:bg-slate-100 hover:shadow-sm group ${className}`}
            title="Rivaansh Lifesciences - Clinical Pharmacy"
        >
            {/* Logo SVG */}
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 relative">
                <svg 
                    viewBox="0 0 200 200" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
                >
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="95" fill="#0a7c6e" opacity="0.1"/>
                    
                    {/* DNA Helix base */}
                    <g stroke="#0a7c6e" strokeWidth="3" fill="none" strokeLinecap="round">
                        {/* Left spiral */}
                        <path d="M 80 50 Q 70 70 80 90 Q 90 110 80 130 Q 70 150 80 170" opacity="0.8"/>
                        {/* Right spiral */}
                        <path d="M 120 50 Q 130 70 120 90 Q 110 110 120 130 Q 130 150 120 170" opacity="0.8"/>
                    </g>
                    
                    {/* Connection lines */}
                    <g stroke="#0a7c6e" strokeWidth="2.5">
                        <line x1="80" y1="70" x2="120" y2="70" opacity="0.6"/>
                        <line x1="80" y1="110" x2="120" y2="110" opacity="0.6"/>
                        <line x1="80" y1="150" x2="120" y2="150" opacity="0.6"/>
                    </g>
                    
                    {/* Plus symbol (pharmacy) */}
                    <g fill="#e8472a">
                        <rect x="95" y="85" width="4" height="30" rx="2"/>
                        <rect x="80" y="100" width="30" height="4" rx="2"/>
                    </g>
                    
                    {/* Center accent circle */}
                    <circle cx="100" cy="100" r="8" fill="none" stroke="#e8472a" strokeWidth="2"/>
                </svg>
            </div>

            {/* Logo Text - Hidden on mobile, shown on desktop */}
            {showText && (
                <div className="hidden sm:flex flex-col leading-none">
                    <h1 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                        Rivaansh
                    </h1>
                    <p className="text-[9px] md:text-xs font-bold text-emerald-700 tracking-widest uppercase">
                        LifeSciences
                    </p>
                </div>
            )}
        </Link>
    );
};

export default Logo;
