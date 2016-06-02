// Set the map
var southWest = L.latLng(60, 24),
    northEast = L.latLng(65, 27),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    zoomControl: false, 
    attributionControl: true,
    maxBounds: bounds,
    maxZoom: 20,
    minZoom: 7});

// Non-default zoom control location
new L.Control.Zoom({ position: 'topright' }).addTo(map);

// Add location hash
var hash = new L.Hash(map);

// Set location on load
map.setView([62.03, 25.5], 8);

// Add base layer

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

// Get the data
$.ajaxSetup({beforeSend: function(xhr){
  if (xhr.overrideMimeType)
  {
    xhr.overrideMimeType("application/json");
  }
}
});

// Color the marker depending on the model fit
function getColor(d) {
    return d >= 0.99  ? '#006600' :
           d > 0.98   ? '#00cc00' :
           d > 0.96   ? '#00ff00' :
           d > 0.94   ? '#66ff99' :
           d > 0.92   ? '#99ffcc' :
                        '#ccffff' ;
}

// Set marker styles options
function styleMarker(feature) {
    return {
        fillColor: getColor(feature.properties.modelfit),
        radius: 6,
        opacity: 0,
        fillOpacity: 0.5
    };
}

function addDataToMap(data, map) {
    var dataLayer = L.geoJson(data, {

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, styleMarker(feature));
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup('Model fit value: ' + feature.properties.modelfit + "%");
        }
    });
    dataLayer.addTo(map);
}

$.ajax({
  url: 'json/data.json',
  beforeSend: function(xhr){
    if (xhr.overrideMimeType)
    {
      xhr.overrideMimeType("application/json");
    }
  },
  dataType: 'json',
  success: function (data) {
      addDataToMap(data, map);
  }
});

// Make a legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0.92, 0.94, 0.95, 0.98, 0.99],
        labels = [];

    // loop through the model fit intervals and generate a label with a colored circle for each interval
    div.innerHTML = '<h4>Model fit</h4>'
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

// Make an infobox
var infobox = L.control({position: 'bottomleft'});

infobox.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info infobox hidden-xs');
    div.innerHTML += '<h4 class="capitalize">Open Knowledge Foundation Finland <em>Lajirikkauskartta</em></h4>'
    div.innerHTML += '<p> This map is an effort to identify remaining portions of old-growth forests in Finland by modelling LiDAR measurements and confirming computed data with observations by outdoor-goers on the ground.</p>'
    div.innerHTML += '<p><a href="https://twitter.com/OKFFI" target="_blank"><i class="fa fa-fw fa-twitter"></i><span>@OKFFI</span></a><br><a href="https://www.facebook.com/groups/lajirikkauskartta" target="_blank"><i class="fa fa-fw fa-facebook"></i><span>Lajirikkauskartta</span></a></p>'

    return div;
}

infobox.addTo(map);