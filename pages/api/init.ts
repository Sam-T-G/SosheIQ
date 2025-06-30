

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
	_req: NextApiRequest, // underscore tells TypeScript: yes it's unused, and that's okay
	res: NextApiResponse
) {
	// Reverted to NEXT_PUBLIC_API_KEY to align with the project's expected environment configuration.
	const apiKey = process.env.NEXT_PUBLIC_API_KEY;

	if (!apiKey) {
		// This error is thrown if the NEXT_PUBLIC_API_KEY is not set in the environment.
		return res.status(500).json({ error: "API key is missing" });
	}

	res.status(200).json({ apiKey });
}