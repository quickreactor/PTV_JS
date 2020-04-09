// python to js


// def = function
// dict = object
// none = null
// f string = template string

// from hashlib import sha1
// import json
// import hmac
// import requests
// import urllib

var baseURL = 'timetableapi.ptv.vic.gov.au';
var dev_id ='3001420';
var api_key = 'f8743d5d-a986-4634-a603-60df90b93143';
var protoc = 'https://';
var apiReturnData = {};


function calculateSignature(pathAndQuery) {
        /*
        Calculates a signature from url
        Parameters
        ----------
        path : str
            The target path of the url (e.g '/v3/search/')

        Returns
        -------
        signature : str
            The hex signature.
        */
  //key = bytes(self.api_key, 'UTF-8')
  //raw = bytes(path, 'UTF-8')
  //return hmac.new(key, raw, sha1).hexdigest().upper()
  var encrypted = CryptoJS.HmacSHA1(pathAndQuery, api_key);
  var hexEncrypted = CryptoJS.enc.Hex.stringify(encrypted).toUpperCase();
  return hexEncrypted;
}
        
function getUrl (path, params = {}) {
        /*
        Creates URL
        Parameters
        ----------
        path : str
            The target path of the url (e.g '/v3/search/')
        params : dict
            Dictionary containing parameters for request

        Returns
        -------
        url : str
            The url for the request
        */
  params['devid'] = dev_id
  var str = "";
  for (var key in params) {
      if (str != "") {
          str += "&";;
      }
      str += key + "=" + encodeURIComponent(params[key]);
  }
  var query = "?" + str;
  var pathAndQuery = path + query;
  var hexSignature = calculateSignature(pathAndQuery);
  return protoc + baseURL + pathAndQuery + "&signature=" + hexSignature;
  // return url;
}
        
async function callApi (path, params = {}) {
        /*
        Calls API
        Parameters
        ----------
        path : str
            The target path of the url (e.g '/v3/search/')
        params : dict
            Dictionary containing parameters for request
        
        Returns
        -------
        response : dict
            Response of api call as dict
        */
  //response = requests.get(getUrl(path, params))
  //response.raise_for_status()
  //return response.json()
  var getPath = getUrl(path, params);
  var apiResponse = await fetch(getPath);
  var apiJson = await apiResponse.json()
  return apiJson
}

function doSomethingWithData (data) { // Maybe obsolete?
  console.log(data);
  apiReturnData = data;
}
    
function getDeparturesFromStop (route_type, stop_id, route_id=null, direction_id=null, max_results=null, expand=null, platform_numbers=null, look_backwards=null, gtfs=null, date_utc=null, include_cancelled=null) {
        /*
        View departures from a stop
        Parameters
        ----------
        route_type : integer
            Number identifying transport mode; values returned via RouteTypes API
        stop_id : integer
            Identifier of stop; values returned by Stops API
        
        Optional Parameters
        -------------------
        route_id : string
            Identifier of route; values returned by RoutesAPI - v3/routes
        platform_numbers : Array[integer]
            Filter by platform number at stop
        direction_id : integer
            Filter by indentifier of direction of travel; values returned by Directions Api - /v3/directions/route/{route_id}
        look_backwards : boolean
            Indicates if filtering runs (and their departures) to those that arrive at destination before date_utc (functionault = false). Requires max_results > 0.
        gtfs : boolean
            Indicates that stop_id parameter will accept "GTFS stop_id" data
        date_utc : string
            Filter by the date and time of the request (ISO 8601 UTC format) (functionault = current date and time)
        max_results : integer
            Maximum number of results returned
        include_cancelled : boolean
            Indicates if cancelled services (if they exist) are returned (functionault = false) - metropolitan train only
        expand : Array[string]
            List objects to be returned in full (i.e. expanded) - options include: all, stop, route, run, direction, disruption
        Returns
        -------
        Departures : dict
            Dictionary of departures
        */
    var path = `/v3/departures/route_type/${route_type}/stop/${stop_id}`;
    var params = {};
    if (route_id) {
        path += `/route/${route_id}`;
    }
    if (platform_numbers) {
        params['platform_numbers'] = platform_numbers;
    }
    if (direction_id) {
        params['direction_id'] = direction_id;
    }
    if (look_backwards) {
        params['look_backwards'] = look_backwards;
    }
    if (gtfs) {
        params['gtfs'] = strgtfs.toLowerCase();
    }
    if (date_utc) {
        params['date_utc'] = date_utc;
    }
    if (max_results) {
        params['max_results'] = max_results;
    }
    if (include_cancelled) {
        params['include_cancelled'] = include_cancelled.toLowerCase();
    }
    if (expand) {
        params['expand'] = expand.toLowerCase();
    }
    return callApi(path, params)
}

    function getDirectionForRoute(route_id, route_type=null) {
        /*
        View directions for route
        Parameters
        ----------
        route_id : int
            Identifier of route; values returned by Routes API - v3/routes
        
        Optional Parameters
        -------------------
        route_type : int
            Number identifying transport mode; values returned via RouteTypes API
        Returns
        -------
        Directions : dict
            The directions that a specified route travels in.
        */
        var path = `/v3/directions/route/${route_id}`;
        var params = {};
        if (route_type) {
            path += `/route_type/${route_type}`;
        }
        return callApi(path, params)
}

    function getRouteForDirection(direction_id) {
        /*
        View all routes for direction.
        Parameters
        ----------
        direction_id : int
            Identifier of direction of travel; values returned by Directions API - /v3/directions/route/{route_id}
        
        Returns
        -------
        Routes : dict
            All routes that travel in the specified direction.
        */
        var path = `/v3/directions/${direction_id}`;
        var params = {};
        return callApi(path, params)
}
    
    function getDisruptions(route_id=null, stop_id=null, disruption_status=null) {
        /*
        View all disruptions
        
        Optional Parameters
        -------------------
        route_id : int
            Identifier of route; values returned by Routes API - v3/routes
        stop_id : int            	
            Identifier of stop; values returned by Stops API - v3/stops
        disruption_status : str
            Filter by status of disruption
        
        Returns
        -------
        disruptions : dict
            All disruption information (if any exists).
        */
        var path = "/v3/disruptions";
        var params = {};
        if (route_id) {
            path += `/route/${route_id}`;
        }
        if (stop_id) {
            path += `/stop/${stop_id}`;
        }
        if (disruption_status) {
            params['disruption_status'] = disruption_status;
        }
        return callApi(path, params)
}

    function getDisruption(disruption_id) {
        /*
        View a specific disruption
        Parameters
        ----------
        disruption_id : int
            Identifier of disruption; values returned by Disruptions API - /v3/disruptions OR /v3/disruptions/route/{route_id}
        
        Returns
        -------
        disruptions : dict
            Disruption information for the specified disruption ID.
        */
        var path = `/v3/disruptions/${disruption_id}`;
        var params = {};
        return callApi(path, params)
}

    function getDisruptionModes() {
        /*
        Get all disruption modes
        Returns
        -------
        modes : dict
            Disruption specific modes
        */
        var path = "/v3/disruptions/modes";
        var params = {};
        return callApi(path, params)
}
    
    function getOutlets(latitude=null, longitude=null, max_distance=null, max_results=null) {
        /*
        List all ticket outlets
        Optional Parameters
        -------------------
        latitude : int
            Geographic coordinate of latitude
        longitude : int
            Geographic coordinate of longitude
        max_distance : int
            Maximum number of results returned 
        max_results : int
            Maximum number of results returned (functionault = 30)
        
        Returns
        -------
        outlets : dict
            Ticket outlets
        */
        var path = "/v3/outlets";
        var params = {};
        if (latitude && longitude) {
            path += `/location/${latitude},${longitude}`;
        }
        if (max_distance) {
            params['max_distance'] = max_distance;
        }
        if (max_results) {
            params['max_results'] = max_results;
        }
        return callApi(path, params)
}

    function get_pattern(run_id, route_type, expand, stop_id=null, date_utc=null) {
        /*
        View the stopping pattern for a specific trip/service run
        Parameters
        ----------
        run_id : int
            Identifier of a trip/service run; values returned by Runs API - /v3/route/{route_id} and Departures API
        route_type : int
            Number identifying transport mode; values returned via RouteTypes API
        expand : Array[str]
            Objects to be returned in full (i.e. expanded) - options include: all, stop, route, run, direction, disruption. By functionault disruptions are expanded.
        
        Optional Parameters
        -------------------
        stop_id : int
            Filter by stop_id; values returned by Stops API
        date_utc : str
            Filter by the date and time of the request (ISO 8601 UTC format)
        Returns
        -------
        pattern : dict
            The stopping pattern of the specified trip/service run and route type.
        */
        var path = `/v3/pattern/run/{run_id}/route_type/${route_type}`;
        var params = {};
        params['expand'] = expand;
        if (stop_id) {
            params['stop_id'] = stop_id;
        }
        if (date_utc) {
            params['date_utc'] = date_utc;
        }
        return callApi(path, params)
}
    
    function getRoutes(route_types=null, route_name=null) {
        /*
        View route names and numbers for all routes
        Optional Parameters
        -------------------
        route_types : Array[int]
            Filter by route_type; values returned via RouteTypes API
        route_name : str
            Filter by name of route (accepts partial route name matches)
        
        Returns
        -------
        routes : dict
            Route names and numbers for all routes of all route types.
        */
        var path = "/v3/routes";
        var params = {};
        if (route_types) {
            params['route_types'] = route_types;
        }
        if (route_name) {
            params['route_name'] = route_name;
        }
        return callApi(path, params)
}

    function getRoute(route_id) {
        /*
        View route name and number for specific route ID
        Parameters
        ----------
        route_id : int
            Identifier of route; values returned by Departures, Directions and Disruptions APIs
        
        Returns
        -------
        route : dict
            The route name and number for the specified route ID.
        */
        var path = `/v3/routes/${route_id}`;
        var params = {};
        return callApi(path, params)
}

    function getRouteTypes() {
        /*
        View all route types and their names
        Returns
        -------
        RouteTypes : dict
            All route types (i.e. identifiers of transport modes) and their names.
        */
        var path = "/v3/route_types";
        var params = {};
        return callApi(path, params)
}
    
    function getRun(run_id, route_type=null) {
        /*
        View the trip/service for a specific run ID and route type
        Parameters
        ----------
        run_id : int
            Identifier of a trip/service run; values returned by Runs API - /v3/route/{route_id} and Departures API
        Optional Parameters
        -------------------
        route_type : int
            Number identifying transport mode; values returned via RouteTypes API
        Returns
        -------
        run : dict
            The trip/service run details for the run ID and route type specified.
        */
        var path = `/v3/runs/${run_id}`;
        var params = {};
        if (route_type) {
            path += `/route_type/${route_type}`;;
        }
        return callApi(path, params)
}

    function getRunsForRoute(route_id, route_type=null) {
        /*
        View all trip/service runs for a specific route ID
        Parameters
        ----------
        route_id : int
            Identifier of route; values returned by Routes API - v3/routes.
        Optional Parameters
        -------------------
        route_type : int
            Number identifying transport mode; values returned via RouteTypes API
        Returns
        -------
        runs : dict
            All trip/service run details for the specified route ID.
        */
        var path = `/v3/runs/route/${route_id}`;
        var params = {};
        if (route_type) {
            path += `/route_type/${route_type}`;;
        }
        return callApi(path, params)
}

    function search(search_term, route_types=null, latitude=null, longitude=null, max_distance=null, include_addresses=null, include_outlets=null, match_stop_by_suburb=null, match_route_by_suburb=null, match_stop_by_gtfs_stop_id=null) {
        /*
        View stops, routes and myki outlets that match the search term
        Parameters
        ----------
        search_term : str
            Search text (note: if search text is numeric and/or less than 3 characters, the API will only return routes)
        
        Optional Parameters
        -------------------
        route_types : Array[int]
            Filter by route_type; values returned via RouteTypes API (note: stops and routes are ordered by route_types specified)
        latitude : float
            Filter by geographic coordinate of latitude
        longitude : float
            Filter by geographic coordinate of longitude
        max_distance : float
            Filter by maximum distance (in metres) from location specified via latitude and longitude parameters
        include_addresses : bool
            Placeholder for future development; currently unavailable
        include_outlets : bool
            Indicates if outlets will be returned in response (functionault = true)
        match_stop_by_suburb : bool
            Indicates whether to find stops by suburbs in the search term (functionault = true)
        match_route_by_suburb : bool
            Indicates whether to find routes by suburbs in the search term (functionault = true)
        match_stop_by_gtfs_stop_id : bool
            Indicates whether to search for stops according to a metlink stop ID (functionault = false)
        
        Returns
        -------
        SearchResponse : dict
            Stops, routes and myki ticket outlets that contain the search term (note: stops and routes are ordered by route_type by functionault).
        */
        var path = `/v3/search/${encodeURI(search_term)}`;
        var params = {};
        if (route_types) {
            params['route_types'] = route_types;
        }
        if (latitude) {
            params['latitude'] = latitude;
        }
        if (longitude) {
            params['longitude'] = longitude;
        }
        if (max_distance) {
            params['max_distance'] = max_distance;
        }
        if (include_addresses != null) {
            params['include_addresses'] = include_addresses.toLowerCase();
        }
        if (include_outlets != null) {
            params['include_outlets'] = include_outlets.toLowerCase();
        }
        if (match_stop_by_suburb != null) {
            params['match_stop_by_suburb'] = match_stop_by_suburb.toLowerCase();
        }
        if (match_route_by_suburb != null) {
            params['match_route_by_suburb'] = match_route_by_suburb.toLowerCase();
        }
        if (match_stop_by_gtfs_stop_id != null) {
            params['match_stop_by_gtfs_stop_id'] = match_stop_by_gtfs_stop_id.toLowerCase();
        }
        return callApi(path, params)
}

    function getStop(stop_id, route_type, stop_location=null, stop_amenities=null, stop_accessibility=null, stop_contact=null, stop_ticket=null, gtfs=null, stop_staffing=null, stop_disruptions=null) {
        /*
        View facilities at a specific stop (Metro and V/Line stations only)
        Parameters
        ----------
        stop_id : int
            Identifier of stop; values returned by Stops API
        route_type : int
            Number identifying transport mode; values returned via RouteTypes API
        Optional Parameters
        -------------------
        stop_location : bool
            Indicates if stop location information will be returned (functionault = false)
        stop_amenities : bool  
            Indicates if stop amenity information will be returned (functionault = false)
        stop_accessibility : bool
            Indicates if stop accessibility information will be returned (functionault = false)
        stop_contact : bool
            Indicates if stop contact information will be returned (functionault = false)
        stop_ticket : bool
            Indicates if stop ticket information will be returned (functionault = false)
        gtfs : bool
            Incdicates whether the stop_id is a GTFS ID or not
        stop_staffing : bool
            Indicates if stop staffing information will be returned (functionault = false)
        stop_disruptions : bool
            Indicates if stop disruption information will be returned (functionault = false)
        Returns
        -------
        Stop : dict
            Stop location, amenity and accessibility facility information for the specified stop (metropolitan and V/Line stations only).
        */
        var path = `/v3/stops/{stop_id}/route_type/${route_type}`;
        var params = {};
        if (stop_location != null) {
            params['stop_location'] = stop_location.toLowerCase();
        }
        if (stop_amenities != null) {
            params['stop_amenities'] = stop_amenities.toLowerCase();
        }
        if (stop_accessibility != null) {
            params['stop_accessibility'] = stop_accessibility.toLowerCase();
        }
        if (stop_contact != null) {
            params['stop_contact'] = stop_contact.toLowerCase();
        }
        if (stop_ticket != null) {
            params['stop_ticket'] = stop_ticket.toLowerCase();
        }
        if (gtfs != null) {
            params['gtfs'] = gtfs.toLowerCase();
        }
        if (stop_staffing != null) {
            params['stop_staffing'] = stop_staffing.toLowerCase();
        }
        if (stop_disruptions != null) {
            params['stop_disruptions'] = stop_disruptions.toLowerCase();
        }
        return callApi(path, params)
}

    function getStopsForRoute(route_id, route_type, direction_id=null, stop_disruptions=null) {
        /*
        View all stops on a specific route
        Parameters
        ----------
        route_id : int
            Identifier of route; values returned by Routes API - v3/routes
        route_type : int
            Number identifying transport mode; values returned via RouteTypes API
        Optional Parameters
        -------------------
        direction_id : int
            An optional direction; values returned by Directions API. When this is set, stop sequence information is returned in the response.
        stop_disruptions : bool
            Indicates if stop disruption information will be returned (functionault = false)
        Returns
        -------
        stops : dict
            All stops on the specified route.
        */
        var path = `/v3/stops/route/${route_id}/route_type/${route_type}`;
        var params = {};
        if (direction_id) {
            params['direction_id'] = direction_id;
        }
        if (stop_disruptions) {
            params['stop_disruptions'] = stop_disruptions.toLowerCase();
        }
        return callApi(path, params)
}

    function getStopsForLocation(latitude, longitude, route_types=null, max_results=null, max_distance=null, stop_disruptions=null) {
        /*
        View all stops near a specific location
        Parameters
        ----------
        latitude : float
            Geographic coordinate of latitude
        longitude : float
            Geographic coordinate of longitude
        Optional Parameters
        -------------------
        route_types : Array[int]
            Filter by route_type; values returned via RouteTypes API
        max_results : int
            Maximum number of results returned (functionault = 30)
        max_distance : double  
            Filter by maximum distance (in metres) from location specified via latitude and longitude parameters (functionault = 300)
        stop_disruptions : bool
            Indicates if stop disruption information will be returned (functionault = false)
        Returns
        -------
        stops : dict
            All stops near the specified location.
        */
        var path = `/v3/stops/location/${latitude},${longitude}`;
        var params = {};
        if (route_types) {
            params['route_types'] = route_types;
        }
        if (max_results) {
            params['max_results'] = max_results;
        }
        if (max_distance) {
            params['max_distance'] = max_distance;
        }
        if (stop_disruptions) {
            params['stop_disruptions'] = stop_disruptions;
        }
        return callApi(path, params)
}

async function getDeparturesBetweenTwoStops (stopId1, stopId2, route_type=[0]) {
  var resultsArray = [];
  var stop1departures = await getDeparturesFromStop(route_type,stopId1,null,null,5);
  var stop2departures = await getDeparturesFromStop(route_type,stopId2,null,null,5);
  loop1:
  for (var stop1departure of stop1departures.departures) {
    loop2:
    for (var stop2departure of stop2departures.departures) {
      if (stop1departure.run_id === stop2departure.run_id) {
        resultsArray.push(stop1departure);
        if (resultsArray.length === 3) {
          break loop1;
        }
      }
    }
  }
  return resultsArray
}

// function nextDeparturesFlindersToER(x) {
//   getDeparturesFromStop([0],1071,null,null,5,'runs')

//   var nextDepartures = apiReturnData.departures.filter(
//     function(item) {
//     var r = item.route_id;
//     var d = item.direction_id;
//     var u = item.run_id;
//     if (r===1 || r===2 || r===7 || r===9 && d !== 1 && this.runs[u].express_stop_count === 0) {
//         return true
//     }
//   }, apiReturnData);

//   for (var i=0; i<3; i++) {
//   console.log(nextDepartures[i]);
//   }
// }
