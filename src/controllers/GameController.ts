// src/controllers/GameController.ts
import { Socket } from 'socket.io';
import { Player } from '../models/Player';
import { PokerGame } from '../models/PokerGame';
import { UserService } from '../db/UserService';

export class GameController {
    private game: PokerGame;
    private userService: UserService;


    constructor(userService: UserService) { // Accept UserService in the constructor
        this.userService = userService;
        this.game = new PokerGame(userService); // Pass UserService to PokerGame
    }
     // Method to get the total pot
     public getTotalPot(): number {
        return this.game.pot;
    }

    public async joinGame(socket: Socket, playerName: string, inputamount: number) {

        try {
            // Fetch the player's balance by calling the async function and awaiting its result
            const amount = await this.userService.getPlayerBalance(playerName);
    
            // Check if amount is null before proceeding
            if (amount === null) {
                socket.emit('error', 'Could not retrieve player balance.'); // Handle the error as needed
                return;
            }
    
            const player = new Player(socket.id, playerName, amount);
            console.log(player);
    
            this.game.addPlayer(player);
            socket.broadcast.emit('playerJoined', playerName);
            socket.emit('gameState', this.game.getGameState());
    
            // If there are 2 or more players, and the game is not active, start the game
            if (this.game.players.length >= 2 && !this.game.isActive()) {
                this.setActivePlayers();
                this.game.startGame();
                socket.broadcast.emit('gameStarted', `${playerName} joined, game is starting!`);
                socket.emit('gameStarted', 'Game is starting!');
            } else if (this.game.isActive()) {
                socket.emit('info', 'Game is already in progress. You can watch the game.');
            }
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('error', 'An error occurred while joining the game.');
        }
    }
    
    // Set players as active
    private setActivePlayers() {
        this.game.players.forEach(player => {
            player.isActive = true; // Mark each player as active when the game starts
        });

        this.game.players.forEach(player => {

            console.log(player);
            
        });
        

    }
    
   // Inside GameController.ts
public placeBet(socket: Socket, betAmount: number) {
    const player = this.game.getPlayer(socket.id);
    if (player && player.isActive) {
        this.game.placeBet(player, betAmount);
        socket.broadcast.emit('betPlaced', { playerName: player.name, betAmount });
        console.log(`${player.name} placed a bet of ${betAmount}`);
        console.log(`${player.name} totalPot ${this.game.pot}`);
        socket.broadcast.emit('totalPot', this.game.pot); // Emit total pot

    }
}

public call(socket: Socket) {
    const player = this.game.getPlayer(socket.id);
    if (player && player.isActive) {
        this.game.call(player);
        console.log(`${player.name} totalPot ${this.game.pot}`);
        socket.broadcast.emit('playerCalled', { playerName: player.name });
    }
}

public raise(socket: Socket, raiseAmount: number) {
    const player = this.game.getPlayer(socket.id);
    if (player && player.isActive) {
        this.game.raise(player, raiseAmount);
        console.log(`${player.name} totalPot ${this.game.pot}`);
        socket.broadcast.emit('playerRaised', { playerName: player.name, raiseAmount });
    }
}

public fold(socket: Socket) {
    const player = this.game.getPlayer(socket.id);
    if (player && player.isActive) {
        this.game.fold(player);
        socket.broadcast.emit('playerFolded', { playerName: player.name });
    }

    const activePlayersCount = this.game.getActivePlayersCount();

    if (activePlayersCount === 1) {
        const remainingPlayer = this.game.getRemainingActivePlayer();
        if (remainingPlayer) {
            // Declare the remaining player as the winner
            socket.broadcast.emit('gameEnded', { winner: remainingPlayer.name });
            socket.emit('gameEnded', { winner: remainingPlayer.name });

            // Restart the game after declaring the winner
            console.log("Only one player left, restarting the game...");
            this.restartGame;
        }
    }
}

public getBalanceOfUser(socket: Socket) {
    const player = this.game.getPlayer(socket.id);
    console.log("Player found "+ player?.name);
    
    socket.emit('balanceUpdated', player?.chips);
}

public getPlayerName(socket: Socket) {
    // Retrieve the player associated with the socket ID
    const player = this.game.getPlayer(socket.id);
    
    // Log the player object or null if not found
    console.log("Player found on PlayerName method: ", player?.name);
    
    // Emit the player's name back to the specific socket
    if (player) {
        socket.emit('playerName', player?.name); // Emit the name if player exists
    } else {
        console.error(`Player not found for socket ID: ${socket.id}`); // Log an error if player not found
        socket.emit('playerName', null); // Emit null if no player found
    }
}


    public dealCards(socket: Socket) {
        const cards = this.game.dealFlop();
        socket.emit('cardsDealt', cards);
        socket.broadcast.emit('cardsDealt', cards);
    }

    public disconnectPlayer(socket: Socket) {
        const player = this.game.removePlayer(socket.id);
        if (player) {
            console.log(`${player.name} has left the game.`);
        }
    }

    public restartGame(socket: Socket) {
        this.game = new PokerGame(this.userService); // Create a fresh game instance
        console.log("Game has been restarted.");

        // Notify all players that the game has been restarted
        socket.broadcast.emit('gameRestarted', 'The game has been restarted!');
        socket.emit('gameRestarted', 'The game has been restarted!');
    }
}
