import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import Card from './card.component';
import { randomIntFromRange, charToValue } from '../helpers';
import Player from '../objects/Player';
import AnalysisContainer from '../objects/AnalysisContainer';

export default class gamePage extends Component{
    constructor (props){
        super(props)

        this.generateDeck = this.generateDeck.bind(this);
        this.dealerDrawCard = this.dealerDrawCard.bind(this);
        this.updateAnalysis = this.updateAnalysis.bind(this);
        this.startBtnFunc = this.startBtnFunc.bind(this);
        this.standBtnFunc = this.standBtnFunc.bind(this);
        this.state = {
            allSuits: ['heart','diamond','spade','clover'],
            allChars: ['A','2','3','4','5','6','7','8','9', '10','J','Q','K'],
            probabilityDisplay: true,
            deck: [],
            gameOver: true,

            // hand, value, bet, bust, natural
            leftBot: new Player (),
            midBot: new Player (),
            rightBot: new Player (),
            dealer: new Player(),

            //Suggestions
            leftAnalysisContainer: null,
            midAnalysisContainer: null,
            rightAnalysisContainer: null,

            expectedValueDraw: null,
            expectedValueStand: null,
            suggestion: null,

            earningsThisRound: 0,
            loggedInUserId: null,


        }
    }

    generateDeck(){
        let deck = [];
        for (let i=0; i < this.state.allChars.length; i++){
            for(let k=0; k < this.state.allSuits.length; k++){
                deck.push( {'char': this.state.allChars[i], 'suit': this.state.allSuits[k]} )
                // The object pushed is actually [{'char': ___, 'suit':___}]
                // deck --> [[{'char': ___, 'suit':___}],[{'char': ___, 'suit':___}],[{'char': ___, 'suit':___}]]
                // list of list of 1 object
            }
        }
        return deck;
    }

    setupGame(){
        // generate Deck
        let newDeck = this.generateDeck();

        let leftBot = new Player();
        let midBot = new Player();
        let rightBot = new Player();
        let dealer = new Player();

        let allPlayers = [leftBot, midBot, rightBot, dealer]
        // let allPlayers = [leftBot, dealer]

        // generate bets
        leftBot.money = randomIntFromRange(1, 20) * 50;
        midBot.money = randomIntFromRange(1, 20) * 50;
        rightBot.money = randomIntFromRange(1, 20) * 50;

        // distribute cards
        for (let k = 0; k < 2; k ++){
            for (let i =0; i < allPlayers.length; i++){
                allPlayers[i].hand.push(newDeck.splice(randomIntFromRange(0, newDeck.length-1), 1));
            }
        }

        // calculate hand values and check natural
        for (let i=0; i<allPlayers.length; i++){
            allPlayers[i].updateValue(charToValue);
            allPlayers[i].checkNatural();
        }

        // retrieve dealer's money from db
        // axios.get('http://localhost:3000/users/')
        axios.get('https://probblackjack.herokuapp.com/users/')
        .then(response => {
            for (let i=0; i < response.data.length; i++){
                if (response.data[i].username === this.props.location.state.loggedInUser){
                    dealer.money = response.data[i].money
                }
            }
        })
        
        this.setState({
            deck: newDeck,
            leftBot: leftBot,
            midBot: midBot,
            rightBot: rightBot,
            dealer: dealer,
        })
        
    }

    BotPlay(botPlayer){
        let tempDeck = this.state.deck;

        while (botPlayer.hand.length <= 5 && !(botPlayer.bust)){
            if (botPlayer.value >= 15){
                // stand
                break;
            }else{
                // draw a card
                botPlayer.hand.push(tempDeck.splice(randomIntFromRange(0, tempDeck.length-1), 1));
                botPlayer.updateValue(charToValue);
                botPlayer.checkBust();
            }
        }

        // update deck
        this.setState({
            deck: tempDeck
        })
        // since botPlayer can be left/mid/right can't setState here
        return botPlayer; 
    }

    dealerDrawCard(){
        let tempDealer = this.state.dealer;
        let tempDeck = this.state.deck;
        tempDealer.hand.push(tempDeck.splice(randomIntFromRange(0, tempDeck.length-1), 1));
        tempDealer.updateValue(charToValue);
        tempDealer.checkBust();
        
        this.setState({
            deck: tempDeck,
            dealer: tempDealer,
            gameOver: (tempDealer.bust || tempDealer.hand.length >= 5),
        }, ()=>{
                if (this.state.gameOver){
                    this.standBtnFunc()
                }else{
                    this.updateAnalysis();
                }
            }
        )
        
    }

    updateAnalysis(){
        let tempLeftAnalysis = new AnalysisContainer("left", this.state.deck, this.state.leftBot, this.state.dealer) 
        let tempMidAnalysis = new AnalysisContainer("mid", this.state.deck, this.state.midBot, this.state.dealer) 
        let tempRightAnalysis = new AnalysisContainer("right", this.state.deck, this.state.rightBot, this.state.dealer)
        let analysisContainer = [tempLeftAnalysis, tempMidAnalysis, tempRightAnalysis]

        let expectedValueDraw = tempLeftAnalysis.expectedValue + tempMidAnalysis.expectedValue + tempRightAnalysis.expectedValue

        // find expected value of stand
        let expectedValueStand = 0;
        
        let botContainer = [this.state.leftBot, this.state.midBot, this.state.rightBot]
        for (let i=0; i < botContainer.length; i++){
            if (botContainer[i].bust){
                expectedValueStand += botContainer[i].money
            }else if (botContainer[i].natural){
                if (!this.state.dealer.natural){
                    expectedValueStand -= botContainer[i].money
                }
            }else if (botContainer[i].value > this.state.dealer.value){
                expectedValueStand -= botContainer[i].money
            }else if (botContainer[i].value < this.state.dealer.value){
                expectedValueStand += botContainer[i].money
            }


            // if (!botContainer[i].bust && !botContainer[i].natural){
            //     if (this.state.dealer.value < botContainer[i].value){
            //         expectedValueStand -= botContainer[i].money
            //     }else if (this.state.dealer.value > botContainer[i].value){
            //         expectedValueStand += botContainer[i].money
            //     }
            // }
        }

        let tempSuggestion = null;
        if (expectedValueDraw >= expectedValueStand){
            tempSuggestion = "Hit"
        }else{
            tempSuggestion = "Stand"
        }

        // update states
        this.setState({
            leftAnalysisContainer: tempLeftAnalysis,
            midAnalysisContainer: tempMidAnalysis,
            rightAnalysisContainer: tempRightAnalysis,
            expectedValueDraw: expectedValueDraw,
            expectedValueStand: expectedValueStand,
            suggestion: tempSuggestion,
        })
    }

    standBtnFunc(){
        let allOponent = [this.state.leftBot, this.state.midBot, this.state.rightBot]
        let tempDealerMoney =  this.state.dealer.money;

        for (let i = 0; i < allOponent.length; i++){

            if (allOponent[i].natural){
                if (!this.state.dealer.natural){
                    this.state.dealer.money -= allOponent[i].money
                }
            }else if (allOponent[i].bust){
                this.state.dealer.money += allOponent[i].money
            }else if (this.state.dealer.bust){
                this.state.dealer.money -= allOponent[i].money
            }else if (allOponent[i].value < this.state.dealer.value){
                this.state.dealer.money += allOponent[i].money
            }else if(allOponent[i].value > this.state.dealer.value){
                this.state.dealer.money -= allOponent[i].money
            }
        }
        let currentRoundEarnings = this.state.dealer.money - tempDealerMoney;

        axios.post('https://probblackjack.herokuapp.com/users/update/' + this.state.loggedInUserId, {
            money: this.state.dealer.money
        })
        .then(res => console.log(res.data))

        // update states
        this.setState({
            gameOver: true,
            dealer: this.state.dealer,
            earningsThisRound: currentRoundEarnings,
        })

    }

    startBtnFunc(){
        this.setupGame();

        this.setState({
            gameOver: false,
            earningsThisRound: 0,
            leftAnalysisContainer: null,
            midAnalysisContainer: null,
            rightAnalysisContainer: null,

            expectedValueDraw: null,
            expectedValueStand: null,
            suggestion: null,
        })

        setTimeout(()=>{
            this.setState({
                leftBot: this.BotPlay(this.state.leftBot),
            })
        }, 250)

        setTimeout(()=>{
            this.setState({
                midBot: this.BotPlay(this.state.midBot),
            })
        }, 500)

        setTimeout(()=>{
            this.setState({
                rightBot: this.BotPlay(this.state.rightBot),
            })
        }, 750)

        setTimeout(()=>{
            this.updateAnalysis();
        }, 1000)



    }

    componentDidMount(){
        // Get user id
        axios.get('https://probblackjack.herokuapp.com/users/')
        .then(response => {
            for (let i=0; i < response.data.length; i++){
                if (response.data[i].username === this.props.location.state.loggedInUser){
                    this.setState({ loggedInUserId: response.data[i]._id })
                }
            }
        })

        
    }

    showDrawBtn(){
        return <button className="center-btn hit-btn" onClick={this.dealerDrawCard} disabled={this.state.gameOver}> Hit <img src="./images/cardsIcon.png" className="icons"/> </button>
    }

    showPlayAgainBtn(){
        return <button className ="center-btn start-btn" onClick={this.startBtnFunc} disabled={!this.state.gameOver}>Start New Game</button>
    }

    showStandBtn(){
        return <button className="center-btn stand-btn" onClick={this.standBtnFunc}disabled={this.state.gameOver}> Stand <img src="./images/stopIconBlack.png" className="icons"/> </button>
    }
    
    render(){
        return(
            <div>
                <div className="play-container">

                    <div className="player-area">
                        <div className="player-area-cards">
                            {this.state.leftBot.hand.map((value, index) => {
                                return  (
                                <div className={"player-c" + index.toString()} key={index}>
                                    <Card key={index} cornerChar={value[0]['char']} suit={value[0]['suit']}/>
                                </div>
                            )})}
                        </div>
                            
                        <div className="player-area-info">
                            <div className="player-value">{this.state.leftBot.bust ? "BUST!" : (this.state.leftBot.natural ? "Natural 21" : this.state.leftBot.value)}</div>
                            <div className="player-value">Bet: ${this.state.leftBot.money}</div>
                        </div>
                    </div>


                    <div className="player-area">
                        <div className="player-area-cards">
                            {this.state.midBot.hand.map((value, index) => {
                                return  (
                                <div className={"player-c" + index.toString()} key={index}>
                                    <Card key={index} cornerChar={value[0]['char']} suit={value[0]['suit']}/>
                                </div>
                            )})}
                        </div>
                            
                        <div className="player-area-info">
                            <div className="player-value">{this.state.midBot.bust ? "BUST!" : (this.state.midBot.natural ? "Natural 21" : this.state.midBot.value)}</div>
                            <div className="player-value">Bet: ${this.state.midBot.money}</div>
                        </div>
                    </div>


                    <div className="player-area">
                        <div className="player-area-cards">
                            {this.state.rightBot.hand.map((value, index) => {
                                return  (
                                <div className={"player-c" + index.toString()} key={index}>
                                    <Card key={index} cornerChar={value[0]['char']} suit={value[0]['suit']}/>
                                </div>
                            )})}
                        </div>
                            
                        <div className="player-area-info">
                            <div className="player-value">{this.state.rightBot.bust ? "BUST!" : (this.state.rightBot.natural ? "Natural 21" : this.state.rightBot.value)}</div>
                            <div className="player-value">Bet: ${this.state.rightBot.money}</div>
                        </div>
                    </div>


                    <div className="center-area">
                        {this.state.gameOver ? this.showPlayAgainBtn() : this.showDrawBtn()}
                        {this.state.gameOver ? "" : this.showStandBtn()}
                    </div>
                
                    <div className="dealer-area">
                        <div className="dealer-area-info">
                            <div className="dealer-value">{this.state.dealer.bust ? "BUST!" : this.state.dealer.value}</div>
                                <div className="dealer-earnings">
                                    Earnings this round: ${this.state.earningsThisRound}
                                    <br/>
                                    All time Earnings: ${this.state.dealer.money}
                                </div>
                        </div>
                        <div className="dealer-area-cards">

                            {this.state.dealer.hand.map((value, index) => {
                                return  (
                                <div className="dealer-card" key={index}>
                                    <Card key={index} cornerChar={value[0]['char']} suit={value[0]['suit']}/>
                                </div>
                            )})}
                        </div>
                    </div>
                </div>

                <div className="calculation-display-container">
                    <div className="top-probability-bar">
                        <div className="probability-summary">
                            <h5>Probability Summary</h5>
                            Algorithm Suggests to
                            <br/>
                            <div className="suggestion">
                                {(this.state.suggestion ? this.state.suggestion : "")}
                            </div>
                        </div>
                        
                        <div className="probability-section">
                            {this.state.deck.length} cards left in deck
                            <div className="opponent-analysis">
                                <div className = "opponent-analysis-title">
                                    {(this.state.leftAnalysisContainer) ? "Left Opponent Analysis " : ""}
                                </div>

                                <div>
                                    {this.state.leftBot.bust ? "Bust!" : (this.state.leftBot.natural ? "Natural 21" : "")}
                                </div>

                                <div>
                                    {(!this.state.leftBot.bust && !this.state.leftBot.natural && this.state.leftAnalysisContainer) ? "Probability of Eventual Win: " + Math.round(this.state.leftAnalysisContainer.probWin*10000)/100 + "%" : ""}
                                </div>

                                <div>
                                    {(!this.state.leftBot.bust && !this.state.leftBot.natural && this.state.leftAnalysisContainer) ? "Probability of Eventual Tie: " + Math.round(this.state.leftAnalysisContainer.probNeutral*10000)/100 + "%" : ""} 
                                </div>

                                <div>
                                    {(!this.state.leftBot.bust && !this.state.leftBot.natural && this.state.leftAnalysisContainer) ? "Probability of Eventual Loss: " + Math.round(this.state.leftAnalysisContainer.probLose*10000)/100 + "%" : ""}  
                                </div>
                                <div>
                                    {(this.state.leftAnalysisContainer) ? "Bet amount: $" + this.state.leftBot.money : ""} 
                                </div>
                                <div>
                                    {(this.state.leftAnalysisContainer) ? "Expected Value (draw): $" + Math.round(this.state.leftAnalysisContainer.expectedValue) : ""} 
                                </div>
                            </div>

                            <div className = "opponent-analysis">
                                <div className = "opponent-analysis-title">
                                    {(this.state.midAnalysisContainer) ? "Center Opponent Analysis " : ""}
                                </div>

                                <div>
                                    {this.state.midBot.bust ? "Bust!" : (this.state.midBot.natural ? "Natural 21" : "")}
                                </div>

                                <div>
                                    {(!this.state.midBot.bust && !this.state.midBot.natural && this.state.midAnalysisContainer) ? "Probability of Eventual Win: " + Math.round(this.state.midAnalysisContainer.probWin*10000)/100 + "%" : ""}
                                </div>

                                <div>
                                    {(!this.state.midBot.bust && !this.state.midBot.natural && this.state.midAnalysisContainer) ? "Probability of Eventual Tie: " + Math.round(this.state.midAnalysisContainer.probNeutral*10000)/100 + "%" : ""} 
                                </div>

                                <div>
                                    {(!this.state.midBot.bust && !this.state.midBot.natural && this.state.midAnalysisContainer) ? "Probability of Eventual Loss: " + Math.round(this.state.midAnalysisContainer.probLose*10000)/100 + "%" : ""} 
                                </div>

                                <div>
                                    {(this.state.midAnalysisContainer) ? "Bet amount: $" + this.state.midBot.money : ""} 
                                </div>
                                <div>
                                    {(this.state.midAnalysisContainer) ? "Expected Value (draw): $" + Math.round(this.state.midAnalysisContainer.expectedValue) : ""} 
                                </div>
                            </div>

                            <div className="opponent-analysis">
                                <div className = "opponent-analysis-title">
                                    {(this.state.rightAnalysisContainer) ? "Right Opponent Analysis " : ""}
                                </div>

                                <div>
                                    {this.state.rightBot.bust ? "Bust!" : (this.state.rightBot.natural ? "Natural 21" : "")}
                                </div>

                                <div>
                                    {(!this.state.rightBot.bust && !this.state.rightBot.natural && this.state.rightAnalysisContainer) ? "Probability of Eventual Win: " + Math.round(this.state.rightAnalysisContainer.probWin*10000)/100 + "%" : ""}
                                </div>
                                
                                <div>
                                    {(!this.state.rightBot.bust && !this.state.rightBot.natural && this.state.rightAnalysisContainer) ? "Probability of Eventual Tie: " + Math.round(this.state.rightAnalysisContainer.probNeutral*10000)/100 + "%" : ""} 
                                </div>

                                <div>
                                    {(!this.state.rightBot.bust && !this.state.rightBot.natural && this.state.rightAnalysisContainer) ? "Probability of Eventual Loss: " + Math.round(this.state.rightAnalysisContainer.probLose*10000)/100 + "%" : ""} 
                                </div>

                                <div>
                                    {(this.state.rightAnalysisContainer) ? "Bet amount: $" + this.state.rightBot.money : ""} 
                                </div>
                                <div>
                                    {(this.state.rightAnalysisContainer) ? "Expected Value (draw): $" + Math.round(this.state.rightAnalysisContainer.expectedValue) : ""} 
                                </div>
                            </div>

                            <div className="final-analysis">
                                <div>
                                    {this.state.expectedValueDraw != null ? "Total Expected Value (Draw): $" + Math.round(this.state.expectedValueDraw) : ""}
                                </div>
                                <div>
                                    {this.state.expectedValueStand != null ? "Total Expected Value (Stand): $" + this.state.expectedValueStand : ""}
                                </div>
                                <div className="suggestion"> 
                                    {this.state.suggestion ? "Suggestion: " + this.state.suggestion : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}