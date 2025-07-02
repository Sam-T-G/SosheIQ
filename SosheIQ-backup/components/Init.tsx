import { useEffect, useState } from "react";

export default function Init() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchApiKey = async () => {
			try {
				const res = await fetch("/api/init");
				const data = await res.json();

				if (!data.apiKey) {
					setError("API key is missing from environment.");
				}
			} catch (err) {
				console.error("API key fetch failed:", err);
				setError("Could not fetch API key from server.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchApiKey();
	}, []);

	if (isLoading) return <div>Loading configuration...</div>;
	if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

	return null;
}
