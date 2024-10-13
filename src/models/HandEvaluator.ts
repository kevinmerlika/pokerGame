export class HandEvaluator {

    // Evaluates and returns the best hand rank and the best 5-card hand combination
    public evaluateHand(playerHand: string[], communityCards: string[]): { rank: number, highCards: number[] } {
        const allCards = [...playerHand, ...communityCards];
        // console.log(`Evaluating hand. Player Cards: ${playerHand}, Community Cards: ${communityCards}`);

        const bestHand = this.getBestFiveCardHand(allCards);
        // console.log(`Best 5-card hand from all cards: ${bestHand}`);

        if (this.isRoyalFlush(bestHand)) {
            // console.log(`Hand: Royal Flush`);
            return { rank: 10, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isStraightFlush(bestHand)) {
            // console.log(`Hand: Straight Flush`);
            return { rank: 9, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isFourOfAKind(bestHand)) {
            // console.log(`Hand: Four of a Kind`);
            return { rank: 8, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isFullHouse(bestHand)) {
            // console.log(`Hand: Full House`);
            return { rank: 7, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isFlush(bestHand)) {
            // console.log(`Hand: Flush`);
            return { rank: 6, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isStraight(bestHand)) {
            // console.log(`Hand: Straight`);
            return { rank: 5, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isThreeOfAKind(bestHand)) {
            // console.log(`Hand: Three of a Kind`);
            return { rank: 4, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isTwoPair(bestHand)) {
            // console.log(`Hand: Two Pair`);
            return { rank: 3, highCards: this.getSortedCardValues(bestHand) };
        }
        if (this.isOnePair(bestHand)) {
            // console.log(`Hand: One Pair`);
            return { rank: 2, highCards: this.getSortedCardValues(bestHand) };
        }

        // Default to high card if no other hand is found
        // console.log(`Hand: High Card`);
        return { rank: 1, highCards: this.getSortedCardValues(bestHand) };
    }

    // Function to get the best 5-card hand out of 7 cards
    private getBestFiveCardHand(cards: string[]): string[] {
        const combinations = this.getCombinations(cards, 5);
        let bestHand: string[] = [];
        let bestRank = 0;
        let bestHighCards: number[] = [];

        combinations.forEach((comb) => {
            const evaluation = this.evaluateHandRanking(comb);
            // console.log(`Evaluating combination: ${comb} - Rank: ${evaluation.rank}, High Cards: ${evaluation.highCards}`);

            if (evaluation.rank > bestRank ||
                (evaluation.rank === bestRank && this.compareHighCards(evaluation.highCards, bestHighCards) > 0)) {
                bestRank = evaluation.rank;
                bestHand = comb;
                bestHighCards = evaluation.highCards;
                // console.log(`New best hand found: ${bestHand} - Rank: ${bestRank}`);
            }
        });

        return bestHand;
    }

    // Helper function to evaluate a 5-card hand and return the rank and sorted high cards
    private evaluateHandRanking(cards: string[]): { rank: number, highCards: number[] } {
        if (this.isRoyalFlush(cards)) {
            return { rank: 10, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isStraightFlush(cards)) {
            return { rank: 9, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isFourOfAKind(cards)) {
            return { rank: 8, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isFullHouse(cards)) {
            return { rank: 7, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isFlush(cards)) {
            return { rank: 6, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isStraight(cards)) {
            return { rank: 5, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isThreeOfAKind(cards)) {
            return { rank: 4, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isTwoPair(cards)) {
            return { rank: 3, highCards: this.getSortedCardValues(cards) };
        }
        if (this.isOnePair(cards)) {
            return { rank: 2, highCards: this.getSortedCardValues(cards) };
        }

        return { rank: 1, highCards: this.getSortedCardValues(cards) };  // High card
    }

    // Helper function to get combinations of a given size
    private getCombinations(cards: string[], combinationSize: number): string[][] {
        const results: string[][] = [];
        const combination = (chosen: string[], rest: string[]) => {
            if (chosen.length === combinationSize) {
                results.push([...chosen]);
                return;
            }
            for (let i = 0; i < rest.length; i++) {
                combination([...chosen, rest[i]], rest.slice(i + 1));
            }
        };
        combination([], cards);
        return results;
    }

    // Helper functions for poker hand detection (Royal Flush, Straight, Flush, etc.)

    private isRoyalFlush(cards: string[]): boolean {
        const isRoyal = this.isStraightFlush(cards) && this.getHighCardValue(cards) === 14;
        // console.log(`Checking for Royal Flush: ${isRoyal}`);
        return isRoyal;
    }

    private isStraightFlush(cards: string[]): boolean {
        const isStraightFlush = this.isFlush(cards) && this.isStraight(cards);
        // console.log(`Checking for Straight Flush: ${isStraightFlush}`);
        return isStraightFlush;
    }

    private isFourOfAKind(cards: string[]): boolean {
        const cardRanks = this.getCardRanks(cards);
        const isFourOfAKind = Object.values(cardRanks).includes(4);
        // console.log(`Checking for Four of a Kind: ${isFourOfAKind}`);
        return isFourOfAKind;
    }

    private isFullHouse(cards: string[]): boolean {
        const cardRanks = this.getCardRanks(cards);
        const isFullHouse = Object.values(cardRanks).includes(3) && Object.values(cardRanks).includes(2);
        // console.log(`Checking for Full House: ${isFullHouse}`);
        return isFullHouse;
    }

    private isFlush(cards: string[]): boolean {
        const suits = cards.map(card => card[card.length - 1]);
        const suitCounts = this.countOccurrences(suits);
        const isFlush = Object.values(suitCounts).some(count => count >= 5);
        // console.log(`Checking for Flush: ${isFlush}`);
        return isFlush;
    }

    private isStraight(cards: string[]): boolean {
        const cardValues = this.getSortedCardValues(cards);
        for (let i = 0; i <= cardValues.length - 5; i++) {
            const straight = cardValues.slice(i, i + 5);
            if (straight[4] - straight[0] === 4 && new Set(straight).size === 5) {
                // console.log(`Straight found: ${straight}`);
                return true;
            }
        }
        // console.log(`No Straight found.`);
        return false;
    }

    private isThreeOfAKind(cards: string[]): boolean {
        const cardRanks = this.getCardRanks(cards);
        const isThreeOfAKind = Object.values(cardRanks).includes(3);
        // console.log(`Checking for Three of a Kind: ${isThreeOfAKind}`);
        return isThreeOfAKind;
    }

    private isTwoPair(cards: string[]): boolean {
        const cardRanks = this.getCardRanks(cards);
        const isTwoPair = Object.values(cardRanks).filter(count => count === 2).length === 2;
        // console.log(`Checking for Two Pair: ${isTwoPair}`);
        return isTwoPair;
    }

    private isOnePair(cards: string[]): boolean {
        const cardRanks = this.getCardRanks(cards);
        const isOnePair = Object.values(cardRanks).includes(2);
        // console.log(`Checking for One Pair: ${isOnePair}`);
        return isOnePair;
    }

    // Helper functions to get card values, ranks, and high cards

    private getSortedCardValues(cards: string[]): number[] {
        const values = cards.map(card => this.getCardValue(card));
        return values.sort((a, b) => b - a);  // Sort in descending order
    }

    private getCardRanks(cards: string[]): Record<string, number> {
        const cardValues = cards.map(card => this.getCardValue(card));
        return this.countOccurrences(cardValues);
    }

    private getHighCardValue(cards: string[]): number {
        return Math.max(...this.getSortedCardValues(cards));
    }

    private getCardValue(card: string): number {
        const value = card.slice(0, -1);
        if (value === 'A') return 14;
        if (value === 'K') return 13;
        if (value === 'Q') return 12;
        if (value === 'J') return 11;
        return parseInt(value, 10);  // Numeric values 2-10
    }

    private countOccurrences(arr: string[] | number[]): Record<string, number> {
        return arr.reduce((acc: Record<string, number>, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
    }

    // Helper function to compare high card sequences
    public compareHighCards(cards1: number[], cards2: number[]): number {
        for (let i = 0; i < cards1.length; i++) {
            if (cards1[i] > cards2[i]) {
                // console.log(`Comparing High Cards: ${cards1} > ${cards2}`);
                return 1; // cards1 is higher
            }
            if (cards1[i] < cards2[i]) {
                // console.log(`Comparing High Cards: ${cards1} < ${cards2}`);
                return -1; // cards2 is higher
            }
        }
        // console.log(`Comparing High Cards: ${cards1} = ${cards2}`);
        return 0; // they are equal
    }
}
    
