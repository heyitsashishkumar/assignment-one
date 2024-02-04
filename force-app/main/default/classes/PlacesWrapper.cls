public with sharing class PlacesWrapper {
    public Feature[] features;

    public class Feature {
        public Properties properties;
	}

    public class Properties {
        public String name;
        public String[] categories;
        public String lat;
        public String lon;
        public String address_line1;
        public String address_line2;
        public DataSource datasource;
    }

    public class DataSource {
        public Map<String, String> raw;
    }
}