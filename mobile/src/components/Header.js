import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, darkColors } from "../theme/colors";
import { useAppContext } from "../context/AppContext";

export default function Header({ navigation, dark, toggleTheme, title, showBack, showCart = true }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const { cartCount } = useAppContext() || { cartCount: 0 };

	return (
		<View style={themed.header}>
			<View style={themed.left}>
				{showBack ? (
					<TouchableOpacity onPress={() => navigation.goBack()} style={themed.iconBtn}>
						<Text style={themed.iconText}>←</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity onPress={() => navigation.navigate("Home")} style={themed.brandWrap}>
						<Image source={require("../../assets/logo.png")} style={themed.logoImg} resizeMode="contain" />
					</TouchableOpacity>
				)}
			</View>

			<View style={themed.center}>
				{title ? (
					<Text style={themed.title} numberOfLines={1}>
						{title}
					</Text>
				) : (
					<Text style={themed.brandText}>holisticAF</Text>
				)}
			</View>

			<View style={themed.right}>
				<TouchableOpacity onPress={toggleTheme} style={themed.iconBtn}>
					<Text style={themed.iconText}>{dark ? "☀" : "☾"}</Text>
				</TouchableOpacity>
				{showCart ? (
					<TouchableOpacity
						onPress={() => navigation.navigate("Cart")}
						style={themed.iconBtn}
					>
						<Text style={themed.iconText}>🛒</Text>
						{cartCount > 0 && (
							<View style={themed.badge}>
								<Text style={themed.badgeText}>{cartCount}</Text>
							</View>
						)}
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 12,
			paddingVertical: 10,
			borderBottomWidth: 1,
			borderBottomColor: `${theme.primaryForestGreen}33`,
			backgroundColor: theme.secondarySoftBeige,
		},
		left: { flexDirection: "row", alignItems: "center", width: 90 },
		center: { flex: 1, alignItems: "center" },
		right: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, width: 90 },
		brandWrap: { flexDirection: "row", alignItems: "center" },
		logoImg: { width: 36, height: 36 },
		brandText: { fontSize: 18, fontWeight: "700", color: theme.secondaryGoldenHoney },
		title: { fontSize: 16, fontWeight: "700", color: theme.primaryForestGreen },
		iconBtn: {
			width: 34,
			height: 34,
			borderRadius: 17,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}44`,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.primaryWarmWhite,
		},
		iconText: { fontSize: 14, color: theme.primaryForestGreen },
		badge: {
			position: "absolute",
			top: -4,
			right: -4,
			minWidth: 16,
			height: 16,
			borderRadius: 8,
			backgroundColor: theme.secondaryGoldenHoney,
			alignItems: "center",
			justifyContent: "center",
			paddingHorizontal: 3,
		},
		badgeText: { fontSize: 10, fontWeight: "700", color: theme.neutralCharcoal },
	});
