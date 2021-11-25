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

// 查詢類別下的功能 API
router.get('/api/v1/function/:category_id', (req, res) => {
  const {category_id} = req.params
  const request = new sql.Request(pool)

  request.query(`select *
  from BF_CS_FUNCTION
  where CATEGORY_ID = ${category_id}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    return res.send(result)
  })
})

router.get('/question/filter', (req, res) => {
  const {categorySelect, functionSelect, search} = req.query
  const request = new sql.Request(pool)
  const warning = []
  // console.log(functionSelect)
  if(search && (!categorySelect || !functionSelect)){
    warning.push({message: '請先選取類別和功能再進行查詢!!'})
    return res.render('cs_question', {search})
  }

  request.query(`select * 
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    request.query(`select * 
    from BF_CS_FUNCTION
    where CATEGORY_ID = ${categorySelect}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const functionInfo = result.recordset
      if(!search){
        request.query(`select * 
        from BF_CS_QUESTION
        where FUNCTION_ID = ${functionSelect}`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const questionInfo = result.recordset
          if(questionInfo.length == 0) warning.push({message: '查無此功能的問答，請先新增問答!!'})
          return res.render('cs_question', {categoryInfo, functionInfo, questionInfo, categorySelect, functionSelect, warning})
        })
      }else{
        request.query(`select *
        from BF_CS_QUESTION
        where FUNCTION_ID = ${functionSelect}
        and DESCRIPTION like '%${search}%'`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const questionInfo = result.recordset
          if(questionInfo.length == 0) warning.push({message: '查無此問答，請重新嘗試!!'})
          return res.render('cs_question', {categoryInfo, functionInfo, questionInfo, categorySelect, functionSelect, warning, search})
        })
      }
    })
  })
})



router.get('/question', (req, res) => {
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
      warning.push({message: '請先選擇類別和功能!!'})
      return res.render('cs_question', {categoryInfo, warning})
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