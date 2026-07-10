# Estructura de la Aplicación — App de Banda

## 1. Flujo de Registro y Creación de Grupo

```
┌─────────────┐
│  Registro   │  (nombre, email, contraseña)
└──────┬──────┘
       │
       ▼
┌───────────────────────────────┐
│  Al registrarse, SIEMPRE se   │
│  crea automáticamente un      │
│  grupo a su nombre            │
│  ("Grupo de [Nombre]")        │
│  → el usuario queda como      │
│    ADMIN de ese grupo         │
└──────┬─────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│  Pantalla de bienvenida:      │
│  ¿Qué querés hacer?           │
│                                │
│  [ Usar mi grupo nuevo ]      │
│  [ Unirme con código ]        │
└────────────────────────────────┘
```

**Reglas clave:**
- El **primer usuario registrado en un grupo es siempre su administrador** (esto ocurre automáticamente: cada cuenta nueva genera su propio grupo, y el creador es admin de ese grupo).
- Un usuario puede pertenecer a **varios grupos a la vez** (ej. su propia banda como admin + otra banda como miembro invitado), igual que pertenecer a varios workspaces de Slack.
- Unirse a un grupo ajeno **no reemplaza** el grupo propio — se suma como una membresía adicional.

---

## 2. Códigos de Invitación

**Quién puede generarlos:** solo el Admin del grupo.

**Cómo funciona:**
1. El admin va a Configuración → su grupo → "Código de invitación"
2. Ve un código único (ej. `NEON-7F3K`)
3. Puede:
   - **Compartir** el código (copiar / enviar por WhatsApp, etc.)
   - **Regenerar** el código (invalida el anterior)
   - Opcional: poner **expiración** (ej. válido por 7 días) o **límite de usos**
4. Un nuevo usuario (o uno existente) ingresa el código desde:
   - La pantalla de bienvenida al registrarse, o
   - Configuración → "Unirme con código" en cualquier momento
5. Al validarse el código, se lo agrega como **Miembro** de ese grupo

**Seguridad básica:**
- El código no expone información del grupo antes de canjearse
- Se puede revocar en cualquier momento regenerándolo
- Registro de auditoría: quién se unió, cuándo, con qué código

---

## 3. Roles y Permisos

| Acción | Admin | Miembro |
|---|:---:|:---:|
| Ver repertorio, acordes, setlists | ✅ | ✅ |
| Editar acordes y letra | ✅ | ✅ |
| Crear/editar canciones nuevas | ✅ | ✅ |
| Armar y reordenar setlists | ✅ | ✅ |
| Asignar participación de integrantes | ✅ | ✅ |
| Grabar/subir audio de referencia | ✅ | ✅ |
| Generar / regenerar código de invitación | ✅ | ❌ |
| Eliminar / expulsar a un integrante | ✅ | ❌ |
| Promover a otro miembro a Admin | ✅ | ❌ |
| Renombrar o eliminar el grupo | ✅ | ❌ |
| Transferir la administración | ✅ | ❌ |

> La filosofía es **colaborativa**: cualquier integrante puede editar el contenido musical (eso es lo que se usa día a día en ensayos). El rol de Admin solo controla la gestión del grupo en sí (quién entra, quién sale, configuración general).

---

## 4. Módulos / Pantallas de la App

```
App
├── Auth
│   ├── Login
│   ├── Registro
│   └── Recuperar contraseña
│
├── Onboarding (solo la primera vez)
│   ├── Bienvenida / Elegir: usar grupo propio o unirse con código
│   └── Ingresar código de invitación
│
├── Home / Dashboard
│   ├── Selector de grupo activo (si pertenece a varios)
│   ├── Próximo ensayo / show
│   └── Accesos rápidos
│
├── Repertorio
│   ├── Lista de canciones (filtros: estado, género, dificultad)
│   ├── Hoja de Ensayo (vista en vivo)
│   └── Editor de acordes
│
├── Setlist
│   ├── Armado de sets (drag & drop)
│   └── Historial de shows
│
├── Banda
│   ├── Lista de integrantes (rol, instrumento)
│   ├── Disponibilidad / calendario de ensayos
│   └── (Admin) Gestión de miembros: expulsar, promover
│
└── Configuración
    ├── Mi perfil
    ├── Mis grupos (crear nuevo / unirme con código)
    ├── Código de invitación (si es Admin)
    ├── Notificaciones
    ├── Cuenta (contraseña, cerrar sesión, eliminar cuenta)
```

---

## 5. Modelo de Datos

```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  avatarColor: string;
  iniciales: string;
  creadoEn: Date;
}

interface Grupo {
  id: string;
  nombre: string;                // "Banda Luces de Neón"
  creadoPorUsuarioId: string;    // quién lo creó (admin original)
  codigoInvitacion: string;      // "NEON-7F3K"
  codigoExpiraEn?: Date;         // opcional
  codigoUsosMaximos?: number;    // opcional
  creadoEn: Date;
}

interface MembresiaGrupo {
  id: string;
  grupoId: string;
  usuarioId: string;
  rol: "admin" | "miembro";
  instrumento?: string;          // "voz", "bajo", "batería", etc.
  unidoEn: Date;
}

// Un usuario puede tener múltiples MembresiaGrupo (pertenece a varios grupos)
// Cada Grupo tiene exactamente un creador, pero puede tener varios "admin"
// si el rol se transfiere o se promueve a alguien más
```

---

## 6. Flujo de Validación de Código (backend, pseudocódigo)

```typescript
async function unirseConCodigo(usuarioId: string, codigo: string) {
  const grupo = await db.grupos.findOne({ codigoInvitacion: codigo });

  if (!grupo) throw new Error("Código inválido");
  if (grupo.codigoExpiraEn && grupo.codigoExpiraEn < new Date())
    throw new Error("El código ha expirado");

  const yaEsMiembro = await db.membresias.findOne({
    grupoId: grupo.id,
    usuarioId
  });
  if (yaEsMiembro) throw new Error("Ya perteneces a este grupo");

  await db.membresias.create({
    grupoId: grupo.id,
    usuarioId,
    rol: "miembro",
    unidoEn: new Date()
  });

  return grupo;
}

async function regenerarCodigo(grupoId: string, usuarioSolicitanteId: string) {
  const membresia = await db.membresias.findOne({
    grupoId, usuarioId: usuarioSolicitanteId
  });
  if (membresia.rol !== "admin") throw new Error("No autorizado");

  const nuevoCodigo = generarCodigoAleatorio(); // ej. "NEON-9X2M"
  await db.grupos.update(grupoId, { codigoInvitacion: nuevoCodigo });
  return nuevoCodigo;
}
```

---

## 7. Hoja de Configuración de Usuario

Ver mockup adjunto (`configuracion-usuario.html`). Contiene:

- **Perfil:** avatar, nombre, email (editable)
- **Mis grupos:** lista de todos los grupos a los que pertenece, con badge de rol (Admin / Miembro), botones para crear un grupo nuevo o unirse con código
- **Código de invitación:** visible solo si es Admin del grupo seleccionado, con opción de compartir y regenerar
- **Notificaciones:** toggles para recordatorios de ensayo, cambios en setlist, nuevos integrantes
- **Cuenta:** cambiar contraseña, cerrar sesión, eliminar cuenta
