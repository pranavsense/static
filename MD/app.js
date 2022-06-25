const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const headers = { allow: 'Origin' }

const showModal = card => {
	root.classList.add('loading')
	// history.pushState(null, '', card.dataset.src)
	let params = card.dataset.src.slice(1).split('/')
	window.type = params[0], window.typeId = params[1]
	fetch(`/api/details?type=${type}&id=${typeId}`).then(async resp => {
		resp = await resp.json()
		modal.querySelector('.body').innerHTML = resp.data
		type === 'tv' ? getSeasons(typeId) : fetchSource(type, typeId)
		toggleModal('open')
		root.classList.remove('loading')
	})
}

const getSeasons = typeId => {
	modal.classList.add('loading')
	let id = /-?(\d+)$/.exec(typeId)[1]
	fetch(`/api/details?type=seasons&id=${id}`, { headers })
	.then (async resp => {
		resp = await resp.json()
		$('.seasons').innerHTML = resp.data
		$('#seasons').dispatchEvent(new Event('change'))
		// modal.classList.remove('loading')
	})
}

const changeSeason = season => {
	modal.classList.add('loading')
	fetch(`/api/details?type=episodes&id=${season.value}`, { headers })
	.then (async resp => {
		resp = await resp.json()
		$('#episodes').innerHTML = resp.data
		$('#episodes').dispatchEvent(new Event('change'))
		modal.classList.remove('loading')
	})
}

const episode = episode => fetchSource('tv', episode.value)

const fetchSource = (type, typeId) => {
	$('#player').classList.add('loading','show')
	let id = /-?(\d+)$/.exec(typeId)[1]
	fetch(`/api/fetch?type=${type}&id=${id}`, { headers }).then(async resp => {
		resp = await resp.json()
		let notFound = '<span blank>Video not found.</span>'
		if (!resp.success) 
			return (player.innerHTML = notFound)
		$('#player').classList.remove('loading')
		player = new Playerjs({
			id: 'player', 
			file: resp.source,
			poster: $('.poster').dataset.banner
		})
	})
}

const toggleModal = (state, success) => {
	// state === 'close' && history.pushState(null, '', '/')
	cards.classList.toggle('d-none', state === 'open' && success)
	modal.classList.toggle('d-none', state === 'close')
	state === 'close' && ($('#player').innerHTML = '')
	state === 'close' && ($('#player').classList.remove('show'))
}

window.onpopstate = e => {
	if (location.pathname === '/')
		return toggleModal('close')
	window.location = location.pathname
}

const trailer = url => {
	const trailerModal = $('#trailer')
	const iframe = trailerModal.querySelector('.iframe')
	if (url === false) {
		trailerModal.classList.remove('show')
		return iframe.innerHTML = ''
	}
	iframe.innerHTML = `<iframe src=${url}></iframe>`
	trailerModal.classList.add('show')
}

const load = () => {
	window.cards = $('#cards'), window.modal = $('#modal'), 
	window.rootBlock = ('#root'), window.player = $('#player')
	window.noResult = $('.no-result'), window.data = []
	let params = location.pathname.slice(1).split('/')
	window.type = params[0], window.typeId = params[1]
	
	if (['movie', 'tv'].includes(type)) {
		$('#query').blur()
		showModal({ dataset: { src: `/${type}/${typeId}` } })
	}
	
	$('#search').addEventListener('submit', function (e) {
		e.preventDefault() && history.pushState(null, '', '/')
		let queryPath = `/api/search?query=${$('#query').value}`
		if (window.queryPath === queryPath) return
		else window.queryPath = queryPath
		root.classList.add('loading')
		fetch(queryPath, { headers }).then(async resp => {
			resp = await resp.json()
			cards.innerHTML = resp.data ?? null
			toggleModal('close', resp.success)
			noResult.classList.toggle('d-none', resp.success)
		}).finally(err => root.classList.remove('loading'))
	})
}