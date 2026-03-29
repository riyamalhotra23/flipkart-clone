import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { formatCurrency } from "@/lib/utils";
import { Package, ChevronRight, CircleDot } from "lucide-react";
import { format } from "date-fns"; // Standard in JS without external lib if written simply, but date-fns is standard in these stacks. I'll use standard JS Date to be safe without the package.

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', month: 'short', day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

export default function Orders() {
  const { data: orders, isLoading } = useListOrders({
    query: { retry: false }
  });

  return (
    <Layout>
      <div className="w-full flex flex-col md:flex-row gap-4">
        
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 bg-card rounded-sm shadow-sm self-start">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Hello,</div>
              <div className="font-bold text-foreground">Guest User</div>
            </div>
          </div>
          <div className="p-2">
            <div className="px-4 py-3 bg-blue-50 text-primary font-medium flex items-center justify-between rounded-sm cursor-pointer">
              <span>My Orders</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 flex items-center justify-between rounded-sm cursor-pointer transition-colors mt-1">
              <span>Account Settings</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="bg-card rounded-sm shadow-sm overflow-hidden min-h-[500px]">
            
            {isLoading ? (
              <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !orders || orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <Package className="w-24 h-24 text-gray-200 mb-4" />
                <h2 className="text-xl font-medium mb-2">No Orders Found</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                <Link href="/">
                  <button className="bg-primary text-white px-8 py-2.5 rounded-sm font-medium">Start Shopping</button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {/* We map items to individual rows to match Flipkart style where each item is a distinct block in the order list */}
                {orders.flatMap(order => 
                  order.items.map(item => (
                    <Link key={`${order.id}-${item.id}`} href={`/orders/${order.id}`}>
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow cursor-pointer bg-white group">
                        
                        <div className="w-20 h-20 shrink-0">
                          <img 
                            src={item.productImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80"} 
                            alt={item.productName}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
                          
                          <div className="flex-1 max-w-sm">
                            <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                              {item.productName}
                            </h3>
                            <div className="text-sm text-gray-500 mt-1">Order #{order.id}</div>
                          </div>
                          
                          <div className="font-bold text-foreground w-24">
                            {formatCurrency(item.price)}
                          </div>
                          
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 font-medium">
                              <CircleDot className="w-3 h-3 text-success fill-success" />
                              <span className="text-foreground capitalize">{order.status} on {formatDate(order.createdAt)}</span>
                            </div>
                            <span className="text-sm text-gray-500 mt-1 ml-5">
                              Your item has been delivered
                            </span>
                          </div>
                        </div>
                        
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </Layout>
  );
}
