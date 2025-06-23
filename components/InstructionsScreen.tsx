

import React from 'react';
import { GamePhase } from '../types';
import { ArrowLeftIcon, PlayIcon, QuestionMarkIcon } from './Icons'; // Added QuestionMarkIcon

interface InstructionsScreenProps {
  onNavigate: (phase: GamePhase) => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-3xl p-6 md:p-10 bg-slate-800 rounded-xl shadow-2xl space-y-6 text-gray-300">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-sky-400 mb-8 drop-shadow-md">
        How to Use SosheIQ
      </h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-teal-400">Welcome!</h2>
        <p>SosheIQ is designed to help you practice and improve your social interaction skills in various scenarios. You'll chat with an AI that adopts different personalities and responds to how you engage.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-teal-400">1. Setting Up Your Scenario</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>AI Gender & Name:</strong> Choose the AI's gender. You can then type a custom name or have one suggested/auto-generated.</li>
          <li><strong>Social Environment:</strong> Select the context of your interaction (e.g., Dating, Work).</li>
          <li><strong>AI Personality:</strong> Define how the AI will behave (e.g., Friendly, Skeptical).</li>
          <li><strong>Power Dynamic:</strong> Set the relationship hierarchy (e.g., AI is boss, peers).</li>
          <li><strong>Custom Details (Optional):</strong> Add specific background or context to make the scenario unique.</li>
        </ul>
        <p>Once configured, click "Start Interaction".</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-teal-400">2. Interacting with the AI</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>AI Visual & Body Language:</strong> Pay attention to the AI's image and body language description. It reflects their mood and reaction to you.</li>
          <li><strong>Engagement Bar:</strong> This shows how engaged the AI is with you. Aim to keep it high! It naturally decays slightly each turn, so consistent positive interaction is key. If it drops too low for too long, or if you reach maximum engagement, the conversation might conclude.</li>
          <li><strong>Your Responses:</strong> Type your message in the text box. Try to be thoughtful, relevant, and engaging.</li>
          <li><strong>Sending Messages:</strong> Click "Send" or press Enter (without Shift).</li>
          <li><strong>Ending Early:</strong> You can click "End Conversation" at any time to move to the analysis. If engagement is maxed out, this button will change to "Finish".</li>
          <li><strong>Need Help Mid-Chat?</strong> Click the <QuestionMarkIcon /> icon in the top right of the chat screen for a quick guide to the interface elements.</li>
        </ul>
      </section>
      
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-teal-400">3. Analysis & Feedback</h2>
        <p>After the conversation, you'll receive a detailed analysis of your performance, including scores for charisma, clarity, engagement, and adaptability, along with turn-by-turn feedback and overall tips.</p>
        <p>Use this feedback to understand your strengths and areas for improvement.</p>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <button
          onClick={() => onNavigate(GamePhase.HERO)}
          className="w-full sm:w-auto flex-grow px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-lg shadow-md 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
          aria-label="Back to Home"
        >
          <ArrowLeftIcon />
          <span>Back to Home</span>
        </button>
        <button
          onClick={() => onNavigate(GamePhase.SETUP)}
          className="w-full sm:w-auto flex-grow px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg shadow-lg 
                     transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                     focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 flex items-center justify-center space-x-2"
          aria-label="Start Interaction Setup"
        >
          <PlayIcon />
          <span>Start Interaction Setup</span>
        </button>
      </div>
    </div>
  );
};