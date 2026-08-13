const CHROMATIC_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const ENHARMONICS = {
  "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb"
};

// Obtenemos el índice de una nota en la escala cromática (0-11)
function getNoteIndex(note) {
  let cleanNote = note;
  if (ENHARMONICS[note]) cleanNote = ENHARMONICS[note];
  // Manejo manual de Gb/F# según preferencia
  if (note === "F#") cleanNote = "Gb";
  return CHROMATIC_SCALE.indexOf(cleanNote);
}

// Suma un intervalo en semitonos a una nota base
function addInterval(rootNote, semitones) {
  const rootIdx = getNoteIndex(rootNote);
  if (rootIdx === -1) return rootNote; // Fallback
  const targetIdx = (rootIdx + semitones) % 12;
  return CHROMATIC_SCALE[targetIdx];
}

// Mapa de intervalos a semitonos
const INTERVALS_TO_SEMITONES = {
  "1": 0,
  "b2": 1, "2": 2, "#2": 3, "9": 2, "b9": 1, "#9": 3,
  "b3": 3, "3": 4,
  "4": 5, "#4": 6, "11": 5, "#11": 6,
  "b5": 6, "5": 7, "#5": 8,
  "b6": 8, "6": 9, "13": 9, "b13": 8,
  "b7": 10, "7": 11
};

// Calcula los intervalos activos según el estado del constructor
window.calculateChordIntervals = function(builder) {
  let intervals = new Set(["1"]); // La tónica siempre está

  // 1. Tríada (Quality)
  switch (builder.quality) {
    case "M": intervals.add("3"); intervals.add("5"); break;
    case "m": intervals.add("b3"); intervals.add("5"); break;
    case "dim": intervals.add("b3"); intervals.add("b5"); break;
    case "aug": intervals.add("3"); intervals.add("#5"); break;
    case "sus2": intervals.add("2"); intervals.add("5"); break;
    case "sus4": intervals.add("4"); intervals.add("5"); break;
    case "5": intervals.add("5"); break; // Power chord
  }

  // 2. 7ma (Extension)
  if (builder.extension !== "NONE") {
    if (builder.extension.includes("maj7")) intervals.add("7");
    else if (builder.extension.includes("m7") || builder.extension === "7") intervals.add("b7");
  }

  // 3. 9na
  if (builder.ninth !== "NONE") {
    if (builder.ninth.includes("maj9")) { intervals.add("7"); intervals.add("9"); }
    else if (builder.ninth === "9" || builder.ninth === "m9") { intervals.add("b7"); intervals.add("9"); }
    else if (builder.ninth === "b9") { intervals.add("b7"); intervals.add("b9"); }
    else if (builder.ninth === "#9") { intervals.add("b7"); intervals.add("#9"); }
  }

  // 4. 11va
  if (builder.eleventh !== "NONE") {
    if (builder.eleventh.includes("maj11")) { intervals.add("7"); intervals.add("9"); intervals.add("11"); }
    else if (builder.eleventh === "11" || builder.eleventh === "m11") { intervals.add("b7"); intervals.add("9"); intervals.add("11"); }
    else if (builder.eleventh === "#11") { intervals.add("b7"); intervals.add("9"); intervals.add("#11"); }
  }

  // 5. 13va
  if (builder.thirteenth !== "NONE") {
    if (builder.thirteenth.includes("maj13")) { intervals.add("7"); intervals.add("9"); intervals.add("11"); intervals.add("13"); }
    else if (builder.thirteenth === "13" || builder.thirteenth === "m13") { intervals.add("b7"); intervals.add("9"); intervals.add("11"); intervals.add("13"); }
    else if (builder.thirteenth === "b13") { intervals.add("b7"); intervals.add("9"); intervals.add("11"); intervals.add("b13"); }
  }

  // Convertir Set a array ordenado por semitonos
  let intervalsArray = Array.from(intervals);
  intervalsArray.sort((a, b) => INTERVALS_TO_SEMITONES[a] - INTERVALS_TO_SEMITONES[b]);
  
  return intervalsArray;
};

// Toma el estado del constructor y devuelve un array con los nombres de las notas absolutas
window.getChordNotesFromEngine = function(builder) {
  const rootNote = builder.root;
  const intervals = window.calculateChordIntervals(builder);
  
  let notes = intervals.map(inv => addInterval(rootNote, INTERVALS_TO_SEMITONES[inv]));
  
  if (builder.alteration !== "NONE") {
    const addNote = builder.alteration.replace("add", "").trim();
    if (!notes.includes(addNote)) notes.push(addNote);
  }

  if (builder.bass !== "NONE") {
    const bassNote = builder.bass.replace("/", "").trim();
    if (!notes.includes(bassNote)) notes.unshift(bassNote);
  }

  return notes;
};

// ==========================================
// MÁSTIL INTERACTIVO (FRETBOARD) LOGIC
// ==========================================

const GUITAR_STRINGS = [
  { id: 0, label: "e", root: "E" }, // 1st string
  { id: 1, label: "B", root: "B" }, // 2nd string
  { id: 2, label: "G", root: "G" }, // 3rd string
  { id: 3, label: "D", root: "D" }, // 4th string
  { id: 4, label: "A", root: "A" }, // 5th string
  { id: 5, label: "E", root: "E" }  // 6th string
];
const NUM_FRETS = 15;
let currentFretboardSelection = ["x", "x", "x", "x", "x", "x"]; // de 6ta a 1ra (índices 5 a 0 invertidos)

// Para que el string coincida con "x32010" (6ta a 1ra), los índices del arreglo actual:
// string 0 (1st e) -> pos 5 en string
// string 5 (6th E) -> pos 0 en string

window.renderInteractiveFretboard = function(activeNotes) {
  const container = document.getElementById("interactive-fretboard");
  if (!container) return;

  // Normalizamos las notas activas para comparar índices (evitar problemas con enarmónicos)
  const activeNoteIndices = activeNotes.map(n => getNoteIndex(n));
  const rootNoteIndex = getNoteIndex(activeNotes[0]); // Asumimos que la primera es la tónica/bajo

  let html = `<div style="display: flex; flex-direction: column; width: max-content; padding: 10px;">`;
  
  // Dibujar trastes guía arriba
  html += `<div style="display: flex; margin-left: 30px; margin-bottom: 5px;">`;
  for(let f=0; f<=NUM_FRETS; f++) {
    html += `<div style="width: 40px; text-align: center; color: #888; font-size: 10px;">${f === 0 ? 'Abierta' : f}</div>`;
  }
  html += `</div>`;

  GUITAR_STRINGS.forEach((strData) => {
    html += `<div style="display: flex; align-items: center; margin-bottom: 2px; position: relative;">`;
    // Label de la cuerda
    html += `<div style="width: 30px; color: #fff; font-size: 12px; font-weight: bold;">${strData.label}</div>`;
    
    // Línea de la cuerda (visual)
    html += `<div style="position: absolute; left: 30px; right: 0; height: ${1 + (strData.id * 0.5)}px; background: #666; top: 50%; transform: translateY(-50%); z-index: 0;"></div>`;

    const stringRootIdx = getNoteIndex(strData.root);

    for(let fret=0; fret<=NUM_FRETS; fret++) {
      const noteIdx = (stringRootIdx + fret) % 12;
      const noteName = CHROMATIC_SCALE[noteIdx];
      const isPartOfChord = activeNoteIndices.includes(noteIdx);
      const isRoot = noteIdx === rootNoteIndex;
      
      // Mapeo al formato x32010 (cuerda 6 es la posición 0, cuerda 1 es la 5)
      const inputCharPos = 5 - strData.id; 
      const isSelected = currentFretboardSelection[inputCharPos] === fret.toString();

      let dotStyle = `width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; z-index: 1; margin: 0 8px; transition: all 0.2s;`;
      
      if (isSelected) {
        dotStyle += `background: #00ff66; color: #000; font-weight: bold; border: 2px solid #fff; box-shadow: 0 0 10px #00ff66;`;
      } else if (isPartOfChord) {
        dotStyle += isRoot ? `background: rgba(0, 150, 255, 0.8); color: #fff; border: 1px solid #fff;` : `background: rgba(255, 255, 255, 0.2); color: #fff; border: 1px dashed rgba(255,255,255,0.5);`;
      } else {
        dotStyle += `background: rgba(0,0,0,0.5); color: #555; border: 1px solid transparent; opacity: 0.5;`;
      }

      html += `<div style="width: 40px; display: flex; justify-content: center;">
                 <div style="${dotStyle}" onclick="window.toggleFretboardNote(${inputCharPos}, '${fret}')" title="${noteName}">
                   ${isPartOfChord ? noteName : ''}
                 </div>
               </div>`;
    }
    
    // Botón para mutear cuerda
    const isMuted = currentFretboardSelection[5 - strData.id] === "x";
    html += `<div style="width: 30px; display: flex; justify-content: center; margin-left: 10px; z-index: 1;">
               <div style="width: 20px; height: 20px; color: ${isMuted ? '#ff3366' : '#666'}; cursor: pointer; font-weight: bold; text-align: center;" onclick="window.toggleFretboardNote(${5 - strData.id}, 'x')">X</div>
             </div>`;
             
    html += `</div>`;
  });
  html += `</div>`;

  container.innerHTML = html;
};

window.toggleFretboardNote = function(stringIndex, fretVal) {
  // stringIndex: 0 = 6th string (Low E), 5 = 1st string (High e)
  if (currentFretboardSelection[stringIndex] === fretVal) {
    // Deseleccionar (mutear)
    currentFretboardSelection[stringIndex] = "x";
  } else {
    currentFretboardSelection[stringIndex] = fretVal;
  }
  
  // Actualizar input del editor principal y refrescar gráfico SVG
  const input = document.getElementById("chord-string-input");
  if (input) {
    // currentFretboardSelection ej: ["x", "3", "2", "0", "1", "0"]
    // Como las notas mayores a 9 (10, 11, etc) no caben en 1 caracter simple, VexFlow y otros sistemas usan a veces A, B, C, pero en formato string de 6 chars solo soporta 0-9 y a-f.
    // Convertir >9 a letras minúsculas (10=a, 11=b, 12=c, 13=d, 14=e, 15=f)
    const formatted = currentFretboardSelection.map(v => {
      if (v === "x") return "x";
      let num = parseInt(v);
      if (num > 9) return String.fromCharCode(87 + num); // 10 -> 'a'
      return v;
    }).join("");
    
    input.value = formatted;
    
    // Forzar guardado y re-dibujo
    if (typeof window.saveCustomChord === "function") {
      window.saveCustomChord();
    }
  }
  
  // Refrescar fretboard
  const chordNotes = window.getChordNotesFromEngine(window.state.builder);
  window.renderInteractiveFretboard(chordNotes);
};

window.loadFretboardFromInput = function(val) {
  if (!val || val.length < 6) return;
  for(let i=0; i<6; i++) {
    let char = val.charAt(i).toLowerCase();
    if (char === "x") {
      currentFretboardSelection[i] = "x";
    } else {
      let code = char.charCodeAt(0);
      if (code >= 97 && code <= 102) { // a-f -> 10-15
        currentFretboardSelection[i] = (code - 87).toString();
      } else {
        currentFretboardSelection[i] = char;
      }
    }
  }
};

window.generateAutoVoicing = function(notes) {
  if (!notes || notes.length === 0) return "xxxxxx";
  
  // 1. Find the bass note (notes[0]) on the 6th or 5th string (fret 0-11).
  const bassNote = notes[0];
  const bassNoteIdx = getNoteIndex(bassNote);
  
  let bassString = -1; // 0 for 6th string, 1 for 5th string (using inputCharPos 0-5)
  let bassFret = -1;
  
  // Try 6th string first (Low E)
  const rootE = getNoteIndex("E");
  let fret6 = (bassNoteIdx - rootE + 12) % 12;
  // Try 5th string (A)
  const rootA = getNoteIndex("A");
  let fret5 = (bassNoteIdx - rootA + 12) % 12;
  
  // Prefer 6th string if frets are close, else prefer lower fret
  if (fret6 <= fret5 + 2) {
    bassString = 0; // 6th string (x32010 pos 0)
    bassFret = fret6;
  } else {
    bassString = 1; // 5th string
    bassFret = fret5;
  }
  
  let voicing = ["x", "x", "x", "x", "x", "x"];
  voicing[bassString] = bassFret.toString();
  
  const minFret = Math.max(0, bassFret - 2);
  const maxFret = Math.min(NUM_FRETS, bassFret + 3);
  
  const activeNoteIndices = notes.map(n => getNoteIndex(n));
  
  // Strings from low to high: E, A, D, G, B, e. (inputCharPos: 0, 1, 2, 3, 4, 5)
  const stringRoots = ["E", "A", "D", "G", "B", "E"];
  
  // For each remaining string, find a fret that belongs to the chord and is within minFret-maxFret
  for (let s = bassString + 1; s < 6; s++) {
    const sRootIdx = getNoteIndex(stringRoots[s]);
    
    // Try open string first
    if (activeNoteIndices.includes(sRootIdx)) {
      voicing[s] = "0";
      continue;
    }
    
    // Try frets in the span
    for (let f = Math.max(1, minFret); f <= maxFret; f++) {
      const noteIdx = (sRootIdx + f) % 12;
      if (activeNoteIndices.includes(noteIdx)) {
        voicing[s] = f.toString();
        break; // take first found
      }
    }
  }
  
  // Convert >9 to letters for vexflow compat
  return voicing.map(v => {
    if (v === "x") return "x";
    let num = parseInt(v);
    if (num > 9) return String.fromCharCode(87 + num);
    return v;
  }).join("");
};
