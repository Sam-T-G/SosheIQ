import type { AppProps } from "next/app";
import "../styles/globals.css"; // Import global styles here
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AccessibilityProvider } from "../components/AccessibilityProvider";
import { FireflyField } from "../components/FireflyField";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			{/* Global firefly background effect */}
			<FireflyField zIndex={-1} />
			<AccessibilityProvider>
				<Component {...pageProps} />
			</AccessibilityProvider>
		</ErrorBoundary>
	);
}

export default MyApp;
