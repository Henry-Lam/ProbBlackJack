import React, { Component } from 'react';

import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"
import { BrowserRouter as Router, Route } from "react-router-dom"

import Navbar from "./components/navbar.component"
import rootPage from "./components/root.component"
import gamePage from "./components/game.component"



export default class App extends Component {

  constructor(props){
    super(props);

    this.handleLoggedIn = this.handleLoggedIn.bind(this);

    this.state = {
      loggedIn: false,
    }
  }

  handleLoggedIn() {
    this.setState({
      loggedIn: true,
    })
  }

  render() {
    return(
    <Router>
      <div className="container">
        <Navbar loggedIn = {this.state.loggedIn}/>
        <br/>
        <Route path="/" exact component={rootPage}/>
        <Route path="/game" exact component={gamePage}/>
      </div>
    </Router>
    )
  }
}


