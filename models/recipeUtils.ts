import type { Recipe, FilterOptions } from "./Recipe";
import Fuse from "fuse.js";

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

	// First apply all non-search filters
	let filteredRecipes = recipes.filter((recipe) => {
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
			if (filters.dietary.vegan && filters.dietary.vegetarian) {
				// If both filters are enabled, show recipes that are either vegan OR vegetarian
				if (!recipe.vegan && !recipe.vegetarian) {
					return false;
				}
			} else if (filters.dietary.vegan && !recipe.vegan) {
				// If only vegan filter is enabled
				return false;
			} else if (filters.dietary.vegetarian && !recipe.vegetarian) {
				// If only vegetarian filter is enabled
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

		return true;
	});

	// Then apply search query filter using Fuse.js for fuzzy searching
	if (filters.searchQuery && filters.searchQuery.trim() !== "") {
		const fuseOptions = {
			includeScore: true,
			shouldSort: true,
			threshold: 0.4, // Lower threshold means more strict matching
			location: 0,
			distance: 100,
			minMatchCharLength: 2,
			keys: [
				{ name: "name", weight: 0.5 }, // Recipe name is most important
				{ name: "description", weight: 0.3 }, // Description is next
				{ name: "ingredients.name", weight: 0.3 }, // Ingredients are important too
				{ name: "tags", weight: 0.2 }, // Tags are less important
				{ name: "cuisineType", weight: 0.1 }, // Cuisine type is least important
				{ name: "dishType", weight: 0.1 }, // Dish type is least important
			],
		};

		const fuse = new Fuse(filteredRecipes, fuseOptions);
		const searchResults = fuse.search(filters.searchQuery);

		// Extract the items from the search results
		filteredRecipes = searchResults.map((result) => result.item);
	}

	return filteredRecipes;
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
