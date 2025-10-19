
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { Loader2, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';

const statusColors = {
  created: "bg-blue-500",
  paid: "bg-yellow-500",
  shipped: "bg-green-500",
  delivered: "bg-purple-500",
  cancelled: "bg-red-500",
};


export default function AdminOrdersPage() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, loadingAuth] = useAuthState(auth);
  const { toast } = useToast();
  
  // This assumes you have superadmin custom claims set up for the user
  const isSuperAdmin = true; // Replace with actual claim check `user?.getIdTokenResult().claims.isSuperadmin`

  const ordersQuery = useMemo(() => 
    db ? query(collection(db, 'orders'), orderBy('createdAt', 'desc')) : undefined,
    [db]
  );
  const [orders, loadingOrders] = useCollectionData(ordersQuery, { idField: 'id' });

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Status Updated", description: `Order ${orderId} has been marked as ${newStatus}.` });
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update the order status." });
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loadingAuth || loadingOrders) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!isSuperAdmin) {
    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
      <div className="text-left mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
          Order Management
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          View and manage all customer orders from the marketplace.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-primary hover:underline">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.userId.slice(0,8)}...</TableCell>
                  <TableCell>{format(order.createdAt.toDate(), 'PPP')}</TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      disabled={updatingStatus === order.id}
                    >
                      <SelectTrigger className="w-[180px]">
                         {updatingStatus === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Set status" />}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusColors).map(status => (
                            <SelectItem key={status} value={status}>
                                <span className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
                                    <span className="capitalize">{status}</span>
                                </span>
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">No orders found.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
