const express = require('express')
const router = express.Router()
const passport = require('passport')

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}))

router.get('/login', (req, res) => {
  res.render('login')
})


module.exports = router