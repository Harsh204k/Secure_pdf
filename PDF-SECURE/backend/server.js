const express = require('express');
const cors = require('cors'); // Restart trigger
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


// Middleware
const allowedOrigins = [
    "https://secure-pdf-frontend.vercel.app",
    "http://localhost:5173",
    "https://vercel.com/harshs-projects-f860a6fa/secure-pdf-backend",
    "https://secure-pdf-backend.vercel.app"
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

// Handle Preflight Requests explicitly using the same options
app.options('*', cors(corsOptions));

// Debug Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

app.use(cors(corsOptions));
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');

const pdfRoutes = require('./routes/pdfRoutes');
const groupRoutes = require('./routes/groupRoutes');
const securityRoutes = require('./routes/securityRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/security', securityRoutes);

app.get('/', (req, res) => {
    res.send('Secure PDF Viewer API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Structured JSON error response
    res.status(status).json({
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
