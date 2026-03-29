import { Link, useLocation } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { Trash2, ShieldCheck, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart, isLoading } = useGetCart({
    query: { retry: false }
  });

  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveFromCart();

  const handleUpdateQuantity = (id: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    
    updateItemMutation.mutate({
      id,
      data: { quantity: newQty }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  const handleRemove = (id: number) => {
    removeItemMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Item removed from cart" });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
         <div className="flex flex-col md:flex-row gap-4 p-4 animate-pulse">
           <div className="flex-1 bg-white p-4 h-64 rounded-sm"></div>
           <div className="w-full md:w-80 bg-white p-4 h-64 rounded-sm"></div>
         </div>
      </Layout>
    )
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  // Calculate total discount for summary
  const totalOriginalPrice = items.reduce((acc, item) => {
    const orig = item.product.originalPrice || item.product.price;
    return acc + (orig * item.quantity);
  }, 0);
  const totalDiscount = totalOriginalPrice - (cart?.subtotal || 0);

  return (
    <Layout>
      {!hasItems ? (
        <div className="bg-card w-full p-8 md:p-16 flex flex-col items-center justify-center rounded-sm shadow-sm">
          <img 
            src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" 
            alt="Empty Cart" 
            className="w-48 mb-6"
          />
          <h2 className="text-xl font-medium text-foreground mb-2">Your cart is empty!</h2>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-md">Add items to it now.</p>
          <Link href="/">
            <button className="bg-primary text-white px-16 py-3 rounded-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              Shop now
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
          
          {/* Cart Items List */}
          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="bg-card rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-medium">Flipkart ({cart?.itemCount})</h2>
              </div>
              
              <div className="flex flex-col">
                {items.map((item, idx) => {
                  const product = item.product;
                  const discount = calculateDiscount(product.originalPrice || product.price, product.price);
                  const img = product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80";

                  return (
                    <div key={item.id} className={`p-6 flex flex-col sm:flex-row gap-6 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}>
                      {/* Image & Quantity */}
                      <div className="flex flex-col items-center gap-4 w-full sm:w-[150px] shrink-0">
                        <Link href={`/products/${product.id}`} className="block h-28 w-full">
                          <img src={img} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </Link>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updateItemMutation.isPending}
                            className="w-7 h-7 rounded-full border flex items-center justify-center disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="w-10 h-7 border flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={product.stock <= item.quantity || updateItemMutation.isPending}
                            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col">
                        <Link href={`/products/${product.id}`} className="font-medium text-foreground hover:text-primary transition-colors text-base line-clamp-1">
                          {product.name}
                        </Link>
                        {product.brand && <span className="text-sm text-gray-500 mt-1">{product.brand}</span>}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-500 text-sm line-through">
                            {product.originalPrice ? formatCurrency(product.originalPrice) : formatCurrency(product.price)}
                          </span>
                          <span className="text-xl font-bold text-foreground">
                            {formatCurrency(product.price)}
                          </span>
                          {discount > 0 && <span className="text-success text-sm font-bold">{discount}% Off</span>}
                        </div>

                        <div className="mt-4 flex items-center gap-6 mt-auto">
                          <button 
                            className="text-base font-medium text-foreground hover:text-primary transition-colors uppercase"
                          >
                            Save for later
                          </button>
                          <button 
                            onClick={() => handleRemove(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-base font-medium text-foreground hover:text-destructive transition-colors uppercase flex items-center gap-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Delivery Estimate */}
                      <div className="hidden md:block w-[200px] text-sm text-foreground">
                        <span className="flex items-center gap-1">
                          Delivery by Tomorrow | <span className="text-success font-medium text-xs">Free</span> 
                          <span className="line-through text-gray-400 text-xs ml-1">₹40</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Place Order CTA Bar */}
              <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-2px_10px_0_rgba(0,0,0,0.05)] sticky bottom-0 z-10 flex justify-end">
                <Link href="/checkout">
                  <button className="bg-[#fb641b] text-white px-10 py-3.5 rounded-sm font-bold text-base shadow-sm hover:shadow-md w-full sm:w-auto">
                    PLACE ORDER
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="w-full lg:w-[350px] shrink-0 sticky top-[80px]">
            <div className="bg-card rounded-sm shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="uppercase text-gray-500 font-medium text-sm">Price Details</h3>
              </div>
              
              <div className="p-6 flex flex-col gap-4 text-sm md:text-base">
                <div className="flex justify-between">
                  <span>Price ({cart?.itemCount} items)</span>
                  <span>{formatCurrency(totalOriginalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-success">- {formatCurrency(totalDiscount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-success">
                    {cart?.deliveryCharge === 0 ? (
                      <><span className="line-through text-gray-400 mr-1">₹40</span>Free</>
                    ) : formatCurrency(cart?.deliveryCharge || 0)}
                  </span>
                </div>
                
                <div className="border-t border-dashed border-gray-300 my-2 pt-4 flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(cart?.total || 0)}</span>
                </div>
                
                {totalDiscount > 0 && (
                  <div className="text-success font-medium text-sm border-t border-dashed border-gray-300 pt-4">
                    You will save {formatCurrency(totalDiscount)} on this order
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 px-4 text-[#878787] text-sm">
              <ShieldCheck className="w-8 h-8 text-gray-400" />
              <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
}
