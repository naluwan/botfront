const express = require('express')
const router = express.Router()

// const train = require('./modules/train')
const greet = require('./modules/greet')
const home = require('./modules/home')
const position = require('./modules/position')
const company = require('./modules/company')
const defaultRes = require('./modules/defaultRes')
const users = require('./modules/users')

router.use('/greet', greet)
router.use('/defaultRes', defaultRes)
// router.use('/train', train)
router.use('/company', company)
router.use('/position', position)
router.use('/users', users)
router.use('/', home)

module.exports = router
