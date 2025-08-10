// Priority 2: Webcam and Canvas Integration
// Priority 3: Hand Tracking Integration  
// Priority 4: Audio Synthesis Setup

// Get references to DOM elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startButton');
const testButtonsDiv = document.getElementById('testButtons');
const testC4Button = document.getElementById('testC4');
const testE4Button = document.getElementById('testE4');
const testG4Button = document.getElementById('testG4');
const stopSoundButton = document.getElementById('stopSound');

// Priority 4: Audio Synthesis Setup - State variables
let synth;
let soundEnabled = false;
let lastPlayedNote = null;

// Priority 5: Musical Scale Definition - Notes mapped from top to bottom of screen
const noteScale = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
console.log('Musical scale defined:', noteScale);

console.log('DOM elements loaded:', {
    videoElement: !!videoElement,
    canvasElement: !!canvasElement,
    canvasCtx: !!canvasCtx,
    startButton: !!startButton,
    testButtonsDiv: !!testButtonsDiv,
    testC4Button: !!testC4Button,
    testE4Button: !!testE4Button,
    testG4Button: !!testG4Button,
    stopSoundButton: !!stopSoundButton
});

console.log('Audio state variables initialized:', {
    synth: synth,
    soundEnabled: soundEnabled,
    lastPlayedNote: lastPlayedNote
});

// Check if Tone.js is loaded
console.log('Checking if Tone.js is loaded...');
if (typeof Tone !== 'undefined') {
    console.log('Tone.js is loaded successfully. Version:', Tone.version || 'unknown');
    console.log('Tone object:', Tone);
} else {
    console.error('Tone.js is NOT loaded! This will cause audio initialization to fail.');
}

// Initialize MediaPipe Hands
console.log('Initializing MediaPipe Hands...');
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

console.log('MediaPipe Hands configured with options:', {
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// Define the onResults callback function for MediaPipe
function onResults(results) {
    console.log('MediaPipe onResults callback triggered');
    console.log('Results received:', {
        image: !!results.image,
        multiHandLandmarks: results.multiHandLandmarks ? results.multiHandLandmarks.length : 0
    });
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    console.log('Canvas cleared, setting up mirror view');
    // Flip the canvas horizontally for a "mirror" view
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvasElement.width, 0);

    // Draw the video frame
    console.log('Drawing video frame on canvas');
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // If hand landmarks are detected, draw them
    if (results.multiHandLandmarks) {
        console.log(`Drawing ${results.multiHandLandmarks.length} hand(s) with landmarks`);
        for (const landmarks of results.multiHandLandmarks) {
            console.log('Drawing hand connections and landmarks');
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
            
            // Log index finger tip position for debugging
            const indexFingerTip = landmarks[8]; // Landmark 8 is the tip of the index finger
            console.log('Index finger tip position:', {
                x: indexFingerTip.x.toFixed(3),
                y: indexFingerTip.y.toFixed(3),
                z: indexFingerTip.z.toFixed(3)
            });
        }
    } else {
        console.log('No hand landmarks detected');
    }
    
    // Priority 5: Hand Position to Pitch Mapping Logic
    console.log('=== PITCH MAPPING LOGIC START ===');
    console.log('Sound enabled status:', soundEnabled);
    console.log('Current synth object:', !!synth);
    console.log('Last played note before processing:', lastPlayedNote);
    
    if (soundEnabled && synth) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // Landmark 8 is the tip of the index finger
            const indexFingerTip = results.multiHandLandmarks[0][8];
            const yPos = indexFingerTip.y; // Normalized value from 0.0 (top) to 1.0 (bottom)
            
            console.log('Hand detected! Index finger Y position:', yPos.toFixed(4));
            console.log('Screen position breakdown:', {
                raw_y: yPos,
                percentage_from_top: (yPos * 100).toFixed(1) + '%',
                is_top_half: yPos < 0.5 ? 'YES' : 'NO',
                is_bottom_half: yPos >= 0.5 ? 'YES' : 'NO'
            });
            
            // Map the Y-position to a note in our scale
            const noteIndex = Math.min(Math.floor(yPos * noteScale.length), noteScale.length - 1);
            const currentNote = noteScale[noteIndex];
            
            console.log('Note mapping calculation:', {
                yPos: yPos.toFixed(4),
                scale_length: noteScale.length,
                raw_index: yPos * noteScale.length,
                clamped_index: noteIndex,
                selected_note: currentNote
            });
            
            // Play the note, but only if it's different from the last one
            if (currentNote && currentNote !== lastPlayedNote) {
                console.log(`*** NOTE CHANGE DETECTED! ***`);
                console.log(`Changing from "${lastPlayedNote}" to "${currentNote}"`);
                
                // Release the previous note first
                if (lastPlayedNote !== null) {
                    console.log(`Releasing previous note: ${lastPlayedNote}`);
                    synth.triggerRelease();
                }
                
                // Attack the new note
                console.log(`Attacking new note: ${currentNote}`);
                synth.triggerAttack(currentNote);
                lastPlayedNote = currentNote;
                
                console.log(`Audio state updated - lastPlayedNote is now: ${lastPlayedNote}`);
            } else {
                console.log('Note mapping result: Same note as before, no audio change needed');
                console.log(`Current note: ${currentNote}, Last played: ${lastPlayedNote}`);
            }
        } else {
            // No hand detected - release any playing note
            console.log('NO HAND DETECTED');
            if (lastPlayedNote !== null) {
                console.log(`Releasing note due to no hand: ${lastPlayedNote}`);
                synth.triggerRelease();
                lastPlayedNote = null;
                console.log('lastPlayedNote reset to null - no sound should be playing');
            } else {
                console.log('No hand detected and no note was playing - no action needed');
            }
        }
    } else {
        console.log('Audio processing skipped - sound not enabled or synth not available');
        console.log('Debug audio state:', {
            soundEnabled: soundEnabled,
            synth_available: !!synth,
            reason: !soundEnabled ? 'Sound disabled' : 'Synth not available'
        });
    }
    console.log('=== PITCH MAPPING LOGIC END ===');
    
    canvasCtx.restore();
    console.log('Canvas state restored, frame processing complete');
}

// Set the onResults callback for MediaPipe Hands
hands.onResults(onResults);
console.log('onResults callback set for MediaPipe Hands');

// Priority 4: Audio Test Functions
function setupTestButtonListeners() {
    console.log('Setting up test button event listeners...');
    
    testC4Button.addEventListener('click', () => {
        console.log('Test C4 button clicked');
        if (synth && soundEnabled) {
            console.log('Playing C4 note for 1 second');
            synth.triggerAttackRelease('C4', '1s');
            console.log('C4 note triggered');
        } else {
            console.log('Cannot play C4 - synth not available or sound disabled');
        }
    });
    
    testE4Button.addEventListener('click', () => {
        console.log('Test E4 button clicked');
        if (synth && soundEnabled) {
            console.log('Playing E4 note for 1 second');
            synth.triggerAttackRelease('E4', '1s');
            console.log('E4 note triggered');
        } else {
            console.log('Cannot play E4 - synth not available or sound disabled');
        }
    });
    
    testG4Button.addEventListener('click', () => {
        console.log('Test G4 button clicked');
        if (synth && soundEnabled) {
            console.log('Playing G4 note for 1 second');
            synth.triggerAttackRelease('G4', '1s');
            console.log('G4 note triggered');
        } else {
            console.log('Cannot play G4 - synth not available or sound disabled');
        }
    });
    
    stopSoundButton.addEventListener('click', () => {
        console.log('Stop sound button clicked');
        if (synth) {
            console.log('Stopping all synthesizer sounds');
            synth.triggerRelease();
            lastPlayedNote = null;
            console.log('All sounds stopped, lastPlayedNote reset to null');
        } else {
            console.log('Cannot stop sound - synth not available');
        }
    });
    
    console.log('All test button event listeners have been set up successfully');
}

// Note: The old manual onFrame function has been removed 
// since MediaPipe's onResults callback now handles all video frame drawing

// Start button event listener with camera and MediaPipe integration
startButton.addEventListener('click', async () => {
    console.log('Start button clicked - initializing camera, MediaPipe integration, and audio synthesis');
    
    // Hide the button after starting
    startButton.style.display = 'none';
    console.log('Start button hidden');
    
    // Priority 4: Initialize Audio
    console.log('Initializing Tone.js audio context...');
    try {
        await Tone.start();
        console.log('Tone.js audio context started successfully');
        
        console.log('Creating synthesizer with sine wave oscillator...');
        synth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 }
        }).toDestination();
        
        console.log('Synthesizer created and connected to destination');
        console.log('Synth configuration:', {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 }
        });
        
        soundEnabled = true;
        console.log('Audio context started and synth created. Sound enabled:', soundEnabled);
        
        // Show test buttons now that audio is working
        testButtonsDiv.style.display = 'block';
        console.log('Test buttons are now visible for audio testing');
        
        // Test the synth with a quick beep
        console.log('Testing synthesizer with a quick C4 note...');
        synth.triggerAttackRelease('C4', '0.2s');
        console.log('Test note played - synthesizer is working');
        
        // Add event listeners for test buttons
        console.log('Adding event listeners for test buttons...');
        setupTestButtonListeners();
        
    } catch (error) {
        console.error('Failed to initialize audio:', error);
        console.log('Audio will be disabled due to initialization error');
        soundEnabled = false;
    }
    
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            console.log('Camera onFrame callback - sending frame to MediaPipe');
            // Send the video frame to MediaPipe for hand detection
            await hands.send({image: videoElement});
        },
        width: 640,
        height: 480
    });
    
    console.log('Camera object created with MediaPipe integration, starting camera...');
    camera.start();
    console.log('Camera started - MediaPipe will now process frames and trigger onResults callback');
});