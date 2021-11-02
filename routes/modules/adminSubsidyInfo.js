const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')
const request = new sql.Request(pool)

router.get('/', (req, res) => {
  const {search} = req.query
  const warning = []
  if(!search){
    request.query(`select *
    from BOTFRONT_ALL_SUBSIDY`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminSubsidyInfo = result.recordset
      if(!adminSubsidyInfo || adminSubsidyInfo == '') warning.push({message: '查無公司補助類別，請拉到下方新增公司補助類別!!!'})
      res.render('adminSubsidyInfo', {adminSubsidyInfo, warning})
    })
  }else{
    request.query(`select *
    from BOTFRONT_ALL_SUBSIDY
    where SUBSIDY_NAME like '%${search}%'`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminSubsidyInfo = result.recordset
      if(!adminSubsidyInfo || adminSubsidyInfo == '') warning.push({message: '還未新增過此公司補助類別!'})
      res.render('adminSubsidyInfo', {adminSubsidyInfo, warning, search})
    })
  }
})

module.exports = router