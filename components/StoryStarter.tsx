
import React, { useState } from 'react';
import { generateStoryFromImage, generateSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { Spinner } from './icons/Spinner';

const StoryStarter: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [story, setStory] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isReading, setIsReading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError('Image size should be less than 4MB.');
                return;
            }
            setError('');
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setStory('');
        }
    };

    const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve({ base64, mimeType: file.type });
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleGenerateStory = async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsGenerating(true);
        setError('');
        setStory('');
        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const result = await generateStoryFromImage(base64, mimeType);
            setStory(result);
        } catch (err) {
            setError('Failed to generate story. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReadAloud = async () => {
        if (!story) return;
        setIsReading(true);
        setError('');
        try {
            const audioB64 = await generateSpeech(story);
            if (audioB64) {
                await playAudio(audioB64);
            } else {
                setError('Could not generate audio for the story.');
            }
        } catch (err) {
            setError('Failed to play audio. Please try again.');
            console.error(err);
        } finally {
            setIsReading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-400">AI Story Starter</h2>
            <p className="text-slate-400 text-center mb-6">Upload an image and let Gemini write the opening paragraph of a story.</p>
            
            <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
                <label htmlFor="story-image-upload" className="w-full cursor-pointer">
                    <div className="w-full h-64 border-2 border-dashed border-slate-600 rounded-lg flex flex-col justify-center items-center hover:border-indigo-500 transition-colors">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Story inspiration" className="w-full h-full object-contain rounded-lg p-2" />
                        ) : (
                            <div className="text-center text-slate-400">
                                <UploadIcon className="mx-auto h-12 w-12" />
                                <span>Click to upload an image</span>
                                <p className="text-xs mt-1">PNG, JPG, WEBP up to 4MB</p>
                            </div>
                        )}
                    </div>
                </label>
                <input id="story-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <button onClick={handleGenerateStory} disabled={!imageFile || isGenerating} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition">
                    {isGenerating ? <Spinner /> : <SparklesIcon />}
                    <span>{isGenerating ? 'Generating Story...' : 'Generate Story'}</span>
                </button>
            </div>
            
            {(story || isGenerating) && (
                <div className="w-full max-w-3xl mt-8 bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">Your Story Begins...</h3>
                    {isGenerating ? (
                        <div className="flex justify-center items-center h-24">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{story}</p>
                            <button onClick={handleReadAloud} disabled={isReading} className="mt-4 bg-teal-600 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed transition">
                                {isReading ? <Spinner /> : <SpeakerIcon />}
                                <span>{isReading ? 'Reading...' : 'Read Aloud'}</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoryStarter;
