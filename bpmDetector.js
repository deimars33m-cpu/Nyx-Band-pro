/**
 * @file bpmDetector.js
 * @description Módulo para detectar el BPM de un archivo de audio usando la Web Audio API.
 * Expone window.BpmDetector con métodos para analizar archivos y generar cuadrículas de ritmos (beat grids).
 */

window.BpmDetector = (function() {
    
    // Rango de BPM soportado
    const MIN_BPM = 60;
    const MAX_BPM = 200;
    
    /**
     * Analiza un archivo de audio para detectar su BPM, confianza, forma de onda y beats.
     * @param {File} file - El archivo de audio a analizar (proveniente de un input type="file").
     * @returns {Promise<{bpm: number, confidence: number, waveformData: Float32Array, duration: number, beats: Array<number>}>}
     */
    async function analyzeFile(file) {
        // Crear contexto de audio para decodificar
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('Web Audio API no está soportada en este navegador.');
        }
        const audioCtx = new AudioContextClass();
        
        try {
            // Leer archivo como ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Decodificar los datos de audio
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            // Extraer forma de onda (downsampling a ~2000 puntos para visualización)
            const waveformData = getWaveformData(audioBuffer, 2000);
            
            // Filtrar y obtener datos de frecuencia baja (bajos/bombos)
            const lowPassBuffer = await applyLowPassFilter(audioBuffer);
            
            // Calcular BPM y confianza usando autocorrelación
            const { bpm, confidence, offset } = detectBPM(lowPassBuffer);
            
            // Generar los timestamps de los beats
            const beats = generateBeatGrid(bpm, audioBuffer.duration, offset);
            
            return {
                bpm,
                confidence,
                waveformData,
                duration: audioBuffer.duration,
                beats
            };
            
        } finally {
            // Cerrar el contexto de audio para liberar recursos
            if (audioCtx.state !== 'closed') {
                await audioCtx.close();
            }
        }
    }
    
    /**
     * Extrae los datos de la forma de onda reducidos a un número específico de puntos.
     * @param {AudioBuffer} buffer - El buffer de audio original.
     * @param {number} points - Número de puntos para la forma de onda (ej. 2000).
     * @returns {Float32Array}
     */
    function getWaveformData(buffer, points) {
        // Mezclamos los canales o usamos el primero para la forma de onda
        const channelData = buffer.getChannelData(0); 
        const step = Math.ceil(channelData.length / points);
        const waveform = new Float32Array(points);
        
        for (let i = 0; i < points; i++) {
            let max = 0;
            // Encontrar el valor máximo absoluto en este segmento
            for (let j = 0; j < step; j++) {
                const index = (i * step) + j;
                if (index < channelData.length) {
                    const value = Math.abs(channelData[index]);
                    if (value > max) max = value;
                }
            }
            waveform[i] = max;
        }
        
        return waveform;
    }
    
    /**
     * Aplica un filtro pasa-bajos para enfocar el análisis en las frecuencias bajas (ej. bombo).
     * @param {AudioBuffer} buffer - Buffer de audio original.
     * @returns {Promise<AudioBuffer>}
     */
    async function applyLowPassFilter(buffer) {
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
            1, // Mono para el análisis
            buffer.length,
            buffer.sampleRate
        );
        
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        
        // Filtro para aislar los golpes de bajo / bombo
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150; // Cortar frecuencias por encima de 150Hz
        
        source.connect(filter);
        filter.connect(offlineCtx.destination);
        
        source.start(0);
        return await offlineCtx.startRendering();
    }
    
    /**
     * Calcula el envolvente de energía y detecta el BPM usando autocorrelación.
     * @param {AudioBuffer} buffer - Buffer de audio filtrado (pasa-bajos).
     * @returns {{bpm: number, confidence: number, offset: number}}
     */
    function detectBPM(buffer) {
        const sampleRate = buffer.sampleRate;
        const channelData = buffer.getChannelData(0);
        
        // Reducir la frecuencia de muestreo para la autocorrelación (ej. 200 Hz para acelerar)
        const targetFs = 200;
        const step = Math.floor(sampleRate / targetFs);
        
        const energyEnvelope = [];
        
        // Calcular energía por bloques (suavizado)
        for (let i = 0; i < channelData.length; i += step) {
            let sum = 0;
            let count = 0;
            for (let j = 0; j < step && (i + j) < channelData.length; j++) {
                sum += Math.abs(channelData[i + j]);
                count++;
            }
            energyEnvelope.push(sum / count);
        }
        
        // Calcular límites de retardo (lags) según el rango de BPM deseado
        const minLag = Math.floor(targetFs * (60 / MAX_BPM));
        const maxLag = Math.floor(targetFs * (60 / MIN_BPM));
        
        let maxCorrelation = 0;
        let bestLag = minLag;
        
        // Guardar las correlaciones para calcular la confianza
        const correlations = new Float32Array(maxLag - minLag + 1);
        
        // Autocorrelación estándar
        for (let lag = minLag; lag <= maxLag; lag++) {
            let correlation = 0;
            for (let i = 0; i < energyEnvelope.length - lag; i++) {
                correlation += energyEnvelope[i] * energyEnvelope[i + lag];
            }
            correlations[lag - minLag] = correlation;
            
            // Buscar el pico más alto
            if (correlation > maxCorrelation) {
                maxCorrelation = correlation;
                bestLag = lag;
            }
        }
        
        // Calcular el BPM basado en el mejor lag (periodo de retardo)
        const bpm = 60 / (bestLag / targetFs);
        
        // Calcular confianza
        // Calculamos la media de las correlaciones en el rango
        let sumCorrelations = 0;
        for (let i = 0; i < correlations.length; i++) {
            sumCorrelations += correlations[i];
        }
        const meanCorrelation = sumCorrelations / correlations.length;
        
        // Confianza: relación entre el pico máximo y la media
        // Se normaliza empíricamente para obtener un valor entre 0 y 1
        let confidence = 0;
        if (meanCorrelation > 0) {
            const ratio = maxCorrelation / meanCorrelation;
            confidence = Math.min(1, Math.max(0, (ratio - 1) / 3));
        }
        
        // Calcular el offset aproximado del primer beat
        // Buscamos el pico de energía dentro de la primera ventana del tamaño de un beat
        let maxEnergy = 0;
        let offsetIndex = 0;
        
        const beatSamples = bestLag; // Muestras por beat en nuestra señal submuestreada
        const searchRange = Math.min(beatSamples, energyEnvelope.length);
        
        for (let i = 0; i < searchRange; i++) {
            if (energyEnvelope[i] > maxEnergy) {
                maxEnergy = energyEnvelope[i];
                offsetIndex = i;
            }
        }
        
        const offset = offsetIndex / targetFs;
        
        return {
            bpm: Math.round(bpm * 10) / 10, // Redondear a 1 decimal
            confidence: Math.round(confidence * 100) / 100, // Redondear a 2 decimales
            offset
        };
    }
    
    /**
     * Genera un arreglo de marcas de tiempo (en segundos) para cada beat.
     * @param {number} bpm - Los latidos por minuto detectados.
     * @param {number} duration - La duración total del audio en segundos.
     * @param {number} offset - El desplazamiento del primer beat en segundos (por defecto 0).
     * @returns {Array<number>}
     */
    function generateBeatGrid(bpm, duration, offset = 0) {
        const beats = [];
        const secondsPerBeat = 60 / bpm;
        
        let currentBeat = offset;
        
        // Asegurarse de no perder beats al principio debido al offset
        while (currentBeat - secondsPerBeat >= 0) {
            currentBeat -= secondsPerBeat;
        }
        
        // Generar puntos de tiempo para todos los beats a lo largo del audio
        while (currentBeat < duration) {
            if (currentBeat >= 0) {
                beats.push(currentBeat);
            }
            currentBeat += secondsPerBeat;
        }
        
        return beats;
    }
    
    // API expuesta globalmente
    return {
        analyzeFile,
        generateBeatGrid
    };
})();
