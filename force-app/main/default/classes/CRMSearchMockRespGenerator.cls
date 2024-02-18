public with sharing class CRMSearchMockRespGenerator implements HttpCalloutMock {
    public static Boolean isSuccess = true;
    
    public static HttpResponse respond(HttpRequest req) {
        System.debug('req: ' + req.getEndpoint());
        if (isSuccess) {
            if (req.getEndpoint().startsWith('https://api.geoapify.com/v1/geocode')) {
                return createFetchGeolocationResponse();
            } else {
                return createFetchNearbyPlacesResponse();
            }
        } else {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setStatus('Internal Server Error');
            return res;
        }

    }

    private static HttpResponse createFetchGeolocationResponse() {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": { "country_code": "us", "lon": -122.67742142857142, "lat": 45.519294183673466 } } ] }');
        return res;
    }

    private static HttpResponse createFetchNearbyPlacesResponse() {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setBody('{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": { "name": "Kennedy School", "lon": -122.629980725, "lat": 45.5644786, "address_line1": "Kennedy School", "address_line2": "5736 Northeast 33rd Avenue, Portland, OR 97211, United States of America", "categories": [ "accommodation", "accommodation.hotel", "building", "building.accommodation" ], "datasource": { "raw": { "ele": 49.5, "name": "Kennedy School", "brand": "McMenamins", "email": "info.ks@mcmenamins.com", "phone": "+1-503-249-3983", "height": 7.7, "osm_id": 12226748, "tourism": "hotel", "website": "https://www.mcmenamins.com/", "building": "yes", "operator": "McMenamins", "osm_type": "r", "wikidata": "Q6389685", "addr:city": "Portland", "wikipedia": "en:Kennedy School", "addr:state": "OR", "addr:street": "Northeast 33rd Avenue", "addr:postcode": 97211, "brand:wikidata": "Q6802345", "phone:tollfree": "+1-888-249-3983", "brand:wikipedia": "en:McMenamins", "building:levels": 2, "addr:housenumber": 5736 } } } } ] }');
        return res;
    }
}