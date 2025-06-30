import React from "react";
import { GamePhase } from "../types";
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	PlayIcon,
	QuestionMarkIcon,
	StarIcon,
	SendIcon,
	StopCircleIcon,
	InfoIcon,
	UserIcon,
	TrendingUpIcon,
	TargetIcon,
	ChatBubbleIcon,
	DownloadIcon,
	CogIcon,
	SparklesIcon,
	PaperIcon,
	FastForwardIcon,
	GestureIcon,
} from "./Icons";
import { ProgressBar } from "./ProgressBar";

interface InstructionsScreenProps {
	onNavigate: (phase: GamePhase) => void;
}

const FeatureCard: React.FC<{
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
}> = ({ icon, title, children }) => (
	<div className="bg-slate-700/50 p-5 rounded-lg shadow-lg flex flex-col sm:flex-row items-start gap-4">
		<div className="flex-shrink-0 text-sky-400">{icon}</div>
		<div className="flex-grow">
			<h3 className="text-xl font-semibold text-sky-300 mb-2">{title}</h3>
			<div className="text-gray-300 text-sm space-y-2">{children}</div>
		</div>
	</div>
);

const UIExample: React.FC<{ caption: string; children: React.ReactNode }> = ({
	caption,
	children,
}) => (
	<div className="mt-3 bg-slate-800/50 p-3 rounded-md border border-slate-600/70">
		<div className="flex flex-col items-center gap-2">
			{children}
			<p className="text-xs text-center text-gray-400 italic">{caption}</p>
		</div>
	</div>
);

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
	onNavigate,
}) => {
	return (
		<div className="w-full max-w-4xl p-6 md:p-10 bg-slate-800 rounded-xl shadow-2xl text-gray-300 animate-fadeIn">
			<div className="max-h-[80vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
				<div className="space-y-10">
					<header className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4 drop-shadow-md">
							Welcome to SosheIQ
						</h1>
						<p className="text-lg text-gray-400 max-w-2xl mx-auto">
							Your AI-powered coach for mastering the art of conversation.
						</p>
					</header>

					<section>
						<h2 className="text-2xl font-semibold text-teal-400 mb-3 border-b border-teal-800 pb-2">
							What is SosheIQ?
						</h2>
						<p>
							In a world recovering from isolation, many of us have found our
							social muscles have atrophied. SosheIQ is a judgment-free space to
							rebuild them. It's not just a chatbot; it's a dynamic simulator
							for real-world social interactions. Practice scenarios, get
							instant feedback, and boost your charisma, one conversation at a
							time.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-teal-400 mb-3 border-b border-teal-800 pb-2">
							Feature Deep Dive
						</h2>

						<div className="space-y-6">
							<FeatureCard
								icon={<CogIcon className="h-8 w-8" />}
								title="1. Setting Up Your Scenario">
								<p>
									Every great interaction starts with context. You can use the
									**Guided Setup** for a step-by-step process, or jump into the
									**Advanced Setup** for full control.
								</p>
								<ul className="list-disc list-inside space-y-1 pl-2">
									<li>
										**Persona:** Define the AI's gender, age, name, and
										personality traits.
									</li>
									<li>
										**Environment:** Choose where the conversation happens.
									</li>
									<li>
										**Goal (Optional):** Give yourself a mission, like "Ask for
										a date".
									</li>
									<li>
										**Feeling Lucky:** Hit the "I'm Feeling Lucky" button to let
										the AI generate a complete, immersive scenario for you,
										including your relationship and a starting situation.
									</li>
								</ul>
							</FeatureCard>

							<FeatureCard
								icon={<ChatBubbleIcon className="h-8 w-8" />}
								title="2. The Interaction Screen">
								<p>This is your practice arena. Here's what to look out for:</p>

								<div className="mt-4 p-4 bg-slate-800/40 rounded-lg space-y-4">
									<h4 className="font-bold text-teal-300">The AI's Presence</h4>
									<p>
										Pay close attention to the large image and body language
										descriptions. The AI's appearance, pose, and actions are
										dynamic and will change based on its mood and the
										conversation's context.
									</p>

									<h4 className="font-bold text-teal-300">
										Tracking Your Progress
									</h4>
									<p>
										The **Engagement Bar** at the bottom (or in the chat overlay
										on mobile) shows the AI's interest level. It decays slightly
										each turn, so consistent positive interaction is key!
									</p>
									<UIExample caption="Engagement Bar: Green is high, yellow is medium, red is low.">
										<div className="w-48">
											<ProgressBar percentage={75} />
										</div>
									</UIExample>

									<h4 className="font-bold text-teal-300">
										Navigating the World: Top Banners
									</h4>
									<p>
										The banner at the top of the chat tells you about the
										current state of the interaction.
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<UIExample caption="A Conversation Goal you're working towards.">
											<div className="w-full max-w-xs bg-teal-900/60 p-2 rounded-md border border-teal-800/50">
												<div className="flex items-center gap-2 mb-1">
													<TargetIcon className="h-4 w-4 text-teal-300" />{" "}
													<p className="text-xs font-semibold text-teal-300">
														GOAL
													</p>{" "}
													<span className="ml-auto font-bold text-white text-sm">
														60%
													</span>
												</div>
												<ProgressBar percentage={60} />
											</div>
										</UIExample>
										<UIExample caption="An Active Action (like a journey) with progress and a fast-forward button.">
											<div className="w-full max-w-xs bg-sky-900/60 p-2 rounded-md border border-sky-800/50">
												<div className="flex items-center gap-2 mb-1">
													<p className="text-xs font-semibold text-sky-300">
														Walking to the bar...
													</p>{" "}
													<button
														disabled
														className="ml-auto p-1 rounded-full bg-sky-700/80 text-white opacity-50">
														<FastForwardIcon className="h-4 w-4" />
													</button>
												</div>
												<ProgressBar percentage={40} />
											</div>
										</UIExample>
									</div>

									<h4 className="font-bold text-teal-300">
										A Living Narrative
									</h4>
									<p>
										The chat isn't just dialogue. Look for italicized text that
										describes actions, which can even happen mid-sentence for
										realism! This is how the AI shows, not just tells.
									</p>
									<UIExample caption="AI messages mix dialogue and actions.">
										<div className="space-y-2 text-left w-full max-w-xs">
											<div className="px-3 py-2 rounded-xl bg-slate-600 text-gray-200 rounded-bl-none text-sm self-start">
												So, I was thinking we could...
											</div>
											<div className="text-center">
												<p className="text-xs italic text-slate-400 px-2 py-0.5 bg-slate-700/50 rounded-full inline-block">
													*She pauses to take a sip of her coffee*
												</p>
											</div>
											<div className="px-3 py-2 rounded-xl bg-slate-600 text-gray-200 rounded-bl-none text-sm self-start">
												...maybe go to the park later?
											</div>
										</div>
									</UIExample>

									<h4 className="font-bold text-teal-300">Instant Feedback</h4>
									<p>
										After you speak, you'll get instant feedback badges above
										your message, showing your effectiveness, your impact on
										engagement, and any positive or negative social traits you
										displayed.
									</p>
								</div>
							</FeatureCard>

							<FeatureCard
								icon={<SendIcon className="h-8 w-8" />}
								title="3. Your Controls: The Input Area">
								<p>You have more ways to interact than just typing dialogue.</p>
								<UIExample caption="The full set of user controls.">
									<div className="p-3 bg-slate-900/50 backdrop-blur-sm rounded-lg w-full max-w-md">
										<div className="flex items-end space-x-2">
											<button
												disabled
												className="p-3 text-white rounded-lg bg-red-600 opacity-50 flex-shrink-0">
												<StopCircleIcon className="h-5 w-5" />
											</button>
											<button
												disabled
												className="p-3 text-white rounded-lg bg-slate-600 opacity-50 flex-shrink-0">
												<GestureIcon className="h-5 w-5" />
											</button>
											<textarea
												disabled
												placeholder="Type dialogue here..."
												rows={1}
												className="w-full flex-grow p-3 rounded-lg resize-none bg-slate-800/50 text-gray-200 opacity-50 text-base"
											/>
											<button
												disabled
												className="p-3 text-white rounded-lg bg-slate-600 opacity-50 flex-shrink-0">
												<PlayIcon className="h-5 w-5" />
											</button>
											<button
												disabled
												className="p-3 text-white rounded-lg bg-sky-600 opacity-50 flex-shrink-0">
												<SendIcon className="h-5 w-5" />
											</button>
										</div>
									</div>
								</UIExample>
								<ul className="list-disc list-inside space-y-1 pl-2 mt-2">
									<li>
										<strong className="text-sky-300">
											Gesture (
											<GestureIcon className="h-4 w-4 inline-block -mt-1" />
											):
										</strong>{" "}
										Click this to open a second text box where you can describe
										a physical action (e.g., "*I smile and nod*"). You can send
										a gesture alone or with dialogue.
									</li>
									<li>
										<strong className="text-sky-300">
											Continue (
											<PlayIcon className="h-4 w-4 inline-block -mt-1" />
											):
										</strong>{" "}
										The power of silence! Press this to pass your turn without
										speaking. The AI will interpret your silence contextually—is
										it a shared quiet moment, or an awkward pause?
									</li>
									<li>
										<strong className="text-teal-300">
											Intelligent Action Suggestions:
										</strong>{" "}
										Look for a{" "}
										<span className="font-bold text-sky-400">glowing</span>{" "}
										"Continue" button. This is the AI's way of telling you that
										silence or a simple non-verbal agreement is the most
										effective and natural move in that moment. Trust its
										suggestion!
									</li>
								</ul>
							</FeatureCard>

							<FeatureCard
								icon={<DownloadIcon className="h-8 w-8" />}
								title="4. Performance Analysis">
								<p>
									After the conversation ends, you'll receive a detailed
									analysis of your performance. It includes scores on charisma,
									clarity, and adaptability, along with a turn-by-turn breakdown
									and actionable tips. Use this to learn and improve for your
									next interaction!
								</p>
							</FeatureCard>
						</div>
					</section>

					<div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
						<button
							onClick={() => onNavigate(GamePhase.HERO)}
							className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-lg shadow-md
								transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none
								focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50 flex items-center justify-center space-x-2">
							<ArrowLeftIcon className="h-5 w-5" />
							<span>Back to Home</span>
						</button>
						<button
							onClick={() => onNavigate(GamePhase.SETUP)}
							className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg text-lg shadow-lg
								transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none
								focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 flex items-center justify-center space-x-2">
							<PlayIcon className="h-5 w-5" />
							<span>Start</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
