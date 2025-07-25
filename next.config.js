/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	// If you plan to use environment variables on the client side,
	// make sure they are prefixed with NEXT_PUBLIC_
	// The API_KEY is handled this way in the app.
	experimental: {
		esmExternals: false,
	},
};

module.exports = nextConfig;
