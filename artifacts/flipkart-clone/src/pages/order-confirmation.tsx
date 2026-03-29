import { useRoute, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { CheckCircle, Package, Truck, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const [, params] = useRoute("/orders/:id");
  const id = Number(params?.id);

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4">
        
        {/* Success Banner */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-sm shadow-sm p-8 flex flex-col items-center justify-center text-center border-t-4 border-success"
        >
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4 text-success">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Order placed successfully!</h1>
          <p className="text-gray-500 mb-6">
            Your order <span className="font-bold text-foreground">#{order.id}</span> has been confirmed.
          </p>
          <Link href="/">
            <button className="bg-primary text-white px-8 py-2.5 rounded-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              Continue Shopping
            </button>
          </Link>
        </motion.div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Items */}
          <div className="md:col-span-2 bg-card rounded-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-medium">Items in this order</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map(item => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="w-20 h-20 shrink-0">
                    <img 
                      src={item.productImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80"} 
                      alt={item.productName} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{item.productName}</span>
                    <span className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</span>
                    <span className="font-bold text-foreground mt-2">{formatCurrency(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium">Delivery Address</h3>
              </div>
              <div className="p-6 text-sm text-foreground">
                <span className="font-bold block mb-1">{order.shippingAddress.fullName}</span>
                <p className="text-gray-600 mb-2">
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2},`}
                  <br/>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <div className="flex items-center gap-2 mt-4 font-medium">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-gray-600">Phone: {order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-sm shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-success">{order.deliveryCharge === 0 ? 'Free' : formatCurrency(order.deliveryCharge)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
