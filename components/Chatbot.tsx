
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { Spinner } from './icons/Spinner';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const response = await generateChatResponse(input);
        const modelMessage: ChatMessage = { role: 'model', content: response };
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
    };
    
    return (
        <div className="flex flex-col h-[60vh] md:h-[70vh]">
            <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-400">Gemini Chat</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-gray-200 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 text-gray-200 rounded-xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                            <Spinner />
                            <span>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini anything..."
                    className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition" disabled={isLoading}>
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
