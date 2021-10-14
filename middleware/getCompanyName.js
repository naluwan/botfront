exports.flashMessage = function (req, res, next) {
    const db = require('../config/db')
    const sql = require('mssql')

    sql.connect(db, (err) => {
        if(err)return res.send(err)
    // console.log(res.locals)
    const request = new sql.Request()
    request.query(`select NAME from BOTFRONT_TEST_COMPANY_INFO where CPYID=${res.locals.cpyNo}`, (err, result) => {
        if(err){
        sql.close()
        console.log(err)
        return res.send(err)
        }
        // console.log(result.recordset[0])
        // 檢查資料庫是否有值
        if(!result.recordset[0]) {
            res.locals.companyName = ''
            return next()
        }
        result = result.recordset[0].NAME
        sql.close()
        // console.log(result)
        res.locals.companyName = result
        next();
        })
    })
}