const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.put('/:position_id', (req, res) => {
    const { position_id } = req.params
    const { POSITION_NAME, POSITION_DES } = req.body
    const cpyNo = res.locals.cpyNo

    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        const errors = []

        request.query(`select * 
        from BOTFRONT_TEST_POSITION 
        where POSITION_ID = ${position_id} and CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
            }
            
            result = result.recordset[0]
            if(!result) errors.push({message: '職缺錯誤，請重新操作!'})
            if(errors.length){
                return res.render('edit_position', {errors, result: {POSITION_NAME, POSITION_DES}})
            }else{
                request.input('name', sql.NVarChar(40), name)
                .input('des', sql.NVarChar(1000), des)
                .query(`update BOTFRONT_TEST_POSITION 
                set POSITION_NAME = @name, POSITION_DES = @des 
                where POSITION_ID = ${position_id} and CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
                    sql.close()
                    return res.redirect('/position')
                })
            }
        })
    })
})

router.get('/:position_id/edit', (req, res) => {
    const {position_id} = req.params
    const cpyNo = res.locals.cpyNo

    sql.connect(db, (err) => {
        if(err) console.log(err)
        
        const request = new sql.Request()
        const errors = []

        request.query(`select * 
        from BOTFRONT_TEST_POSITION 
        where POSITION_ID = ${position_id} and CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            result = result.recordset[0]
            // console.log(result)

            if(!result) errors.push({message:'查無此職缺資料!'})
            if(errors.length){
                request.query(`select * 
                from BOTFRONT_TEST_POSITION 
                where CPYID=${res.locals.cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
                    
                    const positionResult = result.recordset
                    // console.log(positionResult)
                    sql.close()
                    return res.render('position', {positionResult, errors})
                })
            }else{
                return res.render('edit_position', {result})
            }
        })
    })
})

router.delete('/:position_id', (req, res) => {
    const {position_id} = req.params
    const cpyNo = res.locals.cpyNo

    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        const errors = []

        request.query(`select * 
        from BOTFRONT_TEST_POSITION 
        where POSITION_ID = ${position_id} and CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }
            result = result.recordset[0]
            // console.log(result)
            if(!result) errors.push({message: '查無此職缺資訊!'})
                
            if(errors.length){
                request.query(`select * 
                from BOTFRONT_TEST_POSITION 
                where CPYID=${res.locals.cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
                    
                    const positionResult = result.recordset
                    // console.log(positionResult)
                    sql.close()
                    return res.render('position', {positionResult, errors})
                })
            }else{
                request.query(`delete 
                from BOTFRONT_TEST_POSITION 
                where POSITION_ID = ${position_id} and CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
                    sql.close()
                    return res.redirect('/position')
                })
            }
        })
    })
})

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
        .query(`insert into BOTFRONT_TEST_POSITION (POSITION_NAME, POSITION_DES, CPYID) 
        values (@name, @des, @cpyNo)`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
              }
              sql.close()
              return res.redirect('/position')
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
        request.query(`select * 
        from BOTFRONT_TEST_POSITION 
        where CPYID=${res.locals.cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }
            
            const positionResult = result.recordset
            // console.log(positionResult)
            sql.close()
            return res.render('position', {positionResult})
        })
    })
})

module.exports = router
