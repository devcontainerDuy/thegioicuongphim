import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, History, TrendingUp, X, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import movieService from "@/services/movieService";

const SearchForm = ({ trigger }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("search_history")) || [];
        } catch {
            return [];
        }
    });

    const navigate = useNavigate();
    const debounceRef = useRef(null);
    const inputRef = useRef(null);

    // Load suggestions ONLY when dialog opens to save API calls
    useEffect(() => {
        if (open && suggestions.length === 0) {
            const fetchSuggestions = async () => {
                setSuggestionsLoading(true);
                try {
                     // Using 'phim-moi-cap-nhat' as "Trending" replacement
                    const data = await movieService.getFilms("phim-moi-cap-nhat"); 
                    if (data?.items) {
                        setSuggestions(data.items.slice(0, 5));
                    }
                } catch (error) {
                    console.error("Failed to load suggestions:", error);
                } finally {
                    setSuggestionsLoading(false);
                }
            };
            fetchSuggestions();
        }
    }, [open, suggestions.length]);

    // Handle Search Logic
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const response = await movieService.searchFilms(searchTerm.trim());
                setSearchResults(response.data?.items || []);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceRef.current);
    }, [searchTerm]);

    // Focus input on open
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchTerm(""); // Reset on close? Optional.
        }
    }, [open]);

    const addToHistory = (keyword) => {
        const normalized = keyword.trim();
        if (!normalized) return;
        
        const newHistory = [normalized, ...history.filter(h => h !== normalized)].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("search_history", JSON.stringify(newHistory));
    };

    const handleNavigate = (path, keyword) => {
        if (keyword) addToHistory(keyword);
        navigate(path);
        setOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if(!searchTerm.trim()) return;
        handleNavigate(`/tim-kiem?keyword=${searchTerm}`, searchTerm);
    };

    const removeHistoryItem = (e, item) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h !== item);
        setHistory(newHistory);
        localStorage.setItem("search_history", JSON.stringify(newHistory));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <button 
                        className="hover:text-white/80 transition-colors flex items-center justify-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5 text-white" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-[#0f0f0f] border-zinc-800 text-white overflow-hidden shadow-2xl">
                {/* Search Header */}
                <div className="flex items-center border-b border-zinc-800 p-4 gap-3 bg-zinc-900/50">
                    <Search className="w-5 h-5 text-zinc-400" />
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                        <input
                            ref={inputRef}
                            className="w-full bg-transparent border-none text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                            placeholder="Tìm kiếm phim, diễn viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    
                    {/* CASE 1: SEARCHING */}
                    {searchTerm.trim() ? (
                        <div className="space-y-2">
                             {loading ? (
                                <div className="flex items-center justify-center py-8 text-zinc-500">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    Đang tìm kiếm...
                                </div>
                             ) : searchResults.length > 0 ? (
                                <>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Kết quả tìm kiếm</p>
                                    <div className="grid gap-2">
                                        {searchResults.slice(0, 5).map(film => (
                                            <div 
                                                key={film.slug}
                                                onClick={() => handleNavigate(`/phim/${film.slug}`, searchTerm)}
                                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer group transition-colors"
                                            >
                                                <div className="w-12 h-16 bg-zinc-800 rounded overflow-hidden shrink-0">
                                                    <img src={film.thumb_url} alt={film.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors truncate">{film.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                        <span>{film.year || "N/A"}</span>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[150px]">{film.origin_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleSearchSubmit}
                                        className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-primary font-medium hover:bg-zinc-800/50 rounded-lg transition-colors"
                                    >
                                        Xem tất cả kết quả ({searchResults.length}+) <ArrowRight className="w-4 h-4" />
                                    </button>
                                </>
                             ) : (
                                 <div className="text-center py-10 text-zinc-500">
                                     <p>Không tìm thấy phim nào cho "{searchTerm}"</p>
                                 </div>
                             )}
                        </div>
                    ) : (
                        /* CASE 2: DEFAULT VIEW (History + Suggestions) */
                        <div className="space-y-6">
                            {/* History */}
                            {history.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
                                            <History className="w-4 h-4" /> Lịch sử tìm kiếm
                                        </h3>
                                        {history.length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    setHistory([]);
                                                    localStorage.removeItem("search_history");
                                                }}
                                                className="text-xs text-zinc-600 hover:text-red-500 transition-colors"
                                            >
                                                Xóa tất cả
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {history.map(item => (
                                            <div 
                                                key={item}
                                                onClick={() => setSearchTerm(item)}
                                                className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm rounded-full cursor-pointer transition-colors border border-transparent hover:border-zinc-700"
                                            >
                                                <span>{item}</span>
                                                <X 
                                                    className="w-3 h-3 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => removeHistoryItem(e, item)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            <div>
                                <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-4 h-4 text-primary" /> Phim đề cử
                                </h3>
                                {suggestionsLoading ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-zinc-800/50 rounded animate-pulse" />)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {suggestions.map(film => (
                                            <div 
                                                key={film.slug}
                                                onClick={() => handleNavigate(`/phim/${film.slug}`, film.name)}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/30 cursor-pointer group transition-colors border border-transparent hover:border-zinc-800"
                                            >
                                                 <div className="w-10 h-14 bg-zinc-800 rounded overflow-hidden shrink-0 relative">
                                                    <img src={film.thumb_url} alt={film.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-zinc-200 group-hover:text-primary transition-colors truncate">{film.name}</h4>
                                                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{film.original_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchForm;
