const searchInput = document.querySelector('#search')

searchInput.addEventListener('focus', e => {
	const target = e.target

	if(target.matches('#search')){
		document.querySelector('#search').value = ''
	}
})
