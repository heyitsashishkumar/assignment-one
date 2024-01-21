public with sharing class CRMSearch {
    
    @AuraEnabled(cacheable=true)
    public static String search(String searchKey) {
        String searchTerm = searchKey + '*';

        List<List<SObject>> searchResp = [FIND :searchTerm IN NAME FIELDS RETURNING Contact(Name, Email, MailingAddress), Lead(Name, Email, Address), Account(Name, Website, Industry)];

        System.debug(searchResp);

        System.debug(JSON.serializePretty(searchResp));

        return JSON.serializePretty(searchResp);
    }
}