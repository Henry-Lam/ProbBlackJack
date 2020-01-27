import React, { Component } from 'react';

export default class Card extends Component{
    
    constructor(props){
        super(props);

        this.state = {
            cornerChar: this.props.cornerChar,
            displayChar: this.props.displayChar,
            suit: this.props.suit
        }
    }

    render(){
        return (
            <div className="card">
                <div className="card-top-left">
                    {this.props.cornerChar}
                </div>
                
                <div className="card-center">
                    <img src={"./images/" + this.props.suit + ".PNG" }  className="card-suit"></img>
                </div>

                <div className="card-bot-right">
                    {this.props.cornerChar}
                </div>

            </div>
        )
    }
}