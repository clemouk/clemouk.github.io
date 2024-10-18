
let conversationEnd = localStorage.getItem('conversationEnd');
let surveyDone = localStorage.getItem('surveyDone');
let loaded = false;
let transcriptButtonLoaded = false;

if (conversationEnd == null || conversationEnd == undefined) {
  conversationEnd = 'false';
}

if (surveyDone == null || surveyDone == undefined) {
  surveyDone = 'false';
};

function wireEvents(){
  console.log('wireEvents - begin');

  // subsribe to close widget event
  console.log('READY: subscribing to conversationCleared event...');
  Genesys('subscribe', 'MessagingService.conversationCleared', function(){
    // Need to reset the conversationState so that a survey can be done if a new conversation starts
    localStorage.setItem('_ttecConversationState', 'NEW');
    // Re-initialise the widget params
    Genesys('command', 'Database.set', {
      messaging: {
          customAttributes: {
              TargetBrand: "VWCV"
          },
      },
    })
  });

  let x = document.getElementById("myAudio");

  Genesys("subscribe", "Messenger.opened", function(){
    console.log('Messenger.open event invoked');
    messengerOpen = true;

    if(localStorage.getItem('_ttecConversationState')=='SURVEY_COMPLETED') {
      console.log('Resetting widgets params - TargetBrand: VWCV');
      Genesys('command', 'Database.set', {
        messaging: {
            customAttributes: {
                TargetBrand: "VWCV"
            },
        },
      })
    };

  });

  Genesys("subscribe", "Messenger.closed", function(){
    console.log('Messenger.closed event invoked');
    messengerOpen = false;
  });

  console.log('READY: subscribing to messagesReceived event...');
  Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {

    if((data.messages[0].type=="Text" || data.messages[0].type=="Structured") && (data.messages[0].direction=="Outbound" && data.messages[0].originatingEntity=="Bot"))
    {
      console.log('bot')
    } else { console.log('human'); }

    // ensure that we're looking at a text message, rather than any other notification message
    if((data.messages[0].type=="Text" || data.messages[0].type=="Structured") && data.messages[0].direction=="Outbound") {

      // check to see if this is the start of the Survey bot
      let messageContent = data.messages[0].text;

      if(messageContent.indexOf("*Question ")>-1) { 
        localStorage.setItem('_ttecConversationState', 'IN_SURVEY');
        console.log('_ttecConversationState = IN_SURVEY')
      } 
      else if(messageContent=="Hello. I'm your Volkswagen Commercial Vehicle Digital Assistant.") /* Unique greeting per brand */
        {
          localStorage.setItem('_ttecConversationState', 'NEW');
          console.log('new conversation')
          conversationEnd = 'false'
          surveyDone = 'false'
          loaded = false
          localStorage.setItem('conversationEnd', 'false')
          localStorage.setItem('surveyDone', 'false')

          if(!transcriptButtonLoaded) {
            transcriptButtonLoaded = true;
            displayButton();
          }
          //gc_token = JSON.parse(localStorage.getItem(`_${gc_deploymentId}:actmu`)).value;

          

        }
      else if(messageContent=="Thanks for submitting your feedback.") 
      {
        localStorage.setItem('_ttecConversationState', 'SURVEY_COMPLETED');
        console.log('_ttecConversationState = SURVEY_COMPLETED')
        Genesys('command', 'Database.set', {
          messaging: {
              customAttributes: {
                  TargetBrand: "VWCV"
              },
          },
        })
      } else {
        localStorage.setItem('_ttecConversationState', 'IN_PROGRESS');
        console.log('_ttecConversationState = IN_PROGRESS');
      }
    };

    //console.log(data);
    if(messengerOpen==false) {
      x.play();
      toggleMessenger();
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
            TargetBrand: "VWCV"
        },
    },
  })

  localStorage.setItem('_ttecConversationState', 'NEW');
});

// receive disconnected event
Genesys('subscribe', 'MessagingService.conversationDisconnected', function () {

  console.log('disconnected event');
  //add localstorage flags to indicate how many times and also time

  if (!loaded) {

    // Genesys(
    //   "command",
    //   "Toaster.open",
    //   {
    //     title: "Volkswagen",
    //     body: "To download your chat conversation, please click the download button at the bottom of the screen at the end of your conversation.",
    //     buttons: { type: "unary" },
    //     primary: "OK" // optional, default value is "Accept"
    //   },
    // );

    
    loaded = true
    conversationEnd = 'true'
    localStorage.setItem('conversationEnd', 'true')
    if (surveyDone == 'false') {
      localStorage.setItem('surveyDone', 'true')
      console.log('Start Survey')
      Genesys('command', 'MessagingService.sendMessage', {
        message: 'How did we do?',
      })
    }
  }
});

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

// Genesys("subscribe", "Toaster.ready", () => {
//   console.log('pop-up ready')
// });