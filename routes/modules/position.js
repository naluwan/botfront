const express = require('express')
const router = express.Router()

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.put('/:position_no', (req, res) => {
	const {position_no} = req.params
	const {POSITION_DES} = req.body
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	const errors = []
	request.query(`select *
	from BOTFRONT_POSITION_INFO a
	where POSITION_NO = ${position_no} and CPYID = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const checkPosition = result.recordset[0]
		if(!checkPosition) errors.push({message: '查無此職缺資訊，請重新編輯!'})
		if(errors.length){
			request.query(`select a.POSITION_NO, b.POSITION_NAME, a.POSITION_DES
			from BOTFRONT_POSITION_INFO a
			left join BOTFRONT_ALL_POSITION b
			on b.INDUSTRY_NO = a.INDUSTRY_NO and b.POSITION_ID = a.POSITION_NO
			where CPYID = ${cpyNo}`, (err, result) => {
				if(err){
				console.log(err)
				return
				}

				const positionResult = result.recordset
				return res.render('position', {positionResult, errors})
			})
		} else {
			request.input('des', sql.NVarChar(2000), POSITION_DES)
			.query(`update BOTFRONT_POSITION_INFO
			set POSITION_DES = @des
			where POSITION_NO = ${position_no} and CPYID = ${cpyNo}`, (err, result) => {
				if(err){
				console.log(err)
				return
				}
				res.redirect('/position')
			})
		}
	})
})

router.get('/:position_id/edit', (req, res) => {
	const {position_id} = req.params
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	const errors = []

	request.query(`select POSITION_NO, b.POSITION_NAME, POSITION_DES
	from BOTFRONT_POSITION_INFO a
	left join BOTFRONT_ALL_POSITION b
	on a.POSITION_NO = b.POSITION_ID 
	where POSITION_NO = ${position_id} and CPYID = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		result = result.recordset[0]
		// console.log(result)
		if(!result) errors.push({message:'查無此職缺資料!'})
		if(errors.length){
			request.query(`select a.POSITION_NO, b.POSITION_NAME, a.POSITION_DES
			from BOTFRONT_POSITION_INFO a
			left join BOTFRONT_ALL_POSITION b
			on b.INDUSTRY_NO = a.INDUSTRY_NO and b.POSITION_ID = a.POSITION_NO
			where CPYID = ${cpyNo}`, (err, result) => {
				if(err){
				console.log(err)
				return
				}
				const positionResult = result.recordset
				// console.log(positionResult)
				return res.render('position', {positionResult, errors})
			})
		} else {
			return res.render('edit_position', {result})
		}
	})
})

router.delete('/:position_no', (req, res) => {
	const {position_no} = req.params
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	const errors = []

	request.query(`select * 
	from BOTFRONT_POSITION_INFO 
	where POSITION_NO = ${position_no} and CPYID = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}
		result = result.recordset[0]
		// console.log(result)
		if(!result) errors.push({message: '查無此職缺資訊!'})

		if(errors.length){
			request.query(`select a.POSITION_NO, b.POSITION_NAME, a.POSITION_DES
			from BOTFRONT_POSITION_INFO a
			left join BOTFRONT_ALL_POSITION b
			on b.INDUSTRY_NO = a.INDUSTRY_NO and b.POSITION_ID = a.POSITION_NO
			where CPYID = ${cpyNo}`, (err, result) => {
				if(err){
				console.log(err)
				return
				}
				const positionResult = result.recordset
				// console.log(positionResult)
				return res.render('position', {positionResult, errors})
			})
		} else {
			request.query(`delete 
			from BOTFRONT_POSITION_INFO 
			where POSITION_NO = ${position_no} and CPYID = ${cpyNo}`, (err, result) => {
				if(err){
				console.log(err)
				return
				}

				return res.redirect('/position')
			})
		}
	})
})


router.post('/', (req, res) => {
	const cpyNo = res.locals.cpyNo
	const industryNo = res.locals.industryNo
	const {category, des} = req.body
	// const categorySelected = category
	// console.log(req.body)

	const request = new sql.Request(pool)
	const errors = []

	if(!category || category == '' || !des){
	errors.push({message: '所有欄位都是必填的!'})
	}

	if(errors.length){
		request.query(`select POSITION_ID, POSITION_NAME 
		from BOTFRONT_ALL_POSITION a 
		where not exists (select * 
		from BOTFRONT_POSITION_INFO b 
		where  a.POSITION_ID = b.POSITION_NO 
		and b.CPYID = ${cpyNo}) 
		and a.INDUSTRY_NO = ${industryNo}`, (err, result) => {
			if(err){
			console.log(err)
			return
			}

			const category = result.recordset
			return res.render('new_position', {errors, des, category})
		})
	}else{
		request.input('cpyNo', sql.Int, cpyNo)
		.input('industry_no', sql.Int, industryNo)
		.input('position_no', sql.Int, category)
		.input('des', sql.NVarChar(2000), des)
		.query(`insert into BOTFRONT_POSITION_INFO (CPYID, INDUSTRY_NO, POSITION_NO, POSITION_DES) 
		values (@cpyNo, @industry_no, @position_no, @des)`, (err, result) => {
			if(err){
			console.log(err)
			return
			}
			return res.redirect('/position')
		})
	}
})

router.get('/new', (req, res) => {
	const cpyNo = res.locals.cpyNo
	const industryNo = res.locals.industryNo

	const request = new sql.Request(pool)
	const warning = []
	// 抓取未新增過的職缺資料
	request.query(`select POSITION_ID, POSITION_NAME 
	from BOTFRONT_ALL_POSITION a 
	where not exists (select * 
	from BOTFRONT_POSITION_INFO b 
	where  a.POSITION_ID = b.POSITION_NO 
	and b.CPYID = ${cpyNo}) 
	and a.INDUSTRY_NO = ${industryNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const category = result.recordset
		if(category.length == 0) warning.push({message:'目前沒有可新增的職缺!'})
		if(warning.length){
			return res.render('new_position', {category, warning})
		}else{
			return res.render('new_position', {category})
		}
	})
})

router.get('/', (req, res) => {
	const cpyNo = res.locals.cpyNo
	const industryNo = res.locals.industryNo

	const request = new sql.Request(pool)
	request.query(`select a.POSITION_NO, b.POSITION_NAME, a.POSITION_DES
	from BOTFRONT_POSITION_INFO a
	left join BOTFRONT_ALL_POSITION b
	on b.INDUSTRY_NO = a.INDUSTRY_NO and b.POSITION_ID = a.POSITION_NO
	where CPYID = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const positionResult = result.recordset
		// console.log(positionResult)
		return res.render('position', {positionResult})
	})
})

module.exports = router
