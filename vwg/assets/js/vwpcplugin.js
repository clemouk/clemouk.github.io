
let conversationEnd = localStorage.getItem('conversationEnd')
let surveyDone = localStorage.getItem('surveyDone')
let loaded = false

if (conversationEnd == null || conversationEnd == undefined) {
  conversationEnd = 'false'
}
if (surveyDone == null || surveyDone == undefined) {
  surveyDone = 'false'
}

// subscribe to ready event
Genesys('subscribe', 'Messenger.ready', function () {
  console.log('setting db params');

  wireEvents();
});

// receive disconnected event
Genesys('subscribe', 'MessagingService.conversationDisconnected', function () {

  if (!loaded) {
    loaded = true
    conversationEnd = 'true'
    localStorage.setItem('conversationEnd', 'true')
    console.log('end of conversation')
    console.log(conversationEnd)
    console.log(surveyDone)
    if (surveyDone == 'false') {
      localStorage.setItem('surveyDone', 'true')
      console.log('Start Survey')
          Genesys('command', 'MessagingService.sendMessage', {
            message: 'How did we do?',
          })
    }
  }
})

// receive connected event
Genesys('subscribe', 'Conversations.started', function () {
  console.log('new conversation')
  setWidgetParams()
  conversationEnd = 'false'
  surveyDone = 'false'
  loaded = false
  localStorage.setItem('conversationEnd', 'false')
  localStorage.setItem('surveyDone', 'false')
})

function wireEvents(){
  console.log('wireEvents - begin');

      console.log('READY: subscribing to conversationCleared event...');
      Genesys('subscribe', 'MessagingService.conversationCleared', function(){
        console.log('MessagingService.conversationCleared event invoked');
        conversationEnd = 'false'
        surveyDone = 'true'
        loaded = false
        localStorage.setItem('conversationEnd', 'false')
        localStorage.setItem('surveyDone', 'true')
      });

      let x = document.getElementById("myAudio");

      // subsribe to close widget event
      console.log('READY: subscribing to open event...');
      Genesys("subscribe", "Messenger.opened", function(){
        console.log('Messenger.open event invoked');
        messengerOpen = true;
      });

      // subsribe to close widget event
      console.log('READY: subscribing to closed event...');
      Genesys("subscribe", "Messenger.closed", function(){
        messengerOpen = false;
      });

      console.log('READY: subscribing to messagesReceived event...');
      Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {
        //console.log(data);
        if(messengerOpen==false) {
          x.play();
          toggleMessenger();
        }; 
      })

  setWidgetParams();
  console.log('wireEvents - end');
}

function setWidgetParams() {
  Genesys('command', 'Database.set', {
    messaging: {
        customAttributes: {
            TargetBrand: "VWPC"
        },
    },
  })
}

function toggleMessenger(){
  Genesys("command", "Messenger.open", {},
    function(o){},  // if resolved

    function(o){    // if rejected
      Genesys("command", "Messenger.close");
    }
  );
}
