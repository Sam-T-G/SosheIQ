import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
	const apiKey =
		process.env.GOOGLE_AI_API_KEY ||
		process.env.NEXT_PUBLIC_API_KEY ||
		process.env.GEMINI_API_KEY;
	const geminiModel =
		process.env.NEXT_PUBLIC_GEMINI_MODEL ||
		process.env.GEMINI_MODEL ||
		"gemini-2.0-flash-exp";
	const imagenModel =
		process.env.NEXT_PUBLIC_IMAGEN_MODEL ||
		process.env.IMAGEN_MODEL ||
		"imagen-3";

	if (!apiKey) {
		return res.status(500).json({
			error: "API key is missing",
			message: "Please set GOOGLE_AI_API_KEY in your environment variables",
		});
	}

	// Return the API key to the client (this is safe as it's used client-side)
	return res.status(200).json({
		status: "ok",
		apiKey,
		geminiModel,
		imagenModel,
	});
}
