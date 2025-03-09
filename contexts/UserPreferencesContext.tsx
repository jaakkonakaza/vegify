import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserPreferences } from "@/models/UserPreferences";
import { defaultUserPreferences } from "@/models/UserPreferences";
import type { Review } from "@/models/Recipe";
import { sampleRecipes } from "@/models/sampleData";

interface UserPreferencesContextType {
	preferences: UserPreferences;
	setUnitType: (unitType: "metric" | "imperial") => void;
	addAllergy: (allergy: string) => void;
	removeAllergy: (allergy: string) => void;
	toggleFavorite: (recipeId: string) => void;
	isFavorite: (recipeId: string) => boolean;
	addReview: (recipeId: string, rating: number, comment: string) => void;
	getRecipeReviews: (recipeId: string) => Review[];
	getAverageRating: (recipeId: string) => number;
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

	// Load preferences and reviews from storage on mount
	useEffect(() => {
		const loadData = async () => {
			try {
				const storedPreferences = await AsyncStorage.getItem(STORAGE_KEY);
				const storedReviews = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);

				if (storedPreferences) {
					setPreferences(JSON.parse(storedPreferences));
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
			}
		};

		loadData();
	}, []);

	// Save preferences to storage whenever they change
	useEffect(() => {
		const savePreferences = async () => {
			if (!isLoaded) return; // Don't save until initial load is complete

			try {
				await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
			} catch (error) {
				console.error("Failed to save preferences:", error);
			}
		};

		savePreferences();
	}, [preferences, isLoaded]);

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
		return reviews[recipeId] || [];
	};

	const getAverageRating = (recipeId: string) => {
		const recipeReviews = reviews[recipeId] || [];
		if (recipeReviews.length === 0) return 0;

		const sum = recipeReviews.reduce((acc, review) => acc + review.rating, 0);
		return sum / recipeReviews.length;
	};

	return (
		<UserPreferencesContext.Provider
			value={{
				preferences,
				setUnitType,
				addAllergy,
				removeAllergy,
				toggleFavorite,
				isFavorite,
				addReview,
				getRecipeReviews,
				getAverageRating,
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
