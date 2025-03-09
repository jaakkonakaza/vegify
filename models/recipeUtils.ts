import type { Recipe, FilterOptions } from "./Recipe";

/**
 * Filter recipes based on the provided filter options
 */
export function filterRecipes(
	recipes: Recipe[],
	filters: FilterOptions,
): Recipe[] {
	if (!filters || Object.keys(filters).length === 0) {
		return recipes;
	}

	return recipes.filter((recipe) => {
		// Filter by meal time
		if (filters.mealTime && filters.mealTime.length > 0) {
			if (!recipe.mealTime.some((time) => filters.mealTime?.includes(time))) {
				return false;
			}
		}

		// Filter by max prep time
		if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
			return false;
		}

		// Filter by cuisine type
		if (filters.cuisineType && filters.cuisineType.length > 0) {
			if (
				!recipe.cuisineType.some((cuisine) =>
					filters.cuisineType?.includes(cuisine),
				)
			) {
				return false;
			}
		}

		// Filter by dish type
		if (filters.dishType && filters.dishType.length > 0) {
			if (!recipe.dishType.some((type) => filters.dishType?.includes(type))) {
				return false;
			}
		}

		// Filter by allergens (exclude recipes with specified allergens)
		if (filters.allergens && filters.allergens.length > 0) {
			if (
				recipe.allergens.some((allergen) =>
					filters.allergens?.includes(allergen),
				)
			) {
				return false;
			}
		}

		// Filter by dietary preferences
		if (filters.dietary) {
			if (filters.dietary.vegan && !recipe.vegan) {
				return false;
			}
			if (filters.dietary.vegetarian && !recipe.vegetarian) {
				return false;
			}
		}

		// Filter by included ingredients
		if (filters.includeIngredients && filters.includeIngredients.length > 0) {
			const recipeIngredientNames = recipe.ingredients.map((ing) =>
				ing.name.toLowerCase(),
			);
			if (
				!filters.includeIngredients.some((ingredient) =>
					recipeIngredientNames.some((name) =>
						name.includes(ingredient.toLowerCase()),
					),
				)
			) {
				return false;
			}
		}

		// Filter by search query
		if (filters.searchQuery && filters.searchQuery.trim() !== "") {
			const query = filters.searchQuery.toLowerCase();
			const nameMatch = recipe.name.toLowerCase().includes(query);
			const descriptionMatch = recipe.description.toLowerCase().includes(query);
			const ingredientMatch = recipe.ingredients.some((ing) =>
				ing.name.toLowerCase().includes(query),
			);
			const tagMatch = recipe.tags.some((tag) =>
				tag.toLowerCase().includes(query),
			);

			if (!(nameMatch || descriptionMatch || ingredientMatch || tagMatch)) {
				return false;
			}
		}

		return true;
	});
}

/**
 * Get unique values for filter options from recipes
 */
export function getFilterOptions(recipes: Recipe[]) {
	const mealTimes = new Set<string>();
	const cuisineTypes = new Set<string>();
	const dishTypes = new Set<string>();
	const allergens = new Set<string>();
	const ingredients = new Set<string>();

	for (const recipe of recipes) {
		// Collect meal times
		for (const time of recipe.mealTime) {
			mealTimes.add(time);
		}

		// Collect cuisine types
		for (const cuisine of recipe.cuisineType) {
			cuisineTypes.add(cuisine);
		}

		// Collect dish types
		for (const type of recipe.dishType) {
			dishTypes.add(type);
		}

		// Collect allergens
		for (const allergen of recipe.allergens) {
			allergens.add(allergen);
		}

		// Collect ingredients
		for (const ing of recipe.ingredients) {
			ingredients.add(ing.name.toLowerCase());
		}
	}

	return {
		mealTimes: Array.from(mealTimes).sort(),
		cuisineTypes: Array.from(cuisineTypes).sort(),
		dishTypes: Array.from(dishTypes).sort(),
		allergens: Array.from(allergens).sort(),
		ingredients: Array.from(ingredients).sort(),
		prepTimes: [15, 30, 45, 60],
	};
}
