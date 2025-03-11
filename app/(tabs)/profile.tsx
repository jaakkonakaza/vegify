import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	ScrollView,
	Switch,
	TextInput,
	Image,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { FilterChip } from "@/components/recipe/FilterChip";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useFilters } from "@/contexts/FilterContext";
import { sampleRecipes } from "@/models/sampleData";
import { getFilterOptions } from "@/models/recipeUtils";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
	const {
		preferences,
		setUnitType,
		addAllergy,
		removeAllergy,
		addExcludedIngredient,
		removeExcludedIngredient,
		setIsVegan,
		resetPreferences,
	} = useUserPreferences();
	const { syncUserPreferences, clearFilters } = useFilters();
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";
	const router = useRouter();

	const textColor = Colors[colorScheme].text;
	// const borderColor = isDark ? "#333" : "#eee";
	const inputBackgroundColor = isDark ? "#2A2A2A" : "#fff";
	const inputBorderColor = isDark ? "#444" : "#ddd";
	const placeholderColor = isDark ? "#777" : "#999";

	const [newAllergy, setNewAllergy] = useState("");
	const [newExcludedIngredient, setNewExcludedIngredient] = useState("");
	const [commonAllergens, setCommonAllergens] = useState<string[]>([]);

	// Get common allergens and ingredients from all recipes
	useEffect(() => {
		const filterOptions = getFilterOptions(sampleRecipes);
		setCommonAllergens(filterOptions.allergens);
	}, []);

	const handleAddAllergy = () => {
		if (newAllergy.trim()) {
			addAllergy(newAllergy.trim().toLowerCase());
			setNewAllergy("");
			// Sync allergies with filters
			syncUserPreferences();
		}
	};

	const handleRemoveAllergy = (allergy: string) => {
		removeAllergy(allergy);
		// Sync allergies with filters
		syncUserPreferences();
	};

	const handleToggleAllergy = (allergy: string) => {
		if (preferences.allergies.includes(allergy)) {
			removeAllergy(allergy);
		} else {
			addAllergy(allergy);
		}
		// Sync allergies with filters
		syncUserPreferences();
	};

	const handleAddExcludedIngredient = () => {
		if (newExcludedIngredient.trim()) {
			addExcludedIngredient(newExcludedIngredient.trim().toLowerCase());
			setNewExcludedIngredient("");
			// Sync excluded ingredients with filters
			syncUserPreferences();
		}
	};

	const handleRemoveExcludedIngredient = (ingredient: string) => {
		removeExcludedIngredient(ingredient);
		// Sync excluded ingredients with filters
		syncUserPreferences();
	};

	const handleToggleExcludedIngredient = (ingredient: string) => {
		if (preferences.excludedIngredients.includes(ingredient)) {
			removeExcludedIngredient(ingredient);
		} else {
			addExcludedIngredient(ingredient);
		}
		// Sync excluded ingredients with filters
		syncUserPreferences();
	};

	const handleResetDemo = () => {
		Alert.alert(
			"Reset Demo",
			"This will reset all your preferences and favorites. Are you sure?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Reset",
					onPress: () => {
						resetPreferences();
						clearFilters();
					},
				},
			],
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ThemedView
				style={styles.container}
				lightColor="#fff"
				darkColor="#151718"
			>
				<ScrollView style={styles.settingsContainer}>
					{/* Guest mode section - only show for guest users */}
					{!preferences.userName && (
						<View style={styles.section}>
							<ThemedText style={styles.sectionTitle}>Guest Mode</ThemedText>
							<ThemedText style={styles.settingDescription}>
								You're currently using Vegify as a guest. Create an account to
								submit reviews and save your preferences.
							</ThemedText>
							<TouchableOpacity
								style={styles.createAccountButton}
								onPress={() =>
									router.push({
										pathname: "/auth/create-profile",
										params: {
											isGuest: "false",
											fromGuestMode: "true",
										},
									})
								}
							>
								<ThemedText style={styles.createAccountButtonText}>
									Create Account
								</ThemedText>
							</TouchableOpacity>
						</View>
					)}

					{/* User account section - only show for logged in users */}
					{preferences.userName && (
						<View style={styles.section}>
							<ThemedText style={styles.sectionTitle}>Your Account</ThemedText>
							<ThemedText style={styles.settingLabel}>
								Welcome, {preferences.userName}!
							</ThemedText>
							<ThemedText style={styles.settingDescription}>
								You can submit reviews and save your favorite recipes.
							</ThemedText>
						</View>
					)}
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>
							Unit Preferences
						</ThemedText>
						<View style={styles.settingRow}>
							<ThemedText style={styles.settingLabel}>
								Use Metric System
							</ThemedText>
							<Switch
								value={preferences.unitType === "metric"}
								onValueChange={(value) =>
									setUnitType(value ? "metric" : "imperial")
								}
								trackColor={{ false: "#767577", true: "#4CAF50" }}
								thumbColor="#f4f3f4"
							/>
						</View>
						<ThemedText style={styles.settingDescription}>
							{preferences.unitType === "metric"
								? "Using grams, milliliters, etc."
								: "Using ounces, cups, etc."}
						</ThemedText>
					</View>

					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>
							Dietary Preferences
						</ThemedText>
						<View style={styles.settingRow}>
							<ThemedText style={styles.settingLabel}>Vegan</ThemedText>
							<Switch
								value={preferences.isVegan}
								onValueChange={(value) => setIsVegan(value)}
								trackColor={{ false: "#767577", true: "#4CAF50" }}
								thumbColor="#f4f3f4"
							/>
						</View>
						<ThemedText style={styles.settingDescription}>
							{preferences.isVegan
								? "Only vegan recipes will be shown"
								: "All recipes will be shown"}
						</ThemedText>
					</View>

					<View style={styles.section}>
						{/* Common allergens section */}
						{commonAllergens.length > 0 && (
							<>
								<ThemedText style={styles.sectionTitle}>Allergens</ThemedText>
								<ThemedText style={styles.settingDescription}>
									Tap to add or remove from your allergies.
								</ThemedText>
								<View style={styles.chipContainer}>
									{commonAllergens.map((allergen) => (
										<FilterChip
											key={allergen}
											label={
												allergen.charAt(0).toUpperCase() + allergen.slice(1)
											}
											selected={preferences.allergies.includes(allergen)}
											onPress={() => handleToggleAllergy(allergen)}
										/>
									))}
								</View>
							</>
						)}
					</View>

					<View style={styles.section}>
						{/* Excluded ingredients section */}
						<ThemedText style={styles.sectionTitle}>
							Excluded Ingredients
						</ThemedText>
						<ThemedText style={styles.settingDescription}>
							Ingredients you want to avoid in recipes.
						</ThemedText>

						{/* Input for adding new excluded ingredients */}
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
								value={newExcludedIngredient}
								onChangeText={setNewExcludedIngredient}
								placeholder="Add ingredient to avoid"
								placeholderTextColor={placeholderColor}
								returnKeyType="done"
								onSubmitEditing={handleAddExcludedIngredient}
							/>
							<TouchableOpacity
								style={styles.addButton}
								onPress={handleAddExcludedIngredient}
							>
								<IconSymbol name="plus" size={20} color="#fff" />
							</TouchableOpacity>
						</View>

						{/* Display current excluded ingredients */}
						{preferences.excludedIngredients.length > 0 && (
							<View style={styles.chipContainer}>
								{preferences.excludedIngredients.map((ingredient) => (
									<FilterChip
										key={ingredient}
										label={
											ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
										}
										selected={true}
										onPress={() => handleRemoveExcludedIngredient(ingredient)}
									/>
								))}
							</View>
						)}
					</View>

					{/* Reset Demo section */}
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>Demo Controls</ThemedText>
						<ThemedText style={styles.settingDescription}>
							Reset the demo to start over with a fresh profile.
						</ThemedText>
						<TouchableOpacity
							style={styles.resetButton}
							onPress={handleResetDemo}
						>
							<IconSymbol
								name="arrow.counterclockwise"
								size={18}
								color="#fff"
							/>
							<ThemedText style={styles.resetButtonText}>Reset Demo</ThemedText>
						</TouchableOpacity>
					</View>

					<Image
						source={require("@/assets/images/plantpower.png")}
						style={{
							height: 30,
							width: 100,
							alignSelf: "center",
							marginTop: 120,
						}}
					/>
				</ScrollView>
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
	header: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
	},
	settingsContainer: {
		flex: 1,
		padding: 16,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	settingSubtitle: {
		fontSize: 16,
		marginTop: 16,
		marginBottom: 8,
	},
	settingRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	settingLabel: {
		fontSize: 16,
	},
	settingDescription: {
		fontSize: 14,
		opacity: 0.7,
		marginBottom: 12,
	},
	inputContainer: {
		flexDirection: "row",
		marginBottom: 16,
	},
	input: {
		flex: 1,
		height: 40,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
	},
	addButton: {
		width: 40,
		height: 40,
		backgroundColor: "#4CAF50",
		borderRadius: 8,
		marginLeft: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 8,
	},
	resetButton: {
		backgroundColor: "#FF6B6B",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	resetButtonText: {
		color: "#fff",
		fontWeight: "bold",
		marginLeft: 8,
	},
	createAccountButton: {
		backgroundColor: "#4CAF50",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	createAccountButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
