import React from 'react';
import type { Grade } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface VideoGeneratorProps {
    videoUrl: string | null;
    isGenerating: boolean;
    progressMessage: string;
    grade: Grade;
    topic: string;
    onRestart: () => void;
    error: string | null;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ videoUrl, isGenerating, progressMessage, grade, topic, onRestart, error }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Video Generator</h1>
                <p className="text-slate-400 mt-1">Grade {grade} &bull; {topic}</p>
            </div>

            {/* Content */}
            <div className="aspect-video w-full bg-slate-900/50 rounded-lg flex items-center justify-center">
                {isGenerating && (
                    <div className="text-center p-4">
                        <LoadingSpinner />
                        <p className="text-slate-300 mt-4 text-lg font-medium">{progressMessage}</p>
                        <p className="text-slate-400 mt-2 text-sm">Video generation can take several minutes. Please don't close this window.</p>
                    </div>
                )}
                {!isGenerating && videoUrl && (
                    <video src={videoUrl} controls className="w-full h-full rounded-lg" />
                )}
                 {!isGenerating && !videoUrl && (
                    <div className="text-center p-4">
                        <p className="font-semibold text-red-400">Video generation failed or was cancelled.</p>
                        {error && <p className="text-slate-300 text-sm mt-1">{error}</p>}
                        <p className="text-slate-400 mt-2">Please try again.</p>
                    </div>
                 )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                    onClick={onRestart}
                    className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
                >
                    Start Over
                </button>
                 {videoUrl && !isGenerating && (
                    <a
                        href={videoUrl}
                        download={`curio-kid-video-${topic.replace(/\s+/g, '-')}.mp4`}
                        className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors"
                    >
                        Download Video
                    </a>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;
