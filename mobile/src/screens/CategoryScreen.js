import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { colors, darkColors } from "../theme/colors";
import { useAppContext } from "../context/AppContext";

const BACKEND_URL = "http://localhost:4002";

const categoryMap = {
	"Herbs & Botanicals": "herbs-botanicals",
	"Teas & Tonics": "teas-tonics",
	"Superfoods": "superfoods",
	"Supplements": "supplements",
	"Pantry & Whole Foods": "pantry-whole-foods",
	"Body & Wellness": "body-care-wellness",
};

export default function CategoryScreen({ navigation, route, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const { addToCart } = useAppContext();
	const categoryName = route.params?.category || "Category";
	const categorySlug =
		route.params?.slug ||
		categoryMap[categoryName] ||
		categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchCategoryProducts = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${BACKEND_URL}/api/kroger/category/${encodeURIComponent(categorySlug)}`);
			const data = await res.json();
			if (data.success) {
				setProducts(Array.isArray(data.products) ? data.products : []);
			} else {
				setError(data.message || "Failed to load category");
			}
		} catch (err) {
			setError(err.message || "Network error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategoryProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categorySlug]);

	const formatCategory = (cat) =>
		cat
			?.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
			.replace("And", "&");

	const renderProduct = ({ item }) => {
		const imageUrl = Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : null;
		const price = item.offerPrice ?? item.price?.sale ?? item.price?.regular ?? 0;
		const regular = item.regularPrice ?? item.price?.regular ?? price;
		return (
			<TouchableOpacity
				style={themed.card}
				onPress={() => navigation.navigate("ProductDetail", { product: item })}
			>
				<View style={themed.imageWrap}>
					{imageUrl ? (
						<Image source={{ uri: imageUrl }} style={themed.image} resizeMode="contain" />
					) : (
						<View style={themed.imagePlaceholder}>
							<Text style={themed.imagePlaceholderText}>{item.name?.charAt(0)}</Text>
						</View>
					)}
				</View>
				<View style={themed.cardBody}>
					<Text style={themed.brand}>{item.brand || "holisticAF"}</Text>
					<Text style={themed.name} numberOfLines={2}>
						{item.name}
					</Text>
					<Text style={themed.category}>{formatCategory(item.category)}</Text>
					<View style={themed.priceRow}>
						<Text style={themed.price}>${Number(price).toFixed(2)}</Text>
						{regular !== price && <Text style={themed.regularPrice}>${Number(regular).toFixed(2)}</Text>}
					</View>
					<TouchableOpacity style={themed.addBtn} onPress={() => addToCart(item)}>
						<Text style={themed.addBtnText}>add to cart</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={themed.container}>
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title={categoryName} showBack />
			{loading ? (
				<View style={themed.center}>
					<ActivityIndicator size="large" color={theme.secondaryGoldenHoney} />
				</View>
			) : error ? (
				<ScrollView contentContainerStyle={themed.center}>
					<Text style={themed.error}>{error}</Text>
					<TouchableOpacity style={themed.retryBtn} onPress={fetchCategoryProducts}>
						<Text style={themed.retryText}>Retry</Text>
					</TouchableOpacity>
				</ScrollView>
			) : (
				<FlatList
					data={products}
					keyExtractor={(item) => item._id || item.externalId || item.name}
					renderItem={renderProduct}
					numColumns={2}
					contentContainerStyle={themed.list}
					columnWrapperStyle={themed.row}
					ListEmptyComponent={
						<View style={themed.center}>
							<Text style={themed.empty}>No products in this category.</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.secondarySoftBeige },
		center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
		list: { padding: 12, paddingBottom: 32 },
		row: { justifyContent: "space-between", marginBottom: 12 },
		card: {
			width: "48%",
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
			overflow: "hidden",
		},
		imageWrap: {
			height: 130,
			backgroundColor: theme.primaryCream || theme.secondarySoftBeige,
			alignItems: "center",
			justifyContent: "center",
		},
		image: { width: "80%", height: "80%" },
		imagePlaceholder: {
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: theme.primaryForestGreen,
			alignItems: "center",
			justifyContent: "center",
		},
		imagePlaceholderText: { color: theme.primaryWarmWhite, fontSize: 22, fontWeight: "700" },
		cardBody: { padding: 12 },
		brand: {
			fontSize: 10,
			fontWeight: "700",
			textTransform: "uppercase",
			letterSpacing: 1,
			color: theme.primarySageGreen,
			marginBottom: 4,
		},
		name: { fontSize: 14, fontWeight: "600", color: theme.primaryForestGreen, minHeight: 38, textTransform: "capitalize" },
		category: { fontSize: 11, color: theme.neutralMediumGray, marginTop: 2 },
		priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
		price: { fontSize: 14, fontWeight: "700", color: theme.primaryForestGreen },
		regularPrice: { fontSize: 12, color: theme.neutralMediumGray, textDecorationLine: "line-through" },
		addBtn: {
			marginTop: 10,
			backgroundColor: theme.secondaryGoldenHoney,
			paddingVertical: 8,
			borderRadius: 999,
			alignItems: "center",
		},
		addBtnText: { color: theme.neutralCharcoal, fontWeight: "700", fontSize: 12 },
		error: { fontSize: 16, fontWeight: "600", color: theme.primaryForestGreen, textAlign: "center", marginBottom: 12 },
		retryBtn: { backgroundColor: theme.secondaryGoldenHoney, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
		retryText: { color: theme.neutralCharcoal, fontWeight: "700" },
		empty: { fontSize: 16, color: theme.neutralMediumGray },
	});
