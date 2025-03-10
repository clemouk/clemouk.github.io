
let conversationEnd = localStorage.getItem('conversationEnd');
let surveyDone = localStorage.getItem('surveyDone');
let loaded = false;

if (conversationEnd == null || conversationEnd == undefined) {
  conversationEnd = 'false';
}

if (surveyDone == null || surveyDone == undefined) {
  surveyDone = 'false';
};

function wireEvents(){
  Genesys('subscribe', 'MessagingService.conversationCleared', function(){
    localStorage.setItem('_ttecConversationState', 'NEW');
    Genesys('command', 'Database.set', {
      messaging: {
          customAttributes: {
              TargetBrand: "Audi"
          },
      },
    })
  });

  Genesys("subscribe", "Messenger.opened", function(){
    messengerOpen = true;

    if(localStorage.getItem('_ttecConversationState')=='SURVEY_COMPLETED') {
      Genesys('command', 'Database.set', {
        messaging: {
            customAttributes: {
                TargetBrand: "Audi"
            },
        },
      })
    };
  });

  Genesys("subscribe", "Messenger.closed", function(){
    messengerOpen = false;
  });

  Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {
    if((data.messages[0].type=="Text" || data.messages[0].type=="Structured") && data.messages[0].direction=="Outbound") {
      let messageContent = data.messages[0].text;

      if(messageContent===undefined) { messageContent = ""}     

      if(messageContent.indexOf("*Question ")>-1) { 
        localStorage.setItem('_ttecConversationState', 'IN_SURVEY');
      } 
      else if(messageContent=="Hello, my name is AVA, your Audi Virtual Assistant.") 
        {
          localStorage.setItem('_ttecConversationState', 'NEW');
          conversationEnd = 'false'
          surveyDone = 'false'
          loaded = false
          localStorage.setItem('conversationEnd', 'false')
          localStorage.setItem('surveyDone', 'false')
        }
      else if(messageContent=="Thanks for submitting your feedback.") 
      {
        localStorage.setItem('_ttecConversationState', 'SURVEY_COMPLETED');
        Genesys('command', 'Database.set', {
          messaging: {
              customAttributes: {
                  TargetBrand: "Audi"
              },
          },
        })
      } else {
        localStorage.setItem('_ttecConversationState', 'IN_PROGRESS');
      }
    };

    if(messengerOpen==false) {
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
            TargetBrand: "Audi"
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

