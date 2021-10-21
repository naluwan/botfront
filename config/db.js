const db = {
  user: "sa",
  password: "12345",
  server: "192.168.1.72",
  database: "hrm8_jordan",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

module.exports = db
