import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../../components/ErrorBoundary";

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
	if (shouldThrow) {
		throw new Error("Test error");
	}
	return <div>No error</div>;
};

describe("ErrorBoundary", () => {
	const originalConsoleError = console.error;

	beforeAll(() => {
		// Suppress console.error for expected errors in tests
		console.error = jest.fn();
	});

	afterAll(() => {
		console.error = originalConsoleError;
	});

	it("renders children when there is no error", () => {
		render(
			<ErrorBoundary>
				<div>Test content</div>
			</ErrorBoundary>
		);

		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("renders error UI when there is an error", () => {
		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(
			screen.getByText(
				"We encountered an unexpected error. Please try refreshing the page."
			)
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /refresh page/i })
		).toBeInTheDocument();
	});

	it("calls window.location.reload when refresh button is clicked", () => {
		const reloadMock = jest.fn();
		Object.defineProperty(window, "location", {
			value: { reload: reloadMock },
			writable: true,
		});

		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>
		);

		fireEvent.click(screen.getByRole("button", { name: /refresh page/i }));
		expect(reloadMock).toHaveBeenCalled();
	});

	it("renders custom fallback when provided", () => {
		const customFallback = <div>Custom error message</div>;

		render(
			<ErrorBoundary fallback={customFallback}>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>
		);

		expect(screen.getByText("Custom error message")).toBeInTheDocument();
		expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
	});

	it("logs error to console", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation();

		render(
			<ErrorBoundary>
				<ThrowError shouldThrow={true} />
			</ErrorBoundary>
		);

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
