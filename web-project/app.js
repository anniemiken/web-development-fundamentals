const expressHandlebars = require('express-handlebars')

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

app.listen(8080)