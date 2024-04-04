let conversationEnd
conversationEnd ? sessionStorage.getItem('conversationEnd') : true
let retry = true
var autoLaunch = false;
var pureJsUrl;
var deviceType;

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
        console.log('READY: subscribing to close event...');
        Genesys('subscribe', 'Messenger.close', function(){
          console.log('Messenger.close event invoked');
          $('#wizardContainer').fadeIn();
        });

      });


    
    console.log('Opening form...')
    $('#wizardContainer').fadeIn();
  });

});


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


