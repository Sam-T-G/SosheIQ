import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
	_req: NextApiRequest,
	res: NextApiResponse
) {
	// Only allow in development
	if (process.env.NODE_ENV !== 'development') {
		return res.status(404).json({ error: 'Not found' });
	}

	const envVars = {
		GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? 'SET' : 'NOT SET',
		NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY ? 'SET' : 'NOT SET',
		GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET',
		NODE_ENV: process.env.NODE_ENV,
		// Don't expose actual values for security
	};

	return res.status(200).json({
		message: 'Environment variables status',
		envVars,
		timestamp: new Date().toISOString()
	});
} 