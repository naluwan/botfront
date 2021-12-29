const axios = require('axios')
const fs = require('fs')

module.exports = {
  fsWrite: (description, entity_name) => {
    axios.get('http://localhost:3030/train')
    .then(response => {
      return response.data
    })
    .then(data => {
      // console.log(JSON.stringify(data.nlu.zh.rasa_nlu_data.common_examples))
      const nluData = data.nlu.zh.rasa_nlu_data.common_examples
      const newContent = {
        "text": `${description}`,
        "intent": "問答",
        "entities": [
          { "entity": `${entity_name}`, "value": `${description}`, "start": 0, "end": description.length}
        ],
        "metadata": { "language": "zh", "canonical": true }
      }

      const repeatText = nluData.filter(item => item.text == newContent.text)
      if(repeatText.length){
        console.log(`資料重複： ` + repeatText)
      }else{
        nluData.push(newContent)
        data.nlu.zh.rasa_nlu_data.common_examples = nluData
        try{
          fs.writeFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json-2.json', JSON.stringify(data.nlu.zh))
        } catch(err){
          console.log(err)
        }
      }
    })
    .catch(err => console.log(err))
  },
  fsDelete: (questionCheck) => {
    axios.get('http://localhost:3030/train')
    .then(response => {
      return response.data
    })
    .then(data => {
      const arrayText = []
      data.nlu.zh.rasa_nlu_data.common_examples.forEach(item => {
        arrayText.push(item.text)
      })
      // console.log(questionCheck.DESCRIPTION)
      const index = arrayText.indexOf(questionCheck.DESCRIPTION)
      // console.log(index)
      data.nlu.zh.rasa_nlu_data.common_examples.splice(index, 1)

      try{
        fs.writeFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json-2.json', JSON.stringify(data.nlu.zh))
      } catch(err){
        console.log(err)
      }
    })
    .catch(err => console.log(err))
  }
}