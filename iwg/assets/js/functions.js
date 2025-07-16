// subscribe to ready event
Genesys('subscribe', 'Messenger.ready', function () {
    
    // set the country as a parameter for the web messenger widget
    Genesys('command', 'Database.set', {
        messaging: {
            customAttributes: {
                souce_country: "UK",
                souce_webpage: "BOOK_OFFICE_SPACE"
            }
        }
    })
    console.log("Messenger Ready Event Received")
    
});