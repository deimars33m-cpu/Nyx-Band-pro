import React, { useState, useEffect, useRef, useMemo } from "react";
import "./HojaEnsayo.css";

// ============================================================
// 1. INTERFACES DE DATOS (TypeScript)
// ============================================================

export interface AcordeEnLirica {
  id: string;
  acorde: string;              // "Em", "C", "G", etc.
  posicionPalabra: number;     // 0 = primera palabra, 1 = segunda, etc.
  posicionCaracter: number;    // Posición exacta en caracteres
}

export interface LineaDeLirica {
  id: string;
  texto: string;               // "Bajo el cielo eléctrico caminamos"
  acordes: AcordeEnLirica[];   // Array de acordes posicionados
  seccionId: string;           // Referencia a qué sección pertenece
}

export interface Seccion {
  id: string;
  nombre: string;              // "Intro", "Verso 1", "Estribillo", etc.
  tipo: "intro" | "verso" | "estribillo" | "puente" | "pre-coro" | "solo" | "outro";
  numeracion?: number;
  lineaInicio: number;         // Índice de la primera línea en el array de acordes
  lineaFin: number;            // Índice de la última línea
  notas?: string;
}

export interface Participacion {
  id: string;
  integranteId: string;        // Ref a Integrante
  seccionId: string;           // En qué sección participa
  instrumento: string;         // "voz", "bajo", "coro", etc.
  notas?: string;
}

export interface Integrante {
  id: string;
  nombre: string;
  instrumento: string;
  disponibilidad?: boolean;
  colorAvatar: string;         // Hex para círculo personalizado
  iniciales: string;           // "CA", "RO", etc.
}

export interface Cancion {
  id: string;
  titulo: string;
  artistaOriginal: string;
  tonalidad: string;
  bpm: number;
  duracionSegundos: number;
  genero: string;
  nivelDificultad: 1 | 2 | 3 | 4 | 5;
  estado: "preparacion" | "lista" | "archivada";
  fechaCreacion: Date;
  ultimaEdicion: Date;
  rutaAudio?: string;
  acordes: LineaDeLirica[];
  estructura: Seccion[];
  participaciones: Participacion[];
}

// INTEGRANTES MOCK CONSTANTES
const INTEGRANTES_MOCK: Integrante[] = [
  { id: "int-camila", nombre: "Camila", instrumento: "Voz", colorAvatar: "#FF3EA5", iniciales: "CA" },
  { id: "int-rodrigo", nombre: "Rodrigo", instrumento: "Coro", colorAvatar: "#FF3EA5", iniciales: "RO" },
  { id: "int-julian", nombre: "Julián", instrumento: "Bajo", colorAvatar: "#29F0D6", iniciales: "JU" },
  { id: "int-male", nombre: "Male", instrumento: "Batería", colorAvatar: "#FFD23F", iniciales: "MA" }
];

// ============================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================

interface HojaEnsayoProps {
  cancion: Cancion;
}

export function HojaEnsayo({ cancion }: HojaEnsayoProps) {
  // --- ESTADO PRINCIPAL ---
  const [seccionActivaId, setSeccionActivaId] = useState<string>("");
  const [lineaActivaIndex, setLineaActivaIndex] = useState<number>(0);
  const [enReproduccion, setEnReproduccion] = useState<boolean>(false);
  const [tiempoActual, setTiempoActual] = useState<number>(0);
  const [autoscrollActivo, setAutoscrollActivo] = useState<boolean>(true);
  const [transposeOffset, setTransposeOffset] = useState<number>(0);
  
  // UI States
  const [mostrarTransposer, setMostrarTransposer] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Referencias para DOM & Scroll
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userScrollingRef = useRef<boolean>(false);

  // Inicialización de sección por defecto
  useEffect(() => {
    if (cancion && cancion.estructura.length > 0) {
      setSeccionActivaId(cancion.estructura[0].id);
      setLineaActivaIndex(0);
      setTiempoActual(0);
      setEnReproduccion(false);
      setTransposeOffset(0);
    }
  }, [cancion]);

  // --- ALGORITMO DE TRANSPOSICIÓN ---
  const notasCromáticas = useMemo(() => [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ], []);

  const flatMap: { [key: string]: string } = useMemo(() => ({
    "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"
  }), []);

  const transposeChord = (chord: string, offset: number): string => {
    if (offset === 0) return chord;
    
    // Regex para capturar la nota raíz (incluyendo alteración) y el sufijo/extensión
    const match = chord.match(/^([A-G]#?|[A-G]b?)(.*)$/);
    if (!match) return chord;
    
    const root = match[1];
    const suffix = match[2];
    
    const normalizedRoot = flatMap[root] || root;
    const index = notasCromáticas.indexOf(normalizedRoot);
    if (index === -1) return chord;
    
    let newIndex = (index + offset) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return notasCromáticas[newIndex] + suffix;
  };

  // Tonalidad actual transpuesta
  const tonalidadTranspuesta = useMemo(() => {
    return transposeChord(cancion.tonalidad, transposeOffset);
  }, [cancion.tonalidad, transposeOffset, notasCromáticas, flatMap]);

  // --- NAVEGACIÓN Y SCROLL ---
  const scrollToLine = (index: number) => {
    const el = lineRefs.current[index];
    if (el && scrollAreaRef.current) {
      const container = scrollAreaRef.current;
      const offsetTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: "smooth"
      });
    }
  };

  const handleTabClick = (seccionId: string) => {
    const seccion = cancion.estructura.find(s => s.id === seccionId);
    if (seccion) {
      setSeccionActivaId(seccionId);
      setLineaActivaIndex(seccion.lineaInicio);
      scrollToLine(seccion.lineaInicio);
      
      // Sincronizar tiempo de audio aproximado al inicio de la sección
      const ratio = seccion.lineaInicio / cancion.acordes.length;
      setTiempoActual(ratio * cancion.duracionSegundos);
    }
  };

  // --- MOTOR DE AUTOSCROLL ---
  useEffect(() => {
    if (enReproduccion) {
      // Disparar simulación de tiempo
      const intervalMs = 200;
      timerRef.current = setInterval(() => {
        setTiempoActual(prev => {
          const nextTime = prev + (intervalMs / 1000);
          if (nextTime >= cancion.duracionSegundos) {
            setEnReproduccion(false);
            clearInterval(timerRef.current!);
            return cancion.duracionSegundos;
          }
          return nextTime;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enReproduccion, cancion.duracionSegundos]);

  // Mapear tiempo transcurrido a línea de letra activa
  useEffect(() => {
    if (!enReproduccion) return;
    
    // Proporción de la canción
    const progressRatio = tiempoActual / cancion.duracionSegundos;
    const targetLineIndex = Math.min(
      Math.floor(progressRatio * cancion.acordes.length),
      cancion.acordes.length - 1
    );

    if (targetLineIndex !== lineaActivaIndex) {
      setLineaActivaIndex(targetLineIndex);
      
      // Actualizar sección si la línea pertenece a otra sección
      const currentLine = cancion.acordes[targetLineIndex];
      if (currentLine && currentLine.seccionId !== seccionActivaId) {
        setSeccionActivaId(currentLine.seccionId);
      }

      if (autoscrollActivo && !userScrollingRef.current) {
        scrollToLine(targetLineIndex);
      }
    }
  }, [tiempoActual, enReproduccion, cancion.acordes, cancion.duracionSegundos, autoscrollActivo, lineaActivaIndex, seccionActivaId]);

  // --- DETECTAR SCROLL MANUAL ---
  const handleScrollAreaScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Si la reproducción está activa, pausamos autoscroll si el usuario hace drag manual
    if (enReproduccion && autoscrollActivo) {
      userScrollingRef.current = true;
      setAutoscrollActivo(false);
      
      // Temporizador para resetear el flag de scroll de usuario
      setTimeout(() => {
        userScrollingRef.current = false;
      }, 1000);
    }
  };

  // --- CONTROLES DE REPRODUCCIÓN (TRANSPORTE) ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePlayPause = () => {
    if (!cancion.rutaAudio) {
      triggerToast("Sin archivo de audio — usando metrónomo de ensayo");
    }
    setEnReproduccion(!enReproduccion);
  };

  const handleSkip = (direction: "prev" | "next") => {
    const currentSecIdx = cancion.estructura.findIndex(s => s.id === seccionActivaId);
    let targetIdx = direction === "prev" ? currentSecIdx - 1 : currentSecIdx + 1;
    
    if (targetIdx >= 0 && targetIdx < cancion.estructura.length) {
      const targetSec = cancion.estructura[targetIdx];
      handleTabClick(targetSec.id);
    } else if (direction === "prev") {
      // Rebobinar al principio
      setTiempoActual(0);
      setLineaActivaIndex(0);
      setSeccionActivaId(cancion.estructura[0].id);
      scrollToLine(0);
    }
  };

  // --- FILTRAR INTEGRANTES ACTIVOS DE LA SECCIÓN ---
  const rosterIntegrantes = useMemo(() => {
    // Obtener IDs de integrantes que participan en la sección activa
    const participacionesActivas = cancion.participaciones.filter(
      p => p.seccionId === seccionActivaId
    );

    return INTEGRANTES_MOCK.map(integrante => {
      const participacion = participacionesActivas.find(
        p => p.integranteId === integrante.id
      );
      
      return {
        ...integrante,
        activo: !!participacion,
        rolEnSeccion: participacion ? participacion.instrumento : integrante.instrumento
      };
    });
  }, [seccionActivaId, cancion.participaciones]);

  // Encontrar notas de la sección activa
  const notasDeSeccionActiva = useMemo(() => {
    const seccion = cancion.estructura.find(s => s.id === seccionActivaId);
    return seccion?.notas || "";
  }, [seccionActivaId, cancion.estructura]);

  return (
    <div className="hoja-ensayo">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="ensayo-toast glass">
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* 3.1 ENCABEZADO (Header) */}
      <header className="ensayo-header">
        <div className="header-left">
          <h1 className="rj ensayo-song-title" onClick={() => triggerToast("Abriendo editor de acordes...")}>
            {cancion.titulo}
          </h1>
          <div className="ensayo-subtitle">
            Ensayo · {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </div>
        </div>
        
        <div className="header-right">
          {/* Chip Tonalidad con Dropdown de Transposición */}
          <div className="transposer-wrapper">
            <button 
              className="chip mono chip-key" 
              onClick={() => setMostrarTransposer(!mostrarTransposer)}
            >
              {tonalidadTranspuesta}
            </button>
            
            {mostrarTransposer && (
              <div className="transposer-dropdown glass">
                <div className="dropdown-title">Transponer</div>
                <div className="transposer-grid">
                  {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(offset => (
                    <button
                      key={offset}
                      className={`transpose-btn mono ${transposeOffset === offset ? 'active' : ''}`}
                      onClick={() => {
                        setTransposeOffset(offset);
                        setMostrarTransposer(false);
                        triggerToast(`Tono ajustado: ${offset > 0 ? '+' : ''}${offset} semitonos`);
                      }}
                    >
                      {offset === 0 ? "Orig" : offset > 0 ? `+${offset}` : offset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="chip mono chip-bpm">{cancion.bpm} bpm</span>
        </div>
      </header>

      {/* 3.2 TABS DE SECCIONES (Section Navigator) */}
      <nav className="section-navigator">
        {cancion.estructura.map(seccion => {
          const isActive = seccionActivaId === seccion.id;
          return (
            <button
              key={seccion.id}
              className={`rj chip section-tab ${isActive ? "active" : ""}`}
              onClick={() => handleTabClick(seccion.id)}
            >
              {seccion.nombre}
            </button>
          );
        })}
      </nav>

      {/* 3.3 ÁREA DE ACORDES Y LETRA (Contenido Principal) */}
      <div 
        className="lyric-scroll-container" 
        ref={scrollAreaRef} 
        onScroll={handleScrollAreaScroll}
      >
        <div className="lyric-content-wrapper">
          {/* El "Cable" (Línea de guía vertical neón) */}
          <div className="neon-guide-cable" />

          {cancion.acordes.map((linea, idx) => {
            const isActive = lineaActivaIndex === idx;
            const seccion = cancion.estructura.find(s => s.id === linea.seccionId);
            
            // Determinar color de dot y acordes según tipo de sección
            let colorType = "cyan";
            if (seccion) {
              if (seccion.tipo === "estribillo" || seccion.tipo === "outro") colorType = "magenta";
              else if (seccion.tipo === "puente" || seccion.tipo === "pre-coro") colorType = "amber";
            }

            // Crear el espaciado de acordes proporcional basándose en la posición
            // Mapeamos los acordes colocándolos en una fila con el espaciado adecuado
            return (
              <div
                key={linea.id}
                ref={el => { lineRefs.current[idx] = el; }}
                className={`lyric-line-row ${isActive ? "active-line" : ""} color-${colorType}`}
              >
                {/* Dot del Cable */}
                <div className="line-guide-dot" />

                {/* Acordes alineados */}
                {linea.acordes.length > 0 && (
                  <div className="mono line-chords-row">
                    {linea.acordes.map(ac => {
                      const chordTransposed = transposeChord(ac.acorde, transposeOffset);
                      return (
                        <span 
                          key={ac.id} 
                          className="chord-badge"
                          style={{ marginLeft: `${ac.posicionPalabra * 28}px` }}
                        >
                          {chordTransposed}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Letra de la línea */}
                <div className="line-lyric-text">
                  {linea.texto}
                </div>

                {/* Notas adicionales si es la línea activa y la sección tiene notas */}
                {isActive && notasDeSeccionActiva && (
                  <div className="line-additional-notes">
                    {notasDeSeccionActiva}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3.4 SECCIÓN DE INTEGRANTES (Roster) */}
      <section className="ensayo-roster-section">
        <div className="roster-title">Participación en esta sección</div>
        <div className="roster-avatars-row">
          {rosterIntegrantes.map(miembro => (
            <div 
              key={miembro.id} 
              className={`roster-avatar-column ${miembro.activo ? "active" : "inactive"}`}
              style={{ "--member-color": miembro.colorAvatar } as React.CSSProperties}
            >
              <div className="avatar-circle">
                {miembro.iniciales}
              </div>
              <div className="avatar-name">{miembro.nombre}</div>
              <div className="avatar-role">{miembro.rolEnSeccion}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.5 BARRA DE TRANSPORTE (Transport Bar) */}
      <footer className="ensayo-transport-bar">
        <div className="transport-left">
          <span className="transport-label">Tono</span>
          <span className="mono transport-val">{cancion.tonalidad}</span>
        </div>

        <div className="transport-center">
          <button 
            className="transport-btn btn-skip" 
            onClick={() => handleSkip("prev")}
            title="Sección Anterior"
          >
            ⏮
          </button>
          
          <button 
            className="transport-btn btn-play-pause" 
            onClick={handlePlayPause}
            title={enReproduccion ? "Pausar" : "Reproducir"}
          >
            {enReproduccion ? "⏸" : "▶"}
          </button>
          
          <button 
            className="transport-btn btn-skip" 
            onClick={() => handleSkip("next")}
            title="Siguiente Sección"
          >
            ⏭
          </button>
        </div>

        <button 
          className={`transport-right autoscroll-toggle ${autoscrollActivo ? "active" : ""}`}
          onClick={() => {
            setAutoscrollActivo(!autoscrollActivo);
            triggerToast(autoscrollActivo ? "Autoscroll desactivado (manual)" : "Autoscroll activado (auto)");
          }}
        >
          <span className="scroll-icon">↕</span>
          <span className="scroll-label">{autoscrollActivo ? "auto" : "manual"}</span>
        </button>
      </footer>

    </div>
  );
}
