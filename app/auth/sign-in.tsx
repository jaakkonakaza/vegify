import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

export default function SignInScreen() {
	const { preferences } = useUserPreferences();
	const hasGuestPreferences =
		preferences.allergies.length > 0 || preferences.isVegan;

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<View style={styles.container}>
				<View style={styles.contentContainer}>
					<View style={styles.logoContainer}>
						<Image
							source={require("@/assets/images/vegify-logo.png")}
							style={styles.logo}
							resizeMode="contain"
							alt="Vegify"
						/>
					</View>

					<View style={styles.welcomeContainer}>
						<ThemedText style={styles.welcomeTitle}>
							Create an account or sign in
						</ThemedText>
						<ThemedText style={styles.welcomeSubtitle}>
							Enter your email and start browsing recipes!
						</ThemedText>
					</View>

					<View style={styles.buttonContainer}>
						<Link
							href={{
								pathname: "/auth/create-profile",
								params: {
									isGuest: "false",
									fromGuestMode: hasGuestPreferences ? "true" : "false",
								},
							}}
							style={[styles.button]}
							asChild
						>
							<TouchableOpacity>
								<IconSymbol name="envelope" size={20} color="#000" />
								<Text style={styles.buttonText}>Sign in with Email</Text>
							</TouchableOpacity>
						</Link>

						<View style={styles.dividerContainer}>
							<View style={[styles.divider, { backgroundColor: "#ddd" }]} />
							<Text style={styles.dividerText}>or</Text>
							<View style={[styles.divider, { backgroundColor: "#ddd" }]} />
						</View>

						<Link
							href={{
								pathname: "/auth/create-profile",
								params: { isGuest: "true" },
							}}
							style={[styles.button]}
							asChild
						>
							<TouchableOpacity>
								<IconSymbol name="person" size={20} color="#000" />
								<Text style={styles.buttonText}>Continue as Guest</Text>
							</TouchableOpacity>
						</Link>
					</View>

					<View style={styles.termsContainer}>
						<ThemedText style={styles.termsText}>
							By continuing, you agree to our{" "}
							<ThemedText style={styles.termsLink}>Terms of Service</ThemedText>{" "}
							and{" "}
							<ThemedText style={styles.termsLink}>Privacy Policy</ThemedText>
						</ThemedText>
					</View>
				</View>
			</View>
			<Image
				source={require("@/assets/images/auth-footer.png")}
				style={styles.footerLogo}
				resizeMode="contain"
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#4A732F",
	},
	container: {
		flex: 1,
		padding: 16,
	},
	contentContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	logo: {
		width: 200,
		height: 100,
	},
	appName: {
		fontSize: 36,
		fontWeight: "bold",
		marginTop: 8,
	},
	welcomeContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	welcomeTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: "center",
		color: "#fff",
	},
	welcomeSubtitle: {
		fontSize: 16,
		textAlign: "center",
		opacity: 0.7,
		color: "#fff",
	},
	buttonContainer: {
		width: "100%",
		maxWidth: 400,
		marginBottom: 24,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 12,
		marginBottom: 16,
		borderWidth: 1,
		backgroundColor: "#fff",
		borderColor: "#ddd",
		width: "100%",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "500",
		marginLeft: 12,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 16,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#ddd",
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 14,
		opacity: 0.7,
		color: "#fff",
	},
	termsContainer: {
		marginTop: 24,
		paddingHorizontal: 24,
	},
	termsText: {
		fontSize: 12,
		textAlign: "center",
		opacity: 0.7,
		color: "#fff",
	},
	termsLink: {
		fontWeight: "500",
		textDecorationLine: "underline",
		color: "#fff",
	},
	footerLogo: {
		width: "100%",
		aspectRatio: 16 / 9,
	},
});
