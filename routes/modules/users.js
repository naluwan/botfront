const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.post('/register', (req, res) => {
  const {cpy_no, industry_no, email, isadmin, password, confirmPassword} = req.body

  const errors = []
  if(!cpy_no || !industry_no || !email || !isadmin || !password || !confirmPassword){
    errors.push({message: '所有欄位都是必填的!'})
  }

  if(password !== confirmPassword){
    errors.push({message: '密碼和確認密碼不相符!'})
  }

  if(errors.length){
    return res.render('register', {
      errors,
      cpy_no,
      industry_no,
      email,
      isadmin,
      password,
      confirmPassword
    })
  }

  const request = new sql.Request(pool)
  request.query(`select * 
  from BOTFRONT_USERS_INFO
  where EMAIL = '${email}'`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const user = result.recordset[0]
    console.log(user)
    if(user){
      errors.push({message: `此 Email 已經註冊過了!!`})
      return res.render('register', {
        errors,
        cpy_no,
        industry_no,
        email,
        isadmin,
        password,
        confirmPassword
      })
    }else{
      return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => {
        request.input('cpy_no', sql.Int, parseInt(cpy_no))
      .input('industry_no', sql.Int, parseInt(industry_no))
      .input('email', sql.NVarChar(80), email)
      .input('isadmin', sql.Bit, parseInt(isadmin))
      .input('password', sql.NVarChar(100), hash)
      .query(`insert into BOTFRONT_USERS_INFO (CPY_NO, EMAIL, PASSWORD, INDUSTRY_NO, ISADMIN)
      values (@cpy_no, @email, @password, @industry_no, @isadmin)`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        console.log(result)
        })
      }).then(() => res.redirect('/users/login'))
      .catch(err => console.log(err))
    }
  })
})

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true,
}))

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/logout', (req, res) => {
  req.logOut()
  req.flash('success_msg', '你已經成功登出!')
  res.redirect('/users/login')
})


module.exports = router