import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { colors, darkColors } from "../theme/colors";

const BACKEND_URL = "http://localhost:4002";

export default function ContactScreen({ navigation, dark, toggleTheme }) {
	const theme = dark ? darkColors : colors;
	const themed = styles(theme);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);

	const submit = async () => {
		if (!name.trim() || !email.trim() || !message.trim()) {
			Alert.alert("Missing info", "Please fill in name, email, and message.");
			return;
		}
		setSending(true);
		try {
			const res = await fetch(`${BACKEND_URL}/api/contact/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					subject: subject.trim() || "Mobile contact",
					message: message.trim(),
				}),
			});
			const data = await res.json().catch(() => ({}));
			if (data.success) {
				Alert.alert("Message sent", "We'll get back to you soon.");
				setName("");
				setEmail("");
				setSubject("");
				setMessage("");
			} else {
				Alert.alert("Sent", "Thanks for reaching out!");
			}
		} catch {
			Alert.alert("Offline", "Could not reach the server, but thanks for your message.");
		} finally {
			setSending(false);
		}
	};

	return (
		<SafeAreaView style={themed.container}>
			<Header navigation={navigation} dark={dark} toggleTheme={toggleTheme} title="contact" showBack />
			<ScrollView contentContainerStyle={themed.scroll} showsVerticalScrollIndicator={false}>
				<Text style={themed.heading}>get in touch</Text>
				<Text style={themed.subheading}>
					Questions about products, orders, or wellness? We'd love to hear from you.
				</Text>
				<View style={themed.card}>
					<TextInput
						style={themed.input}
						placeholder="Name"
						placeholderTextColor={theme.neutralMediumGray}
						value={name}
						onChangeText={setName}
					/>
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
						placeholder="Subject (optional)"
						placeholderTextColor={theme.neutralMediumGray}
						value={subject}
						onChangeText={setSubject}
					/>
					<TextInput
						style={[themed.input, themed.message]}
						placeholder="Message"
						placeholderTextColor={theme.neutralMediumGray}
						multiline
						numberOfLines={5}
						textAlignVertical="top"
						value={message}
						onChangeText={setMessage}
					/>
					<TouchableOpacity style={[themed.button, sending && { opacity: 0.7 }]} onPress={submit} disabled={sending}>
						<Text style={themed.buttonText}>{sending ? "sending..." : "send message"}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = (theme) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.secondarySoftBeige },
		scroll: { padding: 16, paddingBottom: 40 },
		heading: { fontSize: 28, fontWeight: "700", color: theme.primaryForestGreen, marginBottom: 6 },
		subheading: { fontSize: 14, color: theme.neutralMediumGray, marginBottom: 20, lineHeight: 20 },
		card: {
			backgroundColor: theme.primaryWarmWhite,
			borderRadius: 24,
			padding: 18,
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}14`,
		},
		input: {
			borderWidth: 1,
			borderColor: `${theme.primaryForestGreen}33`,
			borderRadius: 14,
			paddingHorizontal: 14,
			paddingVertical: 12,
			marginBottom: 12,
			backgroundColor: theme.secondarySoftBeige,
			color: theme.primaryForestGreen,
		},
		message: { height: 140, paddingTop: 12 },
		button: {
			backgroundColor: theme.primaryForestGreen,
			paddingVertical: 14,
			borderRadius: 999,
			alignItems: "center",
			marginTop: 8,
		},
		buttonText: { color: theme.primaryWarmWhite, fontWeight: "700", fontSize: 15 },
	});
