import axios from 'axios';
import { $ } from './bling';

const mapOptionsFr = {
	center: { lat: 43.2, lng: -79.8 },
	zoom: 17
}

function loadPlacesFr(map, lat = 43.2, lng = -79.8) {
	axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
		.then(res => {
			const places = res.data;
			if (!places.length) {
			alert('Aucune place trouvée');
			return;
			}
			// Create a bounds
			const bounds = new google.maps.LatLngBounds();
			const infoWindow = new google.maps.InfoWindow();

			const markers = places.map(place => {
				const [placeLng, placeLat] = place.location.coordinates;
				const position = { lat: placeLat, lng: placeLng };
				bounds.extend(position);
				const marker = new google.maps.Marker({ map, position });
				marker.place = place;
				return marker;
			});

			// When someone clicks on a marker, show the details of that place
			markers.forEach(marker => marker.addListener('click', function() {
				const html =`
					<div class="popup">
						<a href="/storefr/${this.place.slug}">
							<img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
							<p>${this.place.name} - ${this.place.location.address}</p>
						</a>
					</div>
				`;
				infoWindow.setContent(html);
				infoWindow.open(map, this);
			}));
			
			// Then zoom the map to fit all the markers perfectly
			map.setCenter(bounds.getCenter());
			map.fitBounds(bounds);
		});
}

function makeMapFr(mapDiv) {
	if(!mapDiv) return;
	// Making the map
	const map = new google.maps.Map(mapDiv, mapOptionsFr);
	loadPlacesFr(map);
	const input = $('[name="geolocatefr"]');
	const autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.addListener('place_changed', () => {
		const place = autocomplete.getPlace();
		loadPlacesFr(map, place.geometry.location.lat(), place.geometry.location.lng());
	});
}

export default makeMapFr;