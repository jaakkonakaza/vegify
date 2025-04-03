import React, { useState, useRef } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Image,
	ScrollView,
	Dimensions,
	Animated as RNAnimated,
} from "react-native";
import Animated, {
	useAnimatedRef,
	withTiming,
	withSpring,
	useSharedValue,
	useAnimatedScrollHandler,
	scrollTo,
	withSequence,
	Easing,
	useDerivedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import { sampleRecipes } from "@/models/sampleData";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getRecipeImage } from "@/utils/recipeUtils";
import type { Recipe } from "@/models/Recipe";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const CARD_SPACING = 10;
const ITEM_SIZE = CARD_WIDTH + CARD_SPACING * 2;
const MIN_SCROLL_ITEMS = 5; // Minimum number of items to scroll through

export default function DiscoverScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";
	const router = useRouter();
	const [isAnimating, setIsAnimating] = useState(false);
	const [showRoulette, setShowRoulette] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
	const flatListRef = useAnimatedRef<Animated.FlatList<Recipe>>();
	const [animationComplete, setAnimationComplete] = useState(false);
	const buttonFadeAnim = useRef(new RNAnimated.Value(0)).current;
	const lastIndex = useRef(0);

	// Use a shared value for the scroll index
	const scrollIndex = useSharedValue(0);

	// Create an array of recipes that will appear to be infinite
	const rouletteRecipes = [
		...sampleRecipes,
		...sampleRecipes,
		...sampleRecipes,
	];

	// Featured recipe of the week (hardcoded for demo)
	const featuredRecipe = sampleRecipes[2]; // Using one of the sample recipes

	// Recently made recipe (hardcoded for demo)
	const recentlyMadeRecipe = sampleRecipes[0];

	// Animation setup - scroll to the position based on index
	useDerivedValue(() => {
		"worklet";
		scrollTo(flatListRef, scrollIndex.value * ITEM_SIZE, 0, false);
	});

	const handleRandomRecipe = () => {
		if (isAnimating) return;

		setIsAnimating(true);
		setShowRoulette(true);
		setAnimationComplete(false);

		// Reset button opacity
		buttonFadeAnim.setValue(0);

		// Get a random recipe
		let randomIndex = Math.floor(Math.random() * sampleRecipes.length);

		// Ensure minimum scroll distance
		const currentIndex = lastIndex.current;
		const distance = Math.abs(randomIndex - currentIndex);

		// If the distance is too small, pick a new index
		if (
			distance < MIN_SCROLL_ITEMS &&
			sampleRecipes.length > MIN_SCROLL_ITEMS
		) {
			// Add MIN_SCROLL_ITEMS to the current index and wrap around if needed
			randomIndex = (currentIndex + MIN_SCROLL_ITEMS) % sampleRecipes.length;
		}

		// Save the current index for next time
		lastIndex.current = randomIndex;

		const randomRecipe = sampleRecipes[randomIndex];
		setSelectedRecipe(randomRecipe);

		// Calculate the target position (center of the screen)
		const targetIndex = randomIndex + sampleRecipes.length; // Use middle set of recipes

		// First scroll back to start to ensure a longer animation
		scrollIndex.value = 0;

		// Then animate to the target index after a short delay
		setTimeout(() => {
			scrollIndex.value = withTiming(targetIndex, {
				duration: 2000,
				easing: Easing.out(Easing.cubic),
			});
		}, 50);

		// Wait for animation to finish, then show buttons
		setTimeout(() => {
			setAnimationComplete(true);
			setIsAnimating(false);

			// Fade in buttons
			RNAnimated.timing(buttonFadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}, 2050);
	};

	const handleViewRecipe = () => {
		if (selectedRecipe) {
			setShowRoulette(false);
			router.push(`/recipe/${selectedRecipe.id}`);
		}
	};

	const handleTryAgain = () => {
		handleRandomRecipe();
	};

	const handleClose = () => {
		setShowRoulette(false);
	};

	const renderRouletteItem = ({
		item,
		index,
	}: { item: Recipe; index: number }) => {
		return (
			<View style={[styles.rouletteCard, { marginHorizontal: CARD_SPACING }]}>
				<Image source={getRecipeImage(item.id)} style={styles.rouletteImage} />
				<View style={styles.rouletteOverlay}>
					<Text style={styles.rouletteTitle} numberOfLines={2}>
						{item.name}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ThemedView style={styles.container}>
				<StatusBar style={isDark ? "light" : "dark"} />
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.contentContainer}
				>
					<Text
						style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
					>
						Discover New Flavors
					</Text>

					{/* Featured Recipe of the Week */}
					<View style={styles.featuredContainer}>
						<Text
							style={[
								styles.featuredTitle,
								{ color: isDark ? "#fff" : "#000" },
							]}
						>
							Recipe of the Week
						</Text>
						<TouchableOpacity
							style={styles.featuredCard}
							onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
						>
							<Image
								source={getRecipeImage(featuredRecipe.id)}
								style={styles.featuredImage}
							/>
							<View style={styles.featuredOverlay}>
								<Text style={styles.featuredRecipeTitle}>
									{featuredRecipe.name}
								</Text>
								<View style={styles.featuredMeta}>
									<View style={styles.metaItem}>
										<IconSymbol name="clock" size={16} color="#fff" />
										<Text style={styles.metaText}>
											{featuredRecipe.prepTime} min
										</Text>
									</View>
									<View style={styles.metaItem}>
										<IconSymbol name="star.fill" size={16} color="#fff" />
										<Text style={styles.metaText}>{featuredRecipe.rating}</Text>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					</View>

					{/* Recently Made Recipe */}
					<View style={styles.recentContainer}>
						<Text
							style={[
								styles.sectionSubtitle,
								{ color: isDark ? "#fff" : "#000" },
							]}
						>
							Review a Recent Recipe
						</Text>
						<TouchableOpacity
							style={styles.recentCard}
							onPress={() => router.push(`/recipe/${recentlyMadeRecipe.id}`)}
						>
							<Image
								source={getRecipeImage(recentlyMadeRecipe.id)}
								style={styles.recentImage}
							/>
							<View style={styles.recentContent}>
								<Text
									style={[
										styles.recentTitle,
										{ color: isDark ? "#fff" : "#000" },
									]}
								>
									{recentlyMadeRecipe.name}
								</Text>
								<Text
									style={[
										styles.recentSubtitle,
										{ color: isDark ? "#ccc" : "#666" },
									]}
								>
									You made this 3 days ago
								</Text>
							</View>
						</TouchableOpacity>
					</View>

					{/* Random Recipe Button */}
					<View style={styles.randomContainer}>
						<Text
							style={[
								styles.sectionSubtitle,
								{ color: isDark ? "#fff" : "#000" },
							]}
						>
							Feeling Adventurous?
						</Text>
						<TouchableOpacity
							style={[
								styles.randomButton,
								{ backgroundColor: isDark ? "#81C784" : "#4CAF50" },
								isAnimating && styles.randomButtonAnimating,
							]}
							onPress={handleRandomRecipe}
							disabled={isAnimating}
						>
							<IconSymbol name="shuffle" size={20} color="#fff" />
							<Text style={styles.randomButtonText}>
								{isAnimating ? "Spinning..." : "Find a Random Recipe"}
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				{/* Roulette Overlay */}
				<View
					style={[
						styles.modalContainer,
						{
							opacity: showRoulette ? 1 : 0,
							pointerEvents: showRoulette ? "auto" : "none",
						},
					]}
				>
					<View style={styles.rouletteContainer}>
						<Animated.FlatList
							ref={flatListRef}
							data={rouletteRecipes}
							renderItem={renderRouletteItem}
							keyExtractor={(item, index) => `${item.id}-${index}`}
							horizontal
							showsHorizontalScrollIndicator={false}
							scrollEnabled={false}
							contentContainerStyle={[
								styles.rouletteContent,
								{
									paddingHorizontal:
										(SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_SPACING,
								},
							]}
							snapToInterval={ITEM_SIZE}
							decelerationRate="fast"
							initialScrollIndex={0}
						/>

						{/* Action Buttons */}
						{animationComplete && (
							<RNAnimated.View
								style={[
									styles.actionButtonsContainer,
									{ opacity: buttonFadeAnim },
								]}
							>
								<TouchableOpacity
									style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
									onPress={handleViewRecipe}
								>
									<IconSymbol name="arrow.right" size={16} color="#fff" />
									<Text style={styles.actionButtonText}>View Recipe</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.actionButton, { backgroundColor: "#FF9800" }]}
									onPress={handleTryAgain}
								>
									<IconSymbol name="shuffle" size={16} color="#fff" />
									<Text style={styles.actionButtonText}>Try Again</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.actionButton, { backgroundColor: "#9E9E9E" }]}
									onPress={handleClose}
								>
									<IconSymbol name="xmark" size={16} color="#fff" />
									<Text style={styles.actionButtonText}>Close</Text>
								</TouchableOpacity>
							</RNAnimated.View>
						)}
					</View>
				</View>
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
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	sectionSubtitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 12,
	},
	featuredContainer: {
		marginBottom: 24,
	},
	featuredTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 12,
	},
	featuredCard: {
		borderRadius: 12,
		overflow: "hidden",
		height: 200,
	},
	featuredImage: {
		width: "100%",
		height: "100%",
	},
	featuredOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0,0,0,0.6)",
		padding: 16,
	},
	featuredRecipeTitle: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	featuredMeta: {
		flexDirection: "row",
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 16,
	},
	metaText: {
		color: "#fff",
		marginLeft: 4,
	},
	recentContainer: {
		marginBottom: 24,
	},
	recentCard: {
		flexDirection: "row",
		backgroundColor: "rgba(0,0,0,0.05)",
		borderRadius: 12,
		overflow: "hidden",
		height: 100,
	},
	recentImage: {
		width: 100,
		height: 100,
	},
	recentContent: {
		flex: 1,
		padding: 12,
		justifyContent: "center",
	},
	recentTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 4,
	},
	recentSubtitle: {
		fontSize: 14,
	},
	randomContainer: {
		marginBottom: 24,
	},
	randomButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
	},
	randomButtonAnimating: {
		opacity: 0.8,
	},
	randomButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		marginLeft: 8,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	rouletteContainer: {
		height: 300,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	rouletteContent: {
		alignItems: "center",
	},
	rouletteCard: {
		width: CARD_WIDTH,
		height: 200,
		borderRadius: 12,
		overflow: "hidden",
		backgroundColor: "#fff",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	rouletteImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	rouletteOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0,0,0,0.6)",
		padding: 12,
	},
	rouletteTitle: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	actionButtonsContainer: {
		position: "absolute",
		bottom: -20,
		left: 20,
		right: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderRadius: 12,
		overflow: "hidden",
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 12,
		flex: 1,
		margin: 5,
		borderRadius: 8,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	actionButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
		marginLeft: 8,
	},
});
