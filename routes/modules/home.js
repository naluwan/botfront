const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
