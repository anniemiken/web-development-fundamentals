const dummyData = require('./dummy-data')
const express = require('express')
const app = express()
const expressHandlebars = require('express-handlebars')
var path = require('path');

app.listen(8080, function(){
  console.log("Server started on port 8080...");
});


app.engine('hbs', expressHandlebars({
  defaultLayout: 'main.hbs',
}))

app.get('/', function(request, response){
  const model = {
    humans: dummyData.humans,
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
})

app.get('/home', function(request, response) {
  const model = {
    posts: dummyData.posts,
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
})

app.get('/portfolio', function(request, response) {
  const model = {
    title: "Portfolio",
    isLoggedIn: true
  }
  response.render('portfolio.hbs' , model)
})

app.get('/about', function(request, response) {
  const model = {
    title: "About page",
    isLoggedIn: true
  }
  response.render('about.hbs', model)
})

app.get('/contact', function(request, response) {
  const model = {
    title: "Contact page",
    isLoggedIn: true
  }
  response.render('contact.hbs', model)
})

app.get('/guestbook', function(request, response) {
  const model = {
    guestbook: dummyData.guestbook,
    title: "Guestbook",
    isLoggedIn: true
  }
  response.render('guestbook.hbs', model)

})

app.get('/login', function(request, response) {
  const model = {
    isLoggedIn: true,
    layout: false 
    }
  response.render('login.hbs', model)
})

app.get('/admin', function(request, response) {
  const model = {
    title: "Admin page",
    isLoggedIn: true,
  }
  response.render('admin.hbs', model)
})


app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/views', express.static(path.join(__dirname, 'views')))
