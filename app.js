const express = require('express')
const session = require('express-session')
const hbs = require('express-handlebars')


const app = express()
const PORT = 3030
const routes = require('./routes')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const {flashMessage} = require('./middleware/getCompanyName')

data = {
  "config": "language: zh\npipeline:\n- name: DucklingEntityExtractor\nurl: \"http://duckling:8000\"\ntimezone: Asia/Taipei\nlocale: zh_TW\ndimensions:\n- date\n- email\n- name: CountVectorsFeaturizer\n- name: CountVectorsFeaturizer\nanalyzer: \"char_wb\"\nmin_ngram: 1\nmax_ngram: 4\n- name: DIETClassifier\nepochs: 200\nconstrain_similarities: true\nmodel_confidence: linear_norm\n- name: rasa_addons.nlu.components.gazette.Gazette\n- name: >-\nrasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector\n-name: EntitySynonymMapper\n- name: ResponseSelector\nepochs: 100\nconstrain_similarities: true\n- name: FallbackClassifier\nthreshold: 0.7\nambiguity_threshold: 0.1\n- name: ResponseSelector\nepochs: 100\nretrieval_intent: faq\n- name: ResponseSelector\nepochs: 100\nretrieval_intent: chitchat"
}

app.engine('hbs', hbs({defaultLayout: 'main', extname: '.hbs'}))
app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(session({
  secret: 'TopSecret',
  resave: true,
  saveUninitialized: true
}))
app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'))
// app.post('http://192.168.10.108:5005/model/train', (req,res) => {
//   console.log(req)
// } )

app.use(flash())
app.use((req, res, next) => {
  res.locals.cpyNo = 2
  next()
})
app.use(flashMessage)


app.use(routes)

app.listen(PORT, () => {
  console.log(`chatbot is running oh http://localhost:${PORT}`)
})
