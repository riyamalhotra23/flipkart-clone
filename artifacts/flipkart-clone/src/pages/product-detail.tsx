import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Star, ShoppingCart, Zap, Tag, ShieldCheck, Truck } from "lucide-react";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const { data: product, isLoading, error } = useGetProduct(id, {
    query: { enabled: !!id, retry: false }
  });

  const addToCartMutation = useAddToCart();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex bg-card p-4 rounded-sm shadow-sm w-full min-h-[600px] animate-pulse">
          <div className="w-2/5 flex gap-4">
            <div className="w-16 flex flex-col gap-2"><div className="w-16 h-16 bg-gray-200 rounded"></div></div>
            <div className="flex-1 bg-gray-200 rounded h-[400px]"></div>
          </div>
          <div className="w-3/5 pl-8 flex flex-col gap-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full mt-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button onClick={() => setLocation('/')} className="bg-primary text-white px-6 py-2 rounded-sm font-medium">
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  // Fallback stock image if none provided
  const defaultImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
  const images = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : [defaultImage]);
  const discount = product.discountPercent || calculateDiscount(product.originalPrice || product.price, product.price);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCartMutation.mutate({
      data: { productId: product.id, quantity: 1 }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart.`,
        });
        setIsAdding(false);
      },
      onError: () => {
        toast({
          title: "Failed to add",
          description: "There was a problem adding the item to your cart.",
          variant: "destructive"
        });
        setIsAdding(false);
      }
    });
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate({
      data: { productId: product.id, quantity: 1 }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setLocation('/cart');
      }
    });
  };

  return (
    <Layout>
      <div className="bg-card md:rounded-sm md:shadow-sm flex flex-col md:flex-row w-full overflow-hidden">
        
        {/* Left: Image Gallery & Action Buttons */}
        <div className="w-full md:w-[40%] lg:w-[45%] flex flex-col relative p-4 md:border-r md:sticky top-[64px] h-fit">
          <div className="flex gap-2">
            {/* Thumbnails (Desktop) */}
            <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onMouseEnter={() => setActiveImage(idx)}
                  className={`border-2 rounded-sm overflow-hidden aspect-square ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-1 mix-blend-multiply" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-[4/5] border rounded-sm p-4 flex items-center justify-center group overflow-hidden">
              <img 
                src={images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 cursor-crosshair"
              />
            </div>
          </div>

          {/* Thumbnails (Mobile) */}
          <div className="flex md:hidden gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
             {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`border-2 rounded-sm overflow-hidden aspect-square w-16 shrink-0 ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-1" />
                </button>
              ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#ff9f00] text-white py-4 rounded-sm font-bold text-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5 fill-current" />
              {isAdding ? "ADDING..." : "ADD TO CART"}
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#fb641b] text-white py-4 rounded-sm font-bold text-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <Zap className="w-5 h-5 fill-current" />
              BUY NOW
            </button>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-[60%] lg:w-[55%] p-4 md:p-8 flex flex-col gap-4">
          
          {/* Breadcrumbs */}
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/?categoryId=${product.categoryId}`} className="hover:text-primary">{product.categoryName || 'Category'}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400 truncate">{product.name}</span>
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-medium text-foreground leading-snug">
              {product.brand && <span className="text-gray-500 block text-sm font-bold mb-1">{product.brand}</span>}
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mt-2">
              {product.rating && (
                <span className="flex items-center gap-1 bg-success text-white px-2 py-0.5 rounded text-sm font-bold">
                  {product.rating} <Star className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
              <span className="text-[#878787] text-sm font-medium">
                {product.reviewCount ? `${product.reviewCount.toLocaleString()} Ratings & Reviews` : 'Be the first to review'}
              </span>
            </div>
            
            <div className="text-success text-sm font-bold mt-3">Extra {discount}% off</div>
            <div className="flex items-baseline gap-3 mt-1 flex-wrap">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-[#878787] line-through decoration-[#878787]">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-base font-bold text-success">
                  {discount}% off
                </span>
              )}
            </div>
            
            {product.stock > 0 && product.stock < 10 ? (
              <div className="text-destructive font-medium text-sm mt-2">Hurry, Only {product.stock} left!</div>
            ) : product.stock === 0 ? (
              <div className="text-destructive font-bold text-lg mt-2">Out of Stock</div>
            ) : null}
          </div>

          {/* Offers */}
          <div className="mt-4">
            <h3 className="font-medium text-foreground mb-3">Available offers</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 items-start">
                <Tag className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <p><strong>Bank Offer</strong> 5% Cashback on Flipkart Axis Bank Card <a href="#" className="text-primary font-medium hover:underline">T&C</a></p>
              </li>
              <li className="flex gap-2 items-start">
                <Tag className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <p><strong>Special Price</strong> Get extra {discount}% off (price inclusive of cashback/coupon) <a href="#" className="text-primary font-medium hover:underline">T&C</a></p>
              </li>
            </ul>
          </div>

          {/* Highlights & Services */}
          <div className="mt-6 flex flex-col md:flex-row gap-6 md:gap-12">
            {/* Services */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 text-sm text-foreground">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-500" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-500" />
                <span>Free Delivery</span>
              </div>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="w-full md:w-2/3">
                <h3 className="text-gray-500 font-medium mb-2">Highlights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                  {product.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-xl font-medium mb-4">Product Description</h2>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-medium mb-4">Specifications</h2>
              <div className="border border-gray-200 rounded-sm overflow-hidden">
                {Object.entries(product.specifications).map(([key, val], idx) => (
                  <div key={key} className={`flex text-sm p-3 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="w-1/3 text-gray-500 font-medium">{key}</div>
                    <div className="w-2/3 text-gray-900">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </Layout>
  );
}
