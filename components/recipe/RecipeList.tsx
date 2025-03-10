import React, { useState, useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import { useScrollToTop } from "@react-navigation/native";
import type { Recipe, FilterOptions } from "@/models/Recipe";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { SearchBar } from "@/components/recipe/SearchBar";
import { FilterModal } from "@/components/recipe/FilterModal";
import { filterRecipes, getFilterOptions } from "@/models/recipeUtils";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useFilters } from "@/contexts/FilterContext";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface RecipeListProps {
	recipes: Recipe[];
	title?: string;
}

export function RecipeList({ recipes, title }: RecipeListProps) {
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);
	const [filterOptions] = useState(() => getFilterOptions(recipes));
	const { preferences } = useUserPreferences();
	const {
		searchQuery,
		filters,
		showFavoritesOnly,
		setSearchQuery,
		setFilters,
		setShowFavoritesOnly,
	} = useFilters();

	// Create a ref for the FlatList to use with useScrollToTop
	const flatListRef = useRef(null);
	// Register the ref with useScrollToTop
	useScrollToTop(flatListRef);

	// Apply filters when search query, filters, or favorites toggle changes
	useEffect(() => {
		const newFilters: FilterOptions = { ...filters };

		// Only add search query to filters if it's not empty
		if (searchQuery.trim()) {
			newFilters.searchQuery = searchQuery;
		}

		// First filter by the regular filters
		let filtered = filterRecipes(recipes, newFilters);

		// Then filter by favorites if needed
		if (showFavoritesOnly) {
			filtered = filtered.filter((recipe) =>
				preferences.favoriteRecipes.includes(recipe.id),
			);
		}

		setFilteredRecipes(filtered);
	}, [
		recipes,
		searchQuery,
		filters,
		showFavoritesOnly,
		preferences.favoriteRecipes,
	]);

	const handleApplyFilters = (newFilters: FilterOptions) => {
		setFilters(newFilters);
	};

	const toggleFavoritesOnly = () => {
		setShowFavoritesOnly(!showFavoritesOnly);
	};

	// Calculate the number of active filters
	const activeFiltersCount = useMemo(() => {
		let count = 0;

		// Count meal time filters
		if (filters.mealTime && filters.mealTime.length > 0) {
			count += filters.mealTime.length;
		}

		// Count cuisine type filters
		if (filters.cuisineType && filters.cuisineType.length > 0) {
			count += filters.cuisineType.length;
		}

		// Count dish type filters
		if (filters.dishType && filters.dishType.length > 0) {
			count += filters.dishType.length;
		}

		// Count allergen filters - exclude user allergies
		if (filters.allergens && filters.allergens.length > 0) {
			// Only count allergens that are not in the user's preferences
			const manuallySelectedAllergens = filters.allergens.filter(
				(allergen) => !preferences.allergies.includes(allergen),
			);
			count += manuallySelectedAllergens.length;
		}

		// Count ingredient filters
		if (filters.includeIngredients && filters.includeIngredients.length > 0) {
			count += filters.includeIngredients.length;
		}

		// Count dietary filters
		if (filters.dietary) {
			// Only count vegan filter if it's not set in the user profile
			if (filters.dietary.vegan && !preferences.isVegan) count++;
			if (filters.dietary.vegetarian) count++;
		}

		// Count max prep time filter
		if (filters.maxPrepTime) count++;

		return count;
	}, [filters, preferences.allergies, preferences.isVegan]);

	// Determine if any filters are active, excluding user allergies
	const isFilterActive = useMemo(() => {
		// If there are no filters at all, return false
		if (Object.keys(filters).length === 0) return false;

		// If there are filters other than allergens and dietary, return true
		const nonSpecialFilters = Object.keys(filters).filter(
			(key) => key !== "allergens" && key !== "dietary",
		);
		if (nonSpecialFilters.length > 0) return true;

		// Check allergens
		if (filters.allergens && filters.allergens.length > 0) {
			const hasManualAllergens = filters.allergens.some(
				(allergen) => !preferences.allergies.includes(allergen),
			);
			if (hasManualAllergens) return true;
		}

		// Check dietary preferences
		if (filters.dietary) {
			// If vegan is set but user is not vegan in profile, count it
			if (filters.dietary.vegan && !preferences.isVegan) return true;
			// If vegetarian is set, always count it
			if (filters.dietary.vegetarian) return true;
		}

		return false;
	}, [filters, preferences.allergies, preferences.isVegan]);

	const renderRecipeCard = ({ item }: { item: Recipe }) => {
		return <RecipeCard recipe={item} searchTerm={searchQuery} />;
	};

	if (filteredRecipes.length === 0) {
		return (
			<ThemedView style={styles.container}>
				<SearchBar
					value={searchQuery}
					onChangeText={setSearchQuery}
					onFilterPress={() => setShowFilterModal(true)}
					filterActive={isFilterActive}
					activeFiltersCount={activeFiltersCount}
					showFavoritesOnly={showFavoritesOnly}
					onFavoritesToggle={toggleFavoritesOnly}
				/>
				<View style={styles.emptyContainer}>
					<IconSymbol name="magnifyingglass" size={64} color="#ccc" />
					<ThemedText style={styles.emptyText}>
						{showFavoritesOnly
							? "No favorite recipes found"
							: "Try adjusting your filters or search query"}
					</ThemedText>
				</View>
				<FilterModal
					visible={showFilterModal}
					onClose={() => setShowFilterModal(false)}
					onApplyFilters={handleApplyFilters}
					currentFilters={filters}
					filterOptions={filterOptions}
					allRecipes={recipes}
				/>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<SearchBar
				value={searchQuery}
				onChangeText={setSearchQuery}
				onFilterPress={() => setShowFilterModal(true)}
				filterActive={isFilterActive}
				activeFiltersCount={activeFiltersCount}
				showFavoritesOnly={showFavoritesOnly}
				onFavoritesToggle={toggleFavoritesOnly}
			/>
			{title && <ThemedText style={styles.title}>{title}</ThemedText>}
			{searchQuery.trim() !== "" && (
				<View style={styles.searchResultsContainer}>
					<ThemedText style={styles.searchResultsText}>
						Found {filteredRecipes.length}{" "}
						{filteredRecipes.length === 1 ? "recipe" : "recipes"}
						{filteredRecipes.length > 0 ? " matching " : " for "}
						<Text style={styles.searchQueryText}>"{searchQuery}"</Text>
					</ThemedText>
				</View>
			)}
			<FlatList
				ref={flatListRef}
				data={filteredRecipes}
				keyExtractor={(item) => item.id}
				renderItem={renderRecipeCard}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.listContent}
				keyboardDismissMode="on-drag"
			/>
			<FilterModal
				visible={showFilterModal}
				onClose={() => setShowFilterModal(false)}
				onApplyFilters={handleApplyFilters}
				currentFilters={filters}
				filterOptions={filterOptions}
				allRecipes={recipes}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 16,
		marginHorizontal: 16,
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 90,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 32,
		paddingBottom: 90,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
	searchResultsContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	searchResultsText: {
		fontSize: 14,
	},
	searchQueryText: {
		fontWeight: "bold",
		fontStyle: "italic",
	},
});
