import { LightningElement } from 'lwc';
import search from '@salesforce/apex/CRMSearch.search';

export default class CrmPicklist extends LightningElement {
    searchResults = [];
    showPicklist = false;
    isProcessingPicklist = false;

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

    handleRecordSelect(event) {
        console.log('rec is: ' + event.currentTarget.dataset);
        console.log('rec Id  is: ' + event.currentTarget.dataset.id);
    }

    async handleSearch(searchInput) {
        try {
            this.isProcessingPicklist = true;

            let results = (JSON.parse(await search({ searchKey: searchInput }))).flat();

            results.forEach(result => {
                let rec = {};

                if (result.attributes.type === "Contact") {
                    rec.name = result.Name;
                    rec.type = result.attributes.type;
                    rec.id = result.Id;
                } else if (result.attributes.type === "Account") {
                    rec.name = result.Name;
                    rec.type = result.attributes.type;
                    rec.id = result.Id;
                } else if (result.attributes.type === "Lead") {
                    rec.name = result.Name;
                    rec.type = result.attributes.type;
                    rec.id = result.Id;
                }

                this.searchResults.push(rec);
            });

            console.log('searchResults: ' + this.searchResults);

            this.showPicklist = true;
            this.isProcessingPicklist = false;
        } catch (error) {
            console.log('Error: ' + error);
        }
    }
}