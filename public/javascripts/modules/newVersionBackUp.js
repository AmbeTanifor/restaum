import axios from 'axios';
import { $ } from './bling';

// *********************++++++++++++++++***************** START OF ADDED STUFF

//Set up the custom styles for the map. I've created two styles so the map can switch between them depending on the zoom level. i.e. there is far less detail when the map is zoomed out.
//First, we read in the data describing style.
const style_festival = [
  {
    "featureType": "administrative",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
     featureType: 'landscape',
     elementType: 'labels.text.fill',
     stylers: [{color: '#ae9e90'}]

  },{
    "featureType": "water",
    "stylers": [
      { "visibility": "on" },
      { "color": "#4f92c6" }
    ]
  }
];

const style_festival_zoomed = [
{elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
              {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
              {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{color: '#c9b2a6'}]
              },
              {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{color: '#dcd2be'}]
              },
              {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{color: '#ae9e90'}]
              },
              {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#93817c'}]
              },
              {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{color: '#a5b076'}]
              },
              {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#447530'}]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#f5f1e6'}]
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{color: '#fdfcf8'}]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#f8c967'}]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#e9bc62'}]
              },
              {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry',
                stylers: [{color: '#e98d58'}]
              },
              {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry.stroke',
                stylers: [{color: '#db8555'}]
              },
              {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{color: '#806b63'}]
              },
              {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'transit.line',
                elementType: 'labels.text.fill',
                stylers: [{color: '#8f7d77'}]
              },
              {
                featureType: 'transit.line',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#ebe3cd'}]
              },
              {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
              },
              {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{color: '#4f92c6'}]
              },
              {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#92998d'}]
              }
];

//Then we use this data to create the styles. 
const styled_festival = new google.maps.StyledMapType(style_festival, {name: "Festival style"});
const styled_festival_zoomed = new google.maps.StyledMapType(style_festival_zoomed, {name: "Festival style zoomed"});

//The degree to which the map is zoomed in. This can range from 0 (least zoomed) to 21 and above (most zoomed).

const festivalMapZoom = 11;
const festivalMapZoomMax = 20;
const festivalMapZoomMin = 11;

/*
const mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
};*/

const mapOptions = {
      zoom: festivalMapZoom,
      maxZoom:festivalMapZoomMax,
      minZoom:festivalMapZoomMin,
      center: { lat: 43.2, lng: -79.8 },
      panControl: false,
      mapTypeControl: false,
      mapTypeControlOptions: {
        mapTypeIds: ['ROADMAP', 'map_styles_festival', 'map_styles_festival_zoomed']
       }
    };

//*********************++++++++++++++++++++++++++++++******************** END OF ADDED STUFF

function loadPlaces(map, lat = 43.2, lng = -79.8) {
	axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
		.then(res => {
			const places = res.data;
			if (!places.length) {
			alert('No places found');
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
						<a href="/store/${this.place.slug}">
							<img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
							<p>${this.place.name} - ${this.place.location.address}</p>
						</a>
					</div>
				`;
				infoWindow.setContent(html);
				infoWindow.open(map, this);

        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ START OF ADDED STUFF
          // Change the z-index property of the marker to make the marker appear on top of other markers
        marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 10);
          //zoom the map
          setZoomOnMarkerClick();
          //Let the marker be set to be the center of the map when clicked
          map.setCenter(marker.getPosition());
        //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++END OF ADDED STUFF
			}));
			
			// Then zoom the map to fit all the markers perfectly
			map.setCenter(bounds.getCenter());
			map.fitBounds(bounds);
		});
}

function makeMap(mapDiv) {
	if(!mapDiv) return;
	// Making the map
	const map = new google.maps.Map(mapDiv, mapOptions);
	loadPlaces(map);
	const input = $('[name="geolocate"]');
	const autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.addListener('place_changed', () => {
		const place = autocomplete.getPlace();
		loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
	});

//***************+++++++++++++++++++++++++******************** START OF ADDED STUFF

//Assigning the two map styles defined above to the map.
map.mapTypes.set('map_styles_festival', styled_festival);
map.mapTypes.set('map_styles_festival_zoomed', styled_festival_zoomed);
//Setting the one of the styles to display as default as the map loads.
map.setMapTypeId('map_styles_festival');

//Continuously listens out for when the zoom level changes. This includs when the map zooms when a marker is clicked.
google.maps.event.addListener(map, "zoom_changed", function() {
  const newZoom = map.getZoom();
  //If the map is zoomed in, the switch to the style that shows the higher level of detail.
  if (newZoom > 12){
    map.setMapTypeId('map_styles_festival_zoomed');
      }
  //Otherwise the map must be zoomed out, so use the style with the lower level of detail.
  else {
    map.setMapTypeId('map_styles_festival');
  }

});


//*********************++++++++++++++++++++++++++++++******************** END OF ADDED STUFF

}


//***************+++++++++++++++++++++++++******************** START OF ADDED STUFF

    //If the map has not already been zoomed in, this function will help do so when a marker is clicked.
    function setZoomOnMarkerClick(){
      const currentZoom = map.getZoom();
      if (currentZoom < 12){
        map.setZoom(17);
        }
      }
//*********************++++++++++++++++++++++++++++++******************** END OF ADDED STUFF

export default makeMap;