const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    userName: String,
    created: { 
		type: Date,
		default: Date.now
	},
	password: String,
    email: String,
    issue: [String]
});

 
const User = mongoose.model('User', userSchema);

var express = require('express');
const cors  = require('cors');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');


var schema = buildSchema(`
type Query {
    user(userName: String!, password: String!): User
}

type User {
    id:  String
    userName: String
    created: String
	email : String
    password : String
    issue: [String]
}

type Mutation {
    createUser(userName: String!, email: String!, password: String!): User  
    updateUser(_id: String!, userName: String!, email: String!, issue: [String!]): User
} 

`);

async function run(){
    await mongoose.connect('mongodb://localhost:27017/eventCalendar', { useNewUrlParser: true });
  

    //  let user = [{userName: "Bill", password: "qwerty", email:"bill@gmail.com"},{userName: "Alice", password: "123456", email:"alice@gmail.com"}];
    
    // User.create(user, function(err, doc){
    //     mongoose.disconnect();
       
    //      if(err) return console.log(err);
          
    //     console.log("Save users", doc);
    // });

    async function createUser({userName, email, password}){
        return User.create({userName, email, password})
    }

    async function getUser(args){
        return  User.findOne(args);
    }

       
    async function updateUser(args){
        let id = args._id;
        return User.findOneAndUpdate({_id: id}, args, {new : true})
    }
 

// Root resolver
    var root = {
        createUser,
        user: getUser,
        updateUser
    };

// Create an express server and a GraphQL endpoint
    var app = express();
    app.use(cors())

    app.use('/graphql', express_graphql({
        schema: schema,
        rootValue: root,
        graphiql: true,
        
    }));

    
    app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
    

}

run()


