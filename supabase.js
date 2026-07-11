// supabase.js
// Configuración de Supabase
// Reemplaza estas credenciales con las de tu proyecto real de Supabase.

const supabaseUrl = "https://ozzxvackrzbwheizczmi.supabase.co"; // Tu URL del proyecto (Ej: https://xxxx.supabase.co)
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96enh2YWNrcnpid2hlaXpjem1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTUwMjUsImV4cCI6MjA5OTI5MTAyNX0.UaEzglE6XZEgGTqAN8lbZx07vLoiCC8OJP0e9xYvkcU"; // Tu clave pública anónima (Anon Key)

let supabaseInstance = null;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== "TU_SUPABASE_URL";

if (isSupabaseConfigured) {
  try {
    if (typeof window.supabase === "undefined" || !window.supabase) {
      throw new Error("El SDK global de Supabase no se cargó correctamente desde el CDN (window.supabase es undefined). Revisa tu conexión o desactiva tu bloqueador de anuncios.");
    }
    supabaseInstance = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase inicializado con éxito.");
  } catch (error) {
    console.error("Error al inicializar Supabase:", error);
    
    // Si estamos en la pantalla de auth, mostrar el error visualmente
    setTimeout(() => {
      const errorAuth = document.getElementById("errorAuth");
      if (errorAuth) {
        errorAuth.textContent = error.message;
        errorAuth.style.display = "block";
      } else {
        alert("Error crítico de Conexión:\n" + error.message);
      }
    }, 500);
  }
} else {
  console.warn("Supabase no configurado. Configura supabaseUrl y supabaseAnonKey en supabase.js.");
}

// Exportar globalmente para que lo usen auth.js, app.js y songsService.js
window.supabaseClient = supabaseInstance;

// Sistema de logs de diagnóstico persistentes (se mantienen al redirigir páginas)
window.logDebug = function(msg) {
  console.log("[DEBUG]", msg);
  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem("coop_debug_logs") || "[]");
  } catch(e) {
    logs = [];
  }
  logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (logs.length > 40) logs.shift();
  localStorage.setItem("coop_debug_logs", JSON.stringify(logs));
  
  const linesEl = document.getElementById("auth-debug-lines");
  if (linesEl) {
    linesEl.innerHTML = logs.map(line => `<div>${line}</div>`).join("");
    linesEl.scrollTop = linesEl.scrollHeight;
  }
};
logDebug("supabase.js cargado e inicializado.");
