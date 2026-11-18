import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { colors, darkColors } from "../theme/colors";
import { useAppContext } from "../context/AppContext";

export default function ProductDetailScreen({ navigation, route, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const { addToCart } = useAppContext();
	const product = route.params?.product;

	if (!product) {
		return (
			<SafeAreaView style={themed.container}>
				<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="product" showBack />
				<View style={themed.center}>
					<Text style={themed.error}>Product not found.</Text>
				</View>
			</SafeAreaView>
		);
	}

	const imageUrl = Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : null;
	const price = product.offerPrice ?? product.price?.sale ?? product.regularPrice ?? product.price?.regular ?? 0;
	const regular = product.regularPrice ?? product.price?.regular ?? price;

	return (
		<SafeAreaView style={themed.container}>
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="details" showBack />
			<ScrollView contentContainerStyle={themed.scroll} showsVerticalScrollIndicator={false}>
				<View style={themed.heroImageWrap}>
					{imageUrl ? (
						<Image source={{ uri: imageUrl }} style={themed.heroImage} resizeMode="contain" />
					) : (
						<View style={themed.imagePlaceholder}>
							<Text style={themed.imagePlaceholderText}>{product.name?.charAt(0) || "?"}</Text>
						</View>
					)}
				</View>
				<View style={themed.body}>
					<Text style={themed.brand}>{product.brand || "holisticAF"}</Text>
					<Text style={themed.name}>{product.name}</Text>
					{product.category ? (
						<View style={themed.badge}>
							<Text style={themed.badgeText}>
								{String(product.category)
									.split("-")
									.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
									.join(" ")
									.replace("And", "&")}
							</Text>
						</View>
					) : null}
					<View style={themed.priceRow}>
						<Text style={themed.price}>${Number(price).toFixed(2)}</Text>
						{regular !== price && <Text style={themed.regularPrice}>${Number(regular).toFixed(2)}</Text>}
					</View>
					{product.description ? <Text style={themed.description}>{product.description}</Text> : null}
					{product.size ? (
						<Text style={themed.meta}>
							<Text style={themed.metaLabel}>Size: </Text>
							{product.size}
						</Text>
					) : null}
					{product.subCategory ? (
						<Text style={themed.meta}>
							<Text style={themed.metaLabel}>Type: </Text>
							{product.subCategory}
						</Text>
					) : null}

					<TouchableOpacity style={themed.addBtn} onPress={() => addToCart(product)}>
						<Text style={themed.addBtnText}>add to cart</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.secondarySoftBeige },
		center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
		scroll: { paddingBottom: 40 },
		heroImageWrap: {
			height: 280,
			backgroundColor: theme.primaryCream || theme.secondarySoftBeige,
			alignItems: "center",
			justifyContent: "center",
			margin: 16,
			borderRadius: 28,
		},
		heroImage: { width: "70%", height: "70%" },
		imagePlaceholder: {
			width: 90,
			height: 90,
			borderRadius: 45,
			backgroundColor: theme.primaryForestGreen,
			alignItems: "center",
			justifyContent: "center",
		},
		imagePlaceholderText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 32 },
		body: { paddingHorizontal: 20 },
		brand: {
			fontSize: 11,
			fontWeight: "700",
			textTransform: "uppercase",
			letterSpacing: 1.5,
			color: theme.primarySageGreen,
			marginBottom: 6,
		},
		name: { fontSize: 26, fontWeight: "700", color: theme.primaryForestGreen, marginBottom: 10, textTransform: "capitalize" },
		badge: {
			alignSelf: "flex-start",
			backgroundColor: theme.secondaryGoldenHoney,
			paddingHorizontal: 12,
			paddingVertical: 4,
			borderRadius: 999,
			marginBottom: 14,
		},
		badgeText: { fontSize: 11, fontWeight: "700", color: theme.neutralCharcoal },
		priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
		price: { fontSize: 24, fontWeight: "700", color: theme.primaryForestGreen },
		regularPrice: { fontSize: 16, color: theme.neutralMediumGray, textDecorationLine: "line-through" },
		description: { fontSize: 15, lineHeight: 22, color: theme.primaryForestGreen, marginBottom: 14 },
		meta: { fontSize: 14, color: theme.neutralMediumGray, marginBottom: 6 },
		metaLabel: { fontWeight: "700", color: theme.primaryForestGreen },
		addBtn: {
			marginTop: 20,
			backgroundColor: theme.secondaryGoldenHoney,
			paddingVertical: 16,
			borderRadius: 999,
			alignItems: "center",
			shadowColor: "#000",
			shadowOpacity: 0.1,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 4 },
		},
		addBtnText: { color: theme.neutralCharcoal, fontWeight: "700", fontSize: 16 },
		error: { fontSize: 16, color: theme.primaryForestGreen },
	});
