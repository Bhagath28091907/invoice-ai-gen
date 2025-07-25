import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  credits: number | null;
  isUnlimited: boolean;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const refreshCredits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("credits_remaining, is_unlimited, unlimited_expires_at")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        const now = new Date();
        const expiresAt = data.unlimited_expires_at ? new Date(data.unlimited_expires_at) : null;
        const unlimited = data.is_unlimited && (!expiresAt || expiresAt > now);
        
        setCredits(data.credits_remaining);
        setIsUnlimited(unlimited);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Fetch credits when user signs in
        if (session?.user) {
          setTimeout(() => {
            refreshCredits();
          }, 0);
        } else {
          setCredits(null);
          setIsUnlimited(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    credits,
    isUnlimited,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};