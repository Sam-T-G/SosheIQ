import React from "react";
import { motion } from "motion/react";
import { SosheIQLogo } from "./SosheIQLogo";
import { GlitchText } from "./GlitchText";

interface LandingPageProps {
	onStart: () => void;
	onStartRandom: () => void;
	onNavigateToAbout: () => void;
	onNavigateToLogin: () => void;
	onNavigateToSafety: () => void;
	onShowInstructions: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
	onStart,
	onStartRandom,
	onNavigateToAbout,
	onNavigateToLogin,
	onNavigateToSafety,
	onShowInstructions,
}) => {
	return (
		<div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
			{/* Background - Pure Void */}
			<div className="absolute inset-0 bg-black z-0" />

			{/* Content Container */}
			<div className="z-10 flex flex-col items-center space-y-12 p-8">
				
				{/* Logo/Title Section */}
				<motion.div 
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 1.5, ease: "circOut" }}
					className="flex flex-col items-center space-y-6"
				>
					{/* Minimalist Logo Placeholder or Icon */}
					<div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mb-4 animate-void-pulse">
						<div className="w-2 h-2 bg-white rounded-full" />
					</div>

					<h1 className="text-6xl md:text-8xl font-thin text-white tracking-[0.2em] uppercase">
						<GlitchText text="SOSHE" scrambleOnMount={true} />
					</h1>
					
					<div className="h-[1px] w-32 bg-white/20" />

					<h2 className="text-xs md:text-sm font-mono text-white/40 tracking-[0.3em] uppercase">
						<GlitchText text="Persona Fabrication Protocol" scrambleOnMount={true} />
					</h2>
				</motion.div>

				{/* Action Area */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1, duration: 1 }}
					className="flex flex-col items-center space-y-6"
				>
					<button 
						onClick={onStart}
						className="group relative px-12 py-4 bg-transparent border border-white/20 overflow-hidden transition-all hover:border-white/60"
					>
						<div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-circ-out" />
						<span className="relative font-mono text-sm text-white tracking-widest uppercase group-hover:text-white transition-colors">
							Initiate Sequence
						</span>
					</button>

					<div className="flex gap-8">
                        <button onClick={onNavigateToLogin} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest transition-colors">
							Resume Session
						</button>
						<button onClick={onNavigateToAbout} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest transition-colors">
							Manifesto
						</button>
						<button onClick={onShowInstructions} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest transition-colors">
							Protocol
						</button>
					</div>
				</motion.div>
			</div>

			{/* Footer Metadata */}
			<div className="absolute bottom-8 left-0 right-0 flex justify-center">
				<p className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
					v2.0.4 // Void Build
				</p>
			</div>
		</div>
	);
};
