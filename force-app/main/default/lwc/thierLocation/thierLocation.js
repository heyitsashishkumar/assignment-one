import { LightningElement, wire } from 'lwc';
import fetchRecordAddress from '@salesforce/apex/CRMSearch.fetchRecordAddress';

// Import message service features required for subscribing and the message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

export default class ThierLocation extends LightningElement {
    mapMarkers = [];

    // By using the MessageContext @wire adapter, unsubscribe will be called
    // implicitly during the component descruction lifecycle.
    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            RECORD_SELECTED_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        console.log('Message: ' + JSON.stringify(message));
        this.handleFetchRecordAddress(message.recordId, message.recordType);
    }

    async handleFetchRecordAddress(recordId, recordType) {
        try {
            let record = JSON.parse(await fetchRecordAddress({ recordId, recordType }));
            console.log('Record: ' + JSON.stringify(record));

            this.mapMarkers = [{
                location: {
                    Latitude: record.lat,
                    Longitude: record.lon
                },
            }];

            console.log('Map Markers: ' + JSON.stringify(this.mapMarkers));

        } catch (error) {
            console.log('Error: ' + JSON.stringify(error));
        }
    }

}