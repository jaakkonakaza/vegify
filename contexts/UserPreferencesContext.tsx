import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
	useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserPreferences } from "@/models/UserPreferences";
import { defaultUserPreferences } from "@/models/UserPreferences";
import type { Review } from "@/models/Recipe";
import { sampleRecipes } from "@/models/sampleData";
import { generateRandomReviews } from "@/utils/reviewUtils";

interface UserPreferencesContextType {
	preferences: UserPreferences;
	setUnitType: (unitType: "metric" | "imperial") => void;
	addAllergy: (allergy: string) => void;
	removeAllergy: (allergy: string) => void;
	addExcludedIngredient: (ingredient: string) => void;
	removeExcludedIngredient: (ingredient: string) => void;
	toggleFavorite: (recipeId: string) => void;
	isFavorite: (recipeId: string) => boolean;
	addReview: (
		recipeId: string,
		rating: number,
		comment: string,
		status?: "approved" | "pending_review",
	) => void;
	getRecipeReviews: (recipeId: string) => Review[];
	getAverageRating: (recipeId: string) => number;
	setIsVegan: (isVegan: boolean) => void;
	setUserName: (userName: string) => void;
	resetPreferences: () => void;
	toggleNutritionalInfo: () => void;
}

const UserPreferencesContext = createContext<
	UserPreferencesContextType | undefined
>(undefined);

const STORAGE_KEY = "user_preferences";
const REVIEWS_STORAGE_KEY = "user_reviews";

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
	const [preferences, setPreferences] = useState<UserPreferences>(
		defaultUserPreferences,
	);
	const [reviews, setReviews] = useState<Record<string, Review[]>>({});
	const [isLoaded, setIsLoaded] = useState(false);
	const isInitialLoadRef = useRef(true);

	// Load preferences and reviews from storage on mount
	useEffect(() => {
		const loadData = async () => {
			try {
				const storedPreferences = await AsyncStorage.getItem(STORAGE_KEY);
				const storedReviews = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);

				if (storedPreferences) {
					setPreferences((prevPreferences) => ({
						...prevPreferences,
						...JSON.parse(storedPreferences),
					}));
				}

				if (storedReviews) {
					setReviews(JSON.parse(storedReviews));
				} else {
					// Initialize with sample data reviews
					const initialReviews: Record<string, Review[]> = {};
					for (const recipe of sampleRecipes) {
						initialReviews[recipe.id] = recipe.reviews;
					}
					setReviews(initialReviews);
				}
			} catch (error) {
				console.error("Failed to load data:", error);
			} finally {
				setIsLoaded(true);
				isInitialLoadRef.current = false;
			}
		};

		loadData();
	}, []);

	// Save preferences to storage whenever they change
	useEffect(() => {
		// Skip if we're still in the initial loading phase
		if (isInitialLoadRef.current) return;

		const savePreferences = async () => {
			try {
				await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
			} catch (error) {
				console.error("Failed to save preferences:", error);
			}
		};

		savePreferences();
	}, [preferences]);

	// Save reviews to storage whenever they change
	useEffect(() => {
		const saveReviews = async () => {
			if (!isLoaded) return; // Don't save until initial load is complete

			try {
				await AsyncStorage.setItem(
					REVIEWS_STORAGE_KEY,
					JSON.stringify(reviews),
				);
			} catch (error) {
				console.error("Failed to save reviews:", error);
			}
		};

		saveReviews();
	}, [reviews, isLoaded]);

	const setUnitType = (unitType: "metric" | "imperial") => {
		setPreferences((prev) => ({ ...prev, unitType }));
	};

	const setIsVegan = (isVegan: boolean) => {
		setPreferences((prev) => ({ ...prev, isVegan }));
	};

	const addAllergy = (allergy: string) => {
		setPreferences((prev) => {
			if (prev.allergies.includes(allergy)) return prev;
			return { ...prev, allergies: [...prev.allergies, allergy] };
		});
	};

	const removeAllergy = (allergy: string) => {
		setPreferences((prev) => ({
			...prev,
			allergies: prev.allergies.filter((a) => a !== allergy),
		}));
	};

	const addExcludedIngredient = (ingredient: string) => {
		setPreferences((prev) => {
			if (prev.excludedIngredients.includes(ingredient)) return prev;
			return {
				...prev,
				excludedIngredients: [...prev.excludedIngredients, ingredient],
			};
		});
	};

	const removeExcludedIngredient = (ingredient: string) => {
		setPreferences((prev) => ({
			...prev,
			excludedIngredients: prev.excludedIngredients.filter(
				(i) => i !== ingredient,
			),
		}));
	};

	const toggleFavorite = (recipeId: string) => {
		setPreferences((prev) => {
			const isFavorited = prev.favoriteRecipes.includes(recipeId);
			return {
				...prev,
				favoriteRecipes: isFavorited
					? prev.favoriteRecipes.filter((id) => id !== recipeId)
					: [...prev.favoriteRecipes, recipeId],
			};
		});
	};

	const isFavorite = (recipeId: string) => {
		return preferences.favoriteRecipes.includes(recipeId);
	};

	const addReview = (recipeId: string, rating: number, comment: string) => {
		const newReview: Review = {
			id: `review-${Date.now()}`,
			userId: "current-user",
			userName: "You", // This would normally come from user profile
			rating,
			comment,
			date: new Date().toISOString().split("T")[0],
		};

		setReviews((prev) => {
			const recipeReviews = prev[recipeId] || [];
			return {
				...prev,
				[recipeId]: [newReview, ...recipeReviews],
			};
		});
	};

	const getRecipeReviews = (recipeId: string) => {
		const existingReviews = reviews[recipeId] || [];

		// If there are no reviews, generate random ones
		if (existingReviews.length === 0) {
			// Get the recipe's rating from the sample data or use a default
			const recipe = sampleRecipes.find((r) => r.id === recipeId);
			const averageRating = recipe?.rating || 4.2; // Default to 4.2 if recipe not found

			// Generate between 3 and 8 random reviews
			const randomReviewCount = Math.floor(Math.random() * 6) + 3;
			return generateRandomReviews(recipeId, randomReviewCount, averageRating);
		}

		return existingReviews;
	};

	const getAverageRating = (recipeId: string) => {
		const recipeReviews = reviews[recipeId] || [];
		if (recipeReviews.length === 0) return 0;

		const sum = recipeReviews.reduce((acc, review) => acc + review.rating, 0);
		return sum / recipeReviews.length;
	};

	const setUserName = (userName: string) => {
		setPreferences((prev) => ({ ...prev, userName }));
	};

	const resetPreferences = () => {
		setPreferences(defaultUserPreferences);

		// Also reset reviews
		setReviews({});
	};

	const toggleNutritionalInfo = () => {
		setPreferences((prev) => ({
			...prev,
			showNutritionalInfo: !prev.showNutritionalInfo,
		}));
	};

	return (
		<UserPreferencesContext.Provider
			value={{
				preferences,
				setUnitType,
				addAllergy,
				removeAllergy,
				addExcludedIngredient,
				removeExcludedIngredient,
				toggleFavorite,
				isFavorite,
				addReview,
				getRecipeReviews,
				getAverageRating,
				setIsVegan,
				setUserName,
				resetPreferences,
				toggleNutritionalInfo,
			}}
		>
			{children}
		</UserPreferencesContext.Provider>
	);
}

export function useUserPreferences() {
	const context = useContext(UserPreferencesContext);
	if (context === undefined) {
		throw new Error(
			"useUserPreferences must be used within a UserPreferencesProvider",
		);
	}
	return context;
}
