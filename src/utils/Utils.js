export class Utils {
    // Random number generation
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static getRandomFromArray(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Math utilities
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }

    // String utilities
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return {
            hours: hours,
            minutes: minutes,
            seconds: Math.floor(secs),
            formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}`
        };
    }

    static capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(this.lerp(c1.r, c2.r, factor));
        const g = Math.round(this.lerp(c1.g, c2.g, factor));
        const b = Math.round(this.lerp(c1.b, c2.b, factor));
        
        return this.rgbToHex(r, g, b);
    }

    // Array utilities
    static removeFromArray(array, item) {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    static getUniqueItems(array, key = null) {
        if (key) {
            return array.filter((item, index, self) =>
                index === self.findIndex(t => t[key] === item[key])
            );
        }
        return [...new Set(array)];
    }

    static groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    }

    // Object utilities
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (typeof obj === "object") {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
    }

    static isEmpty(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    }

    static merge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.merge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    // Validation utilities
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static isValidNumber(value) {
        return !isNaN(value) && isFinite(value);
    }

    static isInRange(value, min, max) {
        return value >= min && value <= max;
    }

    // Local storage utilities
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    static clearStorage(key = null) {
        try {
            if (key) {
                localStorage.removeItem(key);
            } else {
                localStorage.clear();
            }
            return true;
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
            return false;
        }
    }

    // Performance utilities
    static debounce(func, wait) {
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

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Game-specific utilities
    static calculateScore(baseScore, timeBonus, difficultyMultiplier) {
        return Math.floor(baseScore * difficultyMultiplier + timeBonus);
    }

    static getPerformanceRating(score, maxScore) {
        const percentage = (score / maxScore) * 100;
        
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 80) return 'Great';
        if (percentage >= 70) return 'Good';
        if (percentage >= 60) return 'Average';
        return 'Needs Improvement';
    }

    static formatProgressPercentage(current, total) {
        if (total === 0) return 0;
        return Math.round((current / total) * 100);
    }

    // Direction utilities
    static getDirectionFromAngle(angle) {
        const normalizedAngle = this.normalizeAngle(angle);
        const degrees = (normalizedAngle * 180) / Math.PI;
        
        if (degrees >= 315 || degrees < 45) return 'right';
        if (degrees >= 45 && degrees < 135) return 'down';
        if (degrees >= 135 && degrees < 225) return 'left';
        return 'up';
    }

    static getAngleFromDirection(direction) {
        const angles = {
            'right': 0,
            'down': Math.PI / 2,
            'left': Math.PI,
            'up': (3 * Math.PI) / 2
        };
        return angles[direction] || 0;
    }

    // Grid utilities
    static snapToGrid(value, gridSize) {
        return Math.round(value / gridSize) * gridSize;
    }

    static worldToGrid(x, y, gridSize) {
        return {
            x: Math.floor(x / gridSize),
            y: Math.floor(y / gridSize)
        };
    }

    static gridToWorld(gridX, gridY, gridSize) {
        return {
            x: gridX * gridSize,
            y: gridY * gridSize
        };
    }

    // Collision utilities
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    static rectsOverlap(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return r1x < r2x + r2w && r1x + r1w > r2x && r1y < r2y + r2h && r1y + r1h > r2y;
    }

    static circlesOverlap(c1x, c1y, c1r, c2x, c2y, c2r) {
        const distance = this.distance(c1x, c1y, c2x, c2y);
        return distance < c1r + c2r;
    }

    // Error handling
    static safeExecute(func, defaultValue = null, context = null) {
        try {
            return context ? func.call(context) : func();
        } catch (error) {
            console.warn('Safe execution failed:', error);
            return defaultValue;
        }
    }

    static retry(func, maxAttempts = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const attempt = () => {
                attempts++;
                
                try {
                    const result = func();
                    
                    if (result instanceof Promise) {
                        result
                            .then(resolve)
                            .catch(error => {
                                if (attempts < maxAttempts) {
                                    setTimeout(attempt, delay);
                                } else {
                                    reject(error);
                                }
                            });
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    if (attempts < maxAttempts) {
                        setTimeout(attempt, delay);
                    } else {
                        reject(error);
                    }
                }
            };
            
            attempt();
        });
    }

    // Debug utilities
    static logPerformance(label, func, context = null) {
        const startTime = performance.now();
        const result = context ? func.call(context) : func();
        const endTime = performance.now();
        
        console.log(`${label} took ${endTime - startTime} milliseconds`);
        return result;
    }

    static createUID() {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
}
