const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.get('/edit', (req, res) => {
    sql.connect(db, (err) => {
        if(err) console.log(err)
    
        const request = new sql.Request()
        request.query(`select * from BOTFRONT_TEST_GREET`, (err, result) => {
          if(err){
            console.log(err)
            res.send(err)
          }
    
          // console.log(result.recordsets[0][0].NAME)
    
          const keyname = Object.keys(result.recordsets[0][0])
          const [ greet_id, page_greet, event_greet, greet, thanks, goodbye, chitchatting ] = keyname
        //   console.log(result.recordsets[0][0])
          sql.close()
          res.render('edit_greet', {result: result.recordsets[0][0],
            keys:{ page_greet, event_greet, greet, thanks, goodbye, chitchatting }})
        })
      })
      sql.on('error', () => {
        console.log(err)
      })
})

router.get('/:keys/edit', (req, res) => {
    const {keys} = req.params
  
    // console.log(keys)
    sql.connect(db, (err) => {
      if(err) console.log(err)
  
      const request = new sql.Request()
      request.query(`select column_name from INFORMATION_SCHEMA.COLUMNS where table_name='BOTFRONT_TEST_GREET'`, (err, result) => {
        if(err){
          console.log(err)
          res.send(err)
        }
        // console.log(result.recordset)
        const isColumn = result.recordset.find(item => item.column_name === keys)
        if(!isColumn){
          sql.close()
          return res.send('Column error!!')
        }
      })
  
      const companyInfo = [{ PAGE_GREET: "頁面通知" }, { EVENT_GREET: "事件問候" }, { GREET: "一般問候" }, { THANKS: "表達謝意" }, 
      { GOODBYE: "互相道別" }, { CHITCHATTING: "聊天閒聊" }]
  
    let keyZh = companyInfo.map(obj => {
      if(Object.keys(obj)[0] === keys){
        return Object.values(obj)
      }
    })
    keyZh = keyZh.filter(info => info != undefined)
    // console.log(keyZh[0][0])
  
      request.query(`select ${keys} from BOTFRONT_TEST_GREET`, (err, result) => {
        if(err){
          console.log(err)
          res.send(err)
        }
        // console.log(keys)
        value = Object.values(result.recordset[0])[0]
        sql.close()
        res.render('edit_page_greet', {result: value, keyZh, keys})
      })
    })
  })

router.post('/', (req, res) => {
    const { page_greet, event_greet, greet, thanks, goodbye, chitchatting } = req.body

    sql.connect(db, (err) => {
        if(err) console.log(err)
    
    const request = new sql.Request()
    request.input('page_greet', sql.NVarChar(200), page_greet)
    .input('event_greet', sql.NVarChar(200), event_greet)
    .input('greet', sql.NVarChar(200), greet)
    .input('thanks', sql.NVarChar(200), thanks)
    .input('goodbye', sql.NVarChar(200), goodbye)
    .input('chitchatting', sql.NVarChar(200), chitchatting)
    .query('insert into BOTFRONT_TEST_GREET (PAGE_GREET, EVENT_GREET, GREET, THANKS, GOODBYE, CHITCHATTING) values (@page_greet, @event_greet, @greet, @thanks, @goodbye, @chitchatting)', (err, result) => {
    if(err){
        console.log(err)
        res.send(err)
    }
    sql.close()
    res.redirect('/')
        })
    })
})

router.get('/add', (req, res) => {
    sql.connect(db, (err) => {
        if(err) console.log(err)
    
        const request = new sql.Request()
        request.query(`select * from BOTFRONT_TEST_GREET`, (err, result) => {
          if(err){
            console.log(err)
            res.send(err)
          }
          // if(result.recordsets[0][0]){
          // console.log(result.recordsets[0][0])
          // }else{
          //   console.log('test')
          // }
          sql.close()
          res.render('add_greet', {result: result.recordsets[0][0]})
        })
      })
      sql.on('error', () => {
        console.log(err)
      })
  })
 

module.exports = router
