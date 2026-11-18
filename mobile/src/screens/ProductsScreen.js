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
import { useEffect, useState } from "react";
import { colors, darkColors } from "../theme/colors";

const BACKEND_URL = "http://localhost:4002";

const categoryMap = {
	"Herbs & Botanicals": "herbs-botanicals",
	"Teas & Tonics": "teas-tonics",
	"Superfoods": "superfoods",
	"Supplements": "supplements",
	"Pantry & Whole Foods": "pantry-whole-foods",
	"Body & Wellness": "body-care-wellness",
};

export default function ProductsScreen({ navigation, dark }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchProducts = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${BACKEND_URL}/api/inventory/inventory?source=local`);
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
		fetchProducts();
	}, []);

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
				onPress={() =>
					navigation.navigate("Category", {
						category: formatCategory(item.category),
						slug: item.category,
					})
				}
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
						{regular !== price && (
							<Text style={themed.regularPrice}>${Number(regular).toFixed(2)}</Text>
						)}
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={themed.container}>
			<View style={themed.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text style={themed.backText}>← back</Text>
				</TouchableOpacity>
				<Text style={themed.title}>products</Text>
				<View style={{ width: 40 }} />
			</View>

			{loading ? (
				<View style={themed.center}>
					<ActivityIndicator size="large" color={theme.secondaryGoldenHoney} />
				</View>
			) : error ? (
				<ScrollView contentContainerStyle={themed.center}>
					<Text style={themed.error}>{error}</Text>
					<TouchableOpacity style={themed.retryBtn} onPress={fetchProducts}>
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
		container: {
			flex: 1,
			backgroundColor: theme.secondarySoftBeige,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: theme.primaryForestGreen,
		},
		backText: {
			color: theme.primaryForestGreen,
			fontSize: 14,
			fontWeight: "600",
		},
		title: {
			fontSize: 18,
			fontWeight: "700",
			color: theme.primaryForestGreen,
		},
		center: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			padding: 24,
		},
		list: {
			padding: 12,
			paddingBottom: 32,
		},
		row: {
			justifyContent: "space-between",
			marginBottom: 12,
		},
		card: {
			width: "48%",
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}1a`,
			overflow: "hidden",
		},
		imageWrap: {
			height: 140,
			backgroundColor: theme.secondarySoftBeige,
			alignItems: "center",
			justifyContent: "center",
		},
		image: {
			width: "80%",
			height: "80%",
		},
		imagePlaceholder: {
			width: 64,
			height: 64,
			borderRadius: 32,
			backgroundColor: theme.primaryForestGreen,
			alignItems: "center",
			justifyContent: "center",
		},
		imagePlaceholderText: {
			color: theme.primaryWarmWhite,
			fontSize: 24,
			fontWeight: "700",
		},
		cardBody: {
			padding: 12,
		},
		brand: {
			fontSize: 10,
			fontWeight: "700",
			textTransform: "uppercase",
			letterSpacing: 1,
			color: theme.primarySageGreen,
			marginBottom: 4,
		},
		name: {
			fontSize: 14,
			fontWeight: "600",
			color: theme.primaryForestGreen,
			minHeight: 40,
		},
		category: {
			fontSize: 11,
			color: theme.neutralMediumGray,
			marginTop: 4,
		},
		priceRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			marginTop: 8,
		},
		price: {
			fontSize: 14,
			fontWeight: "700",
			color: theme.primaryForestGreen,
		},
		regularPrice: {
			fontSize: 12,
			color: theme.neutralMediumGray,
			textDecorationLine: "line-through",
		},
		error: {
			fontSize: 16,
			fontWeight: "600",
			color: theme.primaryForestGreen,
			textAlign: "center",
			marginBottom: 12,
		},
		retryBtn: {
			backgroundColor: theme.secondaryGoldenHoney,
			paddingHorizontal: 20,
			paddingVertical: 10,
			borderRadius: 20,
		},
		retryText: {
			color: theme.neutralCharcoal,
			fontWeight: "700",
		},
		empty: {
			fontSize: 16,
			color: theme.neutralMediumGray,
		},
	});
