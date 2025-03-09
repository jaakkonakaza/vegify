import React from "react";
import {
	StyleSheet,
	View,
	TextInput,
	TouchableOpacity,
	Text,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	onFilterPress: () => void;
	placeholder?: string;
	filterActive?: boolean;
	activeFiltersCount?: number;
	showFavoritesOnly?: boolean;
	onFavoritesToggle?: () => void;
}

export function SearchBar({
	value,
	onChangeText,
	onFilterPress,
	placeholder = "Search recipes...",
	filterActive = false,
	activeFiltersCount = 0,
	showFavoritesOnly = false,
	onFavoritesToggle,
}: SearchBarProps) {
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	const inputBackgroundColor = isDark ? "#2A2A2A" : "#f0f0f0";
	const inputTextColor = Colors[colorScheme].text;
	const placeholderColor = isDark ? "#777" : "#999";
	const iconColor = isDark ? "#9BA1A6" : "#666";

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.searchContainer,
					{ backgroundColor: inputBackgroundColor },
				]}
			>
				<IconSymbol
					name="magnifyingglass"
					size={20}
					color={iconColor}
					style={styles.searchIcon}
				/>
				<TextInput
					style={[styles.input, { color: inputTextColor }]}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={placeholderColor}
					returnKeyType="search"
				/>
				{value.length > 0 && (
					<TouchableOpacity
						onPress={() => onChangeText("")}
						style={styles.clearButton}
					>
						<IconSymbol
							name="xmark.circle.fill"
							size={18}
							color={placeholderColor}
						/>
					</TouchableOpacity>
				)}
			</View>

			{onFavoritesToggle && (
				<TouchableOpacity
					style={[
						styles.favoritesButton,
						{ backgroundColor: inputBackgroundColor },
						showFavoritesOnly && styles.favoritesButtonActive,
					]}
					onPress={onFavoritesToggle}
				>
					<IconSymbol
						name={showFavoritesOnly ? "heart.fill" : "heart"}
						size={20}
						color={showFavoritesOnly ? "#FF6B6B" : iconColor}
					/>
				</TouchableOpacity>
			)}

			<TouchableOpacity
				style={[
					styles.filterButton,
					{ backgroundColor: inputBackgroundColor },
					filterActive && styles.filterButtonActive,
				]}
				onPress={onFilterPress}
			>
				<IconSymbol
					name="slider.horizontal.3"
					size={20}
					color={filterActive ? "#fff" : iconColor}
				/>
				{filterActive && activeFiltersCount > 0 && (
					<View style={styles.filterBadge}>
						<Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
					</View>
				)}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 8,
		alignItems: "center",
	},
	searchContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 8,
		paddingHorizontal: 12,
		height: 44,
	},
	searchIcon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		fontSize: 16,
		height: "100%",
	},
	clearButton: {
		padding: 4,
	},
	favoritesButton: {
		marginLeft: 12,
		width: 44,
		height: 44,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	favoritesButtonActive: {
		backgroundColor: "#FFF0F0",
	},
	filterButton: {
		marginLeft: 12,
		width: 44,
		height: 44,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	filterButtonActive: {
		backgroundColor: "#4CAF50",
	},
	filterBadge: {
		position: "absolute",
		top: -5,
		right: -5,
		backgroundColor: "#FF5722",
		borderRadius: 10,
		width: 20,
		height: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	filterBadgeText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "bold",
	},
});
