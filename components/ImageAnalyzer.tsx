
import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Spinner } from './icons/Spinner';

const ImageAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('Describe this image in detail.');
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
            setAnalysis('');
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

    const handleAnalyze = async () => {
        if (!imageFile || !prompt) {
            setError('Please upload an image and provide a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const { base64, mimeType } = await fileToBase64(imageFile);
            const result = await analyzeImage(prompt, base64, mimeType);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-400">Image Analyzer</h2>
            <div className="w-full grid md:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col items-center space-y-4">
                    <label htmlFor="image-upload" className="w-full cursor-pointer">
                        <div className="w-full h-64 border-2 border-dashed border-slate-600 rounded-lg flex flex-col justify-center items-center hover:border-indigo-500 transition-colors">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <UploadIcon className="mx-auto h-12 w-12" />
                                    <span>Click to upload an image</span>
                                    <p className="text-xs mt-1">PNG, JPG, WEBP up to 4MB</p>
                                </div>
                            )}
                        </div>
                    </label>
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt..."
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition h-24 resize-none"
                    />
                     {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button onClick={handleAnalyze} disabled={!imageFile || isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition">
                        {isLoading ? <Spinner /> : <SparklesIcon />}
                        <span>{isLoading ? 'Analyzing...' : 'Analyze Image'}</span>
                    </button>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg min-h-[300px] border border-slate-700">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">Analysis Result</h3>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-full">
                            <Spinner />
                        </div>
                    ) : (
                        <p className="text-slate-300 whitespace-pre-wrap">{analysis || "Upload an image and click 'Analyze' to see the result here."}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageAnalyzer;
