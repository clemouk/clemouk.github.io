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

    Genesys('command', 'Database.set', {
      messaging: {
          customAttributes: {
              productTemplate: $('input[name="productTemplate"]').val(),
              schemeNumber:  $('input[name="schemeId"]').val(),
              productType: $("#productType option:selected").text(),
              policyNumber: $('input[name="policyId"]').val(),
              valuationClass: $('input[name="valueClass"]').val(),
              originURL: $("#launchKeyURL option:selected").text(),
              deepLinkType: $("#deepLinkType option:selected").text(),
              deepLinkId: $('input[name="deepLinkId"]').val(),
              target:  $('input[name="target"]').val(),
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
          Genesys('command', 'Messenger.close')
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


