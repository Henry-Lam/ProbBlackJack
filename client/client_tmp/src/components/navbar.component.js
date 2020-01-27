import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Popup from "reactjs-popup";

export default class Navbar extends Component {

  constructor(props){
    super(props);

    this.state = {
      loggedIn: false,
    }

  }

  render() {
    return (
        // A bootstrap navbar, <button> tags replaced with <Link>
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand"><span className="navbar-items"><img src="./images/blackjackIcon2.png" className="mainIcon"/>BlackJack</span></Link>
        <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">

          <li className="navbar-item">
          <Popup trigger={<a className="nav-link navbar-items"> How-To-Play </a>} position="right center" modal closeOnDocumentClick>
            <div>
              <h1>How-to-Play</h1>
              BlackJack where you play as the dealer, and are able to make decisions (in regular blackjack dealers can't make decisions)
              <br/>
              <br/>
              <strong>Get closer to 21 than your opponent, without going over</strong>
              <br/>
              <br/>

              <strong>Hit:</strong> Draw a card (can hold up to 5 cards)
              <br/>
              <strong>Stand:</strong> Stop drawing cards
              <br/>
              <br/>
              <strong>Ace:</strong> Aces count as 11 or 1, depending on which is most favorable for holder
              <br/>
              <strong>Bust:</strong> go over 21, auto-lose unless the opponent also bust, in this case the dealer wins
              <br/>
              <strong>Natural:</strong> 21: Get 21 in your starting 2 cards, if opponents get natural they auto-win unless the dealer also has natural then its a tie, dealer doesn't auto-win on natural

              <br/>
              <br/>
              You will play against 3 AI opponents each will have a different bet amount ($), 
              Everyone starts with 2 cards, the AI will go first and decide to hit and stand,
              The dealer will go last, deciding to hit and stand
              When you stand your hand value will be compared to each opponent,
              if you win over that opponent you gain the amount they bet
              if you lose, you lose the amount they bet
            </div>
          </Popup>
          </li>

          <li className="navbar-item">
          <Popup trigger={<a className="nav-link navbar-items"> Algorithm </a>} position="right center" modal closeOnDocumentClick>
            <div>
              <h1>Algorithm</h1>
              Algorithm analyzes the current state of the game, and recursively forcasts all possible scenarios that can occur 
              from the current scenario up to the end of the game.
              <br/>
              <br/>
              Doing so allows the algorithm to determine an accurate probability that the dealer will eventually win over an opponent (after 1 or more draws)
              based on the current scenario.
              <br/>
              <br/>
              <strong>Expected Value</strong>
              <br/>
              Since each opponent has a bet value, the system will weigh the probability of winning against each opponent with the value of their bet
              to maximize the dealer's earnings.
              <br/>
              <br/>
              <strong>Decisions</strong>
              <br/>
              After determining the total expected value amoungst all opponents if the dealer chooses to draw a card, it can compare this value
              to the scenario if the dealer chooses to stand, and determin which (hit or stand) is most favourable and displays this as a suggestion to the user
              <br/>
              <br/>
              <strong>Scenario example</strong>
              <br/>
              Often times the dealer will be in a scenario inwhich they currently winning over one opponent but is losing to another.
              The algorithm helps the user to decide whether or not it is worth it to draw another card and risk a bust (lose to
              those who the dealer are currently winning against) in order to win over other opponents.
              
              
            </div>
          </Popup>
          </li>
        </ul>

        {/* Right side Item */}
        {/* <ul class="navbar-nav ml-auto">
          <li></li>
        </ul> */}



        </div>
      </nav>
    );
  }
}