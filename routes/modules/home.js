const { request } = require('express')
const express = require('express')
const router = express.Router()
const app = express()

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.get('/', (req, res) => {
	const isAdmin = res.locals.isAdmin
	if(isAdmin){
		const request = new sql.Request(pool)
		request.query(`select *
		from BOTFRONT_ALL_POSITION
		where TRAINED = 0 or HAD_READ = 0`, (err, result) => {
			if(err){
				console.log(err)
				return
			}
			const position = result.recordset
			const notTrained = position.filter(item => item.TRAINED == 0)
			const notRead = position.filter(item => item.HAD_READ == 0)
			return res.render('index', {notTrained: notTrained.length, notRead: notRead.length})
		})
	}else{
		res.render('index')
	}
	
})

module.exports = router