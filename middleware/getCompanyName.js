exports.flashMessage = function (req, res, next) {
	const sql = require('mssql')
	const pool = require('../config/connectPool')
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	request.query(`select a.INFO_DES 
	from BOTFRONT_COMPANY_INFO a
	left join BOTFRONT_ALL_COMPANY_INFO b
	on a.INFO_NO = b.INFO_NO
	where a.CPYID = ${cpyNo} and b.INFO_NAME = '公司名稱'` , (err, result) => {
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
		result = result.recordset[0].INFO_DES
		// console.log(result)
		res.locals.companyName = result
		next();
	})
}