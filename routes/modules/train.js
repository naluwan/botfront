const express = require('express')
const request = require('request')
const yaml = require('js-yaml')
const fs = require('fs')
const router = express.Router()

router.get('/', (req, res) => {

  const nluData = yaml.load(fs.readFileSync('/home/bill/下載/train-data/data/nlu.yml', 'utf8'), {json: false})

  const configData = yaml.load(fs.readFileSync('/home/bill/下載/train-data/config.yml', 'utf8'), {json: false})

  const nlu = yaml.dump(nluData.nlu, {skipInvalid: true, sortKeys: true})

  const config = yaml.dump(nluData.nlu, {skipInvalid: true, sortKeys: true})

  // res.send(JSON.stringify(nluData.nlu))
  // console.log(test)
  // fs.writeFile('/home/bill/下載/train-data/data/data.txt', test, e => {
  //   console.log(e)
  //   console.log('writeFile success')
  // })

  // "language: zh\npipeline:\n  - name: SpacyNLP\n    model: zh_core_web_lg\n - name: SpacyTokenizer\n    intent_tokenization_flag: false\n   intent_split_symbol: _\n    token_pattern: None\n  - name: SpacyFeaturizer\n  - name: RegexFeaturizer\n  - name: LexicalSyntacticFeaturizer\n  - name: DucklingEntityExtractor\n    url: 'http://duckling:8000'\n    timezone: Asia/Taipei\n    locale: zh_TW\n    dimensions:\n      - date\n      - email\n  - name: CountVectorsFeaturizer\n  - name: CountVectorsFeaturizer\n    analyzer: char_wb\n    min_ngram: 1\n    max_ngram: 4\n  - name: DIETClassifier\n    epochs: 200\n    constrain_similarities: true\n    model_confidence: linear_norm\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: >-\n      rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector\n  - name: EntitySynonymMapper\n  - name: ResponseSelector\n    epochs: 100\n    constrain_similarities: true\n  - name: FallbackClassifier\n    threshold: 0.7\n    ambiguity_threshold: 0.1\n  - name: ResponseSelector\n    epochs: 100\n    retrieval_intent: faq\n  - name: ResponseSelector\n    epochs: 100\n    retrieval_intent: chitchat"


  const nluDataJson = JSON.stringify(nluData.nlu)
  const nluData2 = nluData.nlu
  data = {
    "config": configData,
    "nlu": nluData2,
    "force": true,
    "save_to_default_model_directory": true
  }
// console.log(data)
  res.send(data)
  // console.log(test)


  // r = request.post('http://192.168.10.108:5005/model/train', data)
  // console.log(r)
  // res.send(r)

  request({
    url: 'http://192.168.10.108:5005/model/train',
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: data
}, function(error, response, body) {
    if (!error && response.statusCode == 200) {
    }
});
})


module.exports = router
