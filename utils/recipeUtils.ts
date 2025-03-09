/**
 * Utility functions for recipes
 */

/**
 * Returns the correct image source for a recipe based on its ID
 * @param id The recipe ID
 * @returns The image source that can be used with Image component
 */
export const getRecipeImage = (id: string) => {
	// Sorry it's awful, local image imports can't be dynamic
	switch (id) {
		case "0":
			return require("@/assets/images/recipes/0.webp");
		case "1":
			return require("@/assets/images/recipes/1.webp");
		case "2":
			return require("@/assets/images/recipes/2.webp");
		case "3":
			return require("@/assets/images/recipes/3.webp");
		case "4":
			return require("@/assets/images/recipes/4.webp");
		case "5":
			return require("@/assets/images/recipes/5.webp");
		case "6":
			return require("@/assets/images/recipes/6.webp");
		case "7":
			return require("@/assets/images/recipes/7.webp");
		case "8":
			return require("@/assets/images/recipes/8.webp");
		case "9":
			return require("@/assets/images/recipes/9.webp");
		case "10":
			return require("@/assets/images/recipes/10.webp");
		case "11":
			return require("@/assets/images/recipes/11.webp");
		case "12":
			return require("@/assets/images/recipes/12.webp");
		case "13":
			return require("@/assets/images/recipes/13.webp");
		case "14":
			return require("@/assets/images/recipes/14.webp");
		case "15":
			return require("@/assets/images/recipes/15.webp");
		case "16":
			return require("@/assets/images/recipes/16.webp");
		case "17":
			return require("@/assets/images/recipes/17.webp");
		case "18":
			return require("@/assets/images/recipes/18.webp");
		case "19":
			return require("@/assets/images/recipes/19.webp");
		case "20":
			return require("@/assets/images/recipes/20.webp");
		case "21":
			return require("@/assets/images/recipes/21.webp");
		case "22":
			return require("@/assets/images/recipes/22.webp");
		case "23":
			return require("@/assets/images/recipes/23.webp");
		case "24":
			return require("@/assets/images/recipes/24.webp");
		case "25":
			return require("@/assets/images/recipes/25.webp");
		case "26":
			return require("@/assets/images/recipes/26.webp");
		case "27":
			return require("@/assets/images/recipes/27.webp");
		case "28":
			return require("@/assets/images/recipes/28.webp");
		case "29":
			return require("@/assets/images/recipes/29.webp");
		case "30":
			return require("@/assets/images/recipes/30.webp");
		case "31":
			return require("@/assets/images/recipes/31.webp");
		case "32":
			return require("@/assets/images/recipes/32.webp");
		case "33":
			return require("@/assets/images/recipes/33.webp");
		case "34":
			return require("@/assets/images/recipes/34.webp");
		case "35":
			return require("@/assets/images/recipes/35.webp");
		case "36":
			return require("@/assets/images/recipes/36.webp");
		case "37":
			return require("@/assets/images/recipes/37.webp");
		case "38":
			return require("@/assets/images/recipes/38.webp");
		case "39":
			return require("@/assets/images/recipes/39.webp");
		case "40":
			return require("@/assets/images/recipes/40.webp");
		case "41":
			return require("@/assets/images/recipes/41.webp");
		case "42":
			return require("@/assets/images/recipes/42.webp");
		case "43":
			return require("@/assets/images/recipes/43.webp");
		case "44":
			return require("@/assets/images/recipes/44.webp");
		case "45":
			return require("@/assets/images/recipes/45.webp");
		case "46":
			return require("@/assets/images/recipes/46.webp");
		case "47":
			return require("@/assets/images/recipes/47.webp");
		default:
			return require("@/assets/images/recipes/0.webp"); // Default image
	}
};
