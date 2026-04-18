import React from 'react';

interface HomeViewProps {
    onNavigate: (view: string) => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
    const menuItems = [
        { title: "探索週期表", sub: "全景互動與多重視角切換", icon: "🗺️", view: 'table', color: "border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff]" },
        { title: "3D軌域實驗室", sub: "立體視覺化與子軌域解析", icon: "🌀", view: 'orbitals_gallery', color: "border-[#9933ff]/30 bg-[#9933ff]/10 hover:bg-[#9933ff]/20 text-[#9933ff]" },
        { title: "元素檢索字典", sub: "完整列表與快速搜尋引擎", icon: "📚", view: 'list', color: "border-[#ff9933]/30 bg-[#ff9933]/10 hover:bg-[#ff9933]/20 text-[#ff9933]" },
        { title: "化學隨堂測驗", sub: "挑戰辨識元素的互動遊戲", icon: "✍️", view: 'quiz', color: "border-[#33ff66]/30 bg-[#33ff66]/10 hover:bg-[#33ff66]/20 text-[#33ff66]" },
        { title: "原子堆積實驗室", sub: "晶體結構與空間排列視覺化", icon: "🧊", view: 'stats', color: "border-[#ff3366]/30 bg-[#ff3366]/10 hover:bg-[#ff3366]/20 text-[#ff3366]" },
        { title: "命運抽卡機", sub: "盲盒抽取今日專屬元素", icon: "🎁", view: 'gacha', color: "border-[#ffcc00]/30 bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 text-[#ffcc00]" },
    ];

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div className="scanlines"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="text-center mb-12 relative z-10">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-widest glowing-text uppercase">
                    恆河水之元素週期表
                </h1>
                <p className="text-[#00f0ff] font-mono text-sm md:text-base opacity-80 tracking-[0.2em]">
                    互動式數據與化學探索器
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl px-2 relative z-10">
                {menuItems.map((item, idx) => (
                    <button key={idx} onClick={() => onNavigate(item.view)} className={`group relative overflow-hidden rounded-2xl p-6 glass-panel text-left transition-all duration-300 hover:scale-105 border ${item.color} hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]`}>
                        <div className="flex flex-col gap-4">
                            <div className="text-4xl group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{item.icon}</div>
                            <div>
                                <h3 className="text-xl font-bold tracking-wide text-white">{item.title}</h3>
                                <p className="text-xs text-white/70 mt-2 font-mono opacity-80">{item.sub}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
