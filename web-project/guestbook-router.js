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

// /guestbook
router.get('/', csrfProtection, function (request, response) {
    const isLoggedIn = request.session.isLoggedIn
    db.getAllGuestbookPosts(function (error, gbookposts) {
      if (error) {
        response.render("errorMessage.hbs", {errorMessage: "Could not select data from database, Try again later"})
        console.log(error)
      } else {
        const model = {
          gbookposts,
          isLoggedIn,
          csrfToken: request.csrfToken(),
          title: "Guestbook page"
        }
        response.render("guestbook.hbs", model)
      }
    })
  })


  // /guestbook
  router.post('/', csrfProtection, function (request, response) {
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
// /guestbook/guestbookpost/:id
  router.get('/guestbookpost/:id', function (request, response) {
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

  router.get('/update/:id',csrfProtection, function (request, response) {
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
          csrfToken: request.csrfToken()
        }
        response.render('update-gpost.hbs', model)
      }
    })
  })
  
  router.post('/update/:id', csrfProtection, function (request, response) {
    const id = request.params.id
    const newTitle = request.body.title
    const newContent = request.body.content
    const validationError = getValidationErrorsForPost(newTitle, newContent)
    if (!request.session.isLoggedIn) {
      validationError.push("You have to login to update a guestbook post.")
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


  router.post('/delete/:id',function (request, response) {
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

  //Search for guestbooks

router.get('/search', function(request, response){
  const isLoggedIn = request.session.isLoggedIn
  const search = request.query.search
  db.getGuestbookPostsBySearch(search, function(error, gbookposts) {
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




