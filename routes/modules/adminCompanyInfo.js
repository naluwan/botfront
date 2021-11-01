const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const request = new sql.Request(pool)

router.get('/', (req, res) => {
  const warning = []
  request.query(`select *
  from BOTFRONT_ALL_COMPANY_INFO`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompanyInfo = result.recordset
    if(!adminCompanyInfo) warning.push({message: '查無公司資訊，請拉到下方新增公司資訊類別!'})
    res.render('adminCompanyInfo', {adminCompanyInfo, warning})
  })
})

module.exports = router