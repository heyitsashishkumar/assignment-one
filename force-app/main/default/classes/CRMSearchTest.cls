@isTest
public with sharing class CRMSearchTest {
  @TestSetup
  static void setup() {
    // Create a new contact with sample address
    List<Contact> contacts = new List<Contact>();

    Contact contact1 = new Contact();
    contact1.FirstName = 'John';
    contact1.LastName = 'Doe';
    contact1.Email = 'test@gmail.com';
    contact1.MailingStreet = '123 Main St';
    contact1.MailingCity = 'San Francisco';
    contact1.MailingState = 'CA';
    contact1.MailingPostalCode = '94105';
    contact1.MailingCountry = 'USA';

    contacts.add(contact1);

    // Insert the contact
    insert contacts;

    // Create a new account with sample address
    List<Account> accounts = new List<Account>();

    Account account1 = new Account();
    account1.Name = 'Test Account';
    account1.BillingStreet = '123 Main St';
    account1.BillingCity = 'San Francisco';
    account1.BillingState = 'CA';
    account1.BillingPostalCode = '94105';
    account1.BillingCountry = 'USA';

    accounts.add(account1);

    // Insert the account
    insert accounts;

    // Create a new lead with sample address
    List<Lead> leads = new List<Lead>();

    Lead lead1 = new Lead();
    lead1.FirstName = 'John';
    lead1.LastName = 'Doe';
    lead1.Email = 'test@gmail.com';
    lead1.Street = '123 Main St';
    lead1.City = 'San Francisco';
    lead1.State = 'CA';
    lead1.PostalCode = '94105';
    lead1.Country = 'USA';
    lead1.Company = 'Test Company';

    leads.add(lead1);

    // Insert the lead
    insert leads;
  }

  @isTest
  static void testSearch() {
    Account account = [
      SELECT
        Id,
        Name,
        BillingStreet,
        BillingCity,
        BillingState,
        BillingPostalCode,
        BillingCountry
      FROM Account
    ];

    List<Id> expectedIds = new List<Id>();
    expectedIds.add(account.Id);

    Test.setFixedSearchResults(expectedIds);

    Test.startTest();
    String searchResult = CRMSearch.search('Test Account');
    System.debug('Search result: ' + searchResult);

    System.assertEquals(
      true,
      searchResult.contains('"Name" : "Test Account"'),
      'Search result should contain the account name'
    );
    System.assertEquals(
      true,
      searchResult.contains(account.Id),
      'Search result should contain the account Id'
    );
    Test.stopTest();
  }

  @isTest
  static void testFetchRecordContact() {
    Contact contact = [
      SELECT
        Id,
        FirstName,
        LastName,
        Email,
        MailingStreet,
        MailingCity,
        MailingState,
        MailingPostalCode,
        MailingCountry
      FROM Contact
    ];

    Test.startTest();
    String searchResult = CRMSearch.fetchRecord(contact.Id, 'Contact');
    System.debug('Search result: ' + searchResult);
    System.debug('Contains or not?: ' + searchResult.contains('John Doe'));

    System.assertEquals(
      true,
      searchResult.contains('John Doe'),
      'Search result should contain the contact name'
    );
    System.assertEquals(
      true,
      searchResult.contains(contact.Id),
      'Search result should contain the contact Id'
    );
    Test.stopTest();
  }

  @isTest
  static void testFetchRecordAccount() {
    Account account = [
      SELECT
        Id,
        Name,
        BillingStreet,
        BillingCity,
        BillingState,
        BillingPostalCode,
        BillingCountry
      FROM Account
    ];

    Test.startTest();
    String searchResult = CRMSearch.fetchRecord(account.Id, 'Account');
    System.debug('Search result: ' + searchResult);
    System.debug('Contains or not?: ' + searchResult.contains('Test Account'));

    System.assertEquals(
      true,
      searchResult.contains('Test Account'),
      'Search result should contain the account name'
    );
    System.assertEquals(
      true,
      searchResult.contains(account.Id),
      'Search result should contain the account Id'
    );
    Test.stopTest();
  }

  @isTest
  static void testFetchRecordLead() {
    Lead lead = [
      SELECT
        Id,
        FirstName,
        LastName,
        Email,
        Street,
        City,
        State,
        PostalCode,
        Country,
        Company
      FROM Lead
    ];

    Test.startTest();
    String searchResult = CRMSearch.fetchRecord(lead.Id, 'Lead');
    System.debug('Search result: ' + searchResult);
    System.debug('Contains or not?: ' + searchResult.contains('John Doe'));

    System.assertEquals(
      true,
      searchResult.contains('John Doe'),
      'Search result should contain the lead name'
    );
    System.assertEquals(
      true,
      searchResult.contains(lead.Id),
      'Search result should contain the lead Id'
    );
    Test.stopTest();
  }

  @isTest
  static void testFetchRecordAddressContact() {
    Contact contact = [
      SELECT
        Id,
        FirstName,
        LastName,
        Email,
        MailingStreet,
        MailingCity,
        MailingState,
        MailingPostalCode,
        MailingCountry
      FROM Contact
    ];

    Test.setMock(HttpCalloutMock.class, new CRMSearchMockRespGenerator());

    Test.startTest();
    String searchResult = CRMSearch.fetchRecordAddress(contact.Id, 'Contact');
    System.debug('Record Address: ' + searchResult);

    System.assert(
      searchResult.contains('"lon" : "-122.67742142857142"'),
      'Longitude should be present'
    );
    System.assert(
      searchResult.contains('"lat" : "45.519294183673466"'),
      'Latitude should be present'
    );
  }

  @isTest
  static void testFetchRecordAddressAccount() {
    Account account = [
      SELECT
        Id,
        Name,
        BillingStreet,
        BillingCity,
        BillingState,
        BillingPostalCode,
        BillingCountry
      FROM Account
    ];

    Test.setMock(HttpCalloutMock.class, new CRMSearchMockRespGenerator());

    Test.startTest();
    String searchResult = CRMSearch.fetchRecordAddress(account.Id, 'Account');
    System.debug('Record Address: ' + searchResult);

    System.assert(
      searchResult.contains('"lon" : "-122.67742142857142"'),
      'Longitude should be present'
    );
    System.assert(
      searchResult.contains('"lat" : "45.519294183673466"'),
      'Latitude should be present'
    );
  }

  @isTest
  static void testFetchRecordAddressLead() {
    Lead lead = [
      SELECT
        Id,
        FirstName,
        LastName,
        Email,
        Street,
        City,
        State,
        PostalCode,
        Country,
        Company
      FROM Lead
    ];

    Test.setMock(HttpCalloutMock.class, new CRMSearchMockRespGenerator());

    Test.startTest();
    String searchResult = CRMSearch.fetchRecordAddress(lead.Id, 'Lead');
    System.debug('Record Address: ' + searchResult);

    System.assert(
      searchResult.contains('"lon" : "-122.67742142857142"'),
      'Longitude should be present'
    );
    System.assert(
      searchResult.contains('"lat" : "45.519294183673466"'),
      'Latitude should be present'
    );
  }

  @isTest
  static void testFetchRecordAddressError() {
    Contact contact = [
      SELECT
        Id,
        FirstName,
        LastName,
        Email,
        MailingStreet,
        MailingCity,
        MailingState,
        MailingPostalCode,
        MailingCountry
      FROM Contact
    ];

    CRMSearchMockRespGenerator.isSuccess = false;
    Test.setMock(HttpCalloutMock.class, new CRMSearchMockRespGenerator());

    Test.startTest();
    String searchResult = CRMSearch.fetchRecordAddress(contact.Id, 'Contact');
    System.debug('Record Address: ' + searchResult);

    System.assertEquals('', searchResult, 'Empty response should be returned');
  }

  @isTest
  static void testFetchNearbyPlaces() {
    Test.setMock(HttpCalloutMock.class, new CRMSearchMockRespGenerator());

    List<String> categories = new List<String>();
    categories.add('accommodation');
    categories.add('accommodation.hotel');

    Test.startTest();
    String searchResult = CRMSearch.fetchNearbyPlaces(
      '8440',
      categories,
      '45.519294183673466',
      '-122.67742142857142'
    );
    System.debug('Nearby Places: ' + searchResult);
    System.assert(
      searchResult.contains('"name" : "Kennedy School",'),
      'Kennedy School should be present'
    );
    Test.stopTest();
  }

  @isTest
  static void testFetchNearbyPlacesError() {
    CRMSearchMockRespGenerator.isSuccess = false;
    Test.setMock(HttpCalloutMock.class, new CRMSearchMockRespGenerator());

    List<String> categories = new List<String>();
    categories.add('accommodation');
    categories.add('accommodation.hotel');

    Test.startTest();
    String searchResult = CRMSearch.fetchNearbyPlaces(
      '8440',
      categories,
      '45.519294183673466',
      '-122.67742142857142'
    );
    System.debug('Nearby Places: ' + searchResult);
    System.assertEquals('', searchResult, 'Empty response should be returned');
    Test.stopTest();
  }
}
