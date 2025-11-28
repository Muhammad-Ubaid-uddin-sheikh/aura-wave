import CollectionsPage from "@/components/Admin/Collections/CollectionsPage"
import { getAllCollections } from "@/sanity/queries/queries";

const Collections = async () => {
  const collections = await getAllCollections();
  return (
    <CollectionsPage collections={collections}/>
  )
}

export default Collections