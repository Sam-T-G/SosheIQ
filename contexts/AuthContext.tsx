import React, {
	createContext,
	useContext,
	useReducer,
	useEffect,
	useCallback,
	ReactNode,
} from "react";
import {
	AuthState,
	AuthContextValue,
	User,
	AuthenticationStatus,
} from "../types";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { v4 as uuidv4 } from "uuid";

// Authentication actions
type AuthAction =
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "LOGIN_SUCCESS"; payload: User }
	| { type: "LOGIN_AS_GUEST"; payload: User }
	| { type: "LOGOUT" };

// Authentication reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload, isLoading: false };
		case "LOGIN_SUCCESS":
			return {
				...state,
				status: "authenticated",
				user: action.payload,
				isLoading: false,
				error: null,
			};
		case "LOGIN_AS_GUEST":
			return {
				...state,
				status: "guest",
				user: action.payload,
				isLoading: false,
				error: null,
			};
		case "LOGOUT":
			return {
				status: "unauthenticated",
				user: null,
				isLoading: false,
				error: null,
			};
		default:
			return state;
	}
};

// Initial state
const initialState: AuthState = {
	status: "loading",
	user: null,
	isLoading: true,
	error: null,
};

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Storage keys
const AUTH_STATUS_KEY = "sosheiq_auth_status";
const AUTH_USER_KEY = "sosheiq_auth_user";

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(authReducer, initialState);
	const [storedStatus, setStoredStatus] =
		useSessionStorage<AuthenticationStatus>(AUTH_STATUS_KEY, "unauthenticated");
	const [storedUser, setStoredUser] = useSessionStorage<User | null>(
		AUTH_USER_KEY,
		null
	);

	// Initialize auth state from storage
	useEffect(() => {
		const initAuth = async () => {
			try {
				if (storedStatus && storedUser) {
					if (storedStatus === "authenticated") {
						dispatch({ type: "LOGIN_SUCCESS", payload: storedUser });
					} else if (storedStatus === "guest") {
						dispatch({ type: "LOGIN_AS_GUEST", payload: storedUser });
					} else {
						dispatch({ type: "LOGOUT" });
					}
				} else {
					dispatch({ type: "LOGOUT" });
				}
			} catch (error) {
				console.error("Failed to initialize auth:", error);
				dispatch({
					type: "SET_ERROR",
					payload: "Failed to initialize authentication",
				});
			}
		};

		initAuth();
	}, [storedStatus, storedUser]);

	// Login with provider (placeholder for future implementation)
	const login = useCallback(
		async (provider: "google" | "apple" | "email", credentials?: any) => {
			dispatch({ type: "SET_LOADING", payload: true });

			try {
				// TODO: Implement actual authentication with providers
				// For now, this is a placeholder that will be implemented later
				const user: User = {
					id: uuidv4(),
					name: "Demo User",
					email: "demo@sosheiq.com",
					authProvider: provider,
					createdAt: new Date(),
					lastLoginAt: new Date(),
				};

				dispatch({ type: "LOGIN_SUCCESS", payload: user });
				setStoredStatus("authenticated");
				setStoredUser(user);
			} catch (error) {
				console.error("Login failed:", error);
				dispatch({
					type: "SET_ERROR",
					payload: "Login failed. Please try again.",
				});
			}
		},
		[setStoredStatus, setStoredUser]
	);

	// Login as guest
	const loginAsGuest = useCallback(async () => {
		dispatch({ type: "SET_LOADING", payload: true });

		try {
			const guestUser: User = {
				id: uuidv4(),
				name: "Guest User",
				authProvider: "guest",
				createdAt: new Date(),
				lastLoginAt: new Date(),
			};

			dispatch({ type: "LOGIN_AS_GUEST", payload: guestUser });
			setStoredStatus("guest");
			setStoredUser(guestUser);
		} catch (error) {
			console.error("Guest login failed:", error);
			dispatch({
				type: "SET_ERROR",
				payload: "Failed to continue as guest. Please try again.",
			});
		}
	}, [setStoredStatus, setStoredUser]);

	// Logout
	const logout = useCallback(async () => {
		dispatch({ type: "SET_LOADING", payload: true });

		try {
			dispatch({ type: "LOGOUT" });
			setStoredStatus("unauthenticated");
			setStoredUser(null);
		} catch (error) {
			console.error("Logout failed:", error);
			dispatch({
				type: "SET_ERROR",
				payload: "Logout failed. Please try again.",
			});
		}
	}, [setStoredStatus, setStoredUser]);

	// Clear error
	const clearError = useCallback(() => {
		dispatch({ type: "SET_ERROR", payload: null });
	}, []);

	const value: AuthContextValue = {
		...state,
		login,
		loginAsGuest,
		logout,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextValue => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Auth status checker hooks
export const useIsAuthenticated = (): boolean => {
	const { status } = useAuth();
	return status === "authenticated";
};

export const useIsGuest = (): boolean => {
	const { status } = useAuth();
	return status === "guest";
};

export const useIsLoggedIn = (): boolean => {
	const { status } = useAuth();
	return status === "authenticated" || status === "guest";
};
