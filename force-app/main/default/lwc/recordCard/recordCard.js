import { LightningElement, api, wire } from 'lwc';
import fetchRecord from '@salesforce/apex/CRMSearch.fetchRecord';

// Import message service features required for publishing and the message channel
import { publish, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

export default class RecordCard extends LightningElement {
    @api selectedRecord;
    recordToShow;

    @wire(MessageContext)
    messageContext;

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
                icon: `standard:${recordType.toLowerCase()}`,
                recordId: recordId
            };

        } catch (error) {
            console.log('Error: ' + JSON.stringify(error));
        }
    }

    handleRecordSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordType = event.currentTarget.dataset.type;
        console.log('Record Id: ' + recordId);
        console.log('Record Type: ' + recordType);

        // Publish the message to the message channel
        const payload = { recordId, recordType };
        publish(this.messageContext, RECORD_SELECTED_CHANNEL, payload);
    }

    handleClose() {
        const event = new CustomEvent('close');
        this.dispatchEvent(event);
    }
}