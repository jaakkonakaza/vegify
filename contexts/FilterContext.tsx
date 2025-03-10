import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";
import type { FilterOptions } from "@/models/Recipe";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface FilterContextType {
	searchQuery: string;
	filters: FilterOptions;
	showFavoritesOnly: boolean;
	setSearchQuery: (query: string) => void;
	setFilters: (filters: FilterOptions) => void;
	setShowFavoritesOnly: (show: boolean) => void;
	clearFilters: () => void;
	syncAllergies: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
	const { preferences } = useUserPreferences();
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<FilterOptions>({});
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	// Initialize filters with user's allergies and vegan preference
	useEffect(() => {
		const newFilters: FilterOptions = {};

		// Add allergies if any
		if (preferences.allergies.length > 0) {
			newFilters.allergens = [...preferences.allergies];
		}

		// Add vegan preference if user is vegan
		if (preferences.isVegan) {
			newFilters.dietary = {
				...newFilters.dietary,
				vegan: true,
			};
		}

		setFilters(newFilters);
	}, [preferences.allergies, preferences.isVegan]);

	// Function to sync allergies from user preferences to filters
	const syncAllergies = useCallback(() => {
		setFilters((prevFilters) => {
			const newFilters = { ...prevFilters };

			// Update allergens
			if (preferences.allergies.length > 0) {
				newFilters.allergens = [...preferences.allergies];
			} else {
				// Instead of using delete, set to undefined
				newFilters.allergens = undefined;
			}

			return newFilters;
		});
	}, [preferences.allergies]);

	// Modified clear filters to preserve user allergies and vegan preference
	const clearFilters = useCallback(() => {
		setSearchQuery("");

		// Create new filters object
		const newFilters: FilterOptions = {};

		// Keep allergies from user preferences
		if (preferences.allergies.length > 0) {
			newFilters.allergens = [...preferences.allergies];
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
	}, [preferences.allergies, preferences.isVegan]);

	return (
		<FilterContext.Provider
			value={{
				searchQuery,
				filters,
				showFavoritesOnly,
				setSearchQuery,
				setFilters,
				setShowFavoritesOnly,
				clearFilters,
				syncAllergies,
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
