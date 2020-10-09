const express = require('express')
const router = express.Router()
var csrf = require('csurf')
module.exports = router
const db = require('../db') 

const MIN_TITLE_LENGTH = 1
const MIN_CONTENT_LENGTH = 1
var csrfProtection = csrf()

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

router.get('/home', function (request, response) {
    const isLoggedIn = request.session.isLoggedIn
    db.getAllBlogposts(function (error, blogposts) {
      if (error) {
        console.log(error) 
        response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
      } else {
        const model = {
          blogposts,
          isLoggedIn,
          title: "Home page",
        }
        response.render("home.hbs", model)
      }
    })
  })
  
  router.post('/home',csrfProtection, function (request, response) {
    const isLoggedIn = request.session.isLoggedIn
    const model = {
      isLoggedIn,
      blogposts: blogposts,
      title: "Home page"
    }
    response.render("home.hbs", model)
  })

router.get('/blogpost/:id', function (request, response) {
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

  router.get('/admin', csrfProtection, function (request, response) {
    if(request.session.isLoggedIn){
      const model = {
        validationError: [],
        title: "Admin page",
        csrfToken: request.csrfToken(),
      }
      response.render('admin.hbs', model)
    }else{
      response.redirect("/login")
    }
  })

  router.post('/admin',csrfProtection, function (request, response) {
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
          response.redirect('/blogpost/home')
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

  router.get('/update/:id',csrfProtection, function (request, response) {
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
          csrfToken: request.csrfToken(),
        }
        response.render('update-posts.hbs', model)
      }
    })
  })
  
  router.post('/update/:id', csrfProtection, function (request, response) {
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
          response.redirect("/blogpost/home")
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
      }
      response.render('update-posts.hbs', model)
    }  
  })

  router.post('/delete/:id', function (request, response) {
    const id = request.params.id
    db.deleteBlogPostById(id, function(error){
      if (error) {
        response.render('errorMessage.hbs', {errorMessage: "Could not delete data from database, try again later"})
        console.log(error)
      } else {
        response.redirect('/blogpost/home')
      }
    })
  })

  router.get('/search', function(request, response){
    const isLoggedIn = request.session.isLoggedIn
    const search = request.query.search
    db.getBlogPostsBySearch(search, function(error, blogposts) {
      if (error) {
        response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
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
