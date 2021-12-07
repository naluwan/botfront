const express = require('express')
const router = express.Router()
const request = require('request')
const yaml = require('js-yaml')
const fs = require('fs')

router.post('/', (req, res) => {
  const nluData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json.json', 'utf8'))
  const configData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/config.yml', "utf8"))
  const domainData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/domain.yml', 'utf8'))
  const fragmentsData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/data/stories/fragments.yml', 'utf8'))
  let nlu = yaml.dump(nluData)
  let domain = yaml.dump(domainData)
  let config = yaml.dump(configData)
  let fragments = yaml.dump(fragmentsData)

  const zh = nluData
  let data = {
    "config":{config},
    "nlu": {zh},
    "domain": domain,
    "fragments": fragments,
  }

  let url = 'http://192.168.10.108:5005/model/train?save_to_default_model_directory=true&force_training=true&augmentation=50&num_threads=1'
  req.header['content-type'] =  "application/x-yaml"
  

  req.pipe(request(url)).pipe(res)
})

router.get('/trainComplate', (req, res) => {
  req.flash('success_msg', '訓練完成!!')
  return res.redirect('/')
})

router.get('/', (req, res) => {
  const nluData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json.json', 'utf8'))
  const configData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/config.yml', "utf8"))
  const domainData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/domain.yml', 'utf8'))
  const fragmentsData = yaml.load(fs.readFileSync('C:/Users/AN1100275/Desktop/training-data/data/stories/fragments.yml', 'utf8'))
  let nlu = yaml.dump(nluData)
  let domain = yaml.dump(domainData)
  let config = yaml.dump(configData)
  let fragments = yaml.dump(fragmentsData)
  // nlu = JSON.stringify(nlu)
  // domain = JSON.stringify(domainData)
  // config = JSON.stringify(configData)
  // zh = JSON.stringify(zh)
  const zh = nluData
  // config = JSON.stringify({config})
  // console.log(nluDataJson)
  // console.log(config)
  // console.log(configData2)
  let data = {
    "config":{config},
    "nlu": {zh},
    "domain": domain,
    "fragments": fragments,
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
      req.flash('success_msg', '訓練完成!!')
    }
  })
  req.flash('warning_msg', '訓練中.......')
      return res.redirect('/')
})


module.exports = router
