import Navbar from "./_components/landing/Navbar";
import Hero from "./_components/landing/Hero";
import WhyLove from "./_components/landing/WhyLove";
import HowItWorks from "./_components/landing/HowItWorks";
import Features from "./_components/landing/Features";
import Footer from "./_components/landing/Footer";

export default function HomePage() {
	return (
		<>
			<Navbar />
			<main>
				<Hero />
				<WhyLove />
				<HowItWorks />
				<Features />
			</main>
			<Footer />
		</>
	);
}
