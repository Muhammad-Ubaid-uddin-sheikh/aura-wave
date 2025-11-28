import ReviewSection from '@/components/Reviews/ReviewSection'
import { getReviews } from '@/sanity/queries/queries'
import { Review } from '@/types'

const PRODUCT_ID = '2c011936-cec4-4f92-bc52-f0e858ebb499'

const Reviews = async () => {
  const reviews: Review[] = await getReviews(PRODUCT_ID) ?? []

  return (
    <ReviewSection reviews={reviews} productId={PRODUCT_ID} />
  )
}

export default Reviews