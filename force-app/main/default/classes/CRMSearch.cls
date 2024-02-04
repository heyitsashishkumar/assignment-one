public with sharing class CRMSearch {
    
    @AuraEnabled
    public static String search(String searchKey) {
        String searchTerm = searchKey + '*';

        List<List<SObject>> searchResp = [FIND :searchTerm IN NAME FIELDS RETURNING Contact(Name, Email, MailingAddress), Lead(Name, Email, Address), Account(Name, Website, Industry)];

        System.debug(searchResp);

        System.debug(JSON.serializePretty(searchResp));

        return JSON.serializePretty(searchResp);
    }

    @AuraEnabled
    public static String fetchRecord(String recordId, String recordType) {
        SObject record;
        if (recordType == 'Contact') {
            record = [SELECT Id, Name, Email FROM Contact WHERE Id = :recordId];
        } else if (recordType == 'Lead') {
            record = [SELECT Id, Name, Email, Company FROM Lead WHERE Id = :recordId];
        } else if (recordType == 'Account') {
            record = [SELECT Id, Name, Website, Industry FROM Account WHERE Id = :recordId];
        }

        return JSON.serializePretty(record);
    }

    @AuraEnabled
    public static String fetchRecordAddress(String recordId, String recordType) {
        System.debug(recordId);
        System.debug(recordType);
        String address = '';
        if (recordType == 'Contact') {
            Contact record = [SELECT Id, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contact WHERE Id = :recordId];
            System.debug(record);

            address += record.MailingStreet != null ? record.MailingStreet + ', ' : '';
            address += record.MailingCity != null ? record.MailingCity + ', ' : '';
            address += record.MailingState != null ? record.MailingState + ', ' : '';
            address += record.MailingPostalCode != null ? record.MailingPostalCode + ', ' : '';
            address += record.MailingCountry != null ? record.MailingCountry : '';

        } else if (recordType == 'Lead') {
            Lead record = [SELECT Id, Street, City, State, PostalCode, Country FROM Lead WHERE Id = :recordId];
            System.debug(record);

            address += record.Street != null ? record.Street + ', ' : '';
            address += record.City != null ? record.City + ', ' : '';
            address += record.State != null ? record.State + ', ' : '';
            address += record.PostalCode != null ? record.PostalCode + ', ' : '';
            address += record.Country != null ? record.Country : '';

        } else if (recordType == 'Account') {
            Account record = [SELECT Id, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry FROM Account WHERE Id = :recordId];
            System.debug(record);

            address += record.BillingStreet != null ? record.BillingStreet + ', ' : '';
            address += record.BillingCity != null ? record.BillingCity + ', ' : '';
            address += record.BillingState != null ? record.BillingState + ', ' : '';
            address += record.BillingPostalCode != null ? record.BillingPostalCode + ', ' : '';
            address += record.BillingCountry != null ? record.BillingCountry : '';

        }

        System.debug(address);
        String fetchedAddress = fetchGeolocation(address);

        RecordAddressWrapper obj = new RecordAddressWrapper();
        obj = (RecordAddressWrapper)JSON.deserialize(fetchedAddress, RecordAddressWrapper.class);

        System.debug(obj.features[0].properties.country_code);

        Coordinates coords = new Coordinates(obj.features[0].properties.lat, obj.features[0].properties.lon);

        return JSON.serializePretty(coords);
    }

    class Coordinates {
        public String lat;
        public String lon;

        public Coordinates(String lat, String lon) {
            this.lat = lat;
            this.lon = lon;
        }
    }

    private static String fetchGeolocation(String address) {
        String url = 'https://api.geoapify.com/v1/geocode/search?text=' + EncodingUtil.urlEncode(address, 'UTF-8') + '&apiKey=81177a9a30f24a3fa78163f2cb9d5e8b';

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(url);
        request.setMethod('GET');

        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 200){
            return response.getBody();
        } else {
            System.debug('The status code returned was not expected: ' + response.getStatusCode() + ' ' + response.getStatus());
            return '';
        }
    }

    @AuraEnabled
    public static string fetchNearbyPlaces(
        String radius,
        String[] categories,
        String lat,
        String lon
    ) {
        String url = 'https://api.geoapify.com/v2/places?categories=' + String.join(categories, ',') + '&limit=20&filter=circle:' + lon + ',' + lat + ',' + radius + '&apiKey=81177a9a30f24a3fa78163f2cb9d5e8b';
        System.debug(url);

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(url);
        request.setMethod('GET');

        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 200){
            PlacesWrapper obj = new PlacesWrapper();
            obj = (PlacesWrapper)JSON.deserialize(response.getBody(), PlacesWrapper.class);

            return JSON.serializePretty(obj);
        } else {
            System.debug('The status code returned was not expected: ' + response.getStatusCode() + ' ' + response.getStatus());
            return '';
        }
    }
}