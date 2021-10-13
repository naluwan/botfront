const express = require('express')
const router = express.Router()
const app = express()
const db = require('../../config/db')
const sql = require('mssql')


router.get('/', (req, res) => {
  sql.connect(db, (err) => {
    if(err)return res.send(err)

const request = new sql.Request()

request.query('select NAME from BOTFRONT_TEST_COMPANY_INFO', (err, result) => {
    if(err){
    sql.close()
    console.log(err)
    return res.send(err)
    }
    result = result.recordset[0].NAME
    sql.close()
    // console.log(result)
    req.flash('companyName', result)
    res.redirect('/home')
    })
})
})

module.exports = router
