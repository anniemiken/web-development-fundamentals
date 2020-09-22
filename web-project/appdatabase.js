const dummyData = require('./dummy-data')
const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const expressHandlebars = require('express-handlebars')
var path = require('path');
const bodyParser = require('body-parser')
const SQLiteStore = require("connect-sqlite3")(expressSession); 


const MIN_TITLE_LENGTH = 1
const MIN_CONTENT_LENGTH = 2
app.use(bodyParser.urlencoded({
  extended: false
}))

app.listen(8080, function () {
  console.log("Server started on port 8080...");
});

app.use(expressSession({
  secret: "dffdfdfgrtggvcdfd",
  saveUninitialized: false,
  resave: false,
  store: new SQLiteStore()
}))

app.engine('hbs', expressHandlebars({
  defaultLayout: 'main.hbs',
}))
const db = new sqlite3.Database("my-database.db")


const adminUsername = "annie"
const adminPassword = "00aa11"

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

app.get('/', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    title: "Home page",
    isLoggedIn
  }
  response.render("home.hbs", model)
})

app.get('/home', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const query = "SELECT * FROM blogposts ORDER BY id DESC"
  db.all(query, function (error, blogposts) {
    if (error) {
      console.log(error)
    } else {
      const model = {
        blogposts,
        isLoggedIn,
        title: "Home page"
      }
      response.render("home.hbs", model)
    }
  })
})

app.post('/home', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    isLoggedIn,
    blogposts: blogposts,
    title: "Home page"
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


app.get('/guestbook', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const query = "SELECT * FROM gbookposts ORDER BY id DESC"
  db.all(query, function (error, gbookposts) {
    if (error) {
      console.log(error)
    } else {
      const model = {
        gbookposts,
        isLoggedIn,
        title: "Guestbook page"
      }
      response.render("guestbook.hbs", model)
    }
  })
})

app.post('/guestbook', function (request, response) {
  const title = request.body.title
  const content = request.body.content
  const query = "INSERT INTO gbookposts (title, content) VALUES (?,?)"
  const values = [title, content]
  db.run(query, values, function (error) {
    if (error) {
      console.log(error)
    } else {
      response.redirect('/guestbook')
    }
  })
})

app.get('/guestbookpost/:id', function (request, response) {
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
  const query = "SELECT * FROM gbookposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function (error, gbookpost) {
    if (error) {
      console.log(error)
    } else {
      const model = {
        gbookpost,
        title: "Details guestbook page",
        isLoggedIn,
      }
      response.render('guestbookpost.hbs', model)
    }
  })
})

app.get('/blogpost/:id', function (request, response) {
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn

  const query = "SELECT * FROM blogposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function (error, blogpost) {
    if (error) {
      console.log(error)
    } else {
      const model = {
        blogpost,
        title: "Details page",
        isLoggedIn,
      }
      response.render('blogpost.hbs', model)
    }
  })
})

app.use(function (request, response, next) {
  const isLoggedIn = request.session.isLoggedIn
  response.locals.isLoggedIn = isLoggedIn
  next()
})

app.get('/login', function (request, response) {
  const model = {
    layout: false
  }
  response.render('login.hbs', model)
})

app.post("/login", function (request, response) {
  const enteredUsername = request.body.username
  const enteredPassword = request.body.password

  if (enteredUsername == adminUsername && enteredPassword == adminPassword) {
    request.session.isLoggedIn = true
    response.redirect("/home")
  } else {
    console.log("wrong username or wrong password")
    response.redirect("/guestbook")
  }
})

app.get('/admin', function (request, response) {
  if(request.session.isLoggedIn){
    const model = {
      validationError: [],
      title: "Admin page",
    }
    response.render('admin.hbs', model)
  }else{
    response.redirect("/login")
  }
  
})

function getValidationErrorsForPost(title, content) {
  const validationError = []
  if (title.length <= MIN_TITLE_LENGTH) {
    validationError.push("Title should contain at least " + MIN_TITLE_LENGTH + " character")
  }
  if (content.length <= MIN_CONTENT_LENGTH) {
    validationError.push("Content should contain at least " + MIN_CONTENT_LENGTH + " characters")
  }
  return validationError
}

app.post('/admin', function (request, response) {
  const title = request.body.title
  const content = request.body.content

  const errors = getValidationErrorsForPost(title, content)

  if (!request.session.isLoggedIn) {
    errors.push("You have to login to make a blogpost.")
  }
  if (errors.length == 0) {
    const query = "INSERT INTO blogposts (title, content) VALUES (?,?)"
    const values = [title, content]
    db.run(query, values, function (error) {
      if (error) {
        console.log(error)
      } else {
        response.redirect('/home')
      }
    })
  } else {
    const model = {
      errors,
      title: "Admin page"
    }
    response.render('admin.hbs', model)
  }

})

app.get('/update-posts/:id', function (request, response) {
  if(request.session.isLoggedIn){
    const model = {
      validationError: [],
      title: "Update blogpost page",
    }
    response.render('update-posts.hbs', model)
  }else{
    response.redirect("/login")
  }
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
  const query = "SELECT * FROM blogposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function (error, blogpost) {
    if (error) {
      console.log(error)
    } else {
      const model = {
        blogpost,
        title: "Update page",
        isLoggedIn,
      }
      response.render('update-posts.hbs', model)
    }
  })
})

app.post('/update-posts/:id', function (request, response) {
  const errors = getValidationErrorsForPost(title, content)

  if (!request.session.isLoggedIn) {
    errors.push("You have to login to update a blogpost.")
  }
  const id = request.params.id
  const newTitle = request.body.title
  const newContent = request.body.content

  const validationError = getValidationErrorsForPost(newTitle, newContent)
  if(validationError.length == 0){
    const values = [newTitle, newContent, id]
    const query = "UPDATE blogposts SET title = ?, content = ? WHERE id = ?"
    db.run(query, values, function (error) {
      if (error) {
        console.log(error)
      } else {
        response.redirect("/home")
    }
  })
  }else{
    const model = {
      errors,
      blogpost: {
        id, 
        title: newTitle,
        content: newContent
      }, 
      validationError
    }
    response.render('update-posts.hbs', model)
  }  
})

app.get('/update-gpost/:id', function (request, response) {
  if(request.session.isLoggedIn){
    const model = {
      validationError: [],
      title: "Update guestbook page",
    }
    response.render('update-gpost.hbs', model)
  }else{
    response.redirect("/login")
  }
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
  const query = "SELECT * FROM gbookposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function (error, gbookpost) {
    if (error) {
      console.log(error)
    } else {
      const model = {
        gbookpost,
        title: "Update page",
        isLoggedIn,
      }
      response.render('update-gpost.hbs', model)
    }
  })

})

app.post('/update-gpost/:id', function (request, response) {
  const id = request.params.id
  const newTitle = request.body.title
  const newContent = request.body.content
  const validationError = getValidationErrorsForPost(newTitle, newContent)
  if(validationError.length == 0){
    const values = [newTitle, newContent, id]
    const query = "UPDATE gbookposts SET title = ?, content = ? WHERE id = ?"
    db.run(query, values, function (error) {
      if (error) {
        console.log(error)
      } else {
        response.redirect("/guestbook")
    }
  })
  }else{
    const model = {
      gbookpost: {
        id, 
        title: newTitle,
        content: newContent
      }, 
      validationError
    }
    response.render('update-gpost.hbs', model)
  }  
})

app.post('/delete-posts/:id', function (request, response) {
  const id = request.params.id
  const query = "DELETE FROM blogposts WHERE id = ?"
  db.run(query, [id], function (error) {
    if (error) {
      console.log(error)
    } else {
      response.redirect('/home')
    }
  })
})

app.post('/delete-gpost/:id', function (request, response) {
  const id = request.params.id
  const query = "DELETE FROM gbookposts WHERE id = ?"
  db.run(query, [id], function (error) {
    if (error) {
      console.log(error)
    } else {
      response.redirect('/guestbook')
    }
  })
})

app.get('/portfolio', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const model = {
    title: "Portfolio",
    isLoggedIn
  }
  response.render('portfolio.hbs', model)
})

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false
  response.redirect("/home")
})




app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/views', express.static(path.join(__dirname, 'views')))
