import React from 'react';
import { ElementData } from '../data';
import { CATEGORIES } from '../constants';

interface ElementListViewProps {
    elements: ElementData[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onSelectElement: (el: ElementData) => void;
    onBack: () => void;
}

export const ElementListView: React.FC<ElementListViewProps> = ({
    elements,
    searchTerm,
    setSearchTerm,
    onSelectElement,
    onBack
}) => {
    return (
        <div className="flex-1 w-full flex flex-col p-4 md:p-8 relative">
            <div className="scanlines"></div>
            <div className="max-w-3xl mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] font-bold hover:bg-white/10 transition-colors shadow-sm font-mono">⬅ 回首頁</button>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-widest glowing-text">元素檢索字典</h2>
                </div>
                <input type="text" placeholder="輸入中文名稱或符號..." className="px-4 py-2 rounded-lg border border-white/20 bg-black/30 focus:outline-none focus:border-[#00f0ff] text-white shadow-sm w-full sm:w-64 font-mono placeholder-white/30" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex-1 overflow-auto max-w-3xl mx-auto w-full glass-panel rounded-2xl shadow-sm p-2 custom-scrollbar relative z-10">
                {elements.filter(el => !searchTerm || el.name.includes(searchTerm) || el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || el.z.toString() === searchTerm).map(el => (
                    <div key={el.z} onClick={() => onSelectElement(el)} className="flex items-center p-3 border-b border-white/5 hover:bg-white/5 hover:shadow-[inset_0_0_10px_rgba(0,240,255,0.1)] cursor-pointer transition-all rounded-lg mb-1">
                        <div className="w-12 text-center font-mono text-[#00f0ff]/70 font-bold">{el.z}</div>
                        <div className="w-12 h-12 flex items-center justify-center font-bold text-xl rounded-lg shadow-sm mr-4 tech-card shrink-0" style={{ '--cat-color': CATEGORIES[el.cat]?.hex || '#3366ff', '--cat-color-rgb': CATEGORIES[el.cat]?.rgb || '51, 102, 255' } as React.CSSProperties}>{el.symbol}</div>
                        <div className="flex-1">
                            <div className="font-bold text-lg text-white">{el.name}</div>
                            <div className="text-xs text-[#00f0ff]/70 font-mono">{CATEGORIES[el.cat]?.label}</div>
                        </div>
                        <div className="hidden sm:block text-right font-mono text-sm text-white/50">{el.mass}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
