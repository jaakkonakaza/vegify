import { Stack } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function AuthLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: Colors[colorScheme ?? "light"].background,
				},
				headerTintColor: Colors[colorScheme ?? "light"].text,
				headerTitleStyle: {
					fontWeight: "bold",
				},
				headerShadowVisible: false,
			}}
		>
			<Stack.Screen
				name="sign-in"
				options={{
					title: "Sign In",
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="create-profile"
				options={{
					title: "Create Profile",
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
