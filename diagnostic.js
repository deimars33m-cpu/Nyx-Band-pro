// diagnostic.js
const supabaseUrl = "https://ozzxvackrzbwheizczmi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96enh2YWNrcnpid2hlaXpjem1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTUwMjUsImV4cCI6MjA5OTI5MTAyNX0.UaEzglE6XZEgGTqAN8lbZx07vLoiCC8OJP0e9xYvkcU";

async function queryTable(tableName) {
  const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const status = res.status;
    const body = await res.text();
    console.log(`\n--- Tabla: ${tableName} (Status: ${status}) ---`);
    if (res.ok) {
      console.log("✅ Respuesta:", body);
    } else {
      console.error("❌ Error de API:", body);
    }
  } catch (e) {
    console.error(`❌ Error al conectar con '${tableName}':`, e.message);
  }
}

async function run() {
  console.log("Iniciando diagnóstico HTTP de Supabase...");
  await queryTable('bands');
  await queryTable('users');
  await queryTable('members');
}

run();
