import React, { useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { sampleRecipes } from "@/models/sampleData";
import type { Review } from "@/models/Recipe";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { containsProfanity, getProfanityList } from "@/utils/profanityFilter";

export default function ReviewsScreen() {
	const router = useRouter();
	const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
	const { addReview, getRecipeReviews, preferences } = useUserPreferences();
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	const textColor = Colors[colorScheme].text;
	const subtextColor = isDark ? "#9BA1A6" : "#666";
	const borderColor = isDark ? "#333" : "#eee";
	const inputBackgroundColor = isDark ? "#2A2A2A" : "#fff";
	const inputBorderColor = isDark ? "#444" : "#ddd";
	const placeholderColor = isDark ? "#777" : "#999";
	const reviewItemBgColor = isDark ? "#1E1E1E" : "#f9f9f9";

	// Set initial tab based on whether user is logged in
	const [activeTab, setActiveTab] = useState<"read" | "write">(
		preferences.userName ? "write" : "read",
	);
	const [newRating, setNewRating] = useState(5);
	const [newComment, setNewComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [profanityError, setProfanityError] = useState<string | null>(null);

	// Create component-specific styles
	const guestStyles = StyleSheet.create({
		guestModeContainer: {
			backgroundColor: reviewItemBgColor,
			borderRadius: 12,
			padding: 24,
			marginVertical: 16,
			alignItems: "center" as const,
		},
		guestModeText: {
			fontSize: 16,
			textAlign: "center" as const,
			marginBottom: 16,
			color: textColor,
		},
		createAccountButton: {
			backgroundColor: "#4CAF50",
			paddingVertical: 12,
			paddingHorizontal: 24,
			borderRadius: 8,
			alignItems: "center" as const,
			width: "100%",
			marginTop: 8,
		},
		createAccountButtonText: {
			color: "#fff",
			fontWeight: "600" as const,
			fontSize: 16,
		},
	});

	// Find the recipe from sample data
	const recipe = sampleRecipes.find((r) => r.id === recipeId);
	if (!recipe) {
		return (
			<ThemedView style={styles.container}>
				<View style={styles.errorContainer}>
					<ThemedText style={styles.errorText}>Recipe not found</ThemedText>
				</View>
			</ThemedView>
		);
	}

	const reviews = getRecipeReviews(recipeId);

	const handleSubmitReview = () => {
		if (newComment.trim() === "") return;
		if (!preferences.userName) {
			// Redirect to sign in if user is in guest mode
			router.push("/auth/sign-in");
			return;
		}

		// Check for profanity in the review
		const hasProfanity = containsProfanity(newComment);

		// Clear any previous profanity error
		setProfanityError(null);
		setIsSubmitting(true);

		// Simulate network delay
		setTimeout(() => {
			// Add the review with appropriate status based on profanity check
			addReview(
				recipeId,
				newRating,
				newComment,
				hasProfanity ? "pending_review" : "approved",
			);

			setNewRating(5);
			setNewComment("");
			setIsSubmitting(false);

			// Show alert if the review contains profanity
			if (hasProfanity) {
				Alert.alert(
					"Review Submitted for Moderation",
					"Your review contains content that needs to be reviewed by our moderators. It will be visible once approved.",
					[{ text: "OK", onPress: () => router.back() }],
				);
			} else {
				// Navigate back to recipe detail
				router.back();
			}
		}, 500);
	};

	const handleReportReview = (reviewId: string) => {
		Alert.alert(
			"Report Review",
			"Are you sure you want to report this review as inappropriate?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Report",
					style: "destructive",
					onPress: () => {
						// For now, just show a confirmation alert
						Alert.alert(
							"Review Reported",
							"Thank you for your report. Our moderators will review this content.",
							[{ text: "OK" }],
						);
					},
				},
			],
		);
	};

	// Format date to a more user-friendly format
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);

			// Check if date is valid
			if (Number.isNaN(date.getTime())) {
				return dateString;
			}

			// Get today and yesterday for relative date formatting
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			// Format as "Today" or "Yesterday" if applicable
			if (date.toDateString() === today.toDateString()) {
				return "Today";
			}

			if (date.toDateString() === yesterday.toDateString()) {
				return "Yesterday";
			}

			// Format as "Month Day, Year" for older dates
			const options: Intl.DateTimeFormatOptions = {
				year: "numeric",
				month: "short",
				day: "numeric",
			};
			return date.toLocaleDateString(undefined, options);
		} catch (error) {
			// Fallback to original string if there's an error
			return dateString;
		}
	};

	const renderStars = (rating: number) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(
					<IconSymbol key={i} name="star.fill" size={16} color="#FFD700" />,
				);
			} else if (i === fullStars && hasHalfStar) {
				stars.push(
					<IconSymbol
						key={i}
						name="star.leadinghalf.fill"
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

		return <View style={styles.starsContainer}>{stars}</View>;
	};

	const renderRatingSelector = () => {
		return (
			<View style={styles.ratingSelector}>
				{[1, 2, 3, 4, 5].map((rating) => (
					<TouchableOpacity
						key={rating}
						onPress={() => setNewRating(rating)}
						style={styles.ratingStar}
					>
						<IconSymbol
							name={rating <= newRating ? "star.fill" : "star"}
							size={32}
							color={rating <= newRating ? "#FFD700" : "#ccc"}
						/>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	const renderReviewItem = ({ item }: { item: Review }) => (
		<View
			style={[
				styles.reviewItem,
				{
					backgroundColor: reviewItemBgColor,
					// Add a different border for pending reviews
					borderWidth: item.status === "pending_review" ? 1 : 0,
					borderColor:
						item.status === "pending_review" ? "#FFD700" : "transparent",
				},
			]}
		>
			<View style={styles.reviewHeader}>
				<ThemedText style={styles.reviewerName}>{item.userName}</ThemedText>
				<Text style={[styles.reviewDate, { color: subtextColor }]}>
					{formatDate(item.date)}
				</Text>
			</View>
			<View style={styles.reviewRating}>{renderStars(item.rating)}</View>
			<ThemedText style={styles.reviewComment}>{item.comment}</ThemedText>

			{/* Pending review badge */}
			{item.status === "pending_review" && (
				<View style={styles.pendingBadge}>
					<Text style={styles.pendingText}>Pending Review</Text>
				</View>
			)}

			{/* Report button */}
			{item.status !== "pending_review" && item.userName !== "You" && (
				<TouchableOpacity
					style={styles.reportButton}
					onPress={() => handleReportReview(item.id)}
				>
					<IconSymbol
						name="flag.fill"
						size={14}
						color={isDark ? "#9BA1A6" : "#666"}
					/>
					<Text style={[styles.reportText, { color: subtextColor }]}>
						Report
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);

	const renderReadTab = () => (
		<View style={styles.tabContent}>
			<ThemedText style={styles.reviewsTitle}>
				Reviews for {recipe.name}
			</ThemedText>
			{reviews.length > 0 ? (
				<FlatList
					data={reviews}
					renderItem={renderReviewItem}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.reviewsList}
				/>
			) : (
				<View style={styles.emptyReviews}>
					<IconSymbol
						name="xmark.circle.fill"
						size={48}
						color={isDark ? "#555" : "#ccc"}
					/>
					<ThemedText style={styles.emptyReviewsText}>
						No reviews yet
					</ThemedText>
					<ThemedText style={styles.emptyReviewsSubtext}>
						Be the first to review this recipe!
					</ThemedText>
				</View>
			)}
		</View>
	);

	const renderWriteTab = () => (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.tabContent}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardDismissMode="on-drag"
				contentContainerStyle={styles.scrollContent}
			>
				<ThemedText style={styles.writeReviewTitle}>Write a Review</ThemedText>
				<ThemedText style={styles.writeReviewSubtitle}>
					Share your experience with {recipe.name}
				</ThemedText>

				{!preferences.userName ? (
					<View style={guestStyles.guestModeContainer}>
						<ThemedText style={guestStyles.guestModeText}>
							You need to create an account to submit reviews.
						</ThemedText>
						<TouchableOpacity
							style={guestStyles.createAccountButton}
							onPress={() =>
								router.dismissTo({
									pathname: "/auth/create-profile",
									params: {
										isGuest: "false",
										fromGuestMode: "true",
									},
								})
							}
						>
							<ThemedText style={guestStyles.createAccountButtonText}>
								Create Account
							</ThemedText>
						</TouchableOpacity>
					</View>
				) : (
					<>
						<View style={styles.formGroup}>
							<ThemedText style={styles.label}>Rating</ThemedText>
							{renderRatingSelector()}
						</View>

						<View style={styles.formGroup}>
							<ThemedText style={styles.label}>Your Review</ThemedText>
							<TextInput
								style={[
									styles.input,
									styles.textArea,
									{
										backgroundColor: inputBackgroundColor,
										borderColor: profanityError ? "#FF6B6B" : inputBorderColor,
										color: textColor,
									},
								]}
								value={newComment}
								onChangeText={(text) => {
									setNewComment(text);
									// Clear profanity error when user starts typing again
									if (profanityError) setProfanityError(null);
								}}
								placeholder="What did you think about this recipe?"
								placeholderTextColor={placeholderColor}
								multiline
								numberOfLines={4}
								textAlignVertical="top"
							/>
							{profanityError && (
								<Text style={styles.profanityErrorText}>{profanityError}</Text>
							)}
						</View>

						<TouchableOpacity
							style={[
								styles.submitButton,
								(newComment.trim() === "" || isSubmitting) &&
									styles.disabledButton,
							]}
							onPress={handleSubmitReview}
							disabled={newComment.trim() === "" || isSubmitting}
						>
							<Text style={styles.submitButtonText}>
								{isSubmitting ? "Submitting..." : "Submit Review"}
							</Text>
						</TouchableOpacity>
					</>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);

	return (
		<SafeAreaView style={styles.safeArea} edges={["bottom"]}>
			<ThemedView style={styles.container}>
				<View style={[styles.tabBar, { borderBottomColor: borderColor }]}>
					<TouchableOpacity
						style={[styles.tab, activeTab === "read" && styles.activeTab]}
						onPress={() => setActiveTab("read")}
					>
						<Text
							style={[
								styles.tabText,
								{
									color: isDark
										? activeTab === "read"
											? "#81C784"
											: "#9BA1A6"
										: activeTab === "read"
											? "#4CAF50"
											: "#666",
								},
							]}
						>
							Read Reviews
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.tab, activeTab === "write" && styles.activeTab]}
						onPress={() => setActiveTab("write")}
					>
						<Text
							style={[
								styles.tabText,
								{
									color: isDark
										? activeTab === "write"
											? "#81C784"
											: "#9BA1A6"
										: activeTab === "write"
											? "#4CAF50"
											: "#666",
								},
							]}
						>
							Write a Review
						</Text>
					</TouchableOpacity>
				</View>

				{activeTab === "read" ? renderReadTab() : renderWriteTab()}
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
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 18,
	},
	tabBar: {
		flexDirection: "row",
		borderBottomWidth: 1,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: "#4CAF50",
	},
	tabText: {
		fontSize: 16,
	},
	tabContent: {
		flex: 1,
		padding: 16,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	reviewsTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
	},
	reviewsList: {
		paddingBottom: 32,
	},
	reviewItem: {
		marginBottom: 16,
		padding: 12,
		borderRadius: 8,
	},
	reviewHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	reviewerName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	reviewDate: {
		fontSize: 14,
	},
	reviewRating: {
		marginBottom: 8,
	},
	starsContainer: {
		flexDirection: "row",
	},
	reviewComment: {
		fontSize: 14,
		lineHeight: 20,
	},
	emptyReviews: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	emptyReviewsText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 8,
	},
	emptyReviewsSubtext: {
		fontSize: 16,
		textAlign: "center",
	},
	writeReviewTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
	},
	writeReviewSubtitle: {
		fontSize: 16,
		marginBottom: 24,
	},
	formGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
	},
	textArea: {
		height: 120,
		textAlignVertical: "top",
	},
	ratingSelector: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 32,
	},
	ratingStar: {
		padding: 8,
	},
	submitButton: {
		backgroundColor: "#4CAF50",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
		marginTop: 16,
		marginBottom: 32,
	},
	disabledButton: {
		backgroundColor: "#ccc",
	},
	submitButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
	profanityErrorText: {
		color: "#FF6B6B",
		marginTop: 8,
		fontSize: 14,
	},
	pendingBadge: {
		backgroundColor: "#FFD70066", // Semi-transparent gold
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		alignSelf: "flex-start",
		marginTop: 8,
	},
	pendingText: {
		color: "#B8860B", // Dark goldenrod
		fontSize: 12,
		fontWeight: "600",
	},
	reportButton: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
		alignSelf: "flex-end",
	},
	reportText: {
		fontSize: 12,
		marginLeft: 4,
	},
});
