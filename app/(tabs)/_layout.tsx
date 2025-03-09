import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useFilters } from "@/contexts/FilterContext";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */

// Define green color scheme
const greenTheme = {
	light: {
		tint: "#4CAF50",
		tabIconDefault: "#687076",
		tabIconSelected: "#4CAF50",
	},
	dark: {
		tint: "#81C784",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: "#81C784",
	},
};

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { clearFilters } = useFilters();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: greenTheme[colorScheme ?? "light"].tint,
				headerShown: false,
				animation: "shift",
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: "absolute",
					},
					default: {},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					),
				}}
				listeners={{
					tabLongPress: (e) => {
						clearFilters();
					},
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="person.fill" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
