import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
	type ReactNode,
} from "react";
import type { FilterOptions } from "@/models/Recipe";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { sampleRecipes } from "@/models/sampleData";

interface FilterContextType {
	searchQuery: string;
	filters: FilterOptions;
	showFavoritesOnly: boolean;
	recipeFavorites: Record<string, number>;
	setSearchQuery: (query: string) => void;
	setFilters: (filters: FilterOptions) => void;
	setShowFavoritesOnly: (show: boolean) => void;
	clearFilters: () => void;
	syncUserPreferences: () => void;
	getFavoriteCount: (recipeId: string) => number;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Initialize recipe favorites with base values (5-100 likes)
const initializeRecipeFavorites = (): Record<string, number> => {
	const favorites: Record<string, number> = {};
	for (const recipe of sampleRecipes) {
		// Generate a consistent base number of likes for each recipe
		// Using the recipe ID to ensure the same recipe always gets the same base number
		const baseNumber =
			(Number.parseInt(recipe.id.replace(/\D/g, ""), 10) % 96) + 5;
		favorites[recipe.id] = baseNumber;
	}
	return favorites;
};

export function FilterProvider({ children }: { children: ReactNode }) {
	const { preferences } = useUserPreferences();
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<FilterOptions>({});
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [recipeFavorites, setRecipeFavorites] = useState<
		Record<string, number>
	>(initializeRecipeFavorites());

	// Use a ref to track the current state without creating a dependency
	const recipeFavoritesRef = useRef(recipeFavorites);
	useEffect(() => {
		recipeFavoritesRef.current = recipeFavorites;
	}, [recipeFavorites]);

	// Initialize filters with user's allergies, excluded ingredients, and vegan preference
	useEffect(() => {
		const newFilters: FilterOptions = {};

		// Add allergies if any
		if (preferences.allergies.length > 0) {
			newFilters.allergens = [...preferences.allergies];
		}

		// Add excluded ingredients if any
		if (preferences.excludedIngredients.length > 0) {
			newFilters.excludeIngredients = [...preferences.excludedIngredients];
		}

		// Add vegan preference if user is vegan
		if (preferences.isVegan) {
			newFilters.dietary = {
				...newFilters.dietary,
				vegan: true,
			};
		}

		setFilters(newFilters);
	}, [
		preferences.allergies,
		preferences.excludedIngredients,
		preferences.isVegan,
	]);

	// Update recipe favorites when user favorites change
	useEffect(() => {
		// Create a new object to track if we need to update state
		const updatedFavorites: Record<string, number> = {};
		let hasChanges = false;

		// Calculate favorites for all recipes
		for (const recipe of sampleRecipes) {
			// Get the base number (without user favorite)
			const baseNumber =
				(Number.parseInt(recipe.id.replace(/\D/g, ""), 10) % 96) + 5;
			// Check if user has favorited this recipe
			const isFavorited = preferences.favoriteRecipes.includes(recipe.id);
			// Calculate the total count
			const totalCount = baseNumber + (isFavorited ? 1 : 0);

			// Store the new value
			updatedFavorites[recipe.id] = totalCount;

			// Check if this is different from the current value
			if (recipeFavoritesRef.current[recipe.id] !== totalCount) {
				hasChanges = true;
			}
		}

		// Only update state if there are actual changes
		if (hasChanges) {
			setRecipeFavorites(updatedFavorites);
		}
	}, [preferences.favoriteRecipes]); // Only depend on favoriteRecipes

	// Function to get favorite count for a recipe
	const getFavoriteCount = useCallback(
		(recipeId: string) => {
			return recipeFavorites[recipeId] || 0;
		},
		[recipeFavorites],
	);

	// Function to sync allergies and excluded ingredients from user preferences to filters
	const syncUserPreferences = useCallback(() => {
		setFilters((prevFilters) => {
			const newFilters = { ...prevFilters };

			// Update allergens
			if (preferences.allergies.length > 0) {
				newFilters.allergens = [...preferences.allergies];
			} else {
				// Instead of using delete, set to undefined
				newFilters.allergens = undefined;
			}

			// Update excluded ingredients
			if (preferences.excludedIngredients.length > 0) {
				newFilters.excludeIngredients = [...preferences.excludedIngredients];
			} else {
				newFilters.excludeIngredients = undefined;
			}

			return newFilters;
		});
	}, [preferences.allergies, preferences.excludedIngredients]);

	// Modified clear filters to preserve user allergies, excluded ingredients, and vegan preference
	const clearFilters = useCallback(() => {
		setSearchQuery("");

		// Create new filters object
		const newFilters: FilterOptions = {};

		// Keep allergies from user preferences
		if (preferences.allergies.length > 0) {
			newFilters.allergens = [...preferences.allergies];
		}

		// Keep excluded ingredients from user preferences
		if (preferences.excludedIngredients.length > 0) {
			newFilters.excludeIngredients = [...preferences.excludedIngredients];
		}

		// Keep vegan preference if user is vegan
		if (preferences.isVegan) {
			newFilters.dietary = {
				...newFilters.dietary,
				vegan: true,
			};
		}

		setFilters(newFilters);
		setShowFavoritesOnly(false);
	}, [
		preferences.allergies,
		preferences.excludedIngredients,
		preferences.isVegan,
	]);

	return (
		<FilterContext.Provider
			value={{
				searchQuery,
				filters,
				showFavoritesOnly,
				recipeFavorites,
				setSearchQuery,
				setFilters,
				setShowFavoritesOnly,
				clearFilters,
				syncUserPreferences,
				getFavoriteCount,
			}}
		>
			{children}
		</FilterContext.Provider>
	);
}

export function useFilters() {
	const context = useContext(FilterContext);
	if (context === undefined) {
		throw new Error("useFilters must be used within a FilterProvider");
	}
	return context;
}
