var databaseSet = false;
var attributes = {

};
$(document).ready(function() { 
    console.log('startup');
    Genesys('subscribe', 'Messenger.ready', function () {
        
        console.log("messenger is ready")
        wireHandlers();
        
    });
});

// do database.set here
function wireHandlers(){
    $('#updateDatabase').click(function(e){    
        e.preventDefault();
        
    var _debugMode=$('#debugMode').is(":checked") ? 'On' : 'Off';
    var _smallImages=$('#smallImages').is(":checked") ? 'Yes' : 'No';


        attributes={
            memberForename: '', // $('#memberForename').val(),
            bgroup: 'LBG', // $('#broup').val(),
            referenceNumber: $('#referenceNumber').val(),
            debugMode: _debugMode,
            smallImages: _smallImages,
        }
        console.log('setting attributes: ',attributes);
        setDatabase();    
        
      });

      $('#updateDatabase').removeAttr("disabled");
      
}
  
function setDatabase(){
    if(!databaseSet) {
        databaseSet=true;
        Genesys("command", "Database.set", { messaging: { customAttributes: attributes}},
        function(data){ 
            /* fulfilled, returns data */
            openMessenger();
        }, function(){ /* rejected */ });
    }
    else{
        Genesys("command", "Database.update", { messaging: { customAttributes: attributes}},
        function(data){ 
            openMessenger();
            /* fulfilled, returns data */
        }, function(){ /* rejected */ });
    }
    
}

function openMessenger(){

    Genesys(
        'command',
        'Messenger.open',
        {},
        () => {
         /*fulfilled callback*/
         console.log('Messenger opened');
        },
        (error) => {
         /*rejected callback*/
         console.log("Couldn't open messenger.", error);
        }
      );


}
