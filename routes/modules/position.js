const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.get('/', (req, res) => {
    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        request.query('select position_name, position_des from BOTFRONT_TEST_POSITION', (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }
            
            const positionResult = result.recordset
            // console.log(positionResult[0])
            res.render('position', {positionResult})
        })
    })
})





module.exports = router
