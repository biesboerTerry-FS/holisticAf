import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	ImageBackground,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { colors, darkColors } from "../theme/colors";
import { useAppContext } from "../context/AppContext";

const BACKEND_URL = "http://localhost:4002";

const categories = [
	{ name: "Herbs & Botanicals", slug: "herbs-botanicals", emoji: "🌿" },
	{ name: "Teas & Tonics", slug: "teas-tonics", emoji: "🍵" },
	{ name: "Superfoods", slug: "superfoods", emoji: "✨" },
	{ name: "Supplements", slug: "supplements", emoji: "💊" },
	{ name: "Pantry & Whole Foods", slug: "pantry-whole-foods", emoji: "🥣" },
	{ name: "Body & Wellness", slug: "body-care-wellness", emoji: "🛁" },
];

export default function HomeScreen({ navigation, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const { addToCart } = useAppContext();
	const [featured, setFeatured] = useState([]);
	const [loadingFeatured, setLoadingFeatured] = useState(true);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const res = await fetch(`${BACKEND_URL}/api/kroger/featured`);
				const data = await res.json();
				if (mounted && data.success) {
					setFeatured(Array.isArray(data.products) ? data.products.slice(0, 6) : []);
				}
			} catch {
				// ignore
			} finally {
				if (mounted) setLoadingFeatured(false);
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, []);

	const subscribe = () => {
		alert("Thanks for subscribing!");
	};

	return (
		<SafeAreaView style={themed.container}>
			<StatusBar
				barStyle={dark ? "light-content" : "dark-content"}
				backgroundColor={theme.secondarySoftBeige}
			/>
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} />
			<ScrollView contentContainerStyle={themed.scroll} showsVerticalScrollIndicator={false}>
				<ImageBackground
					source={require("../../assets/mainBannerBg.png")}
					style={themed.hero}
					imageStyle={themed.heroImage}
					resizeMode="cover"
				>
					<View style={[themed.heroOverlay, dark && themed.heroOverlayDark]} />
					<View style={themed.heroContent}>
						<Text style={themed.heroBadge}>100% HOLISTIC GOODNESS</Text>
						<Text style={themed.heroTitle}>nourish with purpose — your food is your medicine.</Text>
						<View style={themed.heroActions}>
							<TouchableOpacity
								style={themed.ctaBtn}
								onPress={() => navigation.navigate("Products")}
							>
								<Text style={themed.ctaText}>shop now</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => navigation.navigate("Products")}>
								<Text style={themed.linkText}>see all products →</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ImageBackground>

				<View style={themed.sectionHeader}>
					<Text style={themed.sectionLabel}>EXPLORE</Text>
					<Text style={themed.sectionTitle}>
						shop by <Text style={themed.accentText}>category</Text>
					</Text>
				</View>
				<View style={themed.categoryGrid}>
					{categories.map((cat) => (
						<TouchableOpacity
							key={cat.slug}
							style={themed.categoryCard}
							onPress={() => navigation.navigate("Category", { category: cat.name, slug: cat.slug })}
						>
							<Text style={themed.categoryEmoji}>{cat.emoji}</Text>
							<Text style={themed.categoryTitle}>{cat.name}</Text>
							<Text style={themed.categoryHint}>browse →</Text>
						</TouchableOpacity>
					))}
				</View>

				<View style={themed.sectionHeader}>
					<Text style={themed.sectionLabel}>FEATURED</Text>
					<Text style={themed.sectionTitle}>
						top <Text style={themed.accentText}>picks</Text>
					</Text>
				</View>
				{loadingFeatured ? (
					<ActivityIndicator size="small" color={theme.secondaryGoldenHoney} style={{ marginVertical: 20 }} />
				) : (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={themed.featuredRow}
					>
						{featured.map((item) => {
							const imageUrl = Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
							const price = item.offerPrice ?? item.price?.sale ?? item.regularPrice ?? 0;
							return (
								<TouchableOpacity
									key={item._id || item.externalId || item.name}
									style={themed.featuredCard}
									onPress={() => navigation.navigate("ProductDetail", { product: item })}
								>
									<View style={themed.featuredImageWrap}>
										{imageUrl ? (
											<Image source={{ uri: imageUrl }} style={themed.featuredImage} resizeMode="contain" />
										) : (
											<View style={themed.imagePlaceholder}>
												<Text style={themed.imagePlaceholderText}>{item.name?.charAt(0)}</Text>
											</View>
										)}
									</View>
									<Text style={themed.featuredName} numberOfLines={2}>{item.name}</Text>
									<Text style={themed.featuredPrice}>${Number(price).toFixed(2)}</Text>
									<TouchableOpacity style={themed.addSmallBtn} onPress={() => addToCart(item)}>
										<Text style={themed.addSmallText}>add</Text>
									</TouchableOpacity>
								</TouchableOpacity>
							);
						})}
					</ScrollView>
				)}

				<View style={themed.newsletter}>
					<Text style={themed.newsletterTitle}>stay in the know</Text>
					<Text style={themed.newsletterSubtitle}>
						subscribe to get the latest offers, new arrivals, and exclusive discounts
					</Text>
					<View style={themed.inputRow}>
						<TextInput
							style={themed.input}
							placeholder="Enter your email"
							placeholderTextColor={theme.neutralMediumGray}
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<TouchableOpacity style={themed.subscribeBtn} onPress={subscribe}>
							<Text style={themed.subscribeText}>subscribe</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={themed.footerLinks}>
					<TouchableOpacity onPress={() => navigation.navigate("Contact")}>
						<Text style={themed.footerLinkText}>Contact us</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate("Admin")}>
						<Text style={themed.footerLinkText}>Admin portal</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.secondarySoftBeige },
		scroll: { paddingBottom: 40 },
		hero: {
			margin: 16,
			borderRadius: 28,
			overflow: "hidden",
			minHeight: 260,
			justifyContent: "flex-end",
		},
		heroImage: { borderRadius: 28 },
		heroOverlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: "rgba(30,77,67,0.55)",
		},
		heroOverlayDark: {
			backgroundColor: "rgba(14,24,22,0.6)",
		},
		heroContent: { padding: 22 },
		heroBadge: {
			alignSelf: "flex-start",
			backgroundColor: "rgba(233,176,74,0.9)",
			color: "#1e1e1e",
			fontSize: 10,
			fontWeight: "700",
			letterSpacing: 1.2,
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 999,
			marginBottom: 10,
		},
		heroTitle: {
			fontSize: 26,
			fontWeight: "700",
			color: "#f5f3ee",
			fontStyle: "italic",
			marginBottom: 18,
			lineHeight: 32,
		},
		heroActions: { flexDirection: "row", alignItems: "center", gap: 14, flexWrap: "wrap" },
		ctaBtn: {
			backgroundColor: theme.secondaryGoldenHoney,
			paddingHorizontal: 22,
			paddingVertical: 12,
			borderRadius: 999,
		},
		ctaText: { color: theme.neutralCharcoal, fontWeight: "700", fontSize: 14 },
		linkText: { color: "#f5f3ee", fontWeight: "600", fontSize: 14 },
		sectionHeader: { paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
		sectionLabel: {
			fontSize: 11,
			fontWeight: "700",
			letterSpacing: 2,
			color: theme.primaryForestGreen,
			marginBottom: 4,
		},
		sectionTitle: { fontSize: 26, fontWeight: "700", color: theme.primaryForestGreen },
		accentText: { color: theme.secondaryGoldenHoney },
		categoryGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 12,
			paddingHorizontal: 16,
			marginBottom: 24,
		},
		categoryCard: {
			width: "47%",
			flexGrow: 1,
			minHeight: 110,
			padding: 14,
			borderRadius: 20,
			backgroundColor: theme.primaryWarmWhite,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
			justifyContent: "space-between",
		},
		categoryEmoji: { fontSize: 22, marginBottom: 6 },
		categoryTitle: { fontSize: 14, fontWeight: "700", color: theme.primaryForestGreen },
		categoryHint: { fontSize: 12, color: theme.neutralMediumGray, marginTop: 6 },
		featuredRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
		featuredCard: {
			width: 170,
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
			padding: 12,
		},
		featuredImageWrap: {
			height: 110,
			backgroundColor: theme.primaryCream || theme.secondarySoftBeige,
			borderRadius: 14,
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 8,
		},
		featuredImage: { width: "75%", height: "75%" },
		imagePlaceholder: {
			width: 48,
			height: 48,
			borderRadius: 24,
			backgroundColor: theme.primaryForestGreen,
			alignItems: "center",
			justifyContent: "center",
		},
		imagePlaceholderText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 18 },
		featuredName: { fontSize: 13, fontWeight: "600", color: theme.primaryForestGreen, minHeight: 36, textTransform: "capitalize" },
		featuredPrice: { fontSize: 14, fontWeight: "700", color: theme.secondaryGoldenHoney, marginTop: 4 },
		addSmallBtn: {
			marginTop: 8,
			backgroundColor: theme.primaryForestGreen,
			paddingVertical: 8,
			borderRadius: 999,
			alignItems: "center",
		},
		addSmallText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 12 },
		newsletter: { alignItems: "center", marginTop: 28, paddingHorizontal: 16 },
		newsletterTitle: { fontSize: 24, fontWeight: "700", color: theme.primaryForestGreen, marginBottom: 6 },
		newsletterSubtitle: { fontSize: 14, color: theme.primaryForestGreen, textAlign: "center", marginBottom: 16, opacity: 0.8 },
		inputRow: { flexDirection: "row", width: "100%", maxWidth: 520, height: 46 },
		input: {
			flex: 1,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}55`,
			borderRightWidth: 0,
			borderTopLeftRadius: 999,
			borderBottomLeftRadius: 999,
			paddingHorizontal: 16,
			backgroundColor: theme.primaryWarmWhite,
			color: theme.primaryForestGreen,
		},
		subscribeBtn: {
			backgroundColor: theme.primaryForestGreen,
			paddingHorizontal: 20,
			justifyContent: "center",
			borderTopRightRadius: 999,
			borderBottomRightRadius: 999,
		},
		subscribeText: { color: theme.primaryWarmWhite, fontWeight: "700" },
		footerLinks: {
			flexDirection: "row",
			justifyContent: "center",
			gap: 24,
			marginTop: 28,
		},
		footerLinkText: { color: theme.primaryForestGreen, fontWeight: "600", textDecorationLine: "underline" },
	});
