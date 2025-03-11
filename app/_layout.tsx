import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { FilterProvider } from "@/contexts/FilterContext";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<UserPreferencesProvider>
			<FilterProvider>
				<ThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
				>
					<StatusBar style="auto" />
					<Stack
						screenOptions={{
							headerShown: false,
						}}
					>
						<Stack.Screen name="auth" options={{ headerShown: false }} />
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="+not-found" />
					</Stack>
					<StatusBar style="auto" />
				</ThemeProvider>
			</FilterProvider>
		</UserPreferencesProvider>
	);
}
