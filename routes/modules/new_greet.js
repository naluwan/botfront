const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')


router.get('/', (req, res) => {
  const cpyNo = res.locals.cpyNo
  sql.connect(db, (err) => {
    if(err) console.log(err)

    const request = new sql.Request()
    request.query(`select a.GREET_NO, b.GREET_NAME, a.GREET_DES
    from BOTFRONT_GREET_INFO a
    left join BOTFRONT_ALL_GREET b
    on a.GREET_NO = b.GREET_ID
    where a.CPYID = ${cpyNo}`, (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }

      const greetInfo = result.recordset
      sql.close()
      res.render('greet', {greetInfo})
    })
  })
})

module.exports = router