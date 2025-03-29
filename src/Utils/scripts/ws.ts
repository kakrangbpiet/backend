import { WebSocketServer } from 'ws';

// Initialize the Blockchain SDK with provider URL from the request

export function setupWebSocketServer(server) {
    const wss = new WebSocketServer({ server });

    console.log('WebSocket server is running on port 3000');

    wss.on('connection', (ws) => {
        console.log('Client connected');

        ws.on('message', (message) => {
            const data = JSON.parse(message.toString());
         
        });

        ws.send(JSON.stringify({ message: 'Connected to WebSocket' }));
    });
}

