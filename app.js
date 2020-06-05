var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require("passport");
var passportLocalMongoose = require('passport-local-mongoose');
var localStrategy = require('passport-local');
var expressSession = require('express-session');
var PORT = 4000;
var User = require('./models/user');

var app = express();
app.use(expressSession({
    secret:'avengers assemble',
    resave: false,
    saveUninitialized: false
}))
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/yelp",{useNewUrlParser: true, useUnifiedTopology: true});
app.set('view engine','ejs');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));//to authenticate
passport.serializeUser(User.serializeUser());// this method gives the data to session after encoding it 
passport.deserializeUser(User.deserializeUser());// this method takes encoded data from the session and encode it 

/*ROUTES 
========================*/

app.get('/',function(req,res){
    res.render('home');
})

app.get('/secret',isLoggedIn,function(req,res){
    res.render('secret');
})

// Auth Routes
app.get('/register',function(req,res){
    res.render('register')
})

app.post('/register',function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err)
        {
            console.log(err);
            res.render('register')
        }
        else
        {
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secret')
            })
        }
    })
})

app.get('/login',function(req,res){
    res.render('login')
})

// middleware = it runs before our final code in callback function
app.post('/login',passport.authenticate('local',{
    successRedirect: '/secret',
    failureRedirect: '/login'   
}),function(req,res){

})

app.get('/logout',function(req,res){
    //res.send('this is logout')
     req.logout();
    res.redirect('/');
})

function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

app.listen(PORT, () => {
    console.log('server has started');
})