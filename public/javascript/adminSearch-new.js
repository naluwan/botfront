const adminSearchWrapper = document.querySelector('#adminSearch-new-wrapper')

adminSearchWrapper.addEventListener('click', e => {
	const target = e.target
	
	if(target.matches('#tableFilter')){
		const industry = document.querySelector('#industry-select')
		if(target.value == 'POSITION'){
			industry.removeAttribute('hidden')
		}else{
			industry.setAttribute('hidden', '')
		}
	}
})
