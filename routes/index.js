const express = require('express')
const router = express.Router()

// const train = require('./modules/train')
const greet = require('./modules/greet')
const home = require('./modules/home')
const position = require('./modules/position')
const company = require('./modules/company')
const defaultRes = require('./modules/defaultRes')
const users = require('./modules/users')
const subsidy = require('./modules/subsidy')
const {authenticator} = require('../middleware/auth')

router.use('/subsidy', authenticator, subsidy)
router.use('/greet', authenticator, greet)
router.use('/defaultRes', authenticator, defaultRes)
// router.use('/train', train)
router.use('/company', authenticator, company)
router.use('/position', authenticator, position)
router.use('/users', users)
router.use('/', authenticator, home)

module.exports = router
