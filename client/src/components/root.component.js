import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import bcryptjs from 'bcryptjs';

export default class rootPage extends Component{
    
    constructor(props){
        super(props); // all constructor in components need this

        // bind 'this' to all the methods 
        // so that when call 'this' in the method it refers to the component object
        // otherwise it will be 'this' is undefined in onchange methods
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.signup = this.signup.bind(this);
        this.login = this.login.bind(this);

        this.state = {
            username : '',
            password: '',
            allUsers: [],
            loginSuccess: false,
            signupError: false,
        }
    }

    componentDidMount(){
        // axios.get('http://localhost:3000/users/')
        axios.get('/users/')
        .then(response => {
            this.setState({ allUsers: response.data })
        })
        .catch((error) => {
            console.log(error)
        })
    }

    onChangeUsername(e){
        this.setState({
            username: e.target.value
        });
    }
    onChangePassword(e){
        this.setState({
            password: e.target.value
        })
    }

    signup(){

        var salt = bcryptjs.genSaltSync(10);
        var hash = bcryptjs.hashSync(this.state.password, salt)

        const user = {
            username: this.state.username,
            password: hash,
        }
        // const user = {
        //     username: this.state.username,
        //     password: this.state.password,
        // }
        axios.post('/users/add', user)
        .then(() => this.setState({ loginSuccess: true}))
        .catch((error) => {
            console.log(error)
            this.setState({
                signupError: true,
            })
        })
    }

    login(){
        for(let i =0; i < this.state.allUsers.length; i++){
            if (this.state.allUsers[i].username === this.state.username){
                if (bcryptjs.compareSync(this.state.password, this.state.allUsers[i].password)){
                    this.setState({loginSuccess: true})
                }
            }
        }
        // for(let i =0; i < this.state.allUsers.length; i++){
        //     if (this.state.allUsers[i].username === this.state.username){
        //         if (this.state.allUsers[i].password === this.state.password){
        //             this.setState({loginSuccess: true})
        //         }
        //     }
        // }
    }

    render(){
        if (this.state.loginSuccess === true){
            return(<Redirect to={{pathname: '/game', state:{loggedInUser: this.state.username}}}/>)
        }
        return (
            <div>
                <h3>Sign up or Login to Play</h3>
                <form onSubmit={this.onSubmit}>
                <div className="form-group"> 
                    <label>Username: </label>
                    <input  type="text"
                        required
                        className="form-control"
                        value={this.state.username}
                        onChange={this.onChangeUsername}
                        />
                        <span className = "error-text">{this.state.signupError ? "username already in use" : ""}</span>
                </div>
                <div className="form-group"> 
                    <label>Password: </label>
                    <input  type="password"
                        required
                        className="form-control"
                        value={this.state.password}
                        onChange={this.onChangePassword}
                        />
                </div>
                </form>
                <button onClick = {this.signup} className="signupBtn m-size-btn"> Sign Up </button>
                <button onClick = {this.login} className="loginBtn m-size-btn"> Log In </button>
            </div>
        )
    }
}