
import React, { useState } from 'react';
import { generateStoryFromImage, generateSpeech, continueStory } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { Spinner } from './icons/Spinner';

const genres = ["Fantasy", "Science Fiction", "Mystery", "Thriller", "Romance", "Horror", "Historical Fiction", "Western"];
const styles = ["Poetic", "Gritty", "Humorous", "Fast-Paced", "Descriptive", "Minimalist", "First-Person POV", "Third-Person Omniscient"];

const StoryStarter: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [story, setStory] = useState<string>('');
    const [inspirationPrompts, setInspirationPrompts] = useState<string[]>([]);
    const [genre, setGenre] = useState<string>(genres[0]);
    const [style, setStyle] = useState<string>(styles[0]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isContinuing, setIsContinuing] = useState<boolean>(false);
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
            setInspirationPrompts([]);
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
        setInspirationPrompts([]);
        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const result = await generateStoryFromImage(base64, mimeType, genre, style);
            setStory(result.story);
            setInspirationPrompts(result.prompts);
        } catch (err: any) {
            setError(err.message || 'Failed to generate story. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleContinueStory = async () => {
        if (!imageFile || !story) return;

        setIsContinuing(true);
        setError('');
        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const nextParagraph = await continueStory(story, base64, mimeType, genre, style);
            setStory(prev => `${prev}\n\n${nextParagraph}`);
        } catch (err) {
            setError('Failed to continue story. Please try again.');
            console.error(err);
        } finally {
            setIsContinuing(false);
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

    const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) => (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
            <select value={value} onChange={onChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-2 text-center text-indigo-400">AI Story Starter</h2>
            <p className="text-slate-400 text-center mb-6">Upload an image, choose a genre and style, and let Gemini begin your story.</p>
            
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
                
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Genre" value={genre} onChange={e => setGenre(e.target.value)} options={genres} />
                    <Select label="Style" value={style} onChange={e => setStyle(e.target.value)} options={styles} />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <button onClick={handleGenerateStory} disabled={!imageFile || isGenerating || isContinuing} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition">
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
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button onClick={handleReadAloud} disabled={isReading || isContinuing || isGenerating} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed transition">
                                    {isReading ? <Spinner /> : <SpeakerIcon />}
                                    <span>{isReading ? 'Reading...' : 'Read Aloud'}</span>
                                </button>
                                <button onClick={handleContinueStory} disabled={isContinuing || isGenerating || isReading} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition">
                                    {isContinuing ? <Spinner /> : <SparklesIcon />}
                                    <span>{isContinuing ? 'Writing...' : 'Continue Writing'}</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            {inspirationPrompts.length > 0 && !isGenerating && (
                 <div className="w-full max-w-3xl mt-6 bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">Inspiration Prompts</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-400">
                        {inspirationPrompts.map((prompt, index) => (
                            <li key={index}>{prompt}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StoryStarter;
