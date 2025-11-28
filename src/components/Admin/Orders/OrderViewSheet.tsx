'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/helpers/formatCurrency';
import { siteConfig } from '@/constants/siteConfig';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { orderFormSchema, OrderFormValues, getOrderFormValues } from '@/schemas/admin/order';

// Props for the OrderViewSheet component
type OrderViewSheetProps = {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  setAllOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onEditOrder: (order: Order) => void; // Callback to open edit dialog
};

// Component to display order details in a read-only view
const OrderViewSheet: React.FC<OrderViewSheetProps> = ({
  selectedOrder,
  setSelectedOrder,
  setAllOrders,
  onEditOrder,
}) => {
  // --- State ---
  const [isLoading, setIsLoading] = useState(false); // Loading state for status updates

  // --- Form Setup ---
  const {
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty, dirtyFields },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: selectedOrder ? getOrderFormValues(selectedOrder) : undefined,
  });

  // --- Logic ---
  // Reset form values when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      reset(getOrderFormValues(selectedOrder));
    }
  }, [selectedOrder, reset]);

  // Save updated orderStatus or paymentStatus
  const onSave = useCallback(
    async (data: OrderFormValues) => {
      if (!selectedOrder) return;
      setIsLoading(true);
      let orderUpdated = false;

      const changedFields: any = {};
      if (dirtyFields.orderStatus) changedFields.orderStatus = data.orderStatus;
      if (dirtyFields.paymentStatus) changedFields.paymentStatus = data.paymentStatus;

      try {
        if (Object.keys(changedFields).length > 0) {
          const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedFields),
          });
          orderUpdated = res.ok;
          if (!res.ok) toast.error('Failed to update order status');
        }

        if (orderUpdated) {
          toast.success('Order status updated!');
          setSelectedOrder({ ...selectedOrder, ...changedFields });
          setAllOrders((prev) =>
            prev.map((order) =>
              order._id === selectedOrder._id ? { ...order, ...changedFields } : order
            )
          );
        } else if (Object.keys(dirtyFields).length === 0) {
          toast.info('No changes to update');
        }
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedOrder, setSelectedOrder, setAllOrders, dirtyFields]
  );

  const onError = useCallback((errors: any) => {
    console.log('Zod Validation Errors:', errors);
    toast.error('Form validation failed. Please check your inputs.');
  }, []);

  // --- Rendering ---
  if (!selectedOrder) return null;

  return (
    <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
      <SheetContent className="flex flex-col h-full w-full !max-w-3xl">
        <SheetHeader>
          <SheetTitle>Order Details: ID #{selectedOrder.orderId}</SheetTitle>
          <SheetDescription>View details of this order.</SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSave, onError)}
          className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto hide-scrollbar text-base"
        >
          {/* Order Items */}
          <div className="space-y-1">
            <h1 className="text-lg font-semibold mb-1">Order Items</h1>
            {selectedOrder.orderItems.map((item) => (
              <div key={item._key} className="border p-2 rounded-md flex items-center gap-2">
                <Image
                  src={item.imageUrl || siteConfig.fallbackImage}
                  width={70}
                  height={70}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <Link href={`/products/${item.slug}`}>
                    <h2 className="font-semibold hover:text-primary transition-colors duration-300">{item.title}</h2>
                  </Link>
                  {item.variant && <p className="text-sm text-muted-foreground">Variant: {item.variant}</p>}
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: {formatCurrency(item.discountPrice ?? item.price)}</p>
                  <p>Total: {formatCurrency(item.quantity * (item.discountPrice ?? item.price))}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Info */}
          <div className="space-y-1 mx-1">
            <h1 className="text-lg font-semibold mb-1">Customer Info</h1>
            <p>Name: {selectedOrder.customer.name}</p>
            <p>Number: {selectedOrder.customer.number}</p>
            <p>Address: {selectedOrder.customer.address}</p>
            <p>City: {selectedOrder.customer.city}</p>
            <p>Province: {selectedOrder.customer.province}</p>
            {selectedOrder.customer.email && <p>Email: {selectedOrder.customer.email}</p>}
            {selectedOrder.customer.postalCode && <p>Postal Code: {selectedOrder.customer.postalCode}</p>}
          </div>

          {/* Other Details */}
          <div className="space-y-1 mx-1 mb-4">
            <h1 className="text-lg font-semibold mb-1">Other Details</h1>
            <p>Date: {format(parseISO(selectedOrder._createdAt), 'EEE, dd MMM yyyy hh:mm a')}</p>
            <p>Discount Amount: {formatCurrency(selectedOrder.discountAmount || 0)}</p>
            <p>Discount Code: {selectedOrder.discountCode || 'None'}</p>
            <p>Payment Method: {selectedOrder.paymentMethod}</p>
            <p>Shipping Method: {selectedOrder.shippingMethod}</p>
            <p>Shipping Cost: {formatCurrency(selectedOrder.shippingCost || 0)}</p>
            <p>Subtotal Amount: {formatCurrency(selectedOrder.subtotalAmount || 0)}</p>
            <p>Total Amount: {formatCurrency(selectedOrder.totalAmount || 0)}</p>
            <div className="flex flex-col gap-2">
              <div>
                <Label>Order Status</Label>
                <Select
                  value={watch('orderStatus')}
                  onValueChange={(val) => setValue('orderStatus', val as OrderStatus, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select
                  value={watch('paymentStatus')}
                  onValueChange={(val) => setValue('paymentStatus', val as PaymentStatus, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Billing Details */}
          {selectedOrder.billingInfo && (
            <div className="space-y-1 mx-1">
              <h1 className="text-lg font-semibold mb-1">Billing Details</h1>
              <p>Name: {selectedOrder.billingInfo.name}</p>
              {selectedOrder.billingInfo.number && <p>Number: {selectedOrder.billingInfo.number}</p>}
              <p>Address: {selectedOrder.billingInfo.address}</p>
              <p>City: {selectedOrder.billingInfo.city}</p>
              {selectedOrder.billingInfo.postalCode && <p>Postal Code: {selectedOrder.billingInfo.postalCode}</p>}
            </div>
          )}

          <SheetFooter className="flex gap-2 col-span-2 mt-2">
            <Button type="button" className="w-full" variant="outline" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
            <Button type="button" className="w-full" onClick={() => onEditOrder(selectedOrder)}>
              Edit Order
            </Button>
            <Button className="w-full" type="submit" disabled={!isDirty || isLoading}>
              Save Status
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default OrderViewSheet;