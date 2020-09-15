const dummyData = require('./dummy-data')
const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const expressHandlebars = require('express-handlebars')
var path = require('path');
const bodyParser = require('body-parser')
const { allowedNodeEnvironmentFlags } = require('process')
const { response } = require('express')
const { kStringMaxLength } = require('buffer')

app.use(bodyParser.urlencoded({
  extended: false
}))

app.listen(8080, function(){
  console.log("Server started on port 8080...");
});


app.engine('hbs', expressHandlebars({
  defaultLayout: 'main.hbs',
}))
const db = new sqlite3.Database("my-database.db")



const posts = [{
  id: 1,
  atitle: "Hello",
  acontent: "hello again!"
}
]

const gposts = [{
  id: 1,
  gtitle: "Hello",
  gcontent: "hello again!"
}, {
  id: 2,
  gtitle: "Annies post",
  gcontent: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
}]


app.get('/', function(request, response){
  const model = {
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
})

app.get('/home', function(request, response) { 
  const id = request.params.id
  const post = posts.find(
    h => h.id == id
  )
  const model = {
    posts,
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
})

app.post('/home', function(request, response){  
  const model = {
    posts: posts,
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

app.post('/contact', function(request, response){
  const name = req.body.name
  const email = req.body.email
})

app.get('/guestbook', function(request, response) {
  const gid = request.params.id
  const gpost = gposts.find(
    h => h.gid == gid
  )
  const model = {
    gposts: gposts,
    title: "Guestbook",
    isLoggedIn: true,
  }
  response.render('guestbook.hbs', model)
})

app.post('/guestbook', function(request, response){
  const gtitle = request.body.gtitle
  const gcontent = request.body.gcontent
  const gpost = {
    id: gposts.length + 1,
    gtitle, 
    gcontent,
  }

  gposts.push(gpost)
  response.redirect('/guestbook')
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
    posts: posts,
    title: "Admin page",
    isLoggedIn: true,
  }
  response.render('admin.hbs', model)
})

app.post('/admin', function(request, response) {
  const atitle = request.body.atitle
  const acontent = request.body.acontent
  const post = {
    id: posts.length + 1,
    atitle, 
    acontent,
  }

  posts.push(post)
  response.redirect('/home')
})

app.get('/update-posts', function(request, response) {
  const id = request.params.id
  const post = posts.find(
    h => h.id == id
  )
  const model = {
    title: "Update page",
    isLoggedIn: true,
  }
  response.render('update-posts.hbs', model)
})

app.post('/update-posts/:id', function(request, response) {
  const id = request.params.id
  const newTitle = request.body.atitle
  const newContent = request.body.acontent
  const post = posts.find(
    h => h.id == id
  )
  atitle = newTitle
  acontent = newContent
  response.redirect("/update-posts")
})

app.post('/delete-posts/:id', function(request, response) {
  const id = request.params.id
  const postIndex = posts.findIndex(
    h => h.id == id
  )
  posts.splice(postIndex, 1)
  response.redirect('/home')
})



app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/views', express.static(path.join(__dirname, 'views')))
