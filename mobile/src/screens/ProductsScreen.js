import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	ScrollView,
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

const CATEGORIES = [
	{ name: "All", slug: "" },
	{ name: "Herbs & Botanicals", slug: "herbs-botanicals" },
	{ name: "Teas & Tonics", slug: "teas-tonics" },
	{ name: "Superfoods", slug: "superfoods" },
	{ name: "Supplements", slug: "supplements" },
	{ name: "Pantry & Whole Foods", slug: "pantry-whole-foods" },
	{ name: "Body & Wellness", slug: "body-care-wellness" },
];

export default function ProductsScreen({ navigation, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const { addToCart } = useAppContext();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("");

	const fetchProducts = async (category = "") => {
		setLoading(true);
		setError("");
		try {
			const url = category
				? `${BACKEND_URL}/api/kroger/category/${encodeURIComponent(category)}`
				: `${BACKEND_URL}/api/inventory/inventory?source=local`;
			const res = await fetch(url);
			const data = await res.json();
			if (data.success) {
				setProducts(Array.isArray(data.products) ? data.products : []);
			} else {
				setError(data.message || "Failed to load products");
			}
		} catch (err) {
			setError(err.message || "Network error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts(activeCategory);
	}, [activeCategory]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return products;
		return products.filter((p) => (p.name || "").toLowerCase().includes(q));
	}, [products, query]);

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
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="products" />
			<View style={themed.searchWrap}>
				<TextInput
					style={themed.searchInput}
					placeholder="Search products..."
					placeholderTextColor={theme.neutralMediumGray}
					value={query}
					onChangeText={setQuery}
				/>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={themed.chipsRow}
			>
				{CATEGORIES.map((c) => {
					const active = activeCategory === c.slug;
					return (
						<TouchableOpacity
							key={c.slug || "all"}
							style={[themed.chip, active && themed.chipActive]}
							onPress={() => setActiveCategory(c.slug)}
						>
							<Text style={[themed.chipText, active && themed.chipTextActive]}>{c.name}</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>

			{loading ? (
				<View style={themed.center}>
					<ActivityIndicator size="large" color={theme.secondaryGoldenHoney} />
				</View>
			) : error ? (
				<ScrollView contentContainerStyle={themed.center}>
					<Text style={themed.error}>{error}</Text>
					<TouchableOpacity style={themed.retryBtn} onPress={() => fetchProducts(activeCategory)}>
						<Text style={themed.retryText}>Retry</Text>
					</TouchableOpacity>
				</ScrollView>
			) : (
				<FlatList
					data={filtered}
					keyExtractor={(item) => item._id || item.externalId || item.name}
					renderItem={renderProduct}
					numColumns={2}
					contentContainerStyle={themed.list}
					columnWrapperStyle={themed.row}
					ListEmptyComponent={
						<View style={themed.center}>
							<Text style={themed.empty}>No products found.</Text>
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
		searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
		searchInput: {
			backgroundColor: theme.primaryWarmWhite,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}22`,
			borderRadius: 999,
			paddingHorizontal: 16,
			paddingVertical: 10,
			color: theme.primaryForestGreen,
		},
		chipsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
		chip: {
			paddingHorizontal: 14,
			paddingVertical: 8,
			borderRadius: 999,
			backgroundColor: theme.primaryWarmWhite,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}22`,
			marginRight: 8,
		},
		chipActive: { backgroundColor: theme.primaryForestGreen, borderColor: theme.primaryForestGreen },
		chipText: { color: theme.primaryForestGreen, fontWeight: "600", fontSize: 12 },
		chipTextActive: { color: theme.primaryWarmWhite },
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
