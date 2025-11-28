import Hero from "@/components/HomePage/Hero"
import ErrorMessage from "@/components/Shared/ErrorMessage"
import ScrollToTop from "@/components/Shared/ScrollToTop"
import Specifications from "@/components/HomePage/Specs"
import CustomerReviews from "@/components/HomePage/Reviews"
import FAQs from "@/components/HomePage/FAQs"
import Contact from "@/components/HomePage/Contact"
import { ProductData } from "@/types"

const HomePage = async ({homePageData}: {homePageData: ProductData}) => {
  // Error Handling
  if (!homePageData) return (
    <>
      <ErrorMessage />
    </>
  )
  
  // Render HomePage
  return (
    <>
      <Hero product={homePageData} />
      <Specifications specs={homePageData.specification ?? []}/>
      <CustomerReviews />
      <FAQs />
      <Contact />
      <ScrollToTop />
    </>
  )
}

export default HomePage