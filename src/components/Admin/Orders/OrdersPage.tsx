'use client';

import { useState } from 'react';
import OrderTable from './OrderTable';
import OrderViewSheet from './OrderViewSheet';
import OrderEditDialog from './OrderEditDialog';
import { Order } from '@/types';

// Props for the OrdersPage component
type OrdersPageProps = {
  orders: Order[];
};

// Main component to orchestrate orders table, view sheet, and edit dialog
const OrdersPage: React.FC<OrdersPageProps> = ({ orders }) => {
  // --- State ---
  const [allOrders, setAllOrders] = useState<Order[]>(orders); // All orders for table
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Selected order for view/edit
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Edit dialog open state

  // --- Logic ---
  // Handle view order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditDialogOpen(false);
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  // --- Rendering ---
  return (
    <>
      <OrderTable
        orders={allOrders}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        setAllOrders={setAllOrders}
      />
      <OrderViewSheet
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        setAllOrders={setAllOrders}
        onEditOrder={handleEditOrder}
      />
      <OrderEditDialog
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        setAllOrders={setAllOrders}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default OrdersPage;