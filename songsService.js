// songsService.js
// Servicio de datos para Repertorio — SOLO SUPABASE

const SongsService = {
  _getBandId() {
    return (window.state && window.state.currentBandId) ? window.state.currentBandId : "KAWSAY";
  },

  // Obtener todas las canciones desde Supabase (PostgreSQL)
  async getAllSongs() {
    const bandId = this._getBandId();
    const supabase = window.supabaseClient;
    if (!supabase) {
      console.warn("Supabase no disponible — retornando array vacío");
      return [];
    }
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('band_id', bandId);

      if (error) throw error;
      
      // Mapear y parsear metadatos guardados en la columna chords
      return (data || []).map(song => {
        let metadata = { key: "C", timeSig: "4/4", rhythm: "Pop" };
        if (song.chords) {
          try {
            metadata = JSON.parse(song.chords);
          } catch (e) {
            // fallback si no es JSON válido (texto plano antiguo)
          }
        }
        return {
          ...song,
          key: metadata.key || "C",
          timeSig: metadata.timeSig || "4/4",
          rhythm: metadata.rhythm || "Pop",
          interpretes: metadata.interpretes || null,
          linePerformers: metadata.linePerformers || null,
          grabaciones_ensayo: metadata.grabaciones_ensayo || null,
          lineNotes: metadata.lineNotes || null,
          lineAudios: metadata.lineAudios || null,
          notas_globales: metadata.notas_globales || null,
          tareas_ensayo: metadata.tareas_ensayo || null,
          audios: metadata.audios || null,
          image: metadata.image || "",
          // mantenemos la referencia por si se necesita
          chords: song.chords
        };
      });
    } catch (error) {
      console.error("Error al obtener canciones de Supabase:", error);
      return [];
    }
  },

  // Guardar o actualizar una sola canción en Supabase
  async saveSong(song) {
    const bandId = this._getBandId();
    const supabase = window.supabaseClient;
    if (!supabase) {
      console.warn("Supabase no disponible — canción no guardada");
      return song;
    }
    try {
      const record = {
        id: song.id,
        band_id: bandId,
        title: song.title,
        artist: song.artist || "",
        lyrics: song.lyrics || "",
        // Guardamos los metadatos serializados en chords
        chords: JSON.stringify({
          key: song.key || "C",
          timeSig: song.timeSig || "4/4",
          rhythm: song.rhythm || "Pop",
          interpretes: song.interpretes || null,
          linePerformers: song.linePerformers || null,
          grabaciones_ensayo: song.grabaciones_ensayo || null,
          lineNotes: song.lineNotes || null,
          lineAudios: song.lineAudios || null,
          notas_globales: song.notas_globales || null,
          tareas_ensayo: song.tareas_ensayo || null,
          audios: song.audios || null,
          image: song.image || ""
        }),
        bpm: song.bpm || 120,
        status: song.status || "pendiente"
      };

      const { error } = await supabase
        .from('songs')
        .upsert(record);

      if (error) throw error;
      return song;
    } catch (error) {
      console.error("Error al guardar canción en Supabase:", error);
      throw error;
    }
  },

  // Eliminar una canción de Supabase
  async deleteSong(songId) {
    const bandId = this._getBandId();
    const supabase = window.supabaseClient;
    if (!supabase) {
      console.warn("Supabase no disponible — canción no eliminada");
      return false;
    }
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)
        .eq('band_id', bandId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error al eliminar canción en Supabase:", error);
      throw error;
    }
  },

  // Guardar todas las canciones de golpe (sincronización o importación masiva)
  async saveAllSongs(songsArray) {
    const bandId = this._getBandId();
    const supabase = window.supabaseClient;
    if (!supabase) {
      console.warn("Supabase no disponible — canciones no guardadas");
      return false;
    }
    if (!songsArray || songsArray.length === 0) return true;

    try {
      const records = songsArray.map(song => ({
        id: song.id,
        band_id: bandId,
        title: song.title,
        artist: song.artist || "",
        lyrics: song.lyrics || "",
        chords: JSON.stringify({
          key: song.key || "C",
          timeSig: song.timeSig || "4/4",
          rhythm: song.rhythm || "Pop",
          interpretes: song.interpretes || null,
          linePerformers: song.linePerformers || null,
          grabaciones_ensayo: song.grabaciones_ensayo || null,
          lineNotes: song.lineNotes || null,
          lineAudios: song.lineAudios || null,
          notas_globales: song.notas_globales || null,
          tareas_ensayo: song.tareas_ensayo || null,
          audios: song.audios || null
        }),
        bpm: song.bpm || 120,
        status: song.status || "pendiente"
      }));

      const { error } = await supabase
        .from('songs')
        .upsert(records);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error al guardar lote de canciones en Supabase:", error);
      throw error;
    }
  }
};

window.SongsService = SongsService;
