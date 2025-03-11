import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	TouchableOpacity,
	Image,
	TextInput,
	ScrollView,
	Switch,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { FilterChip } from "@/components/recipe/FilterChip";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getFilterOptions } from "@/models/recipeUtils";
import { sampleRecipes } from "@/models/sampleData";

export default function CreateProfileScreen() {
	const params = useLocalSearchParams();
	const isGuest = params.isGuest === "true";
	const fromGuestMode = params.fromGuestMode === "true";

	const {
		preferences,
		setUnitType,
		addAllergy,
		removeAllergy,
		setIsVegan,
		setUserName,
	} = useUserPreferences();
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	const textColor = Colors[colorScheme].text;
	const inputBackgroundColor = isDark ? "#2A2A2A" : "#fff";
	const inputBorderColor = isDark ? "#444" : "#ddd";
	const placeholderColor = isDark ? "#777" : "#999";
	const errorColor = "#FF6B6B";

	const [userName, setUserNameState] = useState("");
	const [nameError, setNameError] = useState("");
	const [selectedDiet, setSelectedDiet] = useState<string>(
		preferences.isVegan ? "vegan" : "none",
	);
	const [newAllergy, setNewAllergy] = useState("");
	const [commonAllergens, setCommonAllergens] = useState<string[]>([]);
	const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
		fromGuestMode ? [...preferences.allergies] : [],
	);

	// Get common allergens from all recipes
	useEffect(() => {
		const filterOptions = getFilterOptions(sampleRecipes);
		setCommonAllergens(filterOptions.allergens);
	}, []);

	const handleToggleAllergy = (allergy: string) => {
		if (selectedAllergens.includes(allergy)) {
			setSelectedAllergens(selectedAllergens.filter((a) => a !== allergy));
		} else {
			setSelectedAllergens([...selectedAllergens, allergy]);
		}
	};

	const handleAddAllergy = () => {
		if (newAllergy.trim() && !selectedAllergens.includes(newAllergy.trim())) {
			setSelectedAllergens([...selectedAllergens, newAllergy.trim()]);
			setNewAllergy("");
		}
	};

	const validateName = () => {
		if (!isGuest && (!userName || !userName.trim())) {
			setNameError("Please enter your name");
			return false;
		}
		setNameError("");
		return true;
	};

	const handleCreateProfile = () => {
		// Validate name for non-guest users
		if (!isGuest && !validateName()) {
			return;
		}

		// Set vegan preference based on diet selection
		setIsVegan(selectedDiet === "vegan");

		// If coming from guest mode, we need to handle allergies differently
		if (fromGuestMode) {
			// First, remove any allergies that were deselected
			for (const allergy of preferences.allergies) {
				if (!selectedAllergens.includes(allergy)) {
					removeAllergy(allergy);
				}
			}

			// Then add any new allergies
			for (const allergy of selectedAllergens) {
				if (!preferences.allergies.includes(allergy)) {
					addAllergy(allergy);
				}
			}
		} else {
			// Normal flow - add all selected allergies
			for (const allergy of selectedAllergens) {
				addAllergy(allergy);
			}
		}

		// Set user name if not in guest mode
		if (!isGuest && userName.trim()) {
			setUserName(userName.trim());
		} else if (isGuest) {
			// For guest users, set userName to undefined
			setUserName("");
		}

		// Navigate to the main app
		router.replace("/(tabs)");
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ThemedView
				style={styles.container}
				lightColor="#fff"
				darkColor="#151718"
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.keyboardAvoidingView}
				>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
						keyboardDismissMode="on-drag"
					>
						<View style={styles.logoContainer}>
							<Image
								source={require("@/assets/images/vegify-logo.png")}
								style={styles.logo}
								resizeMode="contain"
							/>
						</View>

						{!isGuest && (
							<View style={styles.section}>
								<ThemedText style={styles.sectionTitle}>Your Name</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											backgroundColor: inputBackgroundColor,
											borderColor: nameError ? errorColor : inputBorderColor,
											color: textColor,
										},
									]}
									value={userName}
									onChangeText={(text) => {
										setUserNameState(text);
										if (nameError && text.trim()) {
											setNameError("");
										}
									}}
									onBlur={validateName}
									placeholder="Enter your name"
									placeholderTextColor={placeholderColor}
									returnKeyType="done"
								/>
								{nameError ? (
									<ThemedText style={[styles.errorText, { color: errorColor }]}>
										{nameError}
									</ThemedText>
								) : null}
							</View>
						)}

						<View style={styles.section}>
							<ThemedText style={styles.sectionTitle}>Diet</ThemedText>
							<ThemedText style={styles.sectionDescription}>
								Your diet will be used to recommend better recipes for you.
							</ThemedText>

							<View style={styles.dietSelector}>
								<TouchableOpacity
									style={[
										styles.dietOption,
										selectedDiet === "none" && styles.selectedDietOption,
										{ borderColor: isDark ? "#444" : "#ddd" },
									]}
									onPress={() => setSelectedDiet("none")}
								>
									<ThemedText style={styles.dietOptionText}>None</ThemedText>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.dietOption,
										selectedDiet === "vegetarian" && styles.selectedDietOption,
										{ borderColor: isDark ? "#444" : "#ddd" },
									]}
									onPress={() => setSelectedDiet("vegetarian")}
								>
									<ThemedText style={styles.dietOptionText}>
										Vegetarian
									</ThemedText>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.dietOption,
										selectedDiet === "vegan" && styles.selectedDietOption,
										{ borderColor: isDark ? "#444" : "#ddd" },
									]}
									onPress={() => setSelectedDiet("vegan")}
								>
									<ThemedText style={styles.dietOptionText}>Vegan</ThemedText>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.section}>
							<ThemedText style={styles.sectionTitle}>Allergies</ThemedText>
							<ThemedText style={styles.sectionDescription}>
								Choose the ingredients that you are allergic to.
							</ThemedText>

							<View style={styles.chipContainer}>
								{commonAllergens.map((allergen) => (
									<FilterChip
										key={allergen}
										label={allergen.charAt(0).toUpperCase() + allergen.slice(1)}
										selected={selectedAllergens.includes(allergen)}
										onPress={() => handleToggleAllergy(allergen)}
									/>
								))}
							</View>

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
									placeholder="Add other allergy (disabled for demo)"
									placeholderTextColor={placeholderColor}
									returnKeyType="done"
									onSubmitEditing={handleAddAllergy}
									editable={false}
								/>
								<TouchableOpacity
									style={styles.addButton}
									onPress={handleAddAllergy}
								>
									<IconSymbol name="plus" size={24} color="#fff" />
								</TouchableOpacity>
							</View>
						</View>

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

						<TouchableOpacity
							style={[
								styles.createProfileButton,
								!isGuest &&
									(!userName.trim() || nameError) &&
									styles.disabledButton,
							]}
							onPress={handleCreateProfile}
							disabled={!isGuest && (!userName.trim() || !!nameError)}
						>
							<ThemedText style={styles.createProfileButtonText}>
								Create Profile
							</ThemedText>
						</TouchableOpacity>

						{/* Add extra padding at the bottom to ensure content is visible when keyboard is open */}
						<View style={styles.keyboardSpacer} />
					</ScrollView>
				</KeyboardAvoidingView>
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
	keyboardAvoidingView: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 40,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 24,
	},
	logo: {
		width: 60,
		height: 60,
	},
	appName: {
		fontSize: 28,
		fontWeight: "bold",
		marginTop: 8,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		marginBottom: 16,
		opacity: 0.7,
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 16,
		fontSize: 16,
		flex: 1,
	},
	dietSelector: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 8,
	},
	dietOption: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderRadius: 8,
		marginHorizontal: 4,
		alignItems: "center",
	},
	selectedDietOption: {
		backgroundColor: "#4CAF50",
		borderColor: "#4CAF50",
	},
	dietOptionText: {
		fontSize: 14,
		fontWeight: "500",
	},
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 16,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	addButton: {
		width: 48,
		height: 48,
		backgroundColor: "#4CAF50",
		borderRadius: 8,
		marginLeft: 8,
		justifyContent: "center",
		alignItems: "center",
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
	},
	createProfileButton: {
		backgroundColor: "#4CAF50",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 24,
		marginBottom: 16,
	},
	createProfileButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		marginTop: 8,
		fontSize: 14,
		fontWeight: "bold",
	},
	disabledButton: {
		backgroundColor: "#ccc",
	},
	keyboardSpacer: {
		height: Platform.OS === "ios" ? 120 : 80,
	},
});
