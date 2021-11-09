const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')

const sql = require('mssql')
const pool = require('../../config/connectPool')

// const transporter = require('../../modules/sendMail')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: "mail.interinfo.com.tw", // hostname
  secureConnection: true, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
    ciphers:'SSLv3',
    rejectUnauthorized: false
  },
  auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
  }
});

// 使用者帳號
router.post('/api/v1/user', (req, res) => {
  // 需要的參數
  const { cpy_id, cpy_name, email, password, token} = req.body
  
   // 將token放在req.body中，送過來做驗證
  if(token == process.env.API_TOKEN){

    // 驗證參數是否都有值
    if(!cpy_id || !cpy_name || !email || !password){
      return res.status(400).send('需求參數：cpy_id => 公司代號(統編), cpy_name => 公司名稱, email => 信箱(帳號), password => 密碼')
    }
    // 連接資料庫
    const request = new sql.Request(pool)
    // 驗證使用者資訊是否重複
    request.query(`select *
    from BOTFRONT_USERS_INFO
    where CPY_ID = ${cpy_id} or CPY_NAME = '${cpy_name}' or EMAIL = '${email}'`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const userCheck = result.recordset[0]
      // console.log(userCheck)
      if(userCheck){
        if(userCheck.CPY_ID == cpy_id){
          return res.status(409).send('公司代號重複!!請重新嘗試!!')
        }

        if(userCheck.CPY_NAME == cpy_name){
          return res.status(409).send('公司名稱重複!!請重新嘗試!!')
        }

        if(userCheck.EMAIL == email){
          return res.status(409).send('公司信箱重複!!請重新嘗試!!')
        }
        
      }else{
        // 利用公司名稱和公司代號創建產業類別
        request.input('industry_name', sql.NVarChar(200), cpy_name)
        .input('industry_id', sql.Int, cpy_id)
        .query(`insert into BOTFRONT_TYPE_OF_INDUSTRY(INDUSTRY_ID, INDUSTRY_NAME)
        values (@industry_id, @industry_name)`,(err, result) => {
          if(err){
            console.log(err)
            return
          }
        })
        // 使用bcrypt加密密碼再存進資料庫
        bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => {
          // 新增進資料庫
          request.query(`select INDUSTRY_ID
          from BOTFRONT_TYPE_OF_INDUSTRY
          where INDUSTRY_NAME = '${cpy_name}'`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            const industry_no = result.recordset[0].INDUSTRY_ID
            request.input('cpy_id', sql.Int, parseInt(cpy_id))
            .input('cpy_name', sql.NVarChar(80), cpy_name)
            .input('email', sql.NVarChar(80), email)
            .input('password', sql.NVarChar(100), hash)
            .input('industry_no', sql.Int, industry_no)
            .query(`insert into BOTFRONT_USERS_INFO (CPY_ID, CPY_NAME, EMAIL, PASSWORD, INDUSTRY_NO)
            values (@cpy_id, @cpy_name, @email, @password, @industry_no)`, (err, result) => {
              if(err){
                console.log(err)
                return
              }
              // 產生mail template並傳送mail，layout: null才不會有其他html，只會有template的東西
              res.render('mail_newUser', {layout: null, cpy_id, cpy_name, email}, 
                function(err, html){
                  if (err) {
                    console.log('error in email template');
                  }
                  // console.log(html)
                  transporter.sendMail({
                    from: '"BOTFRONT" <harrychien@interinfo.com.tw>',
                    to: 'harrychien@interinfo.com.tw',
                    subject: '新使用者加入',
                    html: html,
                  },
                    function(err) {
                      if (err) {
                        console.error('Unable to send confirmation: ' + err.stack);
                      }
                    },
                  )
                }
              )
              // 用response回傳狀態碼和成功資訊，另外回傳此間公司的industry_no，以便要傳入職缺類別
              return res.status(200).send({'message':'使用者資料寫入成功!!', industry_no})
            })
          })
        }).catch(err => console.log(err))
      }
    })
  }else{
    // 如果沒有token或token錯誤，就返回無權限
    return res.status(400).send('沒有足夠權限做此操作!!')
  }
})

// 新增新職缺類別
router.post('/api/v1/allPosition', (req, res) => {
  const {industry_no, position_name, position_entity_name, token} = req.body

  if(token == process.env.API_TOKEN){
    if(!industry_no || !position_name || !position_entity_name){
      return res.status(400).send(`需求參數：industry_no => 產業類別代號(傳入新使用者帳戶資料會回傳industry_no), 
      position_name => 職缺名稱, position_entity_name => 職缺英文名稱`)
    }

    const request = new sql.Request(pool)
    request.query(`select *
    from BOTFRONT_ALL_POSITION
    where POSITION_NAME = '${position_name}'`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const positionCheck = result.recordset[0]
      if(positionCheck){
        console.log(positionCheck)
      }else{
        console.log('new one!!')
      }
    })

  }else{
    // 如果沒有token或token錯誤，就返回無權限
    return res.status(400).send('沒有足夠權限做此操作!!')
  }
})

module.exports = router