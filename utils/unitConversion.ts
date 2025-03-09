// Unit conversion utilities

// Define conversion entry type
type ConversionEntry = { to: string; factor: number };

// Volume conversions
const volumeConversions: Record<string, ConversionEntry> = {
	// Metric to Imperial
	ml: { to: "fl oz", factor: 0.033814 },
	l: { to: "qt", factor: 1.05669 },
	// Imperial to Metric
	"fl oz": { to: "ml", factor: 29.5735 },
	cup: { to: "ml", factor: 236.588 },
	pt: { to: "ml", factor: 473.176 },
	qt: { to: "l", factor: 0.946353 },
	gal: { to: "l", factor: 3.78541 },
	// Special cases
	tbsp: { to: "ml", factor: 14.7868 },
	tsp: { to: "ml", factor: 4.92892 },
};

// Weight conversions
const weightConversions: Record<string, ConversionEntry> = {
	// Metric to Imperial
	g: { to: "oz", factor: 0.035274 },
	kg: { to: "lb", factor: 2.20462 },
	// Imperial to Metric
	oz: { to: "g", factor: 28.3495 },
	lb: { to: "g", factor: 453.592 },
};

// Length conversions
const lengthConversions: Record<string, ConversionEntry> = {
	// Metric to Imperial
	cm: { to: "in", factor: 0.393701 },
	m: { to: "ft", factor: 3.28084 },
	// Imperial to Metric
	in: { to: "cm", factor: 2.54 },
	ft: { to: "m", factor: 0.3048 },
};

// Temperature conversions
const celsiusToFahrenheit = (celsius: number): number => {
	return (celsius * 9) / 5 + 32;
};

const fahrenheitToCelsius = (fahrenheit: number): number => {
	return ((fahrenheit - 32) * 5) / 9;
};

// Common ingredient-specific conversions
const ingredientSpecificConversions: Record<
	string,
	{ metric: string; imperial: string }
> = {
	flour: { metric: "g", imperial: "cups" },
	sugar: { metric: "g", imperial: "cups" },
	rice: { metric: "g", imperial: "cups" },
	milk: { metric: "ml", imperial: "cups" },
	water: { metric: "ml", imperial: "cups" },
	oil: { metric: "ml", imperial: "tbsp" },
};

// Conversion approximations for common ingredients (metric to imperial)
const ingredientConversionRatios: Record<string, number> = {
	flour: 125, // 1 cup = ~125g
	sugar: 200, // 1 cup = ~200g
	"brown sugar": 220, // 1 cup = ~220g
	rice: 185, // 1 cup = ~185g
	oats: 90, // 1 cup = ~90g
	milk: 240, // 1 cup = ~240ml
	water: 240, // 1 cup = ~240ml
	oil: 15, // 1 tbsp = ~15ml
};

/**
 * Convert a quantity from one unit to another
 */
export function convertUnit(
	quantity: string | number,
	fromUnit: string,
	toUnit?: string,
	ingredient?: string,
): { quantity: string; unit: string } {
	// Parse the quantity to a number
	const numericQuantity =
		typeof quantity === "string"
			? Number.parseFloat(quantity.replace(/[^\d.]/g, ""))
			: quantity;

	// If the quantity is not a valid number, return the original
	if (Number.isNaN(numericQuantity)) {
		return { quantity: quantity.toString(), unit: fromUnit };
	}

	// Normalize units to lowercase
	const normalizedFromUnit = fromUnit.toLowerCase();

	// If no target unit is specified, determine based on the from unit
	let targetUnit = toUnit;
	if (!targetUnit) {
		// Check if we have a conversion for this unit
		if (normalizedFromUnit in volumeConversions) {
			targetUnit = volumeConversions[normalizedFromUnit].to;
		} else if (normalizedFromUnit in weightConversions) {
			targetUnit = weightConversions[normalizedFromUnit].to;
		} else if (normalizedFromUnit in lengthConversions) {
			targetUnit = lengthConversions[normalizedFromUnit].to;
		} else {
			// No conversion available
			return { quantity: quantity.toString(), unit: fromUnit };
		}
	}

	// At this point, targetUnit is guaranteed to be defined
	const normalizedToUnit = targetUnit.toLowerCase();

	// Perform the conversion
	let convertedQuantity: number;

	// Check for ingredient-specific conversions
	if (ingredient && ingredient.toLowerCase() in ingredientSpecificConversions) {
		const conversionInfo =
			ingredientSpecificConversions[ingredient.toLowerCase()];
		const ratio = ingredientConversionRatios[ingredient.toLowerCase()] || 1;

		if (
			normalizedFromUnit === conversionInfo.metric &&
			normalizedToUnit === conversionInfo.imperial
		) {
			convertedQuantity = numericQuantity / ratio;
		} else if (
			normalizedFromUnit === conversionInfo.imperial &&
			normalizedToUnit === conversionInfo.metric
		) {
			convertedQuantity = numericQuantity * ratio;
		} else {
			// Fall back to standard conversions
			convertedQuantity = performStandardConversion(
				numericQuantity,
				normalizedFromUnit,
				normalizedToUnit,
			);
		}
	} else {
		// Standard conversions
		convertedQuantity = performStandardConversion(
			numericQuantity,
			normalizedFromUnit,
			normalizedToUnit,
		);
	}

	// Format the result
	return {
		quantity: convertedQuantity.toFixed(2).replace(/\.00$/, ""),
		unit: targetUnit,
	};
}

/**
 * Perform standard unit conversion
 */
function performStandardConversion(
	quantity: number,
	fromUnit: string,
	toUnit: string,
): number {
	// Volume conversions
	if (
		fromUnit in volumeConversions &&
		volumeConversions[fromUnit].to === toUnit
	) {
		return quantity * volumeConversions[fromUnit].factor;
	}

	if (
		toUnit in volumeConversions &&
		volumeConversions[toUnit].to === fromUnit
	) {
		return quantity / volumeConversions[toUnit].factor;
	}

	// Weight conversions
	if (
		fromUnit in weightConversions &&
		weightConversions[fromUnit].to === toUnit
	) {
		return quantity * weightConversions[fromUnit].factor;
	}

	if (
		toUnit in weightConversions &&
		weightConversions[toUnit].to === fromUnit
	) {
		return quantity / weightConversions[toUnit].factor;
	}

	// Length conversions
	if (
		fromUnit in lengthConversions &&
		lengthConversions[fromUnit].to === toUnit
	) {
		return quantity * lengthConversions[fromUnit].factor;
	}

	if (
		toUnit in lengthConversions &&
		lengthConversions[toUnit].to === fromUnit
	) {
		return quantity / lengthConversions[toUnit].factor;
	}

	// Temperature conversions
	if (fromUnit === "c" && toUnit === "f") {
		return celsiusToFahrenheit(quantity);
	}

	if (fromUnit === "f" && toUnit === "c") {
		return fahrenheitToCelsius(quantity);
	}

	// If no conversion is found, return the original quantity
	return quantity;
}

/**
 * Scale ingredient quantities based on serving size
 */
export function scaleIngredient(
	quantity: string,
	originalServings: number,
	targetServings: number,
): string {
	// Parse the quantity
	const match = quantity.match(/^(\d+(?:\.\d+)?)\s*(\d+\/\d+)?$/);
	if (!match) return quantity; // Return original if can't parse

	let numericQuantity = 0;

	// Parse whole number part
	if (match[1]) {
		numericQuantity += Number.parseFloat(match[1]);
	}

	// Parse fraction part if exists
	if (match[2]) {
		const [numerator, denominator] = match[2].split("/").map(Number);
		numericQuantity += numerator / denominator;
	}

	// Calculate scaled quantity
	const scaleFactor = targetServings / originalServings;
	const scaledQuantity = numericQuantity * scaleFactor;

	// Format the result
	if (scaledQuantity < 1 && scaledQuantity > 0) {
		// Convert to fraction for small quantities
		return formatAsFraction(scaledQuantity);
	}

	// Round to 1 decimal place for larger quantities
	return scaledQuantity.toFixed(1).replace(/\.0$/, "");
}

/**
 * Format a decimal as a fraction
 */
function formatAsFraction(decimal: number): string {
	// Common fractions to use
	const fractions: [number, string][] = [
		[1 / 4, "1/4"],
		[1 / 3, "1/3"],
		[1 / 2, "1/2"],
		[2 / 3, "2/3"],
		[3 / 4, "3/4"],
	];

	// Find the closest fraction
	let closest = fractions[0];
	let minDiff = Math.abs(decimal - closest[0]);

	for (let i = 1; i < fractions.length; i++) {
		const diff = Math.abs(decimal - fractions[i][0]);
		if (diff < minDiff) {
			minDiff = diff;
			closest = fractions[i];
		}
	}

	// If the difference is small enough, use the fraction
	if (minDiff < 0.05) {
		return closest[1];
	}

	// Otherwise, return the decimal
	return decimal.toFixed(2).replace(/\.00$/, "");
}
