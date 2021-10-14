const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.get('/edit', (req, res) => {
  sql.connect(db, (err) => {
    if(err) console.log(err)

    const request = new sql.Request()
    request.query(`select * from BOTFRONT_TEST_COMPANY_INFO where CPYID=${res.locals.cpyNo}`, (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }
      // console.log(result.recordsets[0][0].NAME)

      const keyname = Object.keys(result.recordset[0])
      const [id ,name, tel, address, introduction, benefits, worktime, interview, accept] = keyname
      // console.log(name)
      sql.close()
      res.render('edit_company', {result: result.recordset[0],
        keys:{name, tel, address, introduction, benefits, worktime, interview, accept}})
    })
  })
  sql.on('error', () => {
    console.log(err)
  })
})

router.get('/:keys/edit', (req, res) => {
  const {keys} = req.params

  sql.connect(db, (err) => {
    if(err) console.log(err)

    const request = new sql.Request()
    request.query(`select column_name from INFORMATION_SCHEMA.COLUMNS where table_name='BOTFRONT_TEST_COMPANY_INFO'`, (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }
      // console.log(result.recordset)
      const isColumn = result.recordset.find(item => item.column_name === keys)
      if(!isColumn){
        sql.close()
        return res.send('Column error!!')
      }
    })

    const companyInfo = [{ NAME: "公司名稱" }, { TEL: "公司電話" }, { ADDR: "公司地址" }, { INTRODUCTION: "公司簡介" }, { BENEFITS: "公司福利" },
  { WORKTIME: "上班時間" }, { INTERVIEW: "面試資訊" }, { ACCEPT: "錄取通知" }]

  let keyZh = companyInfo.map(obj => {
    if(Object.keys(obj)[0] === keys){
      return Object.values(obj)
    }
  })
  keyZh = keyZh.filter(info => info != undefined)
  // console.log(keyZh[0][0])

    request.query(`select ${keys} from BOTFRONT_TEST_COMPANY_INFO where CPYID=${res.locals.cpyNo}`, (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }
      // console.log(keys)
      value = Object.values(result.recordset[0])[0]
      sql.close()
      res.render('edit_page_company', {result: value, keyZh, keys})
    })
  })
})

router.post('/', (req, res) => {
  // console.log(req)
  const {name, tel, address, introduction, benefits, worktime, interview, accept} = req.body

  const errors = []
  if(!name || !tel || !address || !introduction || !benefits || !worktime || !interview || !accept){
    errors.push({message: '所有欄位都是必填的!!'})
  }

  if(errors.length){
    return res.render('add_company', {
      errors,
      result: { name, tel, address, introduction, benefits, worktime, interview, accept}
    })
  }

  sql.connect(db, (err) => {
    if(err) console.log(err)

    const request = new sql.Request()
    request.input('name', sql.NVarChar(20), name)
    .input('tel', sql.NVarChar(20), tel)
    .input('address', sql.NVarChar(50), address)
    .input('introduction', sql.NVarChar(500), introduction)
    .input('benefits', sql.NVarChar(500), benefits)
    .input('worktime', sql.NVarChar(500), worktime)
    .input('interview', sql.NVarChar(500), interview)
    .input('accept', sql.NVarChar(500), accept)
    .query('insert into BOTFRONT_TEST_COMPANY_INFO (NAME, TEL, ADDR, INTRODUCTION, BENEFITS, WORKTIME, INTERVIEW, ACCEPT) values (@name, @tel, @address, @introduction, @benefits, @worktime, @interview, @accept)', (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }
      sql.close()
      res.redirect('/')
    })
  })
})

router.put('/:keys', (req, res) => {
  const {keys} = req.params
  const value = Object.values(req.body)[0]
  console.log(keys)
console.log(req.body)
  sql.connect(db, (err) => {
    if(err) console.log(err)

    const request = new sql.Request()

    request.query(`select column_name from INFORMATION_SCHEMA.COLUMNS where table_name='BOTFRONT_TEST_COMPANY_INFO'`, (err, result) => {
      if(err){
        console.log(err)
        res.send(err)
      }
      // console.log(result.recordset)
      const isColumn = result.recordset.find(item => item.column_name === keys)
      if(!isColumn){
        sql.close()
        return res.send('Column error!!')
      }
    })

    request.input(`${keys}`, sql.NVarChar(500), value)
    .query(`update BOTFRONT_TEST_COMPANY_INFO set ${keys}=@${keys} where CPYID=${res.locals.cpyNo}`, (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }
      sql.close()
      res.redirect('/company/edit')
    })
  })
})


router.get('/add', (req, res) => {
  sql.connect(db, (err) => {
    if(err) console.log(err)
    console.log(res.locals)
    const request = new sql.Request()
    request.query(`select * from BOTFRONT_TEST_COMPANY_INFO where CPYID=${res.locals.cpyNo}`, (err, result) => {
      if(err){
        sql.close()
        console.log(err)
        return res.send(err)
      }
      // if(result.recordsets[0][0]){
      // console.log(result.recordsets[0][0])
      // }else{
      //   console.log('test')
      // }
      // console.log(result.recordset[0])
      sql.close()
      res.render('add_company', {hasResult: result.recordset[0]})
    })
  })
  sql.on('error', () => {
    console.log(err)
  })
})

module.exports = router
