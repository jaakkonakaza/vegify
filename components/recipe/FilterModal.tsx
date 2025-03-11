import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	Modal,
	TouchableOpacity,
	ScrollView,
	TextInput,
	SafeAreaView,
	KeyboardAvoidingView,
	Platform,
	TextInputSubmitEditingEventData,
	NativeSyntheticEvent,
	Keyboard,
	TouchableWithoutFeedback,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { FilterChip } from "@/components/recipe/FilterChip";
import type {
	FilterOptions,
	MealTime,
	Recipe,
	SortOption,
} from "@/models/Recipe";
import { filterRecipes } from "@/models/recipeUtils";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import Slider from "@react-native-community/slider";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useFilters } from "@/contexts/FilterContext";

interface FilterModalProps {
	visible: boolean;
	onClose: () => void;
	onApplyFilters: (filters: FilterOptions) => void;
	currentFilters: FilterOptions;
	filterOptions: {
		mealTimes: string[];
		cuisineTypes: string[];
		dishTypes: string[];
		allergens: string[];
		ingredients: string[];
		prepTimes: number[];
	};
	allRecipes: Recipe[];
}

// Simple custom slider component
function SimpleSlider({
	value,
	onValueChange,
	min = 0,
	max = 60,
	step = 5,
	isDark = false,
}: {
	value: number;
	onValueChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	isDark?: boolean;
}) {
	const trackColor = isDark ? "#444" : "#d3d3d3";
	const fillColor = isDark ? Colors.dark.tint : Colors.light.tint;

	return (
		<View style={sliderStyles.container}>
			<Slider
				minimumValue={min}
				maximumValue={max}
				step={step}
				value={value}
				minimumTrackTintColor={fillColor}
				maximumTrackTintColor={trackColor}
				onValueChange={onValueChange}
			/>
		</View>
	);
}

const sliderStyles = StyleSheet.create({
	container: {
		width: "100%",
		height: 40,
		justifyContent: "center",
	},
	track: {
		height: 4,
		borderRadius: 2,
	},
	fill: {
		height: 4,
		borderRadius: 2,
	},
	stepsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		position: "absolute",
		width: "100%",
	},
	step: {
		width: 16,
		height: 16,
		borderRadius: 8,
		borderWidth: 2,
	},
	activeStep: {},
});

export function FilterModal({
	visible,
	onClose,
	onApplyFilters,
	currentFilters,
	filterOptions,
	allRecipes,
}: FilterModalProps) {
	const [filters, setFilters] = useState<FilterOptions>(currentFilters);
	const [ingredientInput, setIngredientInput] = useState("");
	const [excludeIngredientInput, setExcludeIngredientInput] = useState("");
	const [matchingRecipesCount, setMatchingRecipesCount] = useState(
		allRecipes.length,
	);
	const { preferences } = useUserPreferences();
	const scrollViewRef = useRef<ScrollView>(null);
	const { searchQuery, recipeFavorites, setSearchQuery } = useFilters();

	// Get the current color scheme
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	// Define theme-specific colors
	const backgroundColor = isDark
		? Colors.dark.background
		: Colors.light.background;
	const textColor = isDark ? Colors.dark.text : Colors.light.text;
	const borderColor = isDark ? "#333" : "#eee";
	const inputBackgroundColor = isDark ? "#2A2A2A" : "#fff";
	const inputBorderColor = isDark ? "#444" : "#ddd";
	const placeholderColor = isDark ? "#777" : "#999";
	const tintColor = isDark ? Colors.dark.tint : Colors.light.tint;
	const iconColor = isDark ? Colors.dark.icon : Colors.light.icon;
	const matchingRecipesBgColor = isDark ? "#1E1E1E" : "#f0f0f0";
	const subtextColor = isDark ? "#9BA1A6" : "#666";

	// Reset filters when modal opens with current filters
	useEffect(() => {
		if (visible) {
			// Make sure user allergies are included in the filters
			const updatedFilters = { ...currentFilters };

			// Add user allergies if any
			if (preferences.allergies.length > 0) {
				// Get current allergens from filters
				const currentAllergens = updatedFilters.allergens || [];

				// Add any user allergies that aren't already in the filters
				const missingAllergens = preferences.allergies.filter(
					(allergy) => !currentAllergens.includes(allergy),
				);

				if (missingAllergens.length > 0) {
					updatedFilters.allergens = [...currentAllergens, ...missingAllergens];
				}
			}

			// Add vegan preference if user is vegan
			if (preferences.isVegan) {
				updatedFilters.dietary = {
					...updatedFilters.dietary,
					vegan: true,
				};
			}

			setFilters(updatedFilters);
			setIngredientInput("");
			setExcludeIngredientInput("");
		}
	}, [visible, currentFilters, preferences.allergies, preferences.isVegan]);

	// Update matching recipes count when filters change
	useEffect(() => {
		const filteredRecipes = filterRecipes(allRecipes, filters, recipeFavorites);
		setMatchingRecipesCount(filteredRecipes.length);
	}, [filters, allRecipes, recipeFavorites]);

	// Calculate the number of active filters, excluding user allergies
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

		// Count excluded ingredient filters
		if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
			count += filters.excludeIngredients.length;
		}

		// Count dietary filters
		if (filters.dietary) {
			// Only count vegan filter if it's not set in the user profile
			if (filters.dietary.vegan && !preferences.isVegan) count++;
			if (filters.dietary.vegetarian) count++;
		}

		// Count max prep time filter
		if (filters.maxPrepTime) count++;

		// Count sort option if it's not "none"
		if (filters.sortBy && filters.sortBy !== "none") count++;

		return count;
	}, [filters, preferences.allergies, preferences.isVegan]);

	const handleApplyFilters = () => {
		onApplyFilters(filters);
		onClose();
	};

	const handleResetFilters = () => {
		// Reset filters but preserve user allergies and vegan preference
		const newFilters: FilterOptions = {};

		// Keep user allergies
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

		if (preferences.excludedIngredients.length > 0) {
			newFilters.excludeIngredients = [...preferences.excludedIngredients];
		}

		setFilters(newFilters);
		setIngredientInput("");
		setExcludeIngredientInput("");
	};

	const toggleMealTime = (mealTime: MealTime) => {
		setFilters((prev) => {
			const currentMealTimes = prev.mealTime || [];
			const newMealTimes = currentMealTimes.includes(mealTime)
				? currentMealTimes.filter((time) => time !== mealTime)
				: [...currentMealTimes, mealTime];

			return {
				...prev,
				mealTime: newMealTimes.length > 0 ? newMealTimes : undefined,
			};
		});
	};

	const toggleCuisineType = (cuisineType: string) => {
		setFilters((prev) => {
			const currentCuisineTypes = prev.cuisineType || [];
			const newCuisineTypes = currentCuisineTypes.includes(cuisineType)
				? currentCuisineTypes.filter((type) => type !== cuisineType)
				: [...currentCuisineTypes, cuisineType];

			return {
				...prev,
				cuisineType: newCuisineTypes.length > 0 ? newCuisineTypes : undefined,
			};
		});
	};

	const toggleDishType = (dishType: string) => {
		setFilters((prev) => {
			const currentDishTypes = prev.dishType || [];
			const newDishTypes = currentDishTypes.includes(dishType)
				? currentDishTypes.filter((type) => type !== dishType)
				: [...currentDishTypes, dishType];

			return {
				...prev,
				dishType: newDishTypes.length > 0 ? newDishTypes : undefined,
			};
		});
	};

	const toggleAllergen = (allergen: string) => {
		setFilters((prev) => {
			const currentAllergens = prev.allergens || [];
			const newAllergens = currentAllergens.includes(allergen)
				? currentAllergens.filter((a) => a !== allergen)
				: [...currentAllergens, allergen];

			return {
				...prev,
				allergens: newAllergens.length > 0 ? newAllergens : undefined,
			};
		});
	};

	const toggleDietary = (type: "vegan" | "vegetarian") => {
		setFilters((prev) => {
			const currentDietary = prev.dietary || {};

			// If user is vegan, don't allow toggling off vegan filter
			if (type === "vegan" && preferences.isVegan) {
				return prev;
			}

			const newValue = !(currentDietary[type] || false);

			return {
				...prev,
				dietary: {
					...currentDietary,
					[type]: newValue || undefined,
				},
			};
		});
	};

	const addIngredient = () => {
		if (!ingredientInput.trim()) return;

		setFilters((prev) => {
			const currentIngredients = prev.includeIngredients || [];
			// Don't add if already exists
			if (
				currentIngredients.some(
					(ing) => ing.toLowerCase() === ingredientInput.trim().toLowerCase(),
				)
			)
				return prev;

			return {
				...prev,
				includeIngredients: [...currentIngredients, ingredientInput.trim()],
			};
		});

		setIngredientInput("");
		scrollToBottom();
	};

	const removeIngredient = (ingredient: string) => {
		setFilters((prev) => {
			const currentIngredients = prev.includeIngredients || [];
			const newIngredients = currentIngredients.filter(
				(ing) => ing !== ingredient,
			);

			return {
				...prev,
				includeIngredients:
					newIngredients.length > 0 ? newIngredients : undefined,
			};
		});
	};

	const addExcludeIngredient = () => {
		if (!excludeIngredientInput.trim()) return;

		setFilters((prev) => {
			const currentExcludeIngredients = prev.excludeIngredients || [];
			// Don't add if already exists
			if (
				currentExcludeIngredients.some(
					(ing) =>
						ing.toLowerCase() === excludeIngredientInput.trim().toLowerCase(),
				)
			)
				return prev;

			return {
				...prev,
				excludeIngredients: [
					...currentExcludeIngredients,
					excludeIngredientInput.trim(),
				],
			};
		});

		setExcludeIngredientInput("");
		scrollToBottom();
	};

	const removeExcludeIngredient = (ingredient: string) => {
		setFilters((prev) => {
			const currentExcludeIngredients = prev.excludeIngredients || [];
			const newExcludeIngredients = currentExcludeIngredients.filter(
				(ing) => ing !== ingredient,
			);

			return {
				...prev,
				excludeIngredients:
					newExcludeIngredients.length > 0 ? newExcludeIngredients : undefined,
			};
		});
	};

	const setMaxPrepTime = (time: number) => {
		setFilters((prev) => ({
			...prev,
			maxPrepTime: time,
		}));
	};

	// Function to scroll to the bottom of the ScrollView
	const scrollToBottom = (animated = true) => {
		if (scrollViewRef.current) {
			scrollViewRef.current.scrollToEnd({ animated: animated });
		}
	};

	// Allergens section in the UI
	const renderAllergensSection = () => {
		if (filterOptions.allergens.length === 0) return null;

		return (
			<View style={styles.section}>
				<Text style={[styles.sectionTitle, { color: textColor }]}>
					Exclude Allergens
				</Text>
				<Text style={[styles.sectionDescription, { color: subtextColor }]}>
					Recipes containing these allergens will be filtered out.
					{preferences.allergies.length > 0 &&
						" Your allergies are automatically selected."}
				</Text>
				<View style={styles.chipContainer}>
					{filterOptions.allergens.map((allergen) => (
						<FilterChip
							key={allergen}
							label={allergen.charAt(0).toUpperCase() + allergen.slice(1)}
							selected={(filters.allergens || []).includes(allergen)}
							onPress={() => toggleAllergen(allergen)}
							// Highlight user's allergies differently
							customStyle={
								preferences.allergies.includes(allergen)
									? styles.userAllergyChip
									: undefined
							}
						/>
					))}
				</View>
			</View>
		);
	};

	const setSortOption = (option: SortOption) => {
		setFilters((prev) => {
			// If selecting the same option, toggle the direction
			if (prev.sortBy === option) {
				return {
					...prev,
					sortDirection: prev.sortDirection === "desc" ? "asc" : "desc",
				};
			}

			// Otherwise, set the new sort option with default direction (desc)
			return {
				...prev,
				sortBy: option,
				sortDirection: "desc",
			};
		});
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={false}
			onRequestClose={onClose}
		>
			<SafeAreaView style={[styles.container, { backgroundColor }]}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={{ flex: 1 }}
				>
					<View style={[styles.header, { borderBottomColor: borderColor }]}>
						<TouchableOpacity onPress={onClose} style={styles.closeButton}>
							<IconSymbol name="xmark" size={24} color={iconColor} />
						</TouchableOpacity>
						<Text style={[styles.headerTitle, { color: textColor }]}>
							Filter Recipes{" "}
							{activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
						</Text>
						<TouchableOpacity
							onPress={handleResetFilters}
							style={styles.resetButton}
						>
							<Text style={[styles.resetText, { color: tintColor }]}>
								Reset
							</Text>
						</TouchableOpacity>
					</View>

					<View
						style={[
							styles.matchingRecipesContainer,
							{ backgroundColor: matchingRecipesBgColor },
						]}
					>
						<Text style={[styles.matchingRecipesText, { color: textColor }]}>
							{matchingRecipesCount}{" "}
							{matchingRecipesCount === 1 ? "recipe" : "recipes"} match your
							{activeFiltersCount > 0
								? " filters"
								: preferences.allergies.length > 0 && preferences.isVegan
									? " allergies and vegan diet"
									: preferences.allergies.length > 0
										? " allergies"
										: preferences.isVegan
											? " vegan diet"
											: " filters"}
						</Text>
					</View>

					<ScrollView
						ref={scrollViewRef}
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						{/* Sorting Options Section */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Sort By
							</Text>
							<Text style={[styles.sectionSubtitle, { color: subtextColor }]}>
								Choose how to sort your recipes
							</Text>
							<View style={styles.chipContainer}>
								<FilterChip
									key="rating"
									label={`Rating ${filters.sortBy === "rating" ? (filters.sortDirection === "desc" ? "↓" : "↑") : ""}`}
									selected={filters.sortBy === "rating"}
									onPress={() => setSortOption("rating")}
								/>
								<FilterChip
									key="favorites"
									label={`Most Favorited ${filters.sortBy === "favorites" ? (filters.sortDirection === "desc" ? "↓" : "↑") : ""}`}
									selected={filters.sortBy === "favorites"}
									onPress={() => setSortOption("favorites")}
								/>
								<FilterChip
									key="prepTime"
									label={`Prep Time ${filters.sortBy === "prepTime" ? (filters.sortDirection === "desc" ? "↓" : "↑") : ""}`}
									selected={filters.sortBy === "prepTime"}
									onPress={() => setSortOption("prepTime")}
								/>
								<FilterChip
									key="none"
									label="No Sorting"
									selected={!filters.sortBy || filters.sortBy === "none"}
									onPress={() => setSortOption("none")}
								/>
							</View>
						</View>

						{/* Meal Time Filter */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Meal Time
							</Text>
							<View style={styles.chipContainer}>
								{filterOptions.mealTimes.map((mealTime) => (
									<FilterChip
										key={mealTime}
										label={mealTime}
										selected={Boolean(
											filters.mealTime?.includes(mealTime as MealTime),
										)}
										onPress={() => toggleMealTime(mealTime as MealTime)}
									/>
								))}
							</View>
						</View>

						{/* Prep Time Filter */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Max Preparation Time
							</Text>
							<View style={styles.sliderContainer}>
								<SimpleSlider
									value={filters.maxPrepTime || 60}
									onValueChange={setMaxPrepTime}
									isDark={isDark}
								/>
								<Text
									style={[
										styles.sliderValue,
										{ color: isDark ? "#9BA1A6" : "#666" },
									]}
								>
									{filters.maxPrepTime || 60} minutes or less
								</Text>
							</View>
						</View>

						{/* Cuisine Type Filter */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Cuisine
							</Text>
							<View style={styles.chipContainer}>
								{filterOptions.cuisineTypes.map((cuisine) => (
									<FilterChip
										key={cuisine}
										label={cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
										selected={(filters.cuisineType || []).includes(cuisine)}
										onPress={() => toggleCuisineType(cuisine)}
									/>
								))}
							</View>
						</View>

						{/* Dish Type Filter */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Dish Type
							</Text>
							<View style={styles.chipContainer}>
								{filterOptions.dishTypes.map((type) => (
									<FilterChip
										key={type}
										label={type.charAt(0).toUpperCase() + type.slice(1)}
										selected={(filters.dishType || []).includes(type)}
										onPress={() => toggleDishType(type)}
									/>
								))}
							</View>
						</View>

						{/* Dietary Preferences */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Dietary Preferences
							</Text>
							{preferences.isVegan && (
								<Text style={[styles.infoText, { color: subtextColor }]}>
									Vegan filter is applied from your profile settings and not
									counted as an active filter.
								</Text>
							)}
							<View style={styles.chipContainer}>
								<FilterChip
									label={preferences.isVegan ? "Vegan (from profile)" : "Vegan"}
									selected={!!filters.dietary?.vegan}
									onPress={() => toggleDietary("vegan")}
									customStyle={
										preferences.isVegan ? styles.profileChip : undefined
									}
								/>
								<FilterChip
									label="Vegetarian"
									selected={!!filters.dietary?.vegetarian}
									onPress={() => toggleDietary("vegetarian")}
								/>
							</View>
						</View>

						{/* Allergens Filter */}
						{renderAllergensSection()}

						{/* Include Ingredients Filter */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Include Ingredients
							</Text>
							<Text style={[styles.sectionSubtitle, { color: subtextColor }]}>
								Show recipes containing at least one of these ingredients
							</Text>
							<View style={styles.inputContainer}>
								<TextInput
									style={[
										styles.input,
										{
											backgroundColor: inputBackgroundColor,
											borderColor: inputBorderColor,
											color: textColor,
										},
									]}
									value={ingredientInput}
									onChangeText={setIngredientInput}
									placeholder="Add ingredient you have"
									placeholderTextColor={placeholderColor}
									returnKeyType="done"
									onSubmitEditing={addIngredient}
									submitBehavior="submit"
									onFocus={() => scrollToBottom(false)}
								/>
								<TouchableOpacity
									style={[styles.addButton, { backgroundColor: tintColor }]}
									onPress={addIngredient}
								>
									<IconSymbol name="plus" size={24} color="#fff" />
								</TouchableOpacity>
							</View>
							<View style={styles.chipContainer}>
								{(filters.includeIngredients || []).map((ingredient) => (
									<FilterChip
										key={ingredient}
										label={ingredient}
										selected={true}
										onPress={() => removeIngredient(ingredient)}
										showIcon={false}
									/>
								))}
							</View>
						</View>

						{/* Exclude Ingredients Filter */}
						<View style={styles.section}>
							<Text style={[styles.sectionTitle, { color: textColor }]}>
								Exclude Ingredients
							</Text>
							<Text style={[styles.sectionSubtitle, { color: subtextColor }]}>
								Filter out recipes containing these ingredients
							</Text>
							<View style={styles.inputContainer}>
								<TextInput
									style={[
										styles.input,
										{
											backgroundColor: inputBackgroundColor,
											borderColor: inputBorderColor,
											color: textColor,
										},
									]}
									value={excludeIngredientInput}
									onChangeText={setExcludeIngredientInput}
									placeholder="Add ingredient you want to avoid"
									placeholderTextColor={placeholderColor}
									returnKeyType="done"
									onSubmitEditing={addExcludeIngredient}
									submitBehavior="submit"
									onFocus={() => scrollToBottom(false)}
								/>
								<TouchableOpacity
									style={[styles.addButton, { backgroundColor: tintColor }]}
									onPress={addExcludeIngredient}
								>
									<IconSymbol name="plus" size={24} color="#fff" />
								</TouchableOpacity>
							</View>
							<View style={styles.chipContainer}>
								{(filters.excludeIngredients || []).map((ingredient) => (
									<FilterChip
										key={ingredient}
										label={ingredient}
										selected={true}
										onPress={() => removeExcludeIngredient(ingredient)}
										showIcon={false}
									/>
								))}
							</View>
						</View>
					</ScrollView>

					<View style={[styles.footer, { borderTopColor: borderColor }]}>
						<TouchableOpacity
							style={[styles.applyButton, { backgroundColor: tintColor }]}
							onPress={handleApplyFilters}
						>
							<Text style={styles.applyButtonText}>
								Apply Filters (
								{activeFiltersCount > 0 ? activeFiltersCount : "None"}) -{" "}
								{matchingRecipesCount} recipes
							</Text>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	closeButton: {
		padding: 4,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
	},
	resetButton: {
		padding: 4,
	},
	resetText: {
		fontWeight: "600",
	},
	content: {
		flex: 1,
		padding: 16,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 12,
	},
	sectionSubtitle: {
		fontSize: 14,
		marginBottom: 12,
		opacity: 0.7,
	},
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	sliderContainer: {
		marginTop: 8,
	},
	sliderValue: {
		textAlign: "center",
		marginTop: 12,
		fontSize: 14,
	},
	inputContainer: {
		flexDirection: "row",
		marginBottom: 12,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
	},
	addButton: {
		width: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
		marginLeft: 8,
	},
	footer: {
		padding: 16,
		borderTopWidth: 1,
	},
	applyButton: {
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	applyButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
	matchingRecipesContainer: {
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		alignItems: "center",
	},
	matchingRecipesText: {
		fontSize: 16,
		fontWeight: "600",
	},
	sectionDescription: {
		fontSize: 14,
		marginBottom: 12,
	},
	userAllergyChip: {
		borderWidth: 2,
		borderColor: "#FF6B6B",
	},
	profileChip: {
		borderWidth: 2,
		borderColor: "#999",
	},
	infoText: {
		fontSize: 12,
		marginBottom: 8,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
	},
});
