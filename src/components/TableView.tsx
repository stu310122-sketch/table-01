import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { ElementData } from '../data';
import { CATEGORIES } from '../constants';

interface TableViewProps {
    elements: ElementData[];
    tableMode: string;
    setTableMode: (mode: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    phaseFilter: string | number;
    setPhaseFilter: (filter: string | number) => void;
    onSelectElement: (el: ElementData) => void;
    onSelectOrbital: (orb: string) => void;
    onBack: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
    elements,
    tableMode,
    setTableMode,
    searchTerm,
    setSearchTerm,
    phaseFilter,
    setPhaseFilter,
    onSelectElement,
    onSelectOrbital,
    onBack
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const objectsRef = useRef<CSS3DObject[]>([]);
    const targetsRef = useRef<Record<string, THREE.Object3D[]>>({ table: [], sphere: [], helix: [], grid: [] });
    const renderRef = useRef<() => void>();
    const transformFnRef = useRef<((layout: string, duration: number) => void) | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<TrackballControls | null>(null);

    const [currentLayout, setCurrentLayout] = useState('table');
    const [hasError, setHasError] = useState<string | null>(null);

    // Dynamic Updates for Classes (Color & Opacity)
    useEffect(() => {
        try {
            if (objectsRef.current.length === 0) return;
            elements.forEach((el, i) => {
                const matchesSearch = !searchTerm || el.name.includes(searchTerm) || el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || el.z.toString() === searchTerm;
                const matchesPhase = phaseFilter === 'all' || el.phase === phaseFilter;
                const isDimmed = !matchesSearch || !matchesPhase;
                
                let catHex = CATEGORIES[el.category] || CATEGORIES[el.cat]?.hex || '#3366ff';
                if (tableMode === 'config') {
                    const colors: Record<string, {hex: string, rgb: string}> = {
                        s: { hex: '#ff1a53', rgb: '255, 26, 83' },
                        p: { hex: '#ff8c00', rgb: '255, 140, 0' },
                        d: { hex: '#00d4ff', rgb: '0, 212, 255' },
                        f: { hex: '#00ff2a', rgb: '0, 255, 42' }
                    };
                    catHex = colors[el.block]?.hex || catHex;
                } else if (tableMode === 'phase') {
                    const colors: Record<number, {hex: string, rgb: string}> = {
                        0: { hex: '#d6d3d1', rgb: '214, 211, 209' },
                        1: { hex: '#60a5fa', rgb: '96, 165, 250' },
                        2: { hex: '#4ade80', rgb: '74, 222, 128' }
                    };
                    catHex = colors[el.phase]?.hex || catHex;
                }

                const cssObj = objectsRef.current[i];
                if (cssObj && cssObj.element) {
                    const elNode = cssObj.element as HTMLDivElement;
                    elNode.style.opacity = isDimmed ? '0.15' : '1';
                    elNode.style.filter = isDimmed ? 'grayscale(100%)' : 'none';
                    elNode.style.backgroundColor = isDimmed ? 'rgba(0,0,0,0.5)' : `${catHex}40`;
                    elNode.style.borderColor = isDimmed ? 'rgba(255,255,255,0.1)' : `${catHex}cc`;
                    elNode.style.boxShadow = isDimmed ? 'none' : `0 0 12px ${catHex}80`;
                    
                    // Specific inner element updates
                    const symbolEl = elNode.querySelector('.symbol') as HTMLElement;
                    if(symbolEl) symbolEl.style.color = isDimmed ? 'rgba(255,255,255,0.3)' : '#ffffff';
                }
            });
            if (renderRef.current) renderRef.current();
        } catch(e) {
            console.error(e);
        }
    }, [searchTerm, tableMode, phaseFilter, elements]);

    useEffect(() => {
        console.log("=== Scene useEffect MOUNTING ===");
        try {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        const aspect = width / height;

        const fov = 40;
        const verticalFovRad = fov * (Math.PI / 180);
        // Table size limits
        const requiredZHorizontal = 2400 / (2 * Math.tan(verticalFovRad / 2) * aspect);
        const requiredZVertical = 1800 / (2 * Math.tan(verticalFovRad / 2));
        const cameraZ = Math.max(requiredZHorizontal, requiredZVertical) * 1.05; 
        
        const camera = new THREE.PerspectiveCamera( fov, aspect, 1, 15000 );
        camera.position.z = cameraZ;
        cameraRef.current = camera;

        const scene = new THREE.Scene();

        const objects: CSS3DObject[] = [];
        const targets: Record<string, THREE.Object3D[]> = { table: [], sphere: [], helix: [], grid: [] };
        
        objectsRef.current = objects;
        targetsRef.current = targets;

        elements.forEach((el, i) => {
            // Create pure HTML element!
            const elementNode = document.createElement('div');
            elementNode.className = 'element-card group pointer-events-auto'; // Need pointer-events-auto inside the canvas
            elementNode.style.width = '120px';
            elementNode.style.height = '160px';
            elementNode.style.backgroundColor = 'rgba(0,127,127,0.5)';
            elementNode.style.border = '1px solid rgba(127,255,255,0.25)';
            elementNode.style.boxShadow = '0 0 12px rgba(0,255,255,0.5)';
            elementNode.style.textAlign = 'center';
            elementNode.style.cursor = 'pointer';
            elementNode.style.boxSizing = 'border-box';
            elementNode.style.position = 'absolute';
            elementNode.style.transition = 'none'; // TweenJS handles animation
            
            // Mouse interactions
            elementNode.addEventListener('pointerdown', (e) => {
                e.stopPropagation(); // prevent controls from taking it immediately 
                onSelectElement(el);
            });
            
            const numberNode = document.createElement('div');
            numberNode.className = 'number';
            numberNode.textContent = el.z.toString();
            numberNode.style.position = 'absolute';
            numberNode.style.top = '6px';
            numberNode.style.left = '6px';
            numberNode.style.fontSize = '14px';
            numberNode.style.color = 'rgba(255,255,255,0.8)';
            numberNode.style.fontFamily = 'monospace';
            elementNode.appendChild(numberNode);

            const symbolNode = document.createElement('div');
            symbolNode.className = 'symbol';
            symbolNode.textContent = el.symbol;
            symbolNode.style.position = 'absolute';
            symbolNode.style.top = '50%';
            symbolNode.style.left = '50%';
            symbolNode.style.transform = 'translate(-50%, -50%)';
            symbolNode.style.fontWeight = 'bold';
            symbolNode.style.color = '#ffffff';
            symbolNode.style.fontSize = '50px';
            symbolNode.style.fontFamily = 'sans-serif';
            elementNode.appendChild(symbolNode);

            const detailsNode = document.createElement('div');
            detailsNode.className = 'details';
            detailsNode.textContent = el.name + '\n' + el.mass;
            detailsNode.style.position = 'absolute';
            detailsNode.style.bottom = '8px';
            detailsNode.style.left = '0';
            detailsNode.style.right = '0';
            detailsNode.style.fontSize = '12px';
            detailsNode.style.color = 'rgba(255,255,255,0.7)';
            detailsNode.style.whiteSpace = 'pre-wrap';
            elementNode.appendChild(detailsNode);

            const objectCSS = new CSS3DObject(elementNode);
            // Initialize userData for the animation engine
            (objectCSS as any).userData = { 
                isAnimating: false,
                targetPosition: new THREE.Vector3(),
                targetQuaternion: new THREE.Quaternion(),
                delayFrames: 0
            };
            
            // Table layout calculation
            const targetTable = new THREE.Object3D();
            targetTable.position.x = ( el.col * 140 ) - 1330;
            targetTable.position.y = - ( el.row * 180 ) + 990;
            targets.table.push( targetTable );

            // Start neatly organized as the table
            objectCSS.position.copy(targetTable.position);
            objectCSS.quaternion.copy(targetTable.quaternion);
            scene.add( objectCSS );
            objects.push( objectCSS );

            // Sphere layout calculation
            const targetSphere = new THREE.Object3D();
            const l = elements.length;
            const phi = Math.acos( - 1 + ( 2 * i ) / l );
            const theta = Math.sqrt( l * Math.PI ) * phi;
            targetSphere.position.setFromSphericalCoords( 800, phi, theta );
            const vector = new THREE.Vector3().copy( targetSphere.position ).multiplyScalar( 2 ); 
            targetSphere.lookAt( vector );
            targets.sphere.push( targetSphere );

            // Helix layout calculation
            const targetHelix = new THREE.Object3D();
            const hTheta = i * 0.175 + Math.PI;
            const y = - ( i * 8 ) + 450;
            targetHelix.position.setFromCylindricalCoords( 900, hTheta, y );
            const vector2 = new THREE.Vector3(); 
            vector2.x = targetHelix.position.x * 2; 
            vector2.y = targetHelix.position.y; 
            vector2.z = targetHelix.position.z * 2; 
            targetHelix.lookAt( vector2 );
            targets.helix.push( targetHelix );

            // Grid layout calculation
            const targetGrid = new THREE.Object3D();
            targetGrid.position.x = ( ( i % 5 ) * 400 ) - 800;
            targetGrid.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
            targetGrid.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
            targets.grid.push( targetGrid );
        });

        const renderer = new CSS3DRenderer();
        renderer.setSize( width, height );
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        container.appendChild( renderer.domElement );

        const controls = new TrackballControls( camera, renderer.domElement );
        controls.minDistance = 500;
        controls.maxDistance = 6000;
        controlsRef.current = controls;

        const renderCall = () => {
            renderer.render( scene, camera );
        };

        controls.addEventListener( 'change', renderCall );

        renderRef.current = renderCall;

        transformFnRef.current = ( layout: string, duration: number ) => {
            try {
                const layoutTargets = targetsRef.current[layout];
                if (!layoutTargets) {
                    console.warn("Layout targets not found for:", layout);
                    return;
                }
                setCurrentLayout(layout);

                for ( let i = 0; i < objectsRef.current.length; i ++ ) {
                    const object = objectsRef.current[ i ];
                    const target = layoutTargets[ i ];
                    
                    // Use Quaternion for rotation to avoid euler flip issues
                    (object as any).userData.targetPosition = target.position.clone();
                    (object as any).userData.targetQuaternion = target.quaternion.clone();
                    (object as any).userData.isAnimating = true;
                    // Smaller delay for snappier start
                    (object as any).userData.delayFrames = Math.floor(Math.random() * 10);
                }
                
                // Reset camera target for clarity
                if (controlsRef.current) {
                    controlsRef.current.target.set(0, 0, 0);
                    controlsRef.current.update();
                }
                    
                console.log(`Manual transition to ${layout} started!`);
            } catch(e) {
                console.error("Layout change error", e);
                setHasError(String(e));
            }
        };

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame( animate );
            
            let needsRender = false;
            for (let i = 0; i < objectsRef.current.length; i++) {
                const object = objectsRef.current[i];
                const userData = (object as any).userData;
                
                if (userData && userData.isAnimating) {
                    if (userData.delayFrames > 0) {
                        userData.delayFrames--;
                        continue;
                    }
                    
                    const tPos = userData.targetPosition;
                    const tQuat = userData.targetQuaternion;
                    
                    // Slerp and Lerp
                    object.position.lerp(tPos, 0.1);
                    object.quaternion.slerp(tQuat, 0.1);
                    
                    if (object.position.distanceToSquared(tPos) < 0.1) {
                        object.position.copy(tPos);
                        object.quaternion.copy(tQuat);
                        userData.isAnimating = false;
                    }
                    needsRender = true;
                }
            }
            
            controls.update();
            renderCall();
        };
        animate();

        // Add ResizeObserver for robust sizing
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                    renderCall();
                }
            }
        });
        resizeObserver.observe(container);

        // Run dependency updates right after init to apply current mode styles
        const triggerUpdate = () => {
            setPhaseFilter((prev) => prev);
        };
        setTimeout(triggerUpdate, 50);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationId);
            
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild( renderer.domElement );
            }
            
            // CSS3DRenderer doesn't have .dispose(), scene.clear() is enough for basic object cleanup
            scene.clear();
        };
        } catch(e) {
            console.error(e);
            setHasError(String(e));
        }
    }, [elements]);

    const handleLayoutChange = (layout: string) => {
        console.log("Layout change requested:", layout);
        if (transformFnRef.current) {
            transformFnRef.current(layout, 2000);
        }
    };

    if (hasError) {
        return <div className="text-red-500 bg-black z-50 absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white/10 p-4 rounded-xl border border-red-500 max-w-full overflow-auto">
                <h2 className="text-xl font-bold mb-2">Runtime Error</h2>
                <pre className="text-xs whitespace-pre-wrap">{hasError}</pre>
                <button onClick={() => setHasError(null)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Dismiss</button>
            </div>
        </div>;
    }

    return (
        <div className="flex-1 w-full flex flex-col relative overflow-hidden bg-transparent">
            {/* 3D Container Behind UI */}
            <div ref={containerRef} className="absolute inset-0 z-0" style={{zIndex: 10, pointerEvents: 'auto'}}></div>

            <div className="scanlines pointer-events-none z-50"></div>
            
            {/* Top Toolbar */}
            <div className="absolute top-0 w-full z-40 flex flex-col pointer-events-none">
                <div className="glass-panel px-4 py-3 flex items-center justify-between gap-4 border-b border-white/10 shadow-lg pointer-events-auto">
                    <button onClick={onBack} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[#00f0ff] font-bold hover:bg-white/10 transition-colors shadow-sm text-sm shrink-0 font-mono pointer-events-auto">⬅ 回首頁</button>
                    <input type="text" placeholder="搜尋元素..." className="px-4 py-2 rounded-lg border border-white/20 bg-black/30 focus:outline-none focus:border-[#00f0ff] text-white text-sm w-full max-w-[200px] shadow-sm hidden md:block font-mono placeholder-white/30 pointer-events-auto" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {/* Filter / Orbital toolbar */}
                <div className="glass-panel md:px-4 px-2 py-2 w-full border-b border-white/10 shadow-sm pointer-events-none flex justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-[1400px]">
                        <select value={tableMode} onChange={(e) => setTableMode(e.target.value)} className="pointer-events-auto bg-[#0a2540] border border-[#00f0ff]/30 text-[#00f0ff] px-2 py-1.5 rounded-md text-xs sm:text-sm outline-none shadow-[0_0_10px_rgba(0,240,255,0.1)] cursor-pointer font-mono h-auto">
                            <option value="basic">🧪 基礎視角</option>
                            <option value="config">⚛️ 軌域視角 (s/p/d/f)</option>
                            <option value="phase">🌡️ 狀態視角 (固/液/氣)</option>
                        </select>
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <div className="flex bg-black/30 p-1 rounded-md border border-white/10">
                                {['all', 0, 1, 2].map(p => (
                                    <button key={p} onClick={() => setPhaseFilter(p)} className={`px-2 py-1 text-[10px] sm:text-xs font-mono rounded transition-all ${phaseFilter===p?'bg-white/20 text-white':'text-white/50 hover:bg-white/10'}`}>{p==='all'?'全':p===0?'固':p===1?'液':'氣'}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 pointer-events-auto bg-black/30 px-2 py-1 rounded-md border border-white/10">
                            {['s', 'p', 'd', 'f'].map(orb => (
                                <button key={orb} onClick={() => onSelectOrbital(orb)} className={`flex items-center justify-center w-6 h-6 rounded border shadow-sm transition-all hover:scale-110 bg-black/30 font-mono font-bold text-xs ${orb==='s'?'text-red-400 border-red-500/50':orb==='p'?'text-amber-400 border-amber-500/50':orb==='d'?'text-blue-400 border-blue-500/50':'text-green-400 border-green-500/50'}`}>{orb.toUpperCase()}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls Toolbar */}
            <div className="absolute bottom-4 w-full z-50 flex flex-col items-center pointer-events-none px-2 gap-2">
                
                {/* View Controls */}
                <div className="flex items-center gap-1 sm:gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]" style={{ pointerEvents: 'auto' }}>
                    {[
                        { id: 'table', label: '正常平面' },
                        { id: 'sphere', label: '變化：球體' },
                        { id: 'helix', label: '變化：螺旋' },
                        { id: 'grid', label: '變化：網格' },
                    ].map(l => (
                        <button 
                            key={l.id} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLayoutChange(l.id); }} 
                            className={`px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-mono font-bold rounded-lg transition-all ${currentLayout===l.id?'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]':'text-[#00f0ff] hover:bg-[#00f0ff]/20'}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                <div className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest bg-black/50 px-4 py-1.5 rounded-full border border-white/10 transition-all pointer-events-none">
                    DRAG TO ROTATE • SCROLL TO ZOOM
                </div>
            </div>
        </div>
    );
};
