import { LightningElement } from 'lwc';
import Toast from 'lightning/toast';
import search from '@salesforce/apex/CRMSearch.search';

export default class CrmPicklist extends LightningElement {
    searchResults = [];
    selectedRecord;
    showDropdown = false;
    showLoadingSpinner = false;
    noRecordsFound = false;


    handleChange(event) {
        let searchInput = event.target.value;
        console.log('Search Input: ' + searchInput);

        if (searchInput) {
            // Check if searchInput is larger than 2 characters
            if (searchInput.length > 2) {
                // Call Apex method imperatively
                this.handleSearch(searchInput);
            }
        }
    }

    handleSelect(event) {
        console.log('Selected Record: ' + JSON.stringify(event.currentTarget.dataset));
        // Its like this: {"id":"00Q1y000004DWBAEA4","type":"Lead"}
        this.selectedRecord = event.currentTarget.dataset;
        this.showDropdown = false;
    }

    async handleSearch(searchInput) {
        try {
            this.showLoadingSpinner = true;
            this.showDropdown = true;
            this.noRecordsFound = false;
            let records = (JSON.parse(await search({ searchKey: searchInput }))).flat();

            let searchedRecords = [];
            records.forEach(record => {
                console.log('Record: ' + record);
                let searchedRecord = {};
                searchedRecord["name"] = record.Name;
                searchedRecord["id"] = record.Id;
                searchedRecord["type"] = record.attributes.type;
                searchedRecord["icon"] = `standard:${(record.attributes.type).toLowerCase()}`;

                if (record.attributes.type === "Contact") {
                    searchedRecord["details"] = record.Email;
                } else if (record.attributes.type === "Account") {
                    searchedRecord["details"] = record.Website;
                } else if (record.attributes.type === "Lead") {
                    searchedRecord["details"] = record.Email;
                }

                console.log('Searched Record: ' + JSON.stringify(searchedRecord));

                searchedRecords.push(searchedRecord);
            });

            this.searchResults = searchedRecords;
            this.showLoadingSpinner = false;

            if (this.searchResults.length === 0) {
                this.noRecordsFound = true;
            }
        } catch (error) {
            console.log('Error: ' + error);
        }
    }

    handleRecordClose() {
        this.selectedRecord = undefined;
    }
}