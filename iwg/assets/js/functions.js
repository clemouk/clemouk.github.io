// subscribe to ready event
Genesys('subscribe', 'Messenger.ready', function () {
    
    // set the country as a parameter for the web messenger widget
    Genesys('command', 'Database.set', {
        messaging: {
            customAttributes: {
                souce_country: "UK"
            },
        },
    })
    console.log("Messenger Ready Event Received")
    
});