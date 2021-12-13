const dataPanel = document.querySelector('#data-panel')
if(dataPanel){
	dataPanel.addEventListener('click', event => {
		const target = event.target
	
		if(target.matches('#delete-btn')){
			const deletePosition = document.querySelector('#delete-position')
			const deleteForm = document.querySelector('#delete-form')
	
			deletePosition.innerText = '「' + target.dataset.name + '」'
			deleteForm.action = `/${target.dataset.category}/${target.dataset.id}?_method=DELETE`
		}
	
		if(target.matches('#adminSearch-delete-btn')){
			const deletePosition = document.querySelector('#delete-position')
			const deleteForm = document.querySelector('#delete-form')
	
			deletePosition.innerText = '「' + target.dataset.cpyname + '的' + target.dataset.name + '」'
			deleteForm.action = `/${target.dataset.category}/${target.dataset.cpyno}/${target.dataset.table}/${target.dataset.id}?_method=DELETE`
		}

		if(target.matches('#delete-function-btn')){
			const deleteFunction = document.querySelectorAll('#delete-function')
			const deleteForm = document.querySelector('#delete-form')

			deleteFunction.forEach(item => {
				item.innerText = '「' + target.dataset.name + '」'
			})
			deleteForm.action = `/${target.dataset.category}/${target.dataset.id}/${target.dataset.categoryid}?_method=DELETE`
		}

		if(target.matches('#delete-question-btn')){
			const deleteQuestion = document.querySelectorAll('#delete-question')
			const deleteForm = document.querySelector('#delete-form')

			deleteQuestion.forEach(item => {
				item.innerText = '「' + target.dataset.name + '」'
			})
			if(target.dataset.categoryid){
				deleteForm.action = `/${target.dataset.category}/${target.dataset.id}/${target.dataset.functionid}/${target.dataset.categoryid}?_method=DELETE`
			}else{
				deleteForm.action = `/${target.dataset.category}/${target.dataset.id}/${target.dataset.functionid}/?_method=DELETE`
			}
			
		}

		if(target.matches('#delete-question-admin-btn')){
			const deleteQuestion = document.querySelectorAll('#delete-question')
			const deleteForm = document.querySelector('#delete-form')

			deleteQuestion.forEach(item => {
				item.innerText = '「' + target.dataset.name + '」'
			})
			deleteForm.action = `/${target.dataset.category}/${target.dataset.id}/${target.dataset.functionid}?_method=DELETE`
		}
	})
}





