import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	Share,
	Alert,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import type { Recipe } from "@/models/Recipe";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import RecipeParallaxView from "@/components/recipe/RecipeParallaxView";
import { convertUnit, scaleIngredient } from "@/utils/unitConversion";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { getRecipeImage } from "@/utils/recipeUtils";
import Animated, {
	useAnimatedStyle,
	withSpring,
	withTiming,
	useSharedValue,
} from "react-native-reanimated";

interface RecipeDetailProps {
	recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
	const router = useRouter();
	const {
		toggleFavorite,
		isFavorite,
		getRecipeReviews,
		preferences,
		toggleNutritionalInfo,
	} = useUserPreferences();
	const favorite = isFavorite(recipe.id);
	const [servingSize, setServingSize] = useState(recipe.servingSize);
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	const textColor = Colors[colorScheme].text;
	const subtextColor = isDark ? "#9BA1A6" : "#666";
	const iconColor = isDark ? textColor : "black";
	const buttonBgColor = isDark ? "#2A2A2A" : "white";

	const reviews = getRecipeReviews(recipe.id);

	const nutritionHeight = useSharedValue(
		preferences.showNutritionalInfo ? 1 : 0,
	);

	// Calculate fixed height based on layout:
	// - "Per serving" text (20px height + 1px margin)
	// - Nutrition items (2 rows * (40px height + 16px margin))
	const FIXED_CONTENT_HEIGHT = 21 + 2 * 56; // 133px total

	const handleNutritionToggle = () => {
		toggleNutritionalInfo();
		nutritionHeight.value = preferences.showNutritionalInfo ? 0 : 1;
	};

	const nutritionAnimatedStyle = useAnimatedStyle(() => {
		return {
			height: withSpring(nutritionHeight.value * FIXED_CONTENT_HEIGHT, {
				damping: 20,
				stiffness: 200,
				mass: 0.5,
			}),
			opacity: withTiming(nutritionHeight.value, {
				duration: 200,
			}),
		};
	});

	// Convert rating to stars
	const renderStars = () => {
		const stars = [];
		const fullStars = Math.floor(recipe.rating);
		const hasHalfStar = recipe.rating % 1 >= 0.5;

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(
					<IconSymbol key={i} name="star.fill" size={18} color="#FFD700" />,
				);
			} else if (i === fullStars && hasHalfStar) {
				stars.push(
					<IconSymbol
						key={i}
						name="star.lefthalf.fill"
						size={18}
						color="#FFD700"
					/>,
				);
			} else {
				stars.push(
					<IconSymbol key={i} name="star" size={18} color="#FFD700" />,
				);
			}
		}

		return stars;
	};

	const navigateToReviews = () => {
		router.push({
			pathname: "/recipe/reviews",
			params: { recipeId: recipe.id },
		});
	};

	const increaseServings = () => {
		setServingSize((prev) => prev + 1);
	};

	const decreaseServings = () => {
		if (servingSize > 1) {
			setServingSize((prev) => prev - 1);
		}
	};

	// Process ingredients with scaling and unit conversion
	const processedIngredients = recipe.ingredients.map((ingredient) => {
		// First scale the ingredient based on serving size
		const scaledQuantity = scaleIngredient(
			ingredient.quantity,
			recipe.servingSize,
			servingSize,
		);

		// Then convert the unit if needed based on user preferences
		if (ingredient.unit) {
			const isMetric = preferences.unitType === "metric";
			const needsConversion =
				(isMetric &&
					[
						"cup",
						"fl oz",
						"oz",
						"lb",
						"in",
						"ft",
						"tbsp",
						"tsp",
						"gal",
						"pt",
						"qt",
					].includes(ingredient.unit.toLowerCase())) ||
				(!isMetric &&
					["ml", "l", "g", "kg", "cm", "m"].includes(
						ingredient.unit.toLowerCase(),
					));

			if (needsConversion) {
				// Convert units based on user preference
				const result = convertUnit(
					scaledQuantity,
					ingredient.unit,
					undefined, // Let the conversion function determine the appropriate target unit
					ingredient.name,
				);
				return {
					...ingredient,
					displayQuantity: result.quantity,
					displayUnit: result.unit,
				};
			}
		}

		// If no conversion needed, just use the scaled quantity
		return {
			...ingredient,
			displayQuantity: scaledQuantity,
			displayUnit: ingredient.unit,
		};
	});

	const shareRecipe = async () => {
		try {
			const result = await Share.share({
				message: `Check out this recipe: ${recipe.name}`,
				title: recipe.name,
			});

			if (result.action === Share.sharedAction) {
				if (result.activityType) {
					// shared with activity type of result.activityType
				} else {
					// shared
				}
			} else if (result.action === Share.dismissedAction) {
				// dismissed
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			Alert.alert("Error sharing", errorMessage);
		}
	};

	const shareIngredients = async () => {
		try {
			// Create a formatted list of ingredients
			const ingredientsList = processedIngredients
				.map(
					(ingredient) =>
						`${ingredient.displayQuantity} ${ingredient.displayUnit || ""} ${ingredient.name}`,
				)
				.join("\n");

			const shareText = {
				message: `Ingredients for ${recipe.name}:\n\n${ingredientsList}`,
				title: `${recipe.name} Ingredients`,
			};

			const result = await Share.share(shareText);

			if (result.action === Share.sharedAction) {
				if (result.activityType) {
					// shared with activity type of result.activityType
				} else {
					// shared
				}
			} else if (result.action === Share.dismissedAction) {
				// dismissed
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			Alert.alert("Error sharing ingredients", errorMessage);
		}
	};

	const headerContent = (
		<View style={styles.headerControls}>
			<TouchableOpacity
				style={[styles.backButton, { backgroundColor: buttonBgColor }]}
				onPress={() => router.back()}
				activeOpacity={0.7}
			>
				<IconSymbol name="arrow.left" size={24} color={iconColor} />
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.favoriteButton, { backgroundColor: buttonBgColor }]}
				onPress={() => toggleFavorite(recipe.id)}
				activeOpacity={0.7}
			>
				<IconSymbol
					name={favorite ? "heart.fill" : "heart"}
					size={24}
					color={favorite ? "#FF6B6B" : iconColor}
				/>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.shareButton, { backgroundColor: buttonBgColor }]}
				onPress={shareRecipe}
				activeOpacity={0.7}
			>
				<IconSymbol name="square.and.arrow.up" size={24} color={iconColor} />
			</TouchableOpacity>
			<View style={[styles.timeContainer, { backgroundColor: buttonBgColor }]}>
				<IconSymbol name="timer" size={16} color={subtextColor} />
				<Text style={[styles.timeText, { color: subtextColor }]}>
					{recipe.prepTime} min
				</Text>
			</View>
		</View>
	);

	return (
		<RecipeParallaxView
			headerImage={getRecipeImage(recipe.id)}
			headerBackgroundColor={{ light: "#f8f8f8", dark: "#1a1a1a" }}
			headerContent={headerContent}
		>
			<ThemedView style={styles.contentContainer}>
				<View style={styles.titleContainer}>
					<ThemedText style={styles.title}>{recipe.name}</ThemedText>
					<TouchableOpacity
						style={styles.reviewsButton}
						onPress={navigateToReviews}
					>
						<View style={styles.ratingContainer}>
							<View style={styles.stars}>{renderStars()}</View>
							<ThemedText style={styles.reviews}>
								{reviews.length} reviews
							</ThemedText>
							<IconSymbol name="chevron.right" size={16} color={subtextColor} />
						</View>
					</TouchableOpacity>
					{recipe.vegan && (
						<View style={styles.tagContainer}>
							<Text style={styles.tagText}>Vegan</Text>
						</View>
					)}
				</View>

				<ThemedText style={styles.description}>{recipe.description}</ThemedText>

				<View style={styles.section}>
					<TouchableOpacity
						style={styles.sectionHeader}
						onPress={handleNutritionToggle}
						activeOpacity={0.7}
					>
						<ThemedText style={styles.sectionTitle}>
							Nutritional information
						</ThemedText>
						<IconSymbol
							name={
								preferences.showNutritionalInfo ? "chevron.up" : "chevron.down"
							}
							size={20}
							color={subtextColor}
						/>
					</TouchableOpacity>
					<Animated.View
						style={[styles.nutritionContent, nutritionAnimatedStyle]}
					>
						<View>
							<ThemedText style={styles.sectionDescription}>
								Per serving
							</ThemedText>
							<View style={styles.nutritionItems}>
								<View style={styles.nutritionItem}>
									<ThemedText style={styles.nutritionValue}>
										{recipe.nutritionalInfo.calories}
									</ThemedText>
									<ThemedText style={styles.nutritionLabel}>
										Calories
									</ThemedText>
								</View>
								<View style={styles.nutritionItem}>
									<ThemedText style={styles.nutritionValue}>
										{recipe.nutritionalInfo.fiber}g
									</ThemedText>
									<ThemedText style={styles.nutritionLabel}>Fiber</ThemedText>
								</View>
								{recipe.nutritionalInfo.protein && (
									<View style={styles.nutritionItem}>
										<ThemedText style={styles.nutritionValue}>
											{recipe.nutritionalInfo.protein}g
										</ThemedText>
										<ThemedText style={styles.nutritionLabel}>
											Protein
										</ThemedText>
									</View>
								)}
								{recipe.nutritionalInfo.carbs && (
									<View style={styles.nutritionItem}>
										<ThemedText style={styles.nutritionValue}>
											{recipe.nutritionalInfo.carbs}g
										</ThemedText>
										<ThemedText style={styles.nutritionLabel}>Carbs</ThemedText>
									</View>
								)}
								{recipe.nutritionalInfo.fat && (
									<View style={styles.nutritionItem}>
										<ThemedText style={styles.nutritionValue}>
											{recipe.nutritionalInfo.fat}g
										</ThemedText>
										<ThemedText style={styles.nutritionLabel}>Fat</ThemedText>
									</View>
								)}
							</View>
						</View>
					</Animated.View>
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<ThemedText style={styles.sectionTitle}>Ingredients</ThemedText>
						<View
							style={[
								styles.servingSizeContainer,
								{ backgroundColor: isDark ? "#2A2A2A" : "#f5f5f5" },
							]}
						>
							<ThemedText style={styles.servingSizeLabel}>Servings:</ThemedText>
							<TouchableOpacity
								style={[
									styles.servingSizeButton,
									{ backgroundColor: isDark ? "#333" : "#f0f0f0" },
								]}
								onPress={decreaseServings}
								disabled={servingSize <= 1}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<IconSymbol
									name="minus"
									size={18}
									color={servingSize <= 1 ? "#ccc" : "#4CAF50"}
								/>
							</TouchableOpacity>
							<ThemedText style={styles.servingSizeValue}>
								{servingSize}
							</ThemedText>
							<TouchableOpacity
								style={[
									styles.servingSizeButton,
									{ backgroundColor: isDark ? "#333" : "#f0f0f0" },
								]}
								onPress={increaseServings}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<IconSymbol name="plus" size={18} color="#4CAF50" />
							</TouchableOpacity>
						</View>
					</View>
					<ThemedText style={styles.unitTypeInfo}>
						{preferences.unitType === "metric"
							? "Using metric units"
							: "Using imperial units"}
					</ThemedText>
					{processedIngredients.map((ingredient, index) => (
						<View
							key={`ingredient-${ingredient.name}-${index}`}
							style={styles.ingredientItem}
						>
							<View
								style={[styles.bulletPoint, { backgroundColor: "#4CAF50" }]}
							/>
							<ThemedText style={styles.ingredientText}>
								{ingredient.displayQuantity} {ingredient.displayUnit}{" "}
								{ingredient.name}
							</ThemedText>
						</View>
					))}

					<TouchableOpacity
						style={[
							styles.shareIngredientsButton,
							{ backgroundColor: "#4CAF50" },
						]}
						onPress={shareIngredients}
						activeOpacity={0.7}
					>
						<IconSymbol name="arrow.down.circle.fill" size={18} color="white" />
						<Text style={styles.shareIngredientsText}>Export Ingredients</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.section}>
					<ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
					{recipe.instructions.map((instruction, index) => (
						<View
							key={`instruction-${instruction
								.substring(0, 10)
								.replace(/\s/g, "")}-${index}`}
							style={styles.instructionItem}
						>
							<View style={styles.instructionNumber}>
								<Text style={styles.instructionNumberText}>{index + 1}</Text>
							</View>
							<ThemedText style={styles.instructionText}>
								{instruction}
							</ThemedText>
						</View>
					))}
				</View>
			</ThemedView>
		</RecipeParallaxView>
	);
}

const styles = StyleSheet.create({
	headerControls: {
		flex: 1,
		position: "relative",
	},
	backButton: {
		position: "absolute",
		top: 40,
		left: 20,
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	favoriteButton: {
		position: "absolute",
		top: 40,
		right: 20,
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	shareButton: {
		position: "absolute",
		top: 40,
		right: 70,
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	timeContainer: {
		position: "absolute",
		bottom: 16,
		right: 16,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 6,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	timeText: {
		marginLeft: 4,
		fontSize: 14,
		fontWeight: "600",
	},
	contentContainer: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 32,
	},
	titleContainer: {
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	reviewsButton: {
		marginBottom: 8,
		paddingVertical: 4,
	},
	ratingContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	stars: {
		flexDirection: "row",
		marginRight: 8,
	},
	reviews: {
		fontSize: 14,
	},
	tagContainer: {
		backgroundColor: "#4CAF50",
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 4,
		alignSelf: "flex-start",
	},
	tagText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
		marginBottom: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	sectionDescription: {
		fontSize: 14,
		marginBottom: 1,
		fontStyle: "italic",
	},
	servingSizeContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	servingSizeLabel: {
		fontSize: 14,
		marginRight: 8,
	},
	servingSizeButton: {
		width: 28,
		height: 28,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 14,
	},
	servingSizeValue: {
		fontSize: 16,
		fontWeight: "bold",
		marginHorizontal: 8,
		minWidth: 20,
		textAlign: "center",
	},
	unitTypeInfo: {
		fontSize: 12,
		marginBottom: 12,
		fontStyle: "italic",
	},
	nutritionItems: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	nutritionItem: {
		width: "33%",
		marginBottom: 16,
		height: 40, // Fixed height for each item
	},
	nutritionValue: {
		fontSize: 18,
		fontWeight: "bold",
	},
	nutritionLabel: {
		fontSize: 14,
	},
	ingredientItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	bulletPoint: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 12,
	},
	ingredientText: {
		fontSize: 16,
	},
	instructionItem: {
		flexDirection: "row",
		marginBottom: 16,
	},
	instructionNumber: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#4CAF50",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
		marginTop: 2,
	},
	instructionNumberText: {
		color: "white",
		fontSize: 14,
		fontWeight: "bold",
	},
	instructionText: {
		fontSize: 16,
		lineHeight: 24,
		flex: 1,
	},
	shareIngredientsButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignSelf: "center",
	},
	shareIngredientsText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	nutritionContent: {
		overflow: "hidden",
	},
});
