import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RecipeList } from "@/components/recipe/RecipeList";
import { sampleRecipes } from "@/models/sampleData";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ThemedView style={styles.container}>
				<StatusBar style={isDark ? "light" : "dark"} />
				<RecipeList recipes={sampleRecipes} />
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
});
