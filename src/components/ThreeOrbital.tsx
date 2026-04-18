import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeOrbital = ({ type, subType }: { type: string, subType: string }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const isDragging = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const groupRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x02111d); 

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 6;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.innerHTML = ''; 
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);

        const createThickAxis = (color: number, end: THREE.Vector3) => {
            const mat = new THREE.MeshBasicMaterial({ color: color });
            const axisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, end.length(), 8), mat);
            axisMesh.position.copy(end.clone().multiplyScalar(0.5));
            axisMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), end.clone().normalize());
            group.add(axisMesh);
        };

        // 繪製 X(紅), Y(綠), Z(藍) 軸
        createThickAxis(0xff0000, new THREE.Vector3(2.5, 0, 0)); // X
        createThickAxis(0x00cc00, new THREE.Vector3(0, 2.5, 0)); // Y
        createThickAxis(0x0000ff, new THREE.Vector3(0, 0, 2.5)); // Z

        const mat = new THREE.MeshPhongMaterial({
            color: type === 's' ? 0xfca5a5 : type === 'p' ? 0xfcd34d : type === 'd' ? 0xd6d3d1 : 0x86efac,
            shininess: 90, transparent: true, opacity: 0.85, side: THREE.DoubleSide
        });

        // --- 精準產生軌域形狀的輔助函數 ---
        const addDirectedLobe = (dirVec: THREE.Vector3, distance = 0.65) => {
            const geo = new THREE.SphereGeometry(0.5, 32, 32);
            geo.scale(0.5, 1.4, 0.5); // 產生葉片(水滴)形狀
            const mesh = new THREE.Mesh(geo, mat);
            const pos = dirVec.clone().normalize().multiplyScalar(distance);
            mesh.position.copy(pos);
            
            const normalizedDir = dirVec.clone().normalize();
            // 處理極端反向的旋轉
            if (normalizedDir.y === -1 && normalizedDir.x === 0 && normalizedDir.z === 0) {
                mesh.rotation.x = Math.PI;
            } else {
                mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), normalizedDir);
            }
            group.add(mesh);
        };

        // 根據 subType 生成對應的 3D 形狀
        if (subType === 's') {
            group.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 48), mat));
        } 
        else if (subType === 'px') {
            addDirectedLobe(new THREE.Vector3(1, 0, 0));
            addDirectedLobe(new THREE.Vector3(-1, 0, 0));
        } 
        else if (subType === 'py') {
            addDirectedLobe(new THREE.Vector3(0, 1, 0));
            addDirectedLobe(new THREE.Vector3(0, -1, 0));
        } 
        else if (subType === 'pz') {
            addDirectedLobe(new THREE.Vector3(0, 0, 1));
            addDirectedLobe(new THREE.Vector3(0, 0, -1));
        }
        else if (subType === 'dxy') {
            addDirectedLobe(new THREE.Vector3(1, 1, 0));
            addDirectedLobe(new THREE.Vector3(-1, 1, 0));
            addDirectedLobe(new THREE.Vector3(1, -1, 0));
            addDirectedLobe(new THREE.Vector3(-1, -1, 0));
        }
        else if (subType === 'dx2-y2') {
            addDirectedLobe(new THREE.Vector3(1, 0, 0));
            addDirectedLobe(new THREE.Vector3(-1, 0, 0));
            addDirectedLobe(new THREE.Vector3(0, 1, 0));
            addDirectedLobe(new THREE.Vector3(0, -1, 0));
        }
        else if (subType === 'dyz') {
            addDirectedLobe(new THREE.Vector3(0, 1, 1));
            addDirectedLobe(new THREE.Vector3(0, -1, 1));
            addDirectedLobe(new THREE.Vector3(0, 1, -1));
            addDirectedLobe(new THREE.Vector3(0, -1, -1));
        }
        else if (subType === 'dzx') {
            addDirectedLobe(new THREE.Vector3(1, 0, 1));
            addDirectedLobe(new THREE.Vector3(-1, 0, 1));
            addDirectedLobe(new THREE.Vector3(1, 0, -1));
            addDirectedLobe(new THREE.Vector3(-1, 0, -1));
        }
        else if (subType === 'dz2') {
            addDirectedLobe(new THREE.Vector3(0, 0, 1), 0.7);
            addDirectedLobe(new THREE.Vector3(0, 0, -1), 0.7);
            const torusGeo = new THREE.TorusGeometry(0.45, 0.18, 16, 50);
            const torus = new THREE.Mesh(torusGeo, mat);
            group.add(torus);
        }
        else if (subType === 'f_xyz') {
            for(let x of [-1, 1]) {
                for(let y of [-1, 1]) {
                    for(let z of [-1, 1]) {
                        addDirectedLobe(new THREE.Vector3(x, y, z), 0.7);
                    }
                }
            }
        }
        else if (subType === 'f_z3') {
            addDirectedLobe(new THREE.Vector3(0, 0, 1), 0.8);
            addDirectedLobe(new THREE.Vector3(0, 0, -1), 0.8);
            const tGeo = new THREE.TorusGeometry(0.35, 0.1, 16, 50);
            const t1 = new THREE.Mesh(tGeo, mat); t1.position.z = 0.35; group.add(t1);
            const t2 = new THREE.Mesh(tGeo, mat); t2.position.z = -0.35; group.add(t2);
        }
        else {
            // f (綜合示意)
            const lobeGeo = new THREE.SphereGeometry(0.5, 32, 32); lobeGeo.scale(0.5, 1.4, 0.5);
            ['x','y','z'].forEach(axis => {
                const m1 = new THREE.Mesh(lobeGeo, mat); const m2 = new THREE.Mesh(lobeGeo, mat);
                if(axis==='x') { m1.rotation.z = Math.PI/2; m2.rotation.z = -Math.PI/2; m1.position.x=0.5; m2.position.x=-0.5; }
                if(axis==='y') { m1.position.y=0.5; m2.position.y=-0.5; }
                if(axis==='z') { m1.rotation.x = Math.PI/2; m2.rotation.x = -Math.PI/2; m1.position.z=0.5; m2.position.z=-0.5; }
                group.add(m1, m2);
            });
        }

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

        let frameId: number;
        const animate = () => { frameId = requestAnimationFrame(animate); renderer.render(scene, camera); };
        animate();

        const dom = renderer.domElement;
        const handleStart = (x: number, y: number) => { isDragging.current = true; previousMouse.current = { x, y }; };
        const handleMove = (x: number, y: number) => {
            if (!isDragging.current || !groupRef.current) return;
            groupRef.current.rotation.y += (x - previousMouse.current.x) * 0.01;
            groupRef.current.rotation.x += (y - previousMouse.current.y) * 0.01;
            previousMouse.current = { x, y };
        };
        const handleEnd = () => { isDragging.current = false; };

        dom.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY)); 
        window.addEventListener('mouseup', handleEnd);
        dom.addEventListener('touchstart', (e) => { if(e.touches.length === 1) { e.preventDefault(); handleStart(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
        window.addEventListener('touchmove', (e) => { if(isDragging.current) handleMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        window.addEventListener('touchend', handleEnd);

        return () => { 
            resizeObserver.disconnect();
            cancelAnimationFrame(frameId); 
            if (container && renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
            if(rendererRef.current) rendererRef.current.dispose(); 
        };
    }, [type, subType]); 

    return <div ref={mountRef} className="canvas-interactive absolute inset-0" title="請拖曳以旋轉 3D 視角" />;
};
