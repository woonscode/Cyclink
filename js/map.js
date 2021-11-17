// Retrieving firebase
const firebaseConfig = {

};

firebase.initializeApp(firebaseConfig);

let map;

function initMap() {
  var directionsRenderer = new google.maps.DirectionsRenderer();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 1.3521, lng: 103.8198 },
    zoom: 13,
  });
  // add info window
  infoWindow = new google.maps.InfoWindow();
  new AutocompleteDirectionsHandler(map);

  directionsRenderer.setMap(map);

}




function checkLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // set marker
        new google.maps.Marker({
          position: pos,
          map,

        })
        infoWindow.setPosition(pos);
        infoWindow.setContent("Location found.");
        infoWindow.open(map);
        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

}


// get icon base
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';


function call_parking_api() {
  if ((Cookies.get("start") != undefined) && (Cookies.get("end") != undefined)) {
    start = Cookies.get("start")
    document.getElementById("origin-input").value = Cookies.get("start")
    document.getElementById("destination-input").value = Cookies.get("end")
    Cookies.remove("start")
    Cookies.remove("end")
  }
  // get current location of user 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      var latlng = "Lat=" + position.coords.latitude + "&Long=" + position.coords.longitude + "&Dist=0.5"
      let api_endpoint_url = "http://datamall2.mytransport.sg/ltaodataservice/BicycleParkingv2?" + latlng
      // Add personal LTA Dev API key to AccountKey
      var config = {
        "headers": {
          "AccountKey": ""
        }
      };

      // resolve cors error
      let url = "https://cors-anywhere.herokuapp.com/" + api_endpoint_url

      axios.get(url, config)
        .then(response => {

          data = response.data
          parking_spots_array = data.value


        })
    })
  }

  // need to give a moment for api to be called due to asynchronous nature of js
  // clicking show parking spots button might return undefined in console log at first try 
  return parking_spots_array
}

function showParkingSpots() {
  parking_spots_array = call_parking_api()
  for (spot of parking_spots_array) {
    new google.maps.Marker({
      position: {
        lat: spot.Latitude,
        lng: spot.Longitude
      },
      map,
      icon: iconBase + "parking_lot_maps.png"

    })
  }
}




// directions show automatically once both start and end point has been entered 
class AutocompleteDirectionsHandler {
  map;
  originPlaceId;
  destinationPlaceId;
  travelMode;
  directionsService;
  directionsRenderer;
  avoidHighways;
  constructor(map) {
    this.map = map;
    this.originPlaceId = "";
    this.destinationPlaceId = "";

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(map);
    this.directionsRenderer.setPanel(document.getElementById("directions-panel"));
    const originInput = document.getElementById("origin-input");
    const destinationInput = document.getElementById("destination-input");
    const originAutocomplete = new google.maps.places.Autocomplete(originInput);


    // Specify just the place data fields that you need.
    originAutocomplete.setFields(["place_id"]);

    const destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput
    );

    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(["place_id"]);

    this.setupPlaceChangedListener(originAutocomplete, "ORIG");
    this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

  }


  // method to set listener on change of places autocomplete
  setupPlaceChangedListener(autocomplete, mode) {
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.place_id) {
        window.alert("Please select an option from the dropdown list.");
        return;
      }

      if (mode === "ORIG") {
        this.originPlaceId = place.place_id;
      } else {
        this.destinationPlaceId = place.place_id;
      }

      this.route();
    });
  }


  // get route method 
  route() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }


    this.directionsService.route(
      {
        origin: { placeId: this.originPlaceId },
        destination: { placeId: this.destinationPlaceId },
        travelMode: "BICYCLING",
      },
      (response, status) => {
        if (status === "OK") {
          this.directionsRenderer.setDirections(response);
          var legs = response.routes[0].legs;
          for (var leg of legs) {
            var save_button = document.getElementById("save-route")
            save_button.addEventListener("click", function () {
              updateDatabase(userId, leg.start_address, leg.end_address, leg.distance)
            })
          }

        } else {
          alert("Directions request failed due to " + status);
        }
      }
    );
  }



}

// get user id
userId = Cookies.get("userId")

// update database function 
function updateDatabase(userId, start, end, time) {
  var alert = ""
  // A post entry.
  var postData = {
    distance: time,
    end_point: end,
    start_point: start,
  };



  // check if post data exists in database
  var routes_ref = firebase.database().ref('users/' + userId + '/routes/')
  routes_ref.once('value').then((snapshot) => {
    let route_added = false
    let user_routes = snapshot.val()
    for (routes in user_routes) {
      if (user_routes[routes].end_point == postData.end_point && user_routes[routes].start_point == postData.start_point) {
        route_added = true
      }
    }
    if (route_added == true) {
      alert = `
        <div class="alert alert-info" role="alert">
            Route has already been added. 
        </div>
        `
    }
    else {
      firebase.database().ref('users/' + userId + '/routes/').push(postData);

      alert = `
        <div class="alert alert-info" role="alert">
            Route saved!
        </div>
        `
    }
    document.getElementById("alert").innerHTML = alert
  })

}

function clearOrigin() {
  document.getElementById("origin-input").value = ""

}

function clearDest() {
  document.getElementById("destination-input").value = ""
}