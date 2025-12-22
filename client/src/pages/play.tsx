import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Star, Lock, CheckCircle, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { StudentWorldResources } from "@/components/student-world-resources";
import { StudentProfile } from "@/components/student-profile";
import { AvatarSelector } from "@/components/avatar-selector";
import { WorldBackground } from "@/components/world-background";
import { LevelCheckpoint } from "@/components/level-checkpoint";
import { CompactStudentProfile } from "@/components/compact-student-profile";
import { cn } from "@/lib/utils";

export default function PlayWorld() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const worldId = parseInt(new URLSearchParams(search).get("world") || "1");

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showResources, setShowResources] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Fetch world data
  const { data: world } = useQuery({
    queryKey: [`/api/worlds/${worldId}`],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}`);
      if (!res.ok) throw new Error("Failed to fetch world");
      return res.json();
    }
  });

  // Fetch world content
  const { data: content = [] } = useQuery({
    queryKey: [`/api/worlds/${worldId}/content`],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/content`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    }
  });

  // Fetch user progress
  const { data: userProgress = [] } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    }
  });

  // Group content by level
  const levelsData = [1, 2, 3, 4, 5].map(level => ({
    level,
    content: content.filter((c: any) => c.level === level),
    completed: userProgress.some((p: any) => p.levelId === level && p.completed),
    locked: level > (user?.currentLevelId || 1)
  }));

  const handleAvatarChange = async (newSkinId: string) => {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarSkinId: newSkinId }),
      });

      if (response.ok) {
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleLevelClick = (level: number) => {
    const levelData = levelsData.find(l => l.level === level);
    if (!levelData?.locked) {
      setSelectedLevel(level);
      setShowResources(true);
    }
  };

  const getLevelStatus = (levelData: any) => {
    if (levelData.locked) return "locked";
    if (levelData.completed) return "completed";
    return "available";
  };

  const getLevelIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "locked":
        return <Lock className="w-6 h-6 text-gray-500" />;
      default:
        return <MapPin className="w-6 h-6 text-cyan-400" />;
    }
  };

  if (!world) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Cargando mundo...</p>
        </div>
      </div>
    );
  }

  return (
    <WorldBackground
      worldId={worldId}
      worldName={world?.name || "Mundo Desconocido"}
      worldImageUrl={world?.imageUrl}
    >
      {/* Header */}
      <div className="relative z-10 h-16 lg:h-20 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/galaxy")}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-2xl font-black tracking-tight truncate">{world?.name}</h1>
            <p className="text-xs lg:text-sm text-zinc-400 truncate">{world?.description}</p>
          </div>
        </div>

        {/* Compact Student Profile - Hidden on lg+ screens where sidebar is visible */}
        {user && (
          <div className="lg:hidden">
            <CompactStudentProfile
              user={user}
              onAvatarChange={() => setShowAvatarSelector(true)}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
        {/* Left Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl lg:text-4xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                MAPA DE LA MISIÓN
              </h2>
              <p className="text-zinc-400 text-sm lg:text-base max-w-2xl mx-auto px-4">
                Completa los 5 niveles de este mundo para dominar sus conocimientos.
                Cada punto de control representa un desafío único.
              </p>
            </div>

            {/* Level Path Visualization */}
            <div className="relative">
              {/* Connecting Path */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600/20 via-cyan-400/40 to-blue-500/20 transform -translate-y-1/2 z-0"></div>

              {/* Level Checkpoints */}
              <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-8 lg:gap-12">
                {levelsData.map((levelData, index) => {
                  const status = getLevelStatus(levelData);

                  return (
                    <LevelCheckpoint
                      key={levelData.level}
                      level={levelData.level}
                      status={status}
                      avatarSkinId={user?.avatarSkinId || "blue"}
                      username={user?.username || "Estudiante"}
                      onClick={() => handleLevelClick(levelData.level)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="mt-12 lg:mt-16 text-center">
              <Card className="bg-black/60 border-white/10 backdrop-blur-sm max-w-sm lg:max-w-md mx-auto">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-center gap-2 lg:gap-4 mb-4">
                    <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />
                    <span className="text-lg lg:text-2xl font-bold">
                      {levelsData.filter(l => l.completed).length} / 5 Niveles
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 lg:h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 lg:h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(levelsData.filter(l => l.completed).length / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs lg:text-sm text-zinc-400">
                    {levelsData.filter(l => l.completed).length === 5
                      ? "¡Mundo completado! 🎉"
                      : `${5 - levelsData.filter(l => l.completed).length} niveles restantes`}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Student Profile */}
        {user && (
          <div className="w-full lg:w-80 p-4 lg:p-8">
            <div className="lg:sticky lg:top-8">
              <StudentProfile
                user={user}
                onAvatarChange={() => setShowAvatarSelector(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Student World Resources Modal */}
      <StudentWorldResources
        worldId={worldId}
        isOpen={showResources}
        onClose={() => {
          setShowResources(false);
          setSelectedLevel(null);
        }}
        worldName={world?.name || "Mundo"}
        selectedLevel={selectedLevel}
      />

      {/* Avatar Selector */}
      {user && (
        <AvatarSelector
          currentSkinId={user.avatarSkinId}
          userCoins={user.coins}
          onSkinChange={handleAvatarChange}
        />
      )}
    </WorldBackground>
  );
}