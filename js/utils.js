/* ========================
   Utility Functions
   ======================== */

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
function radiansToDegrees(radians) {
    return (radians * 180) / Math.PI;
}

/**
 * Calculate distance between two points
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point is within circle
 */
function isPointInCircle(px, py, cx, cy, radius) {
    return distance(px, py, cx, cy) <= radius;
}

/**
 * Calculate moving average
 */
class MovingAverage {
    constructor(windowSize = 5) {
        this.windowSize = windowSize;
        this.values = [];
    }

    add(value) {
        this.values.push(value);
        if (this.values.length > this.windowSize) {
            this.values.shift();
        }
    }

    getAverage() {
        if (this.values.length === 0) return 0;
        return this.values.reduce((a, b) => a + b, 0) / this.values.length;
    }

    reset() {
        this.values = [];
    }

    isFull() {
        return this.values.length === this.windowSize;
    }
}

/**
 * Format time from seconds to MM:SS
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate random color
 */
function randomColor() {
    const colors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E2',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Random number between min and max
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Smooth interpolation (Lerp)
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Easing functions
 */
const Easing = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => 1 + (--t) * t * t,
    elasticOut: (t) => {
        const n = 1 / 0.5;
        if (t === 0 || t === 1) return t;
        return (
            1 * Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * n * Math.PI) / 2) + 1
        );
    },
    bounceOut: (t) => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    },
};

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Request Animation Frame promise
 */
function animationFramePromise() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * Load audio file
 */
function loadAudio(url) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.src = url;
    });
}

/**
 * Play sound effect
 */
function playSound(audio, volume = 1) {
    if (audio) {
        audio.volume = clamp(volume, 0, 1);
        audio.currentTime = 0;
        audio.play().catch((e) => console.log('Audio play failed:', e));
    }
}

/**
 * Text to speech
 */
function speak(text, rate = 1, pitch = 1) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        speechSynthesis.speak(utterance);
    }
}

/**
 * Cancel text to speech
 */
function cancelSpeech() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
}

/**
 * Local storage with JSON support
 */
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
};

/**
 * Validation utilities
 */
const Validation = {
    isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isPhone: (phone) => /^\d{10}$/.test(phone.replace(/\D/g, '')),
    isURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },
    isEmpty: (value) => value === null || value === undefined || value === '',
    isNumber: (value) => !isNaN(parseFloat(value)) && isFinite(value),
};

/**
 * Performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        return this.fps;
    }

    getFPS() {
        return this.fps;
    }
}

/**
 * Event bus for communication
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach((callback) => callback(data));
        }
    }

    clear() {
        this.events = {};
    }
}

/**
 * Create a canvas element
 */
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

/**
 * Draw circle on canvas
 */
function drawCircle(ctx, x, y, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }
}

/**
 * Draw text on canvas
 */
function drawText(ctx, text, x, y, font = '16px Arial', fillColor = '#000', align = 'left') {
    ctx.font = font;
    ctx.fillStyle = fillColor;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

/**
 * Clear canvas
 */
function clearCanvas(ctx, x = 0, y = 0, width = ctx.canvas.width, height = ctx.canvas.height) {
    ctx.clearRect(x, y, width, height);
}

/**
 * Apply image filter to canvas
 */
function applyCanvasFilter(ctx, brightness = 0, contrast = 0) {
    // Brightness: -100 to 100
    // Contrast: -100 to 100

    const brightnessValue = 1 + brightness / 100;
    const contrastValue = 1 + contrast / 100;

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Apply contrast
        data[i] = (data[i] - 128) * contrastValue + 128;
        data[i + 1] = (data[i + 1] - 128) * contrastValue + 128;
        data[i + 2] = (data[i + 2] - 128) * contrastValue + 128;

        // Apply brightness
        data[i] *= brightnessValue;
        data[i + 1] *= brightnessValue;
        data[i + 2] *= brightnessValue;

        // Clamp values
        data[i] = clamp(data[i], 0, 255);
        data[i + 1] = clamp(data[i + 1], 0, 255);
        data[i + 2] = clamp(data[i + 2], 0, 255);
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Flip canvas horizontally
 */
function flipCanvasHorizontal(ctx, width, height) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
}

/**
 * Flip canvas vertically
 */
function flipCanvasVertical(ctx, width, height) {
    ctx.translate(0, height);
    ctx.scale(1, -1);
}

/**
 * Reset canvas transforms
 */
function resetCanvasTransform(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * Get canvas pixel data
 */
function getCanvasPixelData(ctx, x, y, width, height) {
    return ctx.getImageData(x, y, width, height);
}

/**
 * Log message with timestamp
 */
function logDebug(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    if (data) {
        console.log(`[${timestamp}] ${message}`, data);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
}

/**
 * Export all utilities to window if not in module context
 */
if (typeof module === 'undefined') {
    window.GameUtils = {
        degreesToRadians,
        radiansToDegrees,
        distance,
        isPointInCircle,
        MovingAverage,
        formatTime,
        randomColor,
        randomBetween,
        clamp,
        lerp,
        Easing,
        debounce,
        throttle,
        animationFramePromise,
        loadAudio,
        playSound,
        speak,
        cancelSpeech,
        Storage,
        Validation,
        PerformanceMonitor,
        EventBus,
        createCanvas,
        drawCircle,
        drawText,
        clearCanvas,
        applyCanvasFilter,
        flipCanvasHorizontal,
        flipCanvasVertical,
        resetCanvasTransform,
        getCanvasPixelData,
        logDebug,
    };
}
