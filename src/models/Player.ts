export class Player {
    public currentBet: number = 0; // Amount bet in the current round
    public folded: boolean = false; // Indicates if the player has folded
    public chips: number; // Total chips the player has
    public hand: string[] = []; // Cards in the player's hand
    public isActive: boolean = false; // Indicates if the player is active in the current hand
    public totalSpend: number = 0;


    constructor(public id: string, public name: string, initialChips: number) {
        this.chips = initialChips; // Initialize with a default amount of chips (e.g., 1000)
    }

    /**
     * Places a bet and updates the current bet and available chips.
     * @param amount The amount to bet.
     * @throws Error if the bet amount exceeds available chips.
     */
    public placeBet(amount: number) {
        if (amount <= 0) {
            throw new Error("Bet amount must be greater than zero.");
        }

        if (amount > this.chips) {
            throw new Error("Insufficient chips to place this bet.");
        }

        this.chips -= amount; // Deduct chips
        this.currentBet += amount; // Update current bet for this round
        this.totalSpend += amount;
        console.log(this.name + " amount = " + amount + "tot: "+ this.totalSpend);
        
        
    }

    /**
     * Folds the player, marking them as no longer active in the current round.
     */
    public fold() {
        this.folded = true;
        console.log(`${this.name} has folded.`);
    }

    /**
     * Resets the current bet to 0 after the round is completed.
     */
    public resetBet() {
        this.currentBet = 0; // Reset current bet for the new round
    }

    /**
     * Adds chips back to the player's total.
     * @param amount The amount of chips to add.
     */
    public addChips(amount: number) {
        if (amount <= 0) {
            throw new Error("Amount to add must be greater than zero.");
        }
        this.chips += amount; // Increase total chips
    }

    /**
     * Assigns a hand to the player.
     * @param cards An array of cards to assign to the player.
     */
    public receiveHand(cards: string[]) {
        if (cards.length !== 2) {
            throw new Error("A player must be dealt exactly two cards.");
        }
        this.hand = cards;
    }

    /**
     * Clears the player's hand (for use when a new round starts).
     */
    public clearHand() {
        this.hand = [];
    }
}
