public with sharing class CRMSearch {
    
    @AuraEnabled(cacheable=true)
    public static String search(String searchKey) {
        String searchTerm = searchKey + '*';

        List<List<SObject>> searchResp = [FIND :searchTerm IN NAME FIELDS RETURNING Contact(Name, Email, MailingAddress), Lead(Name, Email, Address), Account(Name, Website, Industry)];

        System.debug(searchResp);

        System.debug(JSON.serializePretty(searchResp));

        return JSON.serializePretty(searchResp);
    }

    @AuraEnabled(cacheable=true)
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
}