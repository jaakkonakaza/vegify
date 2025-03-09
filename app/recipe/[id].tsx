import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { RecipeDetail } from "@/components/recipe/RecipeDetail";
import { sampleRecipes } from "@/models/sampleData";
import type { Recipe } from "@/models/Recipe";

export default function RecipeDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [recipe, setRecipe] = useState<Recipe | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// In a real app, you would fetch the recipe from an API
		// For now, we'll use our sample data
		const foundRecipe = sampleRecipes.find((r) => r.id === id);

		// Simulate network delay
		// const delay = 500;
		const delay = 0;
		const timer = setTimeout(() => {
			setRecipe(foundRecipe || null);
			setLoading(false);
		}, delay);

		return () => clearTimeout(timer);
	}, [id]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#4CAF50" />
			</View>
		);
	}

	if (!recipe) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>Recipe not found</Text>
			</View>
		);
	}

	return <RecipeDetail recipe={recipe} />;
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 18,
		color: "#666",
	},
});
