import Player from './Player';
import { charToValue } from '../helpers';

class AnalysisContainer {
    constructor(side, deck, opponent, dealer){
        this.side = side;
        this.deck = deck;
        this.opponent = opponent;
        this.dealer = dealer;

        this.probWin = this.probWinOnDraw(this.deck, this.opponent, this.dealer)
        this.probNeutral = this.probNeutralOnDraw(this.deck, this.opponent, this.dealer)
        this.probLose = 1 - (this.probWin + this.probNeutral)

        // this.expectedValue = (this.probWin * this.opponent.money) - (this.probLose * this.opponent.money);
        // this.expectedValue = (this.opponent.bust || this.opponent.natural) ? 0 : (this.probWin * this.opponent.money) - (this.probLose * this.opponent.money)
        this.expectedValue = (this.opponent.bust ? this.opponent.money : (this.opponent.natural ? (this.dealer.natural ? 0: 0 - this.opponent.money) : (this.probWin * this.opponent.money) - (this.probLose * this.opponent.money)))
    }

    probWinOnDraw(deck, opponent, dealer){
        let lstWin = []
        let lstCloser = []

        for (let i = 0; i < deck.length; i++){
            let tempDealer = new Player();
            tempDealer.hand = dealer.hand.slice(0);
            
            tempDealer.hand.push([deck[i]])
            tempDealer.updateValue(charToValue);
            tempDealer.checkBust();

            if (!tempDealer.bust){
                if(tempDealer.value > opponent.value && tempDealer.hand.length <= 4){
                    lstWin.push([deck[i]]);
                    // lstCloser.push([deck[i]]);
                }else if(tempDealer.value <= opponent.value && tempDealer.hand.length < 4){
                    lstCloser.push([deck[i]]);   
                }
            }
        }

        let probWin = (lstWin.length / 1.0) / deck.length;
        let probCloserWin = 0.0;        

        for (let i = 0; i < lstCloser.length; i++){
            let tempDeck = deck.slice(0)
            
            let k =0;
            while (k < tempDeck.length){
                // Works
                if(lstCloser[i][0] === tempDeck[k] ){
                    tempDeck.splice(k, 1)
                    break;
                }
                k ++;
            }

            let tempDealer2 = new Player();
            tempDealer2.hand = dealer.hand.slice(0);

            tempDealer2.hand.push(lstCloser[i]);
            tempDealer2.updateValue(charToValue);

            if(tempDealer2.hand.length <= 4){
                probCloserWin += (1.0/deck.length) * this .probWinOnDraw(tempDeck, opponent, tempDealer2);
            }            
        }
        return probWin + probCloserWin;
    }

    // Basically exactly the same as probWinOnDraw with small changes
    // Many variable names here still use "Win"
    probNeutralOnDraw(deck, opponent, dealer){
        let lstWin = []
        let lstCloser = []

        for (let i = 0; i < deck.length; i++){
            let tempDealer = new Player();
            tempDealer.hand = dealer.hand.slice(0);
            
            tempDealer.hand.push([deck[i]])
            tempDealer.updateValue(charToValue);
            tempDealer.checkBust();

            if (!tempDealer.bust){
                if(tempDealer.value === opponent.value && tempDealer.hand.length <= 4){
                    lstWin.push([deck[i]]);
                }else if(tempDealer.value < opponent.value && tempDealer.hand.length < 4){
                    lstCloser.push([deck[i]]);   
                }
            }
        }

        let probWin = (lstWin.length / 1.0) / deck.length;
        let probCloserWin = 0.0;        

        for (let i = 0; i < lstCloser.length; i++){
            let tempDeck = deck.slice(0)
            
            let k =0;
            while (k < tempDeck.length){
                // Works
                if(lstCloser[i][0] === tempDeck[k] ){
                    tempDeck.splice(k, 1)
                    break;
                }
                k ++;
            }

            let tempDealer2 = new Player();
            tempDealer2.hand = dealer.hand.slice(0);

            tempDealer2.hand.push(lstCloser[i]);
            tempDealer2.updateValue(charToValue);

            if(tempDealer2.hand.length <= 4){
                probCloserWin += (1.0/deck.length) * this .probWinOnDraw(tempDeck, opponent, tempDealer2);
            }            
        }
        return probWin + probCloserWin;
    }
}

export default AnalysisContainer;