const express = require('express')
const router = express.Router()

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.get('/login', (req, res) => {
  res.render('login')
})


module.exports = router