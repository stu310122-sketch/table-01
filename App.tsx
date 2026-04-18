import React, { useState, useTransition } from 'react';
import { getElements, ElementData } from './src/data';
import { OrbitalModal } from './src/components/OrbitalModal';
import { ElementModal } from './src/components/ElementModal';
import { QuizView } from './src/components/QuizView';
import { HomeView } from './src/components/HomeView';
import { TableView } from './src/components/TableView';
import { OrbitalsGalleryView } from './src/components/OrbitalsGalleryView';
import { ElementListView } from './src/components/ElementListView';
import { GachaView } from './src/components/GachaView';
import AtomicPackingView from './src/components/AtomicPackingView';
import { SplashScreen } from './src/components/SplashScreen';

export default function App() {
    const [view, setView] = useState('home'); 
    const [tableMode, setTableMode] = useState('basic'); 
    const [selectedEl, setSelectedEl] = useState<ElementData | null>(null);
    const [selectedOrbital, setSelectedOrbital] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [phaseFilter, setPhaseFilter] = useState<string | number>('all'); 
    const [isPending, startTransition] = useTransition();

    const elements = React.useMemo(() => getElements(), []);

    const handleNavigate = (newView: string) => {
        startTransition(() => {
            setView(newView);
        });
    };

    const renderView = () => {
        const backToHome = () => handleNavigate('home');

        switch(view) {
            case 'home': return <HomeView onNavigate={handleNavigate} />;
            case 'table': return (
                <TableView 
                    elements={elements}
                    tableMode={tableMode}
                    setTableMode={setTableMode}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    phaseFilter={phaseFilter}
                    setPhaseFilter={setPhaseFilter}
                    onSelectElement={setSelectedEl}
                    onSelectOrbital={setSelectedOrbital}
                    onBack={backToHome}
                />
            );
            case 'orbitals_gallery': return (
                <OrbitalsGalleryView 
                    onSelectOrbital={setSelectedOrbital}
                    onBack={backToHome}
                />
            );
            case 'list': return (
                <ElementListView 
                    elements={elements}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSelectElement={setSelectedEl}
                    onBack={backToHome}
                />
            );
            case 'quiz': return <QuizView elements={elements} onBack={backToHome} />;
            case 'stats': return <AtomicPackingView onBack={backToHome} />;
            case 'gacha': return (
                <GachaView 
                    elements={elements}
                    onDraw={setSelectedEl}
                    onBack={backToHome}
                />
            );
            default: return null;
        }
    };

    return (
        <div className="wood-border-container">
            <SplashScreen />
            <div className={`wood-border-inner transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {renderView()}
                {selectedEl && <ElementModal element={selectedEl} onClose={() => setSelectedEl(null)} tableMode={tableMode} />}
                {selectedOrbital && <OrbitalModal type={selectedOrbital} onClose={() => setSelectedOrbital(null)} />}
            </div>
        </div>
    );
}
