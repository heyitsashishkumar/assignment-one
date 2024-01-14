import { LightningElement } from 'lwc';
import search from '@salesforce/apex/CRMSearch.search';

export default class CrmPicklist extends LightningElement {
    searchResults;

    handleChange(event) {
        let searchInput = event.target.value;

        if (searchInput) {
            // Check if searchInput is larger than 2 characters
            if (searchInput.length > 2) {
                // Call Apex method imperatively
                this.handleSearch(searchInput);
            }
        }
    }

    async handleSearch(searchInput) {
        try {
            this.searchResults = JSON.parse(await search({ searchKey: searchInput }));
        } catch (error) {
            console.log('Error: ' + error);
        }
    }
}