import { defineQuery } from "next-sanity";
import { client } from "../lib/client";

export const getHomePageData = async () => {
  const query = defineQuery(`*[_type == "product"][0]{
    _id,
    title,
    slug,
    description,
    hasVariants,
    averageRating,
    totalReviewsCount,
    tags,
    baseImages[] {
      _type,
      asset
    },
    baseVideo {
      _type,
      asset->{url}
    },
    baseOriginalPrice,
    baseDiscountedPrice,
    baseStock,
    collection -> {
      title
    },
    variants[] {
      _key,
      price,
      discountedPrice,
      stock,
      attributes[] {
        attributeName,
        attributeValue
      },
      image {
        _type,
        asset
      }
    },
    specification[] {
      title,
      tags,
      image {
        _type,
        asset
      },
      description
    }
  }`);
  try {
    const data = await client.fetch(query, {},
      // { next: { revalidate: 60 * 60 * 1 } }// Caching for 1 hours
       { cache: "no-store", next: { revalidate: 0 } }  // Disable caching for development
    )
    return data || []
  } catch (error) {
    console.error("Error Fetching HomePageData" + error)
    return []
  }
}

export const fetchPolicies = async () => {
  const query = `*[_type == "siteSettings"][0]{
    policies {
      privacy,
      shipping,
      terms,
      complaints
    }
  }`
  try {
    const data = await client.fetch(query, {},
      { next: { revalidate: 60 * 60 * 24, tags: ["policies"]} } // Caching for 24 hours
      // { cache: "no-store" } // Disable caching for development
    )
    return data || {}
  } catch (error) {
    console.error("Error fetching policies:", error)
    return {}
  }
}

export const getReviews = async (id: string) => {
  const query = defineQuery(`*[_type == "review" && product._ref == $id && approved == true]  | order(_createdAt desc) {
  _id,
  reviewerName,
  reviewerEmail,
  rating,
  comment,
  approved,
  date,
  "reviewImages": reviewImages[].asset->url,
}`);
  try {
    const data = await client.fetch(query, { id }, { next: { revalidate: 300 } }) // 5 minutes
    return data || []
  } catch (error) {
    console.error("Error Fetching ReviewsData" + error)
    return []
  }
}

export const getOrders = async (start: number, end: number, isServerFetch = true) => {
  const query = `*[_type == "order"] | order(_createdAt desc)[$start...$end]{
    _createdAt,
    _id,
    orderId,
    shippingMethod,
    shippingCost,
    paymentMethod,
    paymentStatus,
    orderStatus,
    subtotalAmount,
    discountCode,
    discountAmount,
    totalAmount,
    billingInfo,
    customer->{
      _id,
      name,
      email,
      number,
      address,
      city,
      province,
      postalCode
    },
    orderItems[]{
      _key,
      productId,
      slug,
      title,
      variant,
      variantKey,
      price,
      discountPrice,
      quantity,
      imageUrl
  }
}`
  try {
    if (isServerFetch) {
      // Server-side fetch with revalidation
      const orders = await client.fetch(query, { start, end }, { next: { revalidate: 60 } })
      return orders
    } else {
      // Client-side fetch without revalidation
      const orders = await client.fetch(query, { start, end }, { cache: "no-store" })
      return orders
    }

  } catch (error) {
    console.error("Error fetching Orders: " + error)
    return []
  }
}

export const getAllCollections = async () => {
  const query = defineQuery(`*[_type == "collection"]{
    _id,
    title,
    slug {
      _type,
      current
    },
    image,
    description,
  }`);
  try {
    const data = await client.fetch(query, {},
      // { next: { revalidate: 60 * 60 * 24 } } // Caching for 24 hours
      { cache: "no-store" } // Disable caching for development
    )
    return data || []
  } catch (error) {
    console.error("Error Fetching AllCollections" + error)
    return []
  }
}