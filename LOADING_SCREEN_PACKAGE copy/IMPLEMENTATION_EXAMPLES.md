# Implementation Examples

This document provides complete implementation examples for different project setups.

## Example 1: Next.js App Router

### File Structure

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── InitialLoadingScreen.tsx
│   └── SosheIQLogo.tsx
├── constants/
│   └── animations.ts
├── providers/
│   └── AnimationProvider.tsx
└── styles/
    ├── globals.css
    └── loading-animations.css
```

### Implementation

**app/layout.tsx**

```tsx
"use client";
import { AnimationProvider } from "@/providers/AnimationProvider";
import "@/styles/globals.css";
import "@/styles/loading-animations.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<AnimationProvider theme="cinematic" performance="auto">
					{children}
				</AnimationProvider>
			</body>
		</html>
	);
}
```

**app/page.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import { InitialLoadingScreen } from "@/components/InitialLoadingScreen";

export default function HomePage() {
	const [isLoading, setIsLoading] = useState(true);
	const [mainAppVisible, setMainAppVisible] = useState(false);

	useEffect(() => {
		const initializeApp = async () => {
			try {
				// Your app initialization logic here
				await Promise.all([
					// Load data, fonts, etc.
					new Promise((resolve) => setTimeout(resolve, 2000)),
				]);

				// Wait for loading screen completion
				const checkLoadingComplete = () => {
					const isComplete = document.body.getAttribute(
						"data-loading-complete"
					);
					const isReadyForCrossfade = document.body.getAttribute(
						"data-loading-ready-for-crossfade"
					);

					if (isComplete && isReadyForCrossfade) {
						setTimeout(() => {
							setMainAppVisible(true);
							setTimeout(() => setIsLoading(false), 800);
						}, 200);
					} else {
						setTimeout(checkLoadingComplete, 100);
					}
				};

				checkLoadingComplete();

				// Fallback timeout
				setTimeout(() => {
					if (isLoading) {
						setMainAppVisible(true);
						setTimeout(() => setIsLoading(false), 500);
					}
				}, 10000);
			} catch (error) {
				console.error("App initialization failed:", error);
				setMainAppVisible(true);
				setIsLoading(false);
			}
		};

		initializeApp();
	}, []);

	return (
		<>
			{isLoading && <InitialLoadingScreen />}
			{mainAppVisible && (
				<main className="min-h-screen bg-black text-white">
					<h1>Your Main App Content</h1>
				</main>
			)}
		</>
	);
}
```

## Example 2: React SPA (Create React App / Vite)

### File Structure

```
src/
├── components/
│   ├── InitialLoadingScreen.tsx
│   └── SosheIQLogo.tsx
├── constants/
│   └── animations.ts
├── providers/
│   └── AnimationProvider.tsx
├── styles/
│   ├── index.css
│   └── loading-animations.css
├── App.tsx
└── main.tsx
```

### Implementation

**main.tsx (Vite) / index.tsx (CRA)**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AnimationProvider } from "./providers/AnimationProvider";
import "./styles/index.css";
import "./styles/loading-animations.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AnimationProvider theme="cinematic" performance="auto">
			<App />
		</AnimationProvider>
	</React.StrictMode>
);
```

**App.tsx**

```tsx
import { useState, useEffect } from "react";
import { InitialLoadingScreen } from "./components/InitialLoadingScreen";

function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [appReady, setAppReady] = useState(false);

	useEffect(() => {
		const loadApp = async () => {
			// Initialize your app
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// Loading coordination
			const waitForCompletion = () => {
				const complete = document.body.getAttribute("data-loading-complete");
				const ready = document.body.getAttribute(
					"data-loading-ready-for-crossfade"
				);

				if (complete && ready) {
					setTimeout(() => {
						setAppReady(true);
						setTimeout(() => setIsLoading(false), 1000);
					}, 300);
				} else {
					setTimeout(waitForCompletion, 100);
				}
			};

			waitForCompletion();
		};

		loadApp();
	}, []);

	if (isLoading) {
		return <InitialLoadingScreen />;
	}

	return (
		<div className="App">
			<header className="App-header">
				<h1>Your React App</h1>
			</header>
		</div>
	);
}

export default App;
```

## Example 3: Standalone Implementation (No Provider)

If you prefer not to use the AnimationProvider, you can create a minimal standalone version:

**SimpleLoadingScreen.tsx**

```tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SosheIQLogo } from "./SosheIQLogo";

export const SimpleLoadingScreen = () => {
	const [isVisible, setIsVisible] = useState(true);
	const [progress, setProgress] = useState(0);
	const [message, setMessage] = useState("Initializing...");

	useEffect(() => {
		const runSequence = async () => {
			// Simple progress animation
			const progressInterval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) {
						clearInterval(progressInterval);
						// Signal completion
						document.body.setAttribute("data-loading-complete", "true");
						document.body.setAttribute(
							"data-loading-ready-for-crossfade",
							"true"
						);
						setTimeout(() => setIsVisible(false), 1000);
						return 100;
					}
					return prev + 2;
				});
			}, 80);

			// Update messages
			setTimeout(() => setMessage("Loading assets..."), 1500);
			setTimeout(() => setMessage("Almost ready..."), 3000);
			setTimeout(() => setMessage("Welcome!"), 4500);
		};

		runSequence();
	}, []);

	if (!isVisible) return null;

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 bg-black z-[10000] flex items-center justify-center"
				initial={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.8 }}>
				<div className="flex flex-col items-center space-y-6">
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.2 }}>
						<SosheIQLogo className="h-16 w-auto" />
					</motion.div>

					<motion.p
						className="text-sky-300 text-lg font-semibold"
						key={message}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}>
						{message}
					</motion.p>

					<div className="w-64 bg-slate-800 rounded-full h-2">
						<motion.div
							className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
							initial={{ width: "0%" }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.3 }}
						/>
					</div>

					<div className="text-sky-400 text-sm font-mono">{progress}%</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
};
```

## Example 4: Custom Logo Implementation

To use your own logo instead of SosheIQLogo:

**CustomLogo.tsx**

```tsx
import React from "react";

interface CustomLogoProps {
	className?: string;
	style?: React.CSSProperties;
}

export const CustomLogo: React.FC<CustomLogoProps> = ({ className, style }) => {
	return (
		<div className={className} style={style}>
			{/* Replace with your logo */}
			<img src="/your-logo.svg" alt="Your Logo" className="h-full w-auto" />
			{/* Or use an SVG directly */}
			<svg viewBox="0 0 100 100" className="h-full w-auto">
				{/* Your SVG content */}
			</svg>
		</div>
	);
};
```

Then replace the SosheIQLogo import in InitialLoadingScreen.tsx:

```tsx
import { CustomLogo } from "./CustomLogo";

// In the component:
<CustomLogo
	className="relative z-10"
	style={{
		height: `${Math.min(SPACING.CINEMATIC_MD, 80)}px`,
		width: "auto",
		filter: "drop-shadow(0 0 24px rgba(59, 130, 246, 0.5))",
	}}
/>;
```

## Example 5: TypeScript Configuration

**tsconfig.json**

```json
{
	"compilerOptions": {
		"target": "es5",
		"lib": ["dom", "dom.iterable", "es6"],
		"allowJs": true,
		"skipLibCheck": true,
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"forceConsistentCasingInFileNames": true,
		"noFallthroughCasesInSwitch": true,
		"module": "esnext",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx"
	},
	"include": ["src"]
}
```

**package.json dependencies**

```json
{
	"dependencies": {
		"framer-motion": "^10.0.0",
		"react": "^18.0.0",
		"react-dom": "^18.0.0"
	},
	"devDependencies": {
		"@types/react": "^18.0.0",
		"@types/react-dom": "^18.0.0",
		"typescript": "^4.9.0"
	}
}
```

## Testing the Implementation

To verify your implementation works correctly:

1. **Loading Screen Appears**: The loading screen should appear immediately on page load
2. **Animations Run**: Logo should have breathing glow, progress bar should animate
3. **Messages Update**: Loading messages should change during the sequence
4. **Completion Signal**: Check browser dev tools for `data-loading-complete` attribute
5. **Smooth Transition**: Main app should fade in smoothly after loading completes
6. **Mobile Responsive**: Test on mobile devices for proper scaling and performance

## Troubleshooting

### Common Issues

1. **Loading screen never disappears**:

   - Check console for errors
   - Verify DOM attributes are being set
   - Add emergency timeout (included in examples)

2. **Animations not smooth**:

   - Ensure CSS file is imported
   - Check if framer-motion is installed correctly
   - Verify browser supports CSS animations

3. **Logo not displaying**:
   - Check logo file path
   - Verify SVG syntax is correct
   - Ensure proper imports

### Debug Mode

Enable debug mode in the AnimationProvider:

```tsx
<AnimationProvider debugMode={true}>
```

This will log performance metrics and animation states to the console.
