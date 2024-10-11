
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

        if(localStorage.getItem('_ttecConversationState')=='SURVEY_COMPLETED') {
          console.log('Resetting widgets params - TargetBrand: VWPC');
          Genesys('command', 'Database.set', {
            messaging: {
                customAttributes: {
                    TargetBrand: "VWPC"
                },
            },
          })
        };
  
      });

      Genesys("subscribe", "Messenger.closed", function(){
        messengerOpen = false;
      });

      console.log('READY: subscribing to messagesReceived event...');
      Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {
        // console.log(data);

        if(data.messages[0].originatingEntity=="Bot" && data.messages[0].type=="Text")
        {
          if(data.messages[0].text=="How did we do?") { 
            localStorage.setItem('_ttecConversationState', 'IN_SURVEY');
          } 
          else if(data.messages[0].text=="Thank you for your feedback. Goodbye."); 
          {
            localStorage.setItem('_ttecConversationState', 'SURVEY_COMPLETED');
            Genesys('command', 'Database.set', {
              messaging: {
                  customAttributes: {
                      TargetBrand: "VWPC"
                  },
              },
            })
          }
        };


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
            TargetBrand: "VWPC"
        },
    },
  })
});


// receive disconnected event
Genesys('subscribe', 'MessagingService.conversationDisconnected', function () {

  console.log('disconnected event');

//add localstorage flags to indicate how many times and also time

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
