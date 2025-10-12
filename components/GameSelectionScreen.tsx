import React from 'react';
import type { AppMode } from '../types.ts';

interface GameSelectionScreenProps {
  onGameSelect: (mode: AppMode) => void;
}

// --- SVG Icons for Games ---
const IconElementMatch: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125A1.125 1.125 0 003 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>;
const IconLabSafety: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
const IconPlanet: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l-3-3m0 0l-3 3m3-3v12m0-12H9.75M12.75 15h3.75M12.75 15l3-3M4.5 6.375a9 9 0 1115 0 9 9 0 01-15 0z" /></svg>;
const IconStateOfMatter: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5v2.25m0-2.25l2.25 1.313M4.5 12l2.25 1.313M4.5 12v2.25m0-2.25l2.25-1.313m0 0l2.25 1.313m0 0l2.25 1.313m0 0l2.25 1.313M9 19.5l2.25-1.313m0 0l2.25-1.313m0 0l2.25-1.313m0 0l2.25-1.313M21 12l-2.25 1.313m0 0l-2.25 1.313m0 0l-2.25 1.313m0 0l-2.25 1.313M3 12l2.25 1.313m0 0l2.25 1.313m0 0l2.25 1.313m0 0l2.25 1.313" /></svg>;
const IconScientificMethod: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>;
const IconFoodChain: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>;
const IconInvention: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconScientistMatch: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const IconRiddle: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.548L16.25 21.75l-.648-1.201a3.375 3.375 0 00-2.456-2.456L12 17.25l1.202-.648a3.375 3.375 0 002.455-2.456L16.25 13.5l.648 1.201a3.375 3.375 0 002.456 2.456L20.25 18l-1.202.648a3.375 3.375 0 00-2.455 2.456z" /></svg>;
const IconAnimalKingdom: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /><path d="M10.875 10.875c.375-.375.375-1.035 0-1.41a.563.563 0 01.8 0l2.625 2.625a.563.563 0 010 .8l-2.625 2.625a.563.563 0 01-.8 0c-.375-.375-.375-1.035 0-1.41zM14.25 14.25c.375.375 1.035.375 1.41 0a.563.563 0 000-.8L13.03 10.825a.563.563 0 00-.8 0c-.375.375-.375 1.035 0 1.41z" /></svg>;
const IconLabTool: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662a4.006 4.006 0 004.006 4.006h7.228a4.006 4.006 0 004.006-4.006zM14.25 12a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" /></svg>;
const IconAnatomy: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-1.336 0-2.613.264-3.805.753a10.46 10.46 0 00-4.42 4.42A10.46 10.46 0 003 13.5c0 1.336.264 2.613.753 3.805a10.46 10.46 0 004.42 4.42c1.192.49 2.47.753 3.805.753s2.613-.264 3.805-.753a10.46 10.46 0 004.42-4.42c.49-1.192.753-2.47.753-3.805s-.264-2.613-.753-3.805a10.46 10.46 0 00-4.42-4.42A10.46 10.46 0 0012 4.5z" /><path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /></svg>;

const games = [
    { mode: 'game_element_match' as AppMode, title: 'Element Match-Up', description: 'Match the chemical symbol to its correct element name.', icon: <IconElementMatch /> },
    { mode: 'game_lab_safety' as AppMode, title: 'Lab Safety Sort', description: 'Is it safe or unsafe? Make the right call for lab procedures.', icon: <IconLabSafety /> },
    { mode: 'game_planet_lineup' as AppMode, title: 'Planet Lineup', description: 'Arrange the planets in their correct order from the Sun.', icon: <IconPlanet /> },
    { mode: 'game_state_of_matter' as AppMode, title: 'State of Matter', description: 'Quickly identify items as solid, liquid, or gas.', icon: <IconStateOfMatter /> },
    { mode: 'game_scientific_method' as AppMode, title: 'Scientific Method', description: 'Put the steps of the scientific method in the right sequence.', icon: <IconScientificMethod /> },
    { mode: 'game_food_chain' as AppMode, title: 'Food Chain Builder', description: 'Assemble a simple food chain from producer to predator.', icon: <IconFoodChain /> },
    { mode: 'game_invention_timeline' as AppMode, title: 'Invention Timeline', description: 'Match famous inventions to the century they were created.', icon: <IconInvention /> },
    { mode: 'game_scientist_match' as AppMode, title: 'Scientist Match-Up', description: 'Match famous scientists to their key discoveries.', icon: <IconScientistMatch /> },
    { mode: 'game_science_riddles' as AppMode, title: 'Science Riddles', description: 'Solve brain-teasing riddles generated by AI.', icon: <IconRiddle /> },
    { mode: 'game_animal_kingdom' as AppMode, title: 'Animal Kingdom', description: 'Classify animals into mammals, birds, reptiles, and more.', icon: <IconAnimalKingdom /> },
    { mode: 'game_lab_tool_match' as AppMode, title: 'Lab Tool Tussle', description: 'Match the laboratory instrument to its correct function.', icon: <IconLabTool /> },
    { mode: 'game_anatomy_quiz' as AppMode, title: 'Anatomy Adventure', description: 'Answer quick questions about the human body.', icon: <IconAnatomy /> },
];

const GameCard: React.FC<{ title: string; description: string; mode: AppMode; onSelect: (mode: AppMode) => void; icon: React.ReactNode; }> = ({ title, description, mode, onSelect, icon }) => (
    <button
        onClick={() => onSelect(mode)}
        className="text-left w-full h-full p-6 bg-slate-900/70 backdrop-blur-sm border-2 border-slate-800 rounded-2xl shadow-lg hover:bg-slate-800/70 hover:border-cyan-500 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 flex flex-col items-center text-center"
    >
        <div className="text-cyan-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow">{description}</p>
    </button>
);

const GameSelectionScreen: React.FC<GameSelectionScreenProps> = ({ onGameSelect }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
          Science Games
        </h1>
        <p className="text-slate-300 mt-3 text-lg">
          Choose a game to play!
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map(game => (
            <GameCard key={game.mode} {...game} onSelect={onGameSelect} />
        ))}
      </div>
    </div>
  );
};

export default GameSelectionScreen;