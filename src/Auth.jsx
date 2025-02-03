import { Auth } from "@supabase/auth-ui-react";
import { createClient } from "@supabase/supabase-js";

import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";

const supabase = createClient(
  "https://gdjiogpkggjwcptkosdy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkamlvZ3BrZ2dqd2NwdGtvc2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MDgyNTgsImV4cCI6MjA1NDE4NDI1OH0.Ns6omhS2IgQWPQ6KUtJ8V2u9WN9Ckc5-jXVU1Z_2wmY"
);

export default function App() {
  return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
}
