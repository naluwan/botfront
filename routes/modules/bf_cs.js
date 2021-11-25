const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')

// 顯示功能資料頁面
router.get('/function/filter', (req, res) => {
  const {category, search} = req.query
  const request = new sql.Request(pool)
  const warning = []

  // 沒有選擇類別就使用關鍵字的錯誤處理
  if(search & !category){
    req.flash('warning_msg', '請先選擇類別再進行查詢!!')
    return res.redirect('/bf_cs/function')
  }
  // 抓取類別資料
  request.query(`select *
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    // 沒有搜尋關鍵字
    if(!search){
      // 抓取指定類別的功能資料
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
    }else{  //有搜尋關鍵字
      // 抓取指定類別並包含搜尋關鍵字的功能資料
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

// 查詢類別下的功能資料 API
router.get('/api/v1/function/:category_id', (req, res) => {
  const {category_id} = req.params
  const request = new sql.Request(pool)

  // 抓取指定類別的功能資料
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

// 查詢問答頁面前的篩選
router.get('/question/filter', (req, res) => {
  const {categorySelect, functionSelect, search} = req.query
  const request = new sql.Request(pool)
  const warning = []
  
  // 未選擇類別和功能就搜尋的錯誤處理
  if(search && (!categorySelect || !functionSelect)){
    req.flash('warning_msg', '請先選擇類別和功能再進行查詢!!')
    return res.redirect('/bf_cs/question')
  }
  // 抓取類別資料
  request.query(`select * 
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    // 抓取指定類別的功能資料
    request.query(`select * 
    from BF_CS_FUNCTION
    where CATEGORY_ID = ${categorySelect}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const functionInfo = result.recordset
      // 如果沒有搜尋關鍵字
      if(!search){
        // 抓取指定功能的問答資料
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
      }else{  // 有搜尋關鍵字
        // 抓取指定功能包含搜尋關鍵字的問答資料
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

// 顯示問答頁面
router.get('/question', (req, res) => {
  const request = new sql.Request(pool)
  const warning = []

  // 抓取類別資料
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

// 顯示功能頁面
router.get('/function', (req, res) => {
  const request = new sql.Request(pool)
  const warning = []
  
  // 抓取類別資料
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