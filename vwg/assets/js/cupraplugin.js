
let conversationEnd = localStorage.getItem('conversationEnd')
let surveyDone = localStorage.getItem('surveyDone')
let loaded = false

if (conversationEnd == null || conversationEnd == undefined) {
  conversationEnd = 'false'
}
if (surveyDone == null || surveyDone == undefined) {
  surveyDone = 'false'
}

function wireEvents(){
  console.log('wireEvents - begin');

      // subsribe to close widget event
      console.log('READY: subscribing to open event...');


      console.log('READY: subscribing to conversationCleared event...');
      Genesys('subscribe', 'MessagingService.conconversationClearedversationCleared', function(){
        console.log('MessagingService. event invoked');
      });

      let x = document.getElementById("myAudio");

      Genesys("subscribe", "Messenger.opened", function(){
        console.log('Messenger.open event invoked');
        messengerOpen = true;
      });

      Genesys("subscribe", "Messenger.closed", function(){
        messengerOpen = false;
      });

      console.log('READY: subscribing to messagesReceived event...');
      Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {
        console.log(data);
        if(messengerOpen==false) {
          x.play();
          Genesys('command','Messenger.open',{},
            function (o) {},
            function (o) {
              Genesys('command', 'Messenger.close');        
            }
          )
        }; 
      })


  console.log('wireEvents - end');
}

// subscribe to ready event
Genesys('subscribe', 'Messenger.ready', function () {
  console.log('setting db params');

  wireEvents();

  Genesys('command', 'Database.set', {
    messaging: {
        customAttributes: {
            TargetBrand: "Cupra"
        },
    },
  })
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
  conversationEnd = 'false'
  surveyDone = 'false'
  loaded = false
  localStorage.setItem('conversationEnd', 'false')
  localStorage.setItem('surveyDone', 'false')
})


function toggleMessenger(){
  Genesys("command", "Messenger.open", {},
    function(o){},  // if resolved

    function(o){    // if rejected
      Genesys("command", "Messenger.close");
    }
  );
}
