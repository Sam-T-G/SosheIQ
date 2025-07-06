import type { AppProps } from "next/app";
import "../styles/globals.css"; // Import global styles here
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AccessibilityProvider } from "../components/AccessibilityProvider";
import { FireflyField } from "../components/FireflyField";
import React, { createContext, useContext, useState } from "react";

// Session context for global session state
const SessionContext = createContext({
	sessionInPlay: false,
	setSessionInPlay: (v: boolean) => {},
});

export function useSession() {
	return useContext(SessionContext);
}

function MyApp({ Component, pageProps }: AppProps) {
	// Provide session state globally
	const [sessionInPlay, setSessionInPlay] = useState(false);
	return (
		<SessionContext.Provider value={{ sessionInPlay, setSessionInPlay }}>
			<ErrorBoundary>
				{/* Global firefly background effect - only show when session is NOT in play. Use a low positive z-index to place it above deep background layers (like hero gradients) but behind primary UI. */}
				{!sessionInPlay && <FireflyField zIndex={2} />}
				<AccessibilityProvider>
					<Component {...pageProps} />
				</AccessibilityProvider>
			</ErrorBoundary>
		</SessionContext.Provider>
	);
}

export default MyApp;
