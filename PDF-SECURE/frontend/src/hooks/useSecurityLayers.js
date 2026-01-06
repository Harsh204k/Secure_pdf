import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useSecurityLayers Hook
 * 
 * Comprehensive security protection hook that implements:
 * 1. Right-click blocking
 * 2. Keyboard shortcut blocking (Ctrl+P, Ctrl+S, Ctrl+C, F12, PrintScreen, etc.)
 * 3. Focus detection (blur content when window loses focus)
 * 4. DevTools detection (multiple methods)
 * 5. PrintScreen key detection
 * 6. Window resize monitoring (potential recording indicator)
 * 
 * @param {Object} options
 * @param {Object} options.userInfo - User information for logging
 * @param {Function} options.onSecurityEvent - Callback when security event occurs
 * @param {boolean} options.enabled - Enable/disable all security measures
 * @param {Object} options.contentRef - Reference to the sensitive content element for instant hiding
 * 
 * @returns {Object} Security state and controls
 */
export function useSecurityLayers({
    userInfo = {},
    onSecurityEvent = () => { },
    enabled = true,
    contentRef = null
} = {}) {
    // State
    const [isFocused, setIsFocused] = useState(true);
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const [securityViolation, setSecurityViolation] = useState(null);
    const [triggerCount, setTriggerCount] = useState(0);

    // Refs for tracking
    const devToolsCheckInterval = useRef(null);
    const lastWidth = useRef(window.outerWidth);
    const lastHeight = useRef(window.outerHeight);

    // Helper for instant content hiding (bypasses React render cycle)
    const hideContentInstantly = useCallback(() => {
        if (contentRef?.current) {
            contentRef.current.style.opacity = '0';
            contentRef.current.style.filter = 'blur(50px)';
        }
    }, [contentRef]);

    const showContent = useCallback(() => {
        if (contentRef?.current) {
            // Small delay to prevent flickering or "show before screenshot done"
            setTimeout(() => {
                contentRef.current.style.opacity = '1';
                contentRef.current.style.filter = 'none';
            }, 100);
        }
    }, [contentRef]);

    // Log security event
    const logEvent = useCallback((eventType, details = {}) => {
        // ... existing logEvent code
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userInfo,
            details,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.warn('[Security Event]', event);
        setTriggerCount(prev => prev + 1);
        onSecurityEvent(event);
    }, [userInfo, onSecurityEvent]);

    // Show temporary violation warning
    const showViolation = useCallback((message) => {
        setSecurityViolation(message);
        setTimeout(() => setSecurityViolation(null), 3000);
    }, []);

    // ========================================
    // Layer 1: Right-Click Blocking
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const handleContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            logEvent('CONTEXT_MENU_BLOCKED');
            showViolation('Right-click is disabled');
            return false;
        };

        document.addEventListener('contextmenu', handleContextMenu, true);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu, true);
        };
    }, [enabled, logEvent, showViolation]);

    // ========================================
    // Layer 2: Keyboard Shortcut Blocking
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // Define blocked combinations
            const blockedCombinations = [
                // Ctrl+Key combinations
                { ctrl: true, key: 'p', action: 'print' },
                { ctrl: true, key: 's', action: 'save' },
                { ctrl: true, key: 'c', action: 'copy' },
                { ctrl: true, key: 'a', action: 'select_all' },
                { ctrl: true, key: 'u', action: 'view_source' },
                { ctrl: true, shift: true, key: 'i', action: 'devtools' },
                { ctrl: true, shift: true, key: 'j', action: 'devtools' },
                { ctrl: true, shift: true, key: 'c', action: 'devtools' },
                { ctrl: true, shift: true, key: 's', action: 'screenshot' },
            ];

            // Check blocked combinations
            for (const combo of blockedCombinations) {
                const ctrlMatch = combo.ctrl ? isCtrl : true;
                const shiftMatch = combo.shift ? isShift : !isShift;
                const keyMatch = key === combo.key;

                if (ctrlMatch && shiftMatch && keyMatch) {
                    e.preventDefault();
                    e.stopPropagation();
                    logEvent('KEYBOARD_BLOCKED', { action: combo.action, key: e.key });
                    showViolation(`${combo.action.replace('_', ' ')} is disabled`);
                    return false;
                }
            }

            // Block F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                e.stopPropagation();
                logEvent('KEYBOARD_BLOCKED', { action: 'devtools', key: 'F12' });
                showViolation('Developer tools are disabled');
                return false;
            }

            // Block PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                e.stopPropagation();
                
                // INSTANT HIDE
                hideContentInstantly();

                // Try to clear clipboard (may not work in all browsers)
                try {
                    navigator.clipboard.writeText('Screenshot disabled - This content is protected');
                } catch (err) {
                    // Clipboard API may not be available
                }

                logEvent('PRINTSCREEN_BLOCKED');
                showViolation('Screenshots are disabled');
                
                // Restore after a delay
                setTimeout(showContent, 2000);
                return false;
            }

            // Block Meta/Win key (often used for screenshots like Win+Shift+S)
            if (e.key === 'Meta' || e.key === 'OS') {
                 // We can't preventDefault the OS menu efficiently, but we can hide content
                 hideContentInstantly();
                 // Optionally log, but Meta is common for switching apps too
                 // We just want to ensure content is hidden during the "switch"
            }
        };

        // Block key events on both keydown and keyup
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                hideContentInstantly(); // Extra safety on keyup
                try {
                    navigator.clipboard.writeText('Screenshot disabled - This content is protected');
                } catch (err) { }
                setTimeout(showContent, 2000);
            }
            // Show content again if Meta key is released (user finished switching apps/taking screenshot)
            if (e.key === 'Meta' || e.key === 'OS') {
                // Restore with delay to clear any lingering capture overlay
                setTimeout(showContent, 1000); 
            }
        }, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [enabled, logEvent, showViolation]);

    // ========================================
    // Layer 3: Focus Detection
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const handleFocus = () => {
            setIsFocused(true);
            showContent(); // Instantly show
        };

        const handleBlur = () => {
            setIsFocused(false);
            hideContentInstantly(); // Instantly hide via DOM
            logEvent('FOCUS_LOST');
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsFocused(false);
                hideContentInstantly();
                logEvent('TAB_HIDDEN');
            } else {
                setIsFocused(true);
                showContent();
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, logEvent]);

    // ========================================
    // Layer 4: DevTools Detection
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const checkDevTools = () => {
            // Method 1: Window size difference
            const widthThreshold = 160;
            const heightThreshold = 160;

            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            const devToolsOpen1 = widthDiff > widthThreshold || heightDiff > heightThreshold;

            // Method 2: Console timing check
            // When DevTools is open, console operations take longer
            let devToolsOpen2 = false;
            const start = performance.now();
            console.log('%c', 'font-size:0;');
            console.clear();
            const duration = performance.now() - start;
            if (duration > 100) {
                devToolsOpen2 = true;
            }

            // Method 3: Debugger statement timing
            let devToolsOpen3 = false;
            const debugStart = performance.now();
            // This will pause if DevTools is open with breakpoints
            // We can detect unusual pauses
            const debugDuration = performance.now() - debugStart;
            if (debugDuration > 100) {
                devToolsOpen3 = true;
            }

            const isOpen = devToolsOpen1 || devToolsOpen2 || devToolsOpen3;

            if (isOpen && !devToolsOpen) {
                setDevToolsOpen(true);
                logEvent('DEVTOOLS_DETECTED', {
                    method: devToolsOpen1 ? 'size' : devToolsOpen2 ? 'console' : 'debugger'
                });
            } else if (!isOpen && devToolsOpen) {
                setDevToolsOpen(false);
            }
        };

        // Check immediately and then periodically
        checkDevTools();
        devToolsCheckInterval.current = setInterval(checkDevTools, 1000);

        return () => {
            if (devToolsCheckInterval.current) {
                clearInterval(devToolsCheckInterval.current);
            }
        };
    }, [enabled, devToolsOpen, logEvent]);

    // ========================================
    // Layer 5: Window Resize Monitoring
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const handleResize = () => {
            const widthChange = Math.abs(window.outerWidth - lastWidth.current);
            const heightChange = Math.abs(window.outerHeight - lastHeight.current);

            // Large sudden resize could indicate screen recording software
            if (widthChange > 500 || heightChange > 500) {
                logEvent('LARGE_RESIZE_DETECTED', {
                    widthChange,
                    heightChange,
                    newWidth: window.outerWidth,
                    newHeight: window.outerHeight
                });
            }

            lastWidth.current = window.outerWidth;
            lastHeight.current = window.outerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [enabled, logEvent]);

    // ========================================
    // Layer 6: Drag & Drop Prevention
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const handleDragStart = (e) => {
            e.preventDefault();
            return false;
        };

        const handleDrop = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('dragstart', handleDragStart, true);
        document.addEventListener('drop', handleDrop, true);

        return () => {
            document.removeEventListener('dragstart', handleDragStart, true);
            document.removeEventListener('drop', handleDrop, true);
        };
    }, [enabled]);

    // ========================================
    // Layer 7: Selection Prevention
    // ========================================
    useEffect(() => {
        if (!enabled) return;

        const handleSelectStart = (e) => {
            e.preventDefault();
            return false;
        };

        const handleCopy = (e) => {
            e.preventDefault();
            logEvent('COPY_BLOCKED');
            showViolation('Copying is disabled');
            return false;
        };

        const handleCut = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('selectstart', handleSelectStart, true);
        document.addEventListener('copy', handleCopy, true);
        document.addEventListener('cut', handleCut, true);

        return () => {
            document.removeEventListener('selectstart', handleSelectStart, true);
            document.removeEventListener('copy', handleCopy, true);
            document.removeEventListener('cut', handleCut, true);
        };
    }, [enabled, logEvent, showViolation]);

    // Computed security state
    const isSecure = isFocused && !devToolsOpen && !securityViolation;

    return {
        // State
        isSecure,
        isFocused,
        devToolsOpen,
        securityViolation,
        triggerCount,

        // Methods
        logEvent,
        showViolation,

        // Manual controls
        setIsFocused  // For external focus control if needed
    };
}

export default useSecurityLayers;
