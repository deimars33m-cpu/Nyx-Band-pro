// auth.js
// Manejo de Autenticación y Onboarding de Repertorio - versión Supabase
(function() {
  let currentUserInstance = null;
  let groupToJoinId = null;
  let groupToJoinDetails = null;
  let isAuthFlowActive = false; // Bandera para evitar race conditions

  // --- OBTENER CLIENTE ---
  function getSupabase() {
    return window.supabaseClient;
  }

  // --- INICIALIZAR Y GESTIONAR ESTADO ---
  const supabase = getSupabase();
  if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (isAuthFlowActive) return; // Ignorar si estamos a mitad de un registro/login
      
      if (session && session.user) {
        currentUserInstance = session.user;
        checkUserOnboardingStatus(session.user);
      } else {
        showScreen("auth");
      }
    });
  } else {
    showError("errorAuth", "Error: Supabase no está configurado o inicializado correctamente en supabase.js.");
  }

  // --- NAVEGACIÓN ---
  window.showScreen = function(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('screen-' + screenId);
    if (el) el.classList.add('active');
  };

  function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 5000);
    } else {
      alert(message);
    }
  }

  // --- VERIFICAR ESTADO AL ENTRAR (LOGIN NORMAL) ---
  async function checkUserOnboardingStatus(user) {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      // Intentar obtener el perfil del usuario de la tabla public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) throw userError;

      if (userData && userData.current_band_id && userData.current_band_id !== "KAWSAY") {
        // Ya tiene banda y perfil válidos, ir directo a index.html
        window.location.href = "index.html";
        return;
      }
      
      // Si el usuario existe en auth pero no tiene registro en public.users o no tiene banda activa
      let currentBandId = null;
      const name = user.user_metadata.nombre || user.email.split("@")[0];
      const personalBandName = `Grupo de ${name.charAt(0).toUpperCase() + name.slice(1)}`;

      // Consultar si ya tiene alguna banda registrada de la cual es miembro
      const { data: memberOf, error: memberError } = await supabase
        .from('members')
        .select('band_id')
        .eq('user_id', user.id)
        .limit(1);

      if (memberError) throw memberError;

      if (memberOf && memberOf.length > 0) {
        currentBandId = memberOf[0].band_id;
        // Sincronizar el current_band_id en public.users si no estaba
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          nombre: name,
          current_band_id: currentBandId
        });
      } else {
        // No tiene banda, la creamos en este instante
        currentBandId = await createPersonalBandForUser(user, personalBandName);
      }

      // Preparar UI
      document.getElementById("userGroupNameDisplay").textContent = personalBandName;
      document.getElementById("joinPersonalGroupName").textContent = personalBandName;
      document.getElementById("createdGroupNameDisplay").textContent = personalBandName;
      document.getElementById("createdGroupCodeDisplay").textContent = currentBandId;

      showScreen("group-choice");
    } catch (e) {
      console.error("Error comprobando perfil de Supabase:", e);
      alert("Error al comprobar estado del perfil:\n" + e.message);
      showScreen("auth");
    }
  }

  // --- CREACIÓN AUTOMÁTICA DE BANDA EN SUPABASE ---
  async function createPersonalBandForUser(user, proposedName) {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Cliente Supabase no configurado");

    const cleanName = proposedName.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
    const bandIdCode = `BANDA-${cleanName}-${randNum}`;

    // 1. Inserción de la banda en public.bands
    const { error: bandError } = await supabase
      .from('bands')
      .insert({
        id: bandIdCode,
        name: proposedName,
        created_by: user.id
      });
    if (bandError) throw bandError;

    // 2. Inserción o actualización del perfil del usuario
    const email = user.email;
    const name = user.user_metadata.nombre || email.split("@")[0];
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: email,
        nombre: name,
        current_band_id: bandIdCode
      });
    if (userError) throw userError;

    // 3. Inserción del miembro creador como Administrador
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        band_id: bandIdCode,
        user_id: user.id,
        name: name,
        email: email,
        role: "Administrador"
      });
    if (memberError) throw memberError;

    // 4. Crear estructura básica de acordes favoritos por defecto
    await supabase
      .from('fav_chords')
      .insert({
        band_id: bandIdCode,
        list: []
      });

    return bandIdCode;
  }

  // --- LOGIN ---
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const btnSubmit = document.getElementById("btn-login-submit");
      const supabase = getSupabase();

      if (!supabase) return showError("errorLogin", "Cliente Supabase no inicializado.");
      if (!email || !password) return showError("errorLogin", "Completa todos los campos.");
      if (!email.includes("@")) return showError("errorLogin", "Email inválido.");

      const originalText = btnSubmit.textContent;
      btnSubmit.textContent = "Procesando...";
      btnSubmit.disabled = true;
      isAuthFlowActive = true; 

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;
        currentUserInstance = data.user;
        await checkUserOnboardingStatus(data.user);
      } catch (error) {
        console.error("Login error:", error);
        alert("Error al iniciar sesión:\n" + error.message);
        showError("errorLogin", error.message);
      } finally {
        isAuthFlowActive = false;
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
      }
    });
  }

  // --- REGISTRO ---
  const formRegister = document.getElementById("form-register");
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirm = document.getElementById("registerPasswordConfirm").value;
      const agree = document.getElementById("agreeTerms").checked;
      const btnSubmit = document.getElementById("btn-register-submit");
      const supabase = getSupabase();

      if (!supabase) return showError("errorRegister", "Cliente Supabase no inicializado.");
      if (!name || !email || !password || !confirm) return showError("errorRegister", "Todos los campos son obligatorios.");
      if (!email.includes("@")) return showError("errorRegister", "El formato del correo electrónico no es válido.");
      if (password !== confirm) return showError("errorRegister", "Las contraseñas no coinciden.");
      if (password.length < 6) return showError("errorRegister", "La contraseña debe tener al menos 6 caracteres.");
      if (!agree) return showError("errorRegister", "Debes aceptar los términos de servicio.");

      const originalText = btnSubmit.textContent;
      btnSubmit.textContent = "Creando cuenta...";
      btnSubmit.disabled = true;
      isAuthFlowActive = true; 

      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              nombre: name
            }
          }
        });

        if (error) throw error;
        
        const user = data.user;
        currentUserInstance = user;

        const personalBandName = `Grupo de ${name}`;
        const currentBandId = await createPersonalBandForUser(user, personalBandName);

        document.getElementById("userGroupNameDisplay").textContent = personalBandName;
        document.getElementById("joinPersonalGroupName").textContent = personalBandName;
        document.getElementById("createdGroupNameDisplay").textContent = personalBandName;
        document.getElementById("createdGroupCodeDisplay").textContent = currentBandId;

        showScreen("group-choice");
      } catch (error) {
        console.error("Registration error:", error);
        alert("Error durante el registro o creación de grupo:\n" + error.message);
        showError("errorRegister", error.message);
      } finally {
        isAuthFlowActive = false;
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
      }
    });
  }

  // --- UNIRSE CON CÓDIGO ---
  const formJoin = document.getElementById("form-join");
  if (formJoin) {
    formJoin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = document.getElementById("joinCode").value.trim().toUpperCase();
      const supabase = getSupabase();
      
      if (!supabase) return showError("errorJoinCode", "Cliente Supabase no inicializado.");
      if (!code) return showError("errorJoinCode", "El código no puede estar vacío.");
      if (code.length < 5) return showError("errorJoinCode", "El código debe tener al menos 5 caracteres.");

      showScreen("group-validating");

      try {
        // Buscar si existe la banda en public.bands
        const { data: bandData, error: bandError } = await supabase
          .from('bands')
          .select('*')
          .eq('id', code)
          .maybeSingle();

        if (bandError) throw bandError;
        if (!bandData) {
          showScreen("group-option-join");
          showError("errorJoinCode", `El código "${code}" es inválido. Verifica que esté bien escrito.`);
          return;
        }

        // Obtener cantidad de miembros
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select('id')
          .eq('band_id', code);

        if (membersError) throw membersError;

        groupToJoinId = code;
        groupToJoinDetails = {
          name: bandData.name || code,
          membersCount: members ? members.length : 0
        };

        document.getElementById("joinTargetGroupName").textContent = groupToJoinDetails.name;
        document.getElementById("joinTargetGroupMembers").textContent = `${groupToJoinDetails.membersCount} músico(s)`;
        
        showScreen("group-confirm-join");
      } catch (err) {
        console.error("Error al validar código en Supabase:", err);
        showScreen("group-option-join");
        showError("errorJoinCode", "Error de red al validar código: " + err.message);
      }
    });
  }

  // --- CONFIRMAR UNIÓN A GRUPO ---
  window.completarOnboardingConJoin = async function() {
    const supabase = getSupabase();
    if (!currentUserInstance || !groupToJoinId || !supabase) return;

    try {
      const email = currentUserInstance.email;
      const userName = currentUserInstance.user_metadata.nombre || email.split("@")[0];

      // 1. Insertar el integrante en la tabla members (se usa ON CONFLICT para ignorar duplicados)
      const { error: memberError } = await supabase
        .from('members')
        .upsert({
          band_id: groupToJoinId,
          user_id: currentUserInstance.id,
          name: userName,
          email: email,
          role: "Integrante"
        }, { onConflict: 'band_id,user_id' });

      if (memberError) throw memberError;

      // 2. Actualizar el perfil del usuario para establecer la banda activa
      const { error: userError } = await supabase
        .from('users')
        .update({
          current_band_id: groupToJoinId
        })
        .eq('id', currentUserInstance.id);

      if (userError) throw userError;

      window.location.href = "index.html";
    } catch (e) {
      console.error("Error al unirse al grupo:", e);
      alert("Error al guardar la membresía: " + e.message);
      showScreen("group-option-join");
    }
  };

  // --- FINALIZAR ONBOARDING NORMAL ---
  window.completarOnboarding = function(type) {
    if (type === "create") {
      window.location.href = "index.html";
    }
  };

  window.copyGroupCodeToClipboard = function() {
    const codeEl = document.getElementById("createdGroupCodeDisplay");
    if (codeEl) {
      navigator.clipboard.writeText(codeEl.textContent);
      alert("Código de Grupo copiado: " + codeEl.textContent);
    }
  };

})();
