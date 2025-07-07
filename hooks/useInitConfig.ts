import { useState, useEffect } from "react";

interface InitConfig {
	status: string;
	apiKey: string;
	geminiModel: string;
	imagenModel: string;
}

export function useInitConfig() {
	const [config, setConfig] = useState<InitConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const cached = sessionStorage.getItem("sosheiq_init_config");
		if (cached) {
			try {
				setConfig(JSON.parse(cached));
				setLoading(false);
				return;
			} catch (e) {
				// Ignore parse error, fetch fresh
			}
		}

		const fetchConfig = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/init");
				if (!res.ok) throw new Error("Failed to fetch init config");
				const data = await res.json();
				setConfig(data);
				sessionStorage.setItem("sosheiq_init_config", JSON.stringify(data));
			} catch (err: any) {
				setError(err.message || "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchConfig();
	}, []);

	return { config, loading, error };
}
