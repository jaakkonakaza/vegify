import type { Review } from "@/models/Recipe";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// Sample user names for random reviews
const userNames = [
	"FoodLover22",
	"VeggieChef",
	"HealthyEater",
	"CookingMaster",
	"KitchenExplorer",
	"TastyTreats",
	"NutritionNinja",
	"PlantPowered",
	"GourmetGuru",
	"FlavorFanatic",
	"CulinaryCreator",
	"MealMaster",
	"RecipeRockstar",
	"FreshFoodie",
	"SpiceSage",
	"OrganicOlivia",
	"GreenGourmet",
	"SustainableChef",
	"EcoEater",
	"WholeFoodWizard",
];

// Sample positive comments for random reviews
const positiveComments = [
	"Absolutely delicious! Will definitely make again.",
	"Perfect balance of flavors. My family loved it!",
	"So easy to make and incredibly tasty.",
	"This has become a regular in our meal rotation.",
	"Healthy and flavorful - what more could you ask for?",
	"The spice blend in this recipe is perfect.",
	"I've made this three times already. It's that good!",
	"Great recipe for meal prep. Keeps well in the fridge.",
	"Restaurant quality dish made at home!",
	"Love how nutritious and satisfying this is.",
	"The texture and flavor combination is amazing.",
	"My kids even ate this, which is a miracle!",
	"Perfect for a quick weeknight dinner.",
	"I added some extra herbs and it was fantastic.",
	"This recipe converted me to loving this vegetable!",
];

// Sample mixed comments for 3-4 star reviews
const mixedComments = [
	"Good recipe, but I added more spices to suit my taste.",
	"Tasty, though I had to adjust the cooking time a bit.",
	"Nice flavors, but a bit too complicated for everyday cooking.",
	"Solid recipe. I'll make some tweaks next time.",
	"Pretty good! Needed a bit more seasoning for my taste.",
	"The family enjoyed it, but it wasn't a standout favorite.",
	"Good base recipe that I'll customize more next time.",
	"Decent flavor, but took longer to prepare than stated.",
	"Enjoyable dish, though I'll simplify the steps next time.",
	"Not bad! I substituted a few ingredients and it worked well.",
];

// Sample negative comments for lower ratings
const negativeComments = [
	"Too bland for my taste. Needed a lot more seasoning.",
	"Instructions were confusing and the result was disappointing.",
	"Too time-consuming for the end result.",
	"The flavors didn't work well together for me.",
	"Had to make significant adjustments to make it palatable.",
];

/**
 * Generate a random date within the last 3 months
 */
function getRandomRecentDate(): string {
	const now = new Date();
	const threeMonthsAgo = new Date();
	threeMonthsAgo.setMonth(now.getMonth() - 3);

	const randomTimestamp =
		threeMonthsAgo.getTime() +
		Math.random() * (now.getTime() - threeMonthsAgo.getTime());
	return new Date(randomTimestamp).toISOString();
}

/**
 * Get a random comment based on the rating
 */
function getRandomComment(rating: number): string {
	if (rating >= 4.5) {
		return positiveComments[
			Math.floor(Math.random() * positiveComments.length)
		];
	}

	if (rating >= 3) {
		return mixedComments[Math.floor(Math.random() * mixedComments.length)];
	}

	return negativeComments[Math.floor(Math.random() * negativeComments.length)];
}

/**
 * Generate a random review
 */
function generateRandomReview(recipeId: string, baseRating?: number): Review {
	// Generate a rating, slightly randomized around the base rating if provided
	let rating: number;
	if (baseRating !== undefined) {
		// Add some randomness but keep it within 0.5 of the base rating and between 1-5
		const variation = (Math.random() - 0.5) * 1;
		rating = Math.max(
			1,
			Math.min(5, Math.round((baseRating + variation) * 2) / 2),
		);
	} else {
		// Generate a random rating between 3 and 5, favoring higher ratings
		rating = Math.round((3 + Math.random() * 2) * 2) / 2;
	}

	return {
		id: uuidv4(),
		userId: uuidv4(),
		userName: userNames[Math.floor(Math.random() * userNames.length)],
		rating,
		comment: getRandomComment(rating),
		date: getRandomRecentDate(),
	};
}

/**
 * Generate a set of random reviews for a recipe
 */
export function generateRandomReviews(
	recipeId: string,
	count: number,
	averageRating?: number,
): Review[] {
	const reviews: Review[] = [];

	for (let i = 0; i < count; i++) {
		reviews.push(generateRandomReview(recipeId, averageRating));
	}

	// Sort by date, newest first
	return reviews.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
}
