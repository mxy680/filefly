const corsOptions = {
    origin: 'http://localhost:3000', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
};

export default corsOptions;
