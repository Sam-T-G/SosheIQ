import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
	_req: NextApiRequest, // underscore tells TypeScript: yes it's unused, and that's okay
	res: NextApiResponse
) {
	const apiKey = process.env.NEXT_PUBLIC_API_KEY;

	if (!apiKey) {
		return res.status(500).json({ error: "API key is missing" });
	}

	res.status(200).json({ apiKey });
}
