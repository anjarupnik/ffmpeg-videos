const express = require('express')
const http = require('http')
const routes = require('./routes')

const PORT = process.env.PORT || 3030

const app = express()
const server = http.Server(app)
const io = require('socket.io')(server)

app
  .use(express.static('view'))
  .use(routes(io))
  .use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  .use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
      message: err.message,
      error: app.get('env') === 'development' ? err : {}
    })
  })

server.listen(PORT)