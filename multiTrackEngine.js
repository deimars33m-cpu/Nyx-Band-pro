/**
 * multiTrackEngine.js
 * Motor de Mezcla y Reproducción Simultánea Multipista (Web Audio API)
 * Permite reproducir múltiples pistas en paralelo (voces, instrumentos),
 * con control de volumen independiente, paneo estéreo L-R, Mute y Solo.
 */

window.MultiTrackEngine = (function () {
  let audioCtx = null;
  let masterGainNode = null;
  let tracks = []; // [{ id, name, url, volume, pan, muted, solo, duration, audio, source, gainNode, pannerNode, loaded }]
  let isPlaying = false;
  let masterCurrentTime = 0;
  let masterDuration = 0;
  let syncInterval = null;
  let timeUpdateCallbacks = [];
  let stateChangeCallbacks = [];

  // Grabación
  let mediaRecorder = null;
  let recordChunks = [];
  let isRecording = false;
  let recordStartTime = 0;
  let recordTimer = null;
  let recordStream = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn("Web Audio API no soportada en este navegador.");
        return null;
      }
      audioCtx = new AudioCtxClass();
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
      masterGainNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function recalculateGains() {
    if (!audioCtx) return;
    const anySolo = tracks.some(t => t.solo);

    tracks.forEach(t => {
      if (!t.gainNode) return;
      let targetGain = 0;
      if (anySolo) {
        if (t.solo && !t.muted) {
          targetGain = (t.volume !== undefined ? t.volume : 80) / 100;
        } else {
          targetGain = 0;
        }
      } else {
        if (!t.muted) {
          targetGain = (t.volume !== undefined ? t.volume : 80) / 100;
        } else {
          targetGain = 0;
        }
      }

      try {
        t.gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.02);
      } catch (e) {
        t.gainNode.gain.value = targetGain;
      }
    });
  }

  function updateMasterDuration() {
    let maxDur = 0;
    tracks.forEach(t => {
      if (t.audio && t.audio.duration && !isNaN(t.audio.duration) && isFinite(t.audio.duration)) {
        if (t.audio.duration > maxDur) maxDur = t.audio.duration;
      } else if (t.duration && !isNaN(t.duration) && isFinite(t.duration)) {
        if (t.duration > maxDur) maxDur = t.duration;
      }
    });
    masterDuration = maxDur;
    notifyTimeUpdate();
  }

  function notifyTimeUpdate() {
    timeUpdateCallbacks.forEach(cb => {
      try {
        cb({
          currentTime: masterCurrentTime,
          duration: masterDuration,
          isPlaying: isPlaying
        });
      } catch (e) {}
    });
  }

  function notifyStateChange() {
    stateChangeCallbacks.forEach(cb => {
      try {
        cb({
          isPlaying: isPlaying,
          tracks: tracks,
          currentTime: masterCurrentTime,
          duration: masterDuration
        });
      } catch (e) {}
    });
  }

  function startSyncLoop() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(() => {
      if (!isPlaying || tracks.length === 0) return;

      // Usar la primera pista activa como referencia de tiempo, o el promedio
      const activeAudios = tracks.map(t => t.audio).filter(a => a && !a.paused && a.currentTime > 0);
      if (activeAudios.length > 0) {
        masterCurrentTime = activeAudios[0].currentTime;
      } else {
        masterCurrentTime += 0.1;
      }

      // Comprobar desincronización y corregir si el desvío supera 0.08 segundos
      tracks.forEach(t => {
        if (t.audio && !t.audio.paused && !t.audio.ended) {
          const drift = Math.abs(t.audio.currentTime - masterCurrentTime);
          if (drift > 0.1) {
            t.audio.currentTime = masterCurrentTime;
          }
        }
      });

      // Si se alcanzó el final de todas las pistas
      if (masterDuration > 0 && masterCurrentTime >= masterDuration) {
        stop();
        return;
      }

      notifyTimeUpdate();
    }, 100);
  }

  function stopSyncLoop() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  return {
    init() {
      getAudioContext();
    },

    // Carga la lista de pistas asociadas a una canción
    loadSongTracks(trackList) {
      this.stop();
      // Limpiar tracks anteriores
      tracks.forEach(t => {
        if (t.audio) {
          try {
            t.audio.pause();
            t.audio.src = "";
          } catch (e) {}
        }
        if (t.gainNode) {
          try { t.gainNode.disconnect(); } catch (e) {}
        }
        if (t.pannerNode) {
          try { t.pannerNode.disconnect(); } catch (e) {}
        }
      });

      const ctx = getAudioContext();
      tracks = (trackList || []).map(raw => {
        const t = {
          id: raw.id,
          name: raw.name || "Pista",
          url: raw.url,
          volume: raw.volume !== undefined ? raw.volume : 80,
          pan: raw.pan !== undefined ? raw.pan : 0,
          muted: !!raw.muted,
          solo: !!raw.solo,
          duration: raw.duration || 0,
          date: raw.date || "",
          type: raw.type || "instrument",
          audio: null,
          source: null,
          gainNode: null,
          pannerNode: null,
          loaded: false
        };

        if (t.url) {
          try {
            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.preload = "auto";
            audio.src = t.url;

            if (ctx) {
              const source = ctx.createMediaElementSource(audio);
              const gainNode = ctx.createGain();
              let pannerNode = null;

              if (ctx.createStereoPanner) {
                pannerNode = ctx.createStereoPanner();
                pannerNode.pan.setValueAtTime((t.pan || 0) / 100, ctx.currentTime);
              }

              source.connect(gainNode);
              if (pannerNode) {
                gainNode.connect(pannerNode);
                pannerNode.connect(masterGainNode);
              } else {
                gainNode.connect(masterGainNode);
              }

              t.audio = audio;
              t.source = source;
              t.gainNode = gainNode;
              t.pannerNode = pannerNode;
            } else {
              t.audio = audio;
            }

            audio.addEventListener("loadedmetadata", () => {
              t.loaded = true;
              t.duration = audio.duration;
              updateMasterDuration();
              notifyStateChange();
            });

            audio.addEventListener("ended", () => {
              // Comprobar si todas terminaron
              const allEnded = tracks.every(item => !item.audio || item.audio.ended || item.audio.paused);
              if (allEnded && isPlaying) {
                this.stop();
              }
            });

            audio.load();
          } catch (err) {
            console.warn("No se pudo conectar Web Audio para la pista:", t.name, err);
            // Fallback con audio normal
            t.audio = new Audio(t.url);
          }
        }

        return t;
      });

      recalculateGains();
      updateMasterDuration();
      notifyStateChange();
    },

    getTracks() {
      return tracks;
    },

    async play() {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        await ctx.resume();
      }

      if (tracks.length === 0) return;

      recalculateGains();

      const playPromises = [];
      tracks.forEach(t => {
        if (t.audio && t.url) {
          try {
            t.audio.currentTime = masterCurrentTime;
            const p = t.audio.play();
            if (p && typeof p.catch === "function") {
              playPromises.push(p.catch(e => console.warn("Error play pista:", t.name, e)));
            }
          } catch (e) {
            console.warn("Excepción al reproducir pista:", t.name, e);
          }
        }
      });

      isPlaying = true;
      startSyncLoop();
      notifyStateChange();
      notifyTimeUpdate();
    },

    pause() {
      tracks.forEach(t => {
        if (t.audio) {
          try {
            t.audio.pause();
          } catch (e) {}
        }
      });
      isPlaying = false;
      stopSyncLoop();
      notifyStateChange();
      notifyTimeUpdate();
    },

    togglePlay() {
      if (isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    stop() {
      this.pause();
      masterCurrentTime = 0;
      tracks.forEach(t => {
        if (t.audio) {
          try {
            t.audio.currentTime = 0;
          } catch (e) {}
        }
      });
      notifyTimeUpdate();
      notifyStateChange();
    },

    seek(timeSeconds) {
      const validTime = Math.max(0, Math.min(timeSeconds, masterDuration || 9999));
      masterCurrentTime = validTime;
      tracks.forEach(t => {
        if (t.audio) {
          try {
            t.audio.currentTime = validTime;
          } catch (e) {}
        }
      });
      notifyTimeUpdate();
    },

    setTrackVolume(trackId, volumePercent) {
      const t = tracks.find(item => String(item.id) === String(trackId));
      if (!t) return;
      t.volume = Math.max(0, Math.min(100, volumePercent));
      recalculateGains();
    },

    setTrackPan(trackId, panPercent) {
      const t = tracks.find(item => String(item.id) === String(trackId));
      if (!t) return;
      t.pan = Math.max(-100, Math.min(100, panPercent));
      if (t.pannerNode && audioCtx) {
        try {
          t.pannerNode.pan.setTargetAtTime(t.pan / 100, audioCtx.currentTime, 0.02);
        } catch (e) {
          t.pannerNode.pan.value = t.pan / 100;
        }
      }
    },

    setTrackMute(trackId, isMuted) {
      const t = tracks.find(item => String(item.id) === String(trackId));
      if (!t) return;
      t.muted = isMuted !== undefined ? !!isMuted : !t.muted;
      recalculateGains();
      notifyStateChange();
    },

    setTrackSolo(trackId, isSolo) {
      const t = tracks.find(item => String(item.id) === String(trackId));
      if (!t) return;
      t.solo = isSolo !== undefined ? !!isSolo : !t.solo;
      recalculateGains();
      notifyStateChange();
    },

    setMasterVolume(volumePercent) {
      const vol = Math.max(0, Math.min(100, volumePercent)) / 100;
      if (masterGainNode && audioCtx) {
        try {
          masterGainNode.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.02);
        } catch (e) {
          masterGainNode.gain.value = vol;
        }
      }
    },

    getCurrentTime() {
      return masterCurrentTime;
    },

    getDuration() {
      return masterDuration;
    },

    isPlaying() {
      return isPlaying;
    },

    onTimeUpdate(callback) {
      if (typeof callback === "function") {
        timeUpdateCallbacks.push(callback);
      }
    },

    onStateChange(callback) {
      if (typeof callback === "function") {
        stateChangeCallbacks.push(callback);
      }
    },

    clearListeners() {
      timeUpdateCallbacks = [];
      stateChangeCallbacks = [];
    },

    // -------------------------------------------------------------
    // GRABACIÓN DE NUEVA PISTA CON MONITOREO SIMULTÁNEO
    // -------------------------------------------------------------

    async startRecordingTrack(options = {}) {
      if (isRecording) return;
      const { listenBackingTracks = true, onTimeTick } = options;

      // Obtener acceso al micrófono
      recordStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Permitir calidad musical sin supresión agresiva
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Detectar formato soportado
      const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg'
      ];
      let selectedMime = '';
      for (const t of types) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
          selectedMime = t;
          break;
        }
      }

      mediaRecorder = selectedMime ? new MediaRecorder(recordStream, { mimeType: selectedMime }) : new MediaRecorder(recordStream);
      recordChunks = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          recordChunks.push(e.data);
        }
      };

      // Si el usuario quiere escuchar las otras pistas de fondo mientras canta/toca
      if (listenBackingTracks && tracks.length > 0) {
        this.stop(); // Volver al inicio
        await this.play(); // Iniciar pistas de fondo sincronizadas
      }

      mediaRecorder.start(100);
      isRecording = true;
      recordStartTime = Date.now();

      if (recordTimer) clearInterval(recordTimer);
      recordTimer = setInterval(() => {
        const elapsedSecs = Math.floor((Date.now() - recordStartTime) / 1000);
        if (typeof onTimeTick === "function") {
          onTimeTick(elapsedSecs);
        }
      }, 1000);
    },

    stopRecordingTrack() {
      return new Promise((resolve, reject) => {
        if (!isRecording || !mediaRecorder) {
          resolve(null);
          return;
        }

        if (recordTimer) {
          clearInterval(recordTimer);
          recordTimer = null;
        }

        // Detener pistas de fondo
        this.pause();

        mediaRecorder.onstop = () => {
          if (recordStream) {
            recordStream.getTracks().forEach(tr => tr.stop());
            recordStream = null;
          }

          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('webm') ? 'webm' : 'mp3';
          const blob = new Blob(recordChunks, { type: mimeType });

          isRecording = false;
          mediaRecorder = null;
          recordChunks = [];

          resolve({
            blob: blob,
            extension: ext,
            duration: Math.floor((Date.now() - recordStartTime) / 1000)
          });
        };

        try {
          mediaRecorder.stop();
        } catch (e) {
          reject(e);
        }
      });
    },

    isRecording() {
      return isRecording;
    }
  };
})();
