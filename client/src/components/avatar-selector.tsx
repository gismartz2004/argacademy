import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Skin {
  id: string;
  name: string;
  price: number;
  rarity: string;
  imageUrl: string;
}

interface AvatarSelectorProps {
  currentSkinId: string;
  userCoins: number;
  onSkinChange: (skinId: string) => void;
  trigger?: React.ReactNode;
}

export function AvatarSelector({ currentSkinId, userCoins, onSkinChange, trigger }: AvatarSelectorProps) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [userOwnedSkins, setUserOwnedSkins] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSkins();
      fetchUserSkins();
    }
  }, [open]);

  const fetchSkins = async () => {
    try {
      const response = await fetch('/api/skins');
      if (response.ok) {
        const data = await response.json();
        setSkins(data);
      }
    } catch (error) {
      console.error('Error fetching skins:', error);
    }
  };

  const fetchUserSkins = async () => {
    try {
      const response = await fetch('/api/user/skins');
      if (response.ok) {
        const data = await response.json();
        setUserOwnedSkins(data.map((skin: any) => skin.skinId));
      }
    } catch (error) {
      console.error('Error fetching user skins:', error);
    }
  };

  const handlePurchaseSkin = async (skin: Skin) => {
    if (userCoins < skin.price) {
      toast({
        title: "Monedas insuficientes",
        description: `Necesitas ${skin.price - userCoins} monedas más para comprar este avatar.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/skins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skinId: skin.id }),
      });

      if (response.ok) {
        setUserOwnedSkins(prev => [...prev, skin.id]);
        onSkinChange(skin.id);
        toast({
          title: "¡Avatar comprado!",
          description: `Has adquirido el avatar ${skin.name}.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error al comprar",
          description: error.message || "No se pudo completar la compra.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la compra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSkin = (skinId: string) => {
    onSkinChange(skinId);
    toast({
      title: "Avatar cambiado",
      description: "Tu avatar ha sido actualizado.",
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400/50';
      case 'epic': return 'text-purple-400 border-purple-400/50';
      case 'rare': return 'text-blue-400 border-blue-400/50';
      default: return 'text-gray-400 border-gray-400/50';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'Legendario';
      case 'epic': return 'Épico';
      case 'rare': return 'Raro';
      default: return 'Común';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-cyan-400/50 text-cyan-400">
            Cambiar Avatar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-black/95 border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white text-center">Selecciona tu Avatar</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {skins.map((skin) => {
            const isOwned = userOwnedSkins.includes(skin.id);
            const isSelected = currentSkinId === skin.id;

            return (
              <motion.div
                key={skin.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className={`relative bg-black/60 border-white/10 backdrop-blur-sm transition-all duration-300 ${
                  isSelected ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : ''
                }`}>
                  <CardContent className="p-4 text-center">
                    {/* Avatar Preview */}
                    <div className="relative mb-3">
                      <Avatar className="w-16 h-16 mx-auto border-2 border-white/20">
                        <AvatarImage src={skin.imageUrl} alt={skin.name} />
                        <AvatarFallback className="bg-gray-600 text-white">
                          {skin.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {/* Lock Indicator */}
                      {!isOwned && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Skin Info */}
                    <h3 className="text-sm font-medium text-white mb-1">{skin.name}</h3>
                    <Badge variant="outline" className={`text-xs mb-3 ${getRarityColor(skin.rarity)}`}>
                      {getRarityBadge(skin.rarity)}
                    </Badge>

                    {/* Action Button */}
                    <div className="space-y-2">
                      {isOwned ? (
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={isSelected ? "bg-cyan-600 hover:bg-cyan-500" : "border-white/20"}
                          onClick={() => handleSelectSkin(skin.id)}
                          disabled={isSelected}
                        >
                          {isSelected ? "Seleccionado" : "Seleccionar"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                          onClick={() => handlePurchaseSkin(skin)}
                          disabled={loading || userCoins < skin.price}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          {skin.price}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* User Coins Display */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg border border-white/10">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">{userCoins} Monedas</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}