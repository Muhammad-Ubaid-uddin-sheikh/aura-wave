import Header from "@/components/Header/Header";
import Footer from "@/components/Shared/Footer";
import ScrollToTop from "@/components/Shared/ScrollToTop";
import { getHomePageData } from "@/sanity/queries/queries";
import { ProductData } from "@/types";

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch HomePage Data
    const homePageData:ProductData = await getHomePageData()
    return (
        <div
            className={`antialiased`}
        >
            <Header product={homePageData}/>
            {children}
            <ScrollToTop />
            <Footer />
        </div>
    );
}   