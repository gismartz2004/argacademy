import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Lock, Info, ChevronRight, Star, Zap, Map, LayoutGrid } from "lucide-react";
import spaceBg from "@assets/generated_images/space_galaxy_background_with_tech_ui.png";
import sunIcon from "@assets/generated_images/stylized_sun_icon.png";
import mercuryIcon from "@assets/generated_images/stylized_mercury_icon.png";
import venusIcon from "@assets/generated_images/stylized_venus_icon.png";
import earthIcon from "@assets/generated_images/stylized_earth_tech_icon.png";
import marsIcon from "@assets/generated_images/mars_base_world_icon.png";
import jupiterIcon from "@assets/generated_images/stylized_jupiter_icon.png";
import saturnIcon from "@assets/generated_images/stylized_saturn_icon.png";
import uranusIcon from "@assets/generated_images/stylized_uranus_icon.png";
import neptuneIcon from "@assets/generated_images/stylized_neptune_icon.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Planet Data
const planets = [
  {
    id: "sun",
    name: "Sol",
    subtitle: "Estrella Madre",
    type: "Star",
    icon: sunIcon,
    color: "text-yellow-400",
    gradient: "from-yellow-400 to-orange-600",
    description: "La fuente de energía de todo el sistema. Núcleo de fusión nuclear.",
    locked: true
  },
  {
    id: "mercury",
    name: "Mercurio",
    subtitle: "Sector Hardware",
    type: "Hardware",
    icon: mercuryIcon,
    color: "text-slate-400",
    gradient: "from-slate-400 to-slate-600",
    description: "Zona de Alta Temperatura. Fundamentos de electrónica y resistencia térmica.",
    locked: true
  },
  {
    id: "venus",
    name: "Venus",
    subtitle: "La Nube",
    type: "Cloud Computing",
    icon: venusIcon,
    color: "text-orange-300",
    gradient: "from-orange-300 to-yellow-600",
    description: "Atmósfera densa de datos. Arquitectura de servidores y redes distribuidas.",
    locked: true
  },
  {
    id: "earth",
    name: "Tierra",
    subtitle: "Ciudad Código",
    type: "Software",
    icon: earthIcon,
    color: "text-blue-400",
    gradient: "from-blue-400 to-emerald-500",
    description: "El hogar de la programación. Aprende Python, Lógica y Algoritmos en un entorno seguro.",
    locked: false,
    worldId: 1,
    difficulty: "Principiante",
    stats: { levels: 5, xp: 2500 }
  },
  {
    id: "mars",
    name: "Marte",
    subtitle: "Base Robótica",
    type: "Robotics",
    icon: marsIcon,
    color: "text-red-500",
    gradient: "from-red-500 to-orange-700",
    description: "Colonia de ingeniería avanzada. Domina circuitos, sensores y rovers autónomos.",
    locked: false,
    worldId: 2,
    difficulty: "Intermedio",
    stats: { levels: 8, xp: 4000 }
  },
  {
    id: "jupiter",
    name: "Júpiter",
    subtitle: "Gigante de Datos",
    type: "Big Data",
    icon: jupiterIcon,
    color: "text-orange-400",
    gradient: "from-orange-400 to-amber-700",
    description: "Procesamiento masivo de información y bases de datos distribuidas.",
    locked: true
  },
  {
    id: "saturn",
    name: "Saturno",
    subtitle: "Anillos de Red",
    type: "Networks",
    icon: saturnIcon,
    color: "text-yellow-200",
    gradient: "from-yellow-200 to-amber-500",
    description: "Protocolos de comunicación, ciberseguridad y topologías de red.",
    locked: true
  },
  {
    id: "uranus",
    name: "Urano",
    subtitle: "Laboratorio Cryo",
    type: "Cryo-Tech",
    icon: uranusIcon,
    color: "text-cyan-300",
    gradient: "from-cyan-300 to-blue-500",
    description: "Tecnología de enfriamiento y superconductores cuánticos.",
    locked: true
  },
  {
    id: "neptune",
    name: "Neptuno",
    subtitle: "Abismo IA",
    type: "Deep AI",
    icon: neptuneIcon,
    color: "text-indigo-400",
    gradient: "from-indigo-400 to-purple-700",
    description: "Redes neuronales profundas e inteligencia artificial avanzada.",
    locked: true
  }
];

export default function GalaxyMap() {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState("earth");

  const selectedPlanet = planets.find(p => p.id === selectedId) || planets[3];

  const handleEnterWorld = (worldId: number) => {
    setLocation(`/play?world=${worldId}`);
  };

  return (
    <div className="min-h-screen bg-black font-sans overflow-hidden relative flex">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img src={spaceBg} className="w-full h-full object-cover opacity-30" alt="Galaxy" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Left Sidebar - Planet List */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-screen z-20 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl relative">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Sistema Solar v2.0</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            ROBO<span className="text-cyan-400">QUEST</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Selecciona tu destino de aprendizaje.</p>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-8">
            {planets.map((planet) => (
              <button
                key={planet.id}
                onClick={() => setSelectedId(planet.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group border border-transparent text-left",
                  selectedId === planet.id 
                    ? "bg-white/10 border-white/10 shadow-lg" 
                    : "hover:bg-white/5 hover:border-white/5 opacity-60 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center bg-black/50 border border-white/10 relative overflow-hidden transition-transform duration-500",
                  selectedId === planet.id && "scale-110 border-white/30"
                )}>
                  <img src={planet.icon} className="w-full h-full object-contain p-1" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={cn(
                      "font-bold text-sm transition-colors",
                      selectedId === planet.id ? "text-white" : "text-slate-300"
                    )}>
                      {planet.name}
                    </span>
                    {planet.locked && <Lock className="w-3 h-3 text-slate-600" />}
                  </div>
                  <span className="text-xs text-slate-500 block">{planet.type}</span>
                </div>
                
                {selectedId === planet.id && (
                  <motion.div layoutId="sidebar-active" className="w-1 h-8 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
        
        {/* User Stats Mini */}
        <div className="p-4 border-t border-white/10 bg-black/20">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
                CR
              </div>
              <div>
                <div className="text-sm font-bold text-white">Cadete Robo</div>
                <div className="text-xs text-slate-400">Nivel 12 • 850 XP</div>
              </div>
           </div>
        </div>
      </div>

      {/* Right Content - Hero View */}
      <div className="flex-1 h-screen relative z-10 flex flex-col md:flex-row items-center justify-center p-8 md:p-16 overflow-hidden">
        
        {/* Large Planet Visualization */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedId}
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -100 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative w-full md:w-1/2 aspect-square max-w-[600px] flex items-center justify-center"
          >
             {/* Glow Effect behind planet */}
             <div className={cn(
               "absolute inset-0 blur-[100px] opacity-30 rounded-full bg-gradient-to-tr",
               selectedPlanet.gradient
             )} />
             
             {/* Floating Animation Wrapper */}
             <motion.div
               animate={{ y: [-15, 15, -15] }}
               transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
               className="relative z-10 w-full h-full"
             >
                <img 
                  src={selectedPlanet.icon} 
                  className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                  alt={selectedPlanet.name} 
                />
             </motion.div>
             
             {/* Orbit Rings Decoration */}
             <div className="absolute inset-0 border border-white/5 rounded-full scale-150 opacity-20" />
             <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.8] opacity-10" />
          </motion.div>
        </AnimatePresence>

        {/* Planet Details Panel */}
        <div className="w-full md:w-1/2 max-w-lg mt-8 md:mt-0 md:pl-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="outline" className={cn("mb-4 border-white/20 px-3 py-1", selectedPlanet.color)}>
                {selectedPlanet.type}
              </Badge>
              
              <h2 className="text-6xl font-black text-white mb-2 tracking-tight">
                {selectedPlanet.name}
              </h2>
              <div className="text-xl text-slate-400 font-light mb-6">
                {selectedPlanet.subtitle}
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed mb-8 border-l-2 border-white/10 pl-4">
                {selectedPlanet.description}
              </p>

              {selectedPlanet.stats && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-2">
                      <LayoutGrid className="w-3 h-3" /> Niveles
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">{selectedPlanet.stats.levels}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                     <div className="text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-2">
                      <Star className="w-3 h-3" /> Recompensa Total
                    </div>
                    <div className="text-2xl font-mono font-bold text-yellow-400">{selectedPlanet.stats.xp} XP</div>
                  </div>
                </div>
              )}

              {selectedPlanet.locked ? (
                <Button disabled className="w-full h-14 text-lg bg-white/5 text-slate-500 border border-white/10">
                  <Lock className="w-5 h-5 mr-2" /> Sector Bloqueado
                </Button>
              ) : (
                <Button 
                  className={cn(
                    "w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]",
                    "bg-gradient-to-r text-white border-0",
                    selectedPlanet.gradient
                  )}
                  onClick={() => handleEnterWorld(selectedPlanet.worldId!)}
                >
                  <Rocket className="w-5 h-5 mr-2 animate-bounce" /> 
                  Iniciar Misión
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
