# Prompt: Pantalla de Hoja de Ensayo en Vivo
## App de Banda — Organización de Repertorio

---

## 1. DESCRIPCIÓN GENERAL

Desarrollar la pantalla **"Hoja de Ensayo"** (pantalla principal durante un ensayo). Es una vista optimizada para leer acordes, letra y participación de integrantes EN TIEMPO REAL, con navegación rápida, scroll automático, y cambios de sección instantáneos.

**Caso de uso:** El líder de la banda abre la app en un celular/tablet durante el ensayo, carga una canción, y la pantalla muestra los acordes sincronizados con la letra mientras cada integrante ve qué parte le corresponde en cada sección.

---

## 2. ESTRUCTURA DE DATOS

### 2.1 Modelo de Canción
```typescript
interface Cancion {
  id: string;
  titulo: string;
  artistaOriginal: string;
  tonalidad: string;           // "Em", "G#m", etc.
  bpm: number;                 // 92, 120, etc.
  duracionSegundos: number;    // 220 (3:40)
  genero: string;
  nivelDificultad: 1 | 2 | 3 | 4 | 5;
  estado: "preparacion" | "lista" | "archivada";
  fechaCreacion: Date;
  ultimaEdicion: Date;
  rutaAudio?: string;          // URL o path a archivo de referencia
  acordes: LineaDeLirica[];    // Array de líneas con acordes
  estructura: Seccion[];       // Intro, Verso 1, Estribillo, etc.
  participaciones: Participacion[];  // Quién participa dónde
}

interface LineaDeLirica {
  id: string;
  texto: string;               // "Bajo el cielo eléctrico caminamos"
  acordes: AcordeEnLirica[];   // Array de acordes posicionados
  seccionId: string;           // Referencia a qué sección pertenece
}

interface AcordeEnLirica {
  id: string;
  acorde: string;              // "Em", "C", "G", etc.
  posicionPalabra: number;     // 0 = comienza con primer palabra, 1 = después de segunda, etc.
  posicionCaracter: number;    // Posición exacta en caracteres (backup)
}

interface Seccion {
  id: string;
  nombre: string;              // "Intro", "Verso 1", "Estribillo", "Puente", etc.
  tipo: "intro" | "verso" | "estribillo" | "puente" | "pre-coro" | "solo" | "outro";
  numeracion?: number;         // 1 para "Verso 1", 2 para "Verso 2", etc.
  lineaInicio: number;         // Índice de la primera línea en el array de acordes
  lineaFin: number;            // Índice de la última línea
  notas?: string;              // Ej. "entra guitarra líder aquí", "coros unidos"
}

interface Participacion {
  id: string;
  integranteId: string;        // Ref. a quién es (Camila, Rodrigo, etc.)
  seccionId: string;           // En qué sección participa
  instrumento: string;         // "voz", "guitarra rítmica", "bajo", "batería", "coro", etc.
  notas?: string;              // "solo en 3er verso", "entra en el puente"
}

interface Integrante {
  id: string;
  nombre: string;
  instrumento: string;
  disponibilidad?: boolean;
  colorAvatar: string;         // Hex para círculo personalizado
  iniciales: string;           // "CA", "RO", etc.
}
```

### 2.2 Estado de la Pantalla (React State / Pinia / Zustand)
```typescript
interface EstadoPantallaEnsayo {
  // Datos principales
  cancionActual: Cancion | null;
  seccionActivaId: string;      // Cuál sección se está tocando
  lineaActivaIndex: number;     // Cuál línea de letra está en el centro
  
  // Control de reproducción
  enReproduccion: boolean;
  tiempoActual: number;         // Segundos desde el inicio
  volumen: number;              // 0-100
  
  // Configuración de visualización
  autoscrollActivo: boolean;
  transposeOffset: number;      // Semitonos de transposición (-12 a +12)
  
  // UI
  mostrarRoster: boolean;
  mostrarNotas: boolean;
}
```

---

## 3. COMPONENTES VISUALES Y LAYOUT

### 3.1 Encabezado (Header)
**Altura:** ~80px (flexible)

```
┌─────────────────────────────────────────┐
│  Luces de neón                 Em   92bpm│
│  Ensayo · 12 jun               [chip]    │
└─────────────────────────────────────────┘
```

**Elementos:**
- **Título de canción:** Rajdhani bold 23px, color magenta con text-shadow (glow)
- **Subtítulo:** "Ensayo · [fecha]" — Inter 11px, color `--text-dim`
- **Tonalidad chip:** JetBrains Mono, cyan, con borde y glow
- **BPM chip:** JetBrains Mono, amber, con borde

**Interacción:**
- Tocar en el título → editar (abrir editor)
- Tocar en tonalidad → transposer (dropdown o modal)

---

### 3.2 Tabs de Secciones (Section Navigator)
**Altura:** ~36px
**Scrolleable horizontalmente**

```
┌────┬──────┬───────────┬────────┬───────┐
│Intro│Verso1│Estribillo │Puente │Verso2│
└────┴──────┴───────────┴────────┴───────┘
```

**Elementos:**
- Cada tab es un chip con border transparente y `--text-dim`
- La sección activa tiene fondo magenta + text magenta + glow
- Font: Rajdhani semi-bold 12px
- Padding: 6px 12px
- Border-radius: 999px

**Interacción:**
- Tocar en un tab → hacer scroll a esa sección, marcar como activa
- Cambio suave en ~280ms (CSS transition)

---

### 3.3 Área de Acordes y Letra (Main Content)
**Altura:** Variable, scroll vertical permitido
**Padding-left:** 20px (espacio para el "cable" vertical)

```
┌──◦────────────────────────────────────┐  ← Dot (glow)
│  Em        C                           │
│  Bajo el cielo eléctrico caminamos     │
│                                        │
│  ◦ G         D                         │
│  buscando el brillo que no se apaga    │
│                                        │
│  ◦ Em   C   D                          │
│  ┃ Somos luces de neón en la ciudad   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│     Coro doble aquí · entra guitarra   │
│                                        │
└────────────────────────────────────────┘
```

**El "Cable" (línea vertical de guía):**
- Posición: absoluta, left 5px
- Altura: desde top del primer acorde hasta bottom del último
- Stroke: 2px solid cyan con opacity 0.3
- Box-shadow: 0 0 8px cyan (suave glow)
- Propósito: guía visual mostrando "flow" de la sección

**Cada "Lyric Line" (línea de letra con acordes):**

**Estructura visual:**
```
  ◦ [Acordes en fila]
    [Texto de letra]
    [Nota adicional si la hay]
```

**Elementos:**
- **Dot (●):** 
  - Position: absolute, left -20px
  - Width/height: 9px
  - Border-radius: 50%
  - Color según tipo de línea (cyan, amber, magenta)
  - Box-shadow: 0 0 10px [mismo color]

- **Acordes (en JetBrains Mono):**
  - Font-size: 12px
  - Color: según tipo (cyan, amber, magenta)
  - Flex display con gap 30px (espaciado proporcional)
  - Cada acorde alineado aproximadamente sobre la palabra

- **Texto de letra:**
  - Font-size: 14px
  - Color: `--text` (#F3F1FF)
  - Line-height: 1.55
  - Margin-top: 4px
  - Font-weight: 400 (normal) o 500 (si es la línea activa)

**Línea Activa (Current Line):**
- Background: `rgba(255,62,165,0.08)` (magenta muy traslúcido)
- Border-left: 2px solid magenta
- Border-radius: 0 10px 10px 0
- Padding: 10px 12px
- Margin-left: -12px (para cubrir)

**Nota adicional (si existe):**
- Font-size: 11px
- Color: #D48FB0 (magenta desaturado)
- Margin-top: 5px
- Ejemplo: "Coro doble aquí · entra guitarra líder en el 3er verso"

---

### 3.4 Sección de Participantes (Roster)
**Altura:** ~120px
**Aparece debajo de la línea activa**

```
┌────────────────────────────────────────┐
│ Participación en esta sección          │
│                                        │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │ CA  │  │ RO  │  │ JU  │  │ MA  │  │
│  │Camila│ │Rdrg │  │Julián│ │Male │  │
│  │ Voz │  │Coro │  │Bajo │  │Bat. │  │
│  └─────┘  └─────┘  └─────┘  └─────┘  │
│                                        │
│  [Activos (magenta)]  [Inactivos]     │
└────────────────────────────────────────┘
```

**Estructura:**
- Título: "Participación en esta sección" — 11px, `--text-dim`
- Flex row con overflow-x: auto
- Cada avatar es una columna: width 60px

**Avatar (Integrante):**
```
┌───────────┐
│    ●●     │  ← Círculo 40x40, initiales centradas
│  Nombre   │  ← 10px, `--text`
│ Instrumento│  ← 9px, `--text-dim`
└───────────┘
```

- **Círculo activo:** background #2A0F20, border 2px magenta, color #FF9FCB, glow
- **Círculo inactivo:** background `--bg-card`, border 1px `--border-soft`, color `--text-muted`
- Font: 12px bold para las iniciales

**Lógica:**
- Un integrante está "activo" si participa en la sección actual
- Se obtiene del array de `Participacion` filtrando por `seccionId === seccionActivaId`

---

### 3.5 Barra de Transporte (Transport Bar)
**Altura:** 50px
**Fixed al bottom (o parte del scroll)**

```
┌──────────────────────────────────────┐
│ Tono Em   [◄◄  ●▶  ►►]   ⬆ auto     │
└──────────────────────────────────────┘
```

**Elementos:**
- **Sección izquierda:**
  - Label: "Tono" 11px, `--text-dim`
  - Valor: JetBrains Mono 12px, `--text`
  - En este punto, SIEMPRE el acorde original (no transpuesto)

- **Sección central (Reproductor):**
  - Skip-backward: Icon `ti-player-skip-back`, 18px, `--text-muted`, clickable
  - Play/Pause: Círculo 38x38, background magenta, icon `ti-player-play` 16px color #3C0A2A
  - Skip-forward: Icon `ti-player-skip-forward`, 18px, `--text-muted`, clickable
  - Gap entre: 16px

- **Sección derecha (Autoscroll):**
  - Icon: `ti-arrows-vertical` 15px, color cyan (si activo) o `--text-muted` (si inactivo)
  - Label: "auto" o "manual" — 10px, color según estado
  - Clickable para togglear

---

## 4. INTERACCIONES Y GESTOS

### 4.1 Navegación por Sección
**Acción:** Tocar en un tab de sección
**Resultado:**
1. Cambiar `seccionActivaId` al id de la sección tocada
2. Cambiar `lineaActivaIndex` a la línea de inicio de esa sección
3. Scroll suave (320ms) a esa línea, centrada en la pantalla
4. Re-renderizar roster (avatar section) con los participantes de la nueva sección

---

### 4.2 Autoscroll
**Modo ON (por defecto):**
- Mientras la canción se reproduce (enReproduccion === true)
- Cada línea de letra que comienza debe pasar por el "scroll point" (centro de pantalla)
- Cálculo: basado en `tiempoActual` + duración aproximada de cada línea
- Transición smooth, no brusca

**Modo OFF:**
- Usuario scroll manual
- El autoscroll se pausa
- Mostrar label "manual" en la barra

---

### 4.3 Transposición
**Acción:** Tocar el chip de tonalidad (ej. "Em")
**Comportamiento:**
1. Abrir un pequeño picker/dropdown con opciones de transposición
2. O: -5, -4, -3, -2, -1, 0 (original), +1, +2, +3, +4, +5 semitonos
3. Seleccionar → recalcular todos los acordes en pantalla
4. Mostrar offset en el editor (si está abierto)

**Cálculo de transposición:**
- Array de acordes cromáticos: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
- Para cada acorde: encontrar índice, sumar offset, módulo 12, obtener nuevo acorde
- Ejemplo: "Em" (E) + 2 semitonos = "F#m"

---

### 4.4 Play/Pause
**Acción:** Tocar el botón play (círculo magenta)
**Resultado:**
1. Toggle `enReproduccion`
2. Si no hay audio cargado: mostrar toast "Cargando audio..." o reproducir metrónomo
3. Si sí: reproducir desde `tiempoActual`
4. Cambiar icono de play (▶) a pausa (⏸)

---

### 4.5 Skip (Anterior/Siguiente)
**Skip Backward:**
- Retroceder a la sección anterior
- Cambiar `seccionActivaId` y `lineaActivaIndex`
- Reset `tiempoActual` a 0

**Skip Forward:**
- Avanzar a la sección siguiente
- Idem anterior

---

### 4.6 Scroll Manual
**Acción:** User scrollea el área principal
**Resultado:**
1. Desactivar autoscroll (cambiar a "manual")
2. Detectar cuál línea está más cerca del centro
3. Actualizar `lineaActivaIndex`
4. Actualizar roster según participación en esa línea

---

## 5. FLUJO DE DATOS

### 5.1 Carga Inicial
```
1. Usuario abre la pantalla de ensayo
2. Cargar `Cancion` desde BD/API (por ID)
3. Parsear acordes de LineaDeLirica[]
4. Agrupar en Seccion[]
5. Cargar Participacion[] para esa canción
6. Inicializar estado:
   - seccionActivaId = primera sección (Intro)
   - lineaActivaIndex = 0
   - transposeOffset = 0
   - autoscrollActivo = true
   - enReproduccion = false
7. Renderizar
```

### 5.2 Cambio de Sección (Tab click)
```
1. Event listener en el tab → seccionId
2. setState(seccionActivaId = seccionId)
3. Calcular lineaInicio desde Seccion[seccionId].lineaInicio
4. setState(lineaActivaIndex = lineaInicio)
5. ScrollTo({index: lineaInicio, behavior: 'smooth'})
6. Filtrar Participacion[] por seccionId
7. Re-render roster
```

### 5.3 Transposición
```
1. User selecciona offset (+2 semitonos)
2. setState(transposeOffset = 2)
3. Para cada acorde en pantalla:
   - acordeOriginal = "Em"
   - indiceEnEscala = escalaCompletica.indexOf("Em") → 0
   - nuevoIndice = (indiceEnEscala + 2) % 12
   - acordeTranspuesto = escalaCompletica[nuevoIndice] → "F#m"
4. Recalcular todos los AcordeEnLirica.acorde
5. Re-render
```

---

## 6. TEMA VISUAL Y COLORES

### 6.1 Paleta de Colores
```css
--bg-stage:        #0A0A14    /* Fondo principal, muy oscuro */
--bg-raised:       #111022    /* Tarjetas y elementos levantados */
--bg-card:         #151329    /* Fondos de avatares inactivos */
--border:          #23213A    /* Border principal */
--border-soft:     #2A2840    /* Border más suave */

--magenta:         #FF3EA5    /* Activo, énfasis, cierre */
--magenta-dim:     rgba(255, 62, 165, 0.08)  /* Background translúcido */

--cyan:            #29F0D6    /* Referencia de tonalidad, activo */
--cyan-dim:        rgba(41, 240, 214, 0.15)  /* Background translúcido */

--amber:           #FFD23F    /* BPM, transposición */
--amber-dim:       rgba(255, 210, 63, 0.12)

--text:            #F3F1FF    /* Texto principal */
--text-muted:      #9C97C4    /* Texto secundario */
--text-dim:        #6E699A    /* Texto muy atenuado */
```

### 6.2 Efectos Visuales
- **Text-shadow / Glow:** 
  - Magenta: `text-shadow: 0 0 18px rgba(255, 62, 165, 0.55)`
  - Cyan: `box-shadow: 0 0 8px var(--cyan)`
  
- **Transiciones:**
  - Suave: `transition: all 0.28s ease`
  - Scroll: `scroll-behavior: smooth`

- **Tipografía:**
  - Títulos: **Rajdhani** (bold 700, semi-bold 600)
  - Acordes: **JetBrains Mono** (monospace)
  - Cuerpo: **Inter** (400 normal, 500 bold)

---

## 7. CASOS DE USO ESPECIALES

### 7.1 Canción sin audio
- El botón play sigue disponible
- Al hacer click, mostrar toast: "Sin archivo de audio — usa metrónomo"
- Reproducir metrónomo a los BPM especificados (si está implementado)

### 7.2 Sección muy larga
- Si una sección tiene muchas líneas y excede el viewport
- El scroll manual sigue disponible
- Autoscroll puede desactivarse si el usuario scrollea

### 7.3 Transposición fuera de rango
- Si transpone -6 y el acorde es "C", resulta "F#"
- Validar que el rango sea lógico (-5 a +5 semitonos típicamente)
- Mostrar advertencia si sale de rango: "Tonalidad muy baja/alta para la voz"

### 7.4 Participante no disponible
- Si un integrante no está en esa sección: avatar en gris (`--bg-card` + border `--border-soft`)
- Tooltip o nota: "(no participa en esta sección)"

### 7.5 Nota importante en la línea
- Si la línea tiene un `.notas` no vacío
- Mostrar debajo de la letra en magenta desaturado
- Ejemplo: "Coro doble aquí · entra guitarra líder"

---

## 8. REQUERIMIENTOS TÉCNICOS

### 8.1 Stack Recomendado
- **Framework:** React (o Vue/Svelte) con TypeScript
- **State Management:** Zustand, Pinia, o Context API
- **Audio:** Web Audio API o Howler.js
- **Storage:** Supabase o Firebase (para persistencia)
- **Styling:** CSS-in-JS (Tailwind + custom CSS) o Styled Components
- **Mobile:** React Native o Flutter (para Android/iOS)

### 8.2 Librerías Útiles
- **Scroll suave:** `react-scroll` o CSS nativo `scroll-behavior: smooth`
- **Iconos:** Tabler Icons (ya en el prototipo)
- **Tipografía:** Google Fonts (Rajdhani, Inter, JetBrains Mono)
- **Accesibilidad:** `axe-core` para testing

### 8.3 Rendimiento
- Virtualización del scroll si hay muchas líneas (react-window)
- Memoización de componentes (React.memo, useMemo)
- Lazy loading de audio
- Debounce en el scroll listener

---

## 9. PSEUDOCÓDIGO PRINCIPAL

```typescript
// Componente principal: HojaEnsayo.tsx

export function HojaEnsayo() {
  const { cancionActual, seccionActivaId, lineaActivaIndex, transposeOffset } = useStore();
  
  // Estado local
  const [enReproduccion, setEnReproduccion] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [autoscroll, setAutoscroll] = useState(true);
  
  // Handlers
  const handleTabClick = (seccionId: string) => {
    const seccion = cancionActual.estructura.find(s => s.id === seccionId);
    const nuevoIndex = seccion.lineaInicio;
    cambiarSeccion(seccionId, nuevoIndex);
    scrollToLine(nuevoIndex);
  };
  
  const handlePlayPause = () => {
    setEnReproduccion(!enReproduccion);
    // Llamar a audio player
  };
  
  const handleTranspose = (offset: number) => {
    useStore.setState({ transposeOffset: offset });
  };
  
  const handleScroll = (event) => {
    if (autoscroll) setAutoscroll(false); // Desactivar autoscroll
    const lineaVenta = detectVisibleLine(event.target);
    useStore.setState({ lineaActivaIndex: lineaVenta });
  };
  
  // Autoscroll effect
  useEffect(() => {
    if (enReproduccion && autoscroll) {
      const timer = setInterval(() => {
        setTiempoActual(prev => prev + 0.05);
        const proximaLinea = calcularLineaPorTiempo(tiempoActual);
        scrollToLine(proximaLinea);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [enReproduccion, autoscroll]);
  
  // Filtrar participantes para la sección activa
  const participantesActivos = cancionActual.participaciones.filter(
    p => p.seccionId === seccionActivaId
  );
  
  return (
    <div className="hoja-ensayo">
      <Header cancion={cancionActual} />
      
      <SectionTabs 
        secciones={cancionActual.estructura}
        activa={seccionActivaId}
        onTabClick={handleTabClick}
      />
      
      <LyricContent 
        lineas={cancionActual.acordes}
        seccionActiva={seccionActivaId}
        lineaActiva={lineaActivaIndex}
        transposeOffset={transposeOffset}
        onScroll={handleScroll}
      />
      
      <RosterSection participantes={participantesActivos} />
      
      <TransportBar 
        enReproduccion={enReproduccion}
        onPlay={handlePlayPause}
        autoscroll={autoscroll}
        onToggleAutoscroll={() => setAutoscroll(!autoscroll)}
        tonalidad={calcularTonalidad(cancionActual.tonalidad, transposeOffset)}
      />
    </div>
  );
}
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear tipos TypeScript (interfaces de Cancion, Seccion, etc.)
- [ ] Conectar a BD para obtener canción actual
- [ ] Renderizar encabezado con título, tonalidad, BPM
- [ ] Renderizar tabs de secciones
- [ ] Renderizar área de acordes y letra
  - [ ] Parsear y formatear acordes
  - [ ] Implementar transposición
  - [ ] Mostrar línea activa (highlight magenta)
  - [ ] Cable de guía visual
  - [ ] Dots de color según línea
- [ ] Renderizar roster de participantes
  - [ ] Filtrar por sección activa
  - [ ] Estilo activo/inactivo
- [ ] Implementar barra de transporte
  - [ ] Play/Pause (conexión a audio)
  - [ ] Skip forward/backward
  - [ ] Autoscroll toggle
- [ ] Scroll y navegación
  - [ ] Manual scroll listener
  - [ ] Autoscroll automático
  - [ ] Cambio de sección fluido
- [ ] Transposición
  - [ ] Modal/picker de transposición
  - [ ] Recálculo de acordes
- [ ] Estilos y tema visual
  - [ ] Dark theme con neón
  - [ ] Glows y sombras
  - [ ] Responsive para mobile
- [ ] Accesibilidad
  - [ ] ARIA labels en botones
  - [ ] Keyboard navigation (opcional)
  - [ ] Contrast ratios
- [ ] Optimización
  - [ ] Lazy load de audio
  - [ ] Memoización de componentes
  - [ ] Virtualización de scroll (si muchas líneas)

---

## 11. EJEMPLOS DE DATOS MOCK

```typescript
const cancionMock: Cancion = {
  id: "cancion-001",
  titulo: "Luces de neón",
  artistaOriginal: "Tu banda",
  tonalidad: "Em",
  bpm: 92,
  duracionSegundos: 220,
  genero: "Indie/Alternative",
  nivelDificultad: 3,
  estado: "lista",
  acordes: [
    {
      id: "linea-001",
      texto: "Bajo el cielo eléctrico caminamos",
      acordes: [
        { id: "ac-001", acorde: "Em", posicionPalabra: 0, posicionCaracter: 0 },
        { id: "ac-002", acorde: "C", posicionPalabra: 4, posicionCaracter: 20 }
      ],
      seccionId: "sec-estribillo"
    },
    // ... más líneas
  ],
  estructura: [
    {
      id: "sec-intro",
      nombre: "Intro",
      tipo: "intro",
      lineaInicio: 0,
      lineaFin: 1,
      notas: ""
    },
    {
      id: "sec-estribillo",
      nombre: "Estribillo",
      tipo: "estribillo",
      lineaInicio: 2,
      lineaFin: 4,
      notas: "Coro doble aquí"
    }
  ],
  participaciones: [
    {
      id: "part-001",
      integranteId: "integrante-camila",
      seccionId: "sec-estribillo",
      instrumento: "voz",
      notas: ""
    },
    {
      id: "part-002",
      integranteId: "integrante-rodrigo",
      seccionId: "sec-estribillo",
      instrumento: "coro",
      notas: ""
    }
  ]
};
```

---

## 12. CONCLUSIÓN

Este prompt cubre TODO lo necesario para programar la pantalla de Hoja de Ensayo: estructura de datos, componentes visuales, interacciones, flujo de datos, estilos y casos especiales. 

**Usa este documento como base para:**
- Pasar a un desarrollador full-stack
- Generar tickets/issues en tu sprint
- Comunicar el diseño al equipo
- Validar contra el prototipo visual
