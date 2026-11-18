import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import CategoryScreen from "./src/screens/CategoryScreen";
import ContactScreen from "./src/screens/ContactScreen";
import AdminScreen from "./src/screens/AdminScreen";
import CartScreen from "./src/screens/CartScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import { AppProvider } from "./src/context/AppContext";

const Stack = createNativeStackNavigator();

export default function App() {
	const systemTheme = useColorScheme();
	const [dark, setDark] = useState(systemTheme === "dark");
	const toggleTheme = () => setDark((prev) => !prev);

	return (
		<AppProvider>
			<NavigationContainer>
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
					}}
				>
					<Stack.Screen name="Home">
						{(props) => <HomeScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
					<Stack.Screen name="Products">
						{(props) => <ProductsScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
					<Stack.Screen name="Category">
						{(props) => <CategoryScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
					<Stack.Screen name="ProductDetail">
						{(props) => <ProductDetailScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
					<Stack.Screen name="Cart">
						{(props) => <CartScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
					<Stack.Screen name="Contact">
						{(props) => <ContactScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
					<Stack.Screen name="Admin">
						{(props) => <AdminScreen {...props} dark={dark} toggleTheme={toggleTheme} />}
					</Stack.Screen>
				</Stack.Navigator>
			</NavigationContainer>
		</AppProvider>
	);
}
