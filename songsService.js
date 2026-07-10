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
      return data || [];
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
      const { id, ...data } = song;
      const record = {
        id: id,
        band_id: bandId,
        title: data.title,
        artist: data.artist || "",
        lyrics: data.lyrics || "",
        chords: data.chords || "",
        bpm: data.bpm || 120,
        status: data.status || "pendiente"
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
        chords: song.chords || "",
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
