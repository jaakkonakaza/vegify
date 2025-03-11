export type UnitType = "metric" | "imperial";

export interface UserPreferences {
	unitType: UnitType;
	allergies: string[];
	favoriteRecipes: string[]; // Array of recipe IDs
	isVegan: boolean; // Whether the user is vegan
	userName?: string; // Optional user name for non-guest users
}

export const defaultUserPreferences: UserPreferences = {
	unitType: "metric",
	allergies: [],
	favoriteRecipes: [],
	isVegan: false,
	userName: undefined,
};
