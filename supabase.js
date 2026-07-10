// supabase.js
// Configuración de Supabase
// Reemplaza estas credenciales con las de tu proyecto real de Supabase.

const supabaseUrl = "https://ozzxvackrzbwheizczmi.supabase.co"; // Tu URL del proyecto (Ej: https://xxxx.supabase.co)
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96enh2YWNrcnpid2hlaXpjem1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTUwMjUsImV4cCI6MjA5OTI5MTAyNX0.UaEzglE6XZEgGTqAN8lbZx07vLoiCC8OJP0e9xYvkcU"; // Tu clave pública anónima (Anon Key)

let supabase = null;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== "TU_SUPABASE_URL";

if (isSupabaseConfigured) {
  try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase inicializado con éxito.");
  } catch (error) {
    console.error("Error al inicializar Supabase:", error);
  }
} else {
  console.warn("Supabase no configurado. Configura supabaseUrl y supabaseAnonKey en supabase.js.");
}

// Exportar globalmente para que lo usen auth.js, app.js y songsService.js
window.supabaseClient = supabase;
