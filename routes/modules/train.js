const express = require('express')
const router = express.Router()
const request = require('request')
const yaml = require('js-yaml')
const fs = require('fs')

router.get('/', (req, res) => {

  const nluData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json.txt', 'utf8'))
  const configData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/config.yml', "utf8"))
  const domainData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/domain.yml', 'utf8'))

  let nlu = yaml.dump(nluData)
  let domain = yaml.dump(domainData)
  let config = yaml.dump(configData)

  // nlu = JSON.stringify(nlu)
  // domain = JSON.stringify(domainData)
  // config = JSON.stringify(configData)
  // zh = JSON.stringify(zh)
  const zh = nluData.nlu
  // config = JSON.stringify({config})
  // console.log(nluDataJson)
  // console.log(config)
  // console.log(configData2)
  let data = {
    config:{config},
    nlu: {zh},
    domain: domain,
  }

// data = JSON.stringify(data)
// console.log(data)
// console.log(data["config"]["language"])

  request({
    url: 'http://192.168.10.108:5005/model/train?save_to_default_model_directory=true&force_training=false&augmentation=50&num_threads=1',
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: data
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {

    }
  })
  // console.log(request.payload)
})


module.exports = router
