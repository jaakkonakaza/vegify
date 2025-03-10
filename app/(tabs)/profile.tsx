import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	ScrollView,
	Switch,
	TextInput,
	Image,
	TouchableOpacity,
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

export default function ProfileScreen() {
	const { preferences, setUnitType, addAllergy, removeAllergy, setIsVegan } =
		useUserPreferences();
	const { syncAllergies } = useFilters();
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	const textColor = Colors[colorScheme].text;
	// const borderColor = isDark ? "#333" : "#eee";
	const inputBackgroundColor = isDark ? "#2A2A2A" : "#fff";
	const inputBorderColor = isDark ? "#444" : "#ddd";
	const placeholderColor = isDark ? "#777" : "#999";

	const [newAllergy, setNewAllergy] = useState("");
	const [commonAllergens, setCommonAllergens] = useState<string[]>([]);

	// Get common allergens from all recipes
	useEffect(() => {
		const filterOptions = getFilterOptions(sampleRecipes);
		setCommonAllergens(filterOptions.allergens);
	}, []);

	const handleAddAllergy = () => {
		if (newAllergy.trim()) {
			addAllergy(newAllergy.trim());
			setNewAllergy("");
			// Sync allergies with filters
			syncAllergies();
		}
	};

	const handleRemoveAllergy = (allergy: string) => {
		removeAllergy(allergy);
		// Sync allergies with filters
		syncAllergies();
	};

	const handleToggleAllergy = (allergy: string) => {
		if (preferences.allergies.includes(allergy)) {
			removeAllergy(allergy);
		} else {
			addAllergy(allergy);
		}
		// Sync allergies with filters
		syncAllergies();
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ThemedView
				style={styles.container}
				lightColor="#fff"
				darkColor="#151718"
			>
				<ScrollView style={styles.settingsContainer}>
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
						<ThemedText style={styles.sectionTitle}>Allergies</ThemedText>
						<ThemedText style={styles.settingDescription}>
							Add ingredients you're allergic to. Recipes containing these will
							be filtered out automatically.
						</ThemedText>

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
								value={newAllergy}
								onChangeText={setNewAllergy}
								placeholder="Add allergy (e.g., peanuts)"
								placeholderTextColor={placeholderColor}
								returnKeyType="done"
								onSubmitEditing={handleAddAllergy}
							/>
							<TouchableOpacity
								style={styles.addButton}
								onPress={handleAddAllergy}
							>
								<IconSymbol name="plus" size={24} color="#fff" />
							</TouchableOpacity>
						</View>

						<View style={styles.chipContainer}>
							{preferences.allergies.map((allergy) => (
								<FilterChip
									key={allergy}
									label={allergy}
									selected={true}
									onPress={() => handleRemoveAllergy(allergy)}
									showIcon={true}
								/>
							))}
							{preferences.allergies.length === 0 && (
								<ThemedText style={styles.emptyText}>
									No allergies added yet
								</ThemedText>
							)}
						</View>

						{/* Common allergens section */}
						{commonAllergens.length > 0 && (
							<>
								<ThemedText style={styles.subsectionTitle}>
									Common Allergens
								</ThemedText>
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
						<ThemedText style={styles.sectionTitle}>About</ThemedText>
						<ThemedText style={styles.settingDescription}>
							Vegify v1.0.0
						</ThemedText>
						<ThemedText style={styles.settingDescription}>
							The ultimate plant-based recipe app
						</ThemedText>
					</View>

					<Image
						source={require("@/assets/images/plantpower.png")}
						style={{
							height: 30,
							width: 100,
							alignSelf: "center",
							marginTop: 400,
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
	subsectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
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
		marginBottom: 12,
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
		backgroundColor: "#4CAF50",
		width: 40,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
		marginLeft: 8,
	},
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 14,
		fontStyle: "italic",
	},
});
