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
    from BOTFRONT_ALL_LEAVE`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminLeaveInfo = result.recordset
      if(!adminLeaveInfo || adminLeaveInfo == '') warning.push('查無公司假別，請拉到下方新增公司假別!!')
      res.render('adminLeaveInfo', {adminLeaveInfo, warning})
    })
  }else{
    request.query(`select *
    from BOTFRONT_ALL_LEAVE
    where LEAVE_NAME like '%${search}%'`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminLeaveInfo = result.recordset
      if(!adminLeaveInfo || adminLeaveInfo == '') warning.push({message: '還未新增過此公司假別!'})
      res.render('adminLeaveInfo', {adminLeaveInfo, warning, search})
    })
  }
  
})

module.exports = router