import { Stack } from "expo-router";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Share, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import type { Recipe } from "@/models/Recipe";
import { sampleRecipes } from "@/models/sampleData";

export default function RecipeLayout() {
	const { toggleFavorite, isFavorite } = useUserPreferences();
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";
	const { id } = useLocalSearchParams<{ id: string }>();
	const favorite = isFavorite(id);
	const [recipe, setRecipe] = useState<Recipe | null>(null);

	useEffect(() => {
		if (id) {
			const recipeData = sampleRecipes.find((r) => r.id === id);
			setRecipe(recipeData || null);
		}
	}, [id]);

	const shareRecipe = async () => {
		try {
			const result = await Share.share({
				message: `Check out this recipe: ${recipe?.name || "Recipe"}`,
				title: "Share Recipe",
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

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? "#151718" : "#fff",
				},
				headerTintColor: isDark ? "#81C784" : "#4CAF50",
				headerTitleStyle: {
					fontWeight: "bold",
					color: Colors[colorScheme].text,
				},
			}}
		>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: true,
					title: recipe?.name || "Recipe",
					headerRight: () => (
						<View style={{ flexDirection: "row", gap: 16 }}>
							<TouchableOpacity
								onPress={shareRecipe}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<IconSymbol
									name="square.and.arrow.up"
									size={24}
									color={isDark ? "#81C784" : "#4CAF50"}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => toggleFavorite(id)}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<IconSymbol
									name={favorite ? "heart.fill" : "heart"}
									size={24}
									color={favorite ? "#FF6B6B" : isDark ? "#81C784" : "#4CAF50"}
								/>
							</TouchableOpacity>
						</View>
					),
				}}
			/>
			<Stack.Screen
				name="reviews"
				options={{
					headerShown: true,
					title: "Reviews",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
}
