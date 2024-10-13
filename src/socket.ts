// src/socket.ts
import { Server, Socket } from 'socket.io';
import { GameController } from './controllers/GameController';

export const setupSocket = (io: Server, gameController: GameController) => {
    io.on('connection', (socket) => {
        console.log('A player connected:', socket.id);

        // Listen for a player joining the game
        socket.on('joinGame', (playerName: string) => {
            gameController.joinGame(socket, playerName,1000);
            emitTotalPot(io, gameController);
            emitName(gameController,socket)

        });


        socket.on('playerName', () => {
            gameController.getPlayerName(socket);

        });
        // Listen for placing bets
        socket.on('placeBet', (betAmount: number) => {
            gameController.placeBet(socket, betAmount);
            emitTotalPot(io, gameController);
            emitBalance(gameController,socket)
            emitName(gameController,socket)



        });

        // Listen for calling a bet
        socket.on('call', () => {
            gameController.call(socket);
            emitTotalPot(io, gameController);

        });

        // Listen for raising a bet
        socket.on('raise', (raiseAmount: number) => {
            gameController.raise(socket, raiseAmount);
            emitTotalPot(io, gameController);

        });


        socket.on('balanceUpdated', () => {
            gameController.getBalanceOfUser(socket)
            emitBalance(gameController,socket)

        });

        // Listen for folding
        socket.on('fold', () => {
            gameController.fold(socket);
        });

        // Listen for dealing cards
        socket.on('dealCards', () => {
            gameController.dealCards(socket);
        });

        // Listen for player disconnection
        socket.on('disconnect', () => {
            console.log('A player disconnected:', socket.id);
            gameController.disconnectPlayer(socket);
        });

        socket.on('restartGame', () => {
            gameController.restartGame(socket);
        });
    });

    // Function to emit the total pot to all connected clients
const emitTotalPot = (io: Server, gameController: GameController) => {
    const totalPot = gameController.getTotalPot(); // Assuming GameController has a method getTotalPot()
    io.emit('totalPotUpdated', totalPot); // Emit the total pot to all connected clients
};


const emitBalance = async (gameController: GameController, socket: Socket) => {
    const balance = await gameController.getBalanceOfUser(socket); // Fetch balance for the specific player
    socket.emit('balance', balance); // Emit the updated balance to the specific player
};

const emitName =  (gameController: GameController, socket: Socket) => {
    gameController.getPlayerName(socket); // Fetch balance for the specific player
};


};

