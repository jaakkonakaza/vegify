export type UnitType = "metric" | "imperial";

export interface UserPreferences {
	unitType: UnitType;
	allergies: string[];
	favoriteRecipes: string[]; // Array of recipe IDs
}

export const defaultUserPreferences: UserPreferences = {
	unitType: "metric",
	allergies: [],
	favoriteRecipes: [],
};
