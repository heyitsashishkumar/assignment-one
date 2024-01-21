import { LightningElement, api } from 'lwc';
import fetchRecord from '@salesforce/apex/CRMSearch.fetchRecord';

export default class RecordCard extends LightningElement {
    @api selectedRecord;
    recordToShow;

    connectedCallback() {
        console.log('Selected Record in child: ' + JSON.stringify(this.selectedRecord));
        this.handleFetchRecord(this.selectedRecord.id, this.selectedRecord.type);
    }

    async handleFetchRecord(recordId, recordType) {
        try {
            let record = await fetchRecord({ recordId, recordType });
            console.log('Record: ' + record);
            // Record is like this:
            // {
            //     "attributes" : {
            //         "type" : "Contact",
            //         "url" : "/services/data/v59.0/sobjects/Contact/0031y00000ZGdNsAAL"
            //     },
            //     "Id" : "0031y00000ZGdNsAAL",
            //     "Name" : "Andy Young",
            //     "Email" : "a_young@dickenson.com"
            // }

            let fields = [];
            for(let [key, value] of Object.entries(JSON.parse(record))) {
                console.log('Key: ' + key);
                console.log('Value: ' + value);
                if(key !== 'attributes') {
                    fields.push({ label: key, value: value });
                }
            }

            this.recordToShow = {
                fields: fields,
                type: recordType,
                icon: `standard:${recordType.toLowerCase()}`
            };

        } catch (error) {
            console.log('Error: ' + JSON.stringify(error));
        }
    }
}