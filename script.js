// Priority 2: Webcam and Canvas Integration
// Priority 3: Hand Tracking Integration

// Get references to DOM elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startButton');

console.log('DOM elements loaded:', {
    videoElement: !!videoElement,
    canvasElement: !!canvasElement,
    canvasCtx: !!canvasCtx,
    startButton: !!startButton
});

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
    
    // We will add audio logic here in step 5
    canvasCtx.restore();
    console.log('Canvas state restored, frame processing complete');
}

// Set the onResults callback for MediaPipe Hands
hands.onResults(onResults);
console.log('onResults callback set for MediaPipe Hands');

// Note: The old manual onFrame function has been removed 
// since MediaPipe's onResults callback now handles all video frame drawing

// Start button event listener with camera and MediaPipe integration
startButton.addEventListener('click', () => {
    console.log('Start button clicked - initializing camera and MediaPipe integration');
    
    // Hide the button after starting
    startButton.style.display = 'none';
    console.log('Start button hidden');
    
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