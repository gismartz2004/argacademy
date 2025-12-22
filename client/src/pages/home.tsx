import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Star, Trophy, Shirt, Play, Code, Cpu, CheckCircle, ChevronRight, ChevronLeft, Map, Users } from "lucide-react";
import mapBg1 from "@assets/generated_images/futuristic_tech_city_game_map_background.png";
import mapBg2 from "@assets/generated_images/mars_robotics_base_game_map.png";
import robotBlue from "@assets/generated_images/cute_blue_robot_avatar.png";
import robotRed from "@assets/generated_images/cool_red_robot_avatar.png";
import robotGold from "@assets/generated_images/gold_master_robot_avatar.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock Data
const ranks = [
  { name: "Bronce", color: "text-[hsl(30,60%,50%)]", bg: "bg-[hsl(30,60%,50%)]", border: "border-[hsl(30,60%,50%)]", minXp: 0 },
  { name: "Plata", color: "text-[hsl(210,10%,70%)]", bg: "bg-[hsl(210,10%,70%)]", border: "border-[hsl(210,10%,70%)]", minXp: 500 },
  { name: "Oro", color: "text-[hsl(45,90%,55%)]", bg: "bg-[hsl(45,90%,55%)]", border: "border-[hsl(45,90%,55%)]", minXp: 1500 },
  { name: "Platino", color: "text-[hsl(180,30%,70%)]", bg: "bg-[hsl(180,30%,70%)]", border: "border-[hsl(180,30%,70%)]", minXp: 3000 },
  { name: "Diamante", color: "text-[hsl(200,80%,60%)]", bg: "bg-[hsl(200,80%,60%)]", border: "border-[hsl(200,80%,60%)]", minXp: 5000 },
  { name: "Maestro", color: "text-[hsl(280,90%,40%)]", bg: "bg-[hsl(280,90%,40%)]", border: "border-[hsl(280,90%,40%)]", minXp: 10000 },
];

const worlds = [
  {
    id: 1,
    name: "Ciudad Código",
    description: "Domina la lógica del software",
    bg: mapBg1,
    pathColor: "stroke-blue-400",
    levels: [
      { id: 1, x: 20, y: 80, name: "Fundamentos Python", type: "software", status: "completed", xp: 100, desc: "Variables y Tipos" },
      { id: 2, x: 35, y: 65, name: "Lógica Booleana", type: "software", status: "completed", xp: 150, desc: "True, False y Operadores" },
      { id: 3, x: 50, y: 50, name: "Bucles Infinitos", type: "software", status: "unlocked", xp: 200, desc: "While y For Loops" },
      { id: 4, x: 70, y: 35, name: "Funciones", type: "software", status: "locked", xp: 250, desc: "Modularización" },
      { id: 5, x: 85, y: 20, name: "Boss: Algoritmo", type: "boss", status: "locked", xp: 500, desc: "Ordenamiento de Datos" },
    ]
  },
  {
    id: 2,
    name: "Base Marte",
    description: "Ingeniería Robótica Avanzada",
    bg: mapBg2, // Placeholder until image generates
    pathColor: "stroke-orange-500",
    levels: [
      { id: 6, x: 15, y: 25, name: "Circuitos DC", type: "robotics", status: "locked", xp: 300, desc: "Ley de Ohm" },
      { id: 7, x: 30, y: 40, name: "Microcontroladores", type: "robotics", status: "locked", xp: 350, desc: "Arduino Básico" },
      { id: 8, x: 50, y: 60, name: "Sensores IR", type: "robotics", status: "locked", xp: 400, desc: "Detección de Obstáculos" },
      { id: 9, x: 70, y: 70, name: "Motores & PWM", type: "robotics", status: "locked", xp: 450, desc: "Control de Movimiento" },
      { id: 10, x: 90, y: 80, name: "Boss: Rover", type: "boss", status: "locked", xp: 1000, desc: "Navegación Autónoma" },
    ]
  }
];

const leaderboard = [
  { rank: 1, name: "TechMaster99", xp: 12500, avatar: robotGold, tier: 5 },
  { rank: 2, name: "CodeNinja", xp: 11200, avatar: robotRed, tier: 5 },
  { rank: 3, name: "RoboGirl", xp: 9800, avatar: robotBlue, tier: 4 },
  { rank: 4, name: "CircuitBreaker", xp: 8500, avatar: robotRed, tier: 4 },
  { rank: 5, name: "PythonPro", xp: 7200, avatar: robotBlue, tier: 3 },
];

const skins = [
  { id: "blue", name: "RoboBlue", src: robotBlue, price: 0, owned: true },
  { id: "red", name: "RedGamer", src: robotRed, price: 500, owned: false },
  { id: "gold", name: "GoldenMaster", src: robotGold, price: 2000, owned: false },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const worldIdParam = searchParams.get("world");

  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [activeLevelContent, setActiveLevelContent] = useState<any[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Fetch World Info
  const { data: dbWorlds = [], isLoading: worldsLoading } = useQuery({
    queryKey: ["/api/worlds"],
    queryFn: async () => {
      const res = await fetch("/api/worlds");
      if (!res.ok) throw new Error("Failed to fetch worlds");
      return res.json();
    }
  });

  // Loading State
  if (worldsLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando Universos...</div>;
  }

  // Determine active world
  const worldId = worldIdParam ? parseInt(worldIdParam) : (dbWorlds.length > 0 ? dbWorlds[0].id : 0);
  const selectedWorld = dbWorlds.find((w: any) => w.id === worldId);
  const effectiveWorld = selectedWorld || dbWorlds[0];
  const worldName = effectiveWorld ? effectiveWorld.name : "Mundo Desconocido";
  const worldSlug = effectiveWorld ? effectiveWorld.slug : "earth";

  // Debug Query: Fetch all content for this world
  const { data: allContent = [] } = useQuery({
    queryKey: [`/api/worlds/${effectiveWorld?.id}/content`],
    queryFn: async () => {
      if (!effectiveWorld?.id) return [];
      const res = await fetch(`/api/worlds/${effectiveWorld.id}/content`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!effectiveWorld?.id
  });

  // Skin Selection Logic
  const selectedSkin = skins.find(s => s.id === user?.avatarSkinId) || skins[0];

  // Map DB World to Visual Theme
  // If slug contains 'mars' -> Mars theme
  // If slug contains 'earth' or 'tierra' -> Earth/City theme
  // Default to index based rotation

  let visualTheme;
  const slugLower = worldSlug.toLowerCase();

  if (slugLower.includes('marte') || slugLower.includes('mars')) {
    visualTheme = worlds[1]; // Base Marte
  } else if (slugLower.includes('tierra') || slugLower.includes('earth')) {
    visualTheme = worlds[0]; // Ciudad Código (Earth-like)
  } else {
    visualTheme = worlds[dbWorlds.findIndex((w: any) => w.id === effectiveWorld?.id) % worlds.length];
  }

  // Filter content for the active level whenever it or total content changes
  useEffect(() => {
    if (activeLevel && allContent) {
      const filtered = allContent.filter((c: any) => c.level === activeLevel.relativeId);
      setActiveLevelContent(filtered);
    } else {
      setActiveLevelContent([]);
    }
  }, [activeLevel, allContent]);

  // Generate Levels layout
  // We need to know the *index* of the current world in the user's progression or DB list.
  const worldIndex = dbWorlds.findIndex((w: any) => w.id === effectiveWorld?.id);
  // Ensure we don't get -1
  const safeWorldIndex = worldIndex >= 0 ? worldIndex : 0;

  // Calculate distinct level IDs based on world index (1-5, 6-10, etc.)
  const startLevelId = (safeWorldIndex * 5) + 1;

  const levels = visualTheme.levels.map((l, idx) => {
    const distinctId = startLevelId + idx;
    return {
      ...l,
      id: distinctId,
      relativeId: idx + 1, // 1-5 always
      status: (user?.currentLevelId || 1) > distinctId ? "completed" : (user?.currentLevelId || 1) === distinctId ? "unlocked" : "locked"
    };
  });

  const handleLevelClick = (level: any) => {
    // Allow clicking unlocked or completed levels
    if (level.status === "locked") {
      toast({
        title: "Nivel Bloqueado",
        description: "Debes completar los niveles anteriores.",
        variant: "destructive",
      });
      return;
    }
    setActiveLevel(level);
  };

  const handleCompleteLevel = async () => {
    try {
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: activeLevel.id, xpEarned: activeLevel.xp })
      });

      if (!res.ok) throw new Error("Failed to complete level");

      const data = await res.json();

      toast({
        title: "¡Nivel Completado!",
        description: `Has ganado ${activeLevel.xp} XP`,
        className: "bg-emerald-600 text-white border-none"
      });

      await refetchUser(); // Update client state
      setActiveLevel(null);

    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el progreso", variant: "destructive" });
    }
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden relative">

      {/* HUD: Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 pointer-events-none flex flex-col gap-2">
        <div className="flex justify-between items-start w-full">
          {/* User Profile */}
          <motion.div
            initial={{ y: -50 }} animate={{ y: 0 }}
            className="bg-card/90 backdrop-blur border border-border rounded-full p-2 pr-6 flex items-center gap-3 shadow-lg pointer-events-auto cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <div className="relative group">
              <div className={cn("w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400")}>
                <img src={selectedSkin.src} alt="Avatar" className="w-full h-full object-cover bg-primary/10" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-xs font-bold text-white">
                SALIR
              </div>
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">{user.username}</h2>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-500">
                Nivel {user.currentLevelId}
              </div>
              {/* XP Progress Bar Mini */}
              <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(user.totalXp % 1000) / 10}%` }} />
              </div>
            </div>
          </motion.div>

          {/* User Stats */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-card/90 backdrop-blur border border-border rounded-full h-12 px-4 flex items-center gap-2 shadow-lg min-w-[100px] justify-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{user.coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* World Navigation (Bottom Center) - Back to Map */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-6">
        <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[200px] shadow-2xl">
          <div className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Mundo {worldId}</div>
          <h2 className="text-xl font-black">{worldName}</h2>
        </div>
      </div>

      {/* Main Game Map Area */}
      <div className="relative w-full h-screen overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={worldId}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${visualTheme.bg})` }} />

            {/* Generic Path Overlay (Reusing SVGs) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
              <path d="M 20% 80% Q 35% 65% 50% 50% T 85% 20%" fill="none" stroke="white" strokeWidth="8" strokeDasharray="20,20" className="drop-shadow-lg" />
            </svg>

            {/* Character Avatar */}
            {levels.map((level) => {
              if (level.status === "unlocked") {
                return (
                  <motion.div
                    key="char"
                    layoutId="character"
                    className="absolute z-30 pointer-events-none"
                    style={{ left: `${level.x}%`, top: `${level.y}%` }}
                    initial={false}
                    animate={{ left: `${level.x}%`, top: `${level.y}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  >
                    <motion.div
                      animate={{ y: [-10, -20, -10] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="relative -translate-x-1/2 -translate-y-[100%] w-24 h-24 md:w-32 md:h-32"
                    >
                      <img src={selectedSkin.src} alt="Character" className="w-full h-full object-contain drop-shadow-2xl" />
                      {/* Name Tag */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur border border-white/20 whitespace-nowrap">
                        Tú
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }
              return null;
            })}

            {/* Level Nodes */}
            {levels.map((level) => (
              <motion.div
                key={level.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${level.x}%`, top: `${level.y}%` }}
              >
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLevelClick(level)}
                  className={cn(
                    "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-b-4 shadow-xl transition-all relative group",
                    level.status === "completed" ? "bg-emerald-500 border-emerald-700 text-white" :
                      level.status === "unlocked" ? "bg-white border-slate-300 text-indigo-600 animate-bounce-subtle" :
                        "bg-slate-800 border-slate-950 text-slate-500"
                  )}
                >
                  {level.status === "locked" ? (
                    <Lock className="w-6 h-6" />
                  ) : level.status === "completed" ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black">{level.id}</span>
                    </div>
                  )}

                  {/* Hover Info */}
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur border border-white/10">
                    Nivel {level.id}
                  </div>
                </motion.button>

                {level.status === "unlocked" && (
                  <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl animate-pulse z-[-1]" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Level Detail Modal */}
      <AnimatePresence>
        {activeLevel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-32 bg-slate-900 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs uppercase tracking-widest font-bold text-white/60 mb-1">Mundo: {worldName}</span>
                  <h2 className="text-4xl font-black text-white text-center px-4 drop-shadow-md">Nivel {activeLevel.id}</h2>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full" onClick={() => setActiveLevel(null)}>✕</Button>
              </div>

              <div className="p-6 flex flex-col gap-6 overflow-y-auto bg-zinc-950 text-white flex-1">

                <div className="space-y-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Play className="w-5 h-5 text-indigo-400" />
                    Contenido del Nivel
                  </h3>

                  {isContentLoading ? (
                    <div className="text-center py-8 text-zinc-500">Cargando recursos...</div>
                  ) : activeLevelContent.length === 0 ? (
                    <div className="p-4 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
                      Este nivel aún no tiene contenido asignado.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {activeLevelContent.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            {item.type === 'video' ? <Play className="w-5 h-5" /> : item.type === 'pdf' ? <CheckCircle className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sm">{item.title}</div>
                            <div className="text-xs text-zinc-500 uppercase">{item.type}</div>
                          </div>
                          <Button size="sm" variant="secondary" asChild>
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">Abrir</a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4 text-sm text-zinc-400">
                    <span>Recompensa al completar:</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <Star className="w-4 h-4" /> {activeLevel.xp} XP
                    </span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none h-14"
                    onClick={handleCompleteLevel}
                    disabled={activeLevelContent.length === 0 && user.role !== 'admin'} // Optional: prevent completing empty levels unless admin
                  >
                    {activeLevel.status === 'completed' ? 'Repetir Nivel' : 'Completar Nivel ✨'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
