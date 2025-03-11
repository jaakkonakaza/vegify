import React from "react";
import { useState } from "react";
import {
	StyleSheet,
	Image,
	TouchableOpacity,
	View,
	Text,
	type GestureResponderEvent,
	type StyleProp,
	type TextStyle,
} from "react-native";
import { useRouter } from "expo-router";
import type { Recipe } from "@/models/Recipe";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { getRecipeImage } from "@/utils/recipeUtils";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useFilters } from "@/contexts/FilterContext";

// Component to highlight search terms in text
interface HighlightedTextProps {
	text: string;
	searchTerm?: string;
	style?: StyleProp<TextStyle>;
	highlightStyle?: StyleProp<TextStyle>;
}

interface RecipeCardProps {
	recipe: Recipe;
	searchTerm?: string;
}

export function RecipeCard({ recipe, searchTerm }: RecipeCardProps) {
	const router = useRouter();
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";
	const textColor = Colors[colorScheme].text;
	const subtextColor = isDark ? "#9BA1A6" : "#666";
	const cardBackgroundColor = isDark ? "#1E1E1E" : "white";
	const cardBorderColor = isDark ? "#2A2A2A" : "#E0E0E0";
	const { isFavorite, toggleFavorite } = useUserPreferences();
	const { getFavoriteCount } = useFilters();

	const isFavorited = isFavorite(recipe.id);
	const likesCount = getFavoriteCount(recipe.id);

	const handlePress = () => {
		router.push({
			pathname: "/recipe/[id]",
			params: { id: recipe.id },
		});
	};

	const handleFavoritePress = (e: GestureResponderEvent) => {
		// Stop propagation to prevent navigating to recipe detail
		e.stopPropagation();
		toggleFavorite(recipe.id);
	};

	// Convert rating to stars
	const renderStars = () => {
		const stars = [];
		const fullStars = Math.floor(recipe.rating);
		const hasHalfStar = recipe.rating % 1 >= 0.5;

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(
					<IconSymbol key={i} name="star.fill" size={16} color="#FFD700" />,
				);
			} else if (i === fullStars && hasHalfStar) {
				stars.push(
					<IconSymbol
						key={i}
						name="star.lefthalf.fill"
						size={16}
						color="#FFD700"
					/>,
				);
			} else {
				stars.push(
					<IconSymbol key={i} name="star" size={16} color="#FFD700" />,
				);
			}
		}

		return stars;
	};

	return (
		<TouchableOpacity
			style={[
				styles.card,
				{ backgroundColor: cardBackgroundColor, borderColor: cardBorderColor },
			]}
			onPress={handlePress}
			activeOpacity={0.8}
		>
			<Image source={getRecipeImage(recipe.id)} style={styles.image} />

			{/* Favorite button overlay */}
			<TouchableOpacity
				style={styles.favoriteButton}
				onPress={handleFavoritePress}
				activeOpacity={0.8}
			>
				<View style={styles.likesContainer}>
					<IconSymbol
						name={isFavorited ? "heart.fill" : "heart"}
						size={24}
						color={"#FF6B6B"}
					/>
					<Text style={styles.likesText}>{likesCount}</Text>
				</View>
			</TouchableOpacity>

			<View style={styles.content}>
				<View style={styles.tagContainer}>
					<View style={styles.timeContainer}>
						<IconSymbol name="timer" size={14} color={subtextColor} />
						<Text style={[styles.timeText, { color: subtextColor }]}>
							{recipe.prepTime} min
						</Text>
					</View>
					{recipe.vegan && (
						<View style={styles.tag}>
							<Text style={styles.tagText}>Vegan</Text>
						</View>
					)}
				</View>
				<ThemedText style={styles.title} numberOfLines={2}>
					{recipe.name}
				</ThemedText>
				<View style={styles.ratingContainer}>
					<View style={styles.stars}>{renderStars()}</View>
					<Text style={[styles.reviews, { color: subtextColor }]}>
						{recipe.reviewCount} reviews
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "white",
		borderRadius: 12,
		overflow: "hidden",
		marginBottom: 16,
		borderWidth: 0.5,
		borderColor: "#E0E0E0",
		position: "relative",
	},
	image: {
		width: "100%",
		height: 180,
		resizeMode: "cover",
	},
	favoriteButton: {
		position: "absolute",
		top: 12,
		right: 12,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
	},
	likesContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	likesText: {
		color: "white",
		fontSize: 12,
		fontWeight: "bold",
		marginLeft: 2,
		position: "absolute",
		bottom: -10,
		right: -5,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		borderRadius: 8,
		paddingHorizontal: 4,
		paddingVertical: 1,
	},
	content: {
		padding: 12,
	},
	tagContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	tag: {
		backgroundColor: "#4CAF50",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	tagText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	timeContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	timeText: {
		marginLeft: 4,
		fontSize: 12,
		color: "#666",
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
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
		fontSize: 12,
		color: "#666",
	},
	highlightedText: {
		backgroundColor: "rgba(255, 215, 0, 0.3)",
		fontWeight: "bold",
	},
});
