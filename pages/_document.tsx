import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Favicon, metadata, etc. can go here */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/logo.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/logo.svg" />
				{/* Open Graph / Facebook */}
				<meta
					property="og:title"
					content="SosheIQ - AI Social Interaction Trainer"
				/>
				<meta
					property="og:description"
					content="Practice and improve your social skills with an AI-powered conversation partner. Get detailed feedback and analysis."
				/>
				<meta property="og:image" content="/logo.svg" />
				<meta property="og:url" content="https://yoursite.com/" />
				{/* Twitter */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="SosheIQ - AI Social Interaction Trainer"
				/>
				<meta
					name="twitter:description"
					content="Practice and improve your social skills with an AI-powered conversation partner."
				/>
				<meta name="twitter:image" content="/logo.svg" />
				<meta name="theme-color" content="#0c4a6e" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
