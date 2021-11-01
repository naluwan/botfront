const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')
const request = new sql.Request(pool)

router.post('/', (req, res) => {
  const {leave_name, leave_entity_name} = req.body
  const errors = []

  if(!leave_name || !leave_entity_name){
    errors.push({message: '所有欄位都是必填的!!'})
    return res.render('new_adminLeaveInfo', {leave_name, leave_entity_name, errors})
  }

  request.input('leave_name', sql.NVarChar(20), leave_name)
  .input('leave_entity_name', sql.NVarChar(50), leave_entity_name)
  .query(`insert into BOTFRONT_ALL_LEAVE (LEAVE_NAME, LEAVE_ENTITY_NAME)
  values (@leave_name, @leave_entity_name)`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    req.flash('success_msg', '公司假別新增成功!!')
    res.redirect('/adminLeaveInfo')
  })
})

router.get('/new', (req, res) => {
  res.render('new_adminLeaveInfo')
})

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