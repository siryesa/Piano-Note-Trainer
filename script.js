document.addEventListener('DOMContentLoaded', function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const microphone = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            microphone.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const noteDisplay = document.getElementById('note-display');

            function identifyNote() {
                const frequencyData = new Float32Array(analyser.frequencyBinCount);
                analyser.getFloatFrequencyData(frequencyData);

                const peakFrequency = findPeakFrequency(frequencyData);
                const detectedNote = mapFrequencyToNote(peakFrequency);

                console.log('Detected Note:', detectedNote);

                noteDisplay.innerText = 'Detected Note: ' + detectedNote;

                return detectedNote;
            }

            function findPeakFrequency(dataArray) {
                let maxAmplitude = -Infinity;
                let peakIndex = 0;

                for (let i = 0; i < dataArray.length; i++) {
                    if (dataArray[i] > maxAmplitude) {
                        maxAmplitude = dataArray[i];
                        peakIndex = i;
                    }
                }

                const sampleRate = audioContext.sampleRate;
                const frequency = peakIndex * (sampleRate / analyser.fftSize);

                return frequency;
            }

            function mapFrequencyToNote(frequency) {
                const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

                const noteIndex = Math.round(12 * Math.log2(frequency / 440) + 49);
                const noteName = noteNames[noteIndex % 12];
                const octave = Math.floor(noteIndex / 12) - 1;

                return `${noteName}${octave}`;
            }

            function processAudio() {
                analyser.getByteTimeDomainData(dataArray);
                identifyNote();
                requestAnimationFrame(processAudio);
            }

            processAudio();
        })
        .catch(function (error) {
            console.error('Error accessing microphone:', error);
        });
});