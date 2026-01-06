import React from 'react';

/**
 * SecurityOverlay Component
 * 
 * Displays a warning overlay when security is compromised:
 * - Focus lost (tab switch, window minimized)
 * - DevTools detected
 * - Security violation triggered
 * 
 * Features:
 * - Full-screen dark overlay
 * - Warning message with icon
 * - Animated appearance
 * - Different messages for different security states
 */
const SecurityOverlay = ({
    type = 'blur', // 'blur' | 'devtools' | 'violation' | 'session'
    isVisible = false,
    onRetry = null
}) => {
    if (!isVisible) return null;

    const messages = {
        blur: {
            icon: '👁️',
            title: 'Content Hidden',
            message: 'This window has lost focus. Click here to continue viewing.',
            action: 'Click to Resume',
            bgColor: 'rgba(0, 0, 0, 0.95)'
        },
        devtools: {
            icon: '🛡️',
            title: 'Security Alert',
            message: 'Developer tools detected. Content is hidden for security purposes. Please close developer tools to continue.',
            action: 'Close DevTools to Continue',
            bgColor: 'rgba(127, 29, 29, 0.98)' // Dark red
        },
        violation: {
            icon: '⚠️',
            title: 'Action Blocked',
            message: 'This action is not allowed. All activity is logged for security.',
            action: null,
            bgColor: 'rgba(0, 0, 0, 0.9)'
        },
        session: {
            icon: '🔒',
            title: 'Session Expired',
            message: 'Your viewing session has ended. You may have logged in from another device.',
            action: 'Return to Login',
            bgColor: 'rgba(0, 0, 0, 0.98)'
        }
    };

    const config = messages[type] || messages.blur;

    return (
        <div
            className="security-overlay"
            onClick={onRetry}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: config.bgColor,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: onRetry ? 'pointer' : 'default',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                `}
            </style>

            <div
                style={{
                    textAlign: 'center',
                    padding: '48px',
                    maxWidth: '500px',
                    animation: type === 'violation' ? 'shake 0.5s ease-out' : 'none'
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        fontSize: '64px',
                        marginBottom: '24px',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    {config.icon}
                </div>

                {/* Title */}
                <h2
                    style={{
                        color: '#ffffff',
                        fontSize: '28px',
                        fontWeight: '700',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px'
                    }}
                >
                    {config.title}
                </h2>

                {/* Message */}
                <p
                    style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        marginBottom: '32px'
                    }}
                >
                    {config.message}
                </p>

                {/* Action Button */}
                {config.action && (
                    <div
                        style={{
                            display: 'inline-block',
                            padding: '14px 28px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                    >
                        {config.action}
                    </div>
                )}

                {/* Security Notice */}
                <p
                    style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '12px',
                        marginTop: '40px',
                        fontFamily: 'monospace'
                    }}
                >
                    🔒 This content is protected. All activity is monitored.
                </p>
            </div>
        </div>
    );
};

export default SecurityOverlay;
