// AuthProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://gdjiogpkggjwcptkosdy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkamlvZ3BrZ2dqd2NwdGtvc2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MDgyNTgsImV4cCI6MjA1NDE4NDI1OH0.Ns6omhS2IgQWPQ6KUtJ8V2u9WN9Ckc5-jXVU1Z_2wmY"
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};
