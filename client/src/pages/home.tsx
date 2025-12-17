import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Star, Trophy, Shirt, Play, Code, Cpu, CheckCircle } from "lucide-react";
import mapBg from "@assets/generated_images/futuristic_tech_city_game_map_background.png";
import robotBlue from "@assets/generated_images/cute_blue_robot_avatar.png";
import robotRed from "@assets/generated_images/cool_red_robot_avatar.png";
import robotGold from "@assets/generated_images/gold_master_robot_avatar.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const ranks = [
  { name: "Bronce", color: "text-[hsl(30,60%,50%)]", bg: "bg-[hsl(30,60%,50%)]", border: "border-[hsl(30,60%,50%)]" },
  { name: "Plata", color: "text-[hsl(210,10%,70%)]", bg: "bg-[hsl(210,10%,70%)]", border: "border-[hsl(210,10%,70%)]" },
  { name: "Oro", color: "text-[hsl(45,90%,55%)]", bg: "bg-[hsl(45,90%,55%)]", border: "border-[hsl(45,90%,55%)]" },
  { name: "Platino", color: "text-[hsl(180,30%,70%)]", bg: "bg-[hsl(180,30%,70%)]", border: "border-[hsl(180,30%,70%)]" },
  { name: "Diamante", color: "text-[hsl(200,80%,60%)]", bg: "bg-[hsl(200,80%,60%)]", border: "border-[hsl(200,80%,60%)]" },
  { name: "Maestro", color: "text-[hsl(280,90%,40%)]", bg: "bg-[hsl(280,90%,40%)]", border: "border-[hsl(280,90%,40%)]" },
];

const levels = [
  { 
    id: 1, 
    x: 20, 
    y: 80, 
    name: "Fundamentos de Python", 
    type: "software", 
    status: "completed",
    description: "Aprende las variables y tipos de datos básicos en Python.",
    xp: 100
  },
  { 
    id: 2, 
    x: 35, 
    y: 65, 
    name: "Circuitos Básicos", 
    type: "robotics", 
    status: "unlocked",
    description: "Entiende cómo funciona la corriente, el voltaje y la resistencia.",
    xp: 150
  },
  { 
    id: 3, 
    x: 50, 
    y: 50, 
    name: "Bucles y Condicionales", 
    type: "software", 
    status: "locked",
    description: "Controla el flujo de tu programa con lógica avanzada.",
    xp: 200
  },
  { 
    id: 4, 
    x: 65, 
    y: 35, 
    name: "Sensores y Actuadores", 
    type: "robotics", 
    status: "locked",
    description: "Conecta el mundo físico con tu código.",
    xp: 250
  },
  { 
    id: 5, 
    x: 80, 
    y: 20, 
    name: "Proyecto Final: Robot", 
    type: "boss", 
    status: "locked",
    description: "Construye y programa tu propio robot autónomo.",
    xp: 500
  },
];

const skins = [
  { id: "blue", name: "RoboBlue", src: robotBlue, price: 0, owned: true },
  { id: "red", name: "RedGamer", src: robotRed, price: 500, owned: false },
  { id: "gold", name: "GoldenMaster", src: robotGold, price: 2000, owned: false },
];

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(2); // ID of the highest unlocked level
  const [coins, setCoins] = useState(1250);
  const [currentRank, setCurrentRank] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState(skins[0]);
  const [showShop, setShowShop] = useState(false);
  const [activeLevel, setActiveLevel] = useState<typeof levels[0] | null>(null);
  const { toast } = useToast();

  const handleLevelClick = (level: typeof levels[0]) => {
    // Can only open completed levels or the current unlocked level
    if (level.status === "completed" || level.id === currentLevel) {
      setActiveLevel(level);
    } else {
      toast({
        title: "Nivel Bloqueado",
        description: "Debes completar los niveles anteriores primero.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteLevel = () => {
    setCoins(prev => prev + (activeLevel?.xp || 100));
    setActiveLevel(null);
    
    toast({
      title: "¡Nivel Completado!",
      description: `Has ganado ${activeLevel?.xp || 100} XP y monedas.`,
      className: "bg-green-500 text-white border-none",
    });

    if (activeLevel?.id === currentLevel) {
       // Unlock next level logic
       const nextLevelId = currentLevel + 1;
       if (nextLevelId <= levels.length) {
         // Update levels state visually (in a real app this would be data driven)
         // For this mockup, we just move the character
         setCurrentLevel(nextLevelId);
         
         // Rank up logic
         if (nextLevelId % 2 === 0 && currentRank < ranks.length - 1) {
           setTimeout(() => {
             setCurrentRank(prev => prev + 1);
             toast({
               title: "¡Subiste de Rango!",
               description: `Ahora eres rango ${ranks[currentRank + 1].name}`,
               className: cn("text-white border-none", ranks[currentRank + 1].bg),
             });
           }, 1000);
         }
       }
    }
  };

  // Find the node where the character should stand
  const characterNode = levels.find(l => l.id === currentLevel) || levels[0];

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden relative">
      {/* HUD - Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="bg-card/90 backdrop-blur border border-border rounded-full p-2 pr-6 flex items-center gap-3 shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden border-2 border-primary">
              <img src={selectedSkin.src} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Cadete Robo</h2>
              <div className={cn("text-xs font-bold uppercase tracking-wider", ranks[currentRank].color)}>
                {ranks[currentRank].name}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
           <motion.button 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setShowShop(true)}
            className="bg-card/90 backdrop-blur hover:bg-card border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Shirt className="w-5 h-5 text-secondary" />
            <span className="font-bold">Tienda</span>
          </motion.button>
          
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/90 backdrop-blur border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
          >
            <div className="bg-yellow-400 rounded-full p-1">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg">{coins}</span>
          </motion.div>
        </div>
      </div>

      {/* Game Map Area */}
      <div className="relative w-full h-screen overflow-hidden bg-slate-900">
        <img 
          src={mapBg} 
          alt="Map" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        
        {/* Path svg overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
           <path 
             d="M 20% 80% Q 35% 65% 50% 50% T 80% 20%" 
             fill="none" 
             stroke="white" 
             strokeWidth="8" 
             strokeDasharray="20,20"
             className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
           />
        </svg>

        {/* Character Avatar - Moving between levels */}
        <motion.div 
          initial={false}
          animate={{ 
            left: `${characterNode.x}%`, 
            top: `${characterNode.y}%`,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 40, 
            damping: 15, 
            mass: 1 
          }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 z-30 pointer-events-none drop-shadow-2xl"
          style={{ marginTop: '-60px' }} // Offset to stand ON TOP of the node
        >
          <motion.img 
            src={selectedSkin.src} 
            alt="Character" 
            className="w-full h-full object-contain"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Level Nodes */}
        {levels.map((level) => {
          // Determine visual status based on currentLevel
          const isCompleted = level.id < currentLevel;
          const isUnlocked = level.id === currentLevel;
          const isLocked = level.id > currentLevel;

          return (
            <div 
              key={level.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${level.x}%`, top: `${level.y}%` }}
            >
              <motion.div
                whileHover={!isLocked ? { scale: 1.1 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                onClick={() => handleLevelClick({...level, status: isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked"})}
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative z-10 transition-all cursor-pointer",
                  isCompleted ? "bg-primary border-white" : 
                  isUnlocked ? "bg-white border-primary animate-pulse ring-4 ring-primary/30" : 
                  "bg-slate-700 border-slate-500 opacity-80"
                )}
              >
                {isLocked ? (
                  <Lock className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                ) : isCompleted ? (
                  <Star className="w-8 h-8 md:w-10 md:h-10 text-white fill-white" />
                ) : (
                  level.type === 'robotics' ? <Cpu className="w-8 h-8 md:w-10 md:h-10 text-primary" /> : <Code className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                )}
              </motion.div>
              
              {/* Level Label */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur px-3 py-1 rounded-lg border border-border shadow-lg whitespace-nowrap z-30">
                <span className="text-sm font-bold">{level.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Content Modal */}
      <AnimatePresence>
        {activeLevel && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                 <img src={mapBg} className="w-full h-full object-cover opacity-50 blur-sm" />
                 <div className="relative z-20 text-center p-6">
                    <Badge variant="outline" className="mb-2 bg-black/50 text-white border-white/20 uppercase tracking-widest backdrop-blur-md">
                      {activeLevel.type === 'robotics' ? 'Robótica' : 'Software'}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{activeLevel.name}</h2>
                 </div>
                 <button onClick={() => setActiveLevel(null)} className="absolute top-4 right-4 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors">
                    ✕
                 </button>
              </div>

              <div className="p-8 overflow-y-auto">
                 <div className="flex items-start gap-4 mb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                       {activeLevel.type === 'robotics' ? <Cpu className="w-8 h-8 text-primary" /> : <Code className="w-8 h-8 text-primary" />}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-2">Misión del Nivel</h3>
                       <p className="text-muted-foreground text-lg leading-relaxed">
                          {activeLevel.description} <br/>
                          ¡Completa los retos para ganar <span className="text-yellow-500 font-bold flex items-center inline-flex gap-1"><Star className="w-4 h-4 fill-current"/> {activeLevel.xp} XP</span>!
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                             <CheckCircle className="w-5 h-5" />
                          </div>
                          <span className="font-semibold">Video: Introducción Teórica</span>
                       </div>
                       <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                             <Lock className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-muted-foreground">Quiz: Conceptos Clave</span>
                       </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                             <Lock className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-muted-foreground">Reto Práctico: {activeLevel.type === 'robotics' ? 'Simulador' : 'Editor de Código'}</span>
                       </div>
                    </div>
                 </div>

                 <Button size="lg" className="w-full text-lg h-14 font-bold shadow-xl shadow-primary/20" onClick={handleCompleteLevel}>
                    {activeLevel.id < currentLevel ? 'Volver a Jugar' : 'Completar Misión (Demo)'}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Shirt className="w-6 h-6 text-primary" /> 
                  Tienda de Aspectos
                </h2>
                <button onClick={() => setShowShop(false)} className="p-2 hover:bg-muted rounded-full">
                  ✕
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
                {skins.map((skin) => (
                  <div key={skin.id} className={cn(
                    "group relative bg-muted/30 rounded-2xl p-4 border-2 transition-all hover:bg-muted/50",
                    selectedSkin.id === skin.id ? "border-primary ring-4 ring-primary/20" : "border-transparent hover:border-border"
                  )}>
                    <div className="aspect-square rounded-xl bg-white/50 mb-4 flex items-center justify-center p-4 group-hover:scale-105 transition-transform">
                      <img src={skin.src} alt={skin.name} className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold text-lg">{skin.name}</h3>
                       {skin.id === 'gold' && <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600 border-yellow-400/50">Legendario</Badge>}
                    </div>
                    
                    {skin.owned ? (
                      <button 
                        onClick={() => setSelectedSkin(skin)}
                        className={cn(
                          "w-full py-2 rounded-xl font-bold transition-all",
                          selectedSkin.id === skin.id 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                            : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        )}
                      >
                        {selectedSkin.id === skin.id ? "Equipado" : "Equipar"}
                      </button>
                    ) : (
                      <button 
                        className={cn(
                          "w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2",
                          coins >= skin.price 
                            ? "bg-secondary text-secondary-foreground hover:brightness-110 shadow-lg shadow-secondary/25" 
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        <span>{skin.price}</span> <Star className="w-4 h-4 fill-current" />
                      </button>
                    )}
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
