const express = require('express')
const bcrypt = require('bcrypt');
var csrf = require('csurf')
const saltRounds = 10;
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
var path = require('path');
const SQLiteStore = require("connect-sqlite3")(expressSession);
const db = require('./db')
const blogRouter = require('./routers/blogpost-router')
const guestbookRouter = require('./routers/guestbook-router')
const projectRouter = require('./routers/project-router')
const adminUsername = "annie"
const adminPassword = "$2b$10$N89UGVWC6eCJdlCme69e4.VxjcOZMfUSaqiqxNemBqwQxK9RzaL0e"

//hashing the password 

/*bcrypt.genSalt(saltRounds, function(err, salt) {
  bcrypt.hash(adminPassword, salt, function(err, hash) {
    console.log(hash);
  });
});
*/
var csrfProtection = csrf()


const app = express()
app.engine('hbs', expressHandlebars({
  defaultLayout: 'main.hbs',
}))

app.listen(8080, function () {
  console.log("Server started on port 8080...");
});

app.use(bodyParser.urlencoded({
  extended: false
}))


app.use(expressSession({
  secret: "dffdfdfgrtggvcdfd",
  saveUninitialized: false,
  resave: false,
  store: new SQLiteStore({
    db: "sessions.db"
  })
}))

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn
  response.locals.isLoggedIn = isLoggedIn
  next()
})

app.use('/guestbook', guestbookRouter)
app.use('/blogpost', blogRouter)
app.use('/project', projectRouter)
app.use(bodyParser.urlencoded({
  extended: false
}))

app.get('/', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    title: "Home page",
    isLoggedIn
  }
  response.render("home.hbs", model)
})



app.get('/about', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    title: "About page",
    isLoggedIn
  }
  response.render('about.hbs', model)
})

app.get('/contact', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    title: "Contact page",
    isLoggedIn
  }
  response.render('contact.hbs', model)
})

app.get('/error', function(request, response){
  request.session.isLoggedIn = true
  response.render('errorMessage.hbs')
  
})


app.get('/login', csrfProtection,function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    isLoggedIn,
    layout: false,
    csrfToken: request.csrfToken(),
  }
  response.render('login.hbs', model)
})

app.post("/login",csrfProtection, function (request, response) {
  const enteredUsername = request.body.username
  const enteredPassword = request.body.password
  const errors = [];
  if(enteredUsername != adminUsername) {
    console.log("Wrong username");
    errors.push("Wrong username")
   }


   bcrypt.compare(enteredPassword, adminPassword, function(err, result){
    if(result){
      request.session.isLoggedIn = true;
      response.redirect("/blogpost/home")
    }else{
      console.log("Wrong password");
      errors.push("Wrong password");
      request.session.isLoggedIn = false;
      const model = {
        layout: false,
        errors,
    }
    response.render('login.hbs', model)
    }
   })
})

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false
  response.redirect("/blogpost/home")
})




app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/views', express.static(path.join(__dirname, 'views')))
