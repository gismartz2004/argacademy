import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Coins, Settings } from 'lucide-react';

interface CompactStudentProfileProps {
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

export function CompactStudentProfile({ user, onAvatarChange }: CompactStudentProfileProps) {
  // Calculate level from XP (assuming 1000 XP per level)
  const level = Math.floor(user.totalXp / 1000) + 1;

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
    <div className="flex items-center gap-2 lg:gap-4">
      {/* Avatar */}
      <Avatar className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-cyan-400/50">
        <AvatarImage src={getAvatarImage(user.avatarSkinId)} alt={user.username} />
        <AvatarFallback className="bg-cyan-600 text-white font-bold text-xs">
          {user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm truncate">{user.username}</span>
          <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 text-xs px-1 py-0">
            {level}
          </Badge>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span className="hidden sm:inline">{user.coins}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span>XP: {user.totalXp}</span>
          </div>
        </div>
      </div>

      {/* Settings Button */}
      {onAvatarChange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAvatarChange}
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 p-1 lg:p-2"
        >
          <Settings className="w-3 h-3 lg:w-4 lg:h-4" />
        </Button>
      )}
    </div>
  );
}