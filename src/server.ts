import express, { Express } from 'express';
import cors from 'cors';
import router from './Routes/index.js';
import { loggerMiddleware } from './Utils/Logger/logger.js';
import { isDatabaseHealthy } from './Utils/db/client';
import bodyParser from 'body-parser';
import { setupSwagger } from './Utils/swagger';
import { setupWebSocketServer } from './Utils/scripts/ws';

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: '*', // or specify the domain explicitly
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'boundary'],
}));

// Payload limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Log incoming request body size
app.use((req, res, next) => {
  console.log(`Incoming request body size: ${JSON.stringify(req.body).length} bytes`);
  next();
});

// Connect to the database
isDatabaseHealthy();

// Middleware logger
app.use("/", loggerMiddleware());

// Setup Swagger
setupSwagger(app);

// Route for handling requests
app.use("/", router);

const PORT = process.env.PORT || 3000;
// Start the server
const server = app.listen(PORT, function(){
  console.log(`Express server listening on port ${PORT} in localhost`);
});

// Initialize WebSocket server
setupWebSocketServer(server);