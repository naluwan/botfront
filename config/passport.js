const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const sql = require('mssql')
const pool = require('./connectPool')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy({passReqToCallback: true}, (req, email, password, done) => {
    const request = new sql.Request(pool)
    request.query(`select CPY_NO, EMAIL, PASSWORD, INDUSTRY_NO, ISADMIN
    from BOTFRONT_USERS_INFO
    where EMAIL = ${email}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }

      const user = result.recordset[0]

      if(!user) return done(null, false, {message: `這個Email還未註冊!!`})

      const isValid = bcrypt.compareSync(password, user.password)
      if(isValid){
        return done(null, user)
      }else{
        return done(null, false, {message: `帳號或密碼錯誤!!`})
      }
    })
  }))

  passport.serializeUser(function(user, done){
    done(null, user.EMAIL)
  })

  passport.deserializeUser(function(email, done){
    request.query(`select * 
    from BOTFRONT_USERS_INFO
    where EMAIL = ${email}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }

      console.log(result)
      done(null, result.recordset[0])
    })
  })
}