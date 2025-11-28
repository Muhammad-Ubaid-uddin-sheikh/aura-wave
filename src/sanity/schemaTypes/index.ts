import { type SchemaTypeDefinition } from 'sanity'
import product from './product'
import variant from './variant'
import collection from './collection'
import review from './review'
import siteSettings from './siteSettings'
import user from './user'
import order from './order'
import customer from './customer'
import orderItem from './orderItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    product,
    variant,
    collection,
    review,
    siteSettings,
    user,
    order,
    customer,
    orderItem,
  ],
}