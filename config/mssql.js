const mssql = require('mssql')
const sqlConfig = require('./db')

const db = mssql.connect(sqlConfig)

db.on('error', () => {
  console.log('sql error!!!')
})

db.once('open', () => {
  console.log('sql connect!')
})

module.exports = db
