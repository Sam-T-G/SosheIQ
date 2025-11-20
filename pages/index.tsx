import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'motion/react';
import { LandingPage } from '../components/LandingPage';
import { AboutScreen } from '../components/AboutScreen';
import { PrivacyPolicyScreen } from '../components/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../components/TermsOfServiceScreen';
import { SafetyScreen } from '../components/SafetyScreen';
import { LoginScreen } from '../components/LoginScreen';
import { InstructionsScreen } from '../components/InstructionsScreen';
import { SetupScreen } from '../components/SetupScreen';
import { GuidedSetup } from '../components/GuidedSetup';
import { InteractionScreen } from '../components/InteractionScreen';
import { AnalysisScreen } from '../components/AnalysisScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { HelpAndTipsOverlay } from '../components/QuickTipsScreen';
import { ConfirmEndInteractionDialog } from '../components/ConfirmEndInteractionDialog';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { ImageViewerOverlay } from '../components/ImageViewerOverlay';
import { InitialLoadingScreen } from '../components/InitialLoadingScreen';
import { GamePhase } from '../types';

import { useSession } from './_app';
import { useAuth } from '../contexts/AuthContext';
import { useMobileLandscape } from '../hooks/useMobileLandscape';
import { useGameLogic } from '../hooks/useGameLogic';

const HomePage: React.FC = () => {
	const isMobileLandscape = useMobileLandscape();
	const { sessionInPlay } = useSession();
	const { user, isLoading: authLoading } = useAuth();

	const {
		currentPhase,
		setupMode,
		setSetupMode,
		scenarioDetails,
		setScenarioDetails,
		conversationHistory,
		currentEngagement,
		displayedGoal,
		activeAction,
		isActionPaused,
		isContinueActionSuggested,
		isAppLoading,
		mainAppVisible,
		isLoading,
		isAiResponding,
		isFadingToBlack,
		error,
		analysisReport,
		currentAIImage,
		initialAiBodyLanguage,
		userScenarioDetails,
		setUserScenarioDetails,
		showConfirmEndDialog,
		setShowConfirmEndDialog,
		showRandomConfirmDialog,
		setShowRandomConfirmDialog,
		showGoalAchievedToast,
		imageGalleryConfig,
		pendingFeedback,
		showHero,
		handleNavigate,
		handleNavigateWithFade,
		handleHeroExitComplete,
		handleLoginFlow,
		handleAuthSuccess,
		handleConfirmRandom,
		handleNavigateToLogin,
		handleViewImage,
		handleCloseImageGallery,
		handleStartInteraction,
		handleEndConversation,
		handleFeedbackAnimationComplete,
		handleSendMessage,
		handleRetryMessage,
		handleFastForwardAction,
		handlePinGoal,
		handleUnpinGoal,
		handleContinueWithoutSpeaking,
		handleCloseGoalToast,
		initialConversationGoal,
	} = useGameLogic();

	const [showHelp, setShowHelp] = useState(false);
	const [isModalActive, setIsModalActive] = useState(false);
	const [mainJustify, setMainJustify] = useState<'center' | 'start'>('center');

	// Add a derived state for footer fade-out
	const isFooterFadingOut =
		isAppLoading ||
		(isLoading &&
			(currentPhase === GamePhase.LOGIN ||
				currentPhase === GamePhase.HERO ||
				currentPhase === GamePhase.SETUP ||
				(currentPhase === GamePhase.INTERACTION && !scenarioDetails) ||
				(currentPhase === GamePhase.ANALYSIS && !analysisReport && !error)));

	// Handle main justify change based on phase
	useEffect(() => {
		if (currentPhase === GamePhase.SETUP) {
			// switch to top-aligned after transition
			const timer = setTimeout(() => setMainJustify('start'), 10);
			return () => clearTimeout(timer);
		} else {
			setMainJustify('center');
		}
	}, [currentPhase]);

	if (isMobileLandscape) {
		return (
			<div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-8 text-center">
				<div>
					<h2 className="text-2xl font-bold text-white mb-4">
						Please Rotate Your Device
					</h2>
					<p className="text-gray-300">
						SosheIQ is designed for portrait mode on mobile devices.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans selection:bg-sky-500/30 overflow-hidden fixed inset-0 flex flex-col ${
				sessionInPlay ? 'session-active' : ''
			}`}>
			<Head>
				<title>SosheIQ - Master Social Dynamics</title>
				<meta
					name="description"
					content="Level up your social intelligence with AI-powered roleplay scenarios."
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{/* Initial Loading Screen */}
			<AnimatePresence>
				{isAppLoading && <InitialLoadingScreen key="initial-loading" />}
			</AnimatePresence>

			{/* Main App Content */}
			<div
				className={`flex-grow flex flex-col relative z-10 transition-opacity duration-1000 ${
					mainAppVisible ? 'opacity-100' : 'opacity-0'
				}`}>
				{/* Header */}


				{/* Global Loading Overlay for Hero/Setup actions */}
				<AnimatePresence>
					{isLoading && currentPhase === GamePhase.HERO && (
						<LoadingScreen key="hero-loading" message="Conjuring a new persona..." />
					)}
				</AnimatePresence>

				{/* Main Content Area */}
				<main
					className={`flex-grow flex flex-col relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
						mainJustify === 'center' ? 'justify-center' : 'justify-start'
					} items-center transition-all duration-500`}>
					<AnimatePresence mode="wait">
						{currentPhase === GamePhase.HERO && showHero && (
							<motion.div
								key="hero"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5 }}
								className="w-full h-full flex items-center justify-center"
								onAnimationComplete={(definition) => {
									if (definition === "exit") {
										handleHeroExitComplete();
									}
								}}>
								<LandingPage
									onStart={() => handleLoginFlow("start_guided")}
									onStartRandom={() => handleLoginFlow("start_random")}
									onNavigateToAbout={() => handleNavigate(GamePhase.ABOUT)}
									onNavigateToLogin={handleNavigateToLogin}
									onNavigateToSafety={() => handleNavigate(GamePhase.SAFETY)}
									onShowInstructions={() => handleNavigate(GamePhase.INSTRUCTIONS)}
								/>
							</motion.div>
						)}

						{currentPhase === GamePhase.ABOUT && (
							<motion.div
								key="about"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="w-full max-w-4xl">
								<AboutScreen onBack={() => handleNavigate(GamePhase.HERO)} />
							</motion.div>
						)}

						{currentPhase === GamePhase.PRIVACY && (
							<motion.div
								key="privacy"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="w-full max-w-4xl">
								<PrivacyPolicyScreen
									onBack={() => handleNavigate(GamePhase.HERO)}
								/>
							</motion.div>
						)}

						{currentPhase === GamePhase.TERMS && (
							<motion.div
								key="terms"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="w-full max-w-4xl">
								<TermsOfServiceScreen
									onBack={() => handleNavigate(GamePhase.HERO)}
								/>
							</motion.div>
						)}

						{currentPhase === GamePhase.SAFETY && (
							<motion.div
								key="safety"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.3 }}
								className="w-full max-w-4xl">
								<SafetyScreen onBack={() => handleNavigate(GamePhase.HERO)} />
							</motion.div>
						)}

						{currentPhase === GamePhase.SETUP && (
							<motion.div
								key="setup"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5 }}
								className="w-full h-full overflow-hidden">
								{setupMode === 'guided' ? (
									<GuidedSetup
										onStart={handleStartInteraction}
										onSwitchToAdvanced={() => setSetupMode("advanced")}
									/>
								) : (
									<SetupScreen
										onStart={handleStartInteraction}
										onBack={() => handleNavigate(GamePhase.HERO)}
									/>
								)}
							</motion.div>
						)}

						{currentPhase === GamePhase.INTERACTION &&
							scenarioDetails &&
							(isLoading ? (
								<LoadingScreen
									key="loading-interaction"
									message="Initializing Scenario..."
								/>
							) : (
								<motion.div
									key="interaction"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5 }}
									className="w-full h-full">
									<InteractionScreen
										scenarioDetails={scenarioDetails!}
										conversationHistory={conversationHistory}
										currentEngagement={currentEngagement}
										displayedGoal={displayedGoal}
										activeAction={activeAction}
										isActionPaused={isActionPaused}
										isPinnable={true}
										isGoalPinned={false} // TODO: Implement pinned goal state if needed
										isContinueActionSuggested={isContinueActionSuggested}
										onSendMessage={handleSendMessage}
										onEndConversation={() => setShowConfirmEndDialog(true)}
										onFastForwardAction={handleFastForwardAction}
										onPinGoal={handlePinGoal}
										onUnpinGoal={handleUnpinGoal}
										onContinueWithoutSpeaking={handleContinueWithoutSpeaking}
										onRetryMessage={handleRetryMessage}
										aiImageBase64={currentAIImage}
										isLoadingAI={isAiResponding}
										onToggleHelp={() => setShowHelp(!showHelp)}
										onViewImage={handleViewImage}
										initialAiBodyLanguage={initialAiBodyLanguage}
										goalJustChanged={false} // TODO: Implement goal change detection
										onAnimationComplete={() => {}}
										showGoalAchievedToast={showGoalAchievedToast}
										onGoToAnalysis={() => handleNavigateWithFade(GamePhase.ANALYSIS)}
										onCloseGoalToast={handleCloseGoalToast}
										pendingFeedback={pendingFeedback}
										onFeedbackAnimationComplete={handleFeedbackAnimationComplete}
										onModalStateChange={setIsModalActive}
									/>
								</motion.div>
							))}

						{currentPhase === GamePhase.ANALYSIS &&
							(isLoading ? (
								<LoadingScreen
									key="loading-analysis"
									message="Generating Analysis Report..."
								/>
							) : analysisReport ? (
								<motion.div
									key="analysis"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5 }}
									className="w-full h-full">
									<AnalysisScreen
										report={analysisReport}
										errorReport={error}
										isLoadingReport={isLoading}
										scenarioDetails={scenarioDetails!}
										onRestart={() => handleNavigateWithFade(GamePhase.HERO)}
									/>
								</motion.div>
							) : (
								<div key="analysis-error" className="text-center">
									<p className="text-red-400 mb-4">
										{error || 'Failed to load analysis.'}
									</p>
									<button
										onClick={() => handleNavigate(GamePhase.HERO)}
										className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
										Return Home
									</button>
								</div>
							))}
						{/* Other Screens */}
						{currentPhase === GamePhase.ABOUT && (
							<AboutScreen onBack={() => handleNavigateWithFade(GamePhase.HERO)} />
						)}
						{currentPhase === GamePhase.PRIVACY && (
							<PrivacyPolicyScreen
								onBack={() => handleNavigateWithFade(GamePhase.HERO)}
							/>
						)}
						{currentPhase === GamePhase.TERMS && (
							<TermsOfServiceScreen
								onBack={() => handleNavigateWithFade(GamePhase.HERO)}
							/>
						)}
						{currentPhase === GamePhase.SAFETY && (
							<SafetyScreen onBack={() => handleNavigateWithFade(GamePhase.HERO)} />
						)}
						{currentPhase === GamePhase.LOGIN && (
							<LoginScreen
								onNavigateToHome={() => handleNavigateWithFade(GamePhase.HERO)}
								onContinueAsGuest={handleAuthSuccess}
								onNavigateToTerms={() => handleNavigateWithFade(GamePhase.TERMS)}
								onNavigateToPrivacy={() => handleNavigateWithFade(GamePhase.PRIVACY)}
								onAuthSuccess={handleAuthSuccess}
							/>
						)}
						{currentPhase === GamePhase.INSTRUCTIONS && (
							<InstructionsScreen
								onNavigate={handleNavigateWithFade}
							/>
						)}
					</AnimatePresence>
				</main>
			</div>

			{/* Overlays and Dialogs */}
			<AnimatePresence>
					{showHelp && (
						<HelpAndTipsOverlay
							onClose={() => setShowHelp(false)}
						/>
					)}
				{showConfirmEndDialog && (
					<ConfirmEndInteractionDialog
						isOpen={showConfirmEndDialog}
						onConfirm={handleEndConversation}
						onCancel={() => setShowConfirmEndDialog(false)}
					/>
				)}
				{showRandomConfirmDialog && (
					<ConfirmationDialog
						isOpen={showRandomConfirmDialog}
						title="Start Random Scenario?"
						description="This will generate a completely random persona and scenario. Are you sure?"
						onConfirm={handleConfirmRandom}
						onCancel={() => setShowRandomConfirmDialog(false)}
					/>
				)}
				{imageGalleryConfig.isOpen && (
					<ImageViewerOverlay
						images={imageGalleryConfig.images}
						startIndex={imageGalleryConfig.startIndex}
						onClose={handleCloseImageGallery}
					/>
				)}
				{isFadingToBlack && (
					<motion.div
						key="fade-to-black"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 1 }}
						className="fixed inset-0 bg-black z-[100] pointer-events-none"
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default HomePage;
