let conversationEnd
conversationEnd ? sessionStorage.getItem('conversationEnd') : true
let retry = true
var autoLaunch = false;
var pureJsUrl;
var deviceType;
var eventsWired = false;
$(document).ready(function() { 
  // Pure JavaScript
  pureJsUrl = window.location.href;
  $('input[name="launchKeyURL"]').val(pureJsUrl);
  console.log('Current URL (Pure JavaScript): ' + pureJsUrl);


  // subscribe to ready event
  Genesys('subscribe', 'Messenger.ready', function () {
      // subsribe to close widget event
      console.log('READY: subscribing to open event...');

      Genesys("subscribe", "Messenger.opened", function(){
        console.log('Messenger.open event invoked');
      });

      console.log('READY: subscribing to conversationCleared event...');
      Genesys('subscribe', 'MessagingService.conversationCleared', function(){
        console.log('MessagingService.conversationCleared event invoked');
        $('#wizardContainer').fadeIn();
      });
    
    console.log('Opening form...')
    $('#wizardContainer').fadeIn();
  });

  if(!eventsWired) {
    eventsWired=true;
    wireEvents();
  }


});

function wireEvents(){
  console.log('wireEvents - begin');

  $('.deepLink').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    console.log('DeepLink clicked');
    var _deepLinkId = $(this).data('deeplinkid');
    console.log('Selected deepLinkId = ' + _deepLinkId);
    // set deeplink
    // Genesys('command', 'Database.update', {
    //   messaging: {
    //       customAttributes: {              
    //           deepLinkId: _deepLinkId                  
    //       },
    //   },
    // });

    Genesys("command", "Database.update", {
      messaging: { customAttributes: { deepLinkId: _deepLinkId }}},
      function(data){ 
        console.log('Database update called - ',data);

        // send "Searching" message
        Genesys("command", "MessagingService.sendMessage", {
          message: "Searching"
          },
              function() {
                  /*fulfilled callback*/
                  console.info('Searching message sent');
              },
              function() {
                  /*rejected callback*/
                  console.warn('Searching message NOT sent');
              }
          );
      }, 
      function(){ 
        /* rejected */ 
      }
    );

  });

  console.log('wireEvents - end');
}

function launchGenesys() {
  console.log('Preparing Genesys Widget...');

  (function getDeviceType() {
    if($.browser.mobile==true) {
      deviceType = 'Mobile Device'
    } else {
      deviceType = 'Desktop'
    }
  })();


  var _originUrl=$("#launchKeyURL option:selected").text();

  if($('input[name="launchKeyURL-manual"]').val()!=""){
    _originUrl=$('input[name="launchKeyURL-manual"]').val();
  }

  if(_originUrl.includes('workplace')){
    _originUrl += $('input[name="schemeId"]').val();
  }  

  Genesys('command', 'Database.set', {
    messaging: {
        customAttributes: {
            firstName: "Joe",
            lastName: "Bloggs",
            productTemplate: $('input[name="productTemplate"]').val(),
            schemeNumber:  $('input[name="schemeId"]').val(),
            productType: $("#productType option:selected").text(),
            policyNumber: $('input[name="policyId"]').val(),
            valuationClass: $('input[name="valueClass"]').val(),
            originUrl: _originUrl,
            //deepLinkType: $("#deepLinkType option:selected").text(),
            deepLinkId: $('input[name="deepLinkId"]').val(),
            target:  $('input[name="target"]').val(),
            syndicationId: $('input[name="syndicationId"]').val(),              
            browserType: $.browser.platform,
            browserVersion: $.browser.version,      
            deviceType: deviceType      
        },
    },
})

  $('#wizardContainer').fadeOut();
  // for the  demo, just open the messenger
    Genesys('command','Messenger.open',{},
      function (o) {},
      function (o) {
        Genesys('command', 'Messenger.close');        
      }
    )
};

function toggleMessenger(){
    Genesys("command", "Messenger.open", {},
      function(o){},  // if resolved

      function(o){    // if rejected
        Genesys("command", "Messenger.close");
      }
    );
}


