'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/helpers/formatCurrency';
import { format, parseISO } from 'date-fns';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { orderFormSchema, OrderFormValues, getOrderFormValues } from '@/schemas/admin/order';
import { FormField } from '@/components/Shared/FormField';

// Props for the OrderEditDialog component
type OrderEditDialogProps = {
  selectedOrder: Order | null;
  setSelectedOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  setAllOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Component to edit order details in a dialog
const OrderEditDialog: React.FC<OrderEditDialogProps> = ({
  selectedOrder,
  setSelectedOrder,
  setAllOrders,
  open,
  onOpenChange,
}) => {
  // --- State ---
  const [isLoading, setIsLoading] = useState(false);

  // --- Form Setup ---
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, dirtyFields, errors },
    reset,
    watch,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: selectedOrder ? getOrderFormValues(selectedOrder) : undefined,
  });

  // --- Logic ---
  // Reset form when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      reset(getOrderFormValues(selectedOrder));
    }
  }, [selectedOrder, reset]);

  // Save edited order details
  const onSave = useCallback(
    async (data: OrderFormValues) => {
      if (!selectedOrder) return;
      setIsLoading(true);
      const changedFields: any = {};

      // Collect changed fields
      Object.keys(dirtyFields).forEach((key) => {
        if (key !== "customer") {
          changedFields[key as keyof OrderFormValues] = data[key as keyof OrderFormValues];
        }
      });

      try {
        let orderUpdated = false;
        let customerUpdated = false;

        // Update customer if changed
        if (dirtyFields.customer && selectedOrder.customer._id) {
          const res = await fetch(`/api/admin/customers/${selectedOrder.customer._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.customer),
          });
          customerUpdated = res.ok;
          if (!res.ok) toast.error('Failed to update customer');
        }

        // Update order if changed
        if (Object.keys(changedFields).length > 0) {
          const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedFields),
          });
          orderUpdated = res.ok;
          if (!res.ok) toast.error('Failed to update order');
        }

        // Update UI on success
        if (orderUpdated || customerUpdated) {
          toast.success('Order updated!');
          setSelectedOrder((prev: Order | null) => {
            if (!prev) return null;
            return {
              ...prev,
              ...changedFields,
              customer: dirtyFields.customer ? { ...prev.customer, ...data.customer } : prev.customer,
              billingInfo: dirtyFields.billingInfo ? { ...prev.billingInfo, ...data.billingInfo } : prev.billingInfo,
              orderItems: dirtyFields.orderItems ? data.orderItems : prev.orderItems,
            };
          });
          setAllOrders((prev) =>
            prev.map((order) =>
              order._id === selectedOrder._id
                ? {
                  ...order,
                  ...changedFields,
                  customer: dirtyFields.customer ? { ...order.customer, ...data.customer } : order.customer,
                  billingInfo: dirtyFields.billingInfo ? { ...order.billingInfo, ...data.billingInfo } : order.billingInfo,
                  orderItems: dirtyFields.orderItems ? data.orderItems : order.orderItems,
                }
                : order
            )
          );
        } else if (Object.keys(dirtyFields).length === 0) {
          toast.info('No changes to update');
        }
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsLoading(false);
        onOpenChange(false);
      }
    },
    [selectedOrder, setSelectedOrder, setAllOrders, dirtyFields, onOpenChange]
  );

  // Handle form validation errors
  const onError = useCallback((errors: any) => {
    console.log('Zod Validation Errors:', errors);
    toast.error('Form validation failed. Please check your inputs.');
  }, []);

  // --- Rendering ---
  if (!selectedOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-y-auto h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Order: ID #{selectedOrder.orderId}</DialogTitle>
          <DialogDescription>Edit the details of this order.</DialogDescription>
        </DialogHeader>


        <form onSubmit={handleSubmit(onSave, onError)} className="flex flex-col gap-4 max-w-4xl w-full ">
          {/* Order Items */}
          <div>
            <Label className='text-xl'>Order Items</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {selectedOrder.orderItems.map((item, idx) => (
                <div className="flex flex-col gap-2 border p-4 rounded-[10px]">
                  {/* Name */}
                  <FormField id={`orderItems.${idx}.title`} label="Item Title" register={register} error={errors?.orderItems?.[idx]?.title} placeholder="Enter item title" />

                  {/* Variant */}
                  {item.variant && (
                    <FormField id={`orderItems.${idx}.variant`} label="Variant" register={register} error={errors?.orderItems?.[idx]?.variant} placeholder="Enter variant" />
                  )}

                  {/* Quantity */}
                  <FormField id={`orderItems.${idx}.quantity`} label="Quantity" register={register} error={errors?.orderItems?.[idx]?.quantity} placeholder="Enter quantity" />

                  {item.discountPrice ? (
                    <FormField id={`orderItems.${idx}.discountPrice`} label="Price" register={register} error={errors?.orderItems?.[idx]?.discountPrice} placeholder="Enter price" />
                  ) : (
                    <FormField id={`orderItems.${idx}.price`} label="Price" register={register} error={errors?.orderItems?.[idx]?.price} placeholder="Enter price" />
                  )}

                  {/* Remove Item Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <p>Are you sure you want to remove this item?</p>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          const items = [...watch("orderItems")];
                          items.splice(idx, 1);
                          setValue("orderItems", items, { shouldDirty: true });
                        }}
                        >
                          Remove
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <Label className='text-xl'>Customer Info</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Customer Name */}
              <FormField id="customer.name" label="Customer Name" register={register} error={errors.customer?.name} placeholder="Enter customer name" />

              {/* Customer Number */}
              <FormField id="customer.number" label="Customer Number" register={register} error={errors.customer?.number} placeholder="Enter customer number" />

              {/* Customer Address */}
              <FormField id="customer.address" label="Customer Address" register={register} error={errors.customer?.address} placeholder="Enter customer address" />

              {/* Customer City */}
              <FormField id="customer.city" label="Customer City" register={register} error={errors.customer?.city} placeholder="Enter customer city" />

              {/* Customer Province */}
              <FormField id="customer.province" label="Customer Province" register={register} error={errors.customer?.province} placeholder="Enter customer province" />

              {/* Customer Email */}
              {selectedOrder.customer.email && (
                <FormField id="customer.email" label="Customer Email" register={register} error={errors.customer?.email} placeholder="Enter customer email" />
              )}

              {/* Customer Postal Code */}
              {selectedOrder.customer.postalCode && (
                <FormField id="customer.postalCode" label="Customer Postal Code" register={register} error={errors.customer?.postalCode} placeholder="Enter customer postal code" />
              )}
            </div>
          </div>

          {/* Other Details */}
          <div>
            <Label className='text-xl'>Other Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField id="shippingMethod" label="Shipping Method" register={register} error={errors.shippingMethod} placeholder="Enter shipping method" />

              <FormField id="shippingCost" label="Shipping Cost" register={register} error={errors.shippingCost} placeholder="Enter shipping cost" />

              <FormField id="paymentMethod" label="Payment Method" register={register} error={errors.paymentMethod} placeholder="Enter payment method" />
 
              <FormField id="subtotalAmount" label="Subtotal Amount" register={register} error={errors.subtotalAmount} placeholder="Enter subtotal amount" />

              {/* Payment Status */}
              <div>
                <Label>Payment Status</Label>
                <Select
                  value={watch("paymentStatus")}
                  onValueChange={(val) => setValue("paymentStatus", val as PaymentStatus, { shouldDirty: true })}
                >
                  <SelectTrigger
                    className='py-5 mt-1'
                  >
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Status */}
              <div>
                <Label>Order Status</Label>
                <Select
                  value={watch("orderStatus")}
                  onValueChange={(val) => setValue("orderStatus", val as OrderStatus, { shouldDirty: true })}
                >
                  <SelectTrigger
                    className='py-5 mt-1'
                  >
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

              {!!selectedOrder.discountCode && (
                <FormField id="discountCode" label="Discount Code" register={register} error={errors?.discountCode} placeholder="Enter discount code" />
              )}

              <FormField id="discountAmount" label="Discount Amount" register={register} error={errors?.discountAmount} placeholder="Enter discount amount" />

              <FormField id="totalAmount" label="Total Amount" register={register} error={errors.totalAmount} placeholder="Enter total amount" />
            </div>
          </div>

          {/* Billing Info */}
          <div>
            <Label className='text-xl'>Billing Info</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField id="billingInfo.name" label="Billing Name" register={register} error={errors.billingInfo?.name} placeholder="Enter billing name" />

              <FormField id="billingInfo.number" label="Billing Number" register={register} error={errors.billingInfo?.number} placeholder="Enter billing number" />

              <FormField id="billingInfo.address" label="Billing Address" register={register} error={errors.billingInfo?.address} placeholder="Enter billing address" />

              <FormField id="billingInfo.city" label="Billing City" register={register} error={errors.billingInfo?.city} placeholder="Enter billing city" />

              <FormField id="billingInfo.postalCode" label="Billing Postal Code" register={register} error={errors.billingInfo?.postalCode} placeholder="Enter billing postal code" />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-center mt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-[10px] text-xl py-6 border-primary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="rounded-[10px] text-xl py-6 hover:bg-primary hover:text-primary-foreground border-primary duration-500 transition-colors"
              disabled={!isDirty || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditDialog;