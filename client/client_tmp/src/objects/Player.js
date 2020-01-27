class Player {
    constructor(){
        this.hand = [];
        this.value = 0;
        this.money = 0;
        this.bust = false; // true / false (value > 21 = true)
        this.natural = false; // true/false (21 on first turn = true)
    }
    checkBust(){
        if (this.value > 21){
            this.bust = true;
        }
    }
    
    checkNatural(){
        if (this.value === 21 && this.hand.length === 2){
            this.natural = true;
        }
    }

    updateValue(charToValue){
        let aCount = 0;
        let value = 0;

        for (let i = 0; i < this.hand.length; i++){

            if (this.hand[i][0]['char'] === 'A'){
                aCount++;
            }
            value += charToValue[this.hand[i][0]['char']]
        }

        for (let k = 0; k < aCount; k++){
            if (value + 10 <= 21){
                value += 10
            }
        }
        this.value = value;
    }
}

export default Player;