import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { ElementData } from '../data';
import { CATEGORIES } from '../constants';

interface ElementModalProps {
    element: ElementData;
    onClose: () => void;
    tableMode: string;
}

export function ElementModal({ element, onClose, tableMode }: ElementModalProps) {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-sm rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.2)] overflow-hidden border border-[#00f0ff]/30 relative" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-white/20 text-white hover:bg-white/20 transition-colors">
                        <X size={18} />
                    </button>
                    <div 
                        className="h-40 flex flex-col items-center justify-center relative border-b border-white/10"
                        style={{ backgroundColor: `rgba(${CATEGORIES[element.cat]?.rgb || '51, 102, 255'}, 0.15)` }}
                    >
                        <div className="absolute inset-0 opacity-30 pattern-grid"></div>
                        <h2 className="text-8xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">{element.symbol}</h2>
                        <span className="absolute top-4 left-4 bg-black/50 border border-white/20 px-3 py-1 rounded-md text-xs font-mono text-white shadow-sm">Z = {element.z}</span>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-baseline mb-6">
                            <h3 className="text-3xl font-bold text-white tracking-wide">{element.name}</h3>
                            <span className="text-xs px-3 py-1 rounded-md bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-mono">{CATEGORIES[element.cat]?.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/40 border border-white/10 p-4 rounded-xl shadow-inner"><span className="text-[10px] uppercase text-[#00f0ff] font-mono block mb-1">原子量</span><span className="font-mono text-xl font-bold text-white">{element.mass}</span></div>
                            <div className="bg-black/40 border border-white/10 p-4 rounded-xl shadow-inner"><span className="text-[10px] uppercase text-[#00f0ff] font-mono block mb-1">狀態 (25°C)</span><span className={`font-bold text-lg ${element.phase===1?'text-blue-400':element.phase===2?'text-green-400':'text-stone-300'}`}>{element.phase === 0 ? "固體" : element.phase === 1 ? "液體" : element.phase === 2 ? "氣體" : "未知"}</span></div>
                        </div>
                        {tableMode === 'config' ? (
                            <div className="bg-black/60 border border-white/10 rounded-xl p-4 text-center shadow-inner"><span className="text-[10px] uppercase text-[#00f0ff] font-mono block mb-2">電子組態</span><span className="font-mono text-[#00f0ff] text-lg tracking-widest">{element.config}</span></div>
                        ) : (
                            <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-xl p-4 text-left shadow-sm"><span className="text-[10px] uppercase text-[#00f0ff] font-mono block mb-2">角色屬性</span><p className="text-sm text-white/80 leading-relaxed">「{CATEGORIES[element.cat]?.desc}」</p></div>
                        )}
                        <div className="mt-8 flex gap-3">
                            <a href={`https://zh.wikipedia.org/wiki/${element.name}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-mono font-bold transition-all text-center flex items-center justify-center gap-2">
                                <ExternalLink className="w-5 h-5" />
                                維基百科
                            </a>
                            <button onClick={onClose} className="flex-1 py-3 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/40 border border-[#00f0ff]/50 text-[#00f0ff] rounded-xl font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]">關閉終端機</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
