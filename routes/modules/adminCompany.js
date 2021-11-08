const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.delete('/:CPY_ID', (req, res) => {
  const {CPY_ID} = req.params
  const request = new sql.Request(pool)

  request.query(`select *
  from BOTFRONT_USERS_INFO
  where CPY_ID = ${CPY_ID}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    result = result.recordset[0]
    if(!result){
      req.flash('error', '查無此公司，請重新嘗試!!')
      return res.redirect('/adminCompany')
    }
    request.query(`delete BOTFRONT_USERS_INFO
    where CPY_ID = ${CPY_ID}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      req.flash('success_msg', '刪除成功!!')
      res.redirect('/adminCompany')
    })
  })
})

router.put('/password/:CPY_ID', (req, res) => {
  const {CPY_ID} = req.params
  const {password, confirmPassword} = req.body

  if(!password || !confirmPassword){
    req.flash('error', '所有欄位都是必填的!!')
    return res.redirect(`/adminCompany/${CPY_ID}/edit/password`)
  }

  if(password !== confirmPassword){
    req.flash('error', '密碼與確認密碼不相符!')
    return res.redirect(`/adminCompany/${CPY_ID}/edit/password`)
  }

  const request = new sql.Request(pool)

  request.query(`select CPY_ID, CPY_NAME
  from BOTFRONT_USERS_INFO
  where CPY_ID = ${CPY_ID}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompanyInfo = result.recordset[0]
    if(!adminCompanyInfo){
      req.flash('error', '查無此公司，請重新嘗試!!')
      return res.redirect('/adminCompany')
    }
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => {
        request.input('password', sql.NVarChar(100), hash)
        .query(`update BOTFRONT_USERS_INFO 
        set password = @password
        where CPY_ID = ${CPY_ID}`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
        })
      }).then(() => {
        req.flash('success_msg', '密碼修改成功!!')
        return res.redirect('/adminCompany')
      })
      .catch(err => console.log(err))
  })
})

router.get('/:CPY_ID/edit/password', (req, res) => {
  const {CPY_ID} = req.params

  const request = new sql.Request(pool)
  request.query(`select CPY_ID, CPY_NAME
  from BOTFRONT_USERS_INFO
  where CPY_ID = ${CPY_ID}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompanyInfo = result.recordset[0]
    if(!adminCompanyInfo){
      req.flash('error', '查無此公司，請重新嘗試!!')
      return res.redirect('/adminCompany')
    }
    res.render('adminPassword', {adminCompanyInfo})
  })
})

router.put('/:CPY_ID', (req, res) => {
  const {CPY_ID} = req.params
  const {cpy_no, cpy_name, email, isadmin, industry_no} = req.body

  const request = new sql.Request(pool)

  request.query(`select CPY_NAME
  from BOTFRONT_USERS_INFO 
  where CPY_ID = ${CPY_ID}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompanyInfo = result.recordset[0]
    if(!adminCompanyInfo) {
      req.flash('error', '查無此公司，請重新嘗試!!')
      return res.redirect('/adminCompany')
    }
    request.input('cpy_no', sql.Int, cpy_no)
    .input('industry_no', sql.Int, industry_no)
    .input('cpy_name', sql.NVarChar(80), cpy_name)
    .input('email', sql.NVarChar(80), email)
    .input('isadmin', sql.Bit, parseInt(isadmin))
    .query(`update BOTFRONT_USERS_INFO
    set CPY_ID = @cpy_no, INDUSTRY_NO = @industry_no, CPY_NAME = @cpy_name, EMAIL = @email, ISADMIN = @isadmin
    where CPY_ID = ${CPY_ID}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      req.flash('success_msg', '更新資料成功!!')
      res.redirect('/adminCompany')
    })
  })
})

router.get('/:CPY_ID/edit', (req, res) => {
  const {CPY_ID} = req.params
  const request = new sql.Request(pool)

  request.query(`select *
  from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const industryInfo = result.recordset

    request.query(`select a.CPY_ID, a.CPY_NAME, a.EMAIL, a.PASSWORD, a.INDUSTRY_NO, b.INDUSTRY_NAME, a.ISADMIN
    from BOTFRONT_USERS_INFO a
    left join BOTFRONT_TYPE_OF_INDUSTRY b
    on a.INDUSTRY_NO = b.INDUSTRY_ID
    where CPY_ID = ${CPY_ID}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminCompanyInfo = result.recordset[0]
      if(!adminCompanyInfo) {
        req.flash('error', '查無此公司，請重新嘗試!!')
        return res.redirect('/adminCompany')
      }
      res.render('edit_adminCompany', {adminCompanyInfo, industryInfo})
    })
  })
})

router.post('/new', isAdmin, (req, res) => {
  const {cpy_no, cpy_name, industry_no, email, isadmin, password, confirmPassword} = req.body

  const request = new sql.Request(pool)
  const errors = []
  if(!cpy_no || !cpy_name ||!industry_no || !email || !isadmin || !password || !confirmPassword){
    errors.push({message: '所有欄位都是必填的!'})
  }

  if(password !== confirmPassword){
    errors.push({message: '密碼和確認密碼不相符!'})
  }

  if(errors.length){
    request.query(`select * 
    from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const industryInfo = result.recordset
      return res.render('register', {
        industryInfo,
        errors,
        cpy_no,
        cpy_name,
        industry_no,
        email,
        isadmin,
        password,
        confirmPassword})
    })
  }else{
    
    request.query(`select * 
    from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const industryInfo = result.recordset
      request.query(`select * 
      from BOTFRONT_USERS_INFO
      where EMAIL = '${email}' or CPY_ID = ${cpy_no} or CPY_NAME = '${cpy_name}'`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const user = result.recordset[0]
        // console.log(user)
        if(user){
          if(user.EMAIL == email){
            errors.push({message: `此 Email 已經註冊過了!!`})
            return res.render('register', {
            errors,
            cpy_no,
            cpy_name,
            industry_no,
            email,
            isadmin,
            password,
            confirmPassword,
            industryInfo
            })
          }

          if(user.CPY_ID == cpy_no){
            errors.push({message: `此 公司代號 已經註冊過了!!`})
            return res.render('register', {
            errors,
            cpy_no,
            cpy_name,
            industry_no,
            email,
            isadmin,
            password,
            confirmPassword,
            industryInfo
            })
          }

          if(user.CPY_NAME == cpy_name){
            errors.push({message: `此 公司名稱 已經註冊過了!!`})
            return res.render('register', {
            errors,
            cpy_no,
            cpy_name,
            industry_no,
            email,
            isadmin,
            password,
            confirmPassword,
            industryInfo
            })
          }
          
        }else{
          return bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(password, salt))
          .then(hash => {
            request.input('cpy_no', sql.Int, parseInt(cpy_no))
            .input('cpy_name', sql.NVarChar(80), cpy_name)
            .input('industry_no', sql.Int, parseInt(industry_no))
            .input('email', sql.NVarChar(80), email)
            .input('isadmin', sql.Bit, parseInt(isadmin))
            .input('password', sql.NVarChar(100), hash)
            .query(`insert into BOTFRONT_USERS_INFO (CPY_ID, CPY_NAME, EMAIL, PASSWORD, INDUSTRY_NO, ISADMIN)
            values (@cpy_no, @cpy_name, @email, @password, @industry_no, @isadmin)`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            // console.log(result)
            })
          }).then(() => {
            req.flash('success_msg', '新增成功!!')
            return res.redirect('/adminCompany')
          })
          .catch(err => console.log(err))
        }
      })
    })
  }
})

router.get('/new', isAdmin, (req, res) => {
  const request = new sql.Request(pool)

  request.query(`select * 
  from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const industryInfo = result.recordset
    res.render('register', {industryInfo})
  })
})

router.get('/', (req, res) => {
  const request = new sql.Request(pool)

  request.query(`select a.CPY_ID, a.CPY_NAME, a.EMAIL, a.PASSWORD, a.INDUSTRY_NO, b.INDUSTRY_NAME, a.ISADMIN
  from BOTFRONT_USERS_INFO a
  left join BOTFRONT_TYPE_OF_INDUSTRY b
  on a.INDUSTRY_NO = b.INDUSTRY_ID`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompanyInfo = result.recordset
    res.render('adminCompany', {adminCompanyInfo})
  })
})

module.exports = router