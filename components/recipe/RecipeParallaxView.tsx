import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";

const HEADER_HEIGHT = 300;

type Props = PropsWithChildren<{
	headerImage: string | ImageSourcePropType;
	headerBackgroundColor: { dark: string; light: string };
	headerContent?: ReactElement;
}>;

export default function RecipeParallaxView({
	children,
	headerImage,
	headerBackgroundColor,
	headerContent,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const scrollOffset = useScrollViewOffset(scrollRef);

	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
						[-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
					),
				},
				{
					scale: interpolate(
						scrollOffset.value,
						[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
						[2, 1, 1],
					),
				},
			],
		};
	});

	return (
		<ThemedView style={styles.container}>
			<Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
				{/* <View style={styles.headerContainer}> */}
				<Animated.Image
					source={
						typeof headerImage === "string" ? { uri: headerImage } : headerImage
					}
					style={[
						styles.headerImage,
						{ backgroundColor: headerBackgroundColor[colorScheme] },
						headerAnimatedStyle,
					]}
					resizeMode="cover"
				/>
				<View style={styles.headerContentContainer}>
					{headerContent && (
						<View style={styles.headerContentContainer}>{headerContent}</View>
					)}
				</View>
				<ThemedView style={styles.content}>{children}</ThemedView>
			</Animated.ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	headerImage: {
		width: "100%",
		height: HEADER_HEIGHT,
	},
	headerContentContainer: {
		position: "absolute",
		height: HEADER_HEIGHT,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: 16,
		zIndex: 10,
	},
	content: {
		flex: 1,
		padding: 16,
		overflow: "hidden",
	},
});
