import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, MapPin } from 'lucide-react';

interface LevelCheckpointProps {
  level: number;
  status: 'locked' | 'available' | 'completed';
  avatarSkinId: string;
  username: string;
  onClick: () => void;
}

export function LevelCheckpoint({ level, status, avatarSkinId, username, onClick }: LevelCheckpointProps) {
  // Get avatar image based on skin ID
  const getAvatarImage = (skinId: string) => {
    const avatarImages: Record<string, string> = {
      blue: '/avatars/blue-avatar.png',
      red: '/avatars/red-avatar.png',
      green: '/avatars/green-avatar.png',
      purple: '/avatars/purple-avatar.png',
      gold: '/avatars/gold-avatar.png',
      rainbow: '/avatars/rainbow-avatar.png',
    };
    return avatarImages[skinId] || '/avatars/default-avatar.png';
  };

  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center relative"
    >
      {/* Checkpoint Platform */}
      <motion.div
        whileHover={!isLocked ? { scale: 1.05 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={onClick}
        className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer ${
          isCompleted
            ? 'bg-green-500 border-green-400 shadow-green-500/30'
            : isLocked
            ? 'bg-gray-800 border-gray-600 cursor-not-allowed opacity-50'
            : 'bg-cyan-600 border-cyan-400 shadow-cyan-500/30 hover:bg-cyan-500 hover:border-cyan-300'
        }`}
      >
        {/* Character Avatar (only show if completed) */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2"
          >
            <Avatar className="w-8 h-8 sm:w-12 sm:h-12 border-3 border-white shadow-lg">
              <AvatarImage src={getAvatarImage(avatarSkinId)} alt={username} />
              <AvatarFallback className="bg-cyan-600 text-white font-bold text-xs">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}

        {/* Checkpoint Icon */}
        <div className="relative z-10">
          {isCompleted ? (
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </motion.div>
          ) : isLocked ? (
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          ) : (
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </motion.div>
          )}
        </div>

        {/* Level Number Badge */}
        <div className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 w-7 h-7 sm:w-9 sm:h-9 bg-black rounded-full border-2 border-white flex items-center justify-center shadow-md">
          <span className="text-xs font-bold text-white">{level}</span>
        </div>

        {/* Glow Effect for Available Checkpoints */}
        {!isLocked && !isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Character Shadow/Base (only for completed levels) */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-12 h-2 sm:w-16 sm:h-3 bg-black/30 rounded-full blur-sm mt-1"
        />
      )}

      {/* Hover Tooltip */}
      {!isLocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-white/20 whitespace-nowrap z-20"
        >
          {isCompleted ? `¡Nivel ${level} completado!` : `Ir al Nivel ${level}`}
        </motion.div>
      )}
    </motion.div>
  );
}

  // Get avatar image based on skin ID
  const getAvatarImage = (skinId: string) => {
    const avatarImages: Record<string, string> = {
      blue: '/avatars/blue-avatar.svg',
      red: '/avatars/red-avatar.svg',
      green: '/avatars/green-avatar.svg',
      purple: '/avatars/purple-avatar.svg',
      gold: '/avatars/gold-avatar.svg',
      rainbow: '/avatars/rainbow-avatar.svg',
    };
    return avatarImages[skinId] || '/avatars/default-avatar.svg';
  };