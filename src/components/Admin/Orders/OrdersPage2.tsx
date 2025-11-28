"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getOrders } from "@/sanity/queries/queries";
import { formatCurrency } from "@/lib/helpers/formatCurrency";
import { SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger } from "../../ui/alert-dialog";
import { orderFormSchema, OrderFormValues, getOrderFormValues } from "@/schemas/admin/order"
import { zodResolver } from "@hookform/resolvers/zod";
import { FIVE_MINUTES, ORDERS_LIMIT, INITIAL_EDITABLE_SECTIONS, statusColors } from "@/constants/order";
import { groupOrdersByDate } from "@/lib/helpers/groupOrdersByDate";
import { format, parseISO } from "date-fns"
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { siteConfig } from "@/constants/siteConfig";

const OrdersPage = ({ orders }: { orders: Order[] }) => {
    const [allOrders, setAllOrders] = useState<Order[]>(orders); // Store all orders for filtering
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null) // Store selected order for details view
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]) // Store selected order IDs
    const [orderStatusFilter, setOrderStatusFilter] = useState("all")
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("");
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [offset, setOffset] = useState<number>(orders.length); // Track offset for pagination
    const [editableSections, setEditableSections] = useState<Record<string, boolean>>(INITIAL_EDITABLE_SECTIONS);
    const [isLoading, setIsLoading] = useState(false)

    // console.log("Order", orders)

    // React Hook Form for editing
    const {
        register,
        handleSubmit,
        setValue,
        formState: { isDirty, dirtyFields },
        reset,
        watch,
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: selectedOrder
            ? getOrderFormValues(selectedOrder)
            : undefined,
    });

    // console.log("Dirty Fields:", dirtyFields); // only changes fields

    // When selectedOrder changes, reset form
    useEffect(() => {
        if (selectedOrder) {
            reset(getOrderFormValues(selectedOrder));
            // Reset editable sections when order changes
            setEditableSections(INITIAL_EDITABLE_SECTIONS);
        }
    }, [selectedOrder, reset]);

    const toggleSectionEdit = (sectionName: string) => {
        setEditableSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    const isSectionEditable = (sectionName: string) => editableSections[sectionName];

    const matchesFilters = (order: Order) => {
        const matchOrderStatus = orderStatusFilter === "all" || order.orderStatus === orderStatusFilter;
        const matchPaymentStatus = paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;
        const matchSearch = searchQuery.trim() === "" ||
            order.orderId.includes(searchQuery.trim()) ||
            (order.customer.name || "").toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchOrderStatus && matchPaymentStatus && matchSearch;
    }

    const filteredOrders = useMemo(() => allOrders.filter(matchesFilters), [
        allOrders, orderStatusFilter, paymentStatusFilter, searchQuery
    ])

    const loadMore = async () => {
        setOrdersLoading(true);
        try {
            const newOrders = await getOrders(offset, offset + ORDERS_LIMIT, false) // Fetch next 50 orders
            if (newOrders.length === 0) {
                toast.error("No more orders to load");
                setTimeout(() => {
                    setOrdersLoading(false);
                }, FIVE_MINUTES);
            } else {
                setAllOrders((prev) => [...prev, ...newOrders]) // Append new orders to existing ones
                setOffset((prev) => prev + ORDERS_LIMIT) // Update offset for next load
                toast.success("Loaded more orders");
                setOrdersLoading(false);
            }
        } catch (error) {
            toast.error('Failed to load more orders');
            setOrdersLoading(false);
        }
    }

    // console for zod errors
    const onError = (errors: any) => {
        console.log("Zod Validation Errors:", errors);
        toast.error('Form validation failed. Please check your inputs.');
    };

    const groupedOrders = useMemo(() => {
        return groupOrdersByDate(
            filteredOrders.sort((a, b) =>
                new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
            )
        )
    }, [filteredOrders])

    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders((prev) => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
    };

    const copyData = () => {
        if (selectedOrders.length === 0) return;
        const selected = filteredOrders.filter((o: any) => selectedOrders.includes(o.orderId));
        const data = selected.map((o: any) => `Order ID: ${o.orderId}\nCustomer: ${o.customer.name}\nStatus: ${o.orderStatus}\nPayment: ${o.paymentMethod} (${o.paymentStatus})\nTotal: ${o.totalAmount}\nDate: ${format(parseISO(o._createdAt), "yyyy-MM-dd HH:mm")}\n`).join("\n\n");
        navigator.clipboard.writeText(data);
        toast.info("Copied")
    }

    const onSave = async (data: any) => {
        // console.log("data" , data) // all data with updated fields  

        const changedFields: any = {};
        let orderUpdated = false;
        let customerUpdated = false;

        // Collect changed fields except 'customer'
        Object.keys(dirtyFields).forEach((key) => {
            if (key !== "customer") changedFields[key] = data[key];
        })

        // If customer info changed, PATCH customer doc
        if (dirtyFields.customer && selectedOrder?.customer._id) {
            const res = await fetch(`/api/admin/customers/${selectedOrder.customer._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data.customer),
            })

            customerUpdated = res.ok;
            if (!res.ok) {
                toast.error("Failed to update customer");
            }
        }

        // If any order field changed, PATCH order doc
        if (Object.keys(changedFields).length > 0) {
            const res = await fetch(`/api/admin/orders/${selectedOrder?._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(changedFields),
            })

            orderUpdated = res.ok;
            if (!res.ok) {
                toast.error("Failed to update order");
            }
        }

        // Handle success toast & update UI
        if (orderUpdated || customerUpdated) {
            toast.success("Order updated!");

            // 1. Update selectedOrder
            setSelectedOrder((prev) => ({
                ...prev,
                ...changedFields,

                // if nested update merge them
                customer: dirtyFields.customer ? { ...prev?.customer, ...data.customer } : prev?.customer,
                billingInfo: dirtyFields.billingInfo ? { ...prev?.billingInfo, ...data.billingInfo } : prev?.billingInfo,
                orderItems: dirtyFields.orderItems ? data.orderItems : prev?.orderItems,
            }));

            // 2. Update allOrders list
            setAllOrders((prev: Order[]) =>
                prev.map((order) =>
                    order._id === selectedOrder?._id
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
        } else if (
            Object.keys(dirtyFields).length === 0 ||
            !orderUpdated && !customerUpdated
        ) {
            toast("No changes to update");
        }

        setEditableSections(INITIAL_EDITABLE_SECTIONS)
        setSelectedOrder(null);
    }

    return (
        <div className="p-4 md:p-6 w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h1 className="text-2xl font-semibold text-sidebar-foreground">All Orders</h1>
                <div className="flex flex-wrap items-end gap-4">

                    {/* Search Input */}
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

                    {/* Filter by Order Status */}
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

                    {/* Filter by Payment Status */}
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

                    {/* Copy Button */}
                    <Button onClick={copyData} disabled={selectedOrders.length === 0} variant="outline" className="mt-6 hover:bg-accent hover:text-accent-foreground">Copy Orders</Button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="min-h-[350px]">
                {filteredOrders.length === 0 ? (
                    <div className="text-center text-muted-foreground text-base py-12">No orders found.</div>
                ) :
                    (Object.entries(groupedOrders).map(([date, orders]) => {
                        // Calculate counts for each status
                        let cancelledCount = 0, returnedCount = 0, pendingCount = 0, shippedCount = 0, deliveredCount = 0;
                        for (const o of orders) {
                            if (o.orderStatus === "cancelled") cancelledCount++;
                            else if (o.orderStatus === "returned") returnedCount++;
                            else if (o.orderStatus === "pending") pendingCount++;
                            else if (o.orderStatus === "shipped") shippedCount++;
                            else if (o.orderStatus === "delivered") deliveredCount++;
                        }
                        return (
                            <div key={date} className="mt-4">
                                {/* Date & Stasus Badges */}
                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                    <h2 className="text-base font-semibold text-sidebar-foreground">{date}</h2>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <Badge variant="secondary">Total: {orders.length}</Badge>
                                        <Badge className={`${statusColors["cancelled"]}`}>Cancelled: {cancelledCount}</Badge>
                                        <Badge className={`${statusColors["returned"]}`}>Returned: {returnedCount}</Badge>
                                        <Badge className={`${statusColors["pending"]}`}>Pending: {pendingCount}</Badge>
                                        <Badge className={`${statusColors["shipped"]}`}>Shipped: {shippedCount}</Badge>
                                        <Badge className={`${statusColors["delivered"]}`}>Delivered: {deliveredCount}</Badge>
                                    </div>
                                </div>

                                <div className="rounded-lg border overflow-x-auto mt-2">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <Checkbox
                                                        checked={orders.every((o) => selectedOrders.includes(o.orderId))}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedOrders(prev => [...prev, ...orders.map(o => o.orderId)]);
                                                            } else {
                                                                setSelectedOrders(prev => prev.filter(id => !orders.map(o => o.orderId).includes(id)));
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
                                                <TableHead></TableHead>
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
                                                    <TableCell>{format(parseISO(order._createdAt), "hh:mm a")}</TableCell>
                                                    <TableCell>{order.customer.name}</TableCell>
                                                    <TableCell>
                                                        <Badge className={`${statusColors[order.orderStatus]} text-sm capitalize`}>{order.orderStatus}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p>{order.paymentMethod}</p>
                                                            <p className="capitalize">{order.paymentStatus}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )
                    }
                    ))
                }

                {/* Load More Button */}
                {!!orders.length && (
                    <div className="mt-4 flex justify-center">
                        <Button variant="outline" onClick={loadMore} disabled={ordersLoading} className="max-w-xs bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground">
                            {ordersLoading ? 'Please wait for a few Minutes...' : 'Load More Orders'}
                        </Button>
                    </div>
                )}
            </div>


            {/* Order details sheet */}
            <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <SheetContent className="flex flex-col h-full w-full !max-w-3xl">
                    <SheetHeader>
                        <SheetTitle>Order Details: ID #{selectedOrder?.orderId}</SheetTitle>
                        <SheetDescription>
                            View and manage the details of this order.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit(onSave, onError)} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto hide-scrollbar text-base">
                        {/* Order Items */}
                        <div className="space-y-1">
                            <h1 className="text-lg font-semibold mb-1 flex items-center gap-2">Order Items
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("items")}
                                >
                                    <SquarePen />
                                </button>
                            </h1>

                            {isSectionEditable("items") ? (
                                <div className="grid grid-cols-6 gap-2">
                                    {watch("orderItems").map((item, idx: number) => (
                                        <div key={item._key} className="col-span-6 md:col-span-3 flex flex-col gap-1 border p-2 rounded">
                                            <Input {...register(`orderItems.${idx}.title`)} placeholder="Title" />
                                            {item.variant && <Input {...register(`orderItems.${idx}.variant`)} placeholder="Variant" />}
                                            <Input {...register(`orderItems.${idx}.quantity`)} type="number" placeholder="Quantity" />
                                            {item.discountPrice ? (
                                                <Input {...register(`orderItems.${idx}.discountPrice`)} type="number" placeholder="Discount Price" />
                                            ) : (
                                                <Input {...register(`orderItems.${idx}.price`)} type="number" placeholder="Price" />
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <p>Are you sure you want to remove this item?</p>
                                                    <div className="flex gap-2 justify-end">
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => {
                                                                // Remove item from orderItems
                                                                const items = [...watch("orderItems")];
                                                                items.splice(idx, 1);
                                                                setValue("orderItems", items, { shouldDirty: true })
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
                            ) : (
                                selectedOrder?.orderItems.map((item) => (
                                    <div key={item._key} className="border p-2 rounded-md flex items-center gap-2">
                                        <Image src={item.imageUrl || siteConfig.fallbackImage} width={70} height={70} alt={item.title} className="w-16 h-16 object-cover rounded-md"></Image>
                                        <div>
                                            <Link href={`/products/${item.slug}`}><h2 className="font-semibold hover:text-primary transition-colors duration-300">{item.title}</h2></Link>
                                            {item.variant && <p className="text- text-muted-foreground">Variant: {item.variant}</p>}
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: {formatCurrency(item.discountPrice ?? item.price)}</p>
                                            <p>Total: {formatCurrency(item.quantity * (item.discountPrice ?? item.price))}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Customer Details */}
                        <div className="space-y-1 mx-1">
                            <h1 className="text-lg font-semibold mb-1 flex items-center gap-2">Customer Info
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("customer")}
                                >
                                    <SquarePen />
                                </button>
                            </h1>

                            {isSectionEditable("customer") ? (
                                <>
                                    <Input {...register("customer.name")} placeholder="Name" />
                                    <Input {...register("customer.number")} placeholder="Number" />
                                    <Input {...register("customer.address")} placeholder="Address" />
                                    <Input {...register("customer.city")} placeholder="City" />
                                    <Input {...register("customer.province")} placeholder="Province" />
                                    <Input {...register("customer.email")} placeholder="Email" />
                                    <Input {...register("customer.postalCode")} placeholder="Postal Code" />
                                </>
                            ) : (
                                <>
                                    <p>Name: {selectedOrder?.customer.name}</p>
                                    <p>Number: {selectedOrder?.customer.number}</p>
                                    <p>Address: {selectedOrder?.customer.address}</p>
                                    <p>City: {selectedOrder?.customer.city}</p>
                                    <p>Province: {selectedOrder?.customer.province}</p>
                                    {selectedOrder?.customer.email && (
                                        <p>Email: {selectedOrder?.customer.email}</p>
                                    )}
                                    {selectedOrder?.customer.postalCode && (
                                        <p>Postal Code: {selectedOrder?.customer.postalCode}</p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Other Order Details */}
                        <div className="space-y-1 mx-1 mb-4">
                            <h1 className="text-lg font-semibold mb-1">Other Details</h1>

                            <p>Date: {selectedOrder?._createdAt ? format(parseISO(selectedOrder?._createdAt), "EEE, dd MMM yyyy hh:mm a") : ""}</p>

                            {/* Discount Amount */}
                            <div className="flex items-center gap-2">
                                {isSectionEditable("discountAmount") ? (
                                    <Input type="number" {...register("discountAmount")} placeholder="Discount Amount" />
                                ) : (
                                    <p>Discount Amount: {selectedOrder?.discountAmount}</p>
                                )}
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("discountAmount")}
                                >
                                    <SquarePen />
                                </button>
                            </div>

                            <p>Discount Code: {selectedOrder?.discountCode ? selectedOrder?.discountCode : "None"}</p>

                            {/* Payment Method */}
                            <div className="flex items-center gap-2">
                                {isSectionEditable("paymentMethod") ? (
                                    <Input {...register("paymentMethod")} placeholder="Payment Method" />
                                ) : (
                                    <p>Payment Method: {selectedOrder?.paymentMethod}</p>
                                )}
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("paymentMethod")}
                                >
                                    <SquarePen />
                                </button>
                            </div>

                            {/* Shipping Method */}
                            <div className="flex items-center gap-2">
                                {isSectionEditable("shippingMethod") ? (
                                    <Input {...register("shippingMethod")} placeholder="Shipping Method" />
                                ) : (
                                    <p>Shipping Method: {selectedOrder?.shippingMethod}</p>
                                )}
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("shippingMethod")}
                                >
                                    <SquarePen />
                                </button>
                            </div>

                            {/* Shipping Cost */}
                            <div className="flex items-center gap-2">
                                {isSectionEditable("shippingCost") ? (
                                    <Input type="number" {...register("shippingCost")} placeholder="Shipping Cost" />
                                ) : (
                                    <p>Shipping Cost: {selectedOrder?.shippingCost}</p>
                                )}
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("shippingCost")}
                                >
                                    <SquarePen />
                                </button>
                            </div>

                            {/* Subtotal Amount */}
                            <div className="flex items-center gap-2">
                                {isSectionEditable("subtotalAmount") ? (
                                    <Input type="number" {...register("subtotalAmount")} placeholder="Subtotal Amount" />
                                ) : (
                                    <p>Subtotal Amount: {selectedOrder?.subtotalAmount}</p>
                                )}
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("subtotalAmount")}
                                >
                                    <SquarePen />
                                </button>
                            </div>

                            {/* Total Amount */}
                            <div className="flex items-center gap-2">
                                {isSectionEditable("totalAmount") ? (
                                    <Input type="number" {...register("totalAmount")} placeholder="Total Amount" />
                                ) : (
                                    <p>Total Amount: {selectedOrder?.totalAmount}</p>
                                )}
                                <button
                                    type="button"
                                    className="hover:text-primary"
                                    onClick={() => toggleSectionEdit("totalAmount")}
                                >
                                    <SquarePen />
                                </button>
                            </div>

                            {/* Order & Payment Status */}
                            <div className="flex flex-col gap-2">
                                <div>
                                    <Label>Order Status</Label>
                                    <Select
                                        value={watch("orderStatus")}
                                        onValueChange={(val) => setValue("orderStatus", val as OrderStatus, { shouldDirty: true })}
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
                                        value={watch("paymentStatus")}
                                        onValueChange={(val) => setValue("paymentStatus", val as PaymentStatus, { shouldDirty: true })}
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
                        {selectedOrder?.billingInfo && (
                            <div className="space-y-1 mx-1">
                                <h1 className="text-lg font-semibold mb-1 flex items-center gap-2">Billing Details
                                    <button
                                        type="button"
                                        className="hover:text-primary"
                                        onClick={() => toggleSectionEdit("billing")}
                                    >
                                        <SquarePen />
                                    </button>
                                </h1>

                                {isSectionEditable("billing") ? (
                                    <>
                                        <Input {...register("billingInfo.name")} placeholder="Name" />
                                        <Input {...register("billingInfo.number")} placeholder="Number" />
                                        <Input {...register("billingInfo.address")} placeholder="Address" />
                                        <Input {...register("billingInfo.city")} placeholder="City" />
                                        <Input {...register("billingInfo.postalCode")} placeholder="Postal Code" />
                                    </>
                                ) : (
                                    <>
                                        <p>Name: {selectedOrder?.billingInfo.name}</p>
                                        {selectedOrder?.billingInfo.number && (
                                            <p>Number: {selectedOrder?.billingInfo.number}</p>
                                        )}
                                        <p>Address: {selectedOrder?.billingInfo.address}</p>
                                        <p>City: {selectedOrder?.billingInfo.city}</p>
                                        {selectedOrder?.billingInfo.postalCode && (
                                            <p>Postal Code: {selectedOrder?.billingInfo.postalCode}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <SheetFooter className="flex gap-2 col-span-2 mt-2">
                            <Button type="submit" className="w-full" variant="outline" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                            <Button className="w-full" type="submit" disabled={!isDirty || isLoading}>Save</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};
export default OrdersPage;