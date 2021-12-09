const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')
const {isAdmin} = require('../../middleware/auth')

const sql = require('mssql')
const pool = require('../../config/connectPool')
const { query } = require('express')
const {TrainSendMail, userSendMAil} = require('../../modules/sendMail')

// ↓ question 問答相關router ↓

router.delete('/question/:question_id/:function_id/:category_id', (req, res) => {
  const {question_id, function_id, category_id} = req.params

  const request = new sql.Request(pool)

  request.query(`select *
  from BF_CS_CATEGORY
  where CATEGORY_ID = ${category_id}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryCheck = result.recordset[0]
    if(!categoryCheck){
      req.flash('error', '查無此類別，請重新嘗試!!')
      return res.redirect(`/bf_cs/question`)
    }
    request.query(`select *
    from BF_CS_QUESTION
    where QUESTION_ID = ${question_id}
    and FUNCTION_ID = ${function_id}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const questionCheck = result.recordset[0]
      if(!questionCheck){
        req.flash('error', '查無此功能的問答資料，請重新嘗試!!')
        return res.redirect(`/bf_cs/question/filter?categorySelect=${category_id}&functionSelect=${function_id}&search=`)
      }else{
        request.query(`delete from BF_CS_QUESTION
        where QUESTION_ID = ${question_id}
        and FUNCTION_ID = ${function_id}`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          req.flash('success_msg', '刪除問答資料成功!!')
          return res.redirect(`/bf_cs/question/filter?categorySelect=${category_id}&functionSelect=${function_id}&search=`)
        })
      }
    })
  })
})

// 新增問答資料
router.post('/question/new', (req, res) => {
  const {categorySelect, functionSelect, description, entity_name, answer} = req.body

  const request = new sql.Request(pool)
  const warning = []

  // 驗證需要的值是否存在
  if(!categorySelect || !functionSelect || !description || !entity_name || !answer){
    // 抓取類別資料
    request.query(`select * 
    from BF_CS_CATEGORY`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const categoryInfo = result.recordset
      // 抓取指定類別的功能
      request.query(`select * 
      from BF_CS_FUNCTION
      where CATEGORY_ID = ${categorySelect}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const functionInfo = result.recordset
        warning.push({message: '所有欄位都是必填的!!'})
        return res.render('new_cs_question', {
          categorySelect, 
          functionSelect, 
          categoryInfo, 
          functionInfo,
          description,
          entity_name,
          answer,
          warning
        })
      })
    })
  }

  // 驗證要新增問題的功能是否存在
  request.query(`select * 
  from BF_CS_FUNCTION
  where FUNCTION_ID = ${functionSelect}
  and CATEGORY_ID = ${categorySelect}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const functionCheck = result.recordset[0]
    if(!functionCheck){
      req.flash('error', '因查無此功能而無法新增問答，請重新嘗試!!')
      return res.redirect('/bf_cs/question/new')
    }else{
      // 驗證問答描述和問答英文代號是否重複
      request.query(`select *
      from BF_CS_QUESTION
      where DESCRIPTION = '${description}'
      or ENTITY_NAME = '${entity_name}'`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const questionCheck = result.recordset[0]
        if(questionCheck){
          request.query(`select * 
          from BF_CS_CATEGORY`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            const categoryInfo = result.recordset
            // 抓取指定類別的功能
            request.query(`select * 
            from BF_CS_FUNCTION
            where CATEGORY_ID = ${categorySelect}`, (err, result) => {
              if(err){
                console.log(err)
                return
              }
              const functionInfo = result.recordset
              if(questionCheck.DESCRIPTION == description){
                warning.push({message: '問答描述重複，請重新嘗試!!'})
                return res.render('new_cs_question', {
                  categorySelect, 
                  functionSelect, 
                  categoryInfo, 
                  functionInfo,
                  entity_name,
                  answer,
                  warning
                })
              }
              if(questionCheck.ENTITY_NAME == entity_name){
                warning.push({message: '問答英文代號重複，請重新嘗試!!'})
                return res.render('new_cs_question', {
                  categorySelect, 
                  functionSelect, 
                  categoryInfo, 
                  functionInfo,
                  description,
                  answer,
                  warning
                })
              }
            })
          })
        }else{
          // 驗證問答描述和英文代號是否和功能名稱和英文代號重複
          request.query(`select *
          from BF_CS_FUNCTION
          where ENTITY_NAME = '${entity_name}'
          or FUNCTION_NAME = '${description}'`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            const functionEntityCheck = result.recordset[0]
            if(functionEntityCheck){
              request.query(`select * 
              from BF_CS_CATEGORY`, (err, result) => {
                if(err){
                  console.log(err)
                  return
                }
                const categoryInfo = result.recordset
                // 抓取指定類別的功能
                request.query(`select * 
                from BF_CS_FUNCTION
                where CATEGORY_ID = ${categorySelect}`, (err, result) => {
                  if(err){
                    console.log(err)
                    return
                  }
                  const functionInfo = result.recordset
                  if(functionEntityCheck.ENTITY_NAME == entity_name){
                    warning.push({message: '問答英文代號不能和功能英文名稱相同，請重新嘗試!!'})
                    return res.render('new_cs_question', {
                      categorySelect, 
                      functionSelect, 
                      categoryInfo, 
                      functionInfo,
                      description,
                      answer,
                      warning
                    })
                  }
                  if(functionEntityCheck.FUNCTION_NAME == description){
                    warning.push({message: '問答描述不能和功能名稱一樣，請重新嘗試!!'})
                    return res.render('new_cs_question', {
                      categorySelect, 
                      functionSelect, 
                      categoryInfo, 
                      functionInfo,
                      entity_name,
                      answer,
                      warning
                    })
                  }
                })
              })
            }else{
              // 驗證問答描述和英文代號是否和分類名稱和英文代號重複
              request.query(`select *
              from BF_CS_CATEGORY
              where ENTITY_NAME = '${entity_name}'
              or CATEGORY_NAME = '${description}'`, (err, result) => {
                if(err){
                  console.log(err)
                  return
                }
                const categoryEntityCheck = result.recordset[0]
                if(categoryEntityCheck){
                  request.query(`select * 
                  from BF_CS_CATEGORY`, (err, result) => {
                    if(err){
                      console.log(err)
                      return
                    }
                    const categoryInfo = result.recordset
                    // 抓取指定類別的功能
                    request.query(`select * 
                    from BF_CS_FUNCTION
                    where CATEGORY_ID = ${categorySelect}`, (err, result) => {
                      if(err){
                        console.log(err)
                        return
                      }
                      const functionInfo = result.recordset
                      if(categoryEntityCheck.ENTITY_NAME == entity_name){
                        warning.push({message: '問答英文代號不能和分類英文名稱相同，請重新嘗試!!'})
                        return res.render('new_cs_question', {
                          categorySelect, 
                          functionSelect, 
                          categoryInfo, 
                          functionInfo,
                          description,
                          answer,
                          warning
                        })
                      }
                      if(categoryEntityCheck.CATEGORY_NAME == description){
                        warning.push({message: '問答描述不能和分類名稱一樣，請重新嘗試!!'})
                        return res.render('new_cs_question', {
                          categorySelect, 
                          functionSelect, 
                          categoryInfo, 
                          functionInfo,
                          entity_name,
                          answer,
                          warning
                        })
                      }
                    })
                  })
                }else{
                  // 新增問答
                  request.input('function_id', sql.Int, functionSelect)
                  .input('description', sql.NVarChar(2000), description)
                  .input('entity_name', sql.NVarChar(100), entity_name)
                  .input('answer', sql.NVarChar(2000), answer)
                  .query(`insert into BF_CS_QUESTION (FUNCTION_ID, DESCRIPTION, ENTITY_NAME, ANSWER)
                  values (@function_id, @description, @entity_name, @answer)`, (err, result) => {
                    if(err){
                      console.log(err)
                      return
                    }
                    TrainSendMail(res, 'mail_bf_cs_question', description, entity_name, '棉花糖客服機器人新增問答資訊')
                    req.flash('success_msg', '新增問答資料成功!!')
                    return res.redirect(`/bf_cs/question/filter?categorySelect=${categorySelect}&functionSelect=${functionSelect}&search=`)
                  })
                }
              })
            }
          })
        }
      })
    }
  })
})

// 顯示新增問答頁面
router.get('/question/new', (req, res) => {
  const request = new sql.Request(pool)

  // 抓取類別資料
  request.query(`select * 
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    res.render('new_cs_question', {categoryInfo})
  })
})

// 問答編輯功能
router.put('/:category_id/:function_id/:question_id', (req, res) => {
  const {category_id, function_id, question_id} = req.params
  const {answer} = req.body
  const request = new sql.Request(pool)

  // 驗證問題是否存在
  request.query(`select *
  from BF_CS_QUESTION
  where QUESTION_ID = ${question_id}
  and FUNCTION_ID = ${function_id}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const questionInfo = result.recordset[0]
    if(!questionInfo){
      req.flash('warning_msg', '查無此問答資料，請重新嘗試!!')
      return res.redirect(`/bf_cs/question/filter?categorySelect=${category_id}&functionSelect=${function_id}&search=`)
    }else{
      request.input('answer', sql.NVarChar(2000), answer)
      .query(`update BF_CS_QUESTION
      set ANSWER = @answer
      where QUESTION_ID = ${question_id}
      and FUNCTION_ID = ${function_id}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        req.flash('success_msg', '更新問答資料成功!!')
        return res.redirect(`/bf_cs/question/filter?categorySelect=${category_id}&functionSelect=${function_id}&search=`)
      })
    }
  })

})

// 顯示問答編輯頁面
router.get('/:category_id/:function_id/:question_id/edit', (req, res) => {
  const {category_id, function_id, question_id} = req.params
  const request = new sql.Request(pool)

  // 驗證問題是否存在
  request.query(`select *
  from BF_CS_QUESTION
  where QUESTION_ID = ${question_id}
  and FUNCTION_ID = ${function_id}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const questionInfo = result.recordset[0]
    if(!questionInfo){
      req.flash('warning_msg', '查無此問答資料，請重新嘗試!!')
      return res.redirect(`/bf_cs/question/filter?categorySelect=${category_id}&functionSelect=${function_id}&search=`)
    }else{
      return res.render('edit_cs_question', {questionInfo, category_id, function_id})
    }
  })
})

// 查詢類別下的功能資料 API
router.get('/api/v1/function/:category_id', (req, res) => {
  const {category_id} = req.params
  const request = new sql.Request(pool)

  // 抓取指定類別的功能資料
  request.query(`select *
  from BF_CS_FUNCTION
  where CATEGORY_ID = ${category_id}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    return res.send(result)
  })
})

// 查詢問答頁面前的篩選
router.get('/question/filter', (req, res) => {
  const {categorySelect, functionSelect, search} = req.query
  const request = new sql.Request(pool)
  const warning = []
  
  // 未選擇類別和功能就搜尋的錯誤處理
  if(search && (!categorySelect || !functionSelect)){
    req.flash('warning_msg', '請先選擇類別和功能再進行查詢!!')
    return res.redirect('/bf_cs/question')
  }
  // 抓取類別資料
  request.query(`select * 
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    // 抓取指定類別的功能資料
    request.query(`select * 
    from BF_CS_FUNCTION
    where CATEGORY_ID = ${categorySelect}`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const functionInfo = result.recordset
      // 如果沒有搜尋關鍵字
      if(!search){
        // 抓取指定功能的問答資料
        request.query(`select * 
        from BF_CS_QUESTION
        where FUNCTION_ID = ${functionSelect}`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const questionInfo = result.recordset
          if(questionInfo.length == 0) warning.push({message: '查無此功能的問答，請先新增問答!!'})
          return res.render('cs_question', {categoryInfo, functionInfo, questionInfo, categorySelect, functionSelect, warning})
        })
      }else{  // 有搜尋關鍵字
        // 抓取指定功能包含搜尋關鍵字的問答資料
        request.query(`select *
        from BF_CS_QUESTION
        where FUNCTION_ID = ${functionSelect}
        and DESCRIPTION like '%${search}%'`, (err, result) => {
          if(err){
            console.log(err)
            return
          }
          const questionInfo = result.recordset
          if(questionInfo.length == 0) warning.push({message: '查無此問答，請重新嘗試!!'})
          return res.render('cs_question', {categoryInfo, functionInfo, questionInfo, categorySelect, functionSelect, warning, search})
        })
      }
    })
  })
})

// 顯示問答頁面
router.get('/question', (req, res) => {
  const request = new sql.Request(pool)
  const warning = []

  // 抓取類別資料
  request.query(`select *
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    if(categoryInfo.length == 0){
      warning.push({message: '查無類別資料，請先新增類別!!'})
      return res.render('cs_function', {warning})
    }else{
      warning.push({message: '請先選擇類別和功能!!'})
      return res.render('cs_question', {categoryInfo, warning})
    } 
  })
})

// ↓ function 功能相關router ↓

// 刪除功能
router.delete('/function/:function_id/:category_id', (req, res) => {
  const {function_id, category_id} = req.params
  const request = new sql.Request(pool)

  // 驗證功能是否存在
  request.query(`select *
  from BF_CS_FUNCTION
  where FUNCTION_ID = ${function_id}
  and CATEGORY_ID = ${category_id}`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const functionCheck = result.recordset[0]
    if(!functionCheck){
      req.flash('error', '查無此功能，請重新嘗試!!')
      return res.redirect(`/bf_cs/function/filter?category=${category_id}&search=`)
    }else{
      // 刪除
      request.query(`delete from BF_CS_FUNCTION
      where CATEGORY_ID = ${category_id}
      and FUNCTION_ID = ${function_id}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        req.flash('success_msg', '刪除功能成功!!')
        return res.redirect(`/bf_cs/function/filter?category=${category_id}&search=`)
      })
    }
  })
})

// 新增功能
router.post('/function/new', (req, res) => {
  const {category, function_name, entity_name} = req.body
  const request = new sql.Request(pool)
  const warning = []

  // 驗證需要的值是否存在
  if(!category || !function_name || !entity_name){
    request.query(`select * 
    from BF_CS_CATEGORY`, (err, result) => {
      if(err){
        console.log(err)
        return
      }
      const categoryInfo = result.recordset
      warning.push({message: '所有欄位都是必填的!!'})
    return res.render('new_cs_function', {categoryInfo, category, function_name, entity_name, warning})
    })
  }

  // 驗證值是否重複
  request.query(`select * 
  from BF_CS_FUNCTION 
  where FUNCTION_NAME = '${function_name}' or ENTITY_NAME = '${entity_name}'`, (err, result) => {
    if(err){
      console.log(err)
      return
    }

    const functionCheck = result.recordset[0]
    if(functionCheck){
      request.query(`select * 
      from BF_CS_CATEGORY`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const categoryInfo = result.recordset
        if(functionCheck.FUNCTION_NAME == function_name){
          warning.push({message: '功能名稱重複，請重新嘗試!!'})
          return res.render('new_cs_function', {category, categoryInfo, entity_name, warning})
        }

        if(functionCheck.ENTITY_NAME == entity_name){
          warning.push({message: '功能英文名稱重複，請重新嘗試!!'})
          return res.render('new_cs_function', {category, categoryInfo, function_name, warning})
        }
      })
    }else{
      request.query(`select *
      from BF_CS_CATEGORY
      where CATEGORY_NAME = '${function_name}'
      or ENTITY_NAME = '${entity_name}'`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const categoryEntityCheck = result.recordset[0]
        if(categoryEntityCheck){
          request.query(`select * 
          from BF_CS_CATEGORY`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            const categoryInfo = result.recordset
            if(categoryEntityCheck.CATEGORY_NAME == function_name){
              warning.push({message: '功能名稱不能與分類名稱相同，請重新嘗試!!'})
              return res.render('new_cs_function', {category, categoryInfo, entity_name, warning})
            }

            if(categoryEntityCheck.ENTITY_NAME == entity_name){
              warning.push({message: '功能英文名稱不能與分類英文名稱相同，請重新嘗試!!'})
              return res.render('new_cs_function', {category, categoryInfo, function_name, warning})
            }
          })
        }else{
          // 新增進資料庫
          request.input('category_id', sql.Int, category)
          .input('function_name', sql.NVarChar(30), function_name)
          .input('entity_name', sql.NVarChar(100), entity_name)
          .query(`insert into BF_CS_FUNCTION (CATEGORY_ID, FUNCTION_NAME, ENTITY_NAME)
          values (@category_id, @function_name, @entity_name)`, (err, result) => {
            if(err){
              console.log(err)
              return
            }
            TrainSendMail(res, 'mail_bf_cs_function', function_name, entity_name, '棉花糖客服機器人新增功能')
            req.flash('success_msg', '新增功能成功!!')
            return res.redirect(`/bf_cs/function/filter?category=${category}&search=`)
          })
        }
      })
    }
  })
})

// 顯示新增功能頁面
router.get('/function/new', (req, res) => {
  const request = new sql.Request(pool)
  const warning = []

  // 抓取類別資料
  request.query(`select * 
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    if(categoryInfo.length == 0) {
      req.flash('warning_msg', '查無類別，請先新增類別!!')
      return res.redirect('/bf_cs/function')
    }
    return res.render('new_cs_function', {categoryInfo})
  })
})

// 顯示功能資料頁面
router.get('/function/filter', (req, res) => {
  const {category, search} = req.query
  const request = new sql.Request(pool)
  const warning = []

  // 沒有選擇類別就使用關鍵字的錯誤處理
  if(search & !category){
    req.flash('warning_msg', '請先選擇類別再進行查詢!!')
    return res.redirect('/bf_cs/function')
  }
  // 抓取類別資料
  request.query(`select *
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    // 沒有搜尋關鍵字
    if(!search){
      // 抓取指定類別的功能資料
      request.query(`select * 
      from BF_CS_FUNCTION
      where CATEGORY_ID = ${category}`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const functionInfo = result.recordset
        if(functionInfo.length == 0) warning.push({message: '查無此類別資料，請先拉至下方新增功能!!'})
        return res.render('cs_function', {categoryInfo, functionInfo, category, warning})
      })
    }else{  //有搜尋關鍵字
      // 抓取指定類別並包含搜尋關鍵字的功能資料
      request.query(`select * 
      from BF_CS_FUNCTION
      where CATEGORY_ID = ${category}
      and FUNCTION_NAME like '%${search}%'`, (err, result) => {
        if(err){
          console.log(err)
          return
        }
        const functionInfo = result.recordset
        if(functionInfo.length == 0) warning.push({message: '查無此類別資料，請重新嘗試!!'})
        return res.render('cs_function', {categoryInfo, functionInfo, category, warning})
      })
    }
  })
})

// 顯示功能頁面
router.get('/function', (req, res) => {
  const request = new sql.Request(pool)
  const warning = []
  
  // 抓取類別資料
  request.query(`select *
  from BF_CS_CATEGORY`, (err, result) => {
    if(err){
      console.log(err)
      return
    }
    const categoryInfo = result.recordset
    if(categoryInfo.length == 0){
      warning.push({message: '查無類別資料，請先新增類別!!'})
      return res.render('cs_function', {warning})
    }else{
      warning.push({message: '請先選擇類別!!'})
      return res.render('cs_function', {categoryInfo, warning})
    } 
  })
})

module.exports = router