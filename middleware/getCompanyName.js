exports.flashMessage = function (req, res, next) {
    const db = require('../config/db')
    const sql = require('mssql')

    sql.connect(db, (err) => {
    if(err)return res.send(err)
    
    const request = new sql.Request()
    request.query(`select CPY_NAME from BOTFRONT_COMPANY where CPY_NO=${res.locals.cpyNo}`, (err, result) => {
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
        result = result.recordset[0].CPY_NAME
        sql.close()
        // console.log(result)
        res.locals.companyName = result
        next();
        })
    })
}