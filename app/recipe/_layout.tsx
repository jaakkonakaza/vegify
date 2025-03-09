import { Stack } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function RecipeLayout() {
	const colorScheme = useColorScheme() ?? "light";
	const isDark = colorScheme === "dark";

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? "#151718" : "#fff",
				},
				headerTintColor: isDark ? "#81C784" : "#4CAF50",
				headerTitleStyle: {
					fontWeight: "bold",
					color: Colors[colorScheme].text,
				},
			}}
		>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="reviews"
				options={{
					headerShown: true,
					title: "Reviews",
					presentation: "modal",
				}}
			/>
		</Stack>
	);
}
