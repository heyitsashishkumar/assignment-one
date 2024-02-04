import { LightningElement, wire } from 'lwc';
import fetchRecordAddress from '@salesforce/apex/CRMSearch.fetchRecordAddress';
import fetchNearbyPlaces from '@salesforce/apex/CRMSearch.fetchNearbyPlaces';

// Import message service features required for subscribing and the message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';

export default class ThierLocation extends LightningElement {
    mapMarkers = [];
    selectedMajorCategory;
    startedFindingPlaces = false;
    isFinding = false;
    nearbyPlaces;
    filters = {
        radius: 5000,
        selectedCategories: [],
    }

    // By using the MessageContext @wire adapter, unsubscribe will be called
    // implicitly during the component descruction lifecycle.
    @wire(MessageContext)
    messageContext;

    get isLocationAdded() {
        return this.mapMarkers.length > 0;
    }

    get categoryOptions() {
        return [
            { label: 'Accomodation', value: 'accommodation' },
            { label: 'Activity', value: 'activity' },
            { label: 'Commercial', value: 'commercial' },
            { label: 'Catering', value: 'catering' }
        ];
    }

    get subCategoryOptions() {
        if (this.selectedMajorCategory === 'accommodation') {
            return [
                { label: 'Hotel', value: 'accommodation.hotel' },
                { label: 'Hut', value: 'accommodation.hut' },
                { label: 'Apartment', value: 'accommodation.apartment' },
                { label: 'Chalet', value: 'accommodation.chalet' },
                { label: 'Guest House', value: 'accommodation.guest_house' },
                { label: 'Hostel', value: 'accommodation.hostel' },
                { label: 'Motel', value: 'accommodation.motel' }
            ];
        } else if (this.selectedMajorCategory === 'activity') {
            return [
                { label: 'Community Center', value: 'activity.community_center' },
                { label: 'Sport Club', value: 'activity.sport_club' }
            ];
        } else if (this.selectedMajorCategory === 'commercial') {
            return [
                { label: 'Supermarket', value: 'commercial.supermarket' },
                { label: 'Marketplace', value: 'commercial.marketplace' },
                { label: 'Shopping Mall', value: 'commercial.shopping_mall' },
                { label: 'Department Store', value: 'commercial.department_store' },
                { label: 'Electronics', value: 'commercial.elektronics' },
                { hasSubCategory: true, label: 'Outdoor and Sport' },
                { isSubCategory: true, label: ' - Water Sports', value: 'commercial.outdoor_and_sport.water_sports' },
                { isSubCategory: true, label: ' - Ski', value: 'commercial.outdoor_and_sport.ski' },
                { isSubCategory: true, label: ' - Diving', value: 'commercial.outdoor_and_sport.diving' },
                { isSubCategory: true, label: ' - Hunting', value: 'commercial.outdoor_and_sport.hunting' },
                { isSubCategory: true, label: ' - Bicycle', value: 'commercial.outdoor_and_sport.bicycle' },
                { isSubCategory: true, label: ' - Fishing', value: 'commercial.outdoor_and_sport.fishing' },
                { isSubCategory: true, label: ' - Golf', value: 'commercial.outdoor_and_sport.golf' },
                { label: 'Vehicle', value: 'commercial.vehicle' },
                { hasSubCategory: true, label: 'Hobby' },
                { isSubCategory: true, label: ' - Model', value: 'commercial.hobby.model' },
                { isSubCategory: true, label: ' - Anime', value: 'commercial.hobby.anime' },
                { isSubCategory: true, label: ' - Collecting', value: 'commercial.hobby.collecting' },
                { isSubCategory: true, label: ' - Games', value: 'commercial.hobby.games' },
                { isSubCategory: true, label: ' - Brewing', value: 'commercial.hobby.brewing' },
                { isSubCategory: true, label: ' - Photo', value: 'commercial.hobby.photo' },
                { isSubCategory: true, label: ' - Music', value: 'commercial.hobby.music' },
                { isSubCategory: true, label: ' - Sewing and Knitting', value: 'commercial.hobby.sewing_and_knitting' },
                { isSubCategory: true, label: ' - Art', value: 'commercial.hobby.art' },
                { label: 'Books', value: 'commercial.books' },
                { label: 'Gift and Souvenir', value: 'commercial.gift_and_souvenir' },
                { label: 'Stationery', value: 'commercial.stationery' },
                { label: 'Newsagent', value: 'commercial.newsagent' },
                { label: 'Tickets and Lottery', value: 'commercial.tickets_and_lottery' },
                { hasSubCategory: true, label: 'Clothing' },
                { isSubCategory: true, label: ' - Shoes', value: 'commercial.clothing.shoes' },
                { isSubCategory: true, label: ' - Clothes', value: 'commercial.clothing.clothes' },
                { isSubCategory: true, label: ' - Underwear', value: 'commercial.clothing.underwear' },
                { isSubCategory: true, label: ' - Sport', value: 'commercial.clothing.sport' },
                { isSubCategory: true, label: ' - Men', value: 'commercial.clothing.men' },
                { isSubCategory: true, label: ' - Women', value: 'commercial.clothing.women' },
                { isSubCategory: true, label: ' - Kids', value: 'commercial.clothing.kids' },
                { isSubCategory: true, label: ' - Accessories', value: 'commercial.clothing.accessories' },
                { label: 'Bag', value: 'commercial.bag' },
                { label: 'Baby Goods', value: 'commercial.baby_goods' },
                { label: 'Agrarian', value: 'commercial.agrarian' },
                { label: 'Garden', value: 'commercial.garden' },
                { hasSubCategory: true, label: 'Houseware and Hardware' },
                { isSubCategory: true, label: ' - Do It Yourself', value: 'commercial.houseware_and_hardware.doityourself' },
                { isSubCategory: true, label: ' - Hardware and Tools', value: 'commercial.houseware_and_hardware.hardware_and_tools' },
                { isSubCategory: true, label: ' - Building Materials', value: 'commercial.houseware_and_hardware.building_materials' },
                { isSubCategory: true, label: ' - Building Materials - Paint', value: 'commercial.houseware_and_hardware.building_materials.paint' },
                { isSubCategory: true, label: ' - Building Materials - Glaziery', value: 'commercial.houseware_and_hardware.building_materials.glaziery' },
                { isSubCategory: true, label: ' - Building Materials - Doors', value: 'commercial.houseware_and_hardware.building_materials.doors' },
                { isSubCategory: true, label: ' - Building Materials - Tiles', value: 'commercial.houseware_and_hardware.building_materials.tiles' },
                { isSubCategory: true, label: ' - Building Materials - Windows', value: 'commercial.houseware_and_hardware.building_materials.windows' },
                { isSubCategory: true, label: ' - Building Materials - Flooring', value: 'commercial.houseware_and_hardware.building_materials.flooring' },
                { isSubCategory: true, label: ' - Fireplace', value: 'commercial.houseware_and_hardware.fireplace' },
                { isSubCategory: true, label: ' - Swimming Pool', value: 'commercial.houseware_and_hardware.swimming_pool' },
                { label: 'Florist', value: 'commercial.florist' },
                { hasSubCategory: true, label: 'Furniture and Interior' },
                { isSubCategory: true, label: ' - Lighting', value: 'commercial.furniture_and_interior.lighting' },
                { isSubCategory: true, label: ' - Curtain', value: 'commercial.furniture_and_interior.curtain' },
                { isSubCategory: true, label: ' - Carpet', value: 'commercial.furniture_and_interior.carpet' },
                { isSubCategory: true, label: ' - Kitchen', value: 'commercial.furniture_and_interior.kitchen' },
                { isSubCategory: true, label: ' - Bed', value: 'commercial.furniture_and_interior.bed' },
                { isSubCategory: true, label: ' - Bathroom', value: 'commercial.furniture_and_interior.bathroom' },
                { label: 'Chemist', value: 'commercial.chemist' },
                { hasSubCategory: true, label: 'Health and Beauty' },
                { isSubCategory: true, label: ' - Pharmacy', value: 'commercial.health_and_beauty.pharmacy' },
                { isSubCategory: true, label: ' - Optician', value: 'commercial.health_and_beauty.optician' },
                { isSubCategory: true, label: ' - Medical Supply', value: 'commercial.health_and_beauty.medical_supply' },
                { isSubCategory: true, label: ' - Hearing Aids', value: 'commercial.health_and_beauty.hearing_aids' },
                { isSubCategory: true, label: ' - Herbalist', value: 'commercial.health_and_beauty.herbalist' },
                { isSubCategory: true, label: ' - Cosmetics', value: 'commercial.health_and_beauty.cosmetics' },
                { isSubCategory: true, label: ' - Wigs', value: 'commercial.health_and_beauty.wigs' },
                { label: 'Toy and Game', value: 'commercial.toy_and_game' },
                { label: 'Pet', value: 'commercial.pet' },
                { hasSubCategory: true, label: 'Food and Drink' },
                { isSubCategory: true, label: ' - Bakery', value: 'commercial.food_and_drink.bakery' },
                { isSubCategory: true, label: ' - Deli', value: 'commercial.food_and_drink.deli' },
                { isSubCategory: true, label: ' - Frozen Food', value: 'commercial.food_and_drink.frozen_food' },
                { isSubCategory: true, label: ' - Pasta', value: 'commercial.food_and_drink.pasta' },
                { isSubCategory: true, label: ' - Spices', value: 'commercial.food_and_drink.spices' },
                { isSubCategory: true, label: ' - Organic', value: 'commercial.food_and_drink.organic' },
                { isSubCategory: true, label: ' - Honey', value: 'commercial.food_and_drink.honey' },
                { isSubCategory: true, label: ' - Rice', value: 'commercial.food_and_drink.rice' },
                { isSubCategory: true, label: ' - Nuts', value: 'commercial.food_and_drink.nuts' },
                { isSubCategory: true, label: ' - Health Food', value: 'commercial.food_and_drink.health_food' },
                { isSubCategory: true, label: ' - Ice Cream', value: 'commercial.food_and_drink.ice_cream' },
                { isSubCategory: true, label: ' - Seafood', value: 'commercial.food_and_drink.seafood' },
                { isSubCategory: true, label: ' - Fruit and Vegetable', value: 'commercial.food_and_drink.fruit_and_vegetable' },
                { isSubCategory: true, label: ' - Farm', value: 'commercial.food_and_drink.farm' },
                { isSubCategory: true, label: ' - Confectionery', value: 'commercial.food_and_drink.confectionery' },
                { isSubCategory: true, label: ' - Chocolate', value: 'commercial.food_and_drink.chocolate' },
                { isSubCategory: true, label: ' - Butcher', value: 'commercial.food_and_drink.butcher' },
                { isSubCategory: true, label: ' - Cheese and Dairy', value: 'commercial.food_and_drink.cheese_and_dairy' },
                { isSubCategory: true, label: ' - Drinks', value: 'commercial.food_and_drink.drinks' },
                { isSubCategory: true, label: ' - Coffee and Tea', value: 'commercial.food_and_drink.coffee_and_tea' },
                { label: 'Convenience', value: 'commercial.convenience' },
                { label: 'Discount Store', value: 'commercial.discount_store' },
                { label: 'Smoking', value: 'commercial.smoking' },
                { label: 'Second Hand', value: 'commercial.second_hand' },
                { label: 'Gas', value: 'commercial.gas' },
                { label: 'Weapons', value: 'commercial.weapons' },
                { label: 'Pyrotechnics', value: 'commercial.pyrotechnics' },
                { label: 'Energy', value: 'commercial.energy' },
                { label: 'Wedding', value: 'commercial.wedding' },
                { label: 'Jewelry', value: 'commercial.jewelry' },
                { label: 'Watches', value: 'commercial.watches' },
                { label: 'Art', value: 'commercial.art' },
                { label: 'Antiques', value: 'commercial.antiques' },
                { label: 'Video and Music', value: 'commercial.video_and_music' },
                { label: 'Erotic', value: 'commercial.erotic' },
                { label: 'Trade', value: 'commercial.trade' },
                { label: 'Kiosk', value: 'commercial.kiosk' }
            ]
        } else if (this.selectedMajorCategory === 'catering') {
            return [
                { hasSubCategory: true, label: 'Restaurant' },
                { isSubCategory: true, label: ' - Pizza', value: 'catering.restaurant.pizza' },
                { isSubCategory: true, label: ' - Burger', value: 'catering.restaurant.burger' },
                { isSubCategory: true, label: ' - Regional', value: 'catering.restaurant.regional' },
                { isSubCategory: true, label: ' - Italian', value: 'catering.restaurant.italian' },
                { isSubCategory: true, label: ' - Chinese', value: 'catering.restaurant.chinese' },
                { isSubCategory: true, label: ' - Sandwich', value: 'catering.restaurant.sandwich' },
                { isSubCategory: true, label: ' - Chicken', value: 'catering.restaurant.chicken' },
                { isSubCategory: true, label: ' - Mexican', value: 'catering.restaurant.mexican' },
                { isSubCategory: true, label: ' - Japanese', value: 'catering.restaurant.japanese' },
                { isSubCategory: true, label: ' - American', value: 'catering.restaurant.american' },
                { isSubCategory: true, label: ' - Kebab', value: 'catering.restaurant.kebab' },
                { isSubCategory: true, label: ' - Indian', value: 'catering.restaurant.indian' },
                { isSubCategory: true, label: ' - Asian', value: 'catering.restaurant.asian' },
                { isSubCategory: true, label: ' - Sushi', value: 'catering.restaurant.sushi' },
                { isSubCategory: true, label: ' - French', value: 'catering.restaurant.french' },
                { isSubCategory: true, label: ' - German', value: 'catering.restaurant.german' },
                { isSubCategory: true, label: ' - Thai', value: 'catering.restaurant.thai' },
                { isSubCategory: true, label: ' - Greek', value: 'catering.restaurant.greek' },
                { isSubCategory: true, label: ' - Seafood', value: 'catering.restaurant.seafood' },
                { isSubCategory: true, label: ' - Fish and Chips', value: 'catering.restaurant.fish_and_chips' },
                { isSubCategory: true, label: ' - Steak House', value: 'catering.restaurant.steak_house' },
                { isSubCategory: true, label: ' - International', value: 'catering.restaurant.international' },
                { isSubCategory: true, label: ' - Tex-Mex', value: 'catering.restaurant.tex-mex' },
                { isSubCategory: true, label: ' - Vietnamese', value: 'catering.restaurant.vietnamese' },
                { isSubCategory: true, label: ' - Turkish', value: 'catering.restaurant.turkish' },
                { isSubCategory: true, label: ' - Korean', value: 'catering.restaurant.korean' },
                { isSubCategory: true, label: ' - Noodle', value: 'catering.restaurant.noodle' },
                { isSubCategory: true, label: ' - Barbecue', value: 'catering.restaurant.barbecue' },
                { isSubCategory: true, label: ' - Spanish', value: 'catering.restaurant.spanish' },
                { isSubCategory: true, label: ' - Fish', value: 'catering.restaurant.fish' },
                { isSubCategory: true, label: ' - Ramen', value: 'catering.restaurant.ramen' },
                { isSubCategory: true, label: ' - Mediterranean', value: 'catering.restaurant.mediterranean' },
                { isSubCategory: true, label: ' - Friture', value: 'catering.restaurant.friture' },
                { isSubCategory: true, label: ' - Beef Bowl', value: 'catering.restaurant.beef_bowl' },
                { isSubCategory: true, label: ' - Lebanese', value: 'catering.restaurant.lebanese' },
                { isSubCategory: true, label: ' - Wings', value: 'catering.restaurant.wings' },
                { isSubCategory: true, label: ' - Georgian', value: 'catering.restaurant.georgian' },
                { isSubCategory: true, label: ' - Tapas', value: 'catering.restaurant.tapas' },
                { isSubCategory: true, label: ' - Indonesian', value: 'catering.restaurant.indonesian' },
                { isSubCategory: true, label: ' - Arab', value: 'catering.restaurant.arab' },
                { isSubCategory: true, label: ' - Portuguese', value: 'catering.restaurant.portuguese' },
                { isSubCategory: true, label: ' - Russian', value: 'catering.restaurant.russian' },
                { isSubCategory: true, label: ' - Filipino', value: 'catering.restaurant.filipino' },
                { isSubCategory: true, label: ' - African', value: 'catering.restaurant.african' },
                { isSubCategory: true, label: ' - Malaysian', value: 'catering.restaurant.malaysian' },
                { isSubCategory: true, label: ' - Caribbean', value: 'catering.restaurant.caribbean' },
                { isSubCategory: true, label: ' - Peruvian', value: 'catering.restaurant.peruvian' },
                { isSubCategory: true, label: ' - Bavarian', value: 'catering.restaurant.bavarian' },
                { isSubCategory: true, label: ' - Brazilian', value: 'catering.restaurant.brazilian' },
                { isSubCategory: true, label: ' - Curry', value: 'catering.restaurant.curry' },
                { isSubCategory: true, label: ' - Dumpling', value: 'catering.restaurant.dumpling' },
                { isSubCategory: true, label: ' - Persian', value: 'catering.restaurant.persian' },
                { isSubCategory: true, label: ' - Argentinian', value: 'catering.restaurant.argentinian' },
                { isSubCategory: true, label: ' - Oriental', value: 'catering.restaurant.oriental' },
                { isSubCategory: true, label: ' - Balkan', value: 'catering.restaurant.balkan' },
                { isSubCategory: true, label: ' - Moroccan', value: 'catering.restaurant.moroccan' },
                { isSubCategory: true, label: ' - Pita', value: 'catering.restaurant.pita' },
                { isSubCategory: true, label: ' - Ethiopian', value: 'catering.restaurant.ethiopian' },
                { isSubCategory: true, label: ' - Taiwanese', value: 'catering.restaurant.taiwanese' },
                { isSubCategory: true, label: ' - Latin American', value: 'catering.restaurant.latin_american' },
                { isSubCategory: true, label: ' - Hawaiian', value: 'catering.restaurant.hawaiian' },
                { isSubCategory: true, label: ' - Irish', value: 'catering.restaurant.irish' },
                { isSubCategory: true, label: ' - Austrian', value: 'catering.restaurant.austrian' },
                { isSubCategory: true, label: ' - Croatian', value: 'catering.restaurant.croatian' },
                { isSubCategory: true, label: ' - Danish', value: 'catering.restaurant.danish' },
                { isSubCategory: true, label: ' - Tacos', value: 'catering.restaurant.tacos' },
                { isSubCategory: true, label: ' - Bolivian', value: 'catering.restaurant.bolivian' },
                { isSubCategory: true, label: ' - Hungarian', value: 'catering.restaurant.hungarian' },
                { isSubCategory: true, label: ' - Western', value: 'catering.restaurant.western' },
                { isSubCategory: true, label: ' - European', value: 'catering.restaurant.european' },
                { isSubCategory: true, label: ' - Jamaican', value: 'catering.restaurant.jamaican' },
                { isSubCategory: true, label: ' - Cuban', value: 'catering.restaurant.cuban' },
                { isSubCategory: true, label: ' - Soup', value: 'catering.restaurant.soup' },
                { isSubCategory: true, label: ' - Uzbek', value: 'catering.restaurant.uzbek' },
                { isSubCategory: true, label: ' - Nepalese', value: 'catering.restaurant.nepalese' },
                { isSubCategory: true, label: ' - Czech', value: 'catering.restaurant.czech' },
                { isSubCategory: true, label: ' - Syrian', value: 'catering.restaurant.syrian' },
                { isSubCategory: true, label: ' - Afghan', value: 'catering.restaurant.afghan' },
                { isSubCategory: true, label: ' - Malay', value: 'catering.restaurant.malay' },
                { isSubCategory: true, label: ' - Chili', value: 'catering.restaurant.chili' },
                { isSubCategory: true, label: ' - Belgian', value: 'catering.restaurant.belgian' },
                { isSubCategory: true, label: ' - Ukrainian', value: 'catering.restaurant.ukrainian' },
                { isSubCategory: true, label: ' - Swedish', value: 'catering.restaurant.swedish' },
                { isSubCategory: true, label: ' - Pakistani', value: 'catering.restaurant.pakistani' },
                { hasSubCategory: true, label: 'Fast Food' },
                { isSubCategory: true, label: ' - Pizza', value: 'catering.fast_food.pizza' },
                { isSubCategory: true, label: ' - Burger', value: 'catering.fast_food.burger' },
                { isSubCategory: true, label: ' - Sandwich', value: 'catering.fast_food.sandwich' },
                { isSubCategory: true, label: ' - Kebab', value: 'catering.fast_food.kebab' },
                { isSubCategory: true, label: ' - Fish and Chips', value: 'catering.fast_food.fish_and_chips' },
                { isSubCategory: true, label: ' - Noodle', value: 'catering.fast_food.noodle' },
                { isSubCategory: true, label: ' - Ramen', value: 'catering.fast_food.ramen' },
                { isSubCategory: true, label: ' - Wings', value: 'catering.fast_food.wings' },
                { isSubCategory: true, label: ' - Tapas', value: 'catering.fast_food.tapas' },
                { isSubCategory: true, label: ' - Pita', value: 'catering.fast_food.pita' },
                { isSubCategory: true, label: ' - Tacos', value: 'catering.fast_food.tacos' },
                { isSubCategory: true, label: ' - Soup', value: 'catering.fast_food.soup' },
                { isSubCategory: true, label: ' - Salad', value: 'catering.fast_food.salad' },
                { isSubCategory: true, label: ' - Hot Dog', value: 'catering.fast_food.hot_dog' },
                { hasSubCategory: true, label: 'Cafe' },
                { isSubCategory: true, label: ' - Waffle', value: 'catering.cafe.waffle' },
                { isSubCategory: true, label: ' - Ice Cream', value: 'catering.cafe.ice_cream' },
                { isSubCategory: true, label: ' - Coffee Shop', value: 'catering.cafe.coffee_shop' },
                { isSubCategory: true, label: ' - Donut', value: 'catering.cafe.donut' },
                { isSubCategory: true, label: ' - Crepe', value: 'catering.cafe.crepe' },
                { isSubCategory: true, label: ' - Bubble Tea', value: 'catering.cafe.bubble_tea' },
                { isSubCategory: true, label: ' - Cake', value: 'catering.cafe.cake' },
                { isSubCategory: true, label: ' - Frozen Yogurt', value: 'catering.cafe.frozen_yogurt' },
                { isSubCategory: true, label: ' - Dessert', value: 'catering.cafe.dessert' },
                { isSubCategory: true, label: ' - Coffee', value: 'catering.cafe.coffee' },
                { isSubCategory: true, label: ' - Tea', value: 'catering.cafe.tea' },
                { label: 'Food Court', value: 'catering.food_court' },
                { label: 'Bar', value: 'catering.bar' },
                { label: 'Pub', value: 'catering.pub' },
                { label: 'Ice Cream', value: 'catering.ice_cream' },
                { label: 'Biergarten', value: 'catering.biergarten' },
                { label: 'Taproom', value: 'catering.taproom' }
            ]
        }
    }

    get isFindingNearbyPlaces() {
        return this.startedFindingPlaces && this.nearbyPlaces === undefined;
    }

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
            this.isFinding = true;
            let record = JSON.parse(await fetchRecordAddress({ recordId, recordType }));
            console.log('Record: ' + JSON.stringify(record));

            this.mapMarkers = [{
                location: {
                    Latitude: record.lat,
                    Longitude: record.lon
                },
            }];

            console.log('Map Markers: ' + JSON.stringify(this.mapMarkers));
            this.isFinding = false;
        } catch (error) {
            this.isFinding = false;
            console.log('Error: ' + JSON.stringify(error));
        }
    }

    handleRadiusChange(event) {
        this.filters.radius = event.detail.value;
    }

    handleCategoryChange(event) {
        console.log('Category: ' + event.detail.value);

        this.selectedMajorCategory = event.detail.value;
        this.filters.selectedCategories.push(this.selectedMajorCategory);
    }

    handleSubcategoryChange(event) {
        console.log('Subcategory value: ' + event.target.value);
        console.log('Checked/Unchecked: ' + event.target.checked);

        if (event.target.checked) {
            this.filters.selectedCategories.push(event.target.value);
        } else {
            this.filters.selectedCategories = this.filters.selectedCategories.filter(category => category !== event.target.value);
        }

        console.log('Selected categories: ' + JSON.stringify(this.filters));
    }


    async handleSearch() {
        console.log('Search filters: ' + JSON.stringify(this.filters));

        try {
            this.startedFindingPlaces = true;
            let fetchedPlaces = JSON.parse(await fetchNearbyPlaces({
                radius: this.filters.radius,
                categories: this.filters.selectedCategories,
                lat: this.mapMarkers[0].location.Latitude,
                lon: this.mapMarkers[0].location.Longitude
            }));

            let placeIndex = 1;
            let places = fetchedPlaces.features.map(feature => {
                let obj = {};
                obj['name'] = feature.properties.name;
                obj['address_line1'] = feature.properties.address_line1;
                obj['address_line2'] = feature.properties.address_line2;
                obj['lat'] = feature.properties.lat;
                obj['lon'] = feature.properties.lon;
                obj['viewingOnMap'] = false;
                obj['index'] = placeIndex;
                placeIndex++;

                for (let [key, value] of Object.entries(feature.properties.datasource.raw)) {
                    console.log('key: ', key);
                    console.log('value: ', value);
    
                    if (key === 'opening_hours') {
                        obj['opening_hours'] = value ? value : 'Not Specified';
                    }
    
                    if (key === 'phone') {
                        obj['phone'] = value ? value : 'Not Specified';
                    }
    
                    if (key === 'website') {
                        obj['website'] = value ? value : 'Not Specified';
                    }
                }

                return obj;
            })

            console.log('Places: ' + JSON.stringify(places));
            this.nearbyPlaces = places;
        } catch (error) {
            console.log('Error: ' + JSON.stringify(error));
        }
    }


    handleViewOnMap(event) {
        console.log('Subcategory value: ' + event.target.value);
        console.log('Subcategory: ' + event.target.checked);
        console.log('Place index: ' + JSON.stringify(event.currentTarget.dataset.placeindex));

        let placeIndex = event.currentTarget.dataset.placeindex;

        // Turn on the viewingOnMap property for the selected place
        this.nearbyPlaces = this.nearbyPlaces.map(place => {
            if (place.index == placeIndex) {
                place.viewingOnMap = true;
            }

            return place;
        });

        // Add the selected place on mapMarkers array if it is checked
        let selectedPlace = this.nearbyPlaces.find(place => place.index == placeIndex);
        if (event.target.checked) {
            this.mapMarkers = [...this.mapMarkers, {
                location: {
                    Latitude: selectedPlace.lat,
                    Longitude: selectedPlace.lon
                },
                title: selectedPlace.name,
                description: selectedPlace.address_line1 + ' ' + selectedPlace.address_line2
            }];
        } else {
            let tempMapMarker = this.mapMarkers.filter(marker => {
                if (marker.location.Latitude !== selectedPlace.lat && marker.location.Longitude !== selectedPlace.lon) {
                    return true;
                } else {
                    return false;
                }
            });

            this.mapMarkers = tempMapMarker;
        }

        console.log('Map Markers: ' + JSON.stringify(this.mapMarkers));
    }
}