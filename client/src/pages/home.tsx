import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Star, Trophy, Shirt, Play, Code, Cpu, CheckCircle, ChevronRight, ChevronLeft, Map, Users } from "lucide-react";
import mapBg1 from "@assets/generated_images/futuristic_tech_city_game_map_background.png";
import mapBg2 from "@assets/generated_images/mars_robotics_base_game_map.png"; // We will update this import after generation
import robotBlue from "@assets/generated_images/cute_blue_robot_avatar.png";
import robotRed from "@assets/generated_images/cool_red_robot_avatar.png";
import robotGold from "@assets/generated_images/gold_master_robot_avatar.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const [currentLevelId, setCurrentLevelId] = useState(3); // Global ID of highest unlocked
  const [coins, setCoins] = useState(1250);
  const [totalXp, setTotalXp] = useState(850);
  const [selectedSkin, setSelectedSkin] = useState(skins[0]);
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const { toast } = useToast();

  const currentWorld = worlds[currentWorldIndex];
  
  // Calculate Rank based on XP
  const currentRankIndex = ranks.findIndex((r, i) => 
    totalXp >= r.minXp && (i === ranks.length - 1 || totalXp < ranks[i+1].minXp)
  );
  const currentRank = ranks[currentRankIndex];
  const nextRank = ranks[currentRankIndex + 1];
  const xpProgress = nextRank 
    ? ((totalXp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100 
    : 100;

  const handleLevelClick = (level: any) => {
    if (level.status === "locked") {
      toast({
        title: "Nivel Bloqueado",
        description: "Completa los niveles anteriores para desbloquear.",
        variant: "destructive",
      });
      return;
    }
    setActiveLevel(level);
  };

  const handleCompleteLevel = () => {
    setCoins(prev => prev + activeLevel.xp);
    setTotalXp(prev => prev + activeLevel.xp);
    setActiveLevel(null);
    toast({
      title: "¡Misión Cumplida!",
      description: `+${activeLevel.xp} XP | +${activeLevel.xp} Monedas`,
      className: "bg-green-600 text-white border-none",
    });

    if (activeLevel.id === currentLevelId) {
      setCurrentLevelId(prev => prev + 1);
      // Check if we need to switch worlds or update local status
      // In a real app this is handled by backend data
    }
  };

  // Determine character position
  // If current level is in this world, show character on it. 
  // If current level is beyond this world, show character at the end? Or not at all?
  // For simplicity: Character is on 'currentLevelId' if it exists in this world.
  // If currentLevelId > max level of this world, maybe show character at the end node or just hide.
  const characterLevel = currentWorld.levels.find(l => l.id === currentLevelId) 
    || (currentLevelId > currentWorld.levels[currentWorld.levels.length-1].id ? currentWorld.levels[currentWorld.levels.length-1] : null)
    || (currentLevelId < currentWorld.levels[0].id ? currentWorld.levels[0] : null);

  const isCharacterInWorld = currentWorld.levels.some(l => l.id === currentLevelId);

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden relative">
      
      {/* HUD: Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 pointer-events-none flex flex-col gap-2">
        <div className="flex justify-between items-start w-full">
          {/* User Profile */}
          <motion.div 
            initial={{ y: -50 }} animate={{ y: 0 }}
            className="bg-card/90 backdrop-blur border border-border rounded-full p-2 pr-6 flex items-center gap-3 shadow-lg pointer-events-auto"
          >
            <div className="relative">
              <div className={cn("w-14 h-14 rounded-full overflow-hidden border-2", currentRank.border)}>
                <img src={selectedSkin.src} alt="Avatar" className="w-full h-full object-cover bg-primary/10" />
              </div>
              <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-card", currentRank.bg)}>
                {currentRankIndex + 1}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Cadete Robo</h2>
              <div className={cn("text-xs font-bold uppercase tracking-wider", currentRank.color)}>
                {currentRank.name}
              </div>
              {/* XP Progress Bar Mini */}
              <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div className={cn("h-full transition-all duration-500", currentRank.bg)} style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </motion.div>

          {/* Resources & Actions */}
          <div className="flex items-center gap-3 pointer-events-auto">
             <Button 
              variant="outline" 
              size="icon"
              className="rounded-full bg-card/90 backdrop-blur shadow-lg w-12 h-12"
              onClick={() => setShowLeaderboard(true)}
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
            </Button>
            
            <Button 
              variant="outline"
              className="rounded-full bg-card/90 backdrop-blur shadow-lg h-12 px-4 gap-2"
              onClick={() => setShowShop(true)}
            >
              <Shirt className="w-5 h-5 text-secondary" />
              <span className="hidden md:inline font-bold">Tienda</span>
            </Button>
            
            <div className="bg-card/90 backdrop-blur border border-border rounded-full h-12 px-4 flex items-center gap-2 shadow-lg min-w-[100px] justify-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* World Navigation (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-6">
        <Button 
          variant="secondary" size="icon" className="rounded-full w-12 h-12 shadow-xl border-2 border-white/20"
          onClick={() => setCurrentWorldIndex(prev => Math.max(0, prev - 1))}
          disabled={currentWorldIndex === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-white/10 text-center min-w-[200px] shadow-2xl">
          <div className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Mundo {currentWorldIndex + 1}</div>
          <h2 className="text-xl font-black">{currentWorld.name}</h2>
        </div>

        <Button 
          variant="secondary" size="icon" className="rounded-full w-12 h-12 shadow-xl border-2 border-white/20"
          onClick={() => setCurrentWorldIndex(prev => Math.min(worlds.length - 1, prev + 1))}
          disabled={currentWorldIndex === worlds.length - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Game Map Area */}
      <div className="relative w-full h-screen overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWorld.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
             {/* Background Image */}
             <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${currentWorld.bg})` }} />
             
             {/* SVG Path Overlay */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                {currentWorld.id === 1 ? (
                   <path d="M 20% 80% Q 35% 65% 50% 50% T 85% 20%" fill="none" stroke="white" strokeWidth="8" strokeDasharray="20,20" className="drop-shadow-lg" />
                ) : (
                   <path d="M 15% 25% Q 30% 40% 50% 60% T 90% 80%" fill="none" stroke="white" strokeWidth="8" strokeDasharray="20,20" className="drop-shadow-lg" />
                )}
             </svg>

             {/* Character Avatar */}
             {isCharacterInWorld && characterLevel && (
               <motion.div 
                 layoutId="character"
                 className="absolute z-30 pointer-events-none"
                 style={{ left: `${characterLevel.x}%`, top: `${characterLevel.y}%` }}
                 initial={false}
                 animate={{ left: `${characterLevel.x}%`, top: `${characterLevel.y}%` }}
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
             )}

             {/* Level Nodes */}
             {currentWorld.levels.map((level) => {
               // Determine status based on global currentLevelId
               let status = "locked";
               if (level.id < currentLevelId) status = "completed";
               else if (level.id === currentLevelId) status = "unlocked";

               return (
                 <motion.div 
                   key={level.id}
                   className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                   style={{ left: `${level.x}%`, top: `${level.y}%` }}
                 >
                   <motion.button
                     whileHover={{ scale: 1.15, rotate: 5 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => handleLevelClick({...level, status})}
                     className={cn(
                       "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-b-4 shadow-xl transition-all relative group",
                       status === "completed" ? "bg-emerald-500 border-emerald-700 text-white" : 
                       status === "unlocked" ? "bg-white border-slate-300 text-primary animate-bounce-subtle" : 
                       "bg-slate-800 border-slate-950 text-slate-500"
                     )}
                   >
                     {status === "locked" ? (
                       <Lock className="w-6 h-6" />
                     ) : status === "completed" ? (
                       <CheckCircle className="w-8 h-8" />
                     ) : (
                       level.type === 'robotics' ? <Cpu className="w-8 h-8" /> : <Code className="w-8 h-8" />
                     )}
                     
                     {/* Hover Info */}
                     <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur border border-white/10">
                       {level.name}
                     </div>
                   </motion.button>
                   
                   {status === "unlocked" && (
                     <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl animate-pulse z-[-1]" />
                   )}
                 </motion.div>
               );
             })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[80vh]"
             >
                <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-300" />
                    Tabla de Líderes
                  </h2>
                  <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20 text-primary-foreground rounded-full" onClick={() => setShowLeaderboard(false)}>✕</Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {leaderboard.map((user, idx) => (
                     <div key={idx} className={cn(
                       "flex items-center gap-4 p-3 rounded-xl border transition-all",
                       user.name === "Cadete Robo" ? "bg-primary/10 border-primary" : "bg-muted/30 border-transparent"
                     )}>
                        <div className="font-black text-lg w-6 text-center text-muted-foreground">{user.rank}</div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border">
                           <img src={user.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <div className="font-bold">{user.name}</div>
                           <div className="text-xs text-muted-foreground">{ranks[user.tier].name}</div>
                        </div>
                        <div className="font-mono font-bold text-primary">{user.xp.toLocaleString()} XP</div>
                     </div>
                   ))}
                   {/* Current User Fake Entry */}
                   <div className="flex items-center gap-4 p-3 rounded-xl border bg-primary/5 border-primary/50 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      <div className="font-black text-lg w-6 text-center text-primary">12</div>
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-primary">
                           <img src={selectedSkin.src} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                           <div className="font-bold">Tú</div>
                           <div className="text-xs text-muted-foreground">{currentRank.name}</div>
                      </div>
                      <div className="font-mono font-bold text-primary">{totalXp.toLocaleString()} XP</div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

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
               <div className="relative h-40 bg-slate-900 overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-3xl font-black text-white text-center px-4 drop-shadow-md">{activeLevel.name}</h2>
                  </div>
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full" onClick={() => setActiveLevel(null)}>✕</Button>
               </div>

               <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                     <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/> {activeLevel.xp} XP</span>
                     <span className="w-px h-4 bg-border" />
                     <span className="flex items-center gap-1 capitalize"><Map className="w-4 h-4"/> {activeLevel.type}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-2">Misión</h3>
                    <p className="text-muted-foreground leading-relaxed">{activeLevel.desc}. Aprende los conceptos fundamentales para avanzar al siguiente módulo.</p>
                  </div>

                  <div className="space-y-3">
                     <h3 className="font-bold text-lg">Actividades</h3>
                     {['Video Tutorial', 'Quiz Rápido', 'Desafío de Código'].map((task, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", i === 0 ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary")}>
                             {i === 0 ? <CheckCircle className="w-5 h-5" /> : <Play className="w-4 h-4" />}
                          </div>
                          <span className={cn("font-medium", i === 0 && "line-through text-muted-foreground")}>{task}</span>
                       </div>
                     ))}
                  </div>

                  <Button size="lg" className="w-full text-lg font-bold mt-2" onClick={handleCompleteLevel}>
                    {activeLevel.status === 'completed' ? 'Repetir Nivel' : 'Completar Nivel'}
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shop Modal Reuse (Simplified for brevity, assume same structure as before but using motion) */}
      <AnimatePresence>
        {showShop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-6 border-b flex justify-between items-center">
                   <h2 className="text-2xl font-black flex items-center gap-2"><Shirt className="w-6 h-6 text-primary"/> Tienda</h2>
                   <Button variant="ghost" onClick={() => setShowShop(false)}>✕</Button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
                   {skins.map(skin => (
                     <div key={skin.id} className={cn("border-2 rounded-2xl p-4 flex flex-col gap-4 transition-all hover:bg-muted/50", selectedSkin.id === skin.id ? "border-primary bg-primary/5" : "border-transparent bg-muted/30")}>
                        <img src={skin.src} className="w-full aspect-square object-contain bg-white/50 rounded-xl p-4" />
                        <div className="flex justify-between font-bold"><span>{skin.name}</span> <span>{skin.price}</span></div>
                        <Button 
                          variant={selectedSkin.id === skin.id ? "default" : "outline"}
                          onClick={() => skin.owned ? setSelectedSkin(skin) : null}
                          disabled={!skin.owned && coins < skin.price}
                        >
                          {selectedSkin.id === skin.id ? "Equipado" : skin.owned ? "Equipar" : "Comprar"}
                        </Button>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
