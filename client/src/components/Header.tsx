import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white py-4 shadow-md"
          : "bg-transparent py-8"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary flex items-center gap-2 justify-center md:justify-start">
            <span className="text-sky-300">☁️</span>
            The Unsent Project
          </h1>

          <p className="text-muted-foreground mt-1 font-sans text-xs font-bold tracking-widest uppercase">
            A personal Vendetta
          </p>
        </div>

        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-sky-300 group-focus-within:text-sky-400 transition-colors">
            <Search className="h-5 w-5" />
          </div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a name..."
            className="pl-12 h-12 rounded-full border-2 border-sky-100 bg-white hover:bg-white focus:bg-white focus:border-sky-300 transition-all duration-300 font-medium text-lg text-black placeholder:text-gray-400"
          />
        </div>
      </div>
    </header>
  );
}
