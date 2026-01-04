import { useEffect, useState } from "react";
import { ArrowUp, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "hooks/useTheme";
import { scrollToTop } from "lib/scroll";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function ScrollToTop() {
  const [theme, toggleTheme] = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const themeIcon = {
      light: <Sun className="h-[1.2rem] w-[1.2rem]" />,
      dark: <Moon className="h-[1.2rem] w-[1.2rem]" />,
      auto: <Laptop className="h-[1.2rem] w-[1.2rem]" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* Theme Switcher */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm border-zinc-700 hover:bg-zinc-800 text-foreground">
             {themeIcon[theme] || <Sun className="h-[1.2rem] w-[1.2rem]" />}
             <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
          <DropdownMenuItem onClick={() => toggleTheme("light")} className="cursor-pointer gap-2 focus:bg-accent focus:text-accent-foreground justify-between">
            <div className="flex items-center gap-2">
               <Sun className="h-4 w-4" /> Sáng
            </div>
            {theme === "light" && <ArrowUp className="h-3 w-3 opacity-0" /> /* Placeholder / Checkmark trick if needed, but better use Check */ }
            {theme === "light" && <span className="h-2 w-2 rounded-full bg-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleTheme("dark")} className="cursor-pointer gap-2 focus:bg-accent focus:text-accent-foreground justify-between">
            <div className="flex items-center gap-2">
               <Moon className="h-4 w-4" /> Tối
            </div>
            {theme === "dark" && <span className="h-2 w-2 rounded-full bg-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleTheme("auto")} className="cursor-pointer gap-2 focus:bg-accent focus:text-accent-foreground justify-between">
             <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4" /> Hệ thống
             </div>
             {theme === "auto" && <span className="h-2 w-2 rounded-full bg-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Scroll To Top */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "rounded-full transition-all duration-300 shadow-lg bg-primary hover:bg-primary/90 text-white border-none",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default ScrollToTop;
