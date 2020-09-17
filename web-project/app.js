const dummyData = require('./dummy-data')
const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const multer = require('multer')
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



const blogposts = [{
  id: 1,
  title: "Hello",
  content: "hello again!"
},
{ 
  id: 2,
  title: "Annies post",
  content: "Today.."
}]

const guestbookposts = [{
  id: 1,
  title: "Hello",
  content: "hello again!"
}, {
  id: 2,
  title: "Annies post",
  content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
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
  const blogpost = blogposts.find(
    h => h.id == id
  )
  const model = {
    blogposts,
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
})

app.post('/home', function(request, response){  
  const model = {
    blogposts: blogposts,
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
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
  const id = request.params.id
  const guestbookpost = guestbookposts.find(
    h => h.id == id
  )
  const model = {
    guestbookposts,
    title: "Guestbook",
    isLoggedIn: true,
  }
  response.render('guestbook.hbs', model)
})

app.get('/blogpost/:id', function(request, response) {
  const id = request.params.id
  const blogpost = blogposts.find(
    h => h.id == id
  )
  const model = {
    blogpost,
    title: "Details",
    isLoggedIn: true,
  }
  response.render('blogpost.hbs', model)
})

app.post('/guestbook', function(request, response){
  const title = request.body.title
  const content = request.body.content
  const guestbookpost = {
    id: guestbookposts.length + 1,
    title, 
    content,
  }

  guestbookposts.push(guestbookpost)
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
    blogposts: blogposts,
    title: "Admin page",
    isLoggedIn: true,
  }
  response.render('admin.hbs', model)
})

app.post('/admin', function(request, response) {
  const title = request.body.title
  const content = request.body.content
  const blogpost = {
    id: blogposts.length + 1,
    title, 
    content,
  }

  blogposts.push(blogpost)
  response.redirect('/home')
})

app.get('/update-posts/:id', function(request, response) {
  const id = request.params.id
  const blogpost = blogposts.find(
    h => h.id == id
  )
  const model = {
    blogpost,
    isLoggedIn: true,
    title: "Update page"
  }
  console.log(model)
  response.render('update-posts.hbs', model)
})

app.post('/update-posts/:id', function(request, response) {
  const id = request.params.id
  const newTitle = request.body.title
  const newContent = request.body.content
  const blogpost = blogposts.find(
    h => h.id == id
  )
  blogpost.title = newTitle
  blogpost.content = newContent

  response.redirect("/home")
})

app.get('/update-gpost/:id', function(request, response) {
  const id = request.params.id
  const guestbookpost = guestbookposts.find(
    h => h.id == id
  )
  const model = {
    guestbookpost,
    isLoggedIn: true,
    title: "Update guestbook"
  }
  console.log(model)
  response.render('update-gpost.hbs', model)
})

app.post('/update-gpost/:id', function(request, response) {
  const id = request.params.id
  const newTitle = request.body.title
  const newContent = request.body.content
  const guestbookpost = guestbookposts.find(
    h => h.id == id
  )
  guestbookpost.title = newTitle
  guestbookpost.content = newContent

  response.redirect("/guestbook")
})

app.post('/delete-posts/:id', function(request, response) {
  const id = request.params.id
  const postIndex = blogposts.findIndex(
    h => h.id == id
  )
  blogposts.splice(postIndex, 1)
  response.redirect('/home')
})

app.post('/delete-gpost/:id', function(request, response) {
  const id = request.params.id
  const gpostIndex = guestbookposts.findIndex(
    h => h.id == id
  )
  guestbookposts.splice(gpostIndex, 1)
  response.redirect('/guestbook')
})

app.get('/portfolio', function(request, response) {
  const model = {
    title: "Portfolio",
    isLoggedIn: true
  }
  response.render('portfolio.hbs' , model)
})




app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/views', express.static(path.join(__dirname, 'views')))
