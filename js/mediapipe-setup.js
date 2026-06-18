/* ========================
   MediaPipe Face Detection Setup
   ======================== */

class MediaPipeManager {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.canvasElement = null;
        this.videoElement = null;
        this.isInitialized = false;
        this.gazeData = {
            x: 0,
            y: 0,
            confidence: 0,
            faceDetected: false,
            leftEyeOpen: false,
            rightEyeOpen: false,
        };
        this.onResults = null;
        this.gazeHistory = new (window.GameUtils || {}).MovingAverage?.(5) || { add: () => {}, getAverage: () => 0 };
    }

    async initialize(videoElement, canvasElement) {
        try {
            this.videoElement = videoElement;
            this.canvasElement = canvasElement;

            // Initialize Face Mesh
            this.faceMesh = new window.FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                },
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            this.faceMesh.onResults(this.processResults.bind(this));

            // Initialize camera
            this.camera = new window.Camera(videoElement, {
                onFrame: async () => {
                    await this.faceMesh.send({ image: videoElement });
                },
                width: 320,
                height: 240,
            });

            await this.camera.initialize();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('MediaPipe initialization failed:', error);
            return false;
        }
    }

    processResults(results) {
        // Clear canvas
        const ctx = this.canvasElement.getContext('2d');
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];

            // Update gaze data
            this.updateGazePosition(landmarks);

            // Draw face mesh
            if (results.multiFaceLandmarks) {
                window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, {
                    color: '#C0C0C070',
                    lineWidth: 0.5,
                });

                window.drawLandmarks(ctx, landmarks, { color: '#FF5722', lineWidth: 1 });
            }

            this.gazeData.faceDetected = true;
        } else {
            this.gazeData.faceDetected = false;
            this.gazeData.x = 0;
            this.gazeData.y = 0;
            this.gazeData.confidence = 0;
        }

        // Execute callback
        if (this.onResults) {
            this.onResults(this.gazeData);
        }
    }

    updateGazePosition(landmarks) {
        // Eye landmarks indices
        // Right eye: 362, 385, 387, 263
        // Left eye: 33, 160, 158, 133

        const rightEyeRight = landmarks[362];
        const rightEyeLeft = landmarks[263];
        const rightEyeTop = landmarks[387];
        const rightEyeBottom = landmarks[385];

        const leftEyeRight = landmarks[160];
        const leftEyeLeft = landmarks[33];
        const leftEyeTop = landmarks[158];
        const leftEyeBottom = landmarks[133];

        // Calculate eye centers
        const rightEyeCenter = {
            x: (rightEyeRight.x + rightEyeLeft.x) / 2,
            y: (rightEyeTop.y + rightEyeBottom.y) / 2,
        };

        const leftEyeCenter = {
            x: (leftEyeRight.x + leftEyeLeft.x) / 2,
            y: (leftEyeTop.y + leftEyeBottom.y) / 2,
        };

        // Average both eyes
        const gazeX = (rightEyeCenter.x + leftEyeCenter.x) / 2;
        const gazeY = (rightEyeCenter.y + leftEyeCenter.y) / 2;

        // Map to screen coordinates
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        this.gazeData.x = gazeX * screenWidth;
        this.gazeData.y = gazeY * screenHeight;
        this.gazeData.confidence = 0.8; // Placeholder
    }

    async startTracking() {
        if (this.camera && !this.camera.started) {
            await this.camera.start();
        }
    }

    async stopTracking() {
        if (this.camera && this.camera.started) {
            await this.camera.stop();
        }
    }

    async switchCamera(deviceId) {
        if (!this.camera) return false;

        try {
            await this.camera.stop();

            // Re-initialize with new device
            const video = this.videoElement;
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;

            await this.camera.start();
            return true;
        } catch (error) {
            console.error('Failed to switch camera:', error);
            return false;
        }
    }

    async listCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter((device) => device.kind === 'videoinput');
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            return [];
        }
    }

    getGazeData() {
        return this.gazeData;
    }

    requestCameraPermission() {
        return navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                // Stop the stream as we only needed permission
                stream.getTracks().forEach((track) => track.stop());
                return true;
            })
            .catch((error) => {
                console.error('Camera permission denied:', error);
                return false;
            });
    }

    isInitialized() {
        return this.isInitialized;
    }

    destroy() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.faceMesh) {
            this.faceMesh.close();
        }
    }
}

// Global instance
const mediaPipeManager = new MediaPipeManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaPipeManager;
}
