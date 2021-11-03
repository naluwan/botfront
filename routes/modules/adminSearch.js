const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')

router.put('/:cpy_no/:table/:adminSearch_no', (req, res) => {
  const {cpy_no, table, adminSearch_no} = req.params
  const {adminSearch_des} = req.body
  const success = [], warning = []

  // 重新導回原編輯頁，並顯示原資料
  if(!adminSearch_des){
    req.flash('error', '內容欄位不可空白!!')
    return res.redirect(`/adminSearch/${cpy_no}/${table}/${adminSearch_no}/edit`)
  }

  const request = new sql.Request(pool)

   // 類別選擇「是」公司資訊
  if(table == 'COMPANY'){
    // 驗證此公司是否有此筆資料
    request.query(`select * 
    from BOTFRONT_COMPANY_INFO a
    left join BOTFRONT_USERS_INFO b
    on a.CPY_NO = b.CPY_ID 
    where a.INFO_NO = ${adminSearch_no} and a.CPY_NO = ${cpy_no}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      result = result.recordset[0]
      if(!result){
        req.flash('error', '查無此筆資料，請重新嘗試!!')
        return res.redirect('/adminSearch')
      }
      
      // 更新資料
      request.input('adminSearch_des', sql.NVarChar(2000), adminSearch_des)
      .query(`update BOTFRONT_COMPANY_INFO
      set INFO_DES = @adminSearch_des
      where CPY_NO = ${cpy_no} and INFO_NO = ${adminSearch_no}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }

        // 獲取所有公司資料 => 選取公司的下拉選單
        request.query(`select *
        from BOTFRONT_USERS_INFO`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const adminCompany = result.recordset

          // 獲取公司的回覆資料
          request.query(`select a.CPY_NO, c.CPY_NAME, a.INFO_NO as adminSearch_no, a.INFO_DES as adminSearch_des, b.INFO_NAME as adminSearch_name
          from BOTFRONT_COMPANY_INFO a
          left join BOTFRONT_ALL_COMPANY_INFO b
          on a.INFO_NO = b.INFO_ID
          left join BOTFRONT_USERS_INFO c
          on a.CPY_NO = c.CPY_ID
          where c.CPY_ID = '${cpy_no}'`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            const adminSearchInfo = result.recordset
            const tableFilter = table
            const companyFilter = adminSearchInfo[0].CPY_NAME
            // console.log(adminSearchInfo)
            if(adminSearchInfo.length == 0){
              warning.push({message: '未查詢到此回覆資訊，請重新查詢!'})
              return res.render('adminSearch', { adminCompany, companyFilter, tableFilter, warning})
            }
            success.push({message: '資料更新成功!!'})
            res.render('adminSearch', {adminSearchInfo, adminCompany, companyFilter, tableFilter, success})
          })
        })
      })
    })
  }else{ // 類別選擇「不是」公司資訊
    // 驗證此公司是否有此筆資料
    request.query(`select * 
    from BOTFRONT_${table}_INFO a
    left join BOTFRONT_USERS_INFO b
    on a.CPY_NO = b.CPY_ID 
    where ${table}_NO = ${adminSearch_no} and CPY_NO = ${cpy_no}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      result = result.recordset[0]
      if(!result){
        req.flash('error', '查無此筆資料，請重新嘗試!!')
        return res.redirect('/adminSearch')
      }
      
      // 更新資料
      request.input('adminSearch_des', sql.NVarChar(2000), adminSearch_des)
      .query(`update BOTFRONT_${table}_INFO
      set ${table}_DES = @adminSearch_des
      where CPY_NO = ${cpy_no} and ${table}_NO = ${adminSearch_no}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }

        // 獲取所有公司資料 => 選取公司的下拉選單
        request.query(`select *
        from BOTFRONT_USERS_INFO`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const adminCompany = result.recordset

          // 獲取公司的回覆資料
          request.query(`select a.CPY_NO, c.CPY_NAME, a.${table}_NO as adminSearch_no, a.${table}_DES as adminSearch_des, b.${table}_NAME as adminSearch_name
          from BOTFRONT_${table}_INFO a
          left join BOTFRONT_ALL_${table} b
          on a.${table}_NO = b.${table}_ID
          left join BOTFRONT_USERS_INFO c
          on a.CPY_NO = c.CPY_ID
          where c.CPY_ID = '${cpy_no}'`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            const adminSearchInfo = result.recordset
            const tableFilter = table
            const companyFilter = adminSearchInfo[0].CPY_NAME
            // console.log(adminSearchInfo)
            if(adminSearchInfo.length == 0){
              warning.push({message: '未查詢到此回覆資訊，請重新查詢!'})
              return res.render('adminSearch', { adminCompany, companyFilter, tableFilter, warning})
            }
            success.push({message: '資料更新成功!!'})
            res.render('adminSearch', {adminSearchInfo, adminCompany, companyFilter, tableFilter, success})
          })
        })
      })
    })
  }
})

router.get('/:cpy_no/:table/:adminSearch_no/edit', (req, res) => {
  const {cpy_no, table, adminSearch_no} = req.params

  const request = new sql.Request(pool)
  const errors = []

  if(table == 'COMPANY'){
    // 類別選擇「是」公司資訊
    request.query(`select b.INFO_NAME as adminSearch_name, a.INFO_DES as adminSearch_des
    from BOTFRONT_COMPANY_INFO a
    left join BOTFRONT_ALL_COMPANY_INFO b
    on a.INFO_NO = b.INFO_ID
    where INFO_NO = ${adminSearch_no} and CPY_NO = ${cpy_no}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminSearchInfo = result.recordset[0]
      if(!adminSearchInfo){
        req.flash('error', '查無此筆資料，請重新嘗試!!')
        return res.redirect('/adminSearch')
      }
      res.render('edit_adminSearch', {adminSearchInfo, cpy_no, table, adminSearch_no})
    })
  }else{
    // 類別選擇「不是」公司資訊
    request.query(`select b.${table}_NAME as adminSearch_name, a.${table}_DES as adminSearch_des
    from BOTFRONT_${table}_INFO a
    left join BOTFRONT_ALL_${table} b
    on a.${table}_NO = b.${table}_ID
    where ${table}_NO = ${adminSearch_no} and CPY_NO = ${cpy_no}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const adminSearchInfo = result.recordset[0]
      if(!adminSearchInfo){
        req.flash('error', '查無此筆資料，請重新嘗試!!')
        return res.redirect('/adminSearch')
      }
      res.render('edit_adminSearch', {adminSearchInfo, cpy_no, table, adminSearch_no})
    })
  }
})

router.get('/filter', (req, res) => {
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

    // 如果使用者只有一間(代表只有admin帳戶)
    if(adminCompany.length <= 1){
      req.flash('error', '還未新增公司，請先註冊公司帳號!!')
      return res.redirect('/')
    }
    if(!companyFilter || !tableFilter){
      warning.push({message: '公司和類別都是必選的!!'})
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

router.get('/', (req, res) => {
  const request = new sql.Request(pool)

  // 獲取所有公司資料 => 選取公司的下拉選單
  request.query(`select * 
  from BOTFRONT_USERS_INFO`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const adminCompany = result.recordset

    // 如果使用者只有一間(代表只有admin帳戶)
    if(adminCompany.length <= 1){
      req.flash('error', '還未新增公司，請先註冊公司帳號!!')
      return res.redirect('/')
    }
    res.render('adminSearch', {adminCompany})
  })
})

module.exports = router