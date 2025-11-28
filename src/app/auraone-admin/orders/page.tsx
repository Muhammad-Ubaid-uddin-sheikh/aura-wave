import OrdersPage from "@/components/Admin/Orders/OrdersPage"
import { Order } from "@/types"
import { getOrders } from "@/sanity/queries/queries"
import { Suspense } from "react"
import Loading from "@/app/loading"

const Orders = async () => {
  const orders: Order[] = await getOrders(0,50,false) // fetch latest 50 orders 

  return (
    <Suspense fallback={<Loading/>}>
      <OrdersPage orders={orders}/>
    </Suspense>
  )
}

export default Orders