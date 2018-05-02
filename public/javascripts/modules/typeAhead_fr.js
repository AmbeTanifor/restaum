import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTMLFr(stores) {
	return stores.map(store => {
		return `
			<a href="/storefr/${store.slug}" class="searchfr__result">
				<strong> ${store.name} </strong>
			</a>
		`;
	}).join('');
}

function typeAheadFr(search) {
	if (!search) return;

	const searchInputFr = search.querySelector('input[name="search_fre"]');
	const searchResultsFr = search.querySelector('.searchfr__results');

	searchInputFr.on('input', function() {
		// If there is no value, quit it!
		if(!this.value) {
			searchResultsFr.style.display = 'none';
			return;
		}

		// Show search results!
		searchResultsFr.style.display = 'block';
		searchResultsFr.innerHTML = '';

		axios
			.get(`/api/search?q=${this.value}`)
			.then(res => {
				if(res.data.length) {
					searchResultsFr.innerHTML = dompurify.sanitize(searchResultsHTMLFr(res.data));
					return;
				}
				// Tell the users nothing came back
				searchResultsFr.innerHTML = dompurify.sanitize(`<div class="searchfr__result"> Aucun résultat pour ${this.value} trouvé</div>`);
			})
			.catch(err => {
				console.error(err);
			});
	});

	// handle keyboard inputs
	searchInputFr.on('keyup', (e) => {
		// If they are not pressing up, down, or enter key, who cares!
		if(![38, 40, 13].includes(e.keyCode)) {
			return; // Skip it!
		}
		const activeClass = 'searchfr__result--active';
		const current = search.querySelector(`.${activeClass}`);
		const items = search.querySelectorAll('.searchfr__result');
		let next;
		if(e.keyCode === 40 && current) {
			next = current.nextElementSibling || items[0];
		}else if (e.keyCode === 40) {
			next = items[0];
		}else if (e.keyCode === 38 && current) {
			next = current.previousElementSibling || items[items.length - 1]
		}else if (e.keyCode === 38) {
			next = items[items.length - 1];
		}else if (e.keyCode === 13 && current.href) {
			window.location = current.href;
			return;
		}
		if (current) {
			current.classList.remove(activeClass)
		}
		next.classList.add(activeClass);
	})
};

export default typeAheadFr;