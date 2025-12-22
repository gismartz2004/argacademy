import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Coins, Star, Trophy, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentProfileProps {
  user: {
    id: string;
    username: string;
    avatarSkinId: string;
    totalXp: number;
    coins: number;
    currentLevelId: number;
  };
  onAvatarChange?: () => void;
}

export function StudentProfile({ user, onAvatarChange }: StudentProfileProps) {
  // Calculate level from XP (assuming 1000 XP per level)
  const level = Math.floor(user.totalXp / 1000) + 1;
  const xpForNextLevel = (level) * 1000;
  const xpProgress = ((user.totalXp % 1000) / 1000) * 100;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="bg-black/80 border-white/20 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Perfil del Estudiante
            </CardTitle>
            {onAvatarChange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAvatarChange}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar and Username */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-cyan-400/50">
              <AvatarImage src={getAvatarImage(user.avatarSkinId)} alt={user.username} />
              <AvatarFallback className="bg-cyan-600 text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-white">{user.username}</h3>
              <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 mt-1">
                Nivel {level}
              </Badge>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Experiencia</span>
              <span className="text-cyan-400 font-medium">
                {user.totalXp} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
              <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-yellow-400">{user.coins}</div>
              <div className="text-xs text-zinc-400">Monedas</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
              <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-400">{user.currentLevelId}</div>
              <div className="text-xs text-zinc-400">Nivel Actual</div>
            </div>
          </div>

          {/* Achievement Badge */}
          {level >= 5 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/30"
            >
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-yellow-400">¡Experto!</div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}