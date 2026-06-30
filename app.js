// Lógica principal de la aplicación Repertorio Co-op

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
  activeSectionIndex: null
};

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  loadLocalStorage();
  checkSharedSong();
  renderApp();
  initEventHandlers();
  
  // Seleccionar acorde inicial
  selectChord("C");
  
  // Inicializar manejadores de edición inline y editor de acordes
  initChordPickerHandlers();
  initInlineEditFields();
  
  // Inicializar popup de intervención arrastrable
  initInterventionPopupDraggable();
});

function loadLocalStorage() {
  const localSongs = localStorage.getItem("coop_songs");
  if (localSongs) {
    state.songs = JSON.parse(localSongs);
  } else {
    state.songs = [...DEFAULT_SONGS];
    saveLocalStorage();
  }
  
  const localFavChords = localStorage.getItem("coop_fav_chords");
  if (localFavChords) {
    state.favoritesChords = JSON.parse(localFavChords);
  }
  
  const localRecordings = localStorage.getItem("coop_recordings");
  if (localRecordings) {
    state.recorder.recordings = JSON.parse(localRecordings);
  }

  const localMembers = localStorage.getItem("coop_members");
  if (localMembers) {
    state.members = JSON.parse(localMembers);
  }
}

function saveLocalStorage() {
  localStorage.setItem("coop_songs", JSON.stringify(state.songs));
}

function saveMembers() {
  localStorage.setItem("coop_members", JSON.stringify(state.members));
}

function saveFavorites() {
  localStorage.setItem("coop_fav_chords", JSON.stringify(state.favoritesChords));
}

function saveRecordingsState() {
  localStorage.setItem("coop_recordings", JSON.stringify(state.recorder.recordings));
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
  list.innerHTML = state.members.map((m, i) => `
    <div style="display:flex; align-items:center; gap:12px; padding:10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius:10px;">
      <div style="width:16px; height:16px; border-radius:50%; background:${m.color}; box-shadow:0 0 8px ${m.color}; flex-shrink:0;"></div>
      <div style="flex:1;">
        <span style="font-weight:700; color:${m.color}; text-shadow:0 0 6px ${m.color}; font-size:14px;">${m.name}</span>
        <span style="color:var(--text-muted); font-size:11px; margin-left:8px;">${m.role || ""}</span>
      </div>
      <button onclick="removeBandMember(${i})" style="background:rgba(255,51,75,0.12); border:1px solid rgba(255,51,75,0.3); color:#ff334b; border-radius:6px; padding:4px 10px; cursor:pointer; font-size:11px;">✕</button>
    </div>
  `).join("");
}

// Agregar un integrante
function addBandMember() {
  const nameInput = document.getElementById("new-member-name");
  const roleInput = document.getElementById("new-member-role");
  const activeSwatchEl = document.querySelector("#member-color-picker .color-swatch.active");
  
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) { alert("Ingresa el nombre del integrante."); return; }
  if (state.members.find(m => m.name.toLowerCase() === name.toLowerCase())) {
    alert("Ya existe un integrante con ese nombre.");
    return;
  }
  
  const color = activeSwatchEl ? activeSwatchEl.getAttribute("data-color") : "#00e5ff";
  const role = roleInput ? roleInput.value.trim() : "";
  
  state.members.push({ name, role, color });
  saveMembers();
  
  if (nameInput) nameInput.value = "";
  if (roleInput) roleInput.value = "";
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
      const song = state.songs.find(s => s.id === state.activeSongId);
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
    const song = state.songs.find(s => s.id === state.activeSongId);
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
}

// --- EVENTOS Y CONTROLADORES ---
function initEventHandlers() {
  // Navegación
  document.querySelectorAll(".nav-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const targetTab = pill.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });
  
  // Filtros de Setlist
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
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
  
  // Convertir letra tradicional
  const btnConvert = document.getElementById("btn-convert-lyrics");
  if (btnConvert) {
    btnConvert.addEventListener("click", () => {
      const richEditor = document.getElementById("editor-rich-lyrics");
      const currentRaw = serializeRichLyrics();
      if (richEditor && currentRaw.trim() !== "") {
        const converted = convertTraditionalToBracket(currentRaw);
        richEditor.innerHTML = parseTextToRichLyrics(converted);
        document.getElementById("song-lyrics").value = converted;
        bindChordBadgeEvents();
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
  
  // Cerrar paneles móviles al cambiar de pestaña
  closeMobileDrawers();
  
  renderNav();
}

// --- VISTA 1: REPERTORIO ---
function renderSetlist() {
  const grid = document.getElementById("setlist-grid");
  if (!grid) return;
  
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
      <div class="song-card" onclick="openSongInRehearsal('${song.id}')">
        <div class="song-card-bg" style="background-image: url('${song.image}')"></div>
        <span class="song-status-badge ${statusClass}">${statusText}</span>
        
        <div class="song-card-content">
          <div class="card-top">
            <span class="last-edit">LAST EDIT: ${song.lastEdit.toUpperCase()}</span>
            <span class="artist-tag">${song.artist}</span>
          </div>
          
          <div class="song-title-group">
            <h3 class="song-card-title">${song.title}</h3>
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
function openSongInRehearsal(songId) {
  state.activeSongId = songId;
  const song = state.songs.find(s => s.id === songId);
  
  if (song) {
    state.metronome.bpm = song.bpm;
    state.metronome.beatsPerMeasure = parseInt(song.timeSig.split("/")[0]) || 4;
    state.metronome.beatUnit = parseInt(song.timeSig.split("/")[1]) || 4;
  }
  
  // Cargar estado de la caja de ritmos desde la memoria del tema
  if (song && song.hasOwnProperty("drumEnabled")) {
    state.drumMachine.enabled = song.drumEnabled;
  } else {
    state.drumMachine.enabled = false;
  }
  
  if (song && song.drumPattern) {
    state.drumMachine.selectedPattern = song.drumPattern;
  } else {
    state.drumMachine.selectedPattern = "rock";
  }
  
  const steps = getSequencerStepsCount();
  if (song && song.drumGrid) {
    state.drumMachine.grid = JSON.parse(JSON.stringify(song.drumGrid));
    ensureSequencerGridSize(steps);
  } else {
    state.drumMachine.grid = buildDrumPatternGrid(state.drumMachine.selectedPattern, steps);
  }
  
  switchTab("rehearsal");
  renderApp();
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
  const lyrics = document.getElementById("song-lyrics").value;
  
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
  
  if (songId) {
    // Editar existente
    const index = state.songs.findIndex(s => s.id === songId);
    if (index !== -1) {
      state.songs[index] = {
        ...state.songs[index],
        title, artist, bpm, key, timeSig, status, rhythm, lyrics,
        lastEdit: "hace unos instantes"
      };
    }
  } else {
    // Crear nueva
    const newSong = {
      id: "s_" + Date.now(),
      title, artist, bpm, key, timeSig, status, rhythm, lyrics,
      lastEdit: "creado recién",
      image: "./assets/yesterday.png" // Por defecto
    };
    state.songs.unshift(newSong);
  }
  
  saveLocalStorage();
  document.getElementById("modal-add-song").classList.remove("open");
  renderApp();
}

function renderRehearsalRoom() {
  const room = document.getElementById("rehearsal-room-content");
  if (!room) return;
  
  if (!state.activeSongId) {
    room.innerHTML = `
      <div class="empty-rehearsal-state glass" style="grid-column: 1/-1;">
        <div class="empty-icon">🎸</div>
        <h3>Sala de Ensayo</h3>
        <p>Selecciona un tema de tu setlist en la pestaña Principal para comenzar a ensayar con metrónomo y letras sincronizadas.</p>
        <button class="btn btn-primary" onclick="switchTab('repertorio')">Ir al Setlist</button>
      </div>
    `;
    return;
  }
  
  const song = state.songs.find(s => s.id === state.activeSongId);
  if (!song) return;
  
  // Renderizar Estructura de la Sala de Ensayo (Layout de dos columnas principales + Transport Bar inferior)
  const labelsText = state.horizontalLabels ? "Etiquetas: ↔️ Horizontales" : "Etiquetas: ↕️ Verticales";
  const fullscreenText = document.body.classList.contains("fullscreen-mode") ? "📺 Salir" : "📺 Pantalla Completa";

  room.innerHTML = `
    <!-- CABECERA DINÁMICA DE LA CANCIÓN ACTIVA (Estilo Stitch) -->
    <div class="rehearsal-header">
      <div class="header-left">
        <h1 class="rehearsal-song-title">${song.title}</h1>
        <div class="rehearsal-badges">
          <span class="badge badge-bpm">${song.bpm} BPM</span>
          <span class="badge badge-time">${song.timeSig}</span>
          <span class="badge badge-key" onclick="openKeyInDict('${song.key}')">${song.key}</span>
        </div>
      </div>
      
      <div class="header-center" style="display: flex; justify-content: center; align-items: center;">
        <div class="mini-metronome-status" style="display: flex; align-items: center; gap: 16px; background: rgba(2, 6, 23, 0.4); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.04);">
          <div class="mini-leds-bar" id="mini-beats-indicator" style="display: flex; gap: 6px;">
            ${Array.from({ length: state.metronome.beatsPerMeasure }).map((_, i) => `<div class="mini-beat-dot" style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); transition: all 0.1s;"></div>`).join("")}
          </div>
        </div>
      </div>
      
      <div class="header-right" style="display: flex; gap: 12px; align-items: center;">
        <button id="btn-toggle-global-labels" class="btn btn-secondary btn-pill" onclick="toggleGlobalLabelsLayout()" style="border-radius: 20px; font-size: 11px;">
          ${labelsText}
        </button>
        <button class="btn btn-secondary btn-pill btn-toggle-fullscreen" onclick="toggleFullscreenRehearsal()" style="border-radius: 20px; font-size: 11px;">
          ${fullscreenText}
        </button>
        <button class="btn btn-outline-cyan btn-pill" onclick="shareActiveSong()" style="border-radius: 20px;">
          🔗 Invitar
        </button>
        <button id="btn-record-header" class="btn btn-primary btn-pill ${state.recorder.isRecording ? 'recording' : ''}" onclick="toggleHeaderRecording()" style="border-radius: 20px;">
          <span class="record-dot-indicator" style="display: inline-flex; align-items: center; margin-right: 4px;"><span class="pulse-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; display: inline-block;"></span></span> ${state.recorder.isRecording ? 'Detener Ensayo' : 'Grabar Ensayo'}
        </button>
      </div>
    </div>

    <!-- CUERPO DE LA SALA DE ENSAYOS: DOS COLUMNAS -->
    <div class="rehearsal-body">
      <!-- Lado Izquierdo: Visor de Letra y Acordes -->
      <div class="lyrics-viewer-container glass ${state.horizontalLabels ? 'horizontal-labels' : ''}">
        <div class="lyrics-viewer-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 12px 20px;">
          <div class="lyrics-song-info" style="display: flex; align-items: center; gap: 8px;">
            <span class="section-label" style="font-family: var(--font-sans); font-size: 11px; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap;">LETRA Y ACORDES</span>
          </div>
          
          <!-- Legend of members and colors -->
          <div class="rehearsal-members-legend" style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-left: 12px; margin-right: auto;">
            ${state.members.map(m => `
              <span class="legend-badge" style="display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: ${m.color}; background: ${m.color}15; border: 1px solid ${m.color}35; padding: 3px 8px; border-radius: 9999px; white-space: nowrap;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${m.color}; display: inline-block;"></span>
                ${m.name}
              </span>
            `).join("")}
          </div>

          <div class="scroll-controls">
            <button class="btn btn-secondary" onclick="editActiveSong()" style="padding: 6px 12px; font-size: 11px;">
              Editar Letra ✏️
            </button>
          </div>
        </div>
        
        <div id="lyrics-scroll-area" class="lyrics-scroll-area">
          ${renderLyricsBySections(song)}
        </div>
      </div>
      
      <!-- Lado Derecho: Metrónomo y Grabaciones del Tema -->
      <div class="sidebar-panel">
        <!-- Metrónomo Stitch Style -->
        <div class="panel-card glass metronome-widget">
          <div class="metronome-header">
            <span class="metronome-title">METRONOME</span>
            <button class="btn-save-params" onclick="saveMetronomeParamsToSong()">Fijar</button>
          </div>
          
          <!-- Contenedor del Dial y Controles Laterales -->
          <div class="metronome-dial-area">
            <!-- Columna Izquierda: Time Signature Selector Vertical -->
            <div class="time-signatures-vertical">
              <button class="time-sig-btn ${state.metronome.beatsPerMeasure === 4 && (state.metronome.beatUnit || 4) === 4 ? 'active' : ''}" onclick="changeTimeSignature('4/4')">4/4</button>
              <button class="time-sig-btn ${state.metronome.beatsPerMeasure === 3 && (state.metronome.beatUnit || 4) === 4 ? 'active' : ''}" onclick="changeTimeSignature('3/4')">3/4</button>
              <button class="time-sig-btn ${state.metronome.beatsPerMeasure === 6 && (state.metronome.beatUnit || 4) === 8 ? 'active' : ''}" onclick="changeTimeSignature('6/8')">6/8</button>
              
              <!-- Selector de Compás Libre -->
              <div class="custom-time-sig-controls" style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
                <span style="font-size: 8px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; text-align: center;">Libre</span>
                <div style="display: flex; gap: 2px; align-items: center;">
                  <input type="number" id="custom-beats-num" min="1" max="16" value="${state.metronome.beatsPerMeasure}" style="width: 28px; height: 22px; padding: 0; text-align: center; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.3); color: #fff; font-family: var(--font-mono); font-size: 11px;">
                  <span style="color: var(--text-muted); font-size: 11px;">/</span>
                  <select id="custom-beats-unit" style="width: 34px; height: 22px; padding: 0; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.3); color: #fff; font-size: 10px; text-align: center;">
                    <option value="4" ${(state.metronome.beatUnit || 4) === 4 ? 'selected' : ''}>4</option>
                    <option value="8" ${(state.metronome.beatUnit || 4) === 8 ? 'selected' : ''}>8</option>
                    <option value="16" ${(state.metronome.beatUnit || 4) === 16 ? 'selected' : ''}>16</option>
                  </select>
                </div>
                <button type="button" class="btn btn-secondary" onclick="applyCustomTimeSig()" style="padding: 2px; height: 20px; font-size: 9px; width: 100%; border-radius: 4px; justify-content: center; align-items: center;">✓ Fijar</button>
              </div>
            </div>
            
            <!-- Columna Central: LEDs y Dial con +/- a los lados -->
            <div class="metronome-center-column">
              <div class="metronome-leds-bar" id="beats-indicator">
                ${Array.from({ length: state.metronome.beatsPerMeasure }).map((_, i) => `<div class="beat-dot"></div>`).join("")}
              </div>
              
              <div style="display: flex; align-items: center; gap: 14px;">
                <button class="bpm-adjust-btn-large" onclick="updateBpm(state.metronome.bpm - 1)" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border-color); background: rgba(30, 41, 59, 0.4); color: var(--text-primary); font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition);">-</button>
                
                <div class="metronome-visual-container" id="metronome-dial-container" style="cursor: pointer;">
                  <div id="metronome-ring" class="metronome-ring"></div>
                  <div class="metronome-center" id="metronome-dial-center" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span id="bpm-number" class="metronome-bpm-display" style="font-size: 26px;">${state.metronome.bpm}</span>
                    <button type="button" class="metronome-tap-btn" id="btn-tap-tempo" onclick="event.stopPropagation(); handleTapTempo();">TAP</button>
                  </div>
                </div>
                
                <button class="bpm-adjust-btn-large" onclick="updateBpm(state.metronome.bpm + 1)" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border-color); background: rgba(30, 41, 59, 0.4); color: var(--text-primary); font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition);">+</button>
              </div>
            </div>
            
            <!-- Columna Derecha: Volume Slider Vertical -->
            <div class="metronome-volume-column">
              <div class="volume-slider-vertical-container">
                <input type="range" id="metronome-volume-slider" min="0" max="100" value="${state.metronome.volume * 100}" orient="vertical">
              </div>
              <span class="volume-icon">🔊</span>
            </div>
          </div>
          
          <!-- Botón de Loop de Metrónomo Grande -->
          <button id="btn-loop-metronome-large" class="btn ${state.metronome.isPlaying ? 'btn-primary' : 'btn-secondary'}" onclick="toggleMetronome()" style="width: 100%; margin-top: 16px;">
            ${state.metronome.isPlaying ? '⏸ Detener Metrónomo' : '▶ Iniciar Metrónomo'}
          </button>
        </div>
        
        <!-- Caja de Ritmos Widget (Premium) -->
        <div class="panel-card glass drum-machine-widget" style="margin-top: 20px;">
          <div class="drum-machine-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="metronome-title" style="font-size: 11px;">CAJA DE RITMOS</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 9px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Activo</span>
              <label class="switch" style="position: relative; display: inline-block; width: 34px; height: 20px; margin: 0;">
                <input type="checkbox" id="drum-machine-toggle" ${state.drumMachine.enabled ? 'checked' : ''} onchange="toggleDrumMachine(this.checked)" style="opacity: 0; width: 0; height: 0;">
                <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 20px; border: 1px solid var(--border-color);"></span>
              </label>
            </div>
          </div>

          <!-- Selección de Patrón Rápido -->
          <div class="pattern-presets" style="display: flex; gap: 4px; margin-bottom: 14px; width: 100%;">
            <button class="btn preset-btn ${state.drumMachine.selectedPattern === 'rock' ? 'active' : 'btn-secondary'}" onclick="applyDrumPattern('rock')" style="flex: 1; padding: 4px 0 !important; font-size: 9px !important; border-radius: 4px;">Rock</button>
            <button class="btn preset-btn ${state.drumMachine.selectedPattern === 'funk' ? 'active' : 'btn-secondary'}" onclick="applyDrumPattern('funk')" style="flex: 1; padding: 4px 0 !important; font-size: 9px !important; border-radius: 4px;">Funk</button>
            <button class="btn preset-btn ${state.drumMachine.selectedPattern === 'reggae' ? 'active' : 'btn-secondary'}" onclick="applyDrumPattern('reggae')" style="flex: 1; padding: 4px 0 !important; font-size: 9px !important; border-radius: 4px;">Reggae</button>
            <button class="btn preset-btn clear-preset ${state.drumMachine.selectedPattern === 'clear' ? 'active' : 'btn-secondary'}" onclick="applyDrumPattern('clear')" style="flex: 1; padding: 4px 0 !important; font-size: 9px !important; border-radius: 4px; ${state.drumMachine.selectedPattern !== 'clear' ? 'border-color: rgba(255,0,127,0.3); color: #ff007f;' : ''}">Clear</button>
          </div>

          <!-- Grilla de Secuenciador -->
          <div class="sequencer-grid" style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
            ${(function() {
              const steps = getSequencerStepsCount();
              ensureSequencerGridSize(steps);
              return ['kick', 'snare', 'hihat'].map(inst => {
                const label = inst === 'kick' ? 'BOM' : inst === 'snare' ? 'CAJ' : 'HH';
                const labelColor = inst === 'kick' ? 'var(--neon-orange)' : inst === 'snare' ? 'var(--neon-lime)' : 'var(--neon-cyan)';
                return `
                  <div class="sequencer-row" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 800; width: 28px; color: ${labelColor};">${label}</span>
                    <div class="steps-row" style="display: flex; gap: 4px; flex: 1;">
                      ${Array.from({ length: steps }).map((_, stepIdx) => {
                        const isActive = state.drumMachine.grid[inst][stepIdx];
                        const activeClass = isActive ? 'active' : '';
                        return `
                          <button class="step-btn ${activeClass}" 
                                  data-inst="${inst}" 
                                  data-step="${stepIdx}" 
                                  onclick="toggleSequencerStep('${inst}', ${stepIdx}, this)" 
                                  style="flex: 1; height: 22px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.35); cursor: pointer; position: relative; transition: all 0.1s;">
                          </button>
                        `;
                      }).join("")}
                    </div>
                  </div>
                `;
              }).join("");
            })()}
          </div>

          <!-- Indicador de Paso Actual (Luces de reproducción) -->
          <div class="step-indicators-bar" style="display: flex; margin-top: 6px; padding-left: 36px; gap: 4px; width: 100%;">
            ${Array.from({ length: getSequencerStepsCount() }).map((_, stepIdx) => `
              <div class="seq-step-dot" id="seq-dot-${stepIdx}" style="flex: 1; height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; transition: all 0.1s;"></div>
            `).join("")}
          </div>
        </div>
        
        <!-- Listado de Ensayos Grabados del Tema -->
        <div class="panel-card glass" style="margin-top: 20px;">
          <div class="panel-title">
            <span>📁</span> Grabaciones del Tema
          </div>
          <div class="recordings-list" id="recordings-list">
            ${renderRecordingsList(song.id)}
          </div>
        </div>
      </div>
    </div>

    <!-- BARRA DE TRANSPORTE FIJA INFERIOR -->
    <div class="transport-bar glass">
      <!-- Izquierda: Grabadora -->
      <div class="transport-left">
        <button id="btn-record-transport" class="btn-transport-record ${state.recorder.isRecording ? 'recording' : ''}" title="${state.recorder.isRecording ? 'Detener Grabación' : 'Grabar Sesión'}">
          <span class="record-dot"></span>
        </button>
        <div class="recording-time" id="transport-record-timer">00:00</div>
        <div class="mini-waveform-container">
          <canvas id="transport-wave-canvas" class="transport-visualizer"></canvas>
        </div>
      </div>
      
      <!-- Centro: Controles de Playback (Scroll) -->
      <div class="transport-center">
        <button id="btn-scroll-prev" class="btn-transport-nav" title="Volver al inicio">⏮</button>
        <button id="btn-scroll-play" class="btn-transport-play ${state.autoScroll.isActive ? 'active' : ''}" title="${state.autoScroll.isActive ? 'Pausar Desplazamiento' : 'Iniciar Desplazamiento'}">
          <span class="play-icon">${state.autoScroll.isActive ? '⏸' : '▶'}</span>
        </button>
        <button id="btn-scroll-next" class="btn-transport-nav" title="Ir al final">⏭</button>
      </div>
      
      <!-- Derecha: Estado rápido e instrumentación -->
      <div class="transport-right">
        <div class="metronome-quick-info">
          <span>⏱</span>
          <span id="transport-bpm-display">${state.metronome.bpm} BPM</span>
        </div>
        <button id="btn-play-metronome" class="btn-transport-tool ${state.metronome.isPlaying ? 'active' : ''}" title="${state.metronome.isPlaying ? 'Detener Metrónmono' : 'Iniciar Metrónomo'}">
          ⏰
        </button>
        <button id="btn-toggle-metronome-sound" class="btn-transport-tool ${!state.metronome.isMuted ? 'active' : ''}" title="${state.metronome.isMuted ? 'Activar Sonido' : 'Silenciar'}">
          ${state.metronome.isMuted ? '🔇' : '🔊'}
        </button>
        <button id="btn-share-song" class="btn-transport-tool" title="Compartir Tema">
          🔗
        </button>
      </div>
    </div>
  `;
  
  // Re-enlazar eventos dinámicos que se dibujaron
  rebindRehearsalEvents();
  
  // Si estaba grabando, inicializar el canvas
  if (state.recorder.isRecording) {
    visualizeAudioWave();
  } else {
    // Dibujar línea neutra en el canvas
    clearAudioCanvas();
  }
}

function rebindRehearsalEvents() {
  // Volume Slider
  const volSlider = document.getElementById("metronome-volume-slider");
  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      state.metronome.volume = parseFloat(e.target.value) / 100;
    });
  }

  // Dial dragging to adjust BPM (Physical knob simulation) + click for Tap Tempo
  const dial = document.getElementById("metronome-dial-container");
  if (dial) {
    let isDragging = false;
    let dragMoved = false;
    let startY = 0;
    let startBpm = 120;
    
    dial.style.cursor = "ns-resize";
    
    dial.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragMoved = false;
      startY = e.clientY;
      startBpm = state.metronome.bpm;
      e.preventDefault();
    });
    
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      if (Math.abs(deltaY) > 2) {
        dragMoved = true;
      }
      const bpmChange = Math.round(deltaY / 2); // sensitivity
      let newBpm = startBpm + bpmChange;
      if (newBpm < 40) newBpm = 40;
      if (newBpm > 240) newBpm = 240;
      updateBpm(newBpm);
    });
    
    dial.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        if (!dragMoved) {
          handleTapTempo();
        }
      }
    });
  }

  // Transport controls (Repurposed for audio recordings playback)
  const btnScrollPlay = document.getElementById("btn-scroll-play");
  if (btnScrollPlay) btnScrollPlay.addEventListener("click", togglePlaybackTransport);
  
  const btnScrollPrev = document.getElementById("btn-scroll-prev");
  if (btnScrollPrev) btnScrollPrev.addEventListener("click", () => skipPlaybackTransport(-1));
  
  const btnScrollNext = document.getElementById("btn-scroll-next");
  if (btnScrollNext) btnScrollNext.addEventListener("click", () => skipPlaybackTransport(1));

  // Metrónomo play control
  const btnPlayMetronome = document.getElementById("btn-play-metronome");
  if (btnPlayMetronome) {
    btnPlayMetronome.addEventListener("click", toggleMetronome);
  }

  // Recording transport control
  const btnRecordTransport = document.getElementById("btn-record-transport");
  if (btnRecordTransport) {
    btnRecordTransport.addEventListener("click", () => {
      if (state.recorder.isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    });
  }

  // Metrónomo sound mute toggle
  const btnMuteSound = document.getElementById("btn-toggle-metronome-sound");
  if (btnMuteSound) {
    btnMuteSound.addEventListener("click", toggleMetronomeMute);
  }

  // Share song button
  const btnShare = document.getElementById("btn-share-song");
  if (btnShare) btnShare.addEventListener("click", shareActiveSong);
}

function changeTimeSignature(sig) {
  state.metronome.beatsPerMeasure = parseInt(sig.split("/")[0]) || 4;
  state.metronome.beatUnit = parseInt(sig.split("/")[1]) || 4;
  if (state.activeSongId) {
    const song = state.songs.find(s => s.id === state.activeSongId);
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
      const song = state.songs.find(s => s.id === state.activeSongId);
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
  
  const song = state.songs.find(s => s.id === state.activeSongId);
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
  const song = state.songs.find(s => s.id === state.activeSongId);
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
  const song = state.songs.find(s => s.id === state.activeSongId);
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
        const songName = state.activeSongId ? state.songs.find(s => s.id === state.activeSongId).title : "Ensayo Libre";
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
  const activeSong = state.songs.find(s => s.id === state.activeSongId);
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

// Regex para validar si un token luce como un acorde
const CHORD_TOKEN_REGEX = /^[A-G][#b]?(m|min|maj|dim|aug|sus|add|maj7|m7|7|9|11|13|m7b5|dim7)?(\d)?(\/[A-G][#b]?)?$/i;

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
    const converted = convertTraditionalToBracket(lyricsText.trim());
    if (lyricsField) {
      lyricsField.value = converted;
    }
    if (richEditor) {
      richEditor.innerHTML = parseTextToRichLyrics(converted);
      bindChordBadgeEvents();
    }
  };
  
  reader.readAsText(file);
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
      return `<span class="editor-chord-badge" data-chord="${chord}">[${chord}]</span>`;
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
  const song = state.songs.find(s => s.id === state.activeSongId);
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

function toggleGlobalLabelsLayout() {
  state.horizontalLabels = !state.horizontalLabels;
  
  // Actualizar la clase en el contenedor
  const container = document.querySelector(".lyrics-viewer-container");
  if (container) {
    if (state.horizontalLabels) {
      container.classList.add("horizontal-labels");
    } else {
      container.classList.remove("horizontal-labels");
    }
  }
  
  // Actualizar texto del botón en la cabecera
  const btn = document.getElementById("btn-toggle-global-labels");
  if (btn) {
    btn.textContent = state.horizontalLabels ? "Etiquetas: ↔️ Horizontales" : "Etiquetas: ↕️ Verticales";
  }
}

function toggleFullscreenRehearsal() {
  const body = document.body;
  const isCurrentlyFullscreen = body.classList.contains("fullscreen-mode");
  
  if (isCurrentlyFullscreen) {
    body.classList.remove("fullscreen-mode");
    
    // Cerrar los FABs si estaban abiertos
    const fabContainer = document.getElementById("rehearsal-fab-container");
    if (fabContainer) fabContainer.classList.remove("expanded");
    
    const recordFab = document.getElementById("rehearsal-record-fab-container");
    if (recordFab) recordFab.classList.remove("expanded");
  } else {
    body.classList.add("fullscreen-mode");
    
    // Si metrónomo o grabación están activos en el estado, sincronizar botones del FAB
    const fabBtnMetronome = document.getElementById("fab-btn-metronome");
    if (fabBtnMetronome) {
      if (state.metronome.isPlaying) {
        fabBtnMetronome.classList.remove("btn-secondary");
        fabBtnMetronome.classList.add("btn-primary");
        fabBtnMetronome.textContent = "⏸ Metrónomo";
      } else {
        fabBtnMetronome.classList.remove("btn-primary");
        fabBtnMetronome.classList.add("btn-secondary");
        fabBtnMetronome.textContent = "▶ Metrónomo";
      }
    }
    
    const fabBtnRecord = document.getElementById("fab-btn-record");
    if (fabBtnRecord) {
      if (state.recorder.isRecording) {
        fabBtnRecord.classList.remove("btn-secondary");
        fabBtnRecord.classList.add("btn-primary");
        fabBtnRecord.textContent = "⏹ Detener Grab.";
      } else {
        fabBtnRecord.classList.remove("btn-primary");
        fabBtnRecord.classList.add("btn-secondary");
        fabBtnRecord.textContent = "🎙️ Grabar";
      }
    }
    
    const fabBpmDisplay = document.getElementById("fab-bpm-display");
    if (fabBpmDisplay) {
      fabBpmDisplay.textContent = state.metronome.bpm;
    }
  }
  
  // Actualizar todos los botones de toggle fullscreen
  const btns = document.querySelectorAll(".btn-toggle-fullscreen");
  btns.forEach(btn => {
    btn.textContent = body.classList.contains("fullscreen-mode") ? "📺 Salir" : "📺 Pantalla Completa";
  });
}

function toggleSectionLoop(idx) {
  // Encontrar todas las tarjetas de estrofas
  const cards = document.querySelectorAll(".lyrics-section-card");
  const targetCard = document.getElementById(`section-card-${idx}`);
  
  if (!targetCard) return;
  
  const isCurrentlyActive = targetCard.classList.contains("active");
  
  // Quitar el estado activo de todas primero
  cards.forEach((card, cardIdx) => {
    card.classList.remove("active");
    const btn = card.querySelector(".btn-loop-section");
    if (btn) {
      btn.classList.remove("active");
      btn.textContent = "Loop";
    }
  });
  
  if (!isCurrentlyActive) {
    state.activeSectionIndex = idx;
    targetCard.classList.add("active");
    const btn = targetCard.querySelector(".btn-loop-section");
    if (btn) {
      btn.classList.add("active");
      btn.textContent = "Loop";
    }
    
    // Hacer scroll automático al inicio de la estrofa seleccionada
    const scrollArea = document.getElementById("lyrics-scroll-area");
    if (scrollArea) {
      scrollArea.scrollTo({
        top: targetCard.offsetTop,
        behavior: 'smooth'
      });
    }
  } else {
    // Si ya estaba activa, se desactiva el loop por completo
    state.activeSectionIndex = null;
  }
}

function toggleFabMenu() {
  const container = document.getElementById("rehearsal-fab-container");
  if (container) {
    container.classList.toggle("expanded");
  }
}

function toggleRecordFabMenu() {
  const container = document.getElementById("rehearsal-record-fab-container");
  if (container) {
    container.classList.toggle("expanded");
  }
}

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
