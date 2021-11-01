const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')

router.delete('/:POSITION_ID', (req, res) => {
  const {POSITION_ID} = req.params

  const request = new sql.Request(pool)

  request.query(`select * 
  from BOTFRONT_ALL_POSITION
  where POSITION_ID = ${POSITION_ID}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    result = result.recordset[0]
    if(!result){
      req.flash('error', '查無此職缺類別，請重新嘗試!')
      return res.redirect('/adminPositionInfo')
    }
    request.query(`delete
    from BOTFRONT_ALL_POSITION
    where POSITION_ID = ${POSITION_ID}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      req.flash('success_msg', '職缺類別刪除成功!!')
      res.redirect('/adminPositionInfo')
    })
  })
})

router.post('/', (req, res) => {
  const {industry_no, position_name, position_entity_name} = req.body

  if(!industry_no || !position_name || !position_entity_name){
    req.flash('error', '所有欄位都是必填的!!')
    return res.redirect('/adminPositionInfo/new')
  }

  const request = new sql.Request(pool)
  request.input('industry_no', sql.Int, industry_no)
  .input('position_name', sql.NVarChar(200), position_name)
  .input('position_entity_name', sql.NVarChar(200), position_entity_name)
  .query(`insert into BOTFRONT_ALL_POSITION (INDUSTRY_NO, POSITION_NAME, POSITION_ENTITY_NAME)
  values (@industry_no, @position_name, @position_entity_name)`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    req.flash('success_msg', '新增成功!!')
    res.redirect('/adminPositionInfo')
  })
})

router.get('/new', (req, res) => {
  const request = new sql.Request(pool)

  request.query(`select *
  from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const industryInfo = result.recordset
    res.render('new_adminPositionInfo', {industryInfo})
  })
})

router.get('/', (req, res) => {
  const request = new sql.Request(pool)
  const {industryFilter} = req.query
  // let industryInfo = []
  
  // 取得所有分類類別
  request.query(`select *
  from BOTFRONT_TYPE_OF_INDUSTRY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const industryInfo = result.recordset

    // console.log(industryFilter)

    if(!industryFilter || industryFilter == ''){
      // 如果沒有選擇分類，顯示所有結果
      request.query(`select a.POSITION_ID, a.POSITION_NAME, a.POSITION_ENTITY_NAME, b.INDUSTRY_NAME
      from BOTFRONT_ALL_POSITION a
      left join BOTFRONT_TYPE_OF_INDUSTRY b
      on a.INDUSTRY_NO = b.INDUSTRY_ID`, (err, result) => {
        if(err){
          console.log(err)
          return
        }

        const adminPositionInfo = result.recordset
        return res.render('adminPositionInfo', {adminPositionInfo, industryInfo})
      })
    }else{
      // 有選擇分類的話，顯示篩選後結果
      request.query(`select a.POSITION_ID, a.POSITION_NAME, a.POSITION_ENTITY_NAME, b.INDUSTRY_NAME
      from BOTFRONT_ALL_POSITION a
      left join BOTFRONT_TYPE_OF_INDUSTRY b
      on a.INDUSTRY_NO = b.INDUSTRY_ID
      where b.INDUSTRY_NAME = '${industryFilter}'`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        // console.log(industryInfo)
        const adminPositionInfo = result.recordset
        return res.render('adminPositionInfo', {adminPositionInfo, industryInfo, industryFilter})
      })
    }
  })
})

module.exports = router