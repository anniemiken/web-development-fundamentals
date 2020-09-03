const dummyData = require('./dummy-data')
const express = require('express')
const expressHandlebars = require('express-handlebars')
var path = require('path');
const app = express()

app.engine("hbs", expressHandlebars({
  defaultLayout: 'main.hbs'
}))

app.get('/', function(request, response){
  const model = {
    humans: dummyData.humans
  }
  response.render("show-all-humans.hbs", model)
})

app.get('/about.hbs', function(request, response){
  response.render("about.hbs", {})
})

app.get('/contact.hbs', function(request, response){
  response.render("contact.hbs", {})
})

app.get('/about', function(request, response){
  response.render("about.hbs", {})
})

app.get('/portfolio.hbs', function(request, response){
  response.render("portfolio.hbs", {})
})

app.get('/home.hbs', function(request, response){
  response.render("home.hbs", {})
})

app.use('/static', express.static(path.join(__dirname, 'dist')))
app.listen(8080)