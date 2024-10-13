import { UserService } from '../db/UserService';
import { HandEvaluator } from './HandEvaluator';
import { Player } from './Player';

export class PokerGame {

    private handEvaluator: HandEvaluator;
    private userService: UserService; // Declare a UserService property

    constructor(userService: UserService) { // Accept UserService in the constructor
        this.handEvaluator = new HandEvaluator();
        this.userService = userService; // Initialize the UserService
    }


    private deck: string[] = [];
    public players: Player[] = [];
    private communityCards: string[] = [];
    public currentBet: number = 0;
    public pot: number = 0;
    private currentPlayerIndex: number = 0;
    private gameActive: boolean = false;
    private currentRound: number = 0; // Track the round of betting
    private actionsInRound: number = 0; // Track actions in the current round

    public addPlayer(player: Player) {
        console.log(player);
        
        this.players.push(player);
    }

    public isActive() {
        return this.gameActive;
    }

    public removePlayer(playerId: string) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        return playerIndex >= 0 ? this.players.splice(playerIndex, 1)[0] : undefined;
    }

    public getPlayer(playerId: string): Player | undefined {
        return this.players.find(player => player.id === playerId);
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async startGame() {
        if (this.players.length < 2) throw new Error("At least two players are required.");

        // Fetch and update players' balances with a delay
        for (const player of this.players) {
            try {
                // Introduce a 1-second delay before fetching the balance
                await this.delay(1000); // 1000 milliseconds = 1 second
                
                const balance = await this.userService.getPlayerBalance(player.name); // Await balance fetch
                if (balance !== null) {
                    player.chips = balance; // Update the player's balance (chips) in the object
                    console.log(`Updated balance for player ${player.name}: ${balance}`);
                } else {
                    console.error(`Could not fetch balance for player ${player.name}.`);
                }
            } catch (error) {
                console.error(`Error fetching balance for player ${player.name}:`, error);
            }
        }

        // Set the game state and initialize the round
        this.currentPlayerIndex = 0;
        this.gameActive = true;
        this.currentRound = 0; // Reset round tracker

        // Deal cards to players (pre-flop)
        this.dealPreFlop();

        // Log the start of the game
        console.log(`Game started. It's ${this.getCurrentPlayer().name}'s turn.`);
    }
    

    public getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    public nextTurn(): void {
        const activePlayers = this.getActivePlayers();  // Get active players
    
        if (activePlayers.length === 0) {
            console.log("No active players left.");
            return;
        }
    
        // Update currentPlayerIndex to the next active player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;
        
        console.log(`It's now ${activePlayers[this.currentPlayerIndex].name}'s turn.`);
    
        // If all active players have acted, proceed to the next round
        if (this.allPlayersHaveActed()) {
            console.log("All players have acted-----"+activePlayers[this.currentPlayerIndex].name);
            
            this.nextRound();
        }
    }

    public getActivePlayers(): Player[] {
        return this.players.filter(player => player.isActive && !player.folded);
    }
    // Method to check how many active players remain
    public getActivePlayersCount(): number {
        return this.players.filter(player => player.isActive && !player.folded).length;
    }

    // Optional: Method to retrieve the remaining active player (for declaring winner)
    public getRemainingActivePlayer(): Player | undefined {
        return this.players.find(player => player.isActive && !player.folded);
    }

    public nextRound() {
        this.currentRound++;
        console.log("Current Round  " +this.currentRound);
        
        switch (this.currentRound) {
            case 1:
                this.dealFlop();
                break;
            case 2:
                this.dealTurn();
                break;
            case 3:
                this.dealRiver();
                break;
            case 4:
                this.determineWinner();
                this.restartGame();
                break;
            default:
                console.log("Invalid round.");
                break;
        }
        this.actionsInRound = 0; // Reset actions after each round
    }

    private allPlayersHaveActed(): boolean {
        const activePlayers = this.getActivePlayers();  // Get only active players
        return this.actionsInRound >= activePlayers.length;
    }

    public restartGame() {
        this.players.forEach(player => {
            player.hand = [];
            player.isActive = true;
            player.folded = false;
            player.totalSpend = 0;
        });
        this.communityCards = [];
        this.pot = 0;
        this.gameActive = true;
        
        console.log("Game has been restarted.");
        
        // Start the new round (deal cards, etc.)
        
        this.startGame();
    }
    

    public placeBet(player: Player, betAmount: number) {
        if (!this.gameActive || player !== this.getCurrentPlayer() || betAmount <= 0 || player.chips < betAmount) {
            return;
        }

        player.placeBet(betAmount);
        this.pot += betAmount;
        this.currentBet = Math.max(this.currentBet, player.currentBet);
        console.log(`${player.name} placed a bet of ${betAmount}. Current pot: ${this.pot}`);
        this.actionsInRound++;
        this.nextTurn();
    }

    public call(player: Player) {
        if (player !== this.getCurrentPlayer()) return;
        const amountToCall = this.currentBet - player.currentBet;
        this.placeBet(player, amountToCall);
        console.log(`${player.name} called with ${amountToCall}.`);
    }

    public raise(player: Player, raiseAmount: number) {
        if (player !== this.getCurrentPlayer()) return;
        const totalBet = player.currentBet + raiseAmount;
        if (totalBet > player.chips || raiseAmount <= 0) return;
        this.placeBet(player, raiseAmount);
        console.log(`${player.name} raised by ${raiseAmount}.`);
    }

    public fold(player: Player) {
        if (player !== this.getCurrentPlayer()) return;

        player.fold();
        console.log(`${player.name} folded.`);
        const activePlayers = this.players.filter(p => !p.folded && p.isActive);

        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            winner.chips += this.pot;
            player.isActive = false;
            console.log(`${winner.name} wins the pot of ${this.pot} by default.`);
            console.log(activePlayers);
            this.determineWinner();
            this.restartGame();
        } else {
            this.nextTurn();
        }
    }

    public dealPreFlop() {
        this.deck = this.createDeck();
        this.shuffleDeck(this.deck);
        this.players.forEach(player => {
            if(player.isActive){
            player.hand = [this.drawCard(), this.drawCard()];
            }
        });
        console.log("Pre-Flop dealt.");
        this.players.forEach(player => {
            if(player.isActive){
            console.log(`${player.name}'s hand: ${player.hand.join(', ')}`);
            }
        });
        this.actionsInRound = 0; // Reset action count for pre-flop
    }

    public dealFlop() {
        if (this.communityCards.length > 0) return; // Flop already dealt
        this.communityCards = [this.drawCard(), this.drawCard(), this.drawCard()];
        console.log("Flop dealt. Community cards:", this.communityCards);
    }

    public dealTurn() {
        if (this.communityCards.length < 3) return; // Flop must be dealt before Turn
        this.communityCards.push(this.drawCard());
        console.log("Turn dealt. Community cards:", this.communityCards);
    }

    public dealRiver() {
        if (this.communityCards.length < 4) return; // Turn must be dealt before River
        this.communityCards.push(this.drawCard());
        console.log("River dealt. Community cards:", this.communityCards);
    }

    public async determineWinner() {
        const activePlayers = this.players.filter(player => (player.isActive || !player.folded) && player.hand.length > 0);
    
        console.log(activePlayers);
    
        if (activePlayers.length === 0) {
            console.log("No active players. No winner.");
            return;
        }
    
        let bestHandValue = -1;
        let bestHighCards: number[] = [];
        let winners: Player[] = []; // Array to store multiple winners in case of a tie
    
        activePlayers.forEach(player => {
            const { rank, highCards } = this.handEvaluator.evaluateHand(player.hand, this.communityCards);
            console.log(`Evaluating ${player.name}'s hand: Rank: ${rank}, High Cards: ${highCards}`);
    
            if (rank > bestHandValue) {
                bestHandValue = rank;
                bestHighCards = highCards;
                winners = [player]; // Set new winner
            } else if (rank === bestHandValue) {
                const comparison = this.handEvaluator.compareHighCards(highCards, bestHighCards);
                if (comparison > 0) {
                    bestHighCards = highCards;
                    winners = [player]; // Set new winner
                } else if (comparison === 0) {
                    winners.push(player); // Add to winners in case of a tie
                }
            }
        });
    
        // Handle winners
    
        
        if (winners.length > 0) {
            const potAmount = this.pot / winners.length; // Split the pot if there are multiple winners
            winners.forEach(async winner => {
                winner.chips += potAmount; // Add pot amount to winner's chips
                console.log(`${winner.name} wins ${potAmount} chips from the pot of ${this.pot}.`);
                await this.userService.updateBalance(winner.name, winner.chips); // Update winner's balance
            });
        } else {
            console.log("No winner could be determined.");
        }
    
        // Update losers' balances
        const losers = this.players.filter(player => !winners.includes(player) && player.isActive); // Find all players who didn't win and are active
    
        losers.forEach(async loser => {
            const contribution = loser.totalSpend || 0; // Assuming you track how much each player contributed to the pot
            console.log(`${loser.name} loses ${contribution} chips.`);
            await this.userService.updateBalance(loser.name, loser.chips); // Update loser's balance
        });
    
        // Reset pot after distributing
        this.pot = 0;
    
        this.gameActive = false; // End the game
    }
        



    private createDeck(): string[] {
        const suits = ['S', 'C', 'D', 'H'];
        const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
        return suits.flatMap(suit => ranks.map(rank => rank + suit));
    }

    private drawCard(): string {
        const card = this.deck.pop();
        if (!card) throw new Error("No more cards in the deck.");
        return card;
    }

    private shuffleDeck(deck: string[]): void {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    public getGameState() {
        return {
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                currentBet: p.currentBet,
                chips: p.chips
            })),
            currentBet: this.currentBet,
            pot: this.pot,
            communityCards: this.communityCards,
            currentPlayer: this.getCurrentPlayer().name
        };
    }
}
