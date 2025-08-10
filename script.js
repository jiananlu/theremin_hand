// Priority 2: Webcam and Canvas Integration

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

// Function to draw video frame on canvas
function onFrame() {
    console.log('Drawing frame - clearing canvas and drawing video');
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    requestAnimationFrame(onFrame);
}

// Start button event listener with camera initialization
startButton.addEventListener('click', () => {
    console.log('Start button clicked - initializing camera');
    
    // Hide the button after starting
    startButton.style.display = 'none';
    console.log('Start button hidden');
    
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            console.log('Camera onFrame callback triggered');
            // For now, we'll just draw the frame manually to test
            // MediaPipe processing will be added in step 3
        },
        width: 640,
        height: 480
    });
    
    console.log('Camera object created, starting camera...');
    camera.start();
    
    console.log('Starting manual drawing loop for testing');
    // Start the manual drawing loop for testing
    // This will be replaced by MediaPipe onResults callback in step 3
    onFrame();
});