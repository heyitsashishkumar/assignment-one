public with sharing class RecordAddressWrapper {
    
    public String type;
    public Feature[] features;

    public class Feature {
        public Properties properties;
    }

    public class Properties {
        public String lon;
        public String lat;
        public String country_code;
    }
}