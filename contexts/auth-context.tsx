"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface WaterUsage {
  daily: number;
  weekly: number;
  monthly: number;
  yearlyAverage: number;
  lastUpdated: Date;
}

interface User {
  id: string;
  email: string;
  name?: string;
  waterUsage?: WaterUsage;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  waterUsage: WaterUsage | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateWaterUsage: (usage: Partial<WaterUsage>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterUsage, setWaterUsage] = useState<WaterUsage | null>(null);
  const router = useRouter();

  const fetchWaterUsage = async (userId: string) => {
    try {
      console.log("Fetching water usage for user:", userId);
      const { data, error } = await supabase
        .from("water_usage")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching water usage:", error);
        // Initialize with default data if no existing data
        const defaultData = {
          daily: 285,
          weekly: 1950,
          monthly: 8500,
          yearlyAverage: 300,
          lastUpdated: new Date(),
        };
        await updateWaterUsage(defaultData);
        return;
      }

      if (data) {
        console.log("Received water usage data:", data);
        setWaterUsage({
          daily: data.daily_usage,
          weekly: data.weekly_usage,
          monthly: data.monthly_usage,
          yearlyAverage: data.yearly_average,
          lastUpdated: new Date(data.last_updated),
        });
      } else {
        // Initialize with default data if no existing data
        const defaultData = {
          daily: 285,
          weekly: 1950,
          monthly: 8500,
          yearlyAverage: 300,
          lastUpdated: new Date(),
        };
        await updateWaterUsage(defaultData);
      }
    } catch (error) {
      console.error("Error in fetchWaterUsage:", error);
      toast({
        title: "Error",
        description: "Failed to fetch water usage data. Using default values.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check active sessions
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name,
          };
          setUser(userData);
          await fetchWaterUsage(userData.id);
        }
        setLoading(false);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            const userData = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.name,
            };
            setUser(userData);
            await fetchWaterUsage(userData.id);
          } else {
            setUser(null);
            setWaterUsage(null);
          }
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateWaterUsage = async (usage: Partial<WaterUsage>) => {
    if (!user) return;

    try {
      console.log("Updating water usage:", usage);
      const { error } = await supabase.from("water_usage").upsert({
        user_id: user.id,
        daily_usage: usage.daily ?? waterUsage?.daily ?? 0,
        weekly_usage: usage.weekly ?? waterUsage?.weekly ?? 0,
        monthly_usage: usage.monthly ?? waterUsage?.monthly ?? 0,
        yearly_average: usage.yearlyAverage ?? waterUsage?.yearlyAverage ?? 0,
        last_updated: new Date().toISOString(),
      });

      if (error) {
        console.error("Error updating water usage:", error);
        toast({
          title: "Error",
          description: "Failed to update water usage data.",
          variant: "destructive",
        });
        throw error;
      }

      // Update local state
      setWaterUsage((prev) => {
        if (!prev) {
          return {
            daily: usage.daily ?? 0,
            weekly: usage.weekly ?? 0,
            monthly: usage.monthly ?? 0,
            yearlyAverage: usage.yearlyAverage ?? 0,
            lastUpdated: new Date(),
          };
        }
        return {
          ...prev,
          ...usage,
          lastUpdated: new Date(),
        };
      });

      toast({
        title: "Success",
        description: "Water usage data updated successfully.",
      });
    } catch (error) {
      console.error("Error in updateWaterUsage:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        waterUsage,
        signIn,
        signUp,
        signOut,
        updateWaterUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
