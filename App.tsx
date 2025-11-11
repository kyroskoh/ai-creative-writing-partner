import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import ImageAnalyzer from './components/ImageAnalyzer';
import StoryStarter from './components/StoryStarter';
import type { ActiveTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('story');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chatbot />;
      case 'analyzer':
        return <ImageAnalyzer />;
      case 'story':
        return <StoryStarter />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label }: { tab: ActiveTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm md:text-base font-medium rounded-md transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-6">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            AI Creative Writing Partner
          </h1>
          <p className="text-slate-400 mt-2">Your AI-powered creative partner.</p>
        </header>

        <nav className="flex justify-center space-x-2 md:space-x-4 p-2 bg-slate-800 rounded-lg shadow-md mb-8">
          <TabButton tab="story" label="Story Starter" />
          <TabButton tab="analyzer" label="Image Analyzer" />
          <TabButton tab="chat" label="Chatbot" />
        </nav>

        <main className="bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-700">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default App;