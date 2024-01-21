import { LightningElement } from 'lwc';
import search from '@salesforce/apex/CRMSearch.search';

export default class CrmPicklist extends LightningElement {
    searchResults = [];
    showDropdown = false;

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
    }

    async handleSearch(searchInput) {
        try {
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
            this.showDropdown = true;
        } catch (error) {
            console.log('Error: ' + error);
        }
    }
}