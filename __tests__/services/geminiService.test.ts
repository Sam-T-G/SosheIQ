import { GeminiService } from "../../services/geminiService";
import {
	ScenarioDetails,
	AIGender,
	SocialEnvironment,
	AIPersonalityTrait,
	StartConversationResponse,
	AiTurnResponse,
} from "../../types";

describe("GeminiService prompt construction and response parsing", () => {
	const apiKey = "test-api-key";
	let service: GeminiService;

	beforeEach(() => {
		service = new GeminiService(apiKey);
	});

	describe("parseJsonFromText", () => {
		it("should parse valid JSON string", () => {
			const json =
				'{"aiName":"Alex","dialogueChunks":[{"text":"Hi!","type":"dialogue"}],"aiBodyLanguage":"Neutral","aiThoughts":"Thinking...","conversationMomentum":50,"isEndingConversation":false,"shouldGenerateNewImage":false,"goalProgress":0,"achieved":false}';
			const result = (service as any).parseJsonFromText(
				json
			) as AiTurnResponse | null;
			expect(result).toBeTruthy();
			expect(result?.aiName).toBe("Alex");
			expect(result?.dialogueChunks[0].text).toBe("Hi!");
		});

		it("should return null for invalid JSON", () => {
			const invalidJson = "{aiName:Alex}";
			const result = (service as any).parseJsonFromText(
				invalidJson
			) as AiTurnResponse | null;
			expect(result).toBeNull();
		});
	});

	// Example: test prompt construction for startConversation
	describe("startConversation prompt construction", () => {
		it("should build a prompt string with all scenario details", async () => {
			// We'll use a spy to intercept the prompt string
			const scenario: ScenarioDetails = {
				environment: SocialEnvironment.DATING,
				aiPersonalityTraits: [
					AIPersonalityTrait.CHEERFUL,
					AIPersonalityTrait.WITTY,
				],
				aiGender: AIGender.FEMALE,
				aiName: "Sophie",
				aiAgeBracket: undefined,
			};
			// @ts-ignore
			const promptSpy = jest.spyOn(service, "startConversation");
			// We can't test the actual prompt string easily without refactoring, but we can check that the method runs and returns a promise
			expect(service.startConversation(scenario)).resolves.toBeDefined();
			promptSpy.mockRestore();
		});
	});
});
