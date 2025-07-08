import type { AppProps } from "next/app";
import "../styles/globals.css"; // Import global styles here
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AccessibilityProvider } from "../components/AccessibilityProvider";
import { FireflyField } from "../components/FireflyField";
import { AuthProvider } from "../contexts/AuthContext";
import React, { createContext, useContext, useState, useEffect } from "react";

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

	// Responsive firefly count and mobile detection
	const [fireflyCount, setFireflyCount] = useState(20);
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const update = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			setFireflyCount(mobile ? 7 : 20);
		};
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return (
		<AuthProvider>
			<SessionContext.Provider value={{ sessionInPlay, setSessionInPlay }}>
				<ErrorBoundary>
					{/* Global firefly background effect - only show when session is NOT in play and not on mobile */}
					{!sessionInPlay && !isMobile && (
						<FireflyField zIndex={2} count={fireflyCount} />
					)}
					<AccessibilityProvider>
						<Component {...pageProps} />
					</AccessibilityProvider>
				</ErrorBoundary>
			</SessionContext.Provider>
		</AuthProvider>
	);
}

export default MyApp;
