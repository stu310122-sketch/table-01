import React, { useState } from 'react';
import { ElementData } from '../data';

interface GachaViewProps {
    elements: ElementData[];
    onDraw: (el: ElementData) => void;
    onBack: () => void;
}

export const GachaView: React.FC<GachaViewProps> = ({ elements, onDraw, onBack }) => {
    const [isDrawing, setIsDrawing] = useState(false);

    const handleDraw = () => {
        if (isDrawing) return;
        setIsDrawing(true);
        setTimeout(() => {
            const randomEl = elements[Math.floor(Math.random() * elements.length)];
            onDraw(randomEl);
            setIsDrawing(false);
        }, 1000);
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="scanlines"></div>
            <button onClick={onBack} className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] font-bold hover:bg-white/10 transition-colors shadow-sm font-mono z-10">⬅ 回首頁</button>
            <div className="text-center z-10">
                <h2 className="text-4xl font-black text-white mb-2 tracking-widest glowing-text">命運盲盒抽卡機</h2>
                <p className="text-[#00f0ff]/70 font-mono mb-10 text-sm tracking-widest">點擊卡牌，抽取你的今日專屬元素！</p>
                <div onClick={handleDraw} className={`mx-auto w-64 h-80 rounded-2xl bg-gradient-to-br from-[#00f0ff]/20 to-[#00f0ff]/5 p-1 cursor-pointer shadow-[0_0_30px_rgba(0,240,255,0.2)] gacha-card ${isDrawing ? 'animate-shake pointer-events-none' : 'animate-float'}`}>
                    <div className="w-full h-full border border-[#00f0ff]/50 rounded-[15px] flex flex-col items-center justify-center relative overflow-hidden bg-black/60 backdrop-blur-sm">
                        <div className="absolute inset-0 pattern-grid opacity-30"></div>
                        <div className="text-8xl mb-4 filter drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">{isDrawing ? '✨' : '❓'}</div>
                        <div className="text-[#00f0ff] font-black text-xl tracking-widest font-mono">{isDrawing ? '抽取中...' : '點擊抽取'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
