import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, User, Menu, X, ChevronRight, Package } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Safe fetch for cart count
  const { data: cart } = useGetCart({
    query: {
      retry: false,
    }
  });

  const cartItemCount = cart?.itemCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md">
        <div className="max-w-[1248px] mx-auto px-4 h-16 flex items-center gap-4 md:gap-8 justify-between">
          
          {/* Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1 hover:bg-white/10 rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex flex-col group">
              <div className="flex items-center gap-2">
                <img 
                  src={`${import.meta.env.BASE_URL}images/logo.png`} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain brightness-0 invert" 
                />
                <span className="font-display font-bold text-xl tracking-tight italic hidden sm:block">
                  Flipkart<span className="text-accent">Clone</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex flex-1 max-w-[550px] relative items-center"
          >
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-12 rounded-sm text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button 
              type="submit" 
              className="absolute right-0 h-full px-3 text-primary hover:text-primary/80 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Nav Links */}
          <nav className="flex items-center gap-2 md:gap-6">
            <Link 
              href="/orders" 
              className="hidden md:flex items-center gap-2 hover:text-white/80 font-medium transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </Link>
            
            <button className="hidden md:flex items-center gap-2 hover:text-white/80 font-medium transition-colors">
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </button>
            
            <Link 
              href="/cart" 
              className="flex items-center gap-2 hover:text-white/80 font-medium transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block">Cart</span>
            </Link>
          </nav>
        </div>

        {/* Mobile Search Bar - Only visible on small screens */}
        <div className="md:hidden px-4 pb-3 bg-primary">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-3 pr-10 rounded-sm text-black text-sm focus:outline-none"
            />
            <button type="submit" className="absolute right-0 h-full px-3 text-primary">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-[70] shadow-2xl flex flex-col md:hidden"
            >
              <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6" />
                  <span className="font-medium">Welcome Guest</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col py-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
                  <span className="font-medium text-gray-800">Home</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
                  <span className="font-medium text-gray-800">My Orders</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100">
                  <span className="font-medium text-gray-800">My Cart</span>
                  <div className="flex items-center gap-2">
                    {cartItemCount > 0 && (
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{cartItemCount}</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-[1248px] mx-auto sm:px-2 md:px-4 sm:py-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#172337] text-gray-300 py-8 border-t mt-auto">
        <div className="max-w-[1248px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[#878787] font-semibold text-xs uppercase mb-4 tracking-wider">About</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#878787] font-semibold text-xs uppercase mb-4 tracking-wider">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cancellation & Returns</a></li>
            </ul>
          </div>
          <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-gray-700 pt-6 md:pt-0 md:pl-8">
            <h4 className="text-[#878787] font-semibold text-xs uppercase mb-4 tracking-wider">Mail Us:</h4>
            <p className="text-sm leading-relaxed">
              Flipkart Clone Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>
        </div>
        <div className="max-w-[1248px] mx-auto px-4 md:px-8 mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; {new Date().getFullYear()} FlipkartClone.com</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Built with React</span>
            <span>Premium UI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
