const dataPanel = document.querySelector('#data-panel')

dataPanel.addEventListener('click', event => {
    const target = event.target

    if(target.matches('#delete-btn')){
        const deletePosition = document.querySelector('#delete-position')
        const deleteForm = document.querySelector('#delete-form')

        deletePosition.innerText = '「' + target.dataset.name + '」'
        deleteForm.action = `/position/${target.dataset.id}?_method=DELETE`
    }
})