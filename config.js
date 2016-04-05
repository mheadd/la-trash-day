exports.config = {
	// Google geocoder URL.
	geocode_url: 'https://maps.googleapis.com/maps/api/geocode/json?address=',

	// URL to look up trash day in Los Angeles.
	lahub_url_template: 'http://maps.lacity.org/lahub/rest/services/Boundaries/MapServer/22/query?outFields=Day&geometryType=esriGeometryPoint&returnGeometry=false&geometry=%geometry%&inSR=4326&f=json',

	// Utility function to titlecase a word.
	titleCase: titleCase
}

function titleCase(word) {
  return word.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

