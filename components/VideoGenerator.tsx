import React, { useState, useEffect, useRef } from 'react';
import type { Grade } from '../types.ts';
import { generateEducationalVideo, checkVideoOperationStatus } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';

interface VideoGeneratorProps {
    grade: Grade;
    topic: string;
    duration: number;
    onRestart: () => void;
}

const progressMessages = [
    "Sending your idea to the video creation AI...",
    "The AI is now storyboarding your video...",
    "Generating video frames, this can take a minute...",
    "Applying final touches and rendering audio...",
    "Almost there! Your video is being prepared.",
];

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ grade, topic, duration, onRestart }) => {
    const [operationId, setOperationId] = useState<string | null>(null);
    const [status, setStatus] = useState<'in-progress' | 'complete' | 'failed'>('in-progress');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    const pollingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const startGeneration = async () => {
            try {
                const result = await generateEducationalVideo(topic, grade, duration);
                setOperationId(result.operationId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to start video generation.');
                setStatus('failed');
            }
        };
        startGeneration();
    }, [topic, grade, duration]);

    useEffect(() => {
        if (!operationId) return;

        const pollStatus = async () => {
            try {
                const result = await checkVideoOperationStatus(operationId);
                setCurrentMessageIndex(prev => (prev + 1) % progressMessages.length);

                if (result.status === 'complete') {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    // Construct the URL to our secure proxy endpoint
                    const proxiedUrl = `/api/get-video?uri=${encodeURIComponent(result.videoUrl!)}`;
                    setVideoUrl(proxiedUrl);
                    setStatus('complete');
                } else if (result.status === 'failed' || result.status === 'expired') {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setError(`Video generation ${result.status}. Please try again.`);
                    setStatus('failed');
                }
            } catch (err) {
                 if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                 setError(err instanceof Error ? err.message : 'An error occurred while checking status.');
                 setStatus('failed');
            }
        };

        // Poll every 10 seconds, as recommended in the documentation.
        pollingIntervalRef.current = window.setInterval(pollStatus, 10000);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [operationId]);

    const isGenerating = status === 'in-progress';

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Educational Video</h1>
                <p className="text-slate-400 mt-1">Grade {grade} &bull; {topic}</p>
            </div>

            {/* Content */}
            <div className="aspect-video w-full bg-slate-950/50 rounded-lg flex items-center justify-center border border-slate-800">
                {isGenerating && (
                    <div className="text-center p-4">
                        <LoadingSpinner />
                        <p className="text-slate-300 mt-4 text-lg font-medium">{progressMessages[currentMessageIndex]}</p>
                        <p className="text-slate-400 mt-2 text-sm">Video generation can take a few minutes. Please keep this window open.</p>
                    </div>
                )}
                {status === 'complete' && videoUrl && (
                    <video src={videoUrl} controls autoPlay className="w-full h-full rounded-lg" />
                )}
                 {status === 'failed' && (
                    <div className="text-center p-4">
                        <p className="font-semibold text-red-400">Video generation failed.</p>
                        {error && <p className="text-slate-300 text-sm mt-1">{error}</p>}
                    </div>
                 )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={onRestart}
                    className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors"
                >
                    Start Over
                </button>
                 {status === 'complete' && videoUrl && (
                    <a
                        href={videoUrl}
                        download={`curio-kid-${topic.replace(/\s+/g, '-')}.mp4`}
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