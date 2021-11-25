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
	})
}





