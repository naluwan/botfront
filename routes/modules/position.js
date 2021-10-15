const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.post('/', (req, res) => {
    const {name, des} = req.body
    const cpyNo = res.locals.cpyNo
    const errors = []

    if(!name || !des){
        errors.push({message: '所有欄位都是必填的!!'})
    }

    if(errors.length){
        return res.render('new_position', { errors, positionResult: {name, des}})
    }

    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        request.input('name', sql.NVarChar(40), name)
        .input('des', sql.NVarChar(1000), des)
        .input('cpyNo', sql.Int, cpyNo)
        .query('insert into BOTFRONT_TEST_POSITION (POSITION_NAME, POSITION_DES, CPYID) values (@name, @des, @cpyNo)', (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
              }
              sql.close()
              res.redirect('/position')
            })
        })
    })

router.get('/new', (req, res) => {
    res.render('new_position')
})

router.get('/', (req, res) => {
    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        request.query(`select position_name, position_des from BOTFRONT_TEST_POSITION where CPYID=${res.locals.cpyNo}`, (err, result) => {
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
