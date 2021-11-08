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
      user:'harrychien',
      pass:'Qwedcxzas5438'
  }
});

// 使用者帳號
router.post('/api/v1/user', (req, res) => {
  // 需要的參數
  const { cpy_id, cpy_name, email, password, token} = req.body
  // 連接資料庫
  const request = new sql.Request(pool)
  // 將token放在req.body中，送過來做驗證
  if(token == 'interInfo_botfront'){
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
        // 使用bcrypt加密密碼再存進資料庫
        bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => {
          // 新增進資料庫
          request.input('cpy_id', sql.Int, parseInt(cpy_id))
          .input('cpy_name', sql.NVarChar(80), cpy_name)
          .input('email', sql.NVarChar(80), email)
          .input('password', sql.NVarChar(100), hash)
          .query(`insert into BOTFRONT_USERS_INFO (CPY_ID, CPY_NAME, EMAIL, PASSWORD)
          values (@cpy_id, @cpy_name, @email, @password)`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
          })
        }).then(() => {
          // 使用者資料新增進資料庫後，套用mail template發送mail通知admin設定產業類別
          res.render('mail_newUser', {layout: null, cpy_name, email}, 
            function(err, html){
              if (err) {
                console.log('error in email template');
              }
              // console.log(html)
              transporter.sendMail({
                from: '"BOTFRONT" <harrychien@interinfo.com.tw>',
                to: 'harrychien@interinfo.com.tw',
                subject: '有新使用者加入',
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
          // res.render('mail_newUser', {cpy_name, email})
          // 成功後給予回覆
          return res.status(200).send('帳號寫入成功!!')
        })
      }
    })
  }else{
    // 如果沒有token或token錯誤，就返回無權限
    return res.status(400).send('你沒有權限!!')
  }
})

router.post('/api/v1/allposition', (req, res) => {

})

module.exports = router