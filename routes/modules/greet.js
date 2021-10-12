const express = require('express')
const router = express.Router()

const db = require('../../config/db')
const sql = require('mssql')

router.post('/', (req, res) => {
    const { page_greet, event_greet, greet, thanks, goodbye, chitchatting} = req.body

    sql.connect(db, (err) => {
        if(err) console.log(err)
    
    const request = new sql.Request()
    request.input('page_greet', sql.NVarChar(200), page_greet)
    .input('event_greet', sql.NVarChar(200), event_greet)
    .input('greet', sql.NVarChar(200), greet)
    .input('thanks', sql.NVarChar(200), thanks)
    .input('goodbye', sql.NVarChar(200), goodbye)
    .input('chitchatting', sql.NVarChar(200), chitchatting)
    .query('insert into BOTFRONT_TEST_GREET (PAGE_GREET, EVENT_GREET, GREET, THANKS, GOODBYE, CHITCHATTING) values (@page_greet, @event_greet, @greet, @thanks, @goodbye, @chitchatting)', (err, result) => {
    if(err){
        console.log(err)
        res.send(err)
    }
    sql.close()
    res.redirect('/')
        })
    })
})

router.get('/add', (req, res) => {
    res.render('add_greet')
})

module.exports = router
