export interface Recipe {
	id: string;
	name: string;
	description: string;
	image: string;
	prepTime: number; // in minutes
	rating: number; // out of 5
	reviewCount: number;
	reviews: Review[];
	servingSize: number; // Number of servings
	vegan: boolean;
	vegetarian: boolean;
	mealTime: MealTime[]; // breakfast, lunch, dinner, snack
	cuisineType: string[]; // chinese, indian, italian, etc.
	dishType: string[]; // soup, pasta, baking, etc.
	allergens: string[]; // nuts, gluten, dairy, etc.
	nutritionalInfo: {
		calories: number;
		fiber: number;
		protein?: number;
		carbs?: number;
		fat?: number;
	};
	ingredients: {
		name: string;
		quantity: string;
		unit?: string;
	}[];
	instructions: string[];
	tags: string[];
}

export interface Review {
	id: string;
	userId: string;
	userName: string;
	rating: number;
	comment: string;
	date: string;
}

export type MealTime = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export type SortOption = "rating" | "favorites" | "prepTime" | "none";

export interface FilterOptions {
	mealTime?: MealTime[];
	maxPrepTime?: number;
	cuisineType?: string[];
	dishType?: string[];
	allergens?: string[];
	includeIngredients?: string[];
	dietary?: {
		vegan?: boolean;
		vegetarian?: boolean;
	};
	searchQuery?: string;
	sortBy?: SortOption;
	sortDirection?: "asc" | "desc";
}
