const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.get('/', (req, res) => {
    const cpyNo = res.locals.cpyNo
    sql.connect(db, (err) => {
        if(err) console.log(err)

        const request = new sql.Request()
        request.query(`select a.INFO_NO, INFO_NAME, INFO_DES from BOTFRONT_TEST_COMPANY_INFO a left join BOTFRONT_ALL_COMPANY_INFO b on a.INFO_NO = b.INFO_NO where CPYID = ${cpyNo}`, (err, result) => {
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