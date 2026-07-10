// supabase.js
// Configuración de Supabase
// Reemplaza estas credenciales con las de tu proyecto real de Supabase.

const supabaseUrl = "https://ozzxvackrzbwheizczmi.supabase.co"; // Tu URL del proyecto (Ej: https://xxxx.supabase.co)
const supabaseAnonKey = "sb_publishable_-8hn6CLEuBkhSWzAb7zYdQ_la9R9e5F"; // Tu clave pública anónima (Anon Key)

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
