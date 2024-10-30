
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
  Genesys('subscribe', 'MessagingService.conversationCleared', function(){
    // Need to reset the conversationState so that a survey can be done if a new conversation starts
    localStorage.setItem('_ttecConversationState', 'NEW');
    // Re-initialise the widget params
    Genesys('command', 'Database.set', {
      messaging: {
          customAttributes: {
              TargetBrand: "Cupra"
          },
      },
    })
  });

  let x = document.getElementById("myAudio");

  Genesys("subscribe", "Messenger.opened", function(){
    messengerOpen = true;
    if(localStorage.getItem('_ttecConversationState')=='SURVEY_COMPLETED') {
      Genesys('command', 'Database.set', {
        messaging: {
            customAttributes: {
                TargetBrand: "Cupra"
            },
        },
      })
    };

  });

  Genesys("subscribe", "Messenger.closed", function(){
    messengerOpen = false;
  });

  Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {

    // ensure that we're looking at a text message, rather than any other notification message
    if((data.messages[0].type=="Text" || data.messages[0].type=="Structured") && data.messages[0].direction=="Outbound") {

      // check to see if this is the start of the Survey bot
      let messageContent = data.messages[0].text;
      
      // To Mick: I know this is not the most elegant solution, but it is working. 
      if(messageContent===undefined) { messageContent = ""}

      if(messageContent.indexOf("*Question ")>-1) { 
        localStorage.setItem('_ttecConversationState', 'IN_SURVEY');
      } 
      else if(messageContent=="Hello, I'm your CUPRA Digital Assistant.") /* Unique greeting for each brand */
        {
          localStorage.setItem('_ttecConversationState', 'NEW');
          conversationEnd = 'false'
          surveyDone = 'false'
          loaded = false
          localStorage.setItem('conversationEnd', 'false')
          localStorage.setItem('surveyDone', 'false')

          if(!transcriptButtonLoaded) {
            transcriptButtonLoaded = true;
            displayButton();
          }

        }
      else if(messageContent=="Thanks for submitting your feedback.") 
      {
        localStorage.setItem('_ttecConversationState', 'SURVEY_COMPLETED');
        Genesys('command', 'Database.set', {
          messaging: {
              customAttributes: {
                  TargetBrand: "Cupra"
              },
          },
        })
      } 
      else if(messageContent.indexOf("detected inappropriate language")>-1) {
        localStorage.setItem('_ttecConversationState', 'SURVEY_COMPLETED');
        surveyDone=true;
        Genesys('command', 'Database.set', {
          messaging: {
              customAttributes: {
                  TargetBrand: "Cupra"
              },
          },
        })
      }
      else {
        localStorage.setItem('_ttecConversationState', 'IN_PROGRESS');
      }
    };

    if(messengerOpen==false) {
      x.play();
      toggleMessenger();
    };
  })

}

// subscribe to ready event
Genesys('subscribe', 'Messenger.ready', function () {

  wireEvents();

  Genesys('command', 'Database.set', {
    messaging: {
        customAttributes: {
            TargetBrand: "Cupra"
        },
    },
  })

  localStorage.setItem('_ttecConversationState', 'NEW');
});

// receive disconnected event
Genesys('subscribe', 'MessagingService.conversationDisconnected', function () {

  if (!loaded) {

    loaded = true
    conversationEnd = 'true'
    localStorage.setItem('conversationEnd', 'true')
    if (surveyDone == 'false') {
      localStorage.setItem('surveyDone', 'true')
      Genesys('command', 'MessagingService.sendMessage', {
        message: 'How did we do?',
      })
    }
  }
});

// receive connected event
Genesys('subscribe', 'Conversations.started', function () {
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
