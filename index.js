import express from 'express'
import path from 'path'
import bcrypt from 'bcrypt'
import session from 'express-session'
import passport from 'passport'
import passportLocal from 'passport-local'

let users = []

const app = express()

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
)

app.use(express.static('views'))
app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize())
app.use(passport.session())
passport.use(
  new passportLocal.Strategy(
    {
      usernameField: 'email'
    },
    async (email, password, done) => {
      const user = users.find((user) => user.email === email)
      if (user === undefined) {
        return done(null, null, { message: 'user not found' })
      }
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      }
      done(null, null, { message: 'Incorrect password' })
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  done(
    null,
    users.find((user) => user.id === id)
  )
})
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
)

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.resolve('views/login.html'))
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.resolve('views/register.html'))
})

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  users.push({
    id: `${Date.now()}_${Math.random()}`,
    name,
    email,
    password: await bcrypt.hash(password, 10)
  })
  res.redirect('/login')
})

app.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/login')
  })
})

app.get('/', checkAuthenticated, (req, res) => {
  res.sendFile(path.resolve('views/app.html'))
})

function checkAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login')
  }
  next()
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
  }
  next()
}

app.listen(process.env.PORT)
