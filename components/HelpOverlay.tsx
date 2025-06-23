

import React, { useEffect } from 'react';
import { CloseIcon, QuestionMarkIcon as FeatureIcon } from './Icons'; // Using QuestionMarkIcon as a generic feature icon for now

interface HelpOverlayProps {
  onClose: () => void;
}

interface HelpFeatureProps {
  title: string;
  description: string;
  delay: string; 
}

const HelpFeatureModule: React.FC<HelpFeatureProps> = ({ title, description, delay }) => (
  <div
    className="bg-sky-800 p-5 rounded-xl shadow-2xl animate-zoomInFeature ring-1 ring-sky-700/50"
    style={{ animationDelay: delay }}
    role="listitem"
  >
    <h3 className="text-xl font-semibold text-sky-300 mb-2 flex items-center">
      <FeatureIcon /> 
      <span className="ml-2">{title}</span>
    </h3>
    <p className="text-sm text-sky-100/90">{description}</p>
  </div>
);

const features = [
  { 
    title: "AI Visual & Body Language", 
    description: "Observe the AI's image and described body language. It reflects their reactions and current mood in response to your messages.",
    delay: "0.05s"
  },
  { 
    title: "Engagement Bar", 
    description: "This bar shows the AI's interest level. Aim to keep it high by being engaging and relevant! Low engagement can end the chat.",
    delay: "0.15s"
  },
  { 
    title: "Your Response Area", 
    description: "Type your message here. Be thoughtful! Press Enter (without Shift) or click 'Send' to reply.",
    delay: "0.25s"
  },
  { 
    title: "Action Buttons", 
    description: "'Send' submits your message. 'End' (or 'Finish' at max engagement) concludes the interaction to review your performance analysis.",
    delay: "0.35s"
  }
];

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  return (
    <div 
      className="fixed inset-0 bg-slate-900/85 flex items-center justify-center z-[100] p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-overlay-title"
    >
      <div 
        className="w-full max-w-3xl bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-[fadeInSlideUp_0.3s_ease-out_forwards] ring-1 ring-slate-700"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-700/80">
            <h2 id="help-overlay-title" className="text-2xl md:text-3xl font-bold text-sky-400">
                Understanding the Interface
            </h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 p-1.5 rounded-full hover:bg-slate-700 transition-colors"
                aria-label="Close help"
            >
                <CloseIcon />
            </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-7 space-y-5" role="list">
          {features.map((feature) => (
            <HelpFeatureModule 
              key={feature.title}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
        
        <div className="flex justify-center p-5 border-t border-slate-700/80">
            <button
                onClick={onClose}
                className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-lg shadow-md 
                           transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none 
                           focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 animate-zoomInFeature"
                style={{ animationDelay: '0.45s' }} 
            >
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};