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



db.run(`
  CREATE TABLE IF NOT EXISTS blogposts(
    id INTGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS gbookposts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT
  )
`)


app.get('/', function(request, response){
  const model = {
    isLoggedIn: true,
    title: "Home page"
  }
  response.render("home.hbs", model)
})

app.get('/home', function(request, response) { 
  const id = request.params.id
  const query = "SELECT * FROM blogposts ORDER BY id"
  db.all(query, function(error, blogposts){
    if(error){
      console.log(error)
    }else{
      const model = {
        blogposts,
        isLoggedIn: true,
        title: "Home page"
      }
      response.render("home.hbs", model)
    }
})
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
  const query = "SELECT * FROM gbookposts ORDER BY id"
  db.all(query, function(error, gbookposts){
    if(error){
      console.log(error)
    }else{
      const model = {
        gbookposts,
        isLoggedIn: true,
        title: "Guestbook page"
      }
      response.render("guestbook.hbs", model)
    }
})
})

app.get('/guestbookpost/:id', function(request, response) {
  const id = request.params.id
  const query = "SELECT * FROM gbookposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function(error, gbookpost){
    if(error){
      console.log(error)
    }else{
      const model = {
        gbookpost,
        title: "Details guestbook page",
        isLoggedIn: true,
      }
      response.render('guestbookpost.hbs', model)
    }
  })
})

app.get('/blogpost/:id', function(request, response) {
  const id = request.params.id
  const query = "SELECT * FROM blogposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function(error, blogpost){
    if(error){
      console.log(error)
    }else{
      const model = {
        blogpost,
        title: "Details page",
        isLoggedIn: true,
      }
      response.render('blogpost.hbs', model)
    }
  })
})

app.post('/guestbook', function(request, response){
  const id = request.params.id
  const title = request.body.title
  const content = request.body.content

  const query = "INSERT INTO gbookposts (title, content) VALUES (?,?)"
  const values = [title, content]
  db.run(query, values, function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect('/guestbook')
    }
  })
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

app.post('/admin', function(request, response) {
  const title = request.body.title
  const content = request.body.content

  const query = "INSERT INTO blogposts (title, content) VALUES (?,?)"
  const values = [title, content]
  db.run(query, values, function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect('/home')
    }
  })
})

app.get('/update-posts/:id', function(request, response) {
  const id = request.params.id
  const model = {
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
  const query = "UPDATE blogposts SET title = ? WHERE id = ?"
  db.run(query, [newTitle, newContent, id], function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect("/home")
    }
  })
})

app.get('/update-gpost/:id', function(request, response) {
  const id = request.params.id
  const model = {
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
  const query = "UPDATE gbookposts SET title = ?, content = ? WHERE id = ?"
  db.run(query, [newTitle, newContent, id], function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect("/guestbook")
    }
  })
})

app.post('/delete-posts/:id', function(request, response) {
  const id = request.params.id
  const query = "DELETE FROM blogposts WHERE id = ?"
  db.run(query, [id], function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect('/home')
    }
  })
})

app.post('/delete-gpost/:id', function(request, response) {
  const id = request.params.id
  const query = "DELETE FROM gbookposts WHERE id = ?"
  db.run(query, [id], function(error){
    if(error){
      console.log(error)
    }else{
      response.redirect('/guestbook')
    }
  })
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
