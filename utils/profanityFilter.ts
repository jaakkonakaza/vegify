import { Profanity, ProfanityOptions } from "@2toad/profanity";

// Initialize the profanity filter with default options
const options = new ProfanityOptions();
const profanity = new Profanity(options);

/**
 * Checks if a string contains profanity
 * @param text The text to check for profanity
 * @returns True if the text contains profanity, false otherwise
 */
export const containsProfanity = (text: string): boolean => {
	if (!text) return false;
	return profanity.exists(text);
};

/**
 * Censors profanity in a string
 * @param text The text to censor
 * @param censorCharacter The character to use for censoring (default: '*')
 * @returns The censored text
 */
export const censorProfanity = (
	text: string,
	censorCharacter = "*",
): string => {
	if (!text) return "";

	// Create a new options object with the censor character
	const customOptions = new ProfanityOptions();
	// Set the censor character (using type assertion as the library types may be incomplete)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(customOptions as unknown as Record<string, unknown>).censorCharacter =
		censorCharacter;

	// Create a new profanity instance with the custom options
	const customProfanity = new Profanity(customOptions);

	// Censor the text
	return customProfanity.censor(text);
};

/**
 * Gets a list of profanity words found in the text
 * @param text The text to check for profanity
 * @returns Array of profanity words found in the text
 */
export const getProfanityList = (text: string): string[] => {
	if (!text) return [];

	// The 2Toad/Profanity library doesn't actually have a list method
	// So we'll implement a simple version by checking each word against the profanity filter

	// Split the text into words
	const words = text.toLowerCase().split(/\s+/);

	// Check each word for profanity
	const profanityWords: string[] = [];
	for (const word of words) {
		// Clean the word of punctuation
		const cleanWord = word.replace(/[^\w\s]/g, "");
		if (cleanWord && profanity.exists(cleanWord)) {
			profanityWords.push(cleanWord);
		}
	}

	return profanityWords;
};
