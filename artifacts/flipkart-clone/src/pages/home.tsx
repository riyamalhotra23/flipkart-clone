import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { ChevronRight, Filter, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("search") || undefined;
  const initialCategory = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;

  const [categoryId, setCategoryId] = useState<number | undefined>(initialCategory);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Update category when URL changes
  useEffect(() => {
    if (initialCategory !== categoryId) {
      setCategoryId(initialCategory);
    }
  }, [initialCategory]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategories({
    query: { retry: false }
  });

  const { data: productsData, isLoading: isLoadingProducts } = useListProducts({
    search: searchQuery,
    categoryId,
    minPrice,
    maxPrice,
  }, {
    query: { retry: false }
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const products = Array.isArray(productsData?.products) ? productsData.products : [];

  const handleCategorySelect = (id?: number) => {
    setCategoryId(id);
    setIsMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setCategoryId(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    if (searchQuery) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate')); // trigger re-render if using wouter correctly, or just let wouter handle it
    }
  };

  const FilterContent = () => (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h3 className="font-medium text-sm uppercase text-gray-500 mb-3 tracking-wider">Categories</h3>
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => handleCategorySelect(undefined)}
            className={`text-left px-2 py-1.5 rounded-sm text-sm transition-colors ${!categoryId ? 'bg-blue-50 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`text-left px-2 py-1.5 rounded-sm text-sm transition-colors ${categoryId === cat.id ? 'bg-blue-50 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-sm uppercase text-gray-500 mb-3 tracking-wider">Price Range</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full px-2 py-1.5 border rounded-sm text-sm"
            value={minPrice || ''}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-gray-400">to</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full px-2 py-1.5 border rounded-sm text-sm"
            value={maxPrice || ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>
      
      {(categoryId || minPrice || maxPrice || searchQuery) && (
        <button 
          onClick={clearFilters}
          className="mt-4 text-primary text-sm font-medium hover:underline text-left"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Category Banner (Desktop) */}
      {!isLoadingCategories && categories.length > 0 && (
        <div className="bg-card w-full mb-4 shadow-sm hidden md:block">
          <div className="flex items-center justify-center gap-8 py-3 px-4 max-w-5xl mx-auto overflow-x-auto no-scrollbar">
            {categories.slice(0, 8).map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex flex-col items-center gap-1 group whitespace-nowrap min-w-[64px] ${categoryId === cat.id ? 'text-primary' : 'text-gray-800'}`}
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden group-hover:shadow-md transition-all p-2">
                  <img 
                    src={cat.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80"} 
                    alt={cat.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <span className="text-[13px] font-medium group-hover:text-primary transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 bg-card border border-border/50 rounded-sm shadow-sm self-start sticky top-20">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-foreground">Filters</h2>
          </div>
          <FilterContent />
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 bg-card md:border border-border/50 md:rounded-sm md:shadow-sm flex flex-col">
          
          {/* Mobile Filter Toggle & Search Info */}
          <div className="p-4 border-b flex items-center justify-between sticky top-[60px] md:static bg-white z-10">
            <div>
              {searchQuery ? (
                <h1 className="text-lg font-medium">
                  Showing results for "<span className="font-bold">{searchQuery}</span>"
                </h1>
              ) : categoryId ? (
                <h1 className="text-lg font-bold capitalize">
                  {categories.find(c => c.id === categoryId)?.name || 'Products'}
                </h1>
              ) : (
                <h1 className="text-lg font-bold">All Products</h1>
              )}
              <span className="text-sm text-gray-500 block mt-0.5">(Showing {products.length} products)</span>
            </div>
            
            <button 
              className="md:hidden flex items-center gap-2 border px-3 py-1.5 rounded-sm text-sm font-medium"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 bg-gray-100 p-0.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-4 h-[320px] flex flex-col gap-4 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-sm"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/3 h-6 bg-gray-200 rounded mt-auto"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 bg-gray-100 border-t md:border-t-0 border-gray-100">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <img 
                src={`${import.meta.env.BASE_URL}images/logo.png`} 
                alt="No results" 
                className="w-32 h-32 opacity-20 mb-6 grayscale"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sorry, no results found!</h2>
              <p className="text-gray-500 mb-6">Please check the spelling or try searching for something else</p>
              <button 
                onClick={clearFilters}
                className="bg-primary text-white px-6 py-2 rounded-sm font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full flex flex-col animate-in slide-in-from-right">
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterContent />
            </div>
            <div className="p-4 border-t flex gap-2 bg-white">
              <button 
                onClick={clearFilters}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-sm"
              >
                Clear
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-secondary text-white font-medium rounded-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
