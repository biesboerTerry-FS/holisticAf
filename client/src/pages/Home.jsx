import React from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import TopSellers from "../components/TopSellers";
import BottomBanner from "../components/BottomBanner";
import Newsletter from "../components/Newsletter";

const Home = () => {
	return (
		<main className="mt-10">
			<MainBanner />
			<Categories />
			<TopSellers />
			<BottomBanner />
			<Newsletter />
		</main>
	);
};

export default Home;
