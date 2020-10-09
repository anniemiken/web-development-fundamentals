const sqlite3 = require('sqlite3')
const db = new sqlite3.Database("my-database.db")


db.run(`
  CREATE TABLE IF NOT EXISTS blogposts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

db.run(`
  CREATE TABLE IF NOT EXISTS projects(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`)

exports.getAllBlogposts = function(callback){
  const query = "SELECT * FROM blogposts ORDER BY id DESC"
  db.all(query, function(error, blogposts){
    callback(error, blogposts)
  })
}

exports.getAllGuestbookPosts = function(callback){
  const query = "SELECT * FROM gbookposts ORDER BY id DESC"
  db.all(query, function (error, gbookposts){
    callback(error, gbookposts)
  })
}

exports.getAllProjects = function(callback){
  const query = "SELECT * FROM projects ORDER BY id DESC"
  db.all(query, function (error, projects){
    callback(error, projects)
  })
}

exports.createGuestbookPost = function(title, content, callback){
  const query = "INSERT INTO gbookposts (title, content) VALUES (?,?)"
    const values = [title, content]
    db.run(query, values, function (error) {
      callback(error)
    })
}

exports.createBlogPost = function(title, content, callback){
  const query = "INSERT INTO blogposts (title, content) VALUES (?,?)"
    const values = [title, content]
    db.run(query, values, function (error) {
      callback(error)
    })
}

exports.createProject = function(name, description, callback){
  const query = "INSERT INTO projects (name, description) VALUES (?,?)"
    const values = [name, description]
    db.run(query, values, function (error) {
      callback(error)
    })
}

exports.getGuestbookPostById = function(id, callback){
  const query = "SELECT * FROM gbookposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function(error, gbookpost){
    callback(error, gbookpost)
  })
}

exports.getGuestbookPostsBySearch = function(search, callback){
  const query = "SELECT * FROM gbookposts WHERE title LIKE ? ORDER BY id DESC"
  const values = [search+'%']
  db.all(query, values, function(error, gbookposts){
    callback(error, gbookposts)
  })
}

exports.getBlogPostsBySearch = function(search, callback){
  const query = "SELECT * FROM blogposts WHERE title LIKE ? ORDER BY id DESC"
  const values = [search+'%']
  db.all(query, values, function(error, blogposts){
    callback(error, blogposts)
  })
}

exports.getAllBlogpostById = function(id, callback){
  const query = "SELECT * FROM blogposts WHERE id = ?"
  const values = [id]
  db.get(query, values, function (error, blogpost) {
    callback(error, blogpost)
  })
}

exports.getProjectById = function(id, callback){
  const query = "SELECT * FROM projects WHERE id = ?"
  const values = [id]
  db.get(query, values, function(error, project){
    callback(error, project)
  })
}

exports.updateBlogpost = function(newTitle, newContent, id, callback){
  const values = [newTitle, newContent, id]
  const query = "UPDATE blogposts SET title = ?, content = ? WHERE id = ?"
  db.run(query, values, function (error) {
    callback(error)
  })
}

exports.updateGuestbookPosts = function(newTitle, newContent, id, callback){
  const values = [newTitle, newContent, id]
  const query = "UPDATE gbookposts SET title = ?, content = ? WHERE id = ?"
  db.run(query, values, function (error) {
    callback(error)
  })
}

exports.updateProjects = function(newName, newDescription, id, callback){
  const values = [newName, newDescription, id]
  const query = "UPDATE projects SET name = ?, description = ? WHERE id = ?"
  db.run(query, values, function (error) {
    callback(error)
  })
}

exports.deleteBlogPostById = function(id, callback){
  const query = "DELETE FROM blogposts WHERE id = ?"
  const values = [id]
  db.run(query, values, function (error) {
    callback(error)
  })
}
exports.deleteGuestbookPostsById = function(id, callback){
  const query = "DELETE FROM gbookposts WHERE id = ?"
  const values = [id]
  db.run(query, values, function (error) {
    callback(error)
  })
}

exports.deleteProjectsById = function(id, callback){
  const query = "DELETE FROM projects WHERE id = ?"
  const values = [id]
  db.run(query, values, function (error) {
    callback(error)
  })
}
