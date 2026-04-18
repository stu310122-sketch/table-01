import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const PACKING_TYPES = [
    { id: 'sc', name: '簡單立方 (SC)', desc: '配位數: 6\n空間利用率: 52%\n頂點皆有原子' },
    { id: 'bcc', name: '體心立方 (BCC)', desc: '配位數: 8\n空間利用率: 68%\n頂點與中心有原子' },
    { id: 'fcc', name: '面心立方 (FCC)', desc: '配位數: 12\n空間利用率: 74%\n頂點與各面中心有原子' },
    { id: 'hcp', name: '六方最密 (HCP)', desc: '配位數: 12\n空間利用率: 74%\nABAB層狀堆積' },
    { id: 'dfcc', name: '雙面心立方 (DFCC)', desc: '配位數: 4\n空間利用率: 34%\n兩個面心立方晶格互相穿透 (如金剛石)' }
];

interface AtomicPackingViewProps {
    onBack: () => void;
}

const AtomicPackingView: React.FC<AtomicPackingViewProps> = ({ onBack }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [packingType, setPackingType] = useState('sc');
    const [showAxes, setShowAxes] = useState(true);
    
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 1;
        const height = container.clientHeight || 1;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x02111d);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(5, 4, 6);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        const axesHelper = new THREE.AxesHelper(3);
        axesHelper.visible = showAxes;
        scene.add(axesHelper);

        const group = new THREE.Group();
        scene.add(group);

        const atomMat = new THREE.MeshPhongMaterial({ color: 0x00f0ff, shininess: 100, transparent: true, opacity: 0.8 });
        const atomGeo = new THREE.SphereGeometry(0.4, 32, 32);

        const addAtom = (x: number, y: number, z: number, scale = 1, color?: number) => {
            const mat = color ? new THREE.MeshPhongMaterial({ color: color, shininess: 100, transparent: true, opacity: 0.8 }) : atomMat;
            const mesh = new THREE.Mesh(atomGeo, mat);
            mesh.position.set(x, y, z);
            mesh.scale.set(scale, scale, scale);
            group.add(mesh);
        };

        const addWireframeBox = (size: number) => {
            const geo = new THREE.BoxGeometry(size, size, size);
            const edges = new THREE.EdgesGeometry(geo);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.2 }));
            group.add(line);
        };

        if (packingType === 'sc') {
            const s = 1.5;
            for (let x of [-s, s]) for (let y of [-s, s]) for (let z of [-s, s]) addAtom(x, y, z);
            addWireframeBox(s * 2);
        } else if (packingType === 'bcc') {
            const s = 1.5;
            for (let x of [-s, s]) for (let y of [-s, s]) for (let z of [-s, s]) addAtom(x, y, z);
            addAtom(0, 0, 0);
            addWireframeBox(s * 2);
        } else if (packingType === 'fcc') {
            const s = 1.5;
            for (let x of [-s, s]) for (let y of [-s, s]) for (let z of [-s, s]) addAtom(x, y, z);
            addAtom(s, 0, 0); addAtom(-s, 0, 0);
            addAtom(0, s, 0); addAtom(0, -s, 0);
            addAtom(0, 0, s); addAtom(0, 0, -s);
            addWireframeBox(s * 2);
        } else if (packingType === 'hcp') {
            const r = 1.2;
            const h = 2.0;
            for (let layer of [-h/2, h/2]) {
                addAtom(0, layer, 0);
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    addAtom(Math.cos(angle) * r, layer, Math.sin(angle) * r);
                }
            }
            const midR = r * 0.58;
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + Math.PI/6;
                addAtom(Math.cos(angle) * midR, 0, Math.sin(angle) * midR);
            }
            const pts = [];
            for(let i=0; i<=6; i++) {
                const a = (i/6)*Math.PI*2;
                pts.push(new THREE.Vector3(Math.cos(a)*r, h/2, Math.sin(a)*r));
            }
            const hexGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const hexLineTop = new THREE.Line(hexGeo, new THREE.LineBasicMaterial({color: 0x00f0ff, opacity: 0.2, transparent: true}));
            const hexLineBottom = hexLineTop.clone(); hexLineBottom.position.y = -h/2; hexLineTop.position.y = h/2;
            group.add(hexLineTop, hexLineBottom);
            for(let i=0; i<6; i++) {
                const a = (i/6)*Math.PI*2;
                const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*r, h/2, Math.sin(a)*r), new THREE.Vector3(Math.cos(a)*r, -h/2, Math.sin(a)*r)]);
                group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color: 0x00f0ff, opacity: 0.2, transparent: true})));
            }
        } else if (packingType === 'dfcc') {
            const s = 1.5;
            for (let x of [-s, s]) for (let y of [-s, s]) for (let z of [-s, s]) addAtom(x, y, z);
            addAtom(s, 0, 0); addAtom(-s, 0, 0);
            addAtom(0, s, 0); addAtom(0, -s, 0);
            addAtom(0, 0, s); addAtom(0, 0, -s);
            
            const offset = s / 2;
            addAtom(offset, offset, offset, 1, 0x10b981);
            addAtom(offset, -offset, -offset, 1, 0x10b981);
            addAtom(-offset, offset, -offset, 1, 0x10b981);
            addAtom(-offset, -offset, offset, 1, 0x10b981);
            
            addWireframeBox(s * 2);
        }

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth || 1;
            const h = container.clientHeight || 1;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        resizeObserver.observe(container);

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            if (container && renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [packingType, showAxes]);

    const resetView = () => {
        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(5, 4, 6);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    };

    return (
        <div className="flex-1 w-full flex flex-col relative overflow-hidden">
            <div className="scanlines"></div>
            <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 glass-panel shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] font-bold hover:bg-white/10 transition-colors shadow-sm font-mono">⬅ 回首頁</button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-widest glowing-text">原子堆積實驗室</h2>
                        <p className="text-xs text-[#00f0ff]/70 font-mono whitespace-pre-line">探索晶體結構與空間排列</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {PACKING_TYPES.map(t => (
                        <button key={t.id} onClick={() => setPackingType(t.id)} className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold border transition-all ${packingType === t.id ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-black/30 border-white/10 text-white/50 hover:bg-white/10'}`}>
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
                <div className="flex-1 relative bg-[#02111d] min-h-[400px]">
                    <div ref={mountRef} className="absolute inset-0 cursor-move" />
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
                        <button onClick={() => setShowAxes(!showAxes)} className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold border shadow-sm transition-all ${showAxes ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]' : 'bg-black/30 border-white/10 text-white/50'}`}>
                            {showAxes ? '✅ 顯示軸線' : '❌ 隱藏軸線'}
                        </button>
                        <button onClick={resetView} className="px-3 py-1.5 rounded-md text-xs font-mono font-bold border bg-black/30 border-white/10 text-white/70 hover:bg-white/10 shadow-sm transition-all">
                            🔄 重設視角
                        </button>
                    </div>
                    <div className="absolute top-4 right-4 glass-panel p-4 rounded-xl border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] max-w-[200px] pointer-events-none z-10">
                        <h4 className="font-black text-[#00f0ff] text-sm mb-2 font-mono">{PACKING_TYPES.find(t => t.id === packingType)?.name}</h4>
                        <p className="text-[10px] text-white/80 font-mono leading-relaxed whitespace-pre-line">{PACKING_TYPES.find(t => t.id === packingType)?.desc}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtomicPackingView;
