import { ScenarioDetails, AIGender } from "../../types";
import { cultureNameData } from "../../constants/personality";

// Utility to infer missing persona details
export function inferMissingPersonaDetails(
    scenario: ScenarioDetails
): ScenarioDetails {
    // Gender: default to MALE or FEMALE randomly if missing, RANDOM, or NON_BINARY
    let aiGender: AIGender = scenario.aiGender;
    if (
        !aiGender ||
        aiGender === AIGender.RANDOM ||
        aiGender === AIGender.NON_BINARY
    ) {
        aiGender = Math.random() < 0.5 ? AIGender.MALE : AIGender.FEMALE;
    }
    // Culture: trim and use undefined if blank
    const aiCulture = scenario.aiCulture?.trim() || undefined;
    // Name: generate if missing
    let aiName = scenario.aiName?.trim() || "";
    if (!aiName) {
        let firstNamePool: string[];
        let lastNamePool: string[];
        if (aiCulture && cultureNameData[aiCulture]) {
            const cultureData = cultureNameData[aiCulture];
            switch (aiGender) {
                case AIGender.MALE:
                    firstNamePool = cultureData.male.length
                        ? cultureData.male
                        : cultureData.neutral;
                    break;
                case AIGender.FEMALE:
                    firstNamePool = cultureData.female.length
                        ? cultureData.female
                        : cultureData.neutral;
                    break;
                default:
                    firstNamePool = cultureData.neutral;
                    break;
            }
            lastNamePool = cultureData.last;
        } else {
            switch (aiGender) {
                case AIGender.MALE:
                    firstNamePool = [
                        "Arthur",
                        "David",
                        "Ethan",
                        "James",
                        "Liam",
                        "Michael",
                        "Noah",
                        "Ryan",
                        "Chris",
                        "Ben",
                    ];
                    break;
                case AIGender.FEMALE:
                    firstNamePool = [
                        "Anna",
                        "Chloe",
                        "Emily",
                        "Emma",
                        "Isabella",
                        "Olivia",
                        "Sophia",
                        "Ava",
                        "Grace",
                        "Sarah",
                    ];
                    break;
                default:
                    firstNamePool = [
                        "Alex",
                        "Jordan",
                        "Casey",
                        "Morgan",
                        "Riley",
                        "Skyler",
                        "Cameron",
                        "Drew",
                        "Kai",
                        "Taylor",
                    ];
                    break;
            }
            lastNamePool = [
                "Smith",
                "Jones",
                "Williams",
                "Brown",
                "Davis",
                "Miller",
                "Wilson",
                "Chen",
                "Lee",
                "Garcia",
            ];
        }
        const firstName =
            firstNamePool[Math.floor(Math.random() * firstNamePool.length)];
        const lastName =
            lastNamePool[Math.floor(Math.random() * lastNamePool.length)];
        aiName = `${firstName} ${lastName}`;
    }
    // Return a new ScenarioDetails with all fields filled
    return {
        ...scenario,
        aiGender,
        aiCulture,
        aiName,
    };
}
