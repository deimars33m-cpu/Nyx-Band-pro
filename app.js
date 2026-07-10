// Lógica principal de la aplicación Repertorio Co-op

// Regex para validar si un token luce como un acorde
const CHORD_TOKEN_REGEX = /^[A-G][#b]?(m|min|maj|dim|aug|sus|add|maj7|m7|7|9|11|13|m7b5|dim7)?(\d)?(\/[A-G][#b]?)?$/i;

// Detectar si una línea representa una cabecera de sección (ej: [VERSO 1], [CORO])
function isSectionHeader(line) {
  const t = line.trim();
  if (t.startsWith("[") && t.endsWith("]") && t.indexOf("][") === -1) {
    const inner = t.slice(1, -1).trim();
    if (inner.includes("[") || inner.includes("]")) return false;
    return !CHORD_TOKEN_REGEX.test(inner);
  }
  return false;
}

// --- DATOS POR DEFECTO ---
const DEFAULT_SONGS = [
  {
    id: "s1",
    title: "De Música Ligera",
    artist: "Soda Stereo",
    bpm: 190,
    key: "Bm",
    timeSig: "4/4",
    status: "ready",
    lastEdit: "hace 2 horas",
    image: "./assets/musica_ligera.png",
    rhythm: "↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑",
    lyrics: `[Bm] Ella durmió al calor de las masas [G]
Y yo desperté [D] queriendo soñarla [A]

[Bm] Algún tiempo atrás pensé en escribirle [G]
Y nunca busqué [D] las cosas sencillas [A]

[Bm] Ella usó mi cabeza como una alucinación [G]
Y de pronto el día [D] de la copa se rompió [A]

[Bm] De aquel amor [G] de música ligera [D] [A]
[Bm] Nada nos libra [G] nada más queda [D] [A]

[Bm] No me envíes [G] cenizas de rosas [D] [A]
[Bm] Ni pienses en [G] el poder sentir cosas [D] [A]

[Bm] De aquel amor [G] de música ligera [D] [A]
[Bm] Nada nos libra [G] nada más queda [D] [A]`
  },
  {
    id: "s2",
    title: "Lamento Boliviano",
    artist: "Enanitos Verdes",
    bpm: 110,
    key: "Em",
    timeSig: "4/4",
    status: "practicing",
    lastEdit: "hace 2 horas",
    image: "./assets/lamento_boliviano.png",
    rhythm: "↓  ↓↑  ↑↓↑",
    lyrics: `[Em] Me quieren agitar [Bm]
[Am] Me incitan a gritar [Em]

[Em] Soy como una roca [Bm]
[Am] Palabras no me tocan [Em]

[Em] Adentro hay un volcán [Bm]
[Am] Que pronto va a estallar [Em]
[Em] Yo quiero estar tranquilo [Bm]
[Am] Es mi situación [Em]

[G] Y yo estoy aquí [D]
Borracho y [Am] loco [Em]
[G] Y mi corazón [D] idiota
Siempre [Am] brillará [Em]

[G] Y yo estoy aquí [D]
Borracho y [Am] loco [Em]
[G] Y mi corazón [D] idiota
Siempre [Am] brillará [Em]`
  },
  {
    id: "s3",
    title: "Creep",
    artist: "Radiohead",
    bpm: 92,
    key: "G",
    timeSig: "4/4",
    status: "todo",
    lastEdit: "hace 2 horas",
    image: "./assets/creep.png",
    rhythm: "↓  ↓↑  ↑↓↑",
    lyrics: `[G] When you were here before
[B] Couldn't look you in the eye
[C] You're just like an angel
[Cm] Your skin makes me cry

[G] You float like a feather
[B] In a beautiful world
[C] I wish I was special
[Cm] You're so very special

But I'm a [G] creep, I'm a [B] weirdo
What the hell am I [C] doing here?
I don't belong [Cm] here

[G] I don't care if it hurts
[B] I wanna have control
[C] I want a perfect body
[Cm] I want a perfect soul`
  },
  {
    id: "s4",
    title: "Yesterday",
    artist: "Boyz II Men",
    bpm: 76,
    key: "F",
    timeSig: "4/4",
    status: "ready",
    lastEdit: "hace 1 hora",
    image: "./assets/yesterday.png",
    rhythm: "↓  ↓  ↓  ↓",
    lyrics: `[F] Yesterday [Em7] [A7]
All my [Dm] troubles seemed so [Dm/C] far away [Bb]
[C7] Now it looks as though they're [F] here to stay [C/E]
[Dm] Oh, I [G7] believe in [Bb] yester [F] day

[F] Suddenly [Em7] [A7]
I'm not [Dm] half the man I [Dm/C] used to be [Bb]
[C7] There's a shadow [F] hanging over me [C/E]
[Dm] Oh, yester [G7] day [Bb] came sudden [F] ly

[A7] Why she [Dm] had [C] to [Bb] go
I don't [C] know, she wouldn't [F] say
[A7] I said [Dm] some [C] thing [Bb] wrong
Now I [C7] long for yester [F] day`
  }
];

// --- ESTADO GENERAL ---
let state = {
  songs: [],
  currentTab: "repertorio",
  activeSongId: null,
  filters: {
    status: "all",
    search: ""
  },
  favoritesChords: [],
  currentChord: "C",
  currentInstrument: "guitar", // guitar o piano
  dictMode: "chords", // chords o scales
  rehearsalViewMode: "classic", // "classic" o "timeline"
  timelineActiveIndex: 0,
  currentScale: "ionian",
  currentScaleRoot: 0, // C (semitono 0)
  chordFilterRoot: "C",
  chordFilterType: "",
  
  // Caja de Ritmos
  drumMachine: {
    enabled: false,
    currentStep: 0,
    selectedPattern: "rock",
    grid: {
      kick:  [true,  false, false, false, true,  false, false, false],
      snare: [false, false, true,  false, false, false, true,  false],
      hihat: [true,  false, true,  false, true,  false, true,  false]
    }
  },

  // Metrónomo
  metronome: {
    isPlaying: false,
    bpm: 120,
    beatsPerMeasure: 4,
    currentBeat: 0,
    intervalId: null,
    audioScheduled: false,
    isMuted: false,
    volume: 0.8
  },
  
  // Scroll Automático
  autoScroll: {
    isActive: false,
    speed: 1.5, // factor multiplicador
    intervalId: null
  },
  
  // Grabadora
  recorder: {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    recordings: [],
    stream: null,
    analyser: null,
    animationFrameId: null
  },

  // Reproducción de Grabaciones en Barra de Transporte
  playback: {
    audio: null,
    recordingId: null,
    isPlaying: false,
    animationFrameId: null
  },

  // Integrantes de la Banda
  members: [],

  // Modo de edición del editor
  editorMode: "chords", // "chords" | "interventions"
  horizontalLabels: false,
  activeSectionIndex: null,
  selectedLineIndices: [],

  // Autenticación y Multi-Tenant
  currentUser: null,
  currentBandId: null, // "KAWSAY" u otro ID
  bandMetadata: {
    name: "NYX Band-Pro", // Nombre por defecto o fallback
    logoUrl: null,
    settings: {}
  },
  isLoginMode: true // true: login, false: registro
};
window.state = state;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  try {
    initEventHandlers();
    clearObsoleteLocalStorage();
  } catch (err) {
    console.error("Error on DOMContentLoaded:", err);
  }
});

// Limpia datos obsoletos de localStorage para evitar contaminación de cache
function clearObsoleteLocalStorage() {
  localStorage.removeItem("coop_songs");
  localStorage.removeItem("coop_members");
  localStorage.removeItem("coop_band_metadata");
  localStorage.removeItem("coop_fav_chords");
  // Mantener solo currentBandId y requestedBandId para la inicialización rápida
}

async function loadSongsFromDB() {
  if (window.SongsService) {
    try {
      const fbSongs = await window.SongsService.getAllSongs();
      if (fbSongs !== null && fbSongs !== undefined) {
        state.songs = fbSongs;
        
        // Re-renderizar la UI
        renderApp();
        if (state.activeSongId) {
          renderRehearsalRoom();
        }
      }
    } catch (e) {
      console.error("Error al cargar canciones de Firebase:", e);
    }
  }
}

async function loadMembersFromDB() {
  if (window.supabaseClient && state.currentBandId) {
    try {
      const { data, error } = await window.supabaseClient
        .from('members')
        .select('*')
        .eq('band_id', state.currentBandId);
      if (error) throw error;
      
      // Adaptar el formato de la base de datos relacional al estado local de la app
      state.members = (data || []).map(m => ({
        name: m.name,
        role: m.role,
        instruments: m.instruments || "",
        vocals: m.vocals || "Ninguna",
        color: m.color || "#00e5ff",
        linkedUid: m.user_id,
        email: m.email || "",
        unidoEn: m.joined_at
      }));
      renderMembersList();
    } catch (e) {
      console.error("Error al cargar integrantes de Supabase:", e);
    }
  }
}

async function loadFavoriteChordsFromDB() {
  if (window.supabaseClient && state.currentBandId) {
    try {
      const { data, error } = await window.supabaseClient
        .from('fav_chords')
        .select('list')
        .eq('band_id', state.currentBandId)
        .maybeSingle();
      if (error) throw error;
      
      state.favoritesChords = (data && data.list) ? data.list : [];
      renderDictionary();
    } catch (e) {
      console.error("Error al cargar acordes favoritos de Supabase:", e);
    }
  }
}

function saveMembersToDB() {
  if (window.supabaseClient && state.currentBandId) {
    const records = state.members.map(m => ({
      band_id: state.currentBandId,
      user_id: m.linkedUid,
      name: m.name,
      email: m.email || "",
      role: m.role || "Integrante",
      instruments: m.instruments || "",
      vocals: m.vocals || "Ninguna",
      color: m.color || "#00e5ff"
    }));

    window.supabaseClient
      .from('members')
      .upsert(records, { onConflict: 'band_id,user_id' })
      .then(({ error }) => {
        if (error) console.error("Error al guardar integrantes en Supabase:", error);
      });
  }
}

function saveLocalStorage() {
  // Guardado exclusivo en Supabase (sin localStorage)
  if (window.SongsService) {
    if (state.activeSongId) {
      const activeSong = state.songs.find(s => String(s.id) === String(state.activeSongId));
      if (activeSong) {
        window.SongsService.saveSong(activeSong).catch(err => {
          console.error("Error al guardar canción en Supabase:", err);
        });
        return;
      }
    }
    // Fallback
    window.SongsService.saveAllSongs(state.songs).catch(err => {
      console.error("Error al guardar canciones en Supabase:", err);
    });
  }
}

function saveMembers() {
  saveMembersToDB();
}

function saveFavorites() {
  if (window.supabaseClient && state.currentBandId) {
    window.supabaseClient
      .from('fav_chords')
      .upsert({
        band_id: state.currentBandId,
        list: state.favoritesChords
      })
      .catch(err => {
        console.error("Error al guardar acordes favoritos en Supabase:", err);
      });
  }
}

function saveRecordingsState() {
  // Grabaciones locales
}

// ============================================================
// --- INTEGRANTES DE LA BANDA ---
// ============================================================

// Ayudas
function getMemberColor(name) {
  if (!name) return "#ffeb3b";
  const m = state.members.find(m => m.name.toLowerCase() === name.toLowerCase());
  return m ? m.color : "#ffeb3b";
}

function getMemberByName(name) {
  return state.members.find(m => m.name.toLowerCase() === name.toLowerCase()) || null;
}

// Abrir el modal de integrantes
function openMembersModal() {
  closeMobileDrawers();
  const modal = document.getElementById("modal-members");
  if (!modal) return;
  modal.classList.add("open");
  renderMembersList();
  // Small delay so DOM is painted before attaching swatch events
  setTimeout(() => initColorSwatches(), 50);
}

// Cerrar el modal de integrantes
function closeMembersModal() {
  const modal = document.getElementById("modal-members");
  if (!modal) return;
  modal.classList.remove("open");
}

// Inicializar interacción de color swatches
function initColorSwatches() {
  const swatches = document.querySelectorAll("#member-color-picker .color-swatch");
  swatches.forEach(sw => {
    sw.addEventListener("click", () => {
      swatches.forEach(s => {
        s.classList.remove("active");
        s.style.boxShadow = "none";
      });
      sw.classList.add("active");
      const color = sw.getAttribute("data-color");
      sw.style.boxShadow = `0 0 10px ${color}`;
    });
  });
}

// Renderizar lista de integrantes en el modal
function renderMembersList() {
  const list = document.getElementById("members-list");
  if (!list) return;
  if (state.members.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">Aún no hay integrantes. ¡Agrega el primero!</p>`;
    return;
  }
  
  const isAdmin = state.currentUser && (
    state.members.some(m => m.linkedUid === state.currentUser.uid && m.role === "Administrador") ||
    state.members.some(m => m.name.toLowerCase() === state.currentUser.email.split("@")[0].toLowerCase() && m.role === "Administrador")
  );

  list.innerHTML = state.members.map((m, i) => {
    const isLinked = m.linkedUid ? true : false;
    const statusTag = isLinked
      ? `<span style="color:var(--neon-green); font-size:10px; font-weight:bold; margin-left:6px;">● Activo</span>`
      : `<span style="color:var(--text-muted); font-size:10px; margin-left:6px;">○ Creado</span>`;
      
    const removeBtn = isAdmin ? `<button onclick="removeBandMember(${i})" style="background:rgba(255,51,75,0.12); border:1px solid rgba(255,51,75,0.3); color:#ff334b; border-radius:6px; padding:4px 10px; cursor:pointer; font-size:11px;">✕</button>` : '';

    return `
      <div style="display:flex; align-items:center; gap:12px; padding:10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius:10px; flex-wrap: wrap;">
        <div style="width:16px; height:16px; border-radius:50%; background:${m.color}; box-shadow:0 0 8px ${m.color}; flex-shrink:0;"></div>
        <div style="flex:1; min-width: 150px;">
          <span style="font-weight:700; color:${m.color}; text-shadow:0 0 6px ${m.color}; font-size:14px;">${m.name}</span>
          <span style="display:inline-block; margin-left: 6px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); font-size:10px; color:var(--text-secondary);">${m.role || "Integrante"}</span>
          ${statusTag}
        </div>
        <div style="flex: 2; min-width: 200px; font-size: 11px; color: var(--text-secondary); display: flex; gap: 8px; align-items: center;">
          ${m.instruments ? `<span style="background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.3); color: var(--neon-cyan); padding: 2px 6px; border-radius: 4px;">🎸 ${m.instruments}</span>` : ''}
          ${m.vocals && m.vocals !== 'Ninguna' ? `<span style="background: rgba(255,0,127,0.1); border: 1px solid rgba(255,0,127,0.3); color: var(--neon-magenta); padding: 2px 6px; border-radius: 4px;">🎤 ${m.vocals}</span>` : ''}
        </div>
        ${removeBtn}
      </div>
    `;
  }).join("");
  
  // Alternar sección de administración (Solicitudes pendientes)
  const reqSection = document.getElementById("admin-requests-section");
  if (reqSection) {
    if (isAdmin) {
      reqSection.style.display = "block";
      renderPendingRequests();
    } else {
      reqSection.style.display = "none";
    }
  }
}

// Agregar un integrante
function addBandMember() {
  const nameInput = document.getElementById("new-member-name");
  const roleInput = document.getElementById("new-member-role");
  const instInput = document.getElementById("new-member-instruments");
  const vocInput = document.getElementById("new-member-vocals");
  const activeSwatchEl = document.querySelector("#member-color-picker .color-swatch.active");
  
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) { alert("Ingresa el nombre del integrante."); return; }
  if (state.members.find(m => m.name.toLowerCase() === name.toLowerCase())) {
    alert("Ya existe un integrante con ese nombre.");
    return;
  }
  
  const color = activeSwatchEl ? activeSwatchEl.getAttribute("data-color") : "#00e5ff";
  const role = roleInput ? roleInput.value : "Integrante";
  const instruments = instInput ? instInput.value.trim() : "";
  const vocals = vocInput ? vocInput.value : "Ninguna";
  
  state.members.push({ name, role, instruments, vocals, color, linkedUid: null });
  saveMembers();
  
  if (nameInput) nameInput.value = "";
  if (instInput) instInput.value = "";
  if (roleInput) roleInput.value = "Integrante";
  if (vocInput) vocInput.value = "Ninguna";
  
  renderMembersList();
}

// Eliminar un integrante
function removeBandMember(index) {
  state.members.splice(index, 1);
  saveMembers();
  renderMembersList();
}

// ============================================================
// --- MODO DE EDICIÓN DEL EDITOR (Acordes / Intervenciones) ---
// ============================================================

// Datos de intervención en vuelo
let _interventionSelection = null; // { range, text }
let _interventionType = "solo";
let _selectedMembersForIntervention = [];

function setEditorMode(mode) {
  state.editorMode = mode;
  
  const btnChords = document.getElementById("btn-editor-mode-chords");
  const btnInterventions = document.getElementById("btn-editor-mode-interventions");
  const hint = document.getElementById("editor-hint");
  
  if (btnChords && btnInterventions) {
    btnChords.classList.toggle("active", mode === "chords");
    btnInterventions.classList.toggle("active", mode === "interventions");
  }
  
  const editor = document.getElementById("editor-rich-lyrics");
  if (editor) {
    if (mode === "interventions") {
      editor.setAttribute("data-mode", "interventions");
      // Desactivar edición → el toque en móvil selecciona texto en lugar de abrir teclado
      editor.contentEditable = "false";
      editor.style.cursor = "text";
      editor.style.userSelect = "text";
      editor.style.webkitUserSelect = "text";
      if (hint) hint.textContent = "Modo Intervenciones: Selecciona un fragmento de letra para asignar quién lo canta. Los acordes se atenúan para facilitar la lectura.";
      bindInterventionSelectionDetector();
    } else {
      editor.setAttribute("data-mode", "chords");
      // Restaurar edición normal
      editor.contentEditable = "true";
      editor.style.cursor = "";
      editor.style.userSelect = "";
      editor.style.webkitUserSelect = "";
      if (hint) hint.textContent = "Escribe con corchetes (ej: [C]Letra). Clic derecho (PC) o 3s (móvil) en acordes para editarlos.";
      unbindInterventionSelectionDetector();
    }
  }
}

let _interventionMouseUpHandler = null;
let _interventionLongPressTimer = null;
let _interventionLongPressActive = false;

// Guardamos el texto seleccionado INMEDIATAMENTE al soltar el mouse/dedo,
// antes de que el browser colapse la selección al hacer clic en el popup
let _pendingSelectionText = "";
let _savedInterventionRange = null; // Respaldo estable del DOM Range para evitar pérdida de selección al enfocar el popup

function bindInterventionSelectionDetector() {
  // Escuchar en document (no en el editor) para capturar el mouseup
  // incluso si la selección cruza el borde del elemento
  if (_interventionMouseUpHandler) {
    document.removeEventListener("mouseup", _interventionMouseUpHandler);
    document.removeEventListener("touchend", _interventionMouseUpHandler);
  }

  _interventionMouseUpHandler = (e) => {
    if (state.editorMode !== "interventions") return;

    // Ignorar si el clic ocurre dentro del propio popup de intervención
    const popup = document.getElementById("intervention-picker-popup");
    if (popup && (popup === e.target || popup.contains(e.target))) {
      return;
    }

    // Verificar que la selección ocurre DENTRO del editor
    const editor = document.getElementById("editor-rich-lyrics");
    if (!editor) return;

    // Capturar la selección INMEDIATAMENTE (antes del setTimeout)
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const selectedText = sel.toString().trim();
    if (!selectedText) return;

    // Verificar que la selección está dentro del editor
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    // Guardar texto seleccionado AHORA, antes de que el clic en popup lo limpie
    _pendingSelectionText = selectedText;
    _interventionSelection = { text: selectedText };
    _savedInterventionRange = range.cloneRange(); // Clonamos y respaldamos el rango DOM

    // Abrir el picker — usamos requestAnimationFrame para que el render esté listo
    requestAnimationFrame(() => {
      openInterventionPicker(e);
    });
  };

  document.addEventListener("mouseup", _interventionMouseUpHandler);
  document.addEventListener("touchend", _interventionMouseUpHandler);
}

function unbindInterventionSelectionDetector() {
  if (_interventionMouseUpHandler) {
    document.removeEventListener("mouseup", _interventionMouseUpHandler);
    document.removeEventListener("touchend", _interventionMouseUpHandler);
    _interventionMouseUpHandler = null;
  }
  _pendingSelectionText = "";
  _savedInterventionRange = null;
}


function openInterventionPicker(e) {
  const popup = document.getElementById("intervention-picker-popup");
  if (!popup) return;

  _interventionType = "solo";
  _selectedMembersForIntervention = [];

  // Resetear tipo buttons
  document.querySelectorAll(".intervention-type-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-type") === "solo");
  });

  // Render member checkboxes
  renderInterventionMemberList();

  // Clear optional note
  const noteInput = document.getElementById("intervention-note-text");
  if (noteInput) noteInput.value = "";

  // Posicionar popup cerca del cursor/toque
  let x, y;
  if (e.type === "touchend" && e.changedTouches && e.changedTouches[0]) {
    x = e.changedTouches[0].clientX;
    y = e.changedTouches[0].clientY;
  } else {
    x = e.clientX || window.innerWidth / 2;
    y = e.clientY || window.innerHeight / 2;
  }

  popup.style.display = "block";
  popup.style.position = "fixed";
  popup.style.left = Math.min(x + 10, window.innerWidth - 310) + "px";
  popup.style.top = Math.max(y - 10, 60) + "px";
  popup.style.zIndex = "9999";
}

function renderInterventionMemberList() {
  const list = document.getElementById("intervention-members-list");
  if (!list) return;
  
  if (_interventionType === "coro") {
    list.innerHTML = `<p style="color:#ffeb3b; font-size:13px; padding:8px;">Se pintará con el color de Coro (amarillo neón) para todo el grupo.</p>`;
    return;
  }
  
  const maxSel = _interventionType === "solo" ? 1 : _interventionType === "duo" ? 2 : 3;
  
  if (state.members.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-size:12px; padding:8px;">No hay integrantes registrados. Ve a 👥 Integrantes en la página principal.</p>`;
    return;
  }
  
  list.innerHTML = state.members.map(m => {
    const isChecked = _selectedMembersForIntervention.includes(m.name);
    return `
      <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:6px 8px; border-radius:8px; border:1px solid ${isChecked ? m.color : 'rgba(255,255,255,0.07)'}; background:${isChecked ? m.color + '18' : 'transparent'}; transition:all 0.15s; user-select:none;">
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleInterventionMember('${m.name}', ${maxSel})" style="accent-color:${m.color}; width:15px; height:15px;">
        <span style="width:12px; height:12px; border-radius:50%; background:${m.color}; box-shadow:0 0 6px ${m.color}; display:inline-block; flex-shrink:0;"></span>
        <span style="color:${m.color}; font-weight:700; font-size:13px;">${m.name}</span>
        <span style="color:var(--text-muted); font-size:11px; margin-left:auto;">${m.role || ""}</span>
      </label>
    `;
  }).join("");
}

function toggleInterventionMember(name, maxSel) {
  if (_selectedMembersForIntervention.includes(name)) {
    _selectedMembersForIntervention = _selectedMembersForIntervention.filter(n => n !== name);
  } else {
    if (_selectedMembersForIntervention.length >= maxSel) {
      _selectedMembersForIntervention.shift(); // Remove oldest to keep limit
    }
    _selectedMembersForIntervention.push(name);
  }
  renderInterventionMemberList();
}

function selectInterventionType(type) {
  _interventionType = type;
  _selectedMembersForIntervention = [];
  document.querySelectorAll(".intervention-type-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-type") === type);
  });
  renderInterventionMemberList();
}

function closeInterventionPicker() {
  const popup = document.getElementById("intervention-picker-popup");
  if (popup) popup.style.display = "none";
  _interventionSelection = null;
  _savedInterventionRange = null;
}


function applyIntervention() {
  // En lugar de consultar window.getSelection() (que puede haberse perdido o cambiado al enfocar el input),
  // utilizamos el rango que guardamos establemente al soltar el mouse
  const range = _savedInterventionRange;
  if (!range) {
    alert("No hay texto seleccionado. Selecciona una porción de la letra primero.");
    closeInterventionPicker();
    return;
  }
  
  const rangeText = range.toString().trim();
  const finalText = rangeText || _pendingSelectionText;
  if (!finalText) {
    alert("No hay texto seleccionado. Selecciona una porción de la letra primero.");
    closeInterventionPicker();
    return;
  }
  
  const editor = document.getElementById("editor-rich-lyrics");
  if (!editor || !editor.contains(range.commonAncestorContainer)) {
    alert("La selección debe estar dentro de la letra del tema.");
    closeInterventionPicker();
    return;
  }

  const noteInput = document.getElementById("intervention-note-text");
  const extraNote = noteInput ? noteInput.value.trim() : "";

  // Construir la anotación que envuelve el texto seleccionado
  let wrappedText;
  if (_interventionType === "coro") {
    wrappedText = extraNote
      ? `(Coro: ${finalText} - ${extraNote})`
      : `(Coro: ${finalText})`;
  } else {
    const names = _selectedMembersForIntervention;
    if (names.length === 0 && !extraNote) {
      alert("Selecciona al menos un integrante o escribe una nota adicional.");
      return;
    }
    
    const prefix = names.length === 0 ? "Nota" : names.join(", ");
    wrappedText = extraNote
      ? `(${prefix}: ${finalText} - ${extraNote})`
      : `(${prefix}: ${finalText})`;
  }


  try {
    // Temporalmente reactivar el editor para poder modificarlo
    const wasEditable = editor.contentEditable;
    editor.contentEditable = "true";

    // Reemplazar la selección en el DOM con el texto envuelto
    range.deleteContents();
    const newTextNode = document.createTextNode(wrappedText);
    range.insertNode(newTextNode);

    // Limpiar selección activa del navegador si existe
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }


    // Serializar el contenido final del editor
    const finalRaw = serializeRichLyrics();

    // Re-parsear para asegurar que los acordes y badges se reconstruyan correctamente
    editor.innerHTML = parseTextToRichLyrics(finalRaw);

    // Restaurar el modo lectura (intervenciones)
    editor.contentEditable = "false";
    editor.setAttribute("data-mode", "interventions");

    // Re-vincular eventos de acordes
    bindChordBadgeEvents();

    // Guardar en textarea y local storage
    const hiddenTextarea = document.getElementById("song-lyrics");
    if (hiddenTextarea) hiddenTextarea.value = finalRaw;

    if (state.activeSongId) {
      const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
      if (song) {
        song.lyrics = finalRaw;
        saveLocalStorage();
      }
    }

    // Feedback visual momentáneo
    editor.style.outline = "2px solid #00ff66";
    editor.style.transition = "outline 0.3s";
    setTimeout(() => { editor.style.outline = ""; }, 800);

  } catch (err) {
    console.error("Error al aplicar intervención:", err);
    alert("Error al aplicar la intervención. Revisa la consola.");
  }

  closeInterventionPicker();
  _pendingSelectionText = "";
}

// ============================================================
// --- HELPERS DE COLOR PARA ANOTACIONES ---
// ============================================================

function buildVocalColorStyle(names) {
  if (!names || names.length === 0) return "color:#ffeb3b; text-shadow:0 0 8px #ffeb3b80;";
  
  const colors = names.map(n => {
    if (n.toLowerCase() === "coro") return "#ffeb3b";
    return getMemberColor(n);
  });
  
  if (colors.length === 1) {
    const c = colors[0];
    return `color:${c}; text-shadow:0 0 8px ${c}80;`;
  } else {
    // Para Dúo o Trío, creamos un degradado de izquierda a derecha.
    // Usamos display: inline-block para que el clipping de fondo funcione correctamente.
    const gradient = colors.join(", ");
    return `background: linear-gradient(90deg, ${gradient}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;`;
  }
}

function buildInitialsBadgesHtml(names) {
  if (!names || names.length === 0) return "";
  
  // Si es una nota general de ensayo, no mostrar iniciales
  if (names.length === 1 && names[0].toLowerCase() === "nota") {
    return "";
  }
  
  return names.map(name => {
    const isCoro = name.toLowerCase() === "coro";
    const color = isCoro ? "#ffeb3b" : getMemberColor(name);
    const initial = isCoro ? "TODOS" : name.charAt(0).toUpperCase();
    const styleAttr = isCoro
      ? `background: ${color}20; color: ${color}; border: 1px solid ${color}50; --initial-color-glow: ${color}40; width: auto; border-radius: 12px; padding: 0 6px;`
      : `background: ${color}20; color: ${color}; border: 1px solid ${color}50; --initial-color-glow: ${color}40;`;
    return `<span class="member-initial-badge" style="${styleAttr}" title="${name}">${initial}</span>`;
  }).join("");
}



// ============================================================
// --- FIN SECCIÓN INTEGRANTES ---
// ============================================================

// --- CHEQUEAR ENLACES COMPARTIDOS ---
function checkSharedSong() {
  const urlParams = new URLSearchParams(window.location.search);
  const songDataEncoded = urlParams.get("song");
  
  if (songDataEncoded) {
    try {
      // Decodificar Base64
      const songDataDecoded = decodeURIComponent(escape(atob(songDataEncoded)));
      const sharedSong = JSON.parse(songDataDecoded);
      
      if (sharedSong && sharedSong.title && sharedSong.artist) {
        // Generar un ID único para evitar colisiones
        sharedSong.id = "shared_" + Date.now();
        sharedSong.lastEdit = "compartido hoy";
        
        // Si no tiene imagen, le asignamos una por defecto
        if (!sharedSong.image) sharedSong.image = "./assets/yesterday.png";
        
        // Validar si ya existe una con el mismo título/artista
        const exists = state.songs.some(s => s.title.toLowerCase() === sharedSong.title.toLowerCase() && s.artist.toLowerCase() === sharedSong.artist.toLowerCase());
        
        setTimeout(() => {
          const confirmAdd = confirm(`¿Quieres agregar el tema compartido "${sharedSong.title}" de "${sharedSong.artist}" a tu repertorio?`);
          if (confirmAdd) {
            if (!exists) {
              state.songs.unshift(sharedSong);
              saveLocalStorage();
            }
            // Abrir y cargar en la sala de ensayo
            openSongInRehearsal(sharedSong.id);
            // Limpiar URL para no re-preguntar al recargar
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }, 800);
      }
    } catch (e) {
      console.error("Error al importar canción compartida:", e);
      alert("El enlace compartido parece inválido o corrupto.");
    }
  }
}

// --- RENDERIZADO GENERAL ---
function renderApp() {
  renderNav();
  renderSetlist();
  renderRehearsalRoom();
  renderDictionary();
}

function renderNav() {
  // Pill tabs active status
  document.querySelectorAll(".nav-pill").forEach(pill => {
    const tabName = pill.getAttribute("data-tab");
    if (tabName === state.currentTab) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
  
  // Show / Hide tabs view
  document.querySelectorAll(".tab-content").forEach(content => {
    const tabName = content.id.replace("tab-", "");
    if (tabName === state.currentTab) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
  
  // Update header active song title
  const activeIndicator = document.getElementById("nav-active-song");
  if (state.activeSongId) {
    const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
    activeIndicator.style.display = "flex";
    activeIndicator.querySelector(".song-name").textContent = song ? song.title : "Ensayo";
  } else {
    activeIndicator.style.display = "none";
  }
  
  // Update mobile metronome button visibility
  const btnToggleMetronome = document.getElementById("btn-toggle-metronome");
  if (btnToggleMetronome) {
    if (state.currentTab === "rehearsal" && state.activeSongId) {
      btnToggleMetronome.style.display = "flex";
    } else {
      btnToggleMetronome.style.display = "none";
    }
  }
  
  // Mostrar/Ocultar botón flotante de edición y paneles de ensayo (Metrónomo y Grabación)
  const editBtn = document.getElementById("rehearsal-fullscreen-edit-btn");
  const recordFab = document.getElementById("rehearsal-record-fab-container");
  const metronomeFab = document.getElementById("rehearsal-fab-container");
  
  const isRehearsalActive = (state.currentTab === "rehearsal" && state.activeSongId);
  
  if (editBtn) editBtn.style.display = isRehearsalActive ? "flex" : "none";
  if (recordFab) recordFab.style.display = isRehearsalActive ? "block" : "none";
  if (metronomeFab) metronomeFab.style.display = isRehearsalActive ? "block" : "none";
}

// --- EVENTOS Y CONTROLADORES ---
function initEventHandlers() {
  // Listener de Auth
  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      const user = session ? session.user : null;
      state.currentUser = user;
      
      if (user) {
        try {
          // Desuscribirse del anterior si existe
          if (window._supabaseUserChannel) {
            window._supabaseUserChannel.unsubscribe();
          }

          // Función para cargar/recargar datos de perfil desde Supabase
          const loadUserProfile = async () => {
            try {
              const { data: userData, error: userError } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

              if (userError) throw userError;

              if (!userData) {
                // Usuario nuevo — crear perfil limpio en la tabla users
                const name = user.user_metadata.nombre || user.email.split("@")[0];
                const { error: insertError } = await window.supabaseClient.from('users').insert({
                  id: user.id,
                  email: user.email,
                  nombre: name,
                  current_band_id: null
                });
                if (insertError) throw insertError;
                
                window.location.href = "auth.html";
                return;
              }

              const oldBandId = state.currentBandId;
              const oldRequest = state.requestedBandId;

              if (userData.current_band_id && userData.current_band_id !== "KAWSAY") {
                state.currentBandId = userData.current_band_id;
                state.requestedBandId = null;

                // Cargar myBands desde la tabla members
                const { data: memberBands } = await window.supabaseClient
                  .from('members')
                  .select('band_id')
                  .eq('user_id', user.id);
                
                state.myBands = memberBands && memberBands.length > 0 
                  ? memberBands.map(m => m.band_id) 
                  : [userData.current_band_id];

                const onboardingModal = document.getElementById("modal-onboarding");
                if (onboardingModal) onboardingModal.style.display = "none";
              } else {
                // Forzar Onboarding
                window.location.href = "auth.html";
                return;
              }

              if (state.currentBandId) {
                localStorage.setItem("coop_current_band_id", state.currentBandId);
              }

              const reloadNeeded = (oldBandId !== state.currentBandId || oldRequest !== state.requestedBandId || !state._initialDataLoaded);

              if (reloadNeeded) {
                state._initialDataLoaded = true;

                if (state.currentBandId) {
                  const { data: bandDoc, error: bandError } = await window.supabaseClient
                    .from('bands')
                    .select('*')
                    .eq('id', state.currentBandId)
                    .maybeSingle();

                  if (bandError) throw bandError;

                  if (bandDoc) {
                    state.bandMetadata = {
                      ...state.bandMetadata,
                      name: bandDoc.name,
                      logoUrl: bandDoc.logo_url
                    };
                  } else {
                    state.bandMetadata = { name: state.currentBandId, logoUrl: null };
                  }

                  await loadSongsFromDB();
                  await loadMembersFromDB();
                  await loadFavoriteChordsFromDB();

                  if (!state._uiInitialized) {
                    state._uiInitialized = true;
                    checkSharedSong();
                    renderApp();
                    selectChord("C");
                    initChordPickerHandlers();
                    initInlineEditFields();
                    initInterventionPopupDraggable();
                    makeChordBadgesDraggable();
                    initQuickChordInsertion();
                  }
                } else {
                  state.bandMetadata = { name: "Sin Grupo", logoUrl: null };
                  state.songs = [];
                  state.members = [];
                  state.favoritesChords = [];
                }
                
                renderSetlist();
                updateBandUI();
                updateProfileBadge();
                updatePermissionsUI();
                
                const overlay = document.getElementById("auth-guard-overlay");
                if (overlay) overlay.style.display = "none";
              }
            } catch (err) {
              console.error("Error en render/carga de datos de la app:", err);
              alert("Error al cargar la aplicación:\n" + err.message);
              const overlay = document.getElementById("auth-guard-overlay");
              if (overlay) overlay.style.display = "none";
            }
          };

          // Carga inicial
          await loadUserProfile();

          // Suscribirse a cambios en tiempo real en su propio registro de usuario
          window._supabaseUserChannel = window.supabaseClient
            .channel(`user-profile-${user.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` }, payload => {
              loadUserProfile();
            })
            .subscribe();

        } catch (e) {
          console.error("Error cargando perfil multi-tenant de Supabase:", e);
        }
      } else {
        window.location.href = "auth.html";
      }

      updateProfileBadge();
      updatePermissionsUI();
    });
  }

  // Navegación
  document.querySelectorAll(".nav-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const targetTab = pill.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });
  
  // Filtros de Setlist (Restringido para no interferir con el diccionario)
  document.querySelectorAll(".search-filter-bar .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".search-filter-bar .filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filters.status = btn.getAttribute("data-filter");
      renderSetlist();
    });
  });
  
  // Búsqueda de Setlist
  const searchInput = document.getElementById("search-songs");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.filters.search = e.target.value;
      renderSetlist();
    });
  }

  // Delegación de eventos en setlist-grid para el borrado de temas (2 pasos)
  const grid = document.getElementById("setlist-grid");
  if (grid) {
    grid.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".btn-delete-song");
      if (deleteBtn) {
        e.stopPropagation();
        const songId = deleteBtn.getAttribute("data-id");
        
        if (!deleteBtn.classList.contains("confirm-delete")) {
          deleteBtn.classList.add("confirm-delete");
          deleteBtn.style.color = "var(--magenta)";
          deleteBtn.style.width = "auto";
          deleteBtn.style.borderRadius = "14px";
          deleteBtn.style.padding = "0 8px";
          deleteBtn.innerHTML = `<i class="ti ti-check" style="color: var(--magenta);"></i><span style="font-size: 8px; font-weight: 700; color: var(--magenta); margin-left: 2px;">¿BORRAR?</span>`;
          
          // Resetear después de 3 segundos
          const timeoutId = setTimeout(() => {
            deleteBtn.classList.remove("confirm-delete");
            deleteBtn.style.color = "var(--text-dim)";
            deleteBtn.style.width = "28px";
            deleteBtn.style.borderRadius = "50%";
            deleteBtn.style.padding = "0";
            deleteBtn.innerHTML = `<i class="ti ti-trash"></i>`;
          }, 3000);
          
          deleteBtn.setAttribute("data-timeout-id", timeoutId);
        } else {
          // Limpiar timeout
          const timeoutId = deleteBtn.getAttribute("data-timeout-id");
          if (timeoutId) clearTimeout(parseInt(timeoutId));
          
          // Confirmar borrado
          deleteSongFromRepertorio(songId);
        }
      }
    });
  }

  // Modal de Agregar Tema
  const btnAdd = document.getElementById("btn-add-song");
  const modal = document.getElementById("modal-add-song");
  
  if (btnAdd && modal) {
    btnAdd.addEventListener("click", () => {
      document.getElementById("form-song-id").value = "";
      document.getElementById("song-form").reset();
      
      // Restablecer campos ocultos
      document.getElementById("song-title").value = "";
      document.getElementById("song-artist").value = "";
      document.getElementById("song-bpm").value = "120";
      document.getElementById("song-key").value = "C";
      document.getElementById("song-timesig").value = "4/4";
      document.getElementById("song-status").value = "todo";
      document.getElementById("song-lyrics").value = "";
      
      // Restablecer campos inline
      const metaTitle = document.getElementById("meta-title");
      const metaArtist = document.getElementById("meta-artist");
      const metaBpm = document.getElementById("meta-bpm");
      const metaKey = document.getElementById("meta-key");
      const metaTimesig = document.getElementById("meta-timesig");
      const metaStatus = document.getElementById("meta-status");
      
      if (metaTitle) updateTextElement(metaTitle, "");
      if (metaArtist) updateTextElement(metaArtist, "");
      if (metaBpm) updateTextElement(metaBpm, "120");
      if (metaKey) metaKey.textContent = "C";
      if (metaTimesig) metaTimesig.textContent = "4/4";
      if (metaStatus) metaStatus.textContent = "Por Aprender";
      
      // Limpiar editor de letras rico
      const richEditor = document.getElementById("editor-rich-lyrics");
      if (richEditor) {
        richEditor.innerHTML = "";
      }
      
      document.getElementById("modal-song-title").textContent = "Agregar Nuevo Tema";
      modal.classList.add("open");
    });
  }
  
  // Cerrar cualquier modal al hacer clic en sus botones de cerrar/cancelar (Soporta múltiples formularios, dinámicos o estáticos)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".close-modal-btn");
    if (btn) {
      const activeModal = btn.closest(".modal-backdrop") || btn.closest(".modal") || btn.closest("[role='dialog']");
      if (activeModal) {
        activeModal.classList.remove("open");
        activeModal.classList.remove("active");
        activeModal.classList.remove("show");
      }
    }
  });

  // Cerrar cualquier modal abierto con la tecla ESC (Soporta múltiples formularios, dinámicos o estáticos)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      document.querySelectorAll(".modal-backdrop.open, .modal.open, .modal.active, .modal.show, [role='dialog'].open").forEach(m => {
        m.classList.remove("open");
        m.classList.remove("active");
        m.classList.remove("show");
      });
    }
  });
  
  // Importar archivo de letras
  const fileInput = document.getElementById("lyrics-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        importLyricsFile(file);
      }
    });
  }
  
  // Convertir letra tradicional + auto-etiquetar estrofas
  const btnConvert = document.getElementById("btn-convert-lyrics");
  if (btnConvert) {
    btnConvert.addEventListener("click", () => {
      const richEditor = document.getElementById("editor-rich-lyrics");
      const currentRaw = serializeRichLyrics();
      if (richEditor && currentRaw.trim() !== "") {
        // 1. Convertir acordes tradicionales a formato [Acorde]
        const bracketConverted = convertTraditionalToBracket(currentRaw);
        // 2. Auto-etiquetar estrofas por bloques separados por líneas en blanco
        const tagged = autoTagStanzas(bracketConverted);
        richEditor.innerHTML = parseTextToRichLyrics(tagged);
        document.getElementById("song-lyrics").value = tagged;
        bindChordBadgeEvents();
        // 3. Actualizar panel de vista previa de estructura
        updateStructurePreview();
      } else {
        alert("Por favor, escribe o pega primero la letra y acordes tradicionales en el editor.");
      }
    });
  }

  // Guardar Tema (Formulario)
  const form = document.getElementById("song-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveSongFromForm();
    });
  }
  
  // Metrónomo
  const playMetronomeBtn = document.getElementById("btn-play-metronome");
  if (playMetronomeBtn) {
    playMetronomeBtn.addEventListener("click", toggleMetronome);
  }
  
  const bpmSlider = document.getElementById("metronome-bpm-slider");
  if (bpmSlider) {
    bpmSlider.addEventListener("input", (e) => {
      updateBpm(parseInt(e.target.value));
    });
  }
  
  const btnBpmMinus = document.getElementById("btn-bpm-minus");
  const btnBpmPlus = document.getElementById("btn-bpm-plus");
  if (btnBpmMinus) btnBpmMinus.addEventListener("click", () => updateBpm(state.metronome.bpm - 1));
  if (btnBpmPlus) btnBpmPlus.addEventListener("click", () => updateBpm(state.metronome.bpm + 1));
  
  // Reproducción de Grabaciones
  const btnScrollPlay = document.getElementById("btn-scroll-play");
  if (btnScrollPlay) {
    btnScrollPlay.addEventListener("click", togglePlaybackTransport);
  }
  
  // Grabación
  const btnRecord = document.getElementById("btn-record");
  const btnStopRecord = document.getElementById("btn-stop-record");
  
  if (btnRecord) btnRecord.addEventListener("click", startRecording);
  if (btnStopRecord) btnStopRecord.addEventListener("click", stopRecording);
}

function switchTab(tabName) {
  state.currentTab = tabName;
  
  // Detener metrónomo y scroll si salimos de la sala de ensayo
  if (tabName !== "rehearsal") {
    if (state.metronome.isPlaying) toggleMetronome();
    if (state.autoScroll.isActive) toggleAutoScroll();
  }
  
  // Ajustar paddings y scroll del layout principal si estamos en Ensayo
  const mainContentEl = document.querySelector(".main-content");
  if (mainContentEl) {
    if (tabName === "rehearsal") {
      mainContentEl.classList.add("ensayo-active");
    } else {
      mainContentEl.classList.remove("ensayo-active");
    }
  }
  

  
  // Cerrar paneles móviles al cambiar de pestaña
  closeMobileDrawers();
  
  renderNav();
}

// --- VISTA 1: REPERTORIO ---
function renderSetlist() {
  const grid = document.getElementById("setlist-grid");
  if (!grid) return;
  
  // Si hay una solicitud pendiente de unirse a otra banda
  if (state.requestedBandId) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; display:flex; align-items:center; justify-content:center; padding: 48px 24px;">
        <div class="glass" style="text-align:center; max-width:380px; padding:32px; border:1px solid rgba(0, 229, 255, 0.25); border-radius:18px; background:var(--bg-panel); box-shadow: 0 0 24px rgba(0, 229, 255, 0.08);">
          <div style="font-size:48px; margin-bottom:12px; filter: drop-shadow(0 0 10px rgba(0,229,255,0.4));">⏳</div>
          <h3 style="font-size:20px; font-weight:700; color:var(--neon-cyan); margin-bottom:8px; text-shadow:0 0 10px rgba(0,229,255,0.2);">Solicitud Pendiente</h3>
          <p style="color:var(--text-secondary); font-size:13px; line-height:1.6; margin-bottom:20px;">
            Tu solicitud para unirte al grupo <strong id="waiting-band-name" style="color:#fff;">${state.requestedBandId}</strong> está esperando aprobación del Administrador.
          </p>
          <button class="btn btn-secondary" onclick="cancelPendingRequest()" style="border-radius:20px; font-size:12px; padding:8px 20px; border: 1px solid rgba(255,51,75,0.3); color: #ff334b; background: rgba(255,51,75,0.05); cursor: pointer; outline: none; font-weight: bold;">
            Cancelar Solicitud
          </button>
        </div>
      </div>
    `;
    
    if (window.supabaseClient) {
      window.supabaseClient.from('bands').select('name').eq('id', state.requestedBandId).maybeSingle().then(({ data }) => {
        const el = document.getElementById("waiting-band-name");
        if (el && data && data.name) {
          el.textContent = data.name;
        }
      }).catch(() => {});
    }
    
    const totalCount = document.getElementById("total-songs-count");
    if (totalCount) totalCount.textContent = "0 Temas";
    return;
  }
  
  // Filtrar
  const filteredSongs = state.songs.filter(song => {
    // Filtro por Estado
    const matchesStatus = state.filters.status === "all" || song.status === state.filters.status;
    
    // Filtro por Búsqueda (Título o Artista)
    const matchesSearch = song.title.toLowerCase().includes(state.filters.search.toLowerCase()) || 
                          song.artist.toLowerCase().includes(state.filters.search.toLowerCase());
                          
    return matchesStatus && matchesSearch;
  });
  
  // Actualizar contador
  const totalCount = document.getElementById("total-songs-count");
  if (totalCount) totalCount.textContent = `${state.songs.length} Temas`;
  
  if (filteredSongs.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted)">
        <p style="font-size: 16px;">No se encontraron temas con los filtros aplicados.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filteredSongs.map(song => {
    let statusClass = "status-todo";
    let statusText = "Por Aprender";
    if (song.status === "practicing") {
      statusClass = "status-practicing";
      statusText = "En Ensayo";
    } else if (song.status === "ready") {
      statusClass = "status-ready";
      statusText = "Listo";
    }
    
    return `
      <div class="song-card" onclick="openSongInRehearsal(event, '${song.id}')">
        <div class="song-card-bg" style="background-image: url('${song.image}')"></div>
        <span class="song-status-badge ${statusClass}">${statusText}</span>
        <button class="btn-delete-song" data-id="${song.id}" title="Eliminar tema" style="position: absolute; top: 15px; left: 15px; z-index: 10; color: var(--text-dim); background: rgba(17, 18, 21, 0.7); border: 1px solid var(--border-soft); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; outline: none; padding: 0;">
          <i class="ti ti-trash" style="font-size: 13px;"></i>
        </button>
        
        <div class="song-card-content">
          <div class="card-top">
            <span class="last-edit" style="margin-left: 28px;">LAST EDIT: ${song.lastEdit.toUpperCase()}</span>
          </div>
          
          <div class="song-title-group">
            <h3 class="song-card-title">${song.title}</h3>
            <div class="song-card-artist" style="margin-top: 4px; font-size: 13px; color: var(--text-secondary);">${song.artist}</div>
          </div>
          
          <div>
            <div class="card-divider"></div>
            <div class="card-details">
              <div class="detail-item">
                <span class="detail-label">BPM</span>
                <span class="detail-value">${song.bpm}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">KEY</span>
                <span class="detail-value text-cyan">${song.key}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">TIME</span>
                <span class="detail-value">${song.timeSig}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  // Renderizar listado de grabaciones globales en la barra lateral
  renderGlobalRecordingsList();
}

// --- CARGAR CANCION ---
function openSongInRehearsal(eventOrId, optionalSongId) {
  try {
    let songId;
    let event;
    
    if (typeof eventOrId === "string") {
      songId = eventOrId;
    } else {
      event = eventOrId;
      songId = optionalSongId;
    }
    
    if (event && event.target && event.target.closest(".btn-delete-song")) {
      return;
    }
    
    if (!songId) {
      console.error("openSongInRehearsal called without a song ID");
      return;
    }
    
    state.activeSongId = songId;
    state.transposeOffset = 0;
    state.autoscrollActivo = true;
    state.enReproduccion = false;
    state.tiempoActual = 0;
    state.mostrarTransposer = false;
    state.lineaActivaIndex = 0;
    
    const song = state.songs.find(s => String(s.id) === String(songId));
    if (song) {
      const lines = parseLyricsToEnsayoModel(song.lyrics);
      const structure = getSongEstructuraEnsayo(song, lines);
      if (structure.length > 0) {
        state.seccionActivaId = structure[0].id;
      }
    }
    
    switchTab("rehearsal");
    renderApp();
  } catch (err) {
    console.error("Error in openSongInRehearsal:", err);
  }
}

// --- GUARDAR O EDITAR CANCIÓN ---
function saveSongFromForm() {
  // Asegurar que la letra rica esté serializada antes de guardar
  const serializedLyrics = serializeRichLyrics();
  document.getElementById("song-lyrics").value = serializedLyrics;
  
  // Asegurar que los campos inline se sincronicen por si están en edición activa
  const metaTitle = document.getElementById("meta-title");
  const metaArtist = document.getElementById("meta-artist");
  const metaBpm = document.getElementById("meta-bpm");
  
  if (metaTitle && metaTitle.getAttribute("contenteditable") === "true") {
    metaTitle.blur();
  }
  if (metaArtist && metaArtist.getAttribute("contenteditable") === "true") {
    metaArtist.blur();
  }
  if (metaBpm && metaBpm.getAttribute("contenteditable") === "true") {
    metaBpm.blur();
  }

  const songId = document.getElementById("form-song-id").value;
  const title = document.getElementById("song-title").value;
  const artist = document.getElementById("song-artist").value;
  const bpm = parseInt(document.getElementById("song-bpm").value) || 120;
  const key = document.getElementById("song-key").value;
  const timeSig = document.getElementById("song-timesig").value;
  const status = document.getElementById("song-status").value;
  const rhythm = "↓ ↑ ↓ ↑";
  const rawLyrics = document.getElementById("song-lyrics").value;
  const lyrics = convertTraditionalToBracket(rawLyrics.trim());
  
  if (!title || title.trim() === "" || title === "Título del Tema") {
    alert("Por favor, completa el título del tema.");
    return;
  }
  if (!artist || artist.trim() === "" || artist === "Artista o Banda") {
    alert("Por favor, completa el artista del tema.");
    return;
  }
  if (!lyrics || lyrics.trim() === "") {
    alert("Por favor, escribe la letra del tema.");
    return;
  }
  
  let songToSave;
  if (songId) {
    // Editar existente
    const index = state.songs.findIndex(s => String(s.id) === String(songId));
    if (index !== -1) {
      state.songs[index] = {
        ...state.songs[index],
        title, artist, bpm, key, timeSig, status, rhythm, lyrics,
        lastEdit: "hace unos instantes"
      };
      songToSave = state.songs[index];
    }
  } else {
    // Crear nueva
    songToSave = {
      id: "s_" + Date.now(),
      title, artist, bpm, key, timeSig, status, rhythm, lyrics,
      lastEdit: "creado recién",
      image: "./assets/yesterday.png" // Por defecto
    };
    state.songs.unshift(songToSave);
  }
  
  // Guardar directamente en Firestore la canción modificada/creada
  if (songToSave && window.SongsService) {
    window.SongsService.saveSong(songToSave).catch(err => {
      console.error("Error al guardar canción en Firebase:", err);
    });
  }
  
  document.getElementById("modal-add-song").classList.remove("open");
  renderApp();
}

// --- MOTOR Y LÓGICA DE LA HOJA DE ENSAYO EN VIVO ---

let rehearsalIntervalId = null;

function parseLyricsToEnsayoModel(lyricsText) {
  if (!lyricsText) return [];
  const lines = lyricsText.split("\n");
  const result = [];
  let seccionId = "sec-intro";
  let seccionNotas = "";
  let nextIsNewParagraph = false;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === "") {
      nextIsNewParagraph = true;
      return;
    }
    
    // Detectar cabecera de sección, e.g. [CORO // ENTRA BATERIA] o [INTRO]
    if (isSectionHeader(trimmed)) {
      let name = trimmed.slice(1, -1).trim();
      let notes = "";
      if (name.includes("//")) {
        const parts = name.split("//");
        name = parts[0].trim();
        notes = parts[1].trim();
      }
      seccionId = "sec-" + name.toLowerCase().replace(/\s+/g, "-");
      seccionNotas = notes;
      nextIsNewParagraph = true;
      return;
    }
    
    // Extraer acordes entre corchetes y calcular su posición exacta relativa al texto limpio
    const chordRegex = /\[([^\]]+)\]/g;
    const lineChords = [];
    let match;
    
    let cleanLineText = "";
    let lastIndex = 0;
    let cleanIndex = 0;
    
    while ((match = chordRegex.exec(line)) !== null) {
      const segment = line.substring(lastIndex, match.index);
      cleanLineText += segment;
      cleanIndex += segment.length;
      
      lineChords.push({
        id: `ac-${index}-${match.index}`,
        acorde: match[1],
        posicionCaracter: cleanIndex
      });
      
      lastIndex = chordRegex.lastIndex;
    }
    cleanLineText += line.substring(lastIndex);
    
    const trimmedLeadingSpaces = cleanLineText.length - cleanLineText.trimStart().length;
    const cleanText = cleanLineText.trim();
    
    // Ajustar posiciones de acordes según los espacios eliminados al inicio por trim()
    lineChords.forEach(c => {
      c.posicionCaracter = Math.max(0, c.posicionCaracter - trimmedLeadingSpaces);
    });
    
    result.push({
      id: `line-${index}`,
      texto: cleanText || "(Instrumental)",
      acordes: lineChords,
      seccionId: seccionId,
      seccionNotas: seccionNotas,
      isNewParagraph: nextIsNewParagraph
    });
    nextIsNewParagraph = false;
  });
  return result;
}

function getSongEstructuraEnsayo(song, lines) {
  const sections = [];
  const uniqueSecIds = [...new Set(lines.map(l => l.seccionId))];
  
  uniqueSecIds.forEach((secId) => {
    const name = secId.replace("sec-", "").toUpperCase().replace(/-/g, " ");
    const secLines = lines.filter(l => l.seccionId === secId);
    if (secLines.length === 0) return;
    
    const startIdx = lines.indexOf(secLines[0]);
    const endIdx = lines.indexOf(secLines[secLines.length - 1]);
    
    let type = "verso";
    if (name.includes("INTRO")) type = "intro";
    else if (name.startsWith("PRE") || name.includes("PRE-CORO") || name.includes("PRE CORO")) type = "pre-coro";
    else if (name.includes("CORO") || name.includes("ESTRIBILLO") || name.includes("CHORUS")) type = "estribillo";
    else if (name.includes("PUENTE") || name.includes("BRIDGE")) type = "puente";
    else if (name.includes("SOLO")) type = "solo";
    else if (name.includes("FINAL") || name.includes("OUTRO")) type = "outro";
    
    sections.push({
      id: secId,
      nombre: name,
      tipo: type,
      lineaInicio: startIdx,
      lineaFin: endIdx,
      notas: secLines[0].seccionNotas || ""
    });
  });
  
  if (sections.length === 0) {
    sections.push({
      id: "sec-intro",
      nombre: "INTRO",
      tipo: "intro",
      lineaInicio: 0,
      lineaFin: Math.max(0, lines.length - 1),
      notas: ""
    });
  }
  return sections;
}

const notasCromaticas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatMap = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

function transposeChord(chord, offset) {
  if (offset === 0) return chord;
  const match = chord.match(/^([A-G]#?|[A-G]b?)(.*)$/);
  if (!match) return chord;
  const root = match[1];
  const suffix = match[2];
  const normalizedRoot = flatMap[root] || root;
  const index = notasCromaticas.indexOf(normalizedRoot);
  if (index === -1) return chord;
  let newIndex = (index + offset) % 12;
  if (newIndex < 0) newIndex += 12;
  return notasCromaticas[newIndex] + suffix;
}

function triggerEnsayoToast(msg) {
  const existing = document.querySelector(".ensayo-toast");
  if (existing) existing.remove();
  
  const toast = document.createElement("div");
  toast.className = "ensayo-toast glass";
  toast.innerHTML = `<span>🔔</span> ${msg}`;
  const room = document.getElementById("rehearsal-room-content"); if(room) room.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function scrollToEnsayoLine(index) {
  const el = document.getElementById(`ensayo-line-${index}`);
  const container = document.getElementById("lyrics-editor-scroll");
  if (el && container) {
    const offsetTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
    container.scrollTo({
      top: Math.max(0, offsetTop),
      behavior: "smooth"
    });
  }
}


// ─────────────────────────────────────────────────────────────
// HOJA DE ENSAYO — SISTEMA UNIFICADO
// ─────────────────────────────────────────────────────────────

let ensayoPlayInterval = null;

// Calcular color de línea según tipo de sección
function getLineColor(lineSec) {
  if (!lineSec) return "#29F0D6";
  if (lineSec.tipo === "estribillo" || lineSec.tipo === "outro") return "#FF3EA5";
  if (lineSec.tipo === "puente" || lineSec.tipo === "pre-coro") return "#FFD23F";
  return "#29F0D6";
}

// Renderizar fila de acordes con posicionamiento real por carácter
function renderChordRow(acordes, transposeOffset) {
  if (!acordes || acordes.length === 0) return "";
  // ~7.6px por carácter en 14px Inter (calibrado)
  const charPx = 7.6;
  const pills = acordes.map(ac => {
    const x = Math.round((ac.posicionCaracter || 0) * charPx);
    const chord = transposeChord(ac.acorde, transposeOffset);
    return `<span class="chord-pill" style="left:${x}px">${chord}</span>`;
  }).join("");
  return `<div class="lyric-chord-row">${pills}</div>`;
}

// Renderizar el roster de integrantes para una sección
function renderRosterHtml(activeSec, members) {
  const type = activeSec ? activeSec.tipo : "verso";
  return members.map(m => {
    let activo = true;
    if (type === "intro" && (m.id === "int-camila" || m.id === "int-rodrigo")) activo = false;
    else if (type === "solo" && (m.id === "int-camila" || m.id === "int-rodrigo")) activo = false;
    else if (type === "verso" && m.id === "int-rodrigo") activo = false;

    return `
      <div class="roster-member ${activo ? 'active' : 'inactive'}">
        <div class="roster-avatar-circle">${m.iniciales}</div>
        <div class="roster-member-name">${m.nombre}</div>
        <div class="roster-member-role">${m.instrumento}</div>
      </div>`;
  }).join("");
}

// Función principal unificada de render
function renderRehearsalRoom() {
  try {
    const room = document.getElementById("rehearsal-room-content");
    if (!room) return;

  if (!state.activeSongId) {
    room.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; height:100%; background:var(--bg-stage);">
        <div style="text-align:center; max-width:320px; padding:24px; border:1px solid var(--border); border-radius:18px; background:var(--bg-panel);">
          <div style="font-size:38px; margin-bottom:12px;">🎙️</div>
          <h3 style="font-size:20px; font-weight:700; color:var(--magenta); margin-bottom:8px; text-shadow:0 0 10px rgba(255,62,165,0.4);">Hoja de Ensayo</h3>
          <p style="color:var(--text-muted); font-size:12px; line-height:1.6; margin-bottom:20px;">
            Selecciona un tema de tu REPERTORIO para iniciar la hoja de ensayo en vivo.
          </p>
          <button class="btn-primary btn" onclick="switchTab('repertorio')" style="border-radius:20px; font-size:12px; padding:8px 20px;">
            <i class="ti ti-music"></i> Ver REPERTORIO
          </button>
        </div>
      </div>`;
    return;
  }

  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (!song) return;

  const lines = parseLyricsToEnsayoModel(song.lyrics);
  const structure = getSongEstructuraEnsayo(song, lines);

  if (!state.seccionActivaId && structure.length > 0) {
    state.seccionActivaId = structure[0].id;
  }

  const tonalidadTranspuesta = transposeChord(song.key || "C", state.transposeOffset || 0);
  const activeSec = structure.find(s => s.id === state.seccionActivaId) || structure[0];
  const activeNotas = activeSec ? (activeSec.notes || activeSec.notas || "") : "";
  const duration = song.duracionSegundos || 220;
  const progressPercent = Math.min(100, ((state.tiempoActual || 0) / duration) * 100);
  const selectedCount = state.selectedLineIndices ? state.selectedLineIndices.length : 0;
  const isMultiSelect = selectedCount > 0;

  const members = [
    { id: "int-camila",  nombre: "Camila",  instrumento: "Voz",    iniciales: "CA" },
    { id: "int-rodrigo", nombre: "Rodrigo", instrumento: "Coro",   iniciales: "RO" },
    { id: "int-julian",  nombre: "Julián",  instrumento: "Bajo",   iniciales: "JU" },
    { id: "int-male",    nombre: "Male",    instrumento: "Batería", iniciales: "MA" },
    { id: "int-franco",  nombre: "Franco",  instrumento: "Teclado", iniciales: "FR" }
  ];

  // — STRUCTURE SIDEBAR —
  const structureHtml = structure.map(sec => {
    const isActive = state.seccionActivaId === sec.id;
    return `
      <div class="section-item ${isActive ? 'active' : ''}" data-id="${sec.id}">
        <i class="ti ti-music section-icon"></i>
        <div class="section-label">${sec.nombre}</div>
        <i class="ti ti-menu-2 section-menu"></i>
      </div>`;
  }).join("");

  // — SECTION TAB CHIPS (mobile) —
  const sectionChipsHtml = structure.map(sec => {
    const isActive = state.seccionActivaId === sec.id;
    return `<button class="section-tab-chip ${isActive ? 'active' : ''}" data-id="${sec.id}">${sec.nombre}</button>`;
  }).join("");

  // — LYRIC LINES —
  const linesHtml = lines.map((line, idx) => {
    const isActive = state.lineaActivaIndex === idx;
    const isSelected = state.selectedLineIndices && state.selectedLineIndices.includes(idx);
    const lineSec = structure.find(s => s.id === line.seccionId);
    const dotColor = getLineColor(lineSec);
    const chordRow = renderChordRow(line.acordes, state.transposeOffset || 0);
    const lineNotes = isActive && activeNotas ? `<div class="lyric-notes">💡 ${activeNotas}</div>` : "";

    const marginStyle = line.isNewParagraph && idx > 0 ? "margin-top: 32px;" : "";

    return `
      <div class="lyric-line-editor ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}" id="ensayo-line-${idx}" data-index="${idx}" style="${marginStyle}">
        <span class="line-number">${idx + 1}</span>
        <div class="line-dot" style="background:${dotColor}; box-shadow:0 0 7px ${dotColor};"></div>
        ${chordRow}
        <div class="lyric-text-display">${line.texto}</div>
        ${lineNotes}
        <div class="lyric-controls">
          <button class="btn-small btn-desktop-duplicate" data-index="${idx}"><i class="ti ti-copy"></i> Duplicar</button>
          <button class="btn-small btn-desktop-delete" data-index="${idx}" style="color:#E24B4A;"><i class="ti ti-trash"></i> Eliminar</button>
        </div>
      </div>`;
  }).join("");

  // — PARTICIPANTS (right sidebar) —
  const type = activeSec ? activeSec.tipo : "verso";
  const participantsHtml = members.map(m => {
    let activo = true;
    if (type === "intro" && (m.id === "int-camila" || m.id === "int-rodrigo")) activo = false;
    else if (type === "solo" && (m.id === "int-camila" || m.id === "int-rodrigo")) activo = false;
    else if (type === "verso" && m.id === "int-rodrigo") activo = false;

    return `
      <div class="participant-card ${activo ? 'active' : ''}" data-id="${m.id}">
        <div class="participant-avatar">${m.iniciales}</div>
        <div class="participant-info">
          <div class="participant-name">${m.nombre}</div>
          <div class="participant-role">${m.instrumento}</div>
        </div>
        <i class="ti ti-check participant-check"></i>
      </div>`;
  }).join("");

  // — ROSTER STRIP (mobile) —
  const rosterStripHtml = renderRosterHtml(activeSec, members);

  room.innerHTML = `
    <div class="layout">

      <!-- TOPBAR -->
      <div class="topbar">
        <div class="topbar-left">
          <div class="topbar-title" id="ensayo-title-click" style="cursor:pointer">${song.title}</div>
          <div class="topbar-meta" style="position:relative;">
            <span class="meta-chip meta-chip-cyan" id="ensayo-key-chip">${tonalidadTranspuesta}</span>
            <div class="transposer-dropdown" id="ensayo-transposer-dropdown" style="display:none;">
              <div class="dropdown-title">Transponer</div>
              <div class="transposer-grid">
                ${[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(o => `
                  <button class="transpose-btn ${(state.transposeOffset||0)===o?'active':''}" data-offset="${o}">
                    ${o===0?'Orig':o>0?'+'+o:o}
                  </button>`).join("")}
              </div>
            </div>
            <span class="meta-chip meta-chip-amber">${song.bpm || 90} bpm</span>
            <span class="meta-chip" style="color:var(--text-dim); border-color:var(--border-soft); cursor:default;">${formatTime(duration)}</span>
          </div>
        </div>
        <div class="topbar-right">
          <button class="btn" onclick="alert('Exportar como PDF — Próximamente')">📥 PDF</button>
          <button class="btn-primary btn" id="btn-desktop-save">✓ Guardar</button>
        </div>
      </div>

      <!-- SECTION TABS (mobile only) -->
      <div class="section-tabs-strip">${sectionChipsHtml}</div>

      <!-- BODY -->
      <div class="ensayo-body">

        <!-- LEFT SIDEBAR (desktop) -->
        <div class="left-sidebar-ensayo">
          <div class="sidebar-title">Estructura</div>
          <div class="section-tree">${structureHtml}</div>
          <div class="add-section-btn" id="btn-desktop-add-sec">
            <i class="ti ti-plus" style="font-size:11px;"></i> Nueva sección
          </div>
          <div style="padding:12px 14px; border-top:1px solid var(--border); margin-top:auto;">
            <div class="sidebar-title" style="padding:0 0 8px;">${isMultiSelect ? `Propiedades (${selectedCount} versos)` : 'Propiedades'}</div>
            <div class="property-row">
              <label class="property-label">Nombre de sección</label>
              <input class="property-input" id="desktop-sec-name-input" value="${isMultiSelect ? 'Múltiples versos' : (activeSec ? activeSec.nombre : 'Sin sección')}" ${isMultiSelect ? 'disabled style="opacity: 0.6"' : ''} />
            </div>
            <div class="property-row">
              <label class="property-label">Tipo</label>
              <select class="property-input" id="desktop-sec-type-select">
                <option value="verso" ${type==='verso'?'selected':''}>Verso</option>
                <option value="pre-coro" ${type==='pre-coro'?'selected':''}>Pre-Coro</option>
                <option value="estribillo" ${type==='estribillo'?'selected':''}>Coro / Estribillo</option>
                <option value="puente" ${type==='puente'?'selected':''}>Puente</option>
                <option value="intro" ${type==='intro'?'selected':''}>Intro</option>
                <option value="outro" ${type==='outro'?'selected':''}>Outro</option>
                <option value="solo" ${type==='solo'?'selected':''}>Solo</option>
              </select>
            </div>
            <div class="property-row">
              <label class="property-label">Notas de sección</label>
              <input class="property-input" id="desktop-sec-notes-input" value="${isMultiSelect ? 'Múltiples versos' : activeNotas}" ${isMultiSelect ? 'disabled style="opacity: 0.6"' : ''} placeholder="Ej: entra guitarra líder aquí..." />
            </div>
          </div>
        </div>

        <!-- CENTER PANE -->
        <div class="center-pane-ensayo">
          <div class="editor-tabs" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap: 4px;">
              <button class="editor-tab active"><i class="ti ti-music" style="font-size:11px;"></i> Acordes &amp; Letra</button>
              <button class="editor-tab" onclick="triggerEnsayoToast('Notas de referencia — Próximamente')"><i class="ti ti-file-text" style="font-size:11px;"></i> Notas</button>
              <button class="editor-tab" onclick="triggerEnsayoToast('Audio — Próximamente')"><i class="ti ti-volume-2" style="font-size:11px;"></i> Audio</button>
            </div>
            <button class="btn btn-secondary" onclick="editActiveSong()" style="padding: 4px 10px; font-size: 11px; border: 1px solid rgba(0, 229, 255, 0.2); background: rgba(0, 229, 255, 0.05); display: flex; align-items: center; gap: 4px; border-radius: 6px; cursor: pointer; color: var(--neon-cyan); outline: none; margin-right: 4px;">
              ✏️ Editar Letra
            </button>
          </div>
          <div class="lyrics-editor" id="lyrics-editor-scroll">
            <div class="lyric-cable"></div>
            ${linesHtml}
          </div>
        </div>

        <!-- RIGHT SIDEBAR (desktop) -->
        <div class="right-sidebar-ensayo">
          <div class="sidebar-section">
            <div class="sidebar-section-title">Participantes en sección</div>
            <div class="participants-grid">${participantsHtml}</div>
            <div class="add-participant-btn" onclick="triggerEnsayoToast('Agregar músico — Próximamente')">
              <i class="ti ti-plus"></i> Agregar músico
            </div>
          </div>
          <div class="sidebar-section">
            <div class="sidebar-section-title">Notas de línea activa</div>
            <textarea class="property-input" id="desktop-line-notes-textarea" rows="4" placeholder="Notas de ensayo para esta línea...">${activeNotas}</textarea>
          </div>
        </div>
      </div>

      <!-- ROSTER STRIP (mobile only) -->
      <div class="roster-strip">
        <div class="roster-strip-title">Participación · ${activeSec ? activeSec.nombre : 'Sección'}</div>
        <div class="roster-avatars">${rosterStripHtml}</div>
      </div>

      <!-- TRANSPORT BAR -->
      <div class="transport-bar-ensayo">
        <div class="transport-group">
          <button class="btn-icon" id="btn-desktop-prev" title="Sección anterior">⏮</button>
          <button class="play-btn" id="btn-desktop-play" title="${state.enReproduccion ? 'Pausar' : 'Reproducir'}">
            ${state.enReproduccion ? '⏸' : '▶'}
          </button>
          <button class="btn-icon" id="btn-desktop-next" title="Siguiente sección">⏭</button>
        </div>

        <div class="transport-group" style="flex:1; gap:10px;">
          <span class="time-display" id="ensayo-time-current">${formatTime(state.tiempoActual)}</span>
          <div class="progress-bar" id="desktop-progress-bar">
            <div class="progress-fill" style="width:${progressPercent}%;"></div>
          </div>
          <span class="time-display">${formatTime(duration)}</span>
        </div>

        <div class="transport-controls">
          <div class="control-group">
            <span class="control-label">Tono:</span>
            <span class="control-value">${song.key || 'C'}</span>
          </div>
          <div class="control-group">
            <span class="control-label">+/−</span>
            <div class="transpose-btns">
              <button class="tp-btn" id="btn-desktop-tp-down">−</button>
              <input class="control-input" id="desktop-tp-val" value="${state.transposeOffset || 0}" readonly />
              <button class="tp-btn" id="btn-desktop-tp-up">+</button>
            </div>
          </div>
          <div class="control-group">
            <button class="btn-icon ${state.autoscrollActivo ? 'active' : ''}" id="btn-desktop-autoscroll" title="${state.autoscrollActivo ? 'Auto-scroll ON' : 'Auto-scroll OFF'}">
              ${state.autoscrollActivo ? '🔄' : '↕️'}
            </button>
            <span style="font-size:10px; color:${state.autoscrollActivo ? 'var(--cyan)' : 'var(--text-dim)'};">
              ${state.autoscrollActivo ? 'auto' : 'manual'}
            </span>
          </div>
        </div>
      </div>

      <!-- MODAL: Nueva sección -->
      <div class="modal-overlay" id="modalAddSection">
        <div class="modal-box">
          <div class="modal-title">Nueva Sección</div>
          <div class="modal-field">
            <label class="modal-label">Nombre</label>
            <input class="modal-input" id="modal-sec-name" placeholder="Ej: Verso 3, Puente, Solo..." />
          </div>
          <div class="modal-field">
            <label class="modal-label">Tipo</label>
            <select class="modal-input" id="modal-sec-type">
              <option value="verso">Verso</option>
              <option value="estribillo" selected>Estribillo</option>
              <option value="puente">Puente</option>
              <option value="intro">Intro</option>
              <option value="outro">Outro</option>
              <option value="solo">Solo</option>
            </select>
          </div>
          <div class="modal-buttons">
            <button class="modal-btn" id="btn-modal-cancel">Cancelar</button>
            <button class="modal-btn modal-btn-primary" id="btn-modal-create">Crear</button>
          </div>
        </div>
      </div>

      <!-- MODAL: Editar Estrofa / Sección -->
      <div class="modal-overlay" id="modalEditStanza">
        <div class="modal-box" style="width: 480px; max-width: 90vw;">
          <div class="modal-title">Editar Estrofa / Sección</div>
          <div class="modal-field">
            <label class="modal-label">Nombre de Sección</label>
            <input class="modal-input" id="modal-edit-sec-name" placeholder="Ej: VERSO 1, CORO..." />
          </div>
          <div class="modal-field">
            <label class="modal-label">Clasificación (Tipo)</label>
            <select class="modal-input" id="modal-edit-sec-type">
              <option value="verso">Verso</option>
              <option value="estribillo">Estribillo</option>
              <option value="puente">Puente</option>
              <option value="intro">Intro</option>
              <option value="outro">Outro</option>
              <option value="solo">Solo</option>
            </select>
          </div>
          <div class="modal-field">
            <label class="modal-label">Notas de Sección</label>
            <input class="modal-input" id="modal-edit-sec-notes" placeholder="Notas de ensayo para esta sección..." />
          </div>
          <div class="modal-field">
            <label class="modal-label">Letra &amp; Acordes (Formato [Acorde]Letra)</label>
            <textarea class="modal-input" id="modal-edit-sec-lyrics" rows="8" style="font-family:'JetBrains Mono', monospace; font-size:12px; resize:vertical; background:var(--bg-stage); color:var(--text); border:1px solid var(--border-soft); padding:8px; border-radius:6px; width:100%; outline:none;"></textarea>
          </div>
          <div class="modal-buttons">
            <button class="modal-btn" id="btn-modal-edit-cancel">Cancelar</button>
            <button class="modal-btn modal-btn-primary" id="btn-modal-edit-save">Guardar</button>
          </div>
        </div>
      </div>
    </div>`;

  bindRehearsalEvents(structure, lines, song);
  } catch (err) {
    console.error("Error in renderRehearsalRoom:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// BINDING DE EVENTOS — UNIFICADO
// ─────────────────────────────────────────────────────────────
function bindRehearsalEvents(structure, lines, song) {
  const duration = song.duracionSegundos || 220;

  // Título click
  const titleEl = document.getElementById("ensayo-title-click");
  if (titleEl) titleEl.addEventListener("click", () => triggerEnsayoToast("Toca el chip de tonalidad para transponer"));

  // Transposer chip toggle
  const keyChip = document.getElementById("ensayo-key-chip");
  const dropdown = document.getElementById("ensayo-transposer-dropdown");
  if (keyChip && dropdown) {
    keyChip.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", () => { if (dropdown) dropdown.style.display = "none"; }, { once: true });
  }

  // Transpose buttons
  document.querySelectorAll(".transpose-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const offset = parseInt(btn.getAttribute("data-offset")) || 0;
      state.transposeOffset = offset;
      renderRehearsalRoom();
    });
  });

  // Section items (sidebar, mobile chips)
  document.querySelectorAll(".section-item, .section-tab-chip").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-id");
      const targetSec = structure.find(s => s.id === id);
      if (targetSec) {
        state.seccionActivaId = id;
        state.lineaActivaIndex = targetSec.lineaInicio;
        state.tiempoActual = (targetSec.lineaInicio / lines.length) * duration;
        renderRehearsalRoom();
        scrollToEnsayoLine(targetSec.lineaInicio);
      }
    });
  });

  // Line click (activate line or multi-select with CTRL)
  document.querySelectorAll(".lyric-line-editor").forEach(el => {
    el.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "I" || e.target.tagName === "INPUT" || e.target.closest(".lyric-controls")) return;
      const idx = parseInt(el.getAttribute("data-index"));
      
      if (e.ctrlKey) {
        e.preventDefault();
        if (!state.selectedLineIndices) state.selectedLineIndices = [];
        const pos = state.selectedLineIndices.indexOf(idx);
        if (pos > -1) {
          state.selectedLineIndices.splice(pos, 1);
        } else {
          state.selectedLineIndices.push(idx);
        }
        renderRehearsalRoom();
      } else {
        state.selectedLineIndices = []; // Limpiar selección múltiple
        state.lineaActivaIndex = idx;
        const line = lines[idx];
        if (line) state.seccionActivaId = line.seccionId;
        renderRehearsalRoom();
      }
    });
  });

  // Duplicate / Delete line
  document.querySelectorAll(".btn-desktop-duplicate").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); duplicateDesktopLine(song, parseInt(btn.getAttribute("data-index"))); });
  });
  document.querySelectorAll(".btn-desktop-delete").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); deleteDesktopLine(song, parseInt(btn.getAttribute("data-index"))); });
  });

  // Save button
  const btnSave = document.getElementById("btn-desktop-save");
  if (btnSave) btnSave.addEventListener("click", () => saveDesktopLyrics(song, lines, structure));

  // Transport: Play/Pause
  const btnPlay = document.getElementById("btn-desktop-play");
  if (btnPlay) btnPlay.addEventListener("click", () => togglePlayState(song, lines));

  // Transport: Prev/Next section
  const currentSecIdx = structure.findIndex(s => s.id === state.seccionActivaId);
  const btnPrev = document.getElementById("btn-desktop-prev");
  const btnNext = document.getElementById("btn-desktop-next");
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      const idx = Math.max(0, currentSecIdx - 1);
      const sec = structure[idx];
      if (sec) { state.seccionActivaId = sec.id; state.lineaActivaIndex = sec.lineaInicio; state.tiempoActual = (sec.lineaInicio / lines.length) * duration; renderRehearsalRoom(); scrollToEnsayoLine(sec.lineaInicio); }
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      const idx = Math.min(structure.length - 1, currentSecIdx + 1);
      const sec = structure[idx];
      if (sec) { state.seccionActivaId = sec.id; state.lineaActivaIndex = sec.lineaInicio; state.tiempoActual = (sec.lineaInicio / lines.length) * duration; renderRehearsalRoom(); scrollToEnsayoLine(sec.lineaInicio); }
    });
  }

  // Transport: Transpose +/-
  const btnTpDown = document.getElementById("btn-desktop-tp-down");
  const btnTpUp   = document.getElementById("btn-desktop-tp-up");
  if (btnTpDown) btnTpDown.addEventListener("click", () => { state.transposeOffset = Math.max(-5, (state.transposeOffset||0)-1); renderRehearsalRoom(); });
  if (btnTpUp)   btnTpUp.addEventListener("click",   () => { state.transposeOffset = Math.min(5,  (state.transposeOffset||0)+1); renderRehearsalRoom(); });

  // Transport: Progress bar click
  const progBar = document.getElementById("desktop-progress-bar");
  if (progBar) {
    progBar.addEventListener("click", e => {
      const rect = progBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      state.tiempoActual = pct * duration;
      renderRehearsalRoom();
    });
  }

  // Transport: Autoscroll toggle
  const btnScroll = document.getElementById("btn-desktop-autoscroll");
  if (btnScroll) {
    btnScroll.addEventListener("click", () => {
      state.autoscrollActivo = !state.autoscrollActivo;
      renderRehearsalRoom();
    });
  }

  // Manual scroll → disable autoscroll
  const scrollEl = document.getElementById("lyrics-editor-scroll");
  if (scrollEl) {
    let scrollTimer = null;
    scrollEl.addEventListener("scroll", () => {
      if (state.autoscrollActivo && state.enReproduccion) {
        state.autoscrollActivo = false;
        // Update label without full re-render
        const lbl = document.querySelector("#btn-desktop-autoscroll + span");
        const icon = document.getElementById("btn-desktop-autoscroll");
        if (lbl) { lbl.textContent = "manual"; lbl.style.color = "var(--text-dim)"; }
        if (icon) icon.classList.remove("active");
      }
    }, { passive: true });
  }

  // Section name / notes inputs (desktop)
  const secNameInp = document.getElementById("desktop-sec-name-input");
  if (secNameInp) {
    secNameInp.addEventListener("change", e => {
      const sec = structure.find(s => s.id === state.seccionActivaId);
      if (sec) {
        const oldName = sec.nombre.toUpperCase();
        const newName = e.target.value.trim().toUpperCase();
        if (newName && newName !== oldName) {
          song.lyrics = song.lyrics.replace(`[${oldName}]`, `[${newName}]`);
          saveLocalStorage();
          renderRehearsalRoom();
        }
      }
    });
  }
  // Section type change (desktop - supports group edit)
  const secTypeSel = document.getElementById("desktop-sec-type-select");
  if (secTypeSel) {
    secTypeSel.addEventListener("change", e => {
      const newType = e.target.value;
      const typeKeywords = {
        verso: "VERSO",
        "pre-coro": "PRE-CORO",
        estribillo: "CORO",
        puente: "PUENTE",
        intro: "INTRO",
        outro: "OUTRO",
        solo: "SOLO"
      };
      const keyword = typeKeywords[newType] || "VERSO";
      
      let sectionsToUpdate = [];
      if (state.selectedLineIndices && state.selectedLineIndices.length > 0) {
        const selectedLines = state.selectedLineIndices.map(idx => lines[idx]);
        const uniqueSecIds = [...new Set(selectedLines.map(l => l.seccionId))];
        sectionsToUpdate = uniqueSecIds.map(id => structure.find(s => s.id === id)).filter(Boolean);
      } else {
        const activeSec = structure.find(s => s.id === state.seccionActivaId);
        if (activeSec) sectionsToUpdate = [activeSec];
      }
      
      if (sectionsToUpdate.length === 0) return;
      
      let updatedLyrics = song.lyrics || "";
      sectionsToUpdate.forEach(sec => {
        const oldName = sec.nombre.toUpperCase();
        const suffix = sec.nombre.replace(/^(verso|coro|estribillo|chorus|puente|bridge|intro|outro|final|solo)/i, "").trim();
        const newName = (keyword + " " + suffix).trim().toUpperCase();
        
        if (oldName !== newName) {
          const linesOfLyrics = updatedLyrics.split("\n");
          for (let i = 0; i < linesOfLyrics.length; i++) {
            const trimmedLine = linesOfLyrics[i].trim().toUpperCase();
            if (trimmedLine.startsWith(`[${oldName}`) && trimmedLine.endsWith("]")) {
              const inner = linesOfLyrics[i].slice(1, -1);
              if (inner.includes("//")) {
                const parts = inner.split("//");
                linesOfLyrics[i] = `[${newName} //${parts[1]}]`;
              } else {
                linesOfLyrics[i] = `[${newName}]`;
              }
              break;
            }
          }
          updatedLyrics = linesOfLyrics.join("\n");
        }
      });
      
      song.lyrics = updatedLyrics;
      saveLocalStorage();
      renderRehearsalRoom();
      triggerEnsayoToast("Clasificación de estrofa actualizada");
    });
  }

  // Add Section Modal
  const btnAddSec = document.getElementById("btn-desktop-add-sec");
  const modal = document.getElementById("modalAddSection");
  const btnModalCancel = document.getElementById("btn-modal-cancel");
  const btnModalCreate = document.getElementById("btn-modal-create");
  if (btnAddSec && modal) btnAddSec.addEventListener("click", () => modal.classList.add("active"));
  if (btnModalCancel && modal) btnModalCancel.addEventListener("click", () => modal.classList.remove("active"));
  if (btnModalCreate && modal) {
    btnModalCreate.addEventListener("click", () => {
      const name = document.getElementById("modal-sec-name").value.trim();
      if (name) addDesktopSection(song, name);
      modal.classList.remove("active");
    });
  }

  // Edit Stanza Modal click bindings (line dot and number)
  document.querySelectorAll(".lyric-line-editor .line-dot, .lyric-line-editor .line-number").forEach(el => {
    el.addEventListener("click", e => {
      e.stopPropagation();
      const parent = el.closest(".lyric-line-editor");
      if (parent) {
        const idx = parseInt(parent.getAttribute("data-index"));
        openEditStanzaModal(idx);
      }
    });
  });

  const btnEditCancel = document.getElementById("btn-modal-edit-cancel");
  const btnEditSave = document.getElementById("btn-modal-edit-save");
  const modalEdit = document.getElementById("modalEditStanza");
  if (btnEditCancel && modalEdit) {
    btnEditCancel.addEventListener("click", () => modalEdit.classList.remove("active"));
  }
  if (btnEditSave) {
    btnEditSave.addEventListener("click", saveStanzaChanges);
  }
}

// Escuchar cambios de tamaño de pantalla
window.addEventListener("resize", () => {
  if (state.currentTab === "rehearsal") {
    renderRehearsalRoom();
  }
});



// ─────────────────────────────────────────────────────────────
// HELPERS DE LA HOJA DE ENSAYO
// ─────────────────────────────────────────────────────────────

function togglePlayState(song, lines) {
  if (!song) return;
  state.enReproduccion = !state.enReproduccion;
  const duration = song.duracionSegundos || 220;

  if (state.enReproduccion) {
    if (ensayoPlayInterval) clearInterval(ensayoPlayInterval);
    ensayoPlayInterval = setInterval(() => {
      state.tiempoActual += 0.5;
      if (state.tiempoActual >= duration) {
        state.tiempoActual = 0;
        state.enReproduccion = false;
        clearInterval(ensayoPlayInterval);
        ensayoPlayInterval = null;
      }
      // Advance active line based on time
      const ratio = state.tiempoActual / duration;
      const newIdx = Math.min(Math.floor(ratio * lines.length), lines.length - 1);
      if (newIdx !== state.lineaActivaIndex) {
        state.lineaActivaIndex = newIdx;
        const currentLine = lines[newIdx];
        if (currentLine) state.seccionActivaId = currentLine.seccionId;
        // Update progress bar without full re-render
        const fill = document.querySelector(".progress-fill");
        if (fill) fill.style.width = (ratio * 100) + "%";
        const timeLbl = document.getElementById("ensayo-time-current");
        if (timeLbl) timeLbl.textContent = formatTime(state.tiempoActual);
        // Highlight active line
        document.querySelectorAll(".lyric-line-editor").forEach((el, i) => {
          el.classList.toggle("active", i === newIdx);
        });
        if (state.autoscrollActivo) scrollToEnsayoLine(newIdx);
      }
    }, 500);
  } else {
    if (ensayoPlayInterval) { clearInterval(ensayoPlayInterval); ensayoPlayInterval = null; }
  }
  // Update play button icon
  const icon = document.querySelector("#btn-desktop-play i");
  if (icon) {
    icon.className = state.enReproduccion ? "ti ti-player-pause" : "ti ti-player-play";
  }
}

function saveDesktopLyrics(song, lines, structure) {
  if (!song) return;
  let newLyrics = "";
  let currentSecId = null;
  lines.forEach(line => {
    if (line.seccionId !== currentSecId) {
      currentSecId = line.seccionId;
      const sec = structure.find(s => s.id === currentSecId);
      if (sec) newLyrics += "[" + sec.nombre.toUpperCase() + "]\n";
    }
    newLyrics += line.texto + "\n";
  });
  song.lyrics = newLyrics.trim();
  saveLocalStorage();
  triggerEnsayoToast("Letra guardada correctamente");
}

function duplicateDesktopLine(song, idx) {
  if (!song) return;
  const lines = song.lyrics.split("\n");
  const allLines = [];
  let lineCount = 0;
  lines.forEach(l => {
    const t = l.trim();
    if (isSectionHeader(t)) {
      allLines.push(l);
    } else if (t !== "") {
      if (lineCount === idx) allLines.push(l);
      allLines.push(l);
      lineCount++;
    } else {
      allLines.push(l);
    }
  });
  song.lyrics = allLines.join("\n");
  saveLocalStorage();
  renderRehearsalRoom();
}

function deleteDesktopLine(song, idx) {
  if (!song) return;
  const lines = song.lyrics.split("\n");
  const allLines = [];
  let lineCount = 0;
  lines.forEach(l => {
    const t = l.trim();
    if (isSectionHeader(t)) {
      allLines.push(l);
    } else if (t !== "") {
      if (lineCount !== idx) allLines.push(l);
      lineCount++;
    } else {
      allLines.push(l);
    }
  });
  song.lyrics = allLines.join("\n");
  saveLocalStorage();
  renderRehearsalRoom();
}

function addDesktopSection(song, name) {
  if (!song || !name) return;
  const tag = "[" + name.trim().toUpperCase() + "]\n";
  song.lyrics = (song.lyrics || "") + "\n" + tag + "Nueva línea de letra\n";
  saveLocalStorage();
  renderRehearsalRoom();
}

// Variables globales para la edición de estrofas
let currentEditingSectionId = null;
let currentEditingSectionOldName = null;

function openEditStanzaModal(lineIndex) {
  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (!song) return;
  
  const lines = parseLyricsToEnsayoModel(song.lyrics);
  const line = lines[lineIndex];
  if (!line) return;
  
  const structure = getSongEstructuraEnsayo(song, lines);
  const sec = structure.find(s => s.id === line.seccionId);
  if (!sec) return;
  
  currentEditingSectionId = sec.id;
  currentEditingSectionOldName = sec.nombre;
  
  // Reconstruct section raw text
  const secLines = lines.filter(l => l.seccionId === sec.id);
  const rawText = secLines.map(l => {
    let raw = l.texto;
    const sortedChords = [...l.acordes].sort((a, b) => b.posicionCaracter - a.posicionCaracter);
    sortedChords.forEach(ac => {
      const pos = ac.posicionCaracter || 0;
      raw = raw.slice(0, pos) + `[${ac.acorde}]` + raw.slice(pos);
    });
    return raw;
  }).join("\n");
  
  // Set inputs
  const nameInp = document.getElementById("modal-edit-sec-name");
  const typeSel = document.getElementById("modal-edit-sec-type");
  const notesInp = document.getElementById("modal-edit-sec-notes");
  const lyricsTextarea = document.getElementById("modal-edit-sec-lyrics");
  
  if (nameInp) nameInp.value = sec.nombre;
  if (typeSel) typeSel.value = sec.tipo;
  if (notesInp) notesInp.value = sec.notas || "";
  if (lyricsTextarea) lyricsTextarea.value = rawText;
  
  // Show modal
  const modal = document.getElementById("modalEditStanza");
  if (modal) modal.classList.add("active");
}

function saveStanzaChanges() {
  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (!song) return;
  
  const nameInp = document.getElementById("modal-edit-sec-name");
  const typeSel = document.getElementById("modal-edit-sec-type");
  const notesInp = document.getElementById("modal-edit-sec-notes");
  const lyricsTextarea = document.getElementById("modal-edit-sec-lyrics");
  
  if (!nameInp || !typeSel || !notesInp || !lyricsTextarea) return;
  
  const newName = nameInp.value.trim().toUpperCase();
  const newNotes = notesInp.value.trim();
  const newLyrics = lyricsTextarea.value.trim();
  
  if (!newName) {
    alert("El nombre de la sección no puede estar vacío.");
    return;
  }
  
  updateSongSection(song, currentEditingSectionOldName, newName, newNotes, newLyrics);
  
  // Close modal
  const modal = document.getElementById("modalEditStanza");
  if (modal) modal.classList.remove("active");
  
  // Re-render
  renderRehearsalRoom();
  triggerEnsayoToast("Estrofa editada correctamente");
}

function updateSongSection(song, oldSecName, newSecName, newSectionNotes, newSectionLyrics) {
  const raw = song.lyrics || "";
  const lines = raw.split("\n");
  
  let sectionStartIndex = -1;
  let sectionEndIndex = -1;
  
  const targetTag = oldSecName.toUpperCase().trim();
  
  // We search for oldSecName header tag. It might have notes, so we check if it starts with [oldSecName
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim().toUpperCase();
    if (l.startsWith(`[${targetTag}`) && l.endsWith("]")) {
      sectionStartIndex = i;
      break;
    }
  }
  
  if (sectionStartIndex === -1) {
    if (targetTag === "INTRO" || targetTag === "SIN SECCION" || targetTag === "SIN-SECCION") {
      let firstTagIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (isSectionHeader(lines[i])) {
          firstTagIndex = i;
          break;
        }
      }
      sectionStartIndex = 0;
      if (firstTagIndex !== -1) {
        sectionEndIndex = firstTagIndex;
      } else {
        sectionEndIndex = lines.length;
      }
    } else {
      console.error("Section tag not found:", oldSecName);
      return;
    }
  } else {
    for (let i = sectionStartIndex + 1; i < lines.length; i++) {
      if (isSectionHeader(lines[i])) {
        sectionEndIndex = i;
        break;
      }
    }
    if (sectionEndIndex === -1) {
      sectionEndIndex = lines.length;
    }
  }
  
  const before = lines.slice(0, sectionStartIndex);
  const after = lines.slice(sectionEndIndex);
  
  let header = `[${newSecName.toUpperCase().trim()}`;
  if (newSectionNotes.trim() !== "") {
    header += ` // ${newSectionNotes.trim()}`;
  }
  header += "]";
  
  const middle = [header, newSectionLyrics.trim()];
  const newRawLyrics = [...before, ...middle, ...after].join("\n");
  song.lyrics = newRawLyrics;
  saveLocalStorage();
}

function changeTimeSignature(sig) {

  state.metronome.beatsPerMeasure = parseInt(sig.split("/")[0]) || 4;
  state.metronome.beatUnit = parseInt(sig.split("/")[1]) || 4;
  if (state.activeSongId) {
    const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
    if (song) {
      song.timeSig = sig;
      saveLocalStorage();
    }
  }
  
  // Sincronizar el loop de batería al cambiar de compás
  if (state.drumMachine && state.drumMachine.selectedPattern) {
    const steps = getSequencerStepsCount();
    state.drumMachine.grid = buildDrumPatternGrid(state.drumMachine.selectedPattern, steps);
    saveDrumMachineSettingsToActiveSong();
  }
  
  renderRehearsalRoom();
}

function applyCustomTimeSig() {
  const beatsInput = document.getElementById("custom-beats-num");
  const unitSelect = document.getElementById("custom-beats-unit");
  if (beatsInput && unitSelect) {
    const beats = parseInt(beatsInput.value) || 4;
    const unit = parseInt(unitSelect.value) || 4;
    const sig = `${beats}/${unit}`;
    
    state.metronome.beatsPerMeasure = beats;
    state.metronome.beatUnit = unit;
    
    if (state.activeSongId) {
      const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
      if (song) {
        song.timeSig = sig;
        saveLocalStorage();
      }
    }
    
    // Sincronizar el loop de batería al cambiar de compás
    if (state.drumMachine && state.drumMachine.selectedPattern) {
      const steps = getSequencerStepsCount();
      state.drumMachine.grid = buildDrumPatternGrid(state.drumMachine.selectedPattern, steps);
      saveDrumMachineSettingsToActiveSong();
    }
    
    renderRehearsalRoom();
  }
}

function saveMetronomeParamsToSong() {
  if (!state.activeSongId) return;
  
  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (song) {
    const beatsInput = document.getElementById("custom-beats-num");
    const unitSelect = document.getElementById("custom-beats-unit");
    
    let beats = state.metronome.beatsPerMeasure;
    let unit = state.metronome.beatUnit || 4;
    
    if (beatsInput && unitSelect) {
      beats = parseInt(beatsInput.value) || beats;
      unit = parseInt(unitSelect.value) || unit;
    }
    
    state.metronome.beatsPerMeasure = beats;
    state.metronome.beatUnit = unit;
    song.bpm = state.metronome.bpm;
    song.timeSig = `${beats}/${unit}`;
    
    saveLocalStorage();
    renderApp();
    
    // Proporcionar un feedback visual temporal (cambio de texto o alerta)
    const btn = document.querySelector(".btn-save-params");
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = "¡GUARDADO!";
      btn.style.borderColor = "var(--neon-lime)";
      btn.style.color = "var(--neon-lime)";
      btn.style.textShadow = "var(--glow-lime)";
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.borderColor = "";
        btn.style.color = "";
        btn.style.textShadow = "";
      }, 1500);
    }
  }
}

function toggleMetronomeMute() {
  state.metronome.isMuted = !state.metronome.isMuted;
  const btn = document.getElementById("btn-toggle-metronome-sound");
  if (btn) {
    if (state.metronome.isMuted) {
      btn.classList.remove("active");
      btn.textContent = "🔇";
    } else {
      btn.classList.add("active");
      btn.textContent = "🔊";
    }
  }
}

let tapTimes = [];
function handleTapTempo() {
  const btn = document.getElementById("btn-tap-tempo");
  if (btn) {
    btn.classList.add("flashing");
    setTimeout(() => btn.classList.remove("flashing"), 100);
  }
  
  // Agregar destello visual con efectos de luces neón en el dial y el anillo
  const dialCenter = document.getElementById("metronome-dial-center");
  if (dialCenter) {
    dialCenter.classList.add("tap-flash");
    setTimeout(() => dialCenter.classList.remove("tap-flash"), 150);
  }
  const ring = document.getElementById("metronome-ring");
  if (ring) {
    ring.classList.add("tap-ring-flash");
    setTimeout(() => ring.classList.remove("tap-ring-flash"), 150);
  }

  const now = Date.now();
  tapTimes.push(now);
  if (tapTimes.length > 4) tapTimes.shift();
  
  if (tapTimes.length >= 2) {
    let intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i-1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval);
    updateBpm(bpm);
  }
}

// --- SECCIONADO DE LETRAS PARA VISTA DE ENSAYO ---
function parseLyricsToSections(lyricsText) {
  if (!lyricsText) return [];
  
  const lines = lyricsText.split("\n");
  const sections = [];
  let currentSection = { header: "", lines: [] };
  
  // Cabeceras explícitas estilo [VERSE 1]
  const sectionHeaderRegex = /^\[(INTRO|VERSE|CHORUS|SOLO|BRIDGE|OUTRO|INTRODUCCIÓN|CORO|ESTROFA|VERSO|PUENTE|ESTRIBILLO|FINAL)(\s+[\w\d]+)?(\s*\(ACTIVE\))?\]$/i;
  
  let verseIndex = 1;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
        currentSection = { header: "", lines: [] };
      }
      return;
    }
    
    const match = trimmed.match(sectionHeaderRegex);
    if (match) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { header: match[1].toUpperCase() + (match[2] ? match[2].toUpperCase() : ""), lines: [] };
    } else {
      currentSection.lines.push(line);
    }
  });
  
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }
  
  // Auto-sección si no hay cabeceras explícitas
  sections.forEach((sec, idx) => {
    if (!sec.header) {
      const text = sec.lines.join("\n").toLowerCase();
      if (text.includes("de aquel amor") || text.includes("y yo estoy aquí") || text.includes("creep") || text.includes("yesterday")) {
        sec.header = "CHORUS";
      } else if (text.includes("solo:") || text.includes("intro:") || text.includes("solo piano")) {
        sec.header = "INTRO";
      } else {
        sec.header = "VERSE " + verseIndex;
        verseIndex++;
      }
    }
  });
  
  return sections;
}

function renderLyricsBySections(song) {
  const sections = parseLyricsToSections(song.lyrics);
  
  return sections.map((section, idx) => {
    const isActive = state.activeSectionIndex === idx;
    const activeClass = isActive ? "active" : "";
    const loopBtn = `<button class="btn-loop-section ${isActive ? 'active' : ''}" onclick="event.stopPropagation(); toggleSectionLoop(${idx})">Loop</button>`;
    
    // Section header shown vertically on the left margin (notebook style)
    const sectionLabel = section.header
      .replace(/VERSE/gi, 'Verso')
      .replace(/CHORUS/gi, 'Coro')
      .replace(/BRIDGE/gi, 'Puente')
      .replace(/PRE-CHORUS/gi, 'Pre-Coro')
      .replace(/INTRO/gi, 'Intro')
      .replace(/OUTRO/gi, 'Outro');
    
    return `
      <div class="lyrics-section-card glass ${activeClass}" id="section-card-${idx}">
        <div class="lyrics-section-sidebar" onclick="toggleSectionLoop(${idx})">
          <span class="lyrics-section-label">${sectionLabel}</span>
          ${loopBtn}
        </div>
        <div class="lyrics-section-body">
          ${parseLyrics(section.lines.join("\n"))}
        </div>
      </div>
    `;
  }).join("");
}

// --- PARSER DE LETRAS CON ACORDES Y ANOTACIONES ---
// Convierte un string plano tipo "[C] Hola [G] mundo" en una estructura alineada HTML
// También reconoce anotaciones de voz tipo "(Henry: Hola mundo)"
function parseLyrics(lyricsText) {
  if (!lyricsText) return "";
  
  const lines = lyricsText.split("\n");
  let activeVocal = null; // Guardará { names: Array, colorStyle: String, isGeneralNote: Boolean }
  
  return lines.map(line => {
    line = line.trimRight();
    
    // Si la línea es vacía
    if (line === "") {
      return `
        <div class="song-line-wrapper empty-line">
          <div class="song-line-left-col"></div>
          <div class="song-line-right-col">
            <div class="lyric-row" style="height: 18px"></div>
          </div>
        </div>
      `;
    }
    
    // Si es una línea instrumental
    if (line.startsWith("Solo:") || line.startsWith("Intro:") || line.startsWith("Puente:") || line.startsWith("Instrumental:")) {
      return `
        <div class="song-line-wrapper instrumental-line">
          <div class="song-line-left-col"></div>
          <div class="song-line-right-col">
            <div class="instrumental-row">${line}</div>
          </div>
        </div>
      `;
    }
    
    let cleanLine = line;
    let shouldClearActiveVocal = false;
    let commentText = "";
    let lyricTextToColor = "";
    let hasAnnotation = false;
    
    // Guardamos la referencia de activeVocal para usarla al final del map de esta línea
    let noteActiveVocal = activeVocal;
    
    if (!activeVocal) {
      // 1. Detectar inicio de anotación (Javi, Deimars: ...
      const matchOpen = cleanLine.match(/\(([^:)]+):\s*/);
      if (matchOpen) {
        hasAnnotation = true;
        const namesStr = matchOpen[1];
        const namesList = namesStr.split(",").map(n => n.trim());
        const isCoro = namesList.some(n => n.toLowerCase() === "coro");
        const isGeneralNote = namesList.some(n => n.toLowerCase() === "nota");
        
        let colorStyle;
        if (isCoro) {
          colorStyle = "color:#ffeb3b; text-shadow:0 0 8px #ffeb3b80;";
        } else if (isGeneralNote) {
          colorStyle = "";
        } else {
          colorStyle = buildVocalColorStyle(namesList);
        }
        
        const tempActiveVocal = { names: namesList, colorStyle: colorStyle, isGeneralNote: isGeneralNote };
        noteActiveVocal = tempActiveVocal;
        
        // Verificar si cierra en la misma línea
        const openParenIndex = matchOpen.index;
        const closeParenIndex = cleanLine.indexOf(")", openParenIndex + matchOpen[0].length);
        
        if (closeParenIndex !== -1) {
          const innerContent = cleanLine.substring(openParenIndex + matchOpen[0].length, closeParenIndex);
          const lastHyphenIndex = innerContent.lastIndexOf(" - ");
          let lyricPart = innerContent;
          if (lastHyphenIndex !== -1) {
            lyricPart = innerContent.substring(0, lastHyphenIndex);
            commentText = innerContent.substring(lastHyphenIndex + 3).trim();
          }
          
          lyricTextToColor = lyricPart;
          activeVocal = tempActiveVocal;
          shouldClearActiveVocal = true;
          
          cleanLine = cleanLine.substring(0, openParenIndex) + lyricPart + cleanLine.substring(closeParenIndex + 1);
        } else {
          const innerContent = cleanLine.substring(openParenIndex + matchOpen[0].length);
          lyricTextToColor = innerContent;
          activeVocal = tempActiveVocal;
          shouldClearActiveVocal = false;
          
          cleanLine = cleanLine.substring(0, openParenIndex) + innerContent;
        }
      }
    } else {
      // 2. Si ya hay una anotación activa de líneas previas
      hasAnnotation = true;
      const closeParenIndex = cleanLine.indexOf(")");
      
      if (closeParenIndex !== -1) {
        const innerContent = cleanLine.substring(0, closeParenIndex);
        const lastHyphenIndex = innerContent.lastIndexOf(" - ");
        let lyricPart = innerContent;
        if (lastHyphenIndex !== -1) {
          lyricPart = innerContent.substring(0, lastHyphenIndex);
          commentText = innerContent.substring(lastHyphenIndex + 3).trim();
        }
        
        lyricTextToColor = lyricPart;
        shouldClearActiveVocal = true;
        
        cleanLine = lyricPart + cleanLine.substring(closeParenIndex + 1);
      } else {
        lyricTextToColor = cleanLine;
        shouldClearActiveVocal = false;
      }
    }
    
    // 3. Extraer acordes de la porción de letra limpia
    let finalLyricText = "";
    let chordsList = [];
    const regexClean = /\[([^\]]+)\]/g;
    let matchClean;
    let lastIndexClean = 0;
    
    while ((matchClean = regexClean.exec(cleanLine)) !== null) {
      finalLyricText += cleanLine.substring(lastIndexClean, matchClean.index);
      chordsList.push({
        name: matchClean[1],
        pos: finalLyricText.length
      });
      lastIndexClean = regexClean.lastIndex;
    }
    finalLyricText += cleanLine.substring(lastIndexClean);
    
    // 4. Determinar si hay anotación activa para iniciales y colores
    let renderedLyric = finalLyricText;
    let initialsHtml = "";
    
    if (activeVocal) {
      hasAnnotation = true;
      initialsHtml = buildInitialsBadgesHtml(activeVocal.names);
      
      if (activeVocal.isGeneralNote) {
        renderedLyric = finalLyricText;
      } else {
        // Envolver ÚNICAMENTE la sección que canta el integrante (lyricTextToColor)
        // en lugar de toda la línea final
        if (lyricTextToColor) {
          const cleanColorText = lyricTextToColor.replace(/\[[^\]]+\]/g, "");
          const wrappedSpan = `<span class="vocal-annotation" style="${activeVocal.colorStyle}">${cleanColorText}</span>`;
          renderedLyric = finalLyricText.replace(cleanColorText, wrappedSpan);
        } else {
          renderedLyric = `<span class="vocal-annotation" style="${activeVocal.colorStyle}">${finalLyricText}</span>`;
        }
      }
    }
    
    // Construir nota HTML si se extrajo un comentario
    let noteHtml = "";
    if (commentText && noteActiveVocal) {
      let noteColor;
      if (noteActiveVocal.isGeneralNote) {
        noteColor = "var(--text-muted)";
      } else {
        noteColor = noteActiveVocal.names[0]
          ? (noteActiveVocal.names[0].toLowerCase() === "coro" ? "#ffeb3b" : getMemberColor(noteActiveVocal.names[0]))
          : "#ffeb3b";
      }
      noteHtml = `<div class="vocal-note-row" style="color: ${noteColor};">${commentText}</div>`;
    }
    
    // Si al final de la línea se cerró el paréntesis, limpiar el estado activo para la siguiente línea
    if (shouldClearActiveVocal) {
      activeVocal = null;
    }

    
    const hasChordsClass = chordsList.length > 0 ? "has-chords" : "";
    const annotatedClass = hasAnnotation ? "notebook-annotation" : "";
    
    let contentHtml = "";
    
    // Si la línea no tiene acordes
    if (chordsList.length === 0) {
      contentHtml = `
        <div class="lyric-row ${annotatedClass}">${renderedLyric}</div>
        ${noteHtml}
      `;
    } else {
      // Si la línea tiene acordes, construimos la fila de acordes y de letras
      let chordHtml = "";
      let lastPos = 0;
      chordsList.forEach(c => {
        const alignedPos = c.pos; // offset es 0 porque las iniciales están en la columna izquierda
        const spaces = alignedPos - lastPos;
        if (spaces > 0) {
          chordHtml += "&nbsp;".repeat(spaces);
        }
        chordHtml += `<span class="chord-in-text text-cyan" onclick="playAndSelectChord('${c.name}')">${c.name}</span>`;
        lastPos = alignedPos + c.name.length;
      });
      
      contentHtml = `
        <div class="chord-row">${chordHtml}</div>
        <div class="lyric-row ${annotatedClass}">${renderedLyric}</div>
        ${noteHtml}
      `;
    }
    
    return `
      <div class="song-line-wrapper ${hasChordsClass} ${annotatedClass}">
        <div class="song-line-left-col">${initialsHtml}</div>
        <div class="song-line-right-col">${contentHtml}</div>
      </div>
    `;
  }).join("");
}


function playAndSelectChord(chordName) {
  // Limpiar caracteres extra (ej. Dm/C -> Dm)
  const cleanChord = chordName.split("/")[0].trim();
  playChord(cleanChord, state.currentInstrument);
  selectChord(cleanChord);
}

// --- RITMO: RENDERIZAR FLECHAS ---
function renderStrummingArrows(rhythmString) {
  if (!rhythmString) return "";
  
  const beats = rhythmString.split(/\s+/);
  return beats.map((beat, i) => {
    let arrow = "•";
    let className = "";
    if (beat.includes("↓")) {
      arrow = "↓";
      className = "down";
    } else if (beat.includes("↑")) {
      arrow = "↑";
      className = "up";
    }
    return `<div class="strum-arrow stroke-${i}" data-stroke="${beat}">${arrow}</div>`;
  }).join("");
}

// --- EDITAR CANCIÓN DESDE SALA ---
function editActiveSong() {
  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (!song) return;
  
  document.getElementById("form-song-id").value = song.id;
  document.getElementById("song-title").value = song.title;
  document.getElementById("song-artist").value = song.artist;
  document.getElementById("song-bpm").value = song.bpm;
  document.getElementById("song-key").value = song.key;
  document.getElementById("song-timesig").value = song.timeSig;
  document.getElementById("song-status").value = song.status;
  document.getElementById("song-lyrics").value = song.lyrics;
  
  // Rellenar campos de metadatos inline
  const metaTitle = document.getElementById("meta-title");
  const metaArtist = document.getElementById("meta-artist");
  const metaBpm = document.getElementById("meta-bpm");
  const metaKey = document.getElementById("meta-key");
  const metaTimesig = document.getElementById("meta-timesig");
  const metaStatus = document.getElementById("meta-status");
  
  if (metaTitle) updateTextElement(metaTitle, song.title);
  if (metaArtist) updateTextElement(metaArtist, song.artist);
  if (metaBpm) updateTextElement(metaBpm, song.bpm.toString());
  if (metaKey) metaKey.textContent = song.key;
  if (metaTimesig) metaTimesig.textContent = song.timeSig;
  
  if (metaStatus) {
    let statusLabel = "Por Aprender";
    if (song.status === "practicing") statusLabel = "En Ensayo";
    else if (song.status === "ready") statusLabel = "Listo";
    metaStatus.textContent = statusLabel;
  }
  
  // Rellenar editor de letras rico
  const richEditor = document.getElementById("editor-rich-lyrics");
  if (richEditor) {
    richEditor.innerHTML = parseTextToRichLyrics(song.lyrics);
    bindChordBadgeEvents();
  }
  
  document.getElementById("modal-song-title").textContent = "Editar Tema";
  document.getElementById("modal-add-song").classList.add("open");
}

// --- ENLACE COMPARTIDO (BASE64) ---
function shareActiveSong() {
  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (!song) return;
  
  // Limpiar ID local y auditorias temporales antes de exportar
  const exportSong = {
    title: song.title,
    artist: song.artist,
    bpm: song.bpm,
    key: song.key,
    timeSig: song.timeSig,
    status: song.status,
    rhythm: song.rhythm,
    lyrics: song.lyrics
  };
  
  try {
    // Codificar en Base64 seguro para URL
    const songJson = JSON.stringify(exportSong);
    const base64 = btoa(unescape(encodeURIComponent(songJson)));
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?song=${base64}`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("¡Enlace compartido copiado al portapapeles! Envíalo a los miembros de tu banda.");
    }).catch(err => {
      // Fallback
      prompt("Copia este enlace para compartir:", shareUrl);
    });
  } catch (e) {
    console.error("Error al generar enlace compartido:", e);
    alert("Hubo un problema al empaquetar la canción.");
  }
}

// --- METRÓNOMO: PULSO DE PRECISIÓN ---
function updateBpm(val) {
  if (val < 40) val = 40;
  if (val > 240) val = 240;
  
  state.metronome.bpm = val;
  
  const bpmInput = document.getElementById("metronome-bpm-slider");
  const bpmDisplay = document.getElementById("bpm-number");
  const transportBpmDisplay = document.getElementById("transport-bpm-display");
  
  if (bpmInput) bpmInput.value = val;
  if (bpmDisplay) bpmDisplay.textContent = val;
  if (transportBpmDisplay) transportBpmDisplay.textContent = `${val} BPM`;
  
  const fabBpmDisplay = document.getElementById("fab-bpm-display");
  if (fabBpmDisplay) fabBpmDisplay.textContent = val;
  
  // Si está sonando, reiniciar intervalo para aplicar cambio de velocidad
  if (state.metronome.isPlaying) {
    stopMetronomeTimer();
    startMetronomeTimer();
  }
}

function toggleMetronome() {
  const btn = document.getElementById("btn-play-metronome");
  initAudioContext(); // Asegurar contexto activo
  
  if (state.metronome.isPlaying) {
    // Apagar
    state.metronome.isPlaying = false;
    if (btn) btn.classList.remove("active");
    stopMetronomeTimer();
    resetMetronomeVisuals();
    resetSequencerVisuals();
  } else {
    // Encender
    state.metronome.isPlaying = true;
    if (btn) btn.classList.add("active");
    state.metronome.currentBeat = 0;
    startMetronomeTimer();
  }
}

function startMetronomeTimer() {
  const beatUnit = state.metronome.beatUnit || 4;
  const isDrumEnabled = state.drumMachine && state.drumMachine.enabled;
  const divider = isDrumEnabled ? 2 : 1;
  const intervalMs = ((60 / state.metronome.bpm) * (4 / beatUnit) * 1000) / divider;
  
  if (isDrumEnabled) {
    state.drumMachine.currentStep = 0;
  }
  
  // Ejecutar primer pulso inmediatamente
  playMetronomeTick();
  
  state.metronome.intervalId = setInterval(() => {
    playMetronomeTick();
  }, intervalMs);
}

function stopMetronomeTimer() {
  if (state.metronome.intervalId) {
    clearInterval(state.metronome.intervalId);
    state.metronome.intervalId = null;
  }
}

function playMetronomeTick() {
  initAudioContext(); // Asegurar contexto activo
  
  const isDrumEnabled = state.drumMachine && state.drumMachine.enabled;
  
  if (isDrumEnabled) {
    const step = state.drumMachine.currentStep;
    const now = audioCtx ? audioCtx.currentTime : 0;
    
    // 1. Play active sequencer instruments
    if (audioCtx) {
      if (state.drumMachine.grid.kick[step]) playKick(now);
      if (state.drumMachine.grid.snare[step]) playSnare(now);
      if (state.drumMachine.grid.hihat[step]) playHiHat(now);
    }
    
    // 2. Play metronome tick only on main beats (even steps: 0, 2, 4, 6...)
    if (step % 2 === 0) {
      const beats = state.metronome.beatsPerMeasure;
      const current = state.metronome.currentBeat;
      
      // Play click sound
      if (audioCtx && !state.metronome.isMuted) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const isFirstBeat = (current === 0);
        osc.frequency.setValueAtTime(isFirstBeat ? 1000 : 600, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.15 * state.metronome.volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
      
      // Animate metronome ring and beat indicators
      const ring = document.getElementById("metronome-ring");
      const dots = document.querySelectorAll("#beats-indicator .beat-dot");
      const miniDots = document.querySelectorAll("#mini-beats-indicator .mini-beat-dot");
      
      if (ring) {
        ring.className = "metronome-ring";
        void ring.offsetWidth;
        if (current === 0) {
          ring.classList.add("beat-1");
        } else {
          ring.classList.add("beat-other");
        }
      }
      
      // Actualizar puntos del compás
      dots.forEach((dot, idx) => {
        dot.className = "beat-dot";
        if (idx === current) {
          if (current === 0) dot.classList.add("active-1");
          else dot.classList.add("active-other");
        }
      });
      
      // Mini LEDs bar in header
      miniDots.forEach((dot, idx) => {
        dot.style.background = "rgba(255, 255, 255, 0.05)";
        dot.style.borderColor = "var(--border-color)";
        dot.style.boxShadow = "none";
        
        if (idx === current) {
          if (current === 0) {
            dot.style.background = "var(--neon-orange)";
            dot.style.borderColor = "var(--neon-orange)";
            dot.style.boxShadow = "0 0 8px rgba(255, 109, 0, 0.8)";
          } else {
            dot.style.background = "var(--neon-lime)";
            dot.style.borderColor = "var(--neon-lime)";
            dot.style.boxShadow = "0 0 8px rgba(0, 255, 102, 0.8)";
          }
        }
      });
      
      // Sincronizar patrón de rasgueo
      const arrows = document.querySelectorAll("#strumming-pattern-visualizer .strum-arrow");
      if (arrows.length > 0) {
        arrows.forEach(a => a.classList.remove("down-active", "up-active"));
        const arrowIndex = current % arrows.length;
        const activeArrow = arrows[arrowIndex];
        if (activeArrow) {
          const strokeType = activeArrow.getAttribute("data-stroke");
          if (strokeType.includes("↓")) activeArrow.classList.add("down-active");
          else if (strokeType.includes("↑")) activeArrow.classList.add("up-active");
        }
      }
      
      // Increment beat
      state.metronome.currentBeat = (current + 1) % beats;
      updateTimelineBeatVisuals();
    }
    
    // 3. Highlight current sequencer step in UI
    const seqDots = document.querySelectorAll(".seq-step-dot");
    seqDots.forEach((dot, idx) => {
      dot.className = "seq-step-dot";
      if (idx === step) {
        if (step % 2 === 0) {
          dot.classList.add("current-main");
        } else {
          dot.classList.add("current");
        }
      }
    });
    
    // Increment step
    const stepsCount = getSequencerStepsCount();
    state.drumMachine.currentStep = (step + 1) % stepsCount;
    
  } else {
    // Normal metronome tick
    const beats = state.metronome.beatsPerMeasure;
    const current = state.metronome.currentBeat;
    
    if (audioCtx && !state.metronome.isMuted) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const isFirstBeat = (current === 0);
      osc.frequency.setValueAtTime(isFirstBeat ? 1000 : 600, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.15 * state.metronome.volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }
    
    const ring = document.getElementById("metronome-ring");
    const dots = document.querySelectorAll("#beats-indicator .beat-dot");
    const miniDots = document.querySelectorAll("#mini-beats-indicator .mini-beat-dot");
    
    if (ring) {
      ring.className = "metronome-ring";
      void ring.offsetWidth;
      if (current === 0) {
        ring.classList.add("beat-1");
      } else {
        ring.classList.add("beat-other");
      }
    }
    
    dots.forEach((dot, idx) => {
      dot.className = "beat-dot";
      if (idx === current) {
        if (current === 0) dot.classList.add("active-1");
        else dot.classList.add("active-other");
      }
    });
    
    miniDots.forEach((dot, idx) => {
      dot.style.background = "rgba(255, 255, 255, 0.05)";
      dot.style.borderColor = "var(--border-color)";
      dot.style.boxShadow = "none";
      
      if (idx === current) {
        if (current === 0) {
          dot.style.background = "var(--neon-orange)";
          dot.style.borderColor = "var(--neon-orange)";
          dot.style.boxShadow = "0 0 8px rgba(255, 109, 0, 0.8)";
        } else {
          dot.style.background = "var(--neon-lime)";
          dot.style.borderColor = "var(--neon-lime)";
          dot.style.boxShadow = "0 0 8px rgba(0, 255, 102, 0.8)";
        }
      }
    });
    
    const arrows = document.querySelectorAll("#strumming-pattern-visualizer .strum-arrow");
    if (arrows.length > 0) {
      arrows.forEach(a => a.classList.remove("down-active", "up-active"));
      const arrowIndex = current % arrows.length;
      const activeArrow = arrows[arrowIndex];
      if (activeArrow) {
        const strokeType = activeArrow.getAttribute("data-stroke");
        if (strokeType.includes("↓")) activeArrow.classList.add("down-active");
        else if (strokeType.includes("↑")) activeArrow.classList.add("up-active");
      }
    }
    
    state.metronome.currentBeat = (current + 1) % beats;
    updateTimelineBeatVisuals();
  }
}

function resetMetronomeVisuals() {
  const ring = document.getElementById("metronome-ring");
  if (ring) ring.className = "metronome-ring";
  
  const dots = document.querySelectorAll("#beats-indicator .beat-dot");
  dots.forEach(dot => dot.className = "beat-dot");
  
  const arrows = document.querySelectorAll("#strumming-pattern-visualizer .strum-arrow");
  arrows.forEach(a => a.classList.remove("down-active", "up-active"));
}

// --- SCROLL AUTOMÁTICO ---
function toggleAutoScroll() {
  const btn = document.getElementById("btn-scroll-play");
  const scrollArea = document.getElementById("lyrics-scroll-area");
  if (!btn || !scrollArea) return;
  
  if (state.autoScroll.isActive) {
    state.autoScroll.isActive = false;
    btn.classList.remove("active");
    btn.innerHTML = `<span class="play-icon">▶</span>`;
    
    if (state.autoScroll.intervalId) {
      clearInterval(state.autoScroll.intervalId);
      state.autoScroll.intervalId = null;
    }
  } else {
    state.autoScroll.isActive = true;
    btn.classList.add("active");
    btn.innerHTML = `<span class="play-icon">⏸</span>`;
    
    const delay = 40;
    const step = (state.metronome.bpm / 120) * state.autoScroll.speed * 0.45;
    
    state.autoScroll.intervalId = setInterval(() => {
      scrollArea.scrollTop += step;
      
      // Control de loop de estrofa activa
      const activeCard = scrollArea.querySelector(".lyrics-section-card.active");
      if (activeCard) {
        const sectionStart = activeCard.offsetTop;
        const sectionEnd = sectionStart + activeCard.offsetHeight;
        
        // Si el tope del scroll llegó al final de la estrofa activa (con margen de 60px)
        if (scrollArea.scrollTop >= sectionEnd - 60) {
          scrollArea.scrollTop = sectionStart;
        }
      }
      
      if (scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 2) {
        toggleAutoScroll();
      }
    }, delay);
  }
}

// --- GRABADORA DE AUDIO ---
function startRecording() {
  initAudioContext();
  
  const timerDisplays = document.querySelectorAll("#transport-record-timer, #fab-record-timer");
  const btnRec = document.getElementById("btn-record-transport");
  
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      state.recorder.stream = stream;
      state.recorder.mediaRecorder = new MediaRecorder(stream);
      state.recorder.audioChunks = [];
      
      // Configurar analizador de frecuencia para la onda visual
      if (audioCtx) {
        const source = audioCtx.createMediaStreamSource(stream);
        state.recorder.analyser = audioCtx.createAnalyser();
        state.recorder.analyser.fftSize = 256;
        source.connect(state.recorder.analyser);
      }
      
      state.recorder.mediaRecorder.ondataavailable = e => {
        state.recorder.audioChunks.push(e.data);
      };
      
      state.recorder.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(state.recorder.audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Agregar grabación al listado local
        const songName = state.activeSongId ? state.songs.find(s => String(s.id) === String(state.activeSongId)).title : "Ensayo Libre";
        const newRecord = {
          id: "r_" + Date.now(),
          songId: state.activeSongId,
          songName: songName,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          url: audioUrl
        };
        
        // Mantener solo los últimos 20 ensayos grabados para no sobrecargar el almacenamiento
        state.recorder.recordings.unshift(newRecord);
        if (state.recorder.recordings.length > 20) {
          state.recorder.recordings.pop();
        }
        
        saveRecordingsState();
        renderRehearsalRoom();
        renderGlobalRecordingsList();
      };
      
      // Comenzar
      state.recorder.mediaRecorder.start();
      state.recorder.isRecording = true;
      
      if (btnRec) {
        btnRec.classList.add("recording");
        btnRec.title = "Detener Grabación";
      }
      
      // Cronómetro
      let secs = 0;
      state.recorder.timerId = setInterval(() => {
        secs++;
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        timerDisplays.forEach(td => td.textContent = `${m}:${s}`);
      }, 1000);
      
      // Dibujar onda de audio
      visualizeAudioWave();
    })
    .catch(err => {
      console.error("No se pudo acceder al micrófono:", err);
      alert("No se pudo iniciar la grabación. Asegúrate de otorgar permisos para usar el micrófono.");
    });
}

function stopRecording() {
  const btnRec = document.getElementById("btn-record-transport");
  
  if (state.recorder.mediaRecorder && state.recorder.isRecording) {
    state.recorder.mediaRecorder.stop();
    state.recorder.isRecording = false;
    
    // Detener tracks de micrófono
    if (state.recorder.stream) {
      state.recorder.stream.getTracks().forEach(track => track.stop());
    }
    
    clearInterval(state.recorder.timerId);
    
    // Detener animación de canvas
    if (state.recorder.animationFrameId) {
      cancelAnimationFrame(state.recorder.animationFrameId);
    }
    
    if (btnRec) {
      btnRec.classList.remove("recording");
      btnRec.title = "Grabar Sesión";
    }
  }
}

// Visualizador de la onda en Canvas
function visualizeAudioWave() {
  const canvases = document.querySelectorAll("#transport-wave-canvas, #fab-record-canvas");
  if (canvases.length === 0) return;
  
  const analyser = state.recorder.analyser;
  if (!analyser) return;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  // Redimensionar canvases internamente
  canvases.forEach(canvas => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  });
  
  function draw() {
    state.recorder.animationFrameId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
    canvases.forEach(canvas => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.fillStyle = "rgba(10, 11, 13, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Degradado neón (púrpura a cian)
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, "var(--neon-purple)");
        grad.addColorStop(1, "var(--neon-cyan)");
        
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        
        x += barWidth;
      }
    });
  }
  
  draw();
}

function clearAudioCanvas() {
  const canvases = document.querySelectorAll("#transport-wave-canvas, #fab-record-canvas");
  canvases.forEach(canvas => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.fillStyle = "rgba(10, 11, 13, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  });
}

function renderRecordingsList(songId) {
  const songRecordings = state.recorder.recordings.filter(r => r.songId === songId);
  
  if (songRecordings.length === 0) {
    return `<div style="text-align:center; padding: 12px; color:var(--text-muted); font-size:12px">No hay grabaciones para este tema.</div>`;
  }
  
  return songRecordings.map((rec, idx) => {
    const isCurrentPlaying = state.playback.recordingId === rec.id && state.playback.isPlaying;
    const playIcon = isCurrentPlaying ? "⏸" : "▶";
    
    return `
      <div class="recording-item">
        <div class="recording-info">
          <span class="recording-name">${rec.songName}</span>
          <span style="font-size:10px; opacity:0.6">${rec.date}</span>
        </div>
        <div class="recording-actions">
          <button class="btn btn-secondary btn-icon ${isCurrentPlaying ? 'active' : ''}" onclick="playAudioBlob('${rec.url}', '${rec.id}')" title="Escuchar">${playIcon}</button>
          <button class="btn btn-secondary btn-icon" onclick="downloadAudioBlob('${rec.url}', '${rec.songName}')" title="Descargar">💾</button>
          <button class="btn btn-secondary btn-icon btn-danger" onclick="deleteRecording('${rec.id}')" title="Borrar">×</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderGlobalRecordingsList() {
  const container = document.getElementById("global-recordings-list");
  if (!container) return;
  
  if (state.recorder.recordings.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--text-muted); font-size:12px">No hay grabaciones aún.</div>`;
    return;
  }
  
  container.innerHTML = state.recorder.recordings.map((rec, idx) => {
    const isCurrentPlaying = state.playback.recordingId === rec.id && state.playback.isPlaying;
    const playIcon = isCurrentPlaying ? "⏸" : "▶";
    
    return `
      <div class="recording-item" style="margin-bottom: 8px;">
        <div class="recording-info">
          <span class="recording-name" style="font-size: 12px;">${rec.songName}</span>
          <span style="font-size:10px; opacity:0.6">${rec.date}</span>
        </div>
        <div class="recording-actions">
          <button class="btn btn-secondary btn-icon ${isCurrentPlaying ? 'active' : ''}" onclick="playAudioBlob('${rec.url}', '${rec.id}')" style="width:26px; height:26px; font-size:10px;" title="Escuchar">${playIcon}</button>
          <button class="btn btn-secondary btn-icon" onclick="downloadAudioBlob('${rec.url}', '${rec.songName}')" style="width:26px; height:26px; font-size:10px;" title="Descargar">💾</button>
          <button class="btn btn-secondary btn-icon btn-danger" onclick="deleteRecording('${rec.id}')" style="width:26px; height:26px; font-size:10px;" title="Borrar">×</button>
        </div>
      </div>
    `;
  }).join("");
}

function playAudioBlob(url, recordingId) {
  // Inicializar audio context si es necesario
  initAudioContext();
  
  // Detener metrónomo si está sonando para no interferir con la escucha
  if (state.metronome.isPlaying) {
    toggleMetronome();
  }
  
  if (state.playback.audio && state.playback.recordingId === recordingId) {
    // Es el mismo audio: reproducir o pausar
    if (state.playback.isPlaying) {
      state.playback.audio.pause();
      state.playback.isPlaying = false;
    } else {
      state.playback.audio.play();
      state.playback.isPlaying = true;
      animatePlaybackWave();
    }
    updatePlaybackUI();
    return;
  }
  
  // Si había otro audio sonando, pausarlo
  if (state.playback.audio) {
    state.playback.audio.pause();
    if (state.playback.animationFrameId) {
      cancelAnimationFrame(state.playback.animationFrameId);
    }
  }
  
  const audio = new Audio(url);
  state.playback.audio = audio;
  state.playback.recordingId = recordingId;
  state.playback.isPlaying = true;
  
  audio.play().then(() => {
    animatePlaybackWave();
  }).catch(e => console.error("Error al reproducir audio:", e));
  
  audio.addEventListener("timeupdate", () => {
    updateTransportProgress();
  });
  
  audio.addEventListener("ended", () => {
    state.playback.isPlaying = false;
    updatePlaybackUI();
    clearAudioCanvas();
  });
  
  updatePlaybackUI();
}

function updatePlaybackUI() {
  // 1. Actualizar botón de la barra de transporte
  const playBtn = document.getElementById("btn-scroll-play");
  if (playBtn) {
    if (state.playback.isPlaying) {
      playBtn.classList.add("active");
      playBtn.innerHTML = `<span class="play-icon">⏸</span>`;
    } else {
      playBtn.classList.remove("active");
      playBtn.innerHTML = `<span class="play-icon">▶</span>`;
    }
  }
  
  // 2. Volver a pintar las listas de reproducción para que cambien los iconos de play/pause
  const activeSong = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (activeSong) {
    const listContainer = document.getElementById("recordings-list");
    if (listContainer) {
      listContainer.innerHTML = renderRecordingsList(activeSong.id);
    }
  }
  
  renderGlobalRecordingsList();
}

function updateTransportProgress() {
  const audio = state.playback.audio;
  const timerDisplay = document.getElementById("transport-record-timer");
  if (!audio || !timerDisplay) return;
  
  const cur = formatTime(audio.currentTime);
  const dur = isNaN(audio.duration) || !isFinite(audio.duration) ? "00:00" : formatTime(audio.duration);
  timerDisplay.textContent = `${cur} / ${dur}`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function togglePlaybackTransport() {
  const audio = state.playback.audio;
  if (!audio) {
    // Si no hay audio cargado, intentar reproducir el más reciente
    if (state.recorder.recordings.length > 0) {
      const rec = state.recorder.recordings[0];
      playAudioBlob(rec.url, rec.id);
    }
    return;
  }
  
  if (state.playback.isPlaying) {
    audio.pause();
    state.playback.isPlaying = false;
  } else {
    audio.play().then(() => {
      animatePlaybackWave();
    });
    state.playback.isPlaying = true;
  }
  updatePlaybackUI();
}

function skipPlaybackTransport(direction) {
  const audio = state.playback.audio;
  if (!audio) return;
  
  if (direction === -1) {
    // Volver al inicio
    audio.currentTime = 0;
  } else {
    // Siguiente grabación en la lista global
    const currentIndex = state.recorder.recordings.findIndex(r => r.id === state.playback.recordingId);
    if (currentIndex !== -1 && currentIndex + 1 < state.recorder.recordings.length) {
      const nextRec = state.recorder.recordings[currentIndex + 1];
      playAudioBlob(nextRec.url, nextRec.id);
    }
  }
}

function animatePlaybackWave() {
  const canvas = document.getElementById("transport-wave-canvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  function draw() {
    if (!state.playback.isPlaying) {
      clearAudioCanvas();
      return;
    }
    state.playback.animationFrameId = requestAnimationFrame(draw);
    
    ctx.fillStyle = "rgba(10, 11, 13, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const bars = 40;
    const barWidth = canvas.width / bars;
    
    for (let i = 0; i < bars; i++) {
      // Onda simulada de ecualizador basada en el tiempo y el índice
      const factor = Math.sin(i * 0.15 + Date.now() * 0.015) * 0.4 + 0.6;
      const barHeight = (Math.random() * 0.3 + 0.7) * canvas.height * factor * 0.65;
      
      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, "var(--neon-purple)");
      grad.addColorStop(1, "var(--neon-cyan)");
      
      ctx.fillStyle = grad;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
    }
  }
  
  if (state.playback.animationFrameId) {
    cancelAnimationFrame(state.playback.animationFrameId);
  }
  draw();
}

function downloadAudioBlob(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ensayo_${name.replace(/\s+/g, "_")}.webm`;
  a.click();
}

function deleteRecording(id) {
  if (state.playback.recordingId === id) {
    if (state.playback.audio) state.playback.audio.pause();
    state.playback.audio = null;
    state.playback.recordingId = null;
    state.playback.isPlaying = false;
    if (state.playback.animationFrameId) {
      cancelAnimationFrame(state.playback.animationFrameId);
    }
    clearAudioCanvas();
  }
  state.recorder.recordings = state.recorder.recordings.filter(r => r.id !== id);
  saveRecordingsState();
  renderRehearsalRoom();
  renderGlobalRecordingsList();
}

// --- VISTA 3: DICCIONARIO Y ESCALAS ---
function switchDictMode(mode) {
  state.dictMode = mode;
  
  const btnChords = document.getElementById("btn-dict-mode-chords");
  const btnScales = document.getElementById("btn-dict-mode-scales");
  const chordsSelectors = document.getElementById("dict-chords-selectors");
  const scalesSelectors = document.getElementById("dict-scales-selectors");
  const heartBtn = document.getElementById("chord-fav-heart");
  
  if (mode === "chords") {
    if (btnChords) btnChords.classList.add("active");
    if (btnScales) btnScales.classList.remove("active");
    if (chordsSelectors) chordsSelectors.style.display = "block";
    if (scalesSelectors) scalesSelectors.style.display = "none";
    if (heartBtn) heartBtn.style.display = "inline-block";
  } else {
    if (btnChords) btnChords.classList.remove("active");
    if (btnScales) btnScales.classList.add("active");
    if (chordsSelectors) chordsSelectors.style.display = "none";
    if (scalesSelectors) scalesSelectors.style.display = "flex";
    if (heartBtn) heartBtn.style.display = "none"; // Escalas no tienen favoritos
  }
  
  renderDictionary();
}

function filterChordRoot(root) {
  state.chordFilterRoot = root;
  
  // Resaltar botón activo en el filtro de nota raíz
  const filterGroup = document.getElementById("dict-chord-root-filters");
  if (filterGroup) {
    filterGroup.querySelectorAll(".filter-btn").forEach(btn => {
      if (btn.textContent.trim() === root) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  
  const chordName = state.chordFilterRoot + state.chordFilterType;
  selectChord(chordName);
}

function filterChordType(type) {
  state.chordFilterType = type;
  
  // Resaltar botón activo en el filtro de tipo de acorde
  const filterGroup = document.getElementById("dict-chord-type-filters");
  if (filterGroup) {
    filterGroup.querySelectorAll(".filter-btn").forEach(btn => {
      const onclickAttr = btn.getAttribute("onclick") || "";
      if (onclickAttr.includes(`'${type}'`) || onclickAttr.includes(`"${type}"`)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  
  const chordName = state.chordFilterRoot + state.chordFilterType;
  selectChord(chordName);
}

function onScaleChange() {
  const rootSelect = document.getElementById("scale-root-select");
  const typeSelect = document.getElementById("scale-type-select");
  
  if (rootSelect && typeSelect) {
    state.currentScaleRoot = parseInt(rootSelect.value);
    state.currentScale = typeSelect.value;
  }
  
  renderDictionary();
}

function playDictAudio() {
  if (state.dictMode === "chords") {
    playChord(state.currentChord, state.currentInstrument);
  } else {
    playScaleSequence(state.currentScaleRoot, state.currentScale, state.currentInstrument);
  }
}

function renderDictionary() {
  // 1. Manejar el tema visual según instrumento
  const dictContainer = document.getElementById("tab-dictionary");
  if (dictContainer) {
    if (state.currentInstrument === "guitar") {
      dictContainer.classList.add("guitar-active-theme");
      dictContainer.classList.remove("piano-active-theme");
    } else {
      dictContainer.classList.add("piano-active-theme");
      dictContainer.classList.remove("guitar-active-theme");
    }
  }

  // 2. Renderizado según Modo
  if (state.dictMode === "chords") {
    // --- MODO ACORDES ---
    // Sidebar de acordes
    const chordsSidebar = document.getElementById("chords-list-sidebar");
    if (chordsSidebar) {
      const allChords = Object.keys(CHORD_DATABASE);
      const filteredChords = allChords.filter(c => c.startsWith(state.chordFilterRoot));
      chordsSidebar.innerHTML = filteredChords.map(c => `
        <button class="chord-selection-btn ${c === state.currentChord ? 'active' : ''}" onclick="selectChord('${c}')">
          ${c}
        </button>
      `).join("");
    }
    
    renderFavoritesList();
    
    // Títulos e información
    const chord = CHORD_DATABASE[state.currentChord];
    const chordNameTitle = document.getElementById("chord-name-title");
    const chordNotesList = document.getElementById("chord-notes-list");
    const notesLabel = document.getElementById("notes-list-label");
    const tipsTitle = document.getElementById("tips-panel-title");
    const tipsDesc = document.getElementById("tips-panel-desc");
    const playBtn = document.getElementById("btn-play-dict-audio");
    const favHeart = document.getElementById("chord-fav-heart");
    
    if (chord) {
      if (chordNameTitle) {
        chordNameTitle.className = state.currentInstrument === "guitar" ? "chord-guitar-title chord-guitar-title-glow" : "chord-piano-title chord-piano-title-glow";
        let root = state.currentChord.substring(0, 1);
        if (state.currentChord.length > 1 && (state.currentChord[1] === '#' || state.currentChord[1] === 'b')) {
          root = state.currentChord.substring(0, 2);
        }
        const type = state.currentChord.substring(root.length);
        const color = state.currentInstrument === "guitar" ? "var(--neon-lime)" : "var(--neon-orange)";
        chordNameTitle.innerHTML = `<span class="chord-root" style="color: #ffffff; font-size: 40px; font-weight: 800;">${root}</span><span class="chord-type" style="color: ${color}; font-size: 24px; font-weight: 700; margin-left: 2px; vertical-align: top;">${type}</span>`;
      }
      
      if (notesLabel) notesLabel.textContent = "Notas que lo componen";
      
      if (chordNotesList) {
        chordNotesList.innerHTML = chord.notes.map(n => `<span class="note-bubble">${n}</span>`).join("");
      }
      
      if (tipsTitle) tipsTitle.textContent = "Tips de Práctica";
      if (tipsDesc) {
        tipsDesc.innerHTML = `
          Asegúrate de presionar las cuerdas cerca de los trastes metálicos sin tocarlos para evitar el trasteo. Mantén los dedos arqueados para no mutear cuerdas adyacentes.
        `;
      }
      
      if (playBtn) playBtn.textContent = "🔊 Escuchar Acorde";
      
      if (favHeart) {
        const isFav = state.favoritesChords.includes(state.currentChord);
        if (isFav) {
          favHeart.classList.add("active");
          favHeart.innerHTML = "❤️";
        } else {
          favHeart.classList.remove("active");
          favHeart.innerHTML = "🤍";
        }
      }
      
      // Renderizar los diagramas SVG correspondientes
      if (state.currentInstrument === "guitar") {
        renderGuitarChordSVG(state.currentChord, "chord-svg-render-area");
      } else {
        renderPianoChordSVG(state.currentChord, "chord-svg-render-area");
      }

      // Renderizar voicing dots interactivos visually
      const voicingContainer = document.getElementById("chord-voicing-dots-container");
      if (voicingContainer) {
        const color = state.currentInstrument === "guitar" ? "var(--neon-cyan)" : "var(--neon-orange)";
        const shadow = state.currentInstrument === "guitar" ? "var(--glow-cyan)" : "var(--glow-orange)";
        voicingContainer.innerHTML = `
          <div class="voicing-dots" style="display: flex; gap: 8px; justify-content: center;">
            <span class="dot active" style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; box-shadow: ${shadow};"></span>
            <span class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15);"></span>
            <span class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15);"></span>
            <span class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15);"></span>
          </div>
        `;
      }
    }
  } else {
    // --- MODO ESCALAS ---
    const voicingContainer = document.getElementById("chord-voicing-dots-container");
    if (voicingContainer) voicingContainer.innerHTML = "";
    
    const scale = SCALE_DATABASE[state.currentScale];
    const rootName = NOTE_NAMES[state.currentScaleRoot];
    
    const scaleNameTitle = document.getElementById("chord-name-title");
    const scaleNotesList = document.getElementById("chord-notes-list");
    const notesLabel = document.getElementById("notes-list-label");
    const tipsTitle = document.getElementById("tips-panel-title");
    const tipsDesc = document.getElementById("tips-panel-desc");
    const playBtn = document.getElementById("btn-play-dict-audio");
    
    if (scale) {
      if (scaleNameTitle) {
        scaleNameTitle.className = state.currentInstrument === "guitar" ? "chord-guitar-title chord-guitar-title-glow" : "chord-piano-title chord-piano-title-glow";
        scaleNameTitle.innerHTML = `${rootName} ${scale.name} <span style="font-size:14px; font-weight:400; color:var(--text-secondary)">Escala</span>`;
      }
      
      if (notesLabel) notesLabel.textContent = "Estructura e Intervalos";
      
      // Notas reales de la escala
      if (scaleNotesList) {
        const scaleNotes = scale.intervals.map(int => NOTE_NAMES[(state.currentScaleRoot + int) % 12]);
        scaleNotesList.innerHTML = scaleNotes.map(n => `<span class="note-bubble">${n}</span>`).join("");
      }
      
      if (tipsTitle) tipsTitle.textContent = "Teoría y Origen";
      if (tipsDesc) tipsDesc.textContent = scale.desc;
      
      if (playBtn) playBtn.textContent = "🔊 Escuchar Escala";
      
      // Renderizar SVG de Escala
      if (state.currentInstrument === "guitar") {
        renderGuitarScaleSVG(state.currentScaleRoot, state.currentScale, "chord-svg-render-area");
      } else {
        renderPianoScaleSVG(state.currentScaleRoot, state.currentScale, "chord-svg-render-area");
      }
    }
  }
}

function selectChord(chordName) {
  state.currentChord = chordName;
  
  // Parsear la raíz y el tipo
  // Las raíces pueden ser C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B (longitud 1 o 2)
  let root = chordName.substring(0, 1);
  if (chordName.length > 1 && (chordName[1] === '#' || chordName[1] === 'b')) {
    root = chordName.substring(0, 2);
  }
  const type = chordName.substring(root.length);
  
  state.chordFilterRoot = root;
  state.chordFilterType = type;
  
  // Sincronizar botones de nota raíz
  const rootGroup = document.getElementById("dict-chord-root-filters");
  if (rootGroup) {
    rootGroup.querySelectorAll(".filter-btn").forEach(btn => {
      if (btn.textContent.trim() === root) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  
  // Sincronizar botones de tipo de acorde
  const typeGroup = document.getElementById("dict-chord-type-filters");
  if (typeGroup) {
    typeGroup.querySelectorAll(".filter-btn").forEach(btn => {
      const onclickAttr = btn.getAttribute("onclick") || "";
      if (onclickAttr.includes(`'${type}'`) || onclickAttr.includes(`"${type}"`)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  
  renderDictionary();
}

function selectInstrument(inst) {
  state.currentInstrument = inst;
  
  const btnGuitar = document.getElementById("btn-select-guitar");
  const btnPiano = document.getElementById("btn-select-piano");
  
  if (btnGuitar && btnPiano) {
    if (inst === "guitar") {
      btnGuitar.classList.add("active");
      btnPiano.classList.remove("active");
    } else {
      btnPiano.classList.add("active");
      btnGuitar.classList.remove("active");
    }
  }
  
  renderDictionary();
}

// Favoritos
function toggleFavoriteChord() {
  const isFav = state.favoritesChords.includes(state.currentChord);
  if (isFav) {
    state.favoritesChords = state.favoritesChords.filter(c => c !== state.currentChord);
  } else {
    state.favoritesChords.push(state.currentChord);
  }
  saveFavorites();
  renderDictionary();
}

function renderFavoritesList() {
  const container = document.getElementById("favorites-chords-list");
  if (!container) return;
  
  if (state.favoritesChords.length === 0) {
    container.innerHTML = `<span style="font-size:12px; color:var(--text-muted)">No tienes favoritos aún.</span>`;
    return;
  }
  
  // Group by root note
  const groups = {};
  state.favoritesChords.forEach(chord => {
    let root = chord.substring(0, 1);
    if (chord.length > 1 && (chord[1] === '#' || chord[1] === 'b')) {
      root = chord.substring(0, 2);
    }
    if (!groups[root]) groups[root] = [];
    groups[root].push(chord);
  });
  
  container.innerHTML = Object.keys(groups).map(root => {
    const chords = groups[root];
    return `
      <div class="favorite-group-card glass" style="margin-bottom: 8px; padding: 12px; border-radius: var(--radius-md); background: rgba(15, 23, 42, 0.35);">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${chords.map(c => `
            <button class="favorite-chord-pill ${c === state.currentChord ? 'active' : ''}" onclick="selectChord('${c}')" style="padding: 6px 12px; border-radius: 20px; font-family: var(--font-mono); font-size: 11px; font-weight: 600;">
              ${c}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function openKeyInDict(keyName) {
  const cleanKey = keyName.split("/")[0].trim();
  if (CHORD_DATABASE[cleanKey]) {
    const rootNote = cleanKey[0];
    switchDictMode("chords");
    filterChordRoot(rootNote);
    selectChord(cleanKey);
    switchTab("dictionary");
  }
}

function toggleHeaderRecording() {
  if (state.recorder.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// --- IMPORTADOR Y AUTO-CONVERSOR DE ACORDES ---

// Detecta si una línea contiene predominantemente acordes
function isChordLine(line) {
  const trimmed = line.trim();
  if (trimmed === "") return false;
  
  const tokens = trimmed.split(/\s+/);
  let validChords = 0;
  
  for (let t of tokens) {
    const cleanT = t.replace(/[()\[\]]/g, "").trim();
    if (CHORD_TOKEN_REGEX.test(cleanT)) {
      validChords++;
    }
  }
  
  return (validChords / tokens.length) >= 0.7;
}

// ─────────────────────────────────────────────────────────────
// AUTO-CATEGORIZACIÓN DE ESTROFAS
// ─────────────────────────────────────────────────────────────

/**
 * Analiza texto de letra sin formato y etiqueta automáticamente cada bloque:
 * - Preserva etiquetas existentes como [CORO], [VERSO 1], [BRIDGE], etc.
 * - Detecta coros por repetición exacta de bloques
 * - Numera los versos secuencialmente: [VERSO 1], [VERSO 2], ...
 * - Detecta intro si el primer bloque es de 1 sola línea o solo acordes
 * @param {string} rawText - Texto plano de la letra
 * @returns {string} Texto con etiquetas de sección insertadas
 */
function autoTagStanzas(rawText) {
  if (!rawText || !rawText.trim()) return rawText;

  // Normalizar saltos de línea
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Dividir en bloques por una o más líneas en blanco consecutivas
  const rawBlocks = normalized.split(/\n{2,}/);

  // Filtrar bloques vacíos
  const blocks = rawBlocks.map(b => b.trim()).filter(b => b.length > 0);

  if (blocks.length === 0) return rawText;

  // Detectar qué bloques ya tienen una etiqueta de sección al inicio
  const SECTION_HEADER_RE = /^\[([^\]]+)\]/;
  const KNOWN_TAGS_RE = /^(VERSO|CORO|CHORUS|ESTRIBILLO|PUENTE|BRIDGE|INTRO|OUTRO|FINAL|PRE.CORO|PRE.CHORUS|SOLO|INTERLUDE|INSTRUMENTAL)/i;

  function hasTag(block) {
    const firstLine = block.split("\n")[0].trim();
    if (!SECTION_HEADER_RE.test(firstLine)) return false;
    const inner = firstLine.slice(1, -1).trim();
    return KNOWN_TAGS_RE.test(inner);
  }

  // Extraer el contenido de un bloque sin su etiqueta de sección (primera línea)
  function blockContent(block) {
    if (hasTag(block)) {
      const lines = block.split("\n");
      const firstLine = lines[0];
      const withoutTag = firstLine.replace(/^\[[^\]]+\]/, "").trim();
      if (withoutTag) {
        lines[0] = withoutTag;
        return lines.join("\n").trim();
      }
      return lines.slice(1).join("\n").trim();
    }
    return block;
  }

  // Normalizar el contenido de un bloque para comparación
  // Eliminamos acordes y espacios extra para detectar repeticiones semánticas
  function normalizeForComparison(text) {
    return text
      .replace(/\[[^\]]+\]/g, "") // quitar acordes [C], [Am], etc.
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  // Paso 1: Mapear contenidos normalizados para detectar repeticiones
  const contentMap = new Map(); // normalized content → first occurrence index
  const blocksMeta = blocks.map((block, idx) => {
    const content = blockContent(block);
    const norm = normalizeForComparison(content);
    return { block, idx, content, norm, hasExistingTag: hasTag(block) };
  });

  // Contar repeticiones
  const normCounts = new Map();
  blocksMeta.forEach(m => {
    if (m.norm.length > 20) { // ignorar bloques muy cortos para esta comparación
      normCounts.set(m.norm, (normCounts.get(m.norm) || 0) + 1);
    }
  });

  // Paso 2: Detectar bloques que son intro
  // → primer bloque sin etiqueta, una sola línea no vacía o solo acordes
  function looksLikeIntro(block, idx) {
    if (idx !== 0) return false;
    const lines = block.split("\n").filter(l => l.trim());
    if (lines.length <= 2) {
      // Si todas las líneas son solo acordes o muy cortas
      const allChords = lines.every(l => {
        const noChords = l.replace(/\[[^\]]+\]/g, "").trim();
        return noChords.length < 10;
      });
      return allChords;
    }
    return false;
  }

  // Paso 3: Asignar etiquetas
  let versoCount = 0;
  let coroCount = 0;
  const labeledBlocks = blocksMeta.map((m, idx) => {
    if (m.hasExistingTag) {
      return m.block; // preservar etiqueta existente
    }

    let label = "";
    const isRepeat = m.norm.length > 20 && (normCounts.get(m.norm) || 0) >= 2;

    if (isRepeat) {
      // Es un bloque repetido → es el CORO
      coroCount++;
      label = coroCount === 1 ? "[CORO]" : "[CORO]"; // siempre el mismo coro
    } else if (looksLikeIntro(m.block, idx)) {
      label = "[INTRO]";
    } else {
      versoCount++;
      label = `[VERSO ${versoCount}]`;
    }

    return label + "\n" + m.block;
  });

  return labeledBlocks.join("\n\n");
}

// Convierte acordes arriba de la letra en formato de corchetes
function convertTraditionalToBracket(text) {
  const lines = text.split("\n");
  const result = [];

  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];
    
    if (isChordLine(currentLine) && nextLine !== undefined && !isChordLine(nextLine) && nextLine.trim() !== "") {
      const tokenRegex = /\S+/g;
      let match;
      const chords = [];
      
      while ((match = tokenRegex.exec(currentLine)) !== null) {
        chords.push({
          name: match[0],
          pos: match.index
        });
      }
      
      let lyricLine = nextLine;
      chords.sort((a, b) => b.pos - a.pos);
      
      chords.forEach(c => {
        const bracketed = `[${c.name}]`;
        if (c.pos < lyricLine.length) {
          lyricLine = lyricLine.slice(0, c.pos) + bracketed + lyricLine.slice(c.pos);
        } else {
          lyricLine = lyricLine + " ".repeat(c.pos - lyricLine.length) + bracketed;
        }
      });
      
      result.push(lyricLine);
      i++;
    } else if (isChordLine(currentLine)) {
      const tokenRegex = /\S+/g;
      let match;
      let convertedLine = "";
      while ((match = tokenRegex.exec(currentLine)) !== null) {
        convertedLine += `[${match[0]}] `;
      }
      result.push(convertedLine.trim());
    } else {
      result.push(currentLine);
    }
  }
  
  return result.join("\n");
}

// Carga y lee el archivo importado
function importLyricsFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    
    let title = "";
    let artist = "";
    let bpm = 120;
    let key = "C";
    let timeSig = "4/4";
    let lyricsText = "";
    let hasDirectives = false;
    
    const lines = text.split("\n");
    const directivesRegex = /^\{(\w+):\s*(.*)\}$/;
    
    lines.forEach(line => {
      const match = line.trim().match(directivesRegex);
      if (match) {
        hasDirectives = true;
        const keyName = match[1].toLowerCase();
        const value = match[2].trim();
        
        if (keyName === "title" || keyName === "t") {
          title = value;
        } else if (keyName === "artist" || keyName === "a") {
          artist = value;
        } else if (keyName === "bpm" || keyName === "tempo") {
          bpm = parseInt(value) || 120;
        } else if (keyName === "key" || keyName === "tonalidad") {
          key = value;
        } else if (keyName === "timesig" || keyName === "compas") {
          timeSig = value;
        }
      } else {
        lyricsText += line + "\n";
      }
    });
    
    if (!hasDirectives) {
      lyricsText = text;
    }
    
    if (title) {
      document.getElementById("song-title").value = title;
      const metaTitle = document.getElementById("meta-title");
      if (metaTitle) updateTextElement(metaTitle, title);
    }
    if (artist) {
      document.getElementById("song-artist").value = artist;
      const metaArtist = document.getElementById("meta-artist");
      if (metaArtist) updateTextElement(metaArtist, artist);
    }
    if (bpm) {
      document.getElementById("song-bpm").value = bpm;
      const metaBpm = document.getElementById("meta-bpm");
      if (metaBpm) updateTextElement(metaBpm, bpm.toString());
    }
    if (key) {
      document.getElementById("song-key").value = key;
      const metaKey = document.getElementById("meta-key");
      if (metaKey) metaKey.textContent = key;
    }
    if (timeSig) {
      document.getElementById("song-timesig").value = timeSig;
      const metaTimesig = document.getElementById("meta-timesig");
      if (metaTimesig) metaTimesig.textContent = timeSig;
    }
    
    const lyricsField = document.getElementById("song-lyrics");
    const richEditor = document.getElementById("editor-rich-lyrics");
    // 1. Convertir acordes tradicionales a formato [Acorde]
    const bracketConverted = convertTraditionalToBracket(lyricsText.trim());
    // 2. Auto-etiquetar estrofas por bloques separados por líneas en blanco
    const tagged = autoTagStanzas(bracketConverted);
    if (lyricsField) {
      lyricsField.value = tagged;
    }
    if (richEditor) {
      richEditor.innerHTML = parseTextToRichLyrics(tagged);
      bindChordBadgeEvents();
    }
    // 3. Actualizar panel de vista previa de estructura
    updateStructurePreview();
  };
  
  reader.readAsText(file);
}

// ─────────────────────────────────────────────────────────────
// VISTA PREVIA DE ESTRUCTURA EN EL MODAL DE IMPORTACIÓN
// ─────────────────────────────────────────────────────────────

const STANZA_TYPE_COLORS = {
  "intro":      { bg: "rgba(41,240,214,0.12)",  border: "#29F0D6", text: "#29F0D6",  label: "Intro" },
  "verso":      { bg: "rgba(41,240,214,0.08)",  border: "#29F0D6", text: "#29F0D6",  label: "Verso" },
  "pre-coro":   { bg: "rgba(255,210,63,0.10)",  border: "#FFD23F", text: "#FFD23F",  label: "Pre-Coro" },
  "coro":       { bg: "rgba(255,62,165,0.12)",  border: "#FF3EA5", text: "#FF3EA5",  label: "Coro" },
  "estribillo": { bg: "rgba(255,62,165,0.12)",  border: "#FF3EA5", text: "#FF3EA5",  label: "Estribillo" },
  "puente":     { bg: "rgba(255,210,63,0.10)",  border: "#FFD23F", text: "#FFD23F",  label: "Puente" },
  "bridge":     { bg: "rgba(255,210,63,0.10)",  border: "#FFD23F", text: "#FFD23F",  label: "Bridge" },
  "solo":       { bg: "rgba(255,62,165,0.08)",  border: "#FF3EA5", text: "#FF3EA5",  label: "Solo" },
  "outro":      { bg: "rgba(120,120,120,0.12)", border: "#888",    text: "#aaa",     label: "Outro" },
  "final":      { bg: "rgba(120,120,120,0.12)", border: "#888",    text: "#aaa",     label: "Final" },
  "instrumental":{ bg: "rgba(120,120,120,0.10)",border: "#888",    text: "#aaa",     label: "Instrumental" },
};

const STANZA_TYPE_OPTIONS = [
  { value: "verso",       label: "Verso" },
  { value: "pre-coro",    label: "Pre-Coro" },
  { value: "coro",        label: "Coro / Estribillo" },
  { value: "puente",      label: "Puente / Bridge" },
  { value: "intro",       label: "Intro" },
  { value: "outro",       label: "Outro / Final" },
  { value: "solo",        label: "Solo" },
  { value: "instrumental",label: "Instrumental" },
];

/**
 * Determina el tipo semántico de una etiqueta de sección
 */
function resolveStanzaType(labelName) {
  const n = labelName.toLowerCase().trim();
  if (n.startsWith("intro")) return "intro";
  if (n.startsWith("coro") || n.startsWith("chorus") || n.startsWith("estribillo")) return "coro";
  if (n.startsWith("pre")) return "pre-coro";
  if (n.startsWith("puente") || n.startsWith("bridge")) return "puente";
  if (n.startsWith("solo")) return "solo";
  if (n.startsWith("outro") || n.startsWith("final")) return "outro";
  if (n.startsWith("instrumental") || n.startsWith("interlude")) return "instrumental";
  return "verso";
}

/**
 * Lee el texto actual del editor, detecta las secciones y renderiza
 * un panel de chips editables en #structure-preview-panel
 */
function updateStructurePreview() {
  const panel = document.getElementById("structure-preview-panel");
  if (!panel) return;

  // Leer el texto plano serializado
  const text = serializeRichLyrics() || document.getElementById("song-lyrics").value || "";
  if (!text.trim()) {
    panel.innerHTML = "";
    panel.style.display = "none";
    return;
  }

  // Detectar secciones etiquetadas
  const SECTION_RE = /^\[([^\]]+)\]/;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const sections = [];

  blocks.forEach(block => {
    const trimmed = block.trim();
    if (!trimmed) return;
    const firstLine = trimmed.split("\n")[0].trim();
    const m = firstLine.match(SECTION_RE);
    if (m) {
      const labelName = m[1].trim();
      sections.push({ label: labelName, type: resolveStanzaType(labelName) });
    }
  });

  if (sections.length === 0) {
    panel.innerHTML = "";
    panel.style.display = "none";
    return;
  }

  // Construir el HTML de chips
  const chipsHtml = sections.map((sec, idx) => {
    const style = STANZA_TYPE_COLORS[sec.type] || STANZA_TYPE_COLORS["verso"];
    const opts = STANZA_TYPE_OPTIONS.map(o =>
      `<div class="stanza-type-opt" onclick="changeStanzaType(${idx}, '${o.value}')">${o.label}</div>`
    ).join("");
    return `
      <div class="stanza-chip-wrap" id="stanza-chip-${idx}">
        <div class="stanza-chip"
          style="background:${style.bg}; border-color:${style.border}; color:${style.text};"
          onclick="toggleStanzaTypeMenu(${idx})">
          <span class="stanza-chip-label">${sec.label}</span>
          <i class="ti ti-chevron-down" style="font-size:9px; margin-left:4px; opacity:0.7;"></i>
        </div>
        <div class="stanza-type-menu" id="stanza-menu-${idx}" style="display:none;">
          ${opts}
        </div>
      </div>`;
  }).join("");

  panel.style.display = "block";
  panel.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <span style="font-size:10px; font-weight:700; color:var(--text-secondary); letter-spacing:0.08em; text-transform:uppercase;">Estructura detectada</span>
      <span style="font-size:10px; color:var(--text-dim);">· Clic en cada sección para reclasificar</span>
    </div>
    <div class="stanza-chips-row">${chipsHtml}</div>`;
}

/**
 * Muestra/oculta el menú desplegable de tipo de una sección
 */
function toggleStanzaTypeMenu(idx) {
  document.querySelectorAll(".stanza-type-menu").forEach((m, i) => {
    m.style.display = (i === idx && m.style.display === "none") ? "block" : "none";
  });
}

/**
 * Cambia el tipo de una sección en el texto del editor:
 * - Reemplaza la etiqueta [VERSO N] → [CORO], etc.
 * - Actualiza el chip visualmente
 * - Llama a updateStructurePreview para re-sincronizar
 */
function changeStanzaType(sectionIdx, newType) {
  // Cerrar menús
  document.querySelectorAll(".stanza-type-menu").forEach(m => m.style.display = "none");

  const typeInfo = STANZA_TYPE_OPTIONS.find(o => o.value === newType);
  if (!typeInfo) return;

  // Calcular la nueva etiqueta en mayúsculas
  const newLabel = typeInfo.label.toUpperCase().replace(" / ", " ").replace("VERSO", "VERSO");
  // Para coro/estribillo: [CORO], para pre-coro: [PRE-CORO], etc.
  const newTag = newLabel.replace("CORO / ESTRIBILLO", "CORO")
                         .replace("PUENTE / BRIDGE", "PUENTE")
                         .replace("OUTRO / FINAL", "OUTRO");

  // Leer texto plano actual
  const lyricsField = document.getElementById("song-lyrics");
  const richEditor = document.getElementById("editor-rich-lyrics");
  let text = serializeRichLyrics() || lyricsField.value || "";

  // Encontrar el bloque N-ésimo y reemplazar su etiqueta
  const SECTION_RE = /^\[([^\]]+)\]/;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  let labeledCount = 0;

  const newBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return block;
    const firstLine = trimmed.split("\n")[0].trim();
    if (SECTION_RE.test(firstLine)) {
      if (labeledCount === sectionIdx) {
        labeledCount++;
        return trimmed.replace(firstLine, `[${newTag}]`);
      }
      labeledCount++;
    }
    return block;
  });

  const newText = newBlocks.join("\n\n");

  if (lyricsField) lyricsField.value = newText;
  if (richEditor) {
    richEditor.innerHTML = parseTextToRichLyrics(newText);
    bindChordBadgeEvents();
  }

  // Re-renderizar el panel de vista previa
  updateStructurePreview();
}

// --- NUEVOS MÉTODOS DE EDICIÓN INLINE Y EDITOR EN VIVO ---

let lastTouchTime = 0;
document.addEventListener("touchstart", () => {
  lastTouchTime = Date.now();
}, { passive: true });

function parseTextToRichLyrics(text) {
  if (!text) return "";
  const lines = text.split("\n");
  const parsedLines = lines.map(line => {
    const htmlLine = line.replace(/\[([^\]]+)\]/g, (match, chord) => {
      return `<span class="editor-chord-badge" contenteditable="false" data-chord="${chord}">[${chord}]</span>`;
    });
    return `<div>${htmlLine || "<br>"}</div>`;
  });
  return parsedLines.join("");
}

function serializeRichLyrics() {
  const editor = document.getElementById("editor-rich-lyrics");
  if (!editor) return "";
  
  let text = "";
  
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const name = node.nodeName;
      if (node.classList.contains("editor-chord-badge")) {
        let chordText = node.textContent;
        // Sincronizar y asegurar corchetes en texto plano
        if (!chordText.startsWith("[")) chordText = "[" + chordText;
        if (!chordText.endsWith("]")) chordText = chordText + "]";
        text += chordText;
      } else if (name === "BR") {
        text += "\n";
      } else if (name === "DIV" || name === "P") {
        if (text.length > 0 && !text.endsWith("\n")) {
          text += "\n";
        }
        node.childNodes.forEach(traverse);
        if (!text.endsWith("\n")) {
          text += "\n";
        }
      } else {
        node.childNodes.forEach(traverse);
      }
    }
  }
  
  editor.childNodes.forEach(traverse);
  return text.replace(/\n+$/, "\n").trim();
}

function convertTypedBracketsToBadges() {
  const editor = document.getElementById("editor-rich-lyrics");
  if (!editor) return;
  
  const popup = document.getElementById("chord-picker-popup");
  let activeIndex = -1;
  if (popup && popup.style.display !== "none" && activeChordBadge) {
    const allBadges = Array.from(document.querySelectorAll(".editor-chord-badge"));
    activeIndex = allBadges.indexOf(activeChordBadge);
  }
  
  const rawText = serializeRichLyrics();
  editor.innerHTML = parseTextToRichLyrics(rawText);
  bindChordBadgeEvents();
  
  // Re-vincular la referencia del acorde activo al nuevo elemento creado en el DOM
  if (activeIndex !== -1 && popup) {
    const newBadges = document.querySelectorAll(".editor-chord-badge");
    if (newBadges[activeIndex]) {
      activeChordBadge = newBadges[activeIndex];
    }
  }
}

function selectAllText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateTextElement(el, val) {
  if (!val || val.trim() === "") {
    el.textContent = el.getAttribute("placeholder") || "";
    el.classList.add("placeholder-active");
  } else {
    el.textContent = val;
    el.classList.remove("placeholder-active");
  }
}

function setupLongPress(element, callback) {
  let pressTimer = null;
  let startX = 0;
  let startY = 0;
  let isLongPress = false;
  
  element.addEventListener("touchstart", (e) => {
    isLongPress = false;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    pressTimer = setTimeout(() => {
      isLongPress = true;
      callback(e);
    }, 3000); // 3 segundos como solicita el usuario
  }, { passive: true });
  
  element.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10) {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }
  }, { passive: true });
  
  element.addEventListener("touchend", (e) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (isLongPress) {
      e.preventDefault();
    }
  });
  
  element.addEventListener("touchcancel", () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });
}

function makeEditableInline(element, fieldType) {
  if (element.getAttribute("contenteditable") === "true") return;
  
  const originalValue = element.textContent;
  if (element.classList.contains("placeholder-active")) {
    element.textContent = "";
  }
  
  element.setAttribute("contenteditable", "true");
  element.classList.add("editing");
  element.focus();
  
  setTimeout(() => selectAllText(element), 10);
  
  const keydownHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      element.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      element.textContent = originalValue;
      if (originalValue === element.getAttribute("placeholder")) {
        element.classList.add("placeholder-active");
      }
      element.blur();
    }
  };
  
  element.addEventListener("keydown", keydownHandler);
  
  const blurHandler = () => {
    element.setAttribute("contenteditable", "false");
    element.classList.remove("editing");
    element.removeEventListener("keydown", keydownHandler);
    element.removeEventListener("blur", blurHandler);
    
    let newValue = element.textContent.trim();
    if (fieldType === "bpm") {
      const parsedBpm = parseInt(newValue);
      if (isNaN(parsedBpm) || parsedBpm <= 0) {
        newValue = originalValue;
      } else {
        newValue = parsedBpm.toString();
      }
    }
    
    const hiddenInput = document.getElementById(`song-${fieldType}`);
    if (hiddenInput) {
      hiddenInput.value = newValue;
      hiddenInput.dispatchEvent(new Event("change"));
    }
    
    updateTextElement(element, newValue);
  };
  
  element.addEventListener("blur", blurHandler);
}

function setupInlineEdit(element, fieldType) {
  element.addEventListener("click", (e) => {
    if (e.pointerType === "touch" || e.pointerType === "pen" || Date.now() - lastTouchTime < 1000) {
      return;
    }
    makeEditableInline(element, fieldType);
  });
  
  setupLongPress(element, () => {
    if (navigator.vibrate) navigator.vibrate(50);
    makeEditableInline(element, fieldType);
  });
}

function setupInlineSelect(element, fieldType) {
  element.addEventListener("click", (e) => {
    if (e.pointerType === "touch" || e.pointerType === "pen" || Date.now() - lastTouchTime < 1000) {
      return;
    }
    showInlineSelector(element, fieldType);
  });
  
  setupLongPress(element, () => {
    if (navigator.vibrate) navigator.vibrate(50);
    showInlineSelector(element, fieldType);
  });
}

function positionPopover(popover, targetElement) {
  popover.style.display = "block";
  const rect = targetElement.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  
  let top = rect.bottom + window.scrollY + 5;
  let left = rect.left + window.scrollX;
  
  if (left + popoverRect.width > window.innerWidth) {
    left = window.innerWidth - popoverRect.width - 15;
  }
  if (left < 10) left = 10;
  
  if (rect.bottom + popoverRect.height > window.innerHeight) {
    top = rect.top + window.scrollY - popoverRect.height - 5;
  }
  
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

function showInlineSelector(element, field) {
  const popup = document.getElementById("meta-selector-popup");
  const titleSpan = document.getElementById("meta-popup-title");
  const optionsDiv = document.getElementById("meta-popup-options");
  if (!popup || !titleSpan || !optionsDiv) return;
  
  let titleText = "Seleccionar";
  if (field === "key") titleText = "Tono (Key)";
  else if (field === "timesig") titleText = "Compás";
  else if (field === "status") titleText = "Estado";
  titleSpan.textContent = titleText;
  
  optionsDiv.className = "popover-body popover-grid";
  if (field === "status") {
    optionsDiv.classList.add("meta-options-grid-3");
  }
  
  const hiddenInput = document.getElementById(`song-${field}`);
  const currentVal = hiddenInput ? hiddenInput.value : element.textContent;
  
  let options = [];
  if (field === "key") {
    options = [
      "C", "Cm", "C#", "C#m", "D", "Dm", "Eb", "E", "Em", "F", "Fm", "F#", "F#m", "G", "Gm", "Ab", "A", "Am", "Bb", "B", "Bm"
    ];
  } else if (field === "timesig") {
    options = ["4/4", "3/4", "6/8", "2/4", "12/8"];
  } else if (field === "status") {
    options = [
      { val: "todo", label: "Por Aprender" },
      { val: "practicing", label: "En Ensayo" },
      { val: "ready", label: "Listo" }
    ];
  }
  
  optionsDiv.innerHTML = "";
  
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-btn";
    
    let val, label;
    if (typeof opt === "object") {
      val = opt.val;
      label = opt.label;
    } else {
      val = opt;
      label = opt;
    }
    
    btn.textContent = label;
    btn.setAttribute("data-val", val);
    
    if (val === currentVal) {
      btn.classList.add("active");
    }
    
    btn.addEventListener("click", () => {
      if (hiddenInput) {
        hiddenInput.value = val;
        hiddenInput.dispatchEvent(new Event("change"));
      }
      element.textContent = label;
      if (field === "key") {
        element.className = "meta-inline-select value-field text-cyan";
      }
      popup.style.display = "none";
    });
    
    optionsDiv.appendChild(btn);
  });
  
  positionPopover(popup, element);
}

let activeChordBadge = null;

// Escuchar cambios en el editor de letras para actualizar la vista previa de estructura en tiempo real
(function initStructurePreviewListener() {
  let previewDebounceTimer = null;
  document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "editor-rich-lyrics") {
      clearTimeout(previewDebounceTimer);
      previewDebounceTimer = setTimeout(updateStructurePreview, 600);
    }
  });
  document.addEventListener("paste", (e) => {
    if (e.target && e.target.id === "editor-rich-lyrics") {
      clearTimeout(previewDebounceTimer);
      previewDebounceTimer = setTimeout(updateStructurePreview, 800);
    }
  });
})();

function bindChordBadgeEvents() {
  const badges = document.querySelectorAll(".editor-chord-badge");
  badges.forEach(badge => {
    badge.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openChordPickerForBadge(badge, e);
    });
    
    setupLongPress(badge, (e) => {
      if (navigator.vibrate) navigator.vibrate(50);
      openChordPickerForBadge(badge, e);
    });
  });
}

function openChordPickerForBadge(badge, e) {
  activeChordBadge = badge;
  const popup = document.getElementById("chord-picker-popup");
  if (!popup) return;
  
  // Guardar el índice del acorde activo en el DOM actual
  const allBadges = Array.from(document.querySelectorAll(".editor-chord-badge"));
  popup._activeChordIndex = allBadges.indexOf(badge);
  
  // Limpiar corchetes al leer para inicializar el selector de acordes
  const currentChord = (badge.getAttribute("data-chord") || badge.textContent.trim()).replace(/[\[\]]/g, "");
  
  let root = currentChord.substring(0, 1);
  if (currentChord.length > 1 && (currentChord[1] === '#' || currentChord[1] === 'b')) {
    root = currentChord.substring(0, 2);
  }
  const suffix = currentChord.substring(root.length);
  
  const customInput = document.getElementById("picker-custom-val");
  if (customInput) {
    customInput.value = currentChord;
  }
  
  popup._chordRoot = root;
  popup._chordSuffix = suffix;
  
  const rootButtons = popup.querySelectorAll(".roots-grid .picker-btn");
  rootButtons.forEach(btn => {
    const val = btn.getAttribute("data-val");
    if (val === root) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  const suffixButtons = popup.querySelectorAll(".suffixes-grid .picker-btn");
  suffixButtons.forEach(btn => {
    const val = btn.getAttribute("data-val");
    if (val === suffix) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  positionPopover(popup, badge);
}

function initChordPickerHandlers() {
  const popup = document.getElementById("chord-picker-popup");
  if (!popup) return;
  
  const customInput = document.getElementById("picker-custom-val");
  const confirmBtn = document.getElementById("btn-picker-confirm");
  
  const rootButtons = popup.querySelectorAll(".roots-grid .picker-btn");
  rootButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");
      popup._chordRoot = val;
      rootButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const combined = (popup._chordRoot || "") + (popup._chordSuffix || "");
      if (customInput) customInput.value = combined;
    });
    
    btn.addEventListener("dblclick", () => {
      const val = btn.getAttribute("data-val");
      popup._chordRoot = val;
      applyChordFromPicker();
    });
  });
  
  const suffixButtons = popup.querySelectorAll(".suffixes-grid .picker-btn");
  suffixButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");
      popup._chordSuffix = val;
      suffixButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const combined = (popup._chordRoot || "") + (popup._chordSuffix || "");
      if (customInput) customInput.value = combined;
    });
    
    btn.addEventListener("dblclick", () => {
      const val = btn.getAttribute("data-val");
      popup._chordSuffix = val;
      applyChordFromPicker();
    });
  });
  
  if (confirmBtn) {
    confirmBtn.addEventListener("click", applyChordFromPicker);
  }
  
  const deleteBtn = document.getElementById("btn-picker-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const index = popup._activeChordIndex;
      const badges = document.querySelectorAll(".editor-chord-badge");
      let targetBadge = activeChordBadge;
      if (index !== undefined && index !== -1 && badges[index]) {
        targetBadge = badges[index];
      }
      if (targetBadge) {
        targetBadge.remove();
        activeChordBadge = null;
        popup.style.display = "none";
        
        // Sincronizar
        const serialized = serializeRichLyrics();
        const rawInput = document.getElementById("song-lyrics");
        if (rawInput) rawInput.value = serialized;
      }
    });
  }
  
  if (customInput) {
    customInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyChordFromPicker();
      }
    });
  }
  
  // Cerrar popups al hacer clic fuera
  document.addEventListener("click", (e) => {
    const chordPopup = document.getElementById("chord-picker-popup");
    const metaPopup = document.getElementById("meta-selector-popup");
    
    if (chordPopup && chordPopup.style.display !== "none") {
      if (!chordPopup.contains(e.target) && !e.target.closest(".editor-chord-badge")) {
        chordPopup.style.display = "none";
      }
    }
    
    if (metaPopup && metaPopup.style.display !== "none") {
      if (!metaPopup.contains(e.target) && !e.target.closest(".meta-inline-select")) {
        metaPopup.style.display = "none";
      }
    }
  });
}

function applyChordFromPicker() {
  const popup = document.getElementById("chord-picker-popup");
  const customInput = document.getElementById("picker-custom-val");
  if (!popup) return;
  
  // Localizar el elemento en el DOM usando el índice guardado como respaldo
  const index = popup._activeChordIndex;
  const badges = document.querySelectorAll(".editor-chord-badge");
  let targetBadge = activeChordBadge;
  if (index !== undefined && index !== -1 && badges[index]) {
    targetBadge = badges[index];
  }
  
  if (!targetBadge) return;
  
  let newChord = "";
  if (customInput && customInput.value.trim() !== "") {
    newChord = customInput.value.trim();
  } else {
    newChord = (popup._chordRoot || "") + (popup._chordSuffix || "");
  }
  
  if (newChord !== "") {
    // Asegurar corchetes en el contenido de texto plano
    if (!newChord.startsWith("[")) newChord = "[" + newChord;
    if (!newChord.endsWith("]")) newChord = newChord + "]";
    
    targetBadge.textContent = newChord;
    targetBadge.setAttribute("data-chord", newChord.replace(/[\[\]]/g, ""));
    const serialized = serializeRichLyrics();
    document.getElementById("song-lyrics").value = serialized;
  }
  
  popup.style.display = "none";
}

function initInlineEditFields() {
  const fields = [
    { id: "meta-title", type: "title" },
    { id: "meta-artist", type: "artist" },
    { id: "meta-bpm", type: "bpm" }
  ];
  
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) {
      setupInlineEdit(el, f.type);
    }
  });
  
  const selects = [
    { id: "meta-key", type: "key" },
    { id: "meta-timesig", type: "timesig" },
    { id: "meta-status", type: "status" }
  ];
  
  selects.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      setupInlineSelect(el, s.type);
    }
  });
  
  const richEditor = document.getElementById("editor-rich-lyrics");
  if (richEditor) {
    richEditor.addEventListener("blur", () => {
      convertTypedBracketsToBadges();
    });
    
    richEditor.addEventListener("input", () => {
      const serialized = serializeRichLyrics();
      document.getElementById("song-lyrics").value = serialized;
    });
  }
}

// --- DRUM MACHINE (CAJA DE RITMOS) FUNCTIONS ---

function toggleDrumMachine(enabled) {
  state.drumMachine.enabled = enabled;
  if (state.metronome.isPlaying) {
    stopMetronomeTimer();
    startMetronomeTimer();
  }
  saveDrumMachineSettingsToActiveSong();
  resetSequencerVisuals();
}

function toggleSequencerStep(inst, stepIdx, button) {
  const isActive = !state.drumMachine.grid[inst][stepIdx];
  state.drumMachine.grid[inst][stepIdx] = isActive;
  
  saveDrumMachineSettingsToActiveSong();
  
  if (isActive) {
    button.classList.add("active");
    initAudioContext();
    if (audioCtx) {
      const now = audioCtx.currentTime;
      if (inst === "kick") playKick(now);
      else if (inst === "snare") playSnare(now);
      else if (inst === "hihat") playHiHat(now);
    }
  } else {
    button.classList.remove("active");
  }
}

function buildDrumPatternGrid(pattern, steps) {
  let grid = {
    kick:  Array(steps).fill(false),
    snare: Array(steps).fill(false),
    hihat: Array(steps).fill(false)
  };
  
  if (pattern === "rock") {
    if (steps === 8) {
      grid.kick  = [true,  false, false, false, true,  false, false, false];
      grid.snare = [false, false, true,  false, false, false, true,  false];
      grid.hihat = [true,  false, true,  false, true,  false, true,  false];
    } else if (steps === 6) {
      const beats = state.metronome.beatsPerMeasure || 3;
      const unit = state.metronome.beatUnit || 4;
      if (beats === 6 && unit === 8) {
        // Compás 6/8
        grid.kick  = [true,  false, false, false, false, false];
        grid.snare = [false, false, false, true,  false, false];
        grid.hihat = [true,  false, true,  false, true,  false];
      } else {
        // Compás 3/4
        grid.kick  = [true,  false, false, false, false, false];
        grid.snare = [false, false, true,  false, true,  false];
        grid.hihat = [true,  false, true,  false, true,  false];
      }
    } else if (steps === 4) {
      grid.kick  = [true,  false, false, false];
      grid.snare = [false, false, true,  false];
      grid.hihat = [true,  false, true,  false];
    } else {
      grid.kick[0] = true;
      if (steps > 2) grid.snare[Math.floor(steps/2)] = true;
      for (let i = 0; i < steps; i += 2) grid.hihat[i] = true;
    }
  } else if (pattern === "funk") {
    if (steps === 8) {
      grid.kick  = [true,  false, false, true,  false, false, false, false];
      grid.snare = [false, false, true,  false, false, true,  true,  false];
      grid.hihat = [true,  true,  true,  true,  true,  true,  true,  true];
    } else if (steps === 6) {
      const beats = state.metronome.beatsPerMeasure || 3;
      const unit = state.metronome.beatUnit || 4;
      if (beats === 6 && unit === 8) {
        grid.kick  = [true,  false, false, false, true,  false];
        grid.snare = [false, false, false, true,  false, true];
        grid.hihat = [true,  true,  true,  true,  true,  true];
      } else {
        grid.kick  = [true,  false, false, true,  false, false];
        grid.snare = [false, false, true,  false, true,  false];
        grid.hihat = [true,  true,  true,  true,  true,  true];
      }
    } else if (steps === 4) {
      grid.kick  = [true,  false, false, true];
      grid.snare = [false, false, true,  false];
      grid.hihat = [true,  true,  true,  true];
    } else {
      grid.kick[0] = true;
      if (steps > 3) grid.kick[3] = true;
      if (steps > 2) grid.snare[2] = true;
      if (steps > 5) grid.snare[5] = true;
      grid.hihat = Array(steps).fill(true);
    }
  } else if (pattern === "reggae") {
    if (steps === 8) {
      grid.kick  = [false, false, false, false, true,  false, false, false];
      grid.snare = [false, false, false, false, true,  false, false, false];
      grid.hihat = [false, true,  false, true,  false, true,  false, true];
    } else if (steps === 6) {
      const beats = state.metronome.beatsPerMeasure || 3;
      const unit = state.metronome.beatUnit || 4;
      if (beats === 6 && unit === 8) {
        grid.kick  = [false, false, false, true,  false, false];
        grid.snare = [false, false, false, true,  false, false];
        grid.hihat = [false, true,  false, true,  false, true];
      } else {
        grid.kick  = [false, false, false, false, true,  false];
        grid.snare = [false, false, false, false, true,  false];
        grid.hihat = [false, true,  false, true,  false, true];
      }
    } else if (steps === 4) {
      grid.kick  = [false, false, true,  false];
      grid.snare = [false, false, true,  false];
      grid.hihat = [false, true,  false, true];
    } else {
      if (steps > 3) {
        grid.kick[Math.floor(steps/2)] = true;
        grid.snare[Math.floor(steps/2)] = true;
      }
      for (let i = 0; i < steps; i += 2) grid.hihat[i] = true;
    }
  }
  
  return grid;
}

function applyDrumPattern(pattern) {
  state.drumMachine.selectedPattern = pattern;
  const steps = getSequencerStepsCount();
  state.drumMachine.grid = buildDrumPatternGrid(pattern, steps);
  saveDrumMachineSettingsToActiveSong();
  renderRehearsalRoom();
}

function saveDrumMachineSettingsToActiveSong() {
  if (!state.activeSongId) return;
  const song = state.songs.find(s => String(s.id) === String(state.activeSongId));
  if (song) {
    song.drumEnabled = state.drumMachine.enabled;
    song.drumPattern = state.drumMachine.selectedPattern;
    song.drumGrid = JSON.parse(JSON.stringify(state.drumMachine.grid));
    saveLocalStorage();
  }
}

function resetSequencerVisuals() {
  state.drumMachine.currentStep = 0;
  const seqDots = document.querySelectorAll(".seq-step-dot");
  seqDots.forEach(dot => {
    dot.className = "seq-step-dot";
  });
}

function playKick(time) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
  
  gain.gain.setValueAtTime(0.4 * state.metronome.volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
  
  osc.start(time);
  osc.stop(time + 0.3);
}

function playSnare(time) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1000, time);
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.2 * state.metronome.volume, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, time);
  
  oscGain.gain.setValueAtTime(0.15 * state.metronome.volume, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  
  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);
  
  noise.start(time);
  noise.stop(time + 0.2);
  osc.start(time);
  osc.stop(time + 0.1);
}

function playHiHat(time) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.05;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(8000, time);
  
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.12 * state.metronome.volume, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  noise.start(time);
  noise.stop(time + 0.05);
}

function getSequencerStepsCount() {
  const beats = state.metronome.beatsPerMeasure || 4;
  const unit = state.metronome.beatUnit || 4;
  let steps = beats * (8 / unit);
  if (steps < 2) steps = 2;
  if (steps > 16) steps = 16;
  return Math.round(steps);
}

function ensureSequencerGridSize(steps) {
  ['kick', 'snare', 'hihat'].forEach(inst => {
    let arr = state.drumMachine.grid[inst];
    if (!arr) {
      arr = [];
    }
    if (arr.length < steps) {
      while (arr.length < steps) {
        arr.push(false);
      }
    } else if (arr.length > steps) {
      arr = arr.slice(0, steps);
    }
    state.drumMachine.grid[inst] = arr;
  });
}

function initInterventionPopupDraggable() {
  const popup = document.getElementById("intervention-picker-popup");
  if (!popup) return;
  const header = popup.querySelector(".popover-header");
  if (!header) return;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  header.style.cursor = "move"; // Indicate that the header is draggable
  header.onmousedown = dragMouseDown;
  header.ontouchstart = dragTouchStart;
  
  function dragMouseDown(e) {
    e = e || window.event;
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('close-popover-btn')) return;
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function dragTouchStart(e) {
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('close-popover-btn')) return;
    
    if (e.touches && e.touches[0]) {
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      document.ontouchend = closeDragElement;
      document.ontouchmove = elementTouchDrag;
    }
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    popup.style.top = (popup.offsetTop - pos2) + "px";
    popup.style.left = (popup.offsetLeft - pos1) + "px";
  }
  
  function elementTouchDrag(e) {
    if (e.touches && e.touches[0]) {
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      popup.style.top = (popup.offsetTop - pos2) + "px";
      popup.style.left = (popup.offsetLeft - pos1) + "px";
    }
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// FUNCIONES RESPONSIVAS PARA DISPOSITIVOS MÓVILES
function toggleMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("mobile-sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  }
}

function toggleMobileMetronome() {
  const metronome = document.querySelector(".sidebar-panel");
  const overlay = document.getElementById("mobile-metronome-overlay");
  if (metronome && overlay) {
    metronome.classList.toggle("open");
    overlay.classList.toggle("open");
  }
}

function closeMobileDrawers() {
  const sidebar = document.querySelector(".sidebar");
  const overlaySidebar = document.getElementById("mobile-sidebar-overlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlaySidebar) overlaySidebar.classList.remove("open");
  
  const metronome = document.querySelector(".sidebar-panel");
  const overlayMetronome = document.getElementById("mobile-metronome-overlay");
  if (metronome) metronome.classList.remove("open");
  if (overlayMetronome) overlayMetronome.classList.remove("open");
}

// FUNCIONES DE CONTROL GLOBAL Y PANTALLA COMPLETA

function toggleModalFullscreen() {
  const modalContent = document.querySelector("#modal-add-song .modal-content");
  const btn = document.querySelector(".btn-toggle-modal-fullscreen");
  if (modalContent) {
    modalContent.classList.toggle("modal-fullscreen");
    if (btn) {
      if (modalContent.classList.contains("modal-fullscreen")) {
        btn.innerHTML = "📺 Normal";
        btn.style.borderColor = "var(--neon-orange)";
        btn.style.color = "var(--neon-orange)";
      } else {
        btn.innerHTML = "📺 Expandir";
        btn.style.borderColor = "rgba(255, 255, 255, 0.15)";
        btn.style.color = "var(--text-primary)";
      }
    }
  }
}

function deleteSongFromRepertorio(songId) {
  state.songs = state.songs.filter(s => String(s.id) !== String(songId));
  
  // Eliminar en Firestore directamente
  if (window.SongsService) {
    window.SongsService.deleteSong(songId).catch(err => {
      console.error("Error al eliminar canción en Firebase:", err);
    });
  }
  
  if (String(state.activeSongId) === String(songId)) {
    state.activeSongId = null;
    const indicator = document.getElementById("nav-active-song");
    if (indicator) indicator.style.display = "none";
  }
  
  renderSetlist();
  triggerEnsayoToast("Tema eliminado correctamente");
}

// Sobrescribir triggerEnsayoToast para que sea utilizable en toda la app
function triggerEnsayoToast(msg) {
  const existing = document.querySelector(".ensayo-toast");
  if (existing) existing.remove();
  
  const toast = document.createElement("div");
  toast.className = "ensayo-toast glass";
  toast.innerHTML = `<span>🔔</span> ${msg}`;
  
  // Agregar al contenedor de la app o al body
  const container = document.querySelector(".app-container") || document.body;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// --- AUTENTICACIÓN (NUEVA LÓGICA VINCULADA A auth.html) ---
// ============================================================

function handleProfileClick() {
  closeMobileDrawers();
  if (state.currentUser) {
    // Si ya está logueado, confirmamos si quiere cerrar sesión
    const logout = confirm("¿Deseas cerrar sesión en NYX Band-Pro?");
    if (logout) {
      handleLogout();
    }
  } else {
    // Si no está logueado, lo mandamos a auth.html
    window.location.href = "auth.html";
  }
}

function handleLogout() {
  if (window.supabaseClient) {
    window.supabaseClient.auth.signOut().then(() => {
      window.location.reload();
    });
  }
}

function updateProfileBadge() {
  const avatar = document.getElementById("current-user-avatar");
  const name = document.getElementById("current-user-name");
  const role = document.getElementById("current-user-role");
  
  if (!name || !role) return;

  if (state.currentUser) {
    name.textContent = state.currentUser.email.split("@")[0];
    role.textContent = "Conectado";
    avatar.textContent = "🎙️";
    // Podríamos verificar el rol desde state.members cruzando el email,
    // pero por ahora lo dejamos como "Conectado".
    const memberObj = state.members.find(m => m.name.toLowerCase() === name.textContent.toLowerCase());
    if (memberObj && memberObj.role) {
      role.textContent = memberObj.role;
    }
  } else {
    name.textContent = "Invitado";
    role.textContent = "Haz clic para entrar";
    avatar.textContent = "👤";
  }
}

function updatePermissionsUI() {
  const btnAdd = document.getElementById("btn-add-song");
  const btnMembers = document.getElementById("btn-members-registry");
  const grid = document.getElementById("setlist-grid");
  
  // Mostrar los botones de agregar e integrantes para todos temporalmente
  // para evitar confusión (luego se restringirá la acción con un alert si es necesario)
  if (btnAdd) btnAdd.style.display = "";
  if (btnMembers) btnMembers.style.display = "";
  
  if (state.currentUser) {
    if (grid) grid.classList.remove("guest-mode");
  } else {
    if (grid) grid.classList.add("guest-mode");
  }
}

// ============================================================
// --- CONFIGURACIÓN DE BANDA (MULTI-TENANT) ---
// ============================================================

function isCurrentUserAdmin() {
  if (!state.currentUser) return false;
  if (state.currentBandId === "KAWSAY") return false;
  
  // 1. Si es el creador de la banda registrado en la metadata
  if (state.bandMetadata && state.bandMetadata.createdBy === state.currentUser.uid) {
    return true;
  }
  
  // 2. Si está en la lista de miembros como Administrador
  if (state.members && state.members.length > 0) {
    const isMemberAdmin = state.members.some(m => m.linkedUid === state.currentUser.uid && m.role === "Administrador") ||
                          state.members.some(m => m.name.toLowerCase() === state.currentUser.email.split("@")[0].toLowerCase() && m.role === "Administrador");
    if (isMemberAdmin) return true;
  }
  
  // 3. Fallback: Si es el único integrante del grupo, consideramos que es el administrador
  if (state.members && state.members.length === 1) {
    const singleMember = state.members[0];
    if (singleMember.linkedUid === state.currentUser.uid || 
        singleMember.email === state.currentUser.email || 
        singleMember.name.toLowerCase() === state.currentUser.email.split("@")[0].toLowerCase()) {
      return true;
    }
  }

  return false;
}

function openBandSettingsModal() {
  closeMobileDrawers();
  const nameInput = document.getElementById("band-settings-name");
  const logoStatus = document.getElementById("band-settings-logo-status");
  const idInput = document.getElementById("band-settings-id");
  const uploadBtn = document.getElementById("btn-band-settings-upload-logo");
  const saveBtn = document.getElementById("btn-band-settings-save");
  const warningEl = document.getElementById("band-settings-permissions-warning");
  const previewImg = document.getElementById("band-settings-logo-preview");
  const previewContainer = document.getElementById("band-settings-logo-preview-container");
  const regenerateBtn = document.getElementById("btn-regenerate-code");
  
  // Determinar si el usuario actual es Administrador de la banda actual
  const userIsAdmin = isCurrentUserAdmin();
  
  // Mostrar / ocultar botón de regenerar código
  if (regenerateBtn) {
    regenerateBtn.style.display = userIsAdmin ? "inline-block" : "none";
  }
  
  // Ocultar botón de crear grupo si ya tiene uno real
  const createBandBtn = document.querySelector("button[onclick='createNewBandFlow()']");
  if (createBandBtn) {
    if (state.currentBandId && state.currentBandId !== "KAWSAY") {
      createBandBtn.style.display = "none";
    } else {
      createBandBtn.style.display = "inline-block";
    }
  }

  // Renderizar lista de mis grupos
  const groupsListEl = document.getElementById("band-settings-groups-list");
  if (groupsListEl && state.myBands && window.supabaseClient) {
    groupsListEl.innerHTML = `<p style="color:var(--text-muted); font-size:12px;">Cargando tus grupos...</p>`;
    
    (async () => {
      try {
        const { data: bandsData, error: bandsError } = await window.supabaseClient
          .from('bands')
          .select('id, name')
          .in('id', state.myBands);

        if (bandsError) throw bandsError;
        
        let html = "";
        (bandsData || []).forEach(b => {
          const isActive = b.id === state.currentBandId;
          html += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid ${isActive ? 'var(--neon-magenta)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; width:100%;">
              <span style="font-size:13px; font-weight:${isActive ? '700' : '400'}; color:${isActive ? '#fff' : 'var(--text-secondary)'};">${b.name} ${isActive ? '<span style="font-size:10px; color:var(--neon-magenta); margin-left:6px;">(Activo)</span>' : ''}</span>
              ${!isActive ? `<button onclick="switchActiveGroup('${b.id}')" class="btn btn-secondary" style="padding:4px 8px; font-size:11px; border-radius:6px; border-color:var(--neon-cyan); color:var(--neon-cyan); width:auto; cursor:pointer;">Cambiar</button>` : ''}
            </div>
          `;
        });
        groupsListEl.innerHTML = html || `<p style="color:var(--text-muted); font-size:12px;">No estás unido a ningún grupo.</p>`;
      } catch(err) {
        console.error("Error al cargar grupos del usuario:", err);
        groupsListEl.innerHTML = `<p style="color:var(--red); font-size:12px;">Error al cargar grupos.</p>`;
      }
    })();
  }
  
  // Habilitar o deshabilitar campos según rol
  if (nameInput) {
    nameInput.value = state.bandMetadata.name || "";
    nameInput.disabled = !userIsAdmin;
    nameInput.style.opacity = userIsAdmin ? "1" : "0.6";
  }
  if (idInput) {
    idInput.value = state.currentBandId || "KAWSAY";
  }
  if (uploadBtn) {
    uploadBtn.disabled = !userIsAdmin;
    uploadBtn.style.opacity = userIsAdmin ? "1" : "0.5";
  }
  if (saveBtn) {
    saveBtn.disabled = !userIsAdmin;
    saveBtn.style.opacity = userIsAdmin ? "1" : "0.5";
  }
  if (warningEl) {
    if (!userIsAdmin) {
      if (state.currentBandId === "KAWSAY") {
        warningEl.innerHTML = `⚠️ Estás en el grupo de demostración pública KAWSAY. Crea tu propio grupo para poder cambiar el nombre y subir tu logo.`;
      } else {
        warningEl.innerHTML = `⚠️ Solo los Administradores de este grupo pueden modificar el nombre o el logo.`;
      }
      warningEl.style.display = "block";
    } else {
      warningEl.style.display = "none";
    }
  }
  
  // Configurar vista previa del logo actual
  if (state.bandMetadata.logoUrl) {
    if (logoStatus) {
      logoStatus.innerHTML = `<span style="color:var(--neon-green)">✓ Logo actual cargado</span>`;
    }
    if (previewImg && previewContainer) {
      previewImg.src = state.bandMetadata.logoUrl;
      previewContainer.style.display = "flex";
    }
  } else {
    if (logoStatus) {
      logoStatus.innerHTML = "Ningún logo cargado.";
    }
    if (previewContainer) {
      previewContainer.style.display = "none";
    }
  }
  
  document.getElementById("modal-band-settings").classList.add("open");
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const statusEl = document.getElementById("band-settings-logo-status");
  const previewImg = document.getElementById("band-settings-logo-preview");
  const previewContainer = document.getElementById("band-settings-logo-preview-container");
  
  statusEl.innerHTML = "Optimizando imagen...";
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const MAX_HEIGHT = 100; // Altura máxima para el logo
      const MAX_WIDTH = 300;  // Ancho máximo para el logo
      let width = img.width;
      let height = img.height;
      
      // Ajuste proporcional según límites máximos
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      // Limpiar canvas para asegurar transparencia de base
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a PNG para mantener la transparencia
      const compressedBase64 = canvas.toDataURL("image/png");
      state.bandMetadata.logoUrl = compressedBase64;
      
      // Actualizar estado visual
      statusEl.innerHTML = `<span style="color:var(--neon-green)">✓ Logo optimizado y listo</span>`;
      
      // Mostrar vista previa en vivo
      if (previewImg && previewContainer) {
        previewImg.src = compressedBase64;
        previewContainer.style.display = "flex";
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function saveBandSettings() {
  const nameInput = document.getElementById("band-settings-name");
  if (!nameInput || !nameInput.value.trim()) {
    alert("El nombre de la banda es requerido.");
    return;
  }
  
  const newName = nameInput.value.trim();
  state.bandMetadata.name = newName;
  
  if (window.supabaseClient && state.currentBandId) {
    try {
      const { error } = await window.supabaseClient
        .from('bands')
        .update({
          name: state.bandMetadata.name,
          logo_url: state.bandMetadata.logoUrl || null
        })
        .eq('id', state.currentBandId);
      
      if (error) throw error;
      
      updateBandUI();
      document.getElementById("modal-band-settings").classList.remove("open");
    } catch(e) {
      console.error("Error guardando settings en Supabase:", e);
      alert("Guardado localmente. Hubo un problema al sincronizar con Supabase.");
      updateBandUI();
      document.getElementById("modal-band-settings").classList.remove("open");
    }
  } else {
    updateBandUI();
    document.getElementById("modal-band-settings").classList.remove("open");
  }
}

function updateBandUI() {
  const headerTitle = document.getElementById("header-band-title");
  const headerLogo = document.getElementById("header-band-logo");
  const welcomeBanner = document.getElementById("band-welcome-banner");
  
  const bandName = state.bandMetadata.name || "KAWSAY";
  
  if (headerLogo) {
    if (state.bandMetadata.logoUrl) {
      headerLogo.src = state.bandMetadata.logoUrl;
      headerLogo.style.display = "block";
      if (headerTitle) headerTitle.style.display = "none";
    } else {
      headerLogo.style.display = "none";
      if (headerTitle) {
        headerTitle.textContent = bandName;
        headerTitle.style.display = "block";
      }
    }
  } else if (headerTitle) {
    headerTitle.textContent = bandName;
    headerTitle.style.display = "block";
  }
  
  // Renderizar banner de bienvenida en KAWSAY (si el usuario no tiene bandas creadas)
  if (welcomeBanner) {
    if (state.currentBandId === "KAWSAY" && state.currentUser) {
      welcomeBanner.innerHTML = `
        <div class="glass" style="display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 20px; border:1px solid rgba(0, 229, 255, 0.2); border-radius:12px; background:rgba(0, 229, 255, 0.03); box-shadow:0 0 15px rgba(0, 229, 255, 0.05); flex-wrap:wrap;">
          <div style="flex:1; min-width:260px;">
            <strong style="color:var(--neon-cyan); display:block; margin-bottom:4px; font-size:14px;">👋 ¡Estás en el grupo de demostración KAWSAY!</strong>
            <span style="font-size:12px; color:var(--text-secondary); line-height:1.5;">Este es un grupo de demostración pública. Crea tu propio grupo de banda para poder cambiar la configuración del grupo, invitar a músicos reales mediante un código y personalizar a tu gusto.</span>
          </div>
          <button class="btn btn-secondary" onclick="createNewBandFlow()" style="border:1px solid var(--neon-magenta); color:var(--neon-magenta); background:rgba(255,0,127,0.05); padding:8px 16px; border-radius:8px; font-size:12px; cursor:pointer; font-weight:600; transition:all 0.2s; white-space:nowrap;">
            + Crear Mi Grupo
          </button>
        </div>
      `;
      welcomeBanner.style.display = "block";
    } else {
      welcomeBanner.style.display = "none";
    }
  }
}

// Llamar a updateBandUI cuando sea necesario
const originalRenderApp = renderApp;
renderApp = function() {
  originalRenderApp();
  updateBandUI();
};

function copyBandIdCode() {
  const idInput = document.getElementById("band-settings-id");
  if (!idInput || !idInput.value) return;
  
  idInput.select();
  idInput.setSelectionRange(0, 99999); // Para móviles
  
  try {
    navigator.clipboard.writeText(idInput.value);
    alert("Código de Grupo copiado al portapapeles: " + idInput.value);
  } catch (err) {
    alert("Código del Grupo: " + idInput.value);
  }
}

async function joinBandByCode() {
  const joinInput = document.getElementById("band-join-code");
  if (!joinInput || !joinInput.value.trim()) {
    alert("Ingresa un código de banda válido.");
    return;
  }
  
  const code = joinInput.value.trim().toUpperCase();
  
  if (code.length < 5) {
    alert("El código de invitación debe tener al menos 5 caracteres.");
    return;
  }
  
  if (state.myBands && state.myBands.includes(code)) {
    alert("Ya perteneces a este grupo.");
    return;
  }
  
  if (!state.currentUser || !window.supabaseClient) {
    alert("Inicia sesión para unirte a un grupo.");
    return;
  }
  
  try {
    // 1. Validar que la banda existe
    const { data: bandDoc, error: bandError } = await window.supabaseClient
      .from('bands')
      .select('*')
      .eq('id', code)
      .maybeSingle();

    if (bandError) throw bandError;
    if (!bandDoc) {
      alert("Este código de grupo no existe. Verifica con tu administrador.");
      return;
    }
    
    // 2. Unirse a la banda en la tabla members
    const email = state.currentUser.email;
    const userName = state.currentUser.user_metadata.nombre || email.split("@")[0];
    
    const { error: memberError } = await window.supabaseClient
      .from('members')
      .insert({
        band_id: code,
        user_id: state.currentUser.id,
        name: userName,
        email: email,
        role: "Integrante"
      });

    if (memberError) throw memberError;
    
    // 3. Actualizar la banda activa en users
    const { error: userError } = await window.supabaseClient
      .from('users')
      .update({
        current_band_id: code
      })
      .eq('id', state.currentUser.id);

    if (userError) throw userError;
    
    alert(`¡Te has unido con éxito al grupo "${bandDoc.name || code}"!`);
    joinInput.value = "";
    document.getElementById("modal-band-settings").classList.remove("open");
  } catch (err) {
    console.error("Error al unirse al grupo por código:", err);
    alert("Error al intentar unirse: " + err.message);
  }
}

async function createNewBandFlow() {
  if (state.currentBandId && state.currentBandId !== "KAWSAY") {
    alert("Ya perteneces a un grupo. Solo se permite crear un grupo por usuario.");
    return;
  }

  const proposedName = prompt("Ingresa el nombre del nuevo grupo:");
  if (!proposedName || !proposedName.trim()) return;
  
  if (!state.currentUser || !window.supabaseClient) {
    alert("Debes iniciar sesión con tu cuenta para crear un grupo.");
    return;
  }
  
  const cleanName = proposedName.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const bandIdCode = `${cleanName}-${randNum}`;
  
  try {
    // 1. Crear registro en la tabla bands
    const { error: bandError } = await window.supabaseClient
      .from('bands')
      .insert({
        id: bandIdCode,
        name: proposedName.trim(),
        created_by: state.currentUser.id
      });
    if (bandError) throw bandError;
    
    // 2. Crear miembro creador como Administrador
    const email = state.currentUser.email;
    const creatorName = state.currentUser.user_metadata.nombre || email.split("@")[0];
    const { error: memberError } = await window.supabaseClient
      .from('members')
      .insert({
        band_id: bandIdCode,
        user_id: state.currentUser.id,
        name: creatorName,
        email: email,
        role: "Administrador"
      });
    if (memberError) throw memberError;
    
    // 3. Establecer la banda activa en users
    const { error: userError } = await window.supabaseClient
      .from('users')
      .update({
        current_band_id: bandIdCode
      })
      .eq('id', state.currentUser.id);
    if (userError) throw userError;
    
    // 4. Crear estructura básica de acordes favoritos
    await window.supabaseClient
      .from('fav_chords')
      .insert({
        band_id: bandIdCode,
        list: []
      });

    // 5. Actualizar estado local
    state.currentBandId = bandIdCode;
    state.bandMetadata = { name: proposedName.trim(), logoUrl: null };
    if (!state.myBands.includes(bandIdCode)) {
      state.myBands.push(bandIdCode);
    }
    
    await loadSongsFromDB();
    await loadMembersFromDB();
    
    alert("¡Grupo creado con éxito!\nCódigo de Invitación: " + bandIdCode);
    document.getElementById("modal-band-settings").classList.remove("open");
    renderApp();
  } catch (e) {
    console.error("Error al crear grupo:", e);
    alert("Error al crear el grupo: " + e.message);
  }
}

async function switchActiveGroup(bandId) {
  if (!state.currentUser || !window.supabaseClient) return;
  try {
    const { error } = await window.supabaseClient
      .from('users')
      .update({
        current_band_id: bandId
      })
      .eq('id', state.currentUser.id);

    if (error) throw error;
    
    document.getElementById("modal-band-settings").classList.remove("open");
  } catch(e) {
    alert("Error al cambiar de grupo: " + e.message);
  }
}

async function regenerateBandInviteCode() {
  if (!state.currentBandId || !window.supabaseClient) return;
  if (!isCurrentUserAdmin()) {
    alert("Solo los Administradores pueden regenerar el código de invitación.");
    return;
  }

  if (confirm("¿Estás seguro de que deseas regenerar el código de invitación? El código anterior dejará de ser válido.")) {
    try {
      const cleanName = state.bandMetadata.name.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const nuevoCodigo = `${cleanName}-${randNum}`;

      // 1. Obtener datos actuales
      const { data: bandData } = await window.supabaseClient.from('bands').select('*').eq('id', state.currentBandId).maybeSingle();
      const { data: membersList } = await window.supabaseClient.from('members').select('*').eq('band_id', state.currentBandId);
      const { data: songsList } = await window.supabaseClient.from('songs').select('*').eq('band_id', state.currentBandId);
      const { data: favChordsDoc } = await window.supabaseClient.from('fav_chords').select('*').eq('band_id', state.currentBandId).maybeSingle();

      // 2. Crear nueva banda
      const { error: newBandError } = await window.supabaseClient.from('bands').insert({
        id: nuevoCodigo,
        name: bandData.name,
        logo_url: bandData.logo_url,
        created_by: bandData.created_by
      });
      if (newBandError) throw newBandError;

      // 3. Copiar miembros a la nueva banda
      if (membersList && membersList.length > 0) {
        const newMembers = membersList.map(m => ({
          band_id: nuevoCodigo,
          user_id: m.user_id,
          name: m.name,
          email: m.email,
          role: m.role,
          instruments: m.instruments,
          vocals: m.vocals,
          color: m.color
        }));
        const { error: newMembersError } = await window.supabaseClient.from('members').insert(newMembers);
        if (newMembersError) throw newMembersError;
      }

      // 4. Copiar canciones
      if (songsList && songsList.length > 0) {
        const newSongs = songsList.map(s => ({
          id: s.id,
          band_id: nuevoCodigo,
          title: s.title,
          artist: s.artist,
          lyrics: s.lyrics,
          chords: s.chords,
          bpm: s.bpm,
          status: s.status
        }));
        const { error: newSongsError } = await window.supabaseClient.from('songs').insert(newSongs);
        if (newSongsError) throw newSongsError;
      }

      // 5. Copiar favoritos
      if (favChordsDoc) {
        await window.supabaseClient.from('fav_chords').insert({
          band_id: nuevoCodigo,
          list: favChordsDoc.list
        });
      }

      // 6. Actualizar la banda activa para los usuarios en la tabla users
      if (membersList && membersList.length > 0) {
        const memberUserIds = membersList.map(m => m.user_id);
        
        // Actualizar todos los usuarios que tenían de activa esta banda al nuevo código
        const { error: updateActiveError } = await window.supabaseClient
          .from('users')
          .update({ current_band_id: nuevoCodigo })
          .eq('current_band_id', state.currentBandId)
          .in('id', memberUserIds);
        
        if (updateActiveError) throw updateActiveError;
      }

      // 7. Borrar la banda antigua (esto por cascada eliminará miembros, canciones y favoritos de la antigua en Supabase)
      const { error: deleteError } = await window.supabaseClient.from('bands').delete().eq('id', state.currentBandId);
      if (deleteError) throw deleteError;

      // 8. Cambiar estado local
      const antiguoCodigo = state.currentBandId;
      state.currentBandId = nuevoCodigo;
      state.myBands = state.myBands.map(b => b === antiguoCodigo ? nuevoCodigo : b);
      
      alert("¡Código de invitación regenerado con éxito!\nNuevo Código: " + nuevoCodigo);
      document.getElementById("modal-band-settings").classList.remove("open");
    } catch (err) {
      console.error("Error regenerando código en Supabase:", err);
      alert("Error al regenerar código: " + err.message);
    }
  }
}


async function onboardingCreateBand() {
  const input = document.getElementById("onboarding-new-band-name");
  const proposedName = input ? input.value.trim() : "";
  if (!proposedName) {
    alert("Ingresa un nombre para tu banda.");
    return;
  }
  
  if (!state.currentUser || !window.supabaseClient) return;
  
  const cleanName = proposedName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const bandIdCode = `${cleanName}-${randNum}`;
  
  try {
    const { error: bandError } = await window.supabaseClient
      .from('bands')
      .insert({
        id: bandIdCode,
        name: proposedName,
        created_by: state.currentUser.id
      });
    if (bandError) throw bandError;
    
    const email = state.currentUser.email;
    const creatorName = state.currentUser.user_metadata.nombre || email.split("@")[0];
    const { error: memberError } = await window.supabaseClient
      .from('members')
      .insert({
        band_id: bandIdCode,
        user_id: state.currentUser.id,
        name: creatorName,
        email: email,
        role: "Administrador"
      });
    if (memberError) throw memberError;
    
    await window.supabaseClient
      .from('users')
      .update({
        current_band_id: bandIdCode
      })
      .eq('id', state.currentUser.id);
    
    document.getElementById("modal-onboarding").style.display = "none";
  } catch (e) {
    console.error("Error al crear grupo en onboarding:", e);
    alert("Error al crear grupo: " + e.message);
  }
}

async function onboardingJoinBand() {
  const input = document.getElementById("onboarding-join-code");
  const code = input ? input.value.trim().toUpperCase() : "";
  if (!code) {
    alert("Ingresa un código válido.");
    return;
  }
  
  if (!state.currentUser || !window.supabaseClient) return;
  
  try {
    const { data: bandDoc, error: bandError } = await window.supabaseClient
      .from('bands')
      .select('*')
      .eq('id', code)
      .maybeSingle();

    if (bandError) throw bandError;
    if (!bandDoc) {
      alert("Este código de grupo no existe.");
      return;
    }
    
    const email = state.currentUser.email;
    const userName = state.currentUser.user_metadata.nombre || email.split("@")[0];
    
    const { error: memberError } = await window.supabaseClient
      .from('members')
      .insert({
        band_id: code,
        user_id: state.currentUser.id,
        name: userName,
        email: email,
        role: "Integrante"
      });

    if (memberError && memberError.code !== '23505') { // Si es error de duplicado (ya es miembro), continuamos
      throw memberError;
    }

    await window.supabaseClient
      .from('users')
      .update({
        current_band_id: code
      })
      .eq('id', state.currentUser.id);
    
    document.getElementById("modal-onboarding").style.display = "none";
  } catch(e) {
    console.error("Error uniendo al grupo:", e);
    alert("Error al intentar unirse: " + e.message);
  }
}

// ============================================================
// --- ARRASTRE HORIZONTAL DE ACORDES EN EL EDITOR ---
// ============================================================

let draggedBadge = null;

function makeChordBadgesDraggable() {
  const editor = document.getElementById("editor-rich-lyrics");
  if (!editor) return;
  
  editor.addEventListener("mousedown", handleDragStart);
  editor.addEventListener("touchstart", handleDragStart, { passive: false });
  
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchend", handleDragEnd);
}

function handleDragStart(e) {
  const badge = e.target.closest(".editor-chord-badge");
  if (!badge) return;
  
  draggedBadge = badge;
  badge.classList.add("dragging");
  
  // Retroalimentación visual
  badge.style.opacity = "0.5";
  badge.style.border = "1px dashed var(--neon-cyan)";
  
  // Evitar selección nativa al arrastrar
  e.preventDefault();
}

function handleDragMove(e) {
  if (!draggedBadge) return;
  
  const x = e.clientX || (e.touches && e.touches[0].clientX);
  const y = e.clientY || (e.touches && e.touches[0].clientY);
  if (!x || !y) return;
  
  let range;
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (pos) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
    }
  }
  
  if (range && range.startContainer) {
    const container = range.startContainer;
    
    // Evitar auto-inserción
    if (draggedBadge.contains(container)) return;
    
    const editor = document.getElementById("editor-rich-lyrics");
    if (editor && editor.contains(container)) {
      // Encontrar la línea (DIV) de origen y destino
      const targetLine = container.nodeType === Node.TEXT_NODE ? container.parentNode.closest("div") : container.closest("div");
      const sourceLine = draggedBadge.parentNode.closest("div");
      
      // Restringir el arrastre horizontal a la misma línea
      if (targetLine && sourceLine && targetLine === sourceLine) {
        range.insertNode(draggedBadge);
      }
    }
  }
  
  e.preventDefault();
}

function handleDragEnd(e) {
  if (!draggedBadge) return;
  
  draggedBadge.classList.remove("dragging");
  draggedBadge.style.opacity = "";
  draggedBadge.style.border = "";
  draggedBadge = null;
  
  // Normalizar los nodos de texto de la línea para evitar fragmentaciones
  const editor = document.getElementById("editor-rich-lyrics");
  if (editor) {
    editor.normalize();
    
    // Sincronizar el campo de texto textarea oculto
    const rawInput = document.getElementById("song-lyrics");
    if (rawInput) {
      rawInput.value = serializeRichLyrics();
    }
  }
}

// Inserta un objeto de acorde en la posición del cursor (caret) actual
function insertChordAtCaret(chordName = "C") {
  const editor = document.getElementById("editor-rich-lyrics");
  if (!editor) return;
  
  editor.focus();
  
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return;
  
  // Crear el elemento de badge de acorde
  const badge = document.createElement("span");
  badge.className = "editor-chord-badge";
  badge.setAttribute("contenteditable", "false");
  badge.setAttribute("data-chord", chordName);
  badge.textContent = `[${chordName}]`;
  
  range.insertNode(badge);
  
  // Mover el cursor (caret) justo después del acorde insertado
  range.setStartAfter(badge);
  range.setEndAfter(badge);
  selection.removeAllRanges();
  selection.addRange(range);
  
  // Vincular eventos (clic derecho / long press y drag-and-drop)
  bindChordBadgeEvents();
  
  // Sincronizar con el textarea oculto
  const rawInput = document.getElementById("song-lyrics");
  if (rawInput) {
    rawInput.value = serializeRichLyrics();
  }
}

// Inicializa la inserción rápida de acordes con doble clic (PC) o doble toque (móvil)
function initQuickChordInsertion() {
  const editor = document.getElementById("editor-rich-lyrics");
  if (!editor) return;
  
  // Manejador de doble clic para desktop
  editor.addEventListener("dblclick", (e) => {
    // Evitar si ya se hizo clic sobre un acorde
    if (e.target.closest(".editor-chord-badge")) return;
    
    let range;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);
      }
    }
    
    if (range && range.startContainer) {
      const container = range.startContainer;
      if (editor.contains(container)) {
        e.preventDefault(); // Evitar selección de palabra nativa
        
        const badge = document.createElement("span");
        badge.className = "editor-chord-badge";
        badge.setAttribute("contenteditable", "false");
        badge.setAttribute("data-chord", "C");
        badge.textContent = "[C]";
        
        range.insertNode(badge);
        
        // Limpiar selección
        window.getSelection().removeAllRanges();
        
        // Vincular eventos del nuevo acorde (clic derecho/drag)
        bindChordBadgeEvents();
        
        // Sincronizar
        const rawInput = document.getElementById("song-lyrics");
        if (rawInput) rawInput.value = serializeRichLyrics();
      }
    }
  });
  
  // Manejador de doble toque para mobile (evita zoom y selecciona el carácter)
  let lastTapTime = 0;
  editor// Permite a un usuario cancelar su solicitud de acceso pendiente
async function cancelPendingRequest() {
  state.requestedBandId = null;
  state.currentBandId = "KAWSAY";
  localStorage.setItem("coop_current_band_id", "KAWSAY");
  await loadSongsFromDB();
  await loadMembersFromDB();
  renderApp();
}

// Renderiza solicitudes pendientes (mockeado para Supabase)
async function renderPendingRequests() {
  const requestsList = document.getElementById("requests-list");
  if (!requestsList) return;
  requestsList.innerHTML = `<p style="color:var(--text-muted); font-size:12px; text-align:center; padding:10px;">No hay solicitudes pendientes.</p>`;
}

async function approveRequest(reqUid, email, name) {
  // Las uniones son directas en esta versión
}

}

