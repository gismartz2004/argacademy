import React from 'react';
import { motion } from 'framer-motion';

interface WorldBackgroundProps {
  worldId: number;
  worldName: string;
  worldImageUrl?: string;
  children: React.ReactNode;
}

export function WorldBackground({ worldId, worldName, worldImageUrl, children }: WorldBackgroundProps) {
  // Define background themes based on world characteristics
  const getWorldTheme = (worldId: number, worldName: string) => {
    const themes = {
      // Space themes
      space: {
        gradient: 'from-indigo-900 via-purple-900 to-black',
        particles: 'stars',
        accentColor: 'cyan',
      },
      ocean: {
        gradient: 'from-blue-900 via-cyan-900 to-teal-900',
        particles: 'bubbles',
        accentColor: 'blue',
      },
      forest: {
        gradient: 'from-green-900 via-emerald-900 to-black',
        particles: 'leaves',
        accentColor: 'green',
      },
      desert: {
        gradient: 'from-yellow-900 via-orange-900 to-red-900',
        particles: 'sand',
        accentColor: 'yellow',
      },
      mountain: {
        gradient: 'from-gray-900 via-slate-800 to-black',
        particles: 'snow',
        accentColor: 'gray',
      },
      city: {
        gradient: 'from-gray-800 via-zinc-800 to-black',
        particles: 'lights',
        accentColor: 'purple',
      },
    };

    // Determine theme based on world name keywords
    const name = worldName.toLowerCase();
    if (name.includes('space') || name.includes('galaxy') || name.includes('star')) {
      return themes.space;
    } else if (name.includes('ocean') || name.includes('sea') || name.includes('water')) {
      return themes.ocean;
    } else if (name.includes('forest') || name.includes('jungle') || name.includes('nature')) {
      return themes.forest;
    } else if (name.includes('desert') || name.includes('sand') || name.includes('arid')) {
      return themes.desert;
    } else if (name.includes('mountain') || name.includes('peak') || name.includes('snow')) {
      return themes.mountain;
    } else if (name.includes('city') || name.includes('urban') || name.includes('tech')) {
      return themes.city;
    }

    // Default to space theme
    return themes.space;
  };

  const theme = getWorldTheme(worldId, worldName);

  const renderParticles = () => {
    switch (theme.particles) {
      case 'stars':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        );

      case 'bubbles':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/30 rounded-full border border-blue-300/50"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `-10px`,
                }}
                animate={{
                  y: [-20, -window.innerHeight - 20],
                  x: [0, Math.random() * 50 - 25],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        );

      case 'leaves':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-4 bg-green-400/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                }}
                animate={{
                  y: [0, window.innerHeight + 20],
                  rotate: [0, 360],
                  x: [0, Math.sin(Date.now() * 0.001 + i) * 30],
                }}
                transition={{
                  duration: 6 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        );

      case 'sand':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/50 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, 20, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        );

      case 'snow':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5px`,
                }}
                animate={{
                  y: [0, window.innerHeight + 10],
                  x: [0, Math.sin(Date.now() * 0.001 + i) * 20],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 6,
                }}
              />
            ))}
          </div>
        );

      case 'lights':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  Math.random() > 0.5 ? 'bg-cyan-400' : 'bg-purple-400'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Base Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* World Image Overlay */}
      {worldImageUrl && (
        <div className="absolute inset-0">
          <img
            src={worldImageUrl}
            className="w-full h-full object-cover opacity-10"
            alt={worldName}
          />
        </div>
      )}

      {/* Animated Particles */}
      {renderParticles()}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}