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
const db = require('./db')
const blogRouter = require('./routers/blogpost-router')
const guestbookRouter = require('./routers/blogpost-router')
const projectRouter = require('./routers/blogpost-router')


const MIN_TITLE_LENGTH = 1
const MIN_CONTENT_LENGTH = 2
const MIN_DESCRIPTION_LENGTH = 1
const MIN_NAME_LENGTH = 1

app.use('/guestbook', guestbookRouter)
app.use('/blogpost', blogRouter)
app.use('/project', projectRouter)
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


const adminUsername = "annie"
const adminPassword = "00aa11"

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
  db.getAllBlogposts(function (error, blogposts) {
    if (error) {
      console.log(error) 
      response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
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
  db.getAllGuestbookPosts(function (error, gbookposts) {
    if (error) {
      response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
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
  const isLoggedIn = request.session.isLoggedIn
  const title = request.body.title
  const content = request.body.content
  const errors = getValidationErrorsForPost(title, content);

  if (errors.length == 0) {
    db.createGuestbookPost(title, content, function(error){
      if (error) {
        response.render("errorMessage.hbs", {errorMessage: "Could not insert data into database, Try again later"})
        console.log(error)
      } else {
        response.redirect('/guestbook')
      }
    })
  } else {
    db.getAllGuestbookPosts(function (error, gbookposts) {
    if (error) {
      response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
      console.log(error)
    } else {
      const model = {
        errors,
        gbookposts,
        isLoggedIn,
        title: "Guestbook page"
      }
      response.render("guestbook.hbs", model)
    }
  })
  }
})


app.get('/guestbookpost/:id', function (request, response) {
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
  
  db.getGuestbookPostById(id, function (error, gbookpost) {
    if (error) {
      response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
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

  db.getAllBlogpostById(id, function(error, blogpost){
    if (error) {
      response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
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

app.get('/error', function(request, response){
  request.session.isLoggedIn = true
  response.render('errorMessage.hbs')
  
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
  request.session.isLoggedIn = true
  const errors = getValidationErrorsForLogin(enteredPassword, enteredUsername)
  if (errors.length == 0) {
    response.redirect("/home")
  } else {
    const model = {
      errors,
      layout: false
    }
    response.render('login.hbs', model)
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

function getValidationErrorsForProject(name, description) {
  const validationError = []
  if (name.length <= MIN_NAME_LENGTH) {
    validationError.push("Name should contain at least " + MIN_NAME_LENGTH + " character")
  }
  if (description.length <= MIN_DESCRIPTION_LENGTH) {
    validationError.push("Description should contain at least " + MIN_DESCRIPTION_LENGTH + " characters")
  }
  return validationError
}

function getValidationErrorsForLogin(enteredPassword, enteredUsername){
  const errors = []
   if(enteredUsername != adminUsername) {
    console.log("Wrong username");
    errors.push("Wrong username")
   }
   if(enteredPassword != adminPassword){
    console.log("Wrong password");
    errors.push("Wrong password")
   }
   return errors
}

app.post('/admin', function (request, response) {
  const title = request.body.title
  const content = request.body.content

  const errors = getValidationErrorsForPost(title, content)

  if (!request.session.isLoggedIn) {
    errors.push("You have to login to make a blogpost.")
  }
  if (errors.length == 0) {
    db.createBlogPost(title, content, function (error) {
      if (error) {
        console.log(error)
        response.render('errorMessage.hbs', {errorMessage: "Could not insert data into database, try again later"})
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
  /*if(request.session.isLoggedIn){
    const model = {
      validationError: [],
      title: "Update blogpost page",
    }
    response.render('update-posts.hbs', model)
  }else{
    response.redirect("/login")
  }*/
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
 db.getAllBlogpostById(id, function(error, blogpost){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not select from database, try again later"})
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
  const id = request.params.id
  const newTitle = request.body.title
  const newContent = request.body.content
  const validationError = getValidationErrorsForPost(newTitle, newContent)

  if (!request.session.isLoggedIn) {
    validationError.push("You have to login to update a blogpost.")
  }

  if(validationError.length == 0){
    db.updateBlogpost(newTitle, newContent, id, function(error){
      if (error) {
        response.render('errorMessage.hbs', {errorMessage: "Could not update data into database, try again later"})
        console.log(error)
      } else {
        response.redirect("/home")
    }
  })
  }else{
    const model = {
      blogpost: {
        id, 
        title: newTitle,
        content: newContent
      }, 
      validationError,
      error
    }
    response.render('update-posts.hbs', model)
  }  
})

app.get('/update-gpost/:id', function (request, response) {
  /*if(request.session.isLoggedIn){
    const model = {
      validationError: [],
      title: "Update guestbook page",
    }
    response.render('update-gpost.hbs', model)
  }else{
    response.redirect("/login")
  }
  */
 
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
  db.getGuestbookPostById(id, function (error, gbookpost) {
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not select data from database, try again later"})
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
  if (!request.session.isLoggedIn) {
    validationError.push("You have to login to update a gueestbook post.")
  }
  if(validationError.length == 0){
    db.updateGuestbookPosts(newTitle, newContent, id, function(error){
      if (error) {
        response.render('errorMessage.hbs', {errorMessage: "Could not update data into database, try again later"})
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
      validationError,
      title: "Update guestbook post"
    }
    response.render('update-gpost.hbs', model)
  }  
})

app.post('/delete-posts/:id', function (request, response) {
  const id = request.params.id
  db.deleteBlogPostById(id, function(error){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not delete data from database, try again later"})
      console.log(error)
    } else {
      response.redirect('/home')
    }
  })
})

app.post('/delete-gpost/:id', function (request, response) {
  const id = request.params.id
  db.deleteGuestbookPostsById(id, function(error){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not delete data from database, try again later"})
      console.log(error)
    } else {
      response.redirect('/guestbook')
    }
  })
})

app.post('/delete-project/:id', function (request, response) {
  const id = request.params.id
  db.deleteProjectsById(id, function(error){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not delete data from database, try again later"})
      console.log(error)
    } else {
      response.redirect('/portfolio')
    }
  })
})

app.get('/portfolio', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  db.getAllProjects(function (error, projects){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not select data from database, try again later"})
      console.log(error)
    } else {
      const model = {
        projects,
        isLoggedIn,
        title: "Portfolio page"
      }
      response.render("portfolio.hbs", model)
    }
  })
})

app.post('/portfolio', function (request, response) {
  const isLoggedIn = request.session.isLoggedIn
  const name = request.body.name
  const description = request.body.description
  const validationError = getValidationErrorsForProject(name, description);
  if(validationError.length == 0){
    db.createProject(name, description, function(error){
      if (error) {
        response.render('errorMessage.hbs', {errorMessage: "Could not insert data into database, try again later"})
        console.log(error)
      } else {
        response.redirect('/portfolio')
      }
    })
  }else{
    db.getAllProjects(function(error, projects){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not select data from database, try again later"})
      console.log(error)
    } else {
      const model = {
        validationError,
        projects,
        isLoggedIn,
        title: "Portfolio page"
      }
      response.render("portfolio.hbs", model)
    }
  })
  }  
})

app.get('/update-project/:id', function (request, response) {
  /*if(request.session.isLoggedIn){
    const model = {
      validationError: [],
      title: "Update guestbook page",
    }
    response.render('update-gpost.hbs', model)
  }else{
    response.redirect("/login")
  }
  */
 
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn
  db.getProjectById(id, function(error, project){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not select data from database, try again later"})
      console.log(error)
    } else {
      const model = {
        project,
        title: "Update project page",
        isLoggedIn,
      }
      response.render('update-project.hbs', model)
    }
  })

})

app.post('/update-project/:id', function (request, response) {
  const id = request.params.id
  const newName = request.body.name
  const newDescription = request.body.description
  /*const validationError = getValidationErrorsForPost(newTitle, newContent)
  if (!request.session.isLoggedIn) {
    validationError.push("You have to login to update a project.")
  }*/
  const validationError = getValidationErrorsForProject(newName, newDescription)
  if (!request.session.isLoggedIn) {
    validationError.push("You have to login to update a project post.")
  }
    if(validationError.length == 0){
      db.updateProjects(newName, newDescription, id, function(error){
        if (error) {
          response.render('errorMessage.hbs', {errorMessage: "Could not update data into database, try again later"})
          console.log(error)
        } else {
          response.redirect("/portfolio")
      }
    })
    }else{
      const model = {
        project: {
          id, 
          name: newName,
          description: newDescription
        }, 
        validationError,
        title: "Update portfolio post"
      }
      response.render('update-gpost.hbs', model)
    }
})

app.get('/project/:id', function (request, response) {
  const id = request.params.id
  const isLoggedIn = request.session.isLoggedIn

  db.getProjectById(id, function(error, project){
    if (error) {
      response.render('errorMessage.hbs', {errorMessage: "Could not select data from database, try again later"})
      console.log(error)
    } else {
      const model = {
        project,
        title: "Details page",
        isLoggedIn,
      }
      response.render('project.hbs', model)
    }
  })
})

app.post("/logout", function (request, response) {
  request.session.isLoggedIn = false
  response.redirect("/home")
})




app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/views', express.static(path.join(__dirname, 'views')))
