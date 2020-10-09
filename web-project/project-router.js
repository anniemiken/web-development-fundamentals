const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
module.exports = router
const db = require('../db') 
var csrf = require('csurf')
const MIN_DESCRIPTION_LENGTH = 1
const MIN_NAME_LENGTH = 1

var csrfProtection = csrf()

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

  router.get('/portfolio',csrfProtection, function (request, response) {
    const isLoggedIn = request.session.isLoggedIn
    db.getAllProjects(function (error, projects){
      if (error) {
        response.render('errorMessage.hbs', {errorMessage: "Could not select data from database, try again later"})
        console.log(error)
      } else {
        const model = {
          projects,
          isLoggedIn,
          title: "Portfolio page",
          csrfToken: request.csrfToken(),
        }
        response.render("portfolio.hbs", model)
      }
    })
  })
  
  router.post('/portfolio', csrfProtection,function (request, response) {
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
          response.redirect('/project/portfolio')
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

router.post('/delete/:id', function (request, response) {
    const id = request.params.id
    db.deleteProjectsById(id, function(error){
      if (error) {
        response.render('errorMessage.hbs', {errorMessage: "Could not delete data from database, try again later"})
        console.log(error)
      } else {
        response.redirect('/project/portfolio')
      }
    })
  })
  

  
  router.get('/update/:id', csrfProtection,function (request, response) {
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
          csrfToken: request.csrfToken(),
        }
        response.render('update-project.hbs', model)
      }
    })
  
  })
  
  router.post('/update/:id',csrfProtection, function (request, response) {
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
            response.redirect("/project/portfolio")
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
  
  router.get('/:id', function (request, response) {
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
