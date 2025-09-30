import React, { useState, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ScienceLensProps {
    onGenerate: (base64Image: string, mimeType: string, prompt: string) => void;
    isLoading: boolean;
    result: string | null;
    error: string | null;
}

const ScienceLens: React.FC<ScienceLensProps> = ({ onGenerate, isLoading, result, error }) => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setFileError('File is too large. Please select an image under 4MB.');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setFileError('Invalid file type. Please select a JPG, PNG, or WEBP image.');
                return;
            }
            
            setFileError(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !prompt.trim() || isLoading) {
            return;
        }
        try {
            const base64Image = await convertFileToBase64(imageFile);
            onGenerate(base64Image, imageFile.type, prompt.trim());
        } catch (err) {
            setFileError('Could not read the image file.');
        }
    };
    
    return (
         <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="text-center border-b border-slate-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                    Science Lens
                </h1>
                <p className="text-slate-300 mt-4">Upload an image and ask the AI to explain the science behind it.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image Upload Area */}
                <div className="flex flex-col items-center">
                    <div 
                        className="w-full aspect-square bg-slate-950/50 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <div className="text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2">Click to upload an image</p>
                                <p className="text-xs mt-1">(JPG, PNG, WEBP, Max 4MB)</p>
                            </div>
                        )}
                    </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,image/webp" />
                     {fileError && <p className="text-red-400 text-sm mt-2">{fileError}</p>}
                </div>
                
                {/* Prompt and Controls */}
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask a question about the image... e.g., 'What is happening in this picture?' or 'Explain the physics of this.'"
                        rows={5}
                        className="w-full bg-slate-950/50 text-slate-100 p-3 rounded-lg resize-y border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow disabled:opacity-50"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim() || !imageFile}
                        className="mt-4 w-full px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Image'}
                    </button>
                </form>
            </div>

            {/* Result Display */}
            <div className="mt-6 min-h-[100px]">
                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="font-semibold text-red-400">Analysis Failed</p>
                        <p className="text-slate-300 text-sm mt-1">{error}</p>
                    </div>
                )}
                {result && (
                     <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg animate-fade-in">
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">AI Analysis</h3>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result}</p>
                    </div>
                )}
            </div>

         </div>
    );
};

export default ScienceLens;