import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { colors, darkColors } from "../theme/colors";

const BACKEND_URL = "http://localhost:4002";
const DEMO_ADMIN_EMAIL = "admin@holisticaf.com";
const DEMO_ADMIN_PASSWORD = "adminPassword";

export default function AdminScreen({ navigation, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loggedIn, setLoggedIn] = useState(false);
	const [loading, setLoading] = useState(false);

	const loginRequest = async (loginEmail, loginPassword) => {
		try {
			const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: loginEmail, password: loginPassword }),
			});
			const data = await res.json().catch(() => ({}));
			return data.success;
		} catch {
			return false;
		}
	};

	const login = async () => {
		setLoading(true);
		const ok = await loginRequest(email, password);
		if (ok) setLoggedIn(true);
		else alert("Invalid credentials. Try the demo login below.");
		setLoading(false);
	};

	const demoLogin = async () => {
		setEmail(DEMO_ADMIN_EMAIL);
		setPassword(DEMO_ADMIN_PASSWORD);
		setLoading(true);
		const ok = await loginRequest(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD);
		if (ok) setLoggedIn(true);
		else alert("Demo login failed. Is the backend running?");
		setLoading(false);
	};

	if (loggedIn) {
		return (
			<SafeAreaView style={themed.container}>
				<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="admin" showBack />
				<ScrollView contentContainerStyle={themed.content} showsVerticalScrollIndicator={false}>
					<Text style={themed.heading}>Welcome, admin</Text>
					<Text style={themed.body}>
						You're signed in to the mobile admin preview. Use the web admin portal for full dashboard,
						inventory, orders, employees, managers, and LMS management.
					</Text>
					<View style={themed.infoCard}>
						<Text style={themed.infoTitle}>Quick links</Text>
						<Text style={themed.infoItem}>• Dashboard & analytics</Text>
						<Text style={themed.infoItem}>• Inventory (35 category products)</Text>
						<Text style={themed.infoItem}>• Orders & fulfillment</Text>
						<Text style={themed.infoItem}>• Employees, managers & LMS</Text>
						<Text style={themed.infoItem}>• Schedule & exports (CSV/PDF)</Text>
					</View>
					<TouchableOpacity style={themed.button} onPress={() => setLoggedIn(false)}>
						<Text style={themed.buttonText}>log out</Text>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={themed.container}>
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="admin" showBack />
			<ScrollView contentContainerStyle={themed.content} showsVerticalScrollIndicator={false}>
				<Text style={themed.heading}>admin portal</Text>
				<View style={themed.card}>
					<TextInput
						style={themed.input}
						placeholder="Email"
						placeholderTextColor={theme.neutralMediumGray}
						keyboardType="email-address"
						autoCapitalize="none"
						value={email}
						onChangeText={setEmail}
					/>
					<TextInput
						style={themed.input}
						placeholder="Password"
						placeholderTextColor={theme.neutralMediumGray}
						secureTextEntry
						value={password}
						onChangeText={setPassword}
					/>
					<TouchableOpacity style={[themed.button, loading && { opacity: 0.7 }]} onPress={login} disabled={loading}>
						<Text style={themed.buttonText}>{loading ? "signing in..." : "login"}</Text>
					</TouchableOpacity>

					<View style={themed.dividerRow}>
						<View style={themed.divider} />
						<Text style={themed.dividerText}>or</Text>
						<View style={themed.divider} />
					</View>

					<TouchableOpacity style={themed.demoButton} onPress={demoLogin} disabled={loading}>
						<Text style={themed.demoButtonText}>{loading ? "signing in..." : "Try demo admin login"}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.secondarySoftBeige },
		content: { padding: 16, paddingBottom: 40 },
		heading: { fontSize: 28, fontWeight: "700", color: theme.primaryForestGreen, marginBottom: 16 },
		body: { fontSize: 14, color: theme.primaryForestGreen, lineHeight: 22, marginBottom: 16, opacity: 0.85 },
		card: {
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 24,
			padding: 18,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
		},
		input: {
			width: "100%",
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}33`,
			borderRadius: 14,
			paddingHorizontal: 14,
			paddingVertical: 12,
			marginBottom: 12,
			backgroundColor: theme.secondarySoftBeige,
			color: theme.primaryForestGreen,
		},
		button: {
			backgroundColor: theme.primaryForestGreen,
			paddingVertical: 14,
			borderRadius: 999,
			alignItems: "center",
			marginTop: 8,
		},
		buttonText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 15 },
		dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 16 },
		divider: { flex: 1, height: 1, backgroundColor: `${theme.primaryForestGreen}33` },
		dividerText: { fontSize: 12, color: theme.primaryForestGreen, opacity: 0.6 },
		demoButton: {
			backgroundColor: `${theme.secondaryGoldenHoney}20`,
			borderWidth: 1,
			borderColor: theme.secondaryGoldenHoney,
			paddingVertical: 14,
			borderRadius: 999,
			alignItems: "center",
		},
		demoButtonText: { color: theme.neutralCharcoal, fontWeight: "700", fontSize: 15 },
		infoCard: {
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 20,
			padding: 16,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
			marginBottom: 20,
		},
		infoTitle: { fontSize: 16, fontWeight: "700", color: theme.primaryForestGreen, marginBottom: 10 },
		infoItem: { fontSize: 14, color: theme.primaryForestGreen, marginBottom: 6, opacity: 0.85 },
	});
