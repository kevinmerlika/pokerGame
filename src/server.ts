// src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './socket'; // Import your socket setup function
import { GameController } from './controllers/GameController';
import { UserService } from './db/UserService';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Initialize the GameController
const userService = new UserService(); // Create an instance of UserService

const gameController = new GameController(userService);

// Set up socket.io
setupSocket(io, gameController);

// Serve static files (e.g., your HTML and JS)
app.use(express.static('public')); // Make sure your public folder contains the necessary HTML and JS files

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
