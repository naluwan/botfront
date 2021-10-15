const express = require('express')
const router = express.Router()


const company = require('./modules/company')
// const train = require('./modules/train')
const greet = require('./modules/greet')
const home = require('./modules/home')
const position = require('./modules/position')

router.use('/greet', greet)
// router.use('/train', train)
router.use('/company', company)
router.use('/position', position)
router.use('/', home)

module.exports = router
