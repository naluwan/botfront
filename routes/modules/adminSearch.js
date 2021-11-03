const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')

router.get('/', (req, res) => {
  const {companyFilter, tableFilter, search} = req.query

  const request = new sql.Request(pool)
  const warning = []
  if(search && (!companyFilter || !tableFilter)){
    req.flash('warning_msg', '請先選擇公司及分類再進行查詢!!')
    return res.redirect('/adminSearch')
  }

  // 獲取所有公司資料 => 選取公司的下拉選單
  request.query(`select * 
  from BOTFRONT_USERS_INFO`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompany = result.recordset
    if(!adminCompany){
      req.flash('error', '還未新增公司，請先註冊公司帳號!!')
      return res.redirect('/')
    }
    if(!companyFilter || !tableFilter){
      warning.push({message: '公司及類別都是必選欄位!!'})
      return res.render('adminSearch', {adminCompany, companyFilter, tableFilter, warning})
    }

    // 判斷無輸入search
    if(!search){
      // 因為公司資訊的類別資料庫名稱和其他幾個不同，所以需要額外處理
      // 其他類別資料庫名稱為BOTFRONT_ALL_xxxx，公司資訊類別資料庫名稱為BOTFRONT_ALL_COMPANY_INFO
      if(tableFilter == 'COMPANY'){
        // 類別選擇「是」公司資訊
        request.query(`select a.CPY_NO, a.INFO_NO as adminSearch_no, a.INFO_DES as adminSearch_des, b.INFO_NAME as adminSearch_name
        from BOTFRONT_COMPANY_INFO a
        left join BOTFRONT_ALL_COMPANY_INFO b
        on a.INFO_NO = b.INFO_ID
        left join BOTFRONT_USERS_INFO c
        on a.CPY_NO = c.CPY_ID
        where c.CPY_NAME = '${companyFilter}'`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const adminSearchInfo = result.recordset
          // console.log(adminSearchInfo)
          if(adminSearchInfo.length == 0){
            warning.push({message: '未查詢到此回覆資訊，請重新查詢!'})
            return res.render('adminSearch', { adminCompany, companyFilter, tableFilter, search, warning})
          }
          return res.render('adminSearch', {adminSearchInfo, adminCompany, companyFilter, tableFilter, search})
        })
      }else{
        // 類別選擇「不是」公司資訊
        request.query(`select a.CPY_NO, a.${tableFilter}_NO as adminSearch_no, a.${tableFilter}_DES as adminSearch_des, b.${tableFilter}_NAME as adminSearch_name
        from BOTFRONT_${tableFilter}_INFO a
        left join BOTFRONT_ALL_${tableFilter} b
        on a.${tableFilter}_NO = b.${tableFilter}_ID
        left join BOTFRONT_USERS_INFO c
        on a.CPY_NO = c.CPY_ID
        where c.CPY_NAME = '${companyFilter}'`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const adminSearchInfo = result.recordset
          // console.log(adminSearchInfo)
          if(adminSearchInfo.length == 0){
            warning.push({message: '未查詢到此回覆資訊，請重新查詢!'})
            return res.render('adminSearch', { adminCompany, companyFilter, tableFilter, search, warning})
          }
          return res.render('adminSearch', {adminSearchInfo, adminCompany, companyFilter, tableFilter, search})
        })
      }
    }else{// 判斷有輸入search
      
      if(tableFilter == 'COMPANY'){
        // 類別選擇「是」公司資訊
        request.query(`select a.CPY_NO, a.INFO_NO as adminSearch_no, a.INFO_DES as adminSearch_des, b.INFO_NAME as adminSearch_name
        from BOTFRONT_COMPANY_INFO a
        left join BOTFRONT_ALL_COMPANY_INFO b
        on a.INFO_NO = b.INFO_ID
        left join BOTFRONT_USERS_INFO c
        on a.CPY_NO = c.CPY_ID
        where c.CPY_NAME = '${companyFilter}' and b.INFO_NAME like '%${search}%'`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const adminSearchInfo = result.recordset
          // console.log(adminSearchInfo)
          if(adminSearchInfo.length == 0){
            warning.push({message: '未查詢到此回覆資訊，請重新查詢!'})
            return res.render('adminSearch', { adminCompany, companyFilter, tableFilter, search, warning})
          }
          res.render('adminSearch', {adminSearchInfo, adminCompany, companyFilter, tableFilter, search})
        })
      }else{
        // 類別選擇「不是」公司資訊
        request.query(`select a.CPY_NO, a.${tableFilter}_NO as adminSearch_no, a.${tableFilter}_DES as adminSearch_des, b.${tableFilter}_NAME as adminSearch_name
        from BOTFRONT_${tableFilter}_INFO a
        left join BOTFRONT_ALL_${tableFilter} b
        on a.${tableFilter}_NO = b.${tableFilter}_ID
        left join BOTFRONT_USERS_INFO c
        on a.CPY_NO = c.CPY_ID
        where c.CPY_NAME = '${companyFilter}' and b.${tableFilter}_NAME like '%${search}%'`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const adminSearchInfo = result.recordset
          // console.log(adminSearchInfo)
          if(adminSearchInfo.length == 0){
            warning.push({message: '未查詢到此回覆資訊，請重新查詢!'})
            return res.render('adminSearch', { adminCompany, companyFilter, tableFilter, search, warning})
          }
          res.render('adminSearch', {adminSearchInfo, adminCompany, companyFilter, tableFilter, search})
        })
      }
    }
  })
})

module.exports = router