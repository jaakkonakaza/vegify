import React from "react";
import {
	StyleSheet,
	TouchableOpacity,
	Text,
	View,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface FilterChipProps {
	label: string;
	selected: boolean;
	onPress: () => void;
	showIcon?: boolean;
	customStyle?: StyleProp<ViewStyle>;
}

export function FilterChip({
	label,
	selected,
	onPress,
	showIcon = true,
	customStyle,
}: FilterChipProps) {
	// Get the current color scheme
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	// Define theme-specific colors
	const chipBgColor = isDark ? "#2A2A2A" : "#f0f0f0";
	const selectedChipBgColor = isDark ? Colors.dark.tint : Colors.light.tint;
	const textColor = isDark ? "#9BA1A6" : "#333";
	const selectedTextColor = "#fff";

	return (
		<TouchableOpacity
			style={[
				styles.chip,
				{ backgroundColor: chipBgColor },
				selected ? { backgroundColor: selectedChipBgColor } : {},
				customStyle,
			]}
			onPress={onPress}
			activeOpacity={0.7}
		>
			<Text
				style={[
					styles.label,
					{ color: textColor },
					selected ? { color: selectedTextColor } : {},
				]}
			>
				{label}
			</Text>
			{showIcon && selected && (
				<View style={styles.iconContainer}>
					<IconSymbol name="checkmark" size={14} color="#fff" />
				</View>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	chip: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginRight: 8,
		marginBottom: 8,
	},
	label: {
		fontSize: 14,
	},
	iconContainer: {
		marginLeft: 4,
	},
});
