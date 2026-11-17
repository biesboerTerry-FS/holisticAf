import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, darkColors } from "../theme/colors";

const DEMO_ADMIN_EMAIL = "admin@holisticaf.com";
const DEMO_ADMIN_PASSWORD = "adminPassword";

export default function AdminScreen({ navigation, dark }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loggedIn, setLoggedIn] = useState(false);

	const login = () => {
		if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
			setLoggedIn(true);
		} else {
			alert("Invalid credentials. Try the demo login below.");
		}
	};

	const demoLogin = () => {
		setEmail(DEMO_ADMIN_EMAIL);
		setPassword(DEMO_ADMIN_PASSWORD);
		setLoggedIn(true);
	};

	if (loggedIn) {
		return (
			<SafeAreaView style={themed.container}>
				<View style={themed.header}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Text style={themed.backText}>← back</Text>
					</TouchableOpacity>
					<Text style={themed.title}>admin</Text>
					<View style={{ width: 40 }} />
				</View>
				<View style={themed.content}>
					<Text style={themed.heading}>Welcome, demo admin 👋</Text>
					<Text style={themed.body}>
						You are viewing the mobile admin preview. In a full build this screen
						would connect to the holisticAF backend to manage inventory, orders,
						and schedules.
					</Text>
					<TouchableOpacity style={themed.button} onPress={() => setLoggedIn(false)}>
						<Text style={themed.buttonText}>log out</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={themed.container}>
			<View style={themed.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text style={themed.backText}>← back</Text>
				</TouchableOpacity>
				<Text style={themed.title}>admin</Text>
				<View style={{ width: 40 }} />
			</View>
			<View style={themed.content}>
				<Text style={themed.heading}>admin portal</Text>
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
				<TouchableOpacity style={themed.button} onPress={login}>
					<Text style={themed.buttonText}>login</Text>
				</TouchableOpacity>

				<View style={themed.dividerRow}>
					<View style={themed.divider} />
					<Text style={themed.dividerText}>or</Text>
					<View style={themed.divider} />
				</View>

				<TouchableOpacity style={themed.demoButton} onPress={demoLogin}>
					<Text style={themed.demoButtonText}>Try demo admin login</Text>
				</TouchableOpacity>
			</View>
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
		content: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			padding: 24,
		},
		heading: {
			fontSize: 24,
			fontWeight: "700",
			color: theme.primaryForestGreen,
			marginBottom: 20,
		},
		body: {
			fontSize: 14,
			color: theme.primaryForestGreen,
			textAlign: "center",
			marginBottom: 24,
			lineHeight: 20,
		},
		input: {
			width: "100%",
			maxWidth: 320,
			borderWidth: 1,
			borderColor: theme.primaryForestGreen,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			marginBottom: 12,
			backgroundColor: theme.primaryWarmWhite,
			color: theme.primaryForestGreen,
		},
		button: {
			backgroundColor: theme.primaryForestGreen,
			paddingVertical: 14,
			paddingHorizontal: 40,
			borderRadius: 8,
			alignItems: "center",
			marginTop: 8,
			width: "100%",
			maxWidth: 320,
		},
		buttonText: {
			color: theme.primaryWarmWhite,
			fontWeight: "600",
			fontSize: 15,
		},
		dividerRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			marginVertical: 16,
			width: "100%",
			maxWidth: 320,
		},
		divider: {
			flex: 1,
			height: 1,
			backgroundColor: `${theme.primaryForestGreen}33`,
		},
		dividerText: {
			fontSize: 12,
			color: theme.primaryForestGreen,
			opacity: 0.6,
		},
		demoButton: {
			backgroundColor: `${theme.secondaryGoldenHoney}20`,
			borderWidth: 1,
			borderColor: theme.secondaryGoldenHoney,
			paddingVertical: 14,
			paddingHorizontal: 40,
			borderRadius: 8,
			alignItems: "center",
			width: "100%",
			maxWidth: 320,
		},
		demoButtonText: {
			color: theme.neutralCharcoal,
			fontWeight: "600",
			fontSize: 15,
		},
	});
