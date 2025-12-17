import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Cpu, Code, ChevronRight, Globe, Zap, ArrowRight } from "lucide-react";
import spaceBg from "@assets/generated_images/space_galaxy_background_with_tech_ui.png"; // Placeholder until generation
import cityIcon from "@assets/generated_images/coding_city_world_icon.png"; // Placeholder
import marsIcon from "@assets/generated_images/mars_base_world_icon.png"; // Placeholder
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const worlds = [
  {
    id: 1,
    name: "Ciudad Código",
    subtitle: "Fundamentos de Software",
    description: "Adéntrate en una metrópolis digital donde la lógica es la ley. Aprende Python, algoritmos y estructuras de datos para hackear el sistema.",
    icon: cityIcon,
    color: "from-blue-500 to-cyan-400",
    accent: "text-cyan-400",
    stats: { levels: 5, difficulty: "Principiante" }
  },
  {
    id: 2,
    name: "Base Marte",
    subtitle: "Ingeniería Robótica",
    description: "Coloniza el planeta rojo dominando el hardware. Construye circuitos, programa microcontroladores y controla rovers autónomos.",
    icon: marsIcon,
    color: "from-orange-500 to-red-600",
    accent: "text-orange-500",
    stats: { levels: 5, difficulty: "Intermedio" }
  }
];

export default function GalaxyMap() {
  const [, setLocation] = useLocation();
  const [hoveredWorld, setHoveredWorld] = useState<number | null>(null);

  const handleEnterWorld = (worldId: number) => {
    // Navigate to the main game view with the selected world
    // We'll pass the world ID via query param or just navigate to /play
    // For now, let's just go to /play which renders the previous Home component
    setLocation(`/play?world=${worldId}`);
  };

  return (
    <div className="min-h-screen bg-black font-sans overflow-hidden relative flex flex-col items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={spaceBg} className="w-full h-full object-cover opacity-60" alt="Space" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} 
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
          <Globe className="w-4 h-4" /> Sistema Solar Educativo
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
          ROBOQUEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">GALAXY</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Selecciona tu destino y comienza tu viaje de aprendizaje.
        </p>
      </motion.div>

      {/* Worlds Container */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center w-full max-w-6xl px-4">
        {worlds.map((world, index) => (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
            onHoverStart={() => setHoveredWorld(world.id)}
            onHoverEnd={() => setHoveredWorld(null)}
            className="relative group w-full max-w-sm"
          >
            {/* Connection Line */}
            {index < worlds.length - 1 && (
              <div className="hidden md:block absolute top-1/2 left-full w-16 h-0.5 bg-gradient-to-r from-white/20 to-transparent -translate-y-1/2 z-0" />
            )}

            <div className={cn(
              "relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1 overflow-hidden transition-all duration-500",
              hoveredWorld === world.id ? "scale-105 border-white/30 shadow-[0_0_50px_rgba(var(--glow-color),0.3)]" : "scale-100"
            )}
            style={{ "--glow-color": world.id === 1 ? "0,255,255" : "255,100,0" } as any}
            >
              {/* Card Content */}
              <div className="relative bg-black/40 rounded-[1.8rem] p-6 flex flex-col items-center text-center h-full border border-white/5">
                
                {/* Floating Icon */}
                <motion.div 
                  animate={{ y: hoveredWorld === world.id ? [-5, 5] : 0 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                  className="w-48 h-48 mb-6 relative"
                >
                   <div className={cn("absolute inset-0 rounded-full blur-[60px] opacity-20 bg-gradient-to-br", world.color)} />
                   <img src={world.icon} alt={world.name} className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
                </motion.div>

                <div className="space-y-2 mb-6">
                   <div className={cn("text-xs font-bold tracking-widest uppercase", world.accent)}>
                     Mundo 0{world.id}
                   </div>
                   <h2 className="text-3xl font-black text-white">{world.name}</h2>
                   <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                     {world.description}
                   </p>
                </div>

                <div className="grid grid-cols-2 w-full gap-2 mb-6">
                   <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                      <div className="text-slate-400 text-xs uppercase font-bold">Niveles</div>
                      <div className="text-white font-mono font-bold text-lg">{world.stats.levels}</div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                      <div className="text-slate-400 text-xs uppercase font-bold">Dificultad</div>
                      <div className="text-white font-mono font-bold text-sm mt-1">{world.stats.difficulty}</div>
                   </div>
                </div>

                <Button 
                  className={cn(
                    "w-full h-12 text-lg font-bold rounded-xl transition-all duration-300",
                    hoveredWorld === world.id 
                      ? "bg-gradient-to-r text-white shadow-lg scale-105" 
                      : "bg-white/10 text-white hover:bg-white/20",
                    world.color.replace('from-', 'from-').replace('to-', 'to-') // Hacky way to apply gradient classes dynamically if needed, but better to use template literal in className
                  )}
                  style={{ backgroundImage: hoveredWorld === world.id ? `linear-gradient(to right, var(--tw-gradient-stops))` : 'none' }}
                  onClick={() => handleEnterWorld(world.id)}
                >
                   <span className={cn(hoveredWorld === world.id && world.color)}>Explorar</span> <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
