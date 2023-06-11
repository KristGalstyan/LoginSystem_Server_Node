import express from 'express'
import path from 'path'

const app = express()
app.use(express.static('views'))

app.get('/login', (req, res) => {
  res.sendFile(path.resolve('views/login.html'))
})

app.get('/register', (req, res) => {
  res.sendFile(path.resolve('views/register.html'))
})

app.get('/', (req, res) => {
  res.send('yay')
})

app.listen(process.env.PORT)
