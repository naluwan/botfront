const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')

router.get('/function/filter', (req, res) => {
  const {category, search} = req.query
  const request = new sql.Request(pool)
  const warning = []

  if(search & !category){
    warning.push({message: '請先選擇類別再進行查詢!!'})
    return res.render('cs_function', {search, warning})
  }
  
  request.query(`select *
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    if(!search){
      request.query(`select * 
      from BF_CS_FUNCTION
      where CATEGORY_ID = ${category}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const functionInfo = result.recordset
        if(functionInfo.length == 0) warning.push({message: '查無此類別資料，請先拉至下方新增功能!!'})
        return res.render('cs_function', {categoryInfo, functionInfo, category, warning})
      })
    }else{
      request.query(`select * 
      from BF_CS_FUNCTION
      where CATEGORY_ID = ${category}
      and FUNCTION_NAME like '%${search}%'`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const functionInfo = result.recordset
        if(functionInfo.length == 0) warning.push({message: '查無此類別資料，請重新嘗試!!'})
        return res.render('cs_function', {categoryInfo, functionInfo, category, warning})
      })
    }
  })
})

router.get('/function', (req, res) => {
  const request = new sql.Request(pool)
  const warning = []
  
  request.query(`select *
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    if(categoryInfo.length == 0){
      warning.push({message: '查無類別資料，請先新增類別!!'})
      return res.render('cs_function', {warning})
    }else{
      warning.push({message: '請先選擇類別!!'})
      return res.render('cs_function', {categoryInfo, warning})
    } 
  })
})

module.exports = router