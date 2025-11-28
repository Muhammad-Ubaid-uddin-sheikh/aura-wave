import Header from "@/components/Header/Header";
import HomePage from "@/components/HomePage/HomePage";
import Footer from "@/components/Shared/Footer";
import { getHomePageData } from "@/sanity/queries/queries";
import { ProductData } from "@/types";

export default async function Home() {
  // Fetch HomePage Data
  const homePageData:ProductData = await getHomePageData()
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("data",homePageData)
  return (
    <>
      <Header product={homePageData}/>
      <HomePage homePageData={homePageData} />
      <Footer />
    </>
  );
}