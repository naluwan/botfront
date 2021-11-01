const dataPanel = document.querySelector('#data-panel')
const searchCompanyInfo = document.querySelector('#searchCompanyInfo')


dataPanel.addEventListener('click', event => {
    const target = event.target

    if(target.matches('#delete-btn')){
        const deletePosition = document.querySelector('#delete-position')
        const deleteForm = document.querySelector('#delete-form')

        deletePosition.innerText = '「' + target.dataset.name + '」'
        deleteForm.action = `/${target.dataset.category}/${target.dataset.id}?_method=DELETE`
    }
})

searchCompanyInfo.addEventListener('focus', e => {
    const target = e.target

    if(target.matches('#searchCompanyInfo')){
			document.querySelector('#searchCompanyInfo').value = ''
    }
})