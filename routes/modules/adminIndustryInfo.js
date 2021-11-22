const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')


router.get('/', (req, res) => {
  const request = new sql.Request(pool)
  request.query(`select *
  from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminIndustryInfo = result.recordset
    if(adminIndustryInfo.length == 0){
      req.flash('warning_msg', '查無產業類別，請先拉到下方點選按鈕新增產業類別!!')
      return res.redirect('/adminIndustryInfo')
    }else{
      return res.render('adminIndustryInfo', {adminIndustryInfo})
    }
  })
})

module.exports = router