'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { getOrders } from '@/sanity/queries/queries';
import { formatCurrency } from '@/lib/helpers/formatCurrency';
import { groupOrdersByDate } from '@/lib/helpers/groupOrdersByDate';
import { statusColors, ORDERS_LIMIT, FIVE_MINUTES } from '@/constants/order';
import { Order } from '@/types';

// Props for the OrderTable component
type OrderTableProps = {
  orders: Order[];
  onViewOrder: (order: Order) => void; // Callback to view order details
  onEditOrder: (order: Order) => void; // Callback to edit order
  setAllOrders: React.Dispatch<React.SetStateAction<Order[]>>;
};

// Component to display orders table with filters and pagination
const OrderTable: React.FC<OrderTableProps> = ({ orders, onViewOrder, onEditOrder, setAllOrders }) => {
  // --- State ---
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]); // Selected order IDs for copying
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // Filter by order status
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // Filter by payment status
  const [searchQuery, setSearchQuery] = useState(''); // Search query for order ID or customer name
  const [ordersLoading, setOrdersLoading] = useState(false); // Loading state for pagination
  const [offset, setOffset] = useState(orders.length); // Pagination offset

  // --- Logic ---
  // Filter orders based on status, payment, and search query
  const matchesFilters = useCallback((order: Order) => {
    const matchOrderStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
    const matchPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      order.orderId.includes(searchQuery.trim()) ||
      (order.customer.name || '').toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchOrderStatus && matchPaymentStatus && matchSearch;
  }, [orderStatusFilter, paymentStatusFilter, searchQuery]);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => orders.filter(matchesFilters), [orders, matchesFilters]);

  // Memoized grouped orders by date
  const groupedOrders = useMemo(() => {
    return groupOrdersByDate(
      filteredOrders.sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    );
  }, [filteredOrders]);

  // Toggle selection of an order for copying
  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  }, []);

  // Copy selected orders to clipboard
  const copyData = useCallback(() => {
    if (selectedOrders.length === 0) return;
    const selected = filteredOrders.filter((o) => selectedOrders.includes(o.orderId));
    const data = selected
      .map(
        (o) =>
          `Order ID: ${o.orderId}\nCustomer: ${o.customer.name}\nStatus: ${o.orderStatus}\nPayment: ${o.paymentMethod} (${o.paymentStatus})\nTotal: ${formatCurrency(o.totalAmount)}\nDate: ${format(parseISO(o._createdAt), 'yyyy-MM-dd HH:mm')}\n`
      )
      .join('\n\n');
    navigator.clipboard.writeText(data);
    toast.info('Copied');
  }, [selectedOrders, filteredOrders]);

  // Load more orders for pagination
  const loadMore = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const newOrders = await getOrders(offset, offset + ORDERS_LIMIT, false);
      if (newOrders.length === 0) {
        toast.error('No more orders to load');
        setTimeout(() => {
          setOrdersLoading(false);
        }, FIVE_MINUTES);
      } else {
        setAllOrders((prev) => [...prev, ...newOrders]);
        setOffset((prev) => prev + ORDERS_LIMIT);
        toast.success('Loaded more orders');
        setOrdersLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load more orders');
      setOrdersLoading(false);
    }
  }, [offset, setAllOrders]);

  // --- Rendering ---
  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header with filters and copy button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">All Orders</h1>
        <div className="flex flex-wrap items-end gap-4">
          {/* Search input */}
          <div className="flex flex-col space-y-1">
            <Label className="text-sm font-medium">Search</Label>
            <Input
              type="text"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
          </div>
          {/* Order status filter */}
          <div className="flex flex-col space-y-1">
            <Label className="text-sm font-medium">Order Status</Label>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Payment status filter */}
          <div className="flex flex-col space-y-1">
            <Label className="text-sm font-medium">Payment Status</Label>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Copy orders button */}
          <Button
            onClick={copyData}
            disabled={selectedOrders.length === 0}
            variant="outline"
            className="mt-6 hover:bg-accent hover:text-accent-foreground"
          >
            Copy Orders
          </Button>
        </div>
      </div>

      {/* Orders table */}
      <div className="min-h-[350px]">
        {filteredOrders.length === 0 ? (
          <div className="text-center text-muted-foreground text-base py-12">No orders found.</div>
        ) : (
          Object.entries(groupedOrders).map(([date, orders]) => {
            // Calculate status counts for badges
            let cancelledCount = 0,
              returnedCount = 0,
              pendingCount = 0,
              shippedCount = 0,
              deliveredCount = 0;
            for (const o of orders) {
              if (o.orderStatus === 'cancelled') cancelledCount++;
              else if (o.orderStatus === 'returned') returnedCount++;
              else if (o.orderStatus === 'pending') pendingCount++;
              else if (o.orderStatus === 'shipped') shippedCount++;
              else if (o.orderStatus === 'delivered') deliveredCount++;
            }
            return (
              <div key={date} className="mt-4">
                {/* Date and status badges */}
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h2 className="text-base font-semibold text-sidebar-foreground">{date}</h2>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">Total: {orders.length}</Badge>
                    <Badge className={statusColors.cancelled}>Cancelled: {cancelledCount}</Badge>
                    <Badge className={statusColors.returned}>Returned: {returnedCount}</Badge>
                    <Badge className={statusColors.pending}>Pending: {pendingCount}</Badge>
                    <Badge className={statusColors.shipped}>Shipped: {shippedCount}</Badge>
                    <Badge className={statusColors.delivered}>Delivered: {deliveredCount}</Badge>
                  </div>
                </div>
                {/* Table for orders */}
                <div className="rounded-lg border overflow-x-auto mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={orders.every((o) => selectedOrders.includes(o.orderId))}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOrders((prev) => [
                                  ...prev,
                                  ...orders.map((o) => o.orderId).filter((id) => !prev.includes(id)),
                                ]);
                              } else {
                                setSelectedOrders((prev) =>
                                  prev.filter((id) => !orders.map((o) => o.orderId).includes(id))
                                );
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order.orderId)}
                              onCheckedChange={() => toggleOrderSelection(order.orderId)}
                            />
                          </TableCell>
                          <TableCell>{order.orderId}</TableCell>
                          <TableCell>{format(parseISO(order._createdAt), 'hh:mm a')}</TableCell>
                          <TableCell>{order.customer.name}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[order.orderStatus]} text-sm capitalize`}>
                              {order.orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p>{order.paymentMethod}</p>
                              <p className="capitalize">{order.paymentStatus}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => onViewOrder(order)}>
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onEditOrder(order)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more button */}
      {!!orders.length && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={ordersLoading}
            className="max-w-xs bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground"
          >
            {ordersLoading ? 'Please wait for a few Minutes...' : 'Load More Orders'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderTable;