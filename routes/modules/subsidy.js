const express = require('express')
const router = express.Router()

const sql = require('mssql')
const pool = require('../../config/connectPool')


router.post('/', (req, res) => {
  const user = res.locals.user
	const cpyNo = user.CPY_ID
	const {category, des} = req.body

	const request = new sql.Request(pool)
	const errors = []

	if(!category || category == '' || !des){
	errors.push({message: '所有欄位都是必填的!'})
	}

	if(errors.length){
		request.query(`select SUBSIDY_ID, SUBSIDY_NAME 
    from BOTFRONT_ALL_SUBSIDY a 
    where not exists (select * 
    from BOTFRONT_SUBSIDY_INFO b 
    where  a.SUBSIDY_ID = b.SUBSIDY_NO 
    and b.CPY_NO = ${cpyNo})`, (err, result) => {
			if(err){
			console.log(err)
			return
			}

			const category = result.recordset
			return res.render('new_subsidy', {errors, des, category})
		})
	}else{
		request.input('cpyNo', sql.Int, cpyNo)
		.input('subsidy_no', sql.Int, category)
		.input('des', sql.NVarChar(2000), des)
		.query(`insert into BOTFRONT_SUBSIDY_INFO (CPY_NO, SUBSIDY_NO, SUBSIDY_DES) 
		values (@cpyNo, @SUBSIDY_no, @des)`, (err, result) => {
			if(err){
			console.log(err)
			return
			}
			return res.redirect('/subsidy')
		})
	}
})

router.get('/new', (req, res) => {
  const user = res.locals.user
	const cpyNo = user.CPY_ID

	const request = new sql.Request(pool)
	const warning = []
	// 抓取未新增過的職缺資料
	request.query(`select SUBSIDY_ID, SUBSIDY_NAME 
	from BOTFRONT_ALL_SUBSIDY a 
	where not exists (select * 
	from BOTFRONT_SUBSIDY_INFO b 
	where  a.SUBSIDY_ID = b.SUBSIDY_NO 
	and b.CPY_NO = ${cpyNo})`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const category = result.recordset
		if(category.length == 0) warning.push({message:'目前沒有可新增的職缺!'})
		if(warning.length){
			return res.render('new_subsidy', {category, warning})
		}else{
			return res.render('new_subsidy', {category})
		}
	})
})

router.get('/', (req, res) => {
  const user = res.locals.user
	const cpyNo = user.CPY_ID

  const request = new sql.Request(pool)
	const warning = []
	request.query(`select a.SUBSIDY_NO, b.SUBSIDY_NAME, a.SUBSIDY_DES
	from BOTFRONT_SUBSIDY_INFO a
	left join BOTFRONT_ALL_SUBSIDY b
	on b.SUBSIDY_ID = a.SUBSIDY_NO
	where CPY_NO = ${cpyNo}`, (err, result) => {
		if(err){
		console.log(err)
		return
		}

		const subsidyInfo = result.recordset
		// console.log(positionResult)
		if(subsidyInfo.length == 0) warning.push({message: '還未新增補助資訊，請拉到下方點選按鈕新增職缺!!'})
		return res.render('subsidy', {subsidyInfo, warning})
	})
})

module.exports = router