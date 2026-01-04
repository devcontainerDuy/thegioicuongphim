import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Bell, Menu, X, User, Heart, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchForm from "@/components/common/SearchForm";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Phim bộ", href: "/danh-sach-phim?category=danh-sach&sub=phim-bo&page=1" },
  { label: "Phim lẻ", href: "/danh-sach-phim?category=danh-sach&sub=phim-le&page=1" },
  { label: "Hoạt hình", href: "/danh-sach-phim?category=danh-sach&sub=hoat-hinh&page=1" },
  { label: "Danh sách phim", href: "/danh-sach-phim" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const favoriteItems = useSelector((state) => state.favorites.items) || [];
  const favoriteCount = favoriteItems.length;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-500",
        isScrolled 
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm supports-[backdrop-filter]:bg-background/60" 
          : "bg-transparent bg-gradient-to-b from-black/60 to-transparent dark:from-black/80"
      )}
    >
      <div className="px-4 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
                <Film className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-500" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse border-2 border-[#141414]" />
            </div>
            <div className="flex flex-col justify-center">
                <span className={cn(
                    "text-[10px] font-bold tracking-[0.2em] uppercase leading-none ml-0.5",
                    isScrolled ? "text-muted-foreground" : "text-zinc-400"
                )}>
                    Thế Giới
                </span>
                <div className="font-black text-2xl tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600 group-hover:from-red-400 group-hover:to-red-500 transition-all pb-1">
                    Cuồng<span className={cn(isScrolled ? "text-foreground" : "text-white dark:text-foreground")}>Phim</span>
                </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href 
                        ? (isScrolled ? "text-foreground font-bold" : "text-white font-bold") 
                        : (isScrolled ? "text-muted-foreground" : "text-white/70")
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Actions */}
        <div className={cn("flex items-center gap-4", isScrolled ? "text-foreground" : "text-white")}>
          <div className="hidden md:block">
             <SearchForm />
          </div>
          
          {/* Mobile Search Trigger */}
          <button 
            aria-label="Search" 
            className="hover:text-primary transition-colors md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-5 h-5" />
          </button>

          <button aria-label="Notifications" className="hover:text-primary transition-colors hidden md:block">
            <Bell className="w-5 h-5" />
          </button>
          
          <Link to="/danh-sach-yeu-thich" className="relative hover:text-primary transition-colors hidden md:block" aria-label="Favorites">
             <Heart className={cn("w-5 h-5", favoriteCount > 0 && "text-red-500 fill-red-500")} />
             {favoriteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {favoriteCount}
                </span>
             )}
          </Link>
          
          <div className="flex items-center gap-2">
             <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                  <User className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/ca-nhan">Hồ sơ cá nhân</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/ca-nhan">Cài đặt</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn("md:hidden transition-colors", isScrolled ? "text-foreground" : "text-white")}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background p-4 border-b border-border shadow-md animate-in slide-in-from-top-2">
            <div className="relative">
                <SearchForm className="w-full" />
                <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background absolute top-full left-0 w-full p-4 flex flex-col gap-4 border-t border-border shadow-lg">
           {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-foreground/80 hover:text-primary text-base font-medium py-2 border-b border-border/50 last:border-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile Actions */}
             <div className="flex items-center gap-4 mt-2 pt-4 border-t border-border">
                <Link to="/danh-sach-yeu-thich" className="flex items-center gap-2 text-foreground/80 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="w-5 h-5" />
                    <span>Yêu thích ({favoriteCount})</span>
                </Link>
             </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
