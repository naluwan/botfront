const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.get('/', (req, res) => {
  const request = new sql.Request(pool)

  request.query(`select a.POSITION_ID, a.POSITION_NAME, a.POSITION_ENTITY_NAME, b.INDUSTRY_NAME
  from BOTFRONT_ALL_POSITION a
  left join BOTFRONT_TYPE_OF_INDUSTRY b
  on a.INDUSTRY_NO = b.INDUSTRY_ID`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminPositionInfo = result.recordset
    res.render('adminPositionInfo', {adminPositionInfo})
  })
})

module.exports = router