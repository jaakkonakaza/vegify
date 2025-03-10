export type UnitType = "metric" | "imperial";

export interface UserPreferences {
	unitType: UnitType;
	allergies: string[];
	favoriteRecipes: string[]; // Array of recipe IDs
	isVegan: boolean; // Whether the user is vegan
}

export const defaultUserPreferences: UserPreferences = {
	unitType: "metric",
	allergies: [],
	favoriteRecipes: [],
	isVegan: false,
};
