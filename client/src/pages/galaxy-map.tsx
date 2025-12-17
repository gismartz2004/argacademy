import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Cpu, Code, ChevronRight, Globe, Zap, ArrowRight, Lock, Info } from "lucide-react";
import spaceBg from "@assets/generated_images/space_galaxy_background_with_tech_ui.png";
import sunIcon from "@assets/generated_images/stylized_sun_icon.png";
import mercuryIcon from "@assets/generated_images/stylized_mercury_icon.png";
import venusIcon from "@assets/generated_images/stylized_venus_icon.png";
import earthIcon from "@assets/generated_images/stylized_earth_tech_icon.png";
import marsIcon from "@assets/generated_images/mars_base_world_icon.png"; // Keeping the previous mars one or using new if generated? Let's assume we use the new style if it matches, but I'll use the one I have or the new one. Wait, I didn't generate Mars in this batch because I had one. I'll use the previous Mars one for now.
import jupiterIcon from "@assets/generated_images/stylized_jupiter_icon.png";
import saturnIcon from "@assets/generated_images/stylized_saturn_icon.png";
import uranusIcon from "@assets/generated_images/stylized_uranus_icon.png";
import neptuneIcon from "@assets/generated_images/stylized_neptune_icon.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Planet Data
const planets = [
  {
    id: "sun",
    name: "Sol",
    type: "Star",
    icon: sunIcon,
    size: 160,
    orbit: 0,
    speed: 0,
    description: "La fuente de energía de todo el sistema.",
    locked: true
  },
  {
    id: "mercury",
    name: "Mercurio",
    type: "Hardware",
    icon: mercuryIcon,
    size: 40,
    orbit: 220,
    speed: 25,
    description: "Zona de Alta Temperatura. Próximamente.",
    locked: true
  },
  {
    id: "venus",
    name: "Venus",
    type: "Cloud Computing",
    icon: venusIcon,
    size: 55,
    orbit: 300,
    speed: 35,
    description: "Atmósfera densa de datos. Próximamente.",
    locked: true
  },
  {
    id: "earth",
    name: "Tierra (Ciudad Código)",
    type: "Software",
    icon: earthIcon,
    size: 70,
    orbit: 420,
    speed: 45,
    description: "El hogar de la programación. Aprende Python y Lógica.",
    locked: false,
    worldId: 1,
    difficulty: "Principiante"
  },
  {
    id: "mars",
    name: "Marte (Base Robótica)",
    type: "Robotics",
    icon: marsIcon,
    size: 50,
    orbit: 540,
    speed: 55,
    description: "Colonia de ingeniería. Domina los circuitos y rovers.",
    locked: false,
    worldId: 2,
    difficulty: "Intermedio"
  },
  {
    id: "jupiter",
    name: "Júpiter",
    type: "Big Data",
    icon: jupiterIcon,
    size: 120,
    orbit: 700,
    speed: 80,
    description: "El gigante de los datos masivos. Próximamente.",
    locked: true
  },
  {
    id: "saturn",
    name: "Saturno",
    type: "Networks",
    icon: saturnIcon,
    size: 100,
    orbit: 850,
    speed: 100,
    description: "Anillos de conectividad y redes. Próximamente.",
    locked: true
  },
  {
    id: "uranus",
    name: "Urano",
    type: "Cryo-Tech",
    icon: uranusIcon,
    size: 80,
    orbit: 1000,
    speed: 120,
    description: "Tecnología de enfriamiento. Próximamente.",
    locked: true
  },
  {
    id: "neptune",
    name: "Neptuno",
    type: "Deep AI",
    icon: neptuneIcon,
    size: 80,
    orbit: 1150,
    speed: 140,
    description: "Inteligencia Artificial Profunda. Próximamente.",
    locked: true
  }
];

export default function GalaxyMap() {
  const [, setLocation] = useLocation();
  const [selectedPlanet, setSelectedPlanet] = useState<typeof planets[0] | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const handlePlanetClick = (planet: typeof planets[0]) => {
    setSelectedPlanet(planet);
  };

  const handleEnterWorld = (worldId: number) => {
    setLocation(`/play?world=${worldId}`);
  };

  return (
    <div className="min-h-screen bg-black font-sans overflow-hidden relative flex flex-col items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-black">
        <img src={spaceBg} className="w-full h-full object-cover opacity-40 scale-110 animate-pulse-slow" alt="Space" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }} 
      />

      {/* UI Overlay - Top Left */}
      <div className="absolute top-8 left-8 z-50 pointer-events-none">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
          SISTEMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ROBOQUEST</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xs">
          Navega a través de los planetas para acceder a los módulos de aprendizaje.
        </p>
      </div>

      {/* Solar System Container */}
      {/* We use a large container that we can pan/zoom conceptually, but for now purely centered */}
      <div className="relative w-[1500px] h-[1500px] flex items-center justify-center scale-[0.4] md:scale-[0.6] lg:scale-[0.8] transition-transform duration-1000 origin-center">
        
        {/* Orbits */}
        {planets.map((planet) => (
          planet.id !== 'sun' && (
            <div 
              key={`orbit-${planet.id}`}
              className="absolute rounded-full border border-white/10"
              style={{ 
                width: planet.orbit, 
                height: planet.orbit,
                boxShadow: hoveredPlanet === planet.id ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
              }}
            />
          )
        ))}

        {/* Planets */}
        {planets.map((planet) => (
          <div
            key={planet.id}
            className="absolute flex items-center justify-center"
            style={{
              width: planet.orbit,
              height: planet.orbit,
              animation: planet.id === 'sun' ? 'none' : `spin ${planet.speed}s linear infinite`,
            }}
          >
            {/* The planet itself needs to counter-rotate or just be placed at the top */}
            {/* Actually, to animate properly in an orbit, we rotate the container. 
                The planet element is positioned at the 'top' of the rotation circle (translateY of -radius).
            */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                width: planet.size,
                height: planet.size,
                animation: `counter-spin ${planet.speed}s linear infinite` // Keep planet upright if needed, or just let it rotate
              }}
              whileHover={{ scale: 1.2, zIndex: 50 }}
              onHoverStart={() => setHoveredPlanet(planet.id)}
              onHoverEnd={() => setHoveredPlanet(null)}
              onClick={(e) => {
                e.stopPropagation();
                handlePlanetClick(planet);
              }}
            >
              {/* Selection Ring */}
              {selectedPlanet?.id === planet.id && (
                <motion.div 
                  layoutId="selection-ring"
                  className="absolute -inset-4 border-2 border-cyan-400 rounded-full animate-pulse z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Planet Image */}
              <div className="relative w-full h-full z-10">
                 <img src={planet.icon} alt={planet.name} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                 
                 {/* Locked Overlay */}
                 {planet.locked && (
                   <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                     <Lock className="w-1/3 h-1/3 text-white/50" />
                   </div>
                 )}
              </div>

              {/* Hover Label */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {planet.name}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Info Panel - Bottom Right or Centered when selected */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-black/80 backdrop-blur-xl border-l border-white/10 p-8 z-[100] flex flex-col shadow-2xl"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
              onClick={() => setSelectedPlanet(null)}
            >
              ✕
            </Button>

            <div className="mt-12 flex flex-col items-center text-center">
               <motion.div 
                 key={selectedPlanet.id}
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="w-48 h-48 mb-6 relative"
               >
                 <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full" />
                 <img src={selectedPlanet.icon} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
               </motion.div>

               <div className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
                 {selectedPlanet.type}
               </div>

               <h2 className="text-4xl font-black text-white mb-4">{selectedPlanet.name}</h2>
               <p className="text-slate-300 leading-relaxed mb-8">
                 {selectedPlanet.description}
               </p>

               {selectedPlanet.locked ? (
                 <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-slate-400">
                   <Lock className="w-5 h-5" />
                   <div className="text-left text-sm">
                     <span className="block font-bold text-white">Acceso Denegado</span>
                     Nivel de autorización insuficiente.
                   </div>
                 </div>
               ) : (
                 <div className="w-full space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="text-xs text-slate-400 uppercase font-bold">Dificultad</div>
                          <div className="text-white font-bold">{selectedPlanet.difficulty}</div>
                       </div>
                       <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="text-xs text-slate-400 uppercase font-bold">Recompensa</div>
                          <div className="text-yellow-400 font-bold">XP & Skins</div>
                       </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
                      onClick={() => handleEnterWorld(selectedPlanet.worldId!)}
                    >
                      Viajar a {selectedPlanet.name} <Rocket className="ml-2 w-5 h-5" />
                    </Button>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
