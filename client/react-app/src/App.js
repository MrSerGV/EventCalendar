import React, { Component } from 'react';
import './App.css';
import {Router, Route, Link, Switch, Redirect} from "react-router-dom";
import createHistory from "history/createBrowserHistory";
import {createStore, combineReducers} from 'redux';
import {Provider, connect}   from 'react-redux';
import { GraphQLClient } from 'graphql-request'
import Modal from 'react-responsive-modal';
import moment from 'moment';
import SimpleStorage from "react-simple-storage";


const gql = new GraphQLClient("http://localhost:4000/graphql", { headers: {} })


function userReducer(state, action){
    if (state === undefined){
        return {data: {}, status: 'EMPTY'}
    }
    if (action.type === 'LOGGED_USER'){
       
        if (action.data.user ){
            return {data: action.data.user, status: 'LOGGER_DATA'}    
        }
    }
    if (action.type === 'LOGOUT_USER'){

        return {data: {}, status: 'EMPTY'}    
    }
    if (action.type === 'UPDATE_USER'){
        action.data.user = action.data.updateUser 
        return {data: action.data.user, status: 'UPDATE_DATA'}    
            }
    return state;
}



const reducers = combineReducers({
    user:  userReducer,
   
    
  

})
var store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
const mapStateToProps = function(store) {
    return {
        user: store.user,
       
    };
}

class LoginPage extends Component {
    state = {
        redirect: false
      }
    setRedirect(){
        this.setState({
            redirect: true
        })
    }
    logout(){
        store.dispatch({type: 'LOGOUT_USER', data: {} });
        this.setRedirect()
    }
    render (){
        if (this.state.redirect) {
            return <Redirect to='/' />
        }
        if (this.props.user.status === 'LOGGER_DATA'||this.props.user.status === 'UPDATE_DATA'){   
            return(    
                <div className='LogOut'>
                    <div className='LogOutWelcome'>
                        <h3> Hello, {this.props.user.data.userName}</h3>
                    </div>
                    <div>
                        <Link to={`/user/${this.props.user.data.id}`}><button className='ButtonAccount'>Account</button></Link>
                        <button className='ButtonLogOut'
                                onClick={this.logout.bind(this)} >
                                LogOut
                        </button> 
                    </div>
                           
                    
                </div>   
            )
        }
        return (
            <div className='loginPage'>
                <div> 
                    For save your calendar  
                    <div className='Modal'> <ModalLogin/></div>or
                    <div className='Modal'> <ModalSignup/></div> 
                </div>             
            </div>
        )
    }
}

LoginPage = connect(mapStateToProps)(LoginPage)

class User extends Component {
    render(){
          if (this.props.user.status === 'LOGGER_DATA'|| this.props.user.status === 'UPDATE_DATA'){
            return (
                <div className='User'>
                    <h1> Hello, {this.props.user.data.userName}</h1>                    
                    <div>Was registreted:{this.props.user.data.created}</div>
                    <div>Email:{this.props.user.data.email}</div>
                    <Link to='/UserCalendar'>Main Page</Link>
                </div>
            )
        }
          return (
            <div className='User'>
                User not found...
            </div>
        )
    }
}

User = connect(mapStateToProps)(User)

class GetUser extends Component {
    static get NOT_FOUND(){
        return -1;
    }
    state ={
        toUser: false,
    }
   login(){
         gql.request(
            `query getUser($userName: String!, $password: String!) {
                       user(userName: $userName, password:$password) {
                                id
                                userName
                                created
                                email 
                                issue
                    
                        }
            }`,
         {userName: this.userName.value,
          password: this.password.value})
          .then(data => (this.setState({toUser: data.user ? data.user.id : GetUser.NOT_FOUND}), data))
          .then(data => store.dispatch({type: 'LOGGED_USER', data})) 
        }
    handleKeyPress = (event) => {
            if(event.key === 'Enter'){
              this.login();
            }
          }   
    render (){
        if (this.state.toUser !== false && this.state.toUser !== GetUser.NOT_FOUND){
            return <Redirect to ={`/UserCalendar`}/> 
           
        }
        else if (this.state.toUser === GetUser.NOT_FOUND){
            return (
            <div style={{backgroundColor: 'red'}}>
                User not found or password wrong;
            </div>
            )
        }
        return (
            <div>
            <label htmlFor='signupForm-userName'>User name: </label>
            <input className='Input' ref={c => this.userName = c} />
            <label htmlFor='password'>Password: </label>
            <input className='Input'  onKeyPress={this.handleKeyPress} ref={c => this.password = c} />
            <button className='ButtonLogin'  onClick={this.login.bind(this)}>LogIn</button>
            </div>
            )
    }    
}

class SignUp extends Component {
    save(){
        gql.request(
            `mutation ($userName: String!, $email: String!, $password: String! ) {
                createUser(userName: $userName,email:$email,password:$password) {
                  userName
                  created
                  email 
                }
              }`,
            {userName: this.userName.value,
             email: this.email.value,
             password: this.password.value})
    }
    handleKeyPress = (event) => {
        if(event.key === 'Enter'){
          this.save();
        }
    }
    render (){
        return (
            <div>
                <label htmlFor='signupForm-userName'>User name: </label>
                <input className='Input' ref={c => this.userName = c} />
                <label htmlFor='email'>Email: </label>
                <input className='Input' ref={c => this.email = c} />
                <label htmlFor='password'>Password: </label>
                <input className='Input' onKeyPress={this.handleKeyPress} ref={c => this.password = c } />
              <button className='ButtonLogin' onClick={this.save.bind(this)}>SignUp</button>
            </div>
        )
    }
}

class ModalLogin extends Component {
    state = {
        open: false,
    };

    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
         this.setState({ open: false });
    };
  
    render() {
        const { open } = this.state;
        return (
             <div className="example">
                <button className='ButtonLogin' onClick={this.onOpenModal}>LogIn</button>
                <Modal open={open} onClose={this.onCloseModal}  center>
                    <div className="ModalWrap"><GetUser/></div>       
                </Modal>        
             </div>
        );
    }
}

class ModalSignup extends Component {
    state = {
      open: false,
    };
  
    onOpenModal = () => {
      this.setState({ open: true });
    };
  
    onCloseModal = () => {
      this.setState({ open: false });
    };

    render() {
        const { open } = this.state;
        return (
            <div className="example"> 
                 <button className='ButtonLogin' onClick={this.onOpenModal}>SignUp</button>
                 <Modal open={open} onClose={this.onCloseModal}   center>
                    <div className="ModalWrap"><SignUp/></div>
                </Modal>
            </div>
        );
    }
}


const actionUpdate  = (data) => ({type: 'UPDATE_USER', data})

 
class Issue extends Component {
    constructor(props){
      super(props)
      this.removeIssue = this.removeIssue.bind(this)

  }
    removeIssue(){
        this.props.user.data.issue.splice(this.props.user.data.issue.indexOf(this.props.issue), 1)
        gql.request(
             `mutation ($id: String!, $userName: String!, $email: String!, $issue:[String!]) {
                updateUser(_id: $id, userName: $userName,  email:$email, issue:$issue) {
                  id
                  userName
                  email
                  issue                            
                }
              }`,
            {id: this.props.user.data.id,
             userName: this.props.user.data.userName,
             email:this.props.user.data.email,            
             issue: this.props.user.data.issue
            })
            .then(data =>store.dispatch(actionUpdate(data)))
  }
    render(){  
        
        if (this.props.event === undefined)
            {
            return (
                <div className='Loading'>
                    No issue
                </div>
            )
        }
            return (
             <div  className='UserIssue'>
                <div className='Time'>
                    <div className='Evevt'>Start at {JSON.parse(this.props.event).start}</div>
                    <div className='Evevt'>Duration {JSON.parse(this.props.event).duration} min</div>
                </div>
                <button className='ButtonIssue' onClick={this.removeIssue.bind(this)}>{JSON.parse(this.props.event).title}</button>
                
              </div>
            
        )
    }
  }
  Issue = connect(mapStateToProps)(Issue)

  class IssueList extends Component {  
       
      render(){
        
        if (this.props.user.status === "EMPTY"){   
            return(    
                <div className='Loading'>
                    Please Login or SignUp        
                </div>   
            )
        }
        
        
        return (
            <div className='IssueList'> 
                <div  className='WrappList'>
                  <h3>Your event list</h3>
                </div>
                <div  className='WrappIssue'>
                      {this.props.user.data.issue.map(issue => <Issue key={issue}
                                                                      event={issue}
                                                                      onRemove={this.removeIssue}/>)}
                </div>
            </div>
          );
      }
}


IssueList = connect(mapStateToProps)(IssueList)

class IssueAdd extends Component{
    resetValue(){
        this.title.value=''
        this.start.value=''
        this.duration.value='';
      }
    addIssue(){
        this.props.user.data.issue.push(JSON.stringify({start: this.start.value,
                                                        duration: this.duration.value,
                                                        title: this.title.value}))
    console.log(this.props.user.data.issue)
        gql.request(
            `mutation ($id: String!, $userName: String!, $email: String!, $issue:[String!]) {
                updateUser(_id: $id, userName: $userName,  email:$email, issue:$issue) {
                  id
                  userName
                  email
                  issue                            
                }
              }`,
            {id: this.props.user.data.id,
             userName: this.props.user.data.userName,
             email:this.props.user.data.email,            
             issue: this.props.user.data.issue
            })
            .then(data => store.dispatch(actionUpdate(data)))
        this.resetValue() 
    }
    handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            this.addIssue();
        }
    }
    render(){
        if (this.props.user.status === "EMPTY"){   
            return(    
                <div className='Loading'>
                    Please Login or SignUp        
                </div>   
            )}
        return (
            <div className='IssueAdd'>
                <div className='AddIssue'>
                <input 
                    type='text'
                    className='InputIssue'
                    placeholder='Enter title of event'
                    onKeyPress={this.handleKeyPress}
                    ref={c => this.title = c} />
                <input 
                    className='InputIssue'
                    placeholder='Enter time start of event '
                    onKeyPress={this.handleKeyPress}
                    ref={c => this.start = c} />
                <input 
                    className='InputIssue'
                    placeholder='Enter duration of event in minute '
                    onKeyPress={this.handleKeyPress}
                    ref={c => this.duration = c} />
                <button 
                    className='ButtonIssueAdd'
                    onClick={this.addIssue.bind(this)} >
                    Add Your Event
                </button>
                </div>
            </div>
        );
    } 
}

IssueAdd = connect(mapStateToProps)(IssueAdd)




class UserCalendar extends Component {
    render (){
     
            return (
            <div className='UserIssue'>
                <div className='NavUserIssue Clearfix'>
                    <LoginPage/>
                    <IssueAdd/>
                    <IssueList/>
                </div>
               
               
            </div>
            )
    
    }
}
UserCalendar = connect(mapStateToProps)(UserCalendar)

class MainPage extends Component {
    render (){
        return (
            <div className='MainPage'>
                <div className='Welcome'>
                    <h1>Welcome to Event Calendar</h1>
                </div>
                <LoginPage/>
                
            </div>
        )
    }
}




class App extends Component {
    render() {
      return (
          <Provider store={store}>
              <Router history={createHistory()} >
                  <Switch>
                      <Route path='/' component={MainPage} exact />                      
                      <Route path='/UserCalendar' component={UserCalendar} exact/>
                      <Route path='/user/:id' component={User}  />
                  </Switch>
              </Router>
          </Provider>
      );
    }
}
export default App;   