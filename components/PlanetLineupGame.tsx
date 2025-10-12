import React, { useState, useEffect } from 'react';
import { PLANETS } from '../constants.ts';

interface PlanetLineupGameProps {
  onEnd: () => void;
}

const PlanetLineupGame: React.FC<PlanetLineupGameProps> = ({ onEnd }) => {
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const [planets, setPlanets] = useState(() => shuffle(PLANETS));
    const [draggedPlanet, setDraggedPlanet] = useState<typeof PLANETS[0] | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const isCorrect = planets.every((p, i) => p.order === i + 1);
        if (isCorrect) {
            setMessage("Correct! You lined up the planets perfectly!");
        } else {
            setMessage(null);
        }
    }, [planets]);

    const handleDragStart = (planet: typeof PLANETS[0]) => {
        setDraggedPlanet(planet);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (targetPlanet: typeof PLANETS[0]) => {
        if (!draggedPlanet || draggedPlanet.name === targetPlanet.name) return;

        const draggedIndex = planets.findIndex(p => p.name === draggedPlanet.name);
        const targetIndex = planets.findIndex(p => p.name === targetPlanet.name);

        const newPlanets = [...planets];
        // Remove the dragged planet and insert it at the target position
        newPlanets.splice(draggedIndex, 1);
        newPlanets.splice(targetIndex, 0, draggedPlanet);

        setPlanets(newPlanets);
        setDraggedPlanet(null);
    };

    const handleReset = () => {
        setPlanets(shuffle(PLANETS));
        setMessage(null);
    };

    const planetColors = {
        Mercury: "bg-gray-400", Venus: "bg-yellow-200", Earth: "bg-blue-500",
        Mars: "bg-red-500", Jupiter: "bg-orange-400", Saturn: "bg-yellow-400",
        Uranus: "bg-teal-300", Neptune: "bg-blue-700"
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Planet Lineup</h1>
                <p className="text-slate-400 mt-2">Drag and drop the planets into the correct order from the Sun.</p>
            </div>
            
            <div className="flex justify-center items-center flex-wrap gap-4 p-4 bg-slate-950/50 rounded-lg min-h-[120px]">
                <div className="text-yellow-400 font-bold">SUN</div>
                {planets.map(planet => (
                    <div
                        key={planet.name}
                        draggable
                        onDragStart={() => handleDragStart(planet)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(planet)}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-black font-bold cursor-grab transition-transform duration-300 ${planetColors[planet.name as keyof typeof planetColors]} ${draggedPlanet?.name === planet.name ? 'opacity-50 scale-110' : ''}`}
                    >
                        {planet.name}
                    </div>
                ))}
            </div>

            <div className="text-center mt-6 min-h-[3rem]">
                {message && (
                    <p className="text-2xl font-semibold text-green-400 animate-fade-in">{message}</p>
                )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
                <button onClick={handleReset} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500">
                    Shuffle
                </button>
                <button onClick={onEnd} className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600">
                    Back to Games
                </button>
            </div>
        </div>
    );
};

export default PlanetLineupGame;
