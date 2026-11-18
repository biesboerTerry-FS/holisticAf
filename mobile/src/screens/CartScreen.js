import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { colors, darkColors } from "../theme/colors";
import { useAppContext } from "../context/AppContext";

export default function CartScreen({ navigation, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const { cart, updateQuantity, removeFromCart, cartTotal } = useAppContext();
	const items = Object.entries(cart).map(([id, item]) => ({ id, ...item }));

	return (
		<SafeAreaView style={themed.container}>
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="cart" showBack showCart={false} />
			{items.length === 0 ? (
				<View style={themed.center}>
					<Text style={themed.emptyTitle}>your cart is empty</Text>
					<Text style={themed.emptySubtitle}>Add some holistic goodies to get started.</Text>
					<TouchableOpacity style={themed.primaryBtn} onPress={() => navigation.navigate("Products")}>
						<Text style={themed.primaryBtnText}>browse products</Text>
					</TouchableOpacity>
				</View>
			) : (
				<>
					<FlatList
						data={items}
						keyExtractor={(item) => item.id}
						contentContainerStyle={themed.list}
						renderItem={({ item }) => {
							const p = item.product || {};
							const price = p.offerPrice ?? p.price?.sale ?? p.regularPrice ?? p.price?.regular ?? 0;
							const imageUrl = Array.isArray(p.image) && p.image.length > 0 ? p.image[0] : null;
							return (
								<View style={themed.card}>
									<View style={themed.imageWrap}>
										{imageUrl ? (
											<Image source={{ uri: imageUrl }} style={themed.image} resizeMode="contain" />
										) : (
											<View style={themed.imagePlaceholder}>
												<Text style={themed.imagePlaceholderText}>{p.name?.charAt(0) || "?"}</Text>
											</View>
										)}
									</View>
									<View style={themed.info}>
										<Text style={themed.name} numberOfLines={2}>{p.name}</Text>
										<Text style={themed.price}>${Number(price).toFixed(2)}</Text>
										<View style={themed.qtyRow}>
											<TouchableOpacity style={themed.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
												<Text style={themed.qtyBtnText}>−</Text>
											</TouchableOpacity>
											<Text style={themed.qty}>{item.quantity}</Text>
											<TouchableOpacity style={themed.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
												<Text style={themed.qtyBtnText}>+</Text>
											</TouchableOpacity>
											<TouchableOpacity style={themed.removeBtn} onPress={() => removeFromCart(item.id)}>
												<Text style={themed.removeText}>remove</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							);
						}}
					/>
					<View style={themed.footer}>
						<View style={themed.totalRow}>
							<Text style={themed.totalLabel}>Total</Text>
							<Text style={themed.totalValue}>${cartTotal.toFixed(2)}</Text>
						</View>
						<TouchableOpacity style={themed.primaryBtn} onPress={() => navigation.navigate("Products")}>
							<Text style={themed.primaryBtnText}>continue shopping</Text>
						</TouchableOpacity>
					</View>
				</>
			)}
		</SafeAreaView>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.secondarySoftBeige },
		center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
		emptyTitle: { fontSize: 22, fontWeight: "700", color: theme.primaryForestGreen, marginBottom: 8 },
		emptySubtitle: { fontSize: 14, color: theme.neutralMediumGray, marginBottom: 20, textAlign: "center" },
		list: { padding: 16, paddingBottom: 20 },
		card: {
			flexDirection: "row",
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
			marginBottom: 12,
			overflow: "hidden",
		},
		imageWrap: {
			width: 100,
			height: 110,
			backgroundColor: theme.primaryCream || theme.secondarySoftBeige,
			alignItems: "center",
			justifyContent: "center",
		},
		image: { width: "80%", height: "80%" },
		imagePlaceholder: {
			width: 48,
			height: 48,
			borderRadius: 24,
			backgroundColor: theme.primaryForestGreen,
			alignItems: "center",
			justifyContent: "center",
		},
		imagePlaceholderText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 18 },
		info: { flex: 1, padding: 12, justifyContent: "center" },
		name: { fontSize: 15, fontWeight: "600", color: theme.primaryForestGreen, marginBottom: 4 },
		price: { fontSize: 14, fontWeight: "700", color: theme.secondaryGoldenHoney, marginBottom: 8 },
		qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
		qtyBtn: {
			width: 28,
			height: 28,
			borderRadius: 14,
			backgroundColor: theme.primarySageGreen,
			alignItems: "center",
			justifyContent: "center",
		},
		qtyBtnText: { color: theme.primaryForestGreen, fontWeight: "700", fontSize: 16 },
		qty: { minWidth: 20, textAlign: "center", fontWeight: "600", color: theme.primaryForestGreen },
		removeBtn: { marginLeft: "auto" },
		removeText: { fontSize: 12, color: "#d14343", fontWeight: "600" },
		footer: {
			padding: 16,
			borderTopWidth: 1,
			borderTopColor: `${theme.primaryForestGreen}14`,
			backgroundColor: theme.primaryWarmWhite,
		},
		totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
		totalLabel: { fontSize: 16, fontWeight: "600", color: theme.primaryForestGreen },
		totalValue: { fontSize: 20, fontWeight: "700", color: theme.primaryForestGreen },
		primaryBtn: {
			backgroundColor: theme.primaryForestGreen,
			paddingVertical: 14,
			borderRadius: 999,
			alignItems: "center",
		},
		primaryBtnText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 15 },
	});
