import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserProfile {
  user: {
    id: string;
    username: string;
    avatarSkinId: string;
    totalXp: number;
    coins: number;
    currentLevelId: number;
  };
  ownedSkins: string[];
  completedLevels: number[];
}

export interface Skin {
  id: string;
  name: string;
  price: number;
  rarity: string;
  imageUrl: string;
}

// Get user profile
export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });
}

// Complete a level
export function useCompleteLevel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ levelId, xpEarned }: { levelId: number; xpEarned: number }) => {
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId, xpEarned }),
      });
      if (!res.ok) throw new Error("Failed to complete level");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

// Get all skins
export function useSkins() {
  return useQuery<Skin[]>({
    queryKey: ["skins"],
    queryFn: async () => {
      const res = await fetch("/api/skins");
      if (!res.ok) throw new Error("Failed to fetch skins");
      return res.json();
    },
  });
}

// Purchase skin
export function usePurchaseSkin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ skinId, price }: { skinId: string; price: number }) => {
      const res = await fetch("/api/skins/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId, price }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to purchase skin");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

// Equip skin
export function useEquipSkin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skinId: string) => {
      const res = await fetch("/api/skins/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId }),
      });
      if (!res.ok) throw new Error("Failed to equip skin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

// Get leaderboard
export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}
