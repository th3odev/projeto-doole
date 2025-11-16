const SUPABASE_URL = "https://zmgeocukcfhzywndpfus.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ2VvY3VrY2Zoenl3bmRwZnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTIyNTIsImV4cCI6MjA3ODQ2ODI1Mn0.CvVp2RvgUhDYX6HVKEm-NYeWXmL8go2MlCyyTvpnAhc";

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    const { data, error } = await window.supabase
      .from("categories")
      .select("*")
      .limit(1);
    if (error) throw error;
    console.log("✅ Supabase conectado e acessando db!");
  } catch (err) {
    console.error("❌ Erro na conexão com Supabase:", err.message);
  }
})();
