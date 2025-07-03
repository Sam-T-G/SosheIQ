import type { AppProps } from "next/app";
import "../styles/globals.css"; // Import global styles here
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AccessibilityProvider } from "../components/AccessibilityProvider";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			<AccessibilityProvider>
				<Component {...pageProps} />
			</AccessibilityProvider>
		</ErrorBoundary>
	);
}

export default MyApp;
