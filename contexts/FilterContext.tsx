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

	// Initialize filters with user's allergies
	useEffect(() => {
		if (preferences.allergies.length > 0) {
			setFilters((prevFilters) => ({
				...prevFilters,
				allergens: [...preferences.allergies],
			}));
		}
	}, [preferences.allergies]);

	// Function to sync allergies from user preferences to filters
	const syncAllergies = useCallback(() => {
		setFilters((prevFilters) => ({
			...prevFilters,
			allergens:
				preferences.allergies.length > 0
					? [...preferences.allergies]
					: undefined,
		}));
	}, [preferences.allergies]);

	// Modified clear filters to preserve user allergies
	const clearFilters = useCallback(() => {
		setSearchQuery("");
		// Keep only the allergens from user preferences
		setFilters(
			preferences.allergies.length > 0
				? {
						allergens: [...preferences.allergies],
					}
				: {},
		);
		setShowFavoritesOnly(false);
	}, [preferences.allergies]);

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
