const express = require('express')
const router = express.Router()

const sql = require('mssql')
const pool = require('../../config/connectPool')

router.get('/:info_no/edit', (req, res) => {
	const {info_no} = req.params
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	const errors = []

	request.query(`select CPYID, a.INFO_NO, INFO_NAME, INFO_DES 
	from BOTFRONT_COMPANY_INFO a 
	left join BOTFRONT_ALL_COMPANY_INFO b 
	on a.INFO_NO = b.INFO_NO 
	where a.INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const info = result.recordset[0]
		if(!info) errors.push({message: '查無此資訊內容!'})
		if(errors.length){
			request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
			from BOTFRONT_COMPANY_INFO a 
			left join BOTFRONT_ALL_COMPANY_INFO b 
			on a.INFO_NO = b.INFO_NO 
			where CPYID = ${cpyNo}`, (err, result) => {
				if(err){
				console.log(err)
				return
				}

				const companyInfo = result.recordset
				return res.render('company', {companyInfo, errors})
			})
		} else {
			res.render('edit_company', {info})
		}
	})
})

router.put('/:info_no', (req, res) => {
	const {info_no} = req.params
	const {INFO_DES} = req.body
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	const errors = []
	request.query(`select CPYID, a.INFO_NO, INFO_NAME, INFO_DES 
	from BOTFRONT_COMPANY_INFO a
	left join BOTFRONT_ALL_COMPANY_INFO b
	on a.INFO_NO = b.INFO_NO
	where a.INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
		if(err){
			console.log(err)
			return
		}

		const checkInfo = result.recordset[0]
		if(!checkInfo) errors.push({message: '查無此公司資訊，請重新編輯!'})
		if(errors.length){
			request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
			from BOTFRONT_COMPANY_INFO a 
			left join BOTFRONT_ALL_COMPANY_INFO b 
			on a.INFO_NO = b.INFO_NO 
			where CPYID = ${cpyNo}`, (err, result) => {
				if(err){
					console.log(err)
					return
				}
				const companyInfo = result.recordset
				return res.render('company', {companyInfo, errors})
			})
		} else {
			request.input('des', sql.NVarChar(2000), INFO_DES)
			.query(`update BOTFRONT_COMPANY_INFO
			set INFO_DES = @des
			where INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
				if(err){
					console.log(err)
					return
				}
				res.redirect('/company')
			})
		}
	})
})

router.post('/', (req, res) => {
	const cpyNo = res.locals.cpyNo
	const {category, des} = req.body
	// const categorySelected = category
	// console.log(req.body)

	const request = new sql.Request(pool)
	const errors = []

	if(!category || category == '' || !des){
	errors.push({message: '所有欄位都是必填的!'})
	}

	if(errors.length){
		request.query(`select INFO_NO, INFO_NAME 
		from BOTFRONT_ALL_COMPANY_INFO a 
		where not exists (select * 
		from BOTFRONT_COMPANY_INFO b 
		where b.INFO_NO = a.INFO_NO and CPYID = ${cpyNo})`, (err, result) => {
			if(err){
				console.log(err)
				return
			}

			const category = result.recordset
			return res.render('new_company', {errors, des, category})
		})
	} else {
		request.input('cpyNo', sql.Int, cpyNo)
		.input('info_no', sql.Int, category)
		.input('des', sql.NVarChar(2000), des)
		.query(`insert into BOTFRONT_COMPANY_INFO (CPYID, INFO_NO, INFO_DES) 
		values (@cpyNo, @info_no, @des)`, (err, result) => {
			if(err){
				console.log(err)
				return
			}
			return res.redirect('/company')
		})
	}
})                              

router.get('/new', (req, res) => {
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	const warning = []
	// 抓取未新增過的公司資料
	request.query(`select INFO_NO, INFO_NAME 
	from BOTFRONT_ALL_COMPANY_INFO a 
	where not exists (select * 
	from BOTFRONT_COMPANY_INFO b 
	where b.INFO_NO = a.INFO_NO and CPYID = ${cpyNo})`, (err, result) => {
		if(err){
			console.log(err)
			return
		}
		const category = result.recordset
		if(category.length == 0) warning.push({message: '目前沒有可新增的公司資訊!'})
		if(warning.length){
			return res.render('new_company', {category, warning})
		} else {
			return res.render('new_company', {category})
		}
	})
})

router.delete('/:info_no', (req, res) => {
	const {info_no} = req.params
	const {cpyNo} = res.locals
	const request = new sql.Request(pool)
	const errors = []
	// 檢查info_no是否有在table中
	request.query(`select * 
	from BOTFRONT_COMPANY_INFO 
	where INFO_NO = ${info_no} AND CPYID = ${cpyNo}`, (err, result) => {
		if(err){
			console.log(err)
			return
		}

		const companyInfo = result.recordset[0]
		if(!companyInfo) errors.push({message: '查無此資訊，請重新操作!'})
		if(errors.length) {
			request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
			from BOTFRONT_COMPANY_INFO a 
			left join BOTFRONT_ALL_COMPANY_INFO b 
			on a.INFO_NO = b.INFO_NO 
			where CPYID = ${cpyNo}`, (err, result) => {
				if(err){
					console.log(err)
					return
				}

				const companyInfo = result.recordset
				return res.render('company', {companyInfo, errors})
			})
		} else {
			request.query(`delete 
			from BOTFRONT_COMPANY_INFO 
			where INFO_NO = ${info_no} and CPYID = ${cpyNo}`, (err, result) => {
				if(err){
					console.log(err)
					return
				}
				res.redirect('/company')
			})
		}
	})
})

router.get('/', (req, res) => {
	const cpyNo = res.locals.cpyNo

	const request = new sql.Request(pool)
	request.query(`select a.INFO_NO, INFO_NAME, INFO_DES 
	from BOTFRONT_COMPANY_INFO a 
	left join BOTFRONT_ALL_COMPANY_INFO b 
	on a.INFO_NO = b.INFO_NO 
	where CPYID = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const companyInfo = result.recordset
		return res.render('company', {companyInfo})
	})
})


module.exports = router