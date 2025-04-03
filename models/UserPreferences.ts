export type UnitType = "metric" | "imperial";

export interface UserPreferences {
	unitType: UnitType;
	allergies: string[];
	excludedIngredients: string[]; // Ingredients the user wants to avoid
	favoriteRecipes: string[]; // Array of recipe IDs
	isVegan: boolean; // Whether the user is vegan
	userName?: string; // Optional user name for non-guest users
	showNutritionalInfo: boolean; // Whether to show nutritional info by default
}

export const defaultUserPreferences: UserPreferences = {
	unitType: "metric",
	allergies: [],
	excludedIngredients: [],
	favoriteRecipes: [],
	isVegan: false,
	userName: undefined,
	showNutritionalInfo: false, // Collapsed by default
};
