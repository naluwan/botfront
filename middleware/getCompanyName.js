exports.flashMessage = function (req, res, next) {
	const sql = require('mssql')
	const pool = require('../config/connectPool')

	const request = new sql.Request(pool)
	request.query(`select CPY_NAME from BOTFRONT_COMPANY where CPY_NO=${res.locals.cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}
		// console.log(result.recordset[0])
		// 檢查資料庫是否有值
		if(!result.recordset[0]) {
		res.locals.companyName = ''
		return next()
		}
		result = result.recordset[0].CPY_NAME
		// console.log(result)
		res.locals.companyName = result
		next();
	})
}