import { useState, useMemo, useEffect } from "react";
import { 
  LayoutDashboard, 
  Tv, 
  Film, 
  Gamepad2, 
  Trophy, 
  Star, 
  History, 
  Settings, 
  Search, 
  Grid2X2, 
  List, 
  Moon, 
  Sun,
  ChevronRight,
  Zap,
  Radio,
  Play,
  Info,
  Menu,
  X
} from "lucide-react";
import { usePlaylists } from "./hooks/use-playlists";
import { Channel } from "./lib/m3u-parser";
import { VideoPlayer } from "./components/VideoPlayer";
import { cn } from "./lib/utils";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Toaster, toast } from "sonner";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet";

function App() {
  const { channels, loading, error, activePlaylist, setActivePlaylist, refresh } = usePlaylists();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<Channel[]>(() => {
    const saved = localStorage.getItem("history");
    return saved ? JSON.parse(saved) : [];
  });
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(channels.map(c => c.category || "General"));
    return ["All", ...Array.from(cats).slice(0, 15)];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm) || 
        c.category.toLowerCase().includes(searchTerm);
      
      const matchesCategory = activeCategory === "All" || 
        c.category === activeCategory || 
        (activeCategory === "Movies" && c.category.toLowerCase().includes("movie")) ||
        (activeCategory === "Live TV" && (c.category.toLowerCase().includes("news") || c.category.toLowerCase().includes("general"))) ||
        (activeCategory === "Anime" && c.category.toLowerCase().includes("anime")) ||
        (activeCategory === "Sports" && c.category.toLowerCase().includes("sport"));

      return matchesSearch && matchesCategory;
    });
  }, [channels, search, activeCategory]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      toast.success(prev.includes(id) ? "Removed from favorites" : "Added to favorites");
      return next;
    });
  };

  const playChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setHistory(prev => {
      const filtered = prev.filter(h => h.url !== channel.url);
      const next = [channel, ...filtered].slice(0, 20);
      localStorage.setItem("history", JSON.stringify(next));
      return next;
    });
    // Scroll to player on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSidebarClick = (label: string) => {
    if (label === "Dashboard") {
      setActiveCategory("All");
      setSearch("");
      setSelectedChannel(null);
    } else if (label === "Favorites") {
      // Logic for favorites filter
      const favChannels = channels.filter(c => favorites.includes(c.id));
      // We'll just set a special search/category state or handle it in filteredChannels
      setActiveCategory("Favorites");
    } else if (label === "History") {
      setActiveCategory("History");
    } else {
      setActiveCategory(label);
    }
    setIsMobileMenuOpen(false);
  };

  // Actual filtered logic for Favorites and History
  const finalChannels = useMemo(() => {
    if (activeCategory === "Favorites") {
      return channels.filter(c => favorites.includes(c.id));
    }
    if (activeCategory === "History") {
      return history;
    }
    return filteredChannels;
  }, [filteredChannels, activeCategory, favorites, history, channels]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
          <Zap className="text-white w-6 h-6 fill-white" />
        </div>
        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          RX STREAM
        </span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 py-4">
          <div className="space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeCategory === "All"} 
              onClick={() => handleSidebarClick("Dashboard")}
            />
            <SidebarItem 
              icon={<Tv size={20} />} 
              label="Live TV" 
              active={activeCategory === "Live TV"}
              onClick={() => handleSidebarClick("Live TV")}
            />
            <SidebarItem 
              icon={<Film size={20} />} 
              label="Movies" 
              active={activeCategory === "Movies"}
              onClick={() => handleSidebarClick("Movies")}
            />
            <SidebarItem 
              icon={<Gamepad2 size={20} />} 
              label="Anime" 
              active={activeCategory === "Anime"}
              onClick={() => handleSidebarClick("Anime")}
            />
            <SidebarItem 
              icon={<Trophy size={20} />} 
              label="Sports" 
              active={activeCategory === "Sports"}
              onClick={() => handleSidebarClick("Sports")}
            />
          </div>

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Library</h3>
            <div className="space-y-1">
              <SidebarItem 
                icon={<Star size={20} />} 
                label="Favorites" 
                count={favorites.length} 
                active={activeCategory === "Favorites"}
                onClick={() => handleSidebarClick("Favorites")}
              />
              <SidebarItem 
                icon={<History size={20} />} 
                label="History" 
                count={history.length} 
                active={activeCategory === "History"}
                onClick={() => handleSidebarClick("History")}
              />
            </div>
          </div>

          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Playlist Source</h3>
            <select 
              value={activePlaylist}
              onChange={(e) => setActivePlaylist(e.target.value as any)}
              className="mx-4 w-[calc(100%-32px)] bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none text-white"
            >
              <option value="roku">Roku Channels</option>
              <option value="tubi">Tubi TV</option>
              <option value="free">International Free-TV</option>
            </select>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/5">
        <SidebarItem icon={<Settings size={20} />} label="Settings" onClick={() => toast.info("Settings coming soon")} />
      </div>
    </div>
  );

  return (
    <div className={cn("flex h-screen overflow-hidden font-sans", isDark ? "dark bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900")}>
      <Toaster position="top-right" theme={isDark ? "dark" : "light"} />
      
      {/* Desktop Sidebar */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4 flex-1">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-400">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-[#0a0a0a] border-white/10">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              <Input 
                placeholder="Search channels..." 
                className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 hidden sm:flex">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-cyan-500 text-white shadow-lg" : "text-gray-400 hover:text-white")}
              >
                <Grid2X2 size={18} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-cyan-500 text-white shadow-lg" : "text-gray-400 hover:text-white")}
              >
                <List size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {selectedChannel ? (
              <div className="space-y-4">
                <VideoPlayer 
                  url={selectedChannel.url} 
                  title={selectedChannel.name}
                  onReport={() => toast.info("Reported channel: " + selectedChannel.name)}
                />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedChannel.name}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                        <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE
                      </Badge>
                      <span className="text-gray-400 text-sm">Category: {selectedChannel.category}</span>
                      <span className="text-gray-400 text-sm md:block hidden">• Source: {selectedChannel.playlistName}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5 flex-1 md:flex-none"
                      onClick={() => toggleFavorite(selectedChannel.id)}
                    >
                      <Star className={cn("w-4 h-4 mr-2", favorites.includes(selectedChannel.id) && "fill-yellow-400 text-yellow-400")} />
                      Favorite
                    </Button>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 flex-1 md:flex-none" onClick={() => setSelectedChannel(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-[300px] md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=2000" 
                  className="w-full h-full object-cover brightness-50"
                  alt="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 max-w-2xl space-y-2 md:space-y-4">
                  <Badge className="bg-purple-600 text-white border-none">FEATURED STREAM</Badge>
                  <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-none">Experience Unlimited Entertainment</h2>
                  <p className="text-lg md:text-xl text-gray-300 line-clamp-2 md:line-clamp-none">Stream thousands of live TV channels, movies, and series from around the globe. Free, fast, and in HD.</p>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold h-10 md:h-12 px-6 md:px-8 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                    Start Watching Now
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard label="Channels" value={channels.length} icon={<Tv className="text-cyan-400" />} />
              <StatCard label="Live Now" value={Math.floor(channels.length * 0.9)} icon={<Radio className="text-purple-400" />} />
              <StatCard label="Favorites" value={favorites.length} icon={<Star className="text-yellow-400" />} />
              <StatCard label="Recent" value={history.length} icon={<History className="text-blue-400" />} />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                    activeCategory === cat 
                      ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Channel List */}
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  {activeCategory === "All" ? "Recommended for You" : activeCategory}
                  <ChevronRight size={20} className="text-gray-500" />
                </h3>
                <span className="text-xs md:text-sm text-gray-500">{finalChannels.length} channels found</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button onClick={refresh}>Try Again</Button>
                </div>
              ) : finalChannels.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-gray-400">No channels found in this category.</p>
                  <Button variant="link" className="text-cyan-500" onClick={() => setActiveCategory("All")}>Back to All</Button>
                </div>
              ) : (
                <div className={cn(
                  viewMode === "grid" 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6" 
                    : "space-y-3"
                )}>
                  {finalChannels.slice(0, 100).map(channel => (
                    <ChannelCard 
                      key={channel.id} 
                      channel={channel} 
                      viewMode={viewMode}
                      isFavorite={favorites.includes(channel.id)}
                      onToggleFavorite={() => toggleFavorite(channel.id)}
                      onPlay={() => playChannel(channel)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, count, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  count?: number,
  onClick?: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
        active ? "bg-cyan-500/10 text-cyan-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("transition-colors", active ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400")}>{icon}</span>
        <span className="font-medium text-white">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg md:text-xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ChannelCard({ channel, viewMode, isFavorite, onToggleFavorite, onPlay }: { 
  channel: Channel, 
  viewMode: "grid" | "list", 
  isFavorite: boolean,
  onToggleFavorite: () => void,
  onPlay: () => void
}) {
  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
        <div onClick={onPlay} className="flex-1 flex items-center gap-4">
          <div className="w-16 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`;
              }}
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold group-hover:text-cyan-400 transition-colors text-white truncate">{channel.name}</h4>
            <p className="text-xs text-gray-500 truncate">{channel.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/5 text-gray-400 border-none hidden sm:inline-flex">{channel.playlistName}</Badge>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={cn("p-2 rounded-lg hover:bg-white/10 transition-colors", isFavorite ? "text-yellow-400" : "text-gray-500")}
          >
            <Star className={cn("w-5 h-5", isFavorite && "fill-yellow-400")} />
          </button>
          <button onClick={onPlay} className="p-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors">
            <Play className="w-4 h-4 fill-black" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onPlay}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      <div className="aspect-video bg-black relative">
        <img 
          src={channel.logo} 
          alt={channel.name} 
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channel.name)}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 md:w-6 md:h-6 fill-black ml-1" />
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all",
            isFavorite ? "bg-yellow-400 text-black" : "bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100"
          )}
        >
          <Star className={cn("w-4 h-4", isFavorite && "fill-black")} />
        </button>
      </div>
      <div className="p-3 md:p-4">
        <h4 className="font-bold truncate group-hover:text-cyan-400 transition-colors text-white text-sm md:text-base">{channel.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 tracking-wider truncate mr-2">{channel.category}</span>
          <Badge className="text-[8px] md:text-[9px] bg-white/5 text-gray-400 border-none px-1.5 h-3.5 md:h-4 flex-shrink-0">{channel.playlistName}</Badge>
        </div>
      </div>
    </div>
  );
}

export default App;