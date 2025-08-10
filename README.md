# Theremin Hand

A web-based musical instrument that transforms your webcam into a theremin controller. Move your index finger vertically to control pitch and create music with hand gestures.

## Overview

This project creates a virtual theremin that uses computer vision to track hand movements and generate corresponding musical notes. The vertical position of your index finger controls the pitch, mapping to a musical scale displayed on screen.

## Features

- **Real-time Hand Tracking**: Uses Google's MediaPipe to detect hand landmarks with 21-point precision
- **Audio Synthesis**: Powered by Tone.js for high-quality sound generation with sine wave oscillator
- **Visual Feedback**: Live webcam display with hand landmark visualization and musical scale overlay
- **Interactive Scale**: 8-note scale from C4 to C5 with visual highlighting of currently playing notes
- **Mirror Mode**: Horizontally flipped video display for natural interaction

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hand Detection**: MediaPipe Hands
- **Audio Synthesis**: Tone.js (Web Audio API)
- **Visualization**: HTML5 Canvas API
- **Camera Access**: MediaPipe Camera Utils

## Implementation Highlights

### Hand-to-Pitch Mapping
```javascript
// Maps normalized Y-position (0.0-1.0) to musical notes
const noteScale = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
const noteIndex = Math.min(Math.floor(yPos * noteScale.length), noteScale.length - 1);
const currentNote = noteScale[noteIndex];
```

### Real-time Audio Control
- **Attack/Release System**: Smooth note transitions using Tone.js envelope controls
- **State Management**: Prevents audio glitches by tracking the last played note
- **Gesture Detection**: Automatically releases notes when no hand is detected

### Visual Interface
- **Mirrored Video Feed**: Natural interaction with horizontally flipped camera view
- **Landmark Overlay**: Green connections and red dots showing hand structure
- **Scale Visualization**: Live highlighting of active notes with semi-transparent backgrounds
- **Grid Indicators**: Dashed lines showing pitch zones

### Performance Optimizations
- **Single Hand Tracking**: Configured for one hand to reduce computational load
- **Efficient Drawing**: Canvas state management for optimal rendering performance
- **Audio Context Handling**: Proper initialization following browser audio policies

## Quick Start

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Click "Start" and allow camera access
4. Move your index finger vertically in the camera view
5. Use test buttons to verify audio functionality

## Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Webcam access permissions
- Audio playback capabilities

## File Structure

```
theremin_hand/
├── index.html          # Main HTML structure
├── script.js           # Core application logic
├── style.css           # Styling and layout
└── project_implementation_plan.md  # Development roadmap
```

## Development Notes

The project follows a modular architecture with clear separation of concerns:
- **Camera Module**: Webcam initialization and frame capture
- **Hand Tracking Module**: MediaPipe integration and landmark detection
- **Audio Module**: Tone.js synthesizer setup and note control
- **Visual Module**: Canvas rendering and UI overlay
- **Main Controller**: Orchestrates data flow between modules

The implementation prioritizes real-time performance while maintaining code readability and extensive logging for debugging purposes.