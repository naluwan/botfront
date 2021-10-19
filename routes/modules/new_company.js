const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.get('/:info_no/edit', (req, res) => {
    const {info_no} = req.params
    const cpyNo = res.locals.cpyNo

    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        const errors = []
        
        request.query(`select CPYID, a.INFO_NO, INFO_NAME, INFO_DES 
        from BOTFRONT_TEST_COMPANY_INFO a 
        left join BOTFRONT_ALL_COMPANY_INFO b 
        on a.INFO_NO = b.INFO_NO 
        where a.INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            const info = result.recordset[0]
            if(!info) errors.push({message: '查無此資訊內容!'})
            if(errors.length){
                request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
                from BOTFRONT_TEST_COMPANY_INFO a 
                left join BOTFRONT_ALL_COMPANY_INFO b 
                on a.INFO_NO = b.INFO_NO 
                where CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
        
                    const companyInfo = result.recordset
                    sql.close()
                    return res.render('company', {companyInfo, errors})
                })
            }else{
                sql.close()
                // console.log(info)
                res.render('edit_company', {info})
            }
        })
    })
})

router.put('/:info_no', (req, res) => {
    const {info_no} = req.params
    const {INFO_NO, INFO_DES} = req.body
    const cpyNo = res.locals.cpyNo

    sql.connect(db, (err) => {
        if(err) console.log(err)
        
        const request = new sql.Request()
        const errors = []
        request.query(`select CPYID, a.INFO_NO, INFO_NAME, INFO_DES 
        from BOTFRONT_TEST_COMPANY_INFO a
        left join BOTFRONT_ALL_COMPANY_INFO b
        on a.INFO_NO = b.INFO_NO
        where a.INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            const checkInfo = result.recordset[0]
            if(!checkInfo) errors.push({message: '查無此公司資訊，請重新編輯!'})
            if(errors.length){
                request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
                from BOTFRONT_TEST_COMPANY_INFO a 
                left join BOTFRONT_ALL_COMPANY_INFO b 
                on a.INFO_NO = b.INFO_NO 
                where CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }

                    const companyInfo = result.recordset
                    sql.close()
                    return res.render('company', {companyInfo, errors})
                })
            }else{
                request.input('des', sql.NVarChar(2000), INFO_DES)
                .query(`update BOTFRONT_TEST_COMPANY_INFO
                set INFO_DES = @des
                where INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
                    res.redirect('/company')
                })
            }
        })
    })
})

router.post('/', (req, res) => {
    const cpyNo = res.locals.cpyNo
    const {category, des} = req.body
    const categorySelected = category
    // console.log(req.body)
    sql.connect(db, (err) => {
        if(err) console.log(err)
        
        const request = new sql.Request()
        const errors = []

        if(!category || category == '' || !des){
            errors.push({message: '所有欄位都是必填的!'})
        }

        if(errors.length){
            request.query(`select INFO_NO, INFO_NAME 
            from BOTFRONT_ALL_COMPANY_INFO a 
            where not exists (select * 
                from BOTFRONT_TEST_COMPANY_INFO b 
                where b.INFO_NO = a.INFO_NO and CPYID = ${cpyNo})`, (err, result) => {
                if(err){
                    sql.close()
                    console.log(err)
                    return res.send(err)
                }
    
                const category = result.recordset
                sql.close()
                return res.render('new_company', {errors, des, category})
            })
        }
        request.input('cpyNo', sql.Int, cpyNo)
        .input('info_no', sql.Int, category)
        .input('des', sql.NVarChar(2000), des)
        .query(`insert into BOTFRONT_TEST_COMPANY_INFO (CPYID, INFO_NO, INFO_DES) 
        values (@cpyNo, @info_no, @des)`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            sql.close()
            return res.redirect('/company')
        })
    })
})                              

router.get('/new', (req, res) => {
    const cpyNo = res.locals.cpyNo
    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        // 抓取未新增過的公司資料
        request.query(`select INFO_NO, INFO_NAME 
        from BOTFRONT_ALL_COMPANY_INFO a 
        where not exists (select * 
            from BOTFRONT_TEST_COMPANY_INFO b 
            where b.INFO_NO = a.INFO_NO and CPYID = ${cpyNo})`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            const category = result.recordset
            sql.close()
            return res.render('new_company', {category})
        })
    })
})

router.delete('/:info_no', (req, res) => {
    const {info_no} = req.params
    const {cpyNo} = res.locals
    
    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        const errors = []
        // 檢查info_no是否有在table中
        request.query(`select * 
        from BOTFRONT_TEST_COMPANY_INFO 
        where INFO_NO = ${info_no} AND CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            const companyInfo = result.recordset[0]

            if(!companyInfo) errors.push({message: '查無此資訊，請重新操作!'})
            if(errors.length) {
                request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
                from BOTFRONT_TEST_COMPANY_INFO a 
                left join BOTFRONT_ALL_COMPANY_INFO b 
                on a.INFO_NO = b.INFO_NO 
                where CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
        
                    const companyInfo = result.recordset
                    sql.close()
                    return res.render('company', {companyInfo, errors})
                })
            }else{
                request.query(`delete 
                from BOTFRONT_TEST_COMPANY_INFO 
                where INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
                    if(err){
                        sql.close()
                        console.log(err)
                        return res.send(err)
                    }
                    sql.close()
                    res.redirect('/company')
                })
            }
        })
    })
})

router.get('/', (req, res) => {
    const cpyNo = res.locals.cpyNo
    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
        from BOTFRONT_TEST_COMPANY_INFO a 
        left join BOTFRONT_ALL_COMPANY_INFO b 
        on a.INFO_NO = b.INFO_NO 
        where CPYID = ${cpyNo}`, (err, result) => {
            if(err){
                sql.close()
                console.log(err)
                return res.send(err)
            }

            const companyInfo = result.recordset
            sql.close()
            return res.render('company', {companyInfo})
        })
    })
})

module.exports = router