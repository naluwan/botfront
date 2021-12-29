const axios = require('axios')
const fs = require('fs')

module.exports = {
  // 新增問題寫檔
  fsWriteQuestion: (description, entity_name) => {
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
  // 刪除問題寫檔
  fsDeleteQuestion: (questionCheck) => {
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
  },
  // 新增功能寫檔
  fsWriteFunction: (category, function_name, entity_name) => {
    const category_name = {
      1: {name: '人事', entity: 'personnel'},
      2: {name: '考勤', entity: 'attendance'},
      3: {name: '保險', entity: 'insurance'},
      4: {name: '薪資', entity: 'salary'},
      5: {name: '額外', entity: 'otherCategory'},
    }
    // console.log(category_name[category])
    const currentCategory = category_name[category]

    axios.get('http://localhost:3030/train')
    .then(response => {
      return response.data
    })
    .then(data => {
      // console.log(JSON.stringify(data.nlu.zh.rasa_nlu_data.common_examples))
      const nluData = data.nlu.zh.rasa_nlu_data.common_examples
      const newFunction = {
        "text": `${function_name}`,
        "intent": "分類加功能",
        "entities": [
          { "entity": `function`, "value": `${entity_name}`, "start": 0, "end": function_name.length}
        ],
        "metadata": { "language": "zh", "canonical": true }
      }

      const repeatText = nluData.filter(item => {
        if(item.entities[0]){
          if(item.entities[0].value == newFunction.entities[0].value && item.text == newFunction.text){
            return item
          }
        }
      })

      if(repeatText.length){
        return console.log(`資料重複： ` + JSON.stringify(repeatText[0]))
      }else{
        nluData.push(newFunction)
        data.nlu.zh.rasa_nlu_data.common_examples = nluData
        // try{
        //   fs.writeFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json-2.json', JSON.stringify(data.nlu.zh))
        // } catch(err){
        //   console.log(err)
        return data
        }
    })
    .then(data => {
      nluData = data.nlu.zh.rasa_nlu_data.common_examples
      const text = `${currentCategory.name}的${function_name}`

      const newMultiEntities = {
        "text": text,
        "intent": "分類加功能",
        "entities": [
          { "entity": "function", "value": `${entity_name}`, "start": 3, "end": text.length },
          { "entity": "category", "value": `${currentCategory.entity}`, "start": 0, "end": 2 }
        ],
        "metadata": { "language": "zh" }
      }

      const repeatText = nluData.filter(item => item.text == newMultiEntities.text)
      if(repeatText.length){
        console.log(`資料重複： ` + repeatText)
      }else{
        nluData.push(newMultiEntities)
        data.nlu.zh.rasa_nlu_data.common_examples = nluData
        try{
          fs.writeFileSync('C:/Users/AN1100275/Desktop/training-data/data/nlu-json-3.json', JSON.stringify(data.nlu.zh))
        } catch(err){
          console.log(err)
        }
      }
    })
    .catch(err => console.log(err))
  }
}