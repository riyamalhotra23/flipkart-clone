import { Link } from "wouter";
import { Star } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // If API doesn't provide image, use a beautiful fallback based on category
  // stock electronics product
  const defaultImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
  const imageUrl = product.imageUrl || defaultImage;

  const discount = product.discountPercent 
    || calculateDiscount(product.originalPrice || product.price, product.price);

  return (
    <Link href={`/products/${product.id}`} className="group h-full flex">
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-card w-full flex flex-col sm:rounded-sm border border-border/50 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden"
      >
        {/* Image Container */}
        <div className="relative aspect-square p-4 flex items-center justify-center bg-white overflow-hidden">
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Wishlist Heart could go here */}
        </div>

        {/* Details Container */}
        <div className="p-4 flex flex-col flex-1 gap-1 border-t border-gray-50 bg-white">
          <h3 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            {product.rating ? (
              <span className="inline-flex items-center gap-1 bg-success text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                {product.rating} <Star className="w-3 h-3 fill-current" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[11px] font-bold">
                New
              </span>
            )}
            {product.reviewCount ? (
              <span className="text-[#878787] text-xs font-medium">({product.reviewCount})</span>
            ) : null}
            <img 
               src={`${import.meta.env.BASE_URL}images/logo.png`} 
               alt="Assured" 
               className="h-4 ml-auto object-contain grayscale opacity-50"
            />
          </div>

          <div className="mt-auto pt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-[#878787] line-through decoration-[#878787]">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs sm:text-sm font-bold text-success">
                {discount}% off
              </span>
            )}
          </div>
          
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs text-destructive font-medium mt-1">Only {product.stock} left</span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
