const datatableId = 'ENTER_YOUR_DATATABLE'
const apiUrl = 'ENTER_YOUR_URL'
let conversationEnd
conversationEnd ? sessionStorage.getItem('conversationEnd') : true
let retry = true
var autoLaunch = false;
var pureJsUrl;

$(document).ready(function() { 
  // Pure JavaScript
  pureJsUrl = window.location.href;
  $('input[name="launchKeyURL"]').val(pureJsUrl);

  console.log('Current URL (Pure JavaScript): ' + pureJsUrl);
});

// Custom Popup
let div = document.createElement('div')
let popup = document.createElement('div')
let header = document.createElement('div')
let strong = document.createElement('strong')
let closeButton = document.createElement('button')
let body = document.createElement('div')
let p = document.createElement('p')
let transcriptButton = document.createElement('a')
let surveyButton = document.createElement('a')

div.id = 'CustomPopUpDiv'
//div.className = 'position-fixed bottom-0 end-0 p-5'
div.className = 'p-5'
div.style = 'position: absolute; z-index: 0; top: 50%; left: 50%; margin-top: -50px; margin-left: -50px; width: 100px; height: 100px;'
popup.id = 'CustomPopUp'
popup.className = 'toast hide'
popup.role = 'alert'
header.className = 'toaster-header'
header.style = 'background-color: grey; text-align: right;'
strong.className = 'me-auto'
strong.style = 'color: white;'
closeButton.className = 'btn-close btn-close-white'
closeButton.ariaLabel = 'Close'
closeButton.onclick = function () {
  closeCustomPopUp()
}
body.id = 'CustomPopUpBody'
body.className = 'toast-body'
body.style = 'text-align: center'
p.innerHTML = 'Please select below if you want to download the content of this session'
transcriptButton.id = 'transcriptbutton'
transcriptButton.href = ''
transcriptButton.target = '_blank'
transcriptButton.innerHTML = 'Transcript'
transcriptButton.className = 'btn btn-secondary m-1'
surveyButton.id = 'surveybutton'
surveyButton.href = ''
surveyButton.target = '_blank'
surveyButton.innerHTML = 'Survey'
surveyButton.className = 'btn btn-secondary m-1'

body.appendChild(p)
body.appendChild(surveyButton)
body.appendChild(transcriptButton)
header.appendChild(closeButton)

popup.appendChild(header)
popup.appendChild(body)
div.appendChild(popup)
document.body.appendChild(div)


// Custom launch button
const hexColor = '#000000' //Color theme
const launcher = document.createElement('button')


function createLauncher() {
    //Create Launcher
    launcher.onclick = function () {
      toggleMessenger()
    }
    launcher.style = `cursor: pointer;
          box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 5px -2px, rgba(0, 0, 0, 0.14) 0px 1px 4px 2px, rgba(0, 0, 0, 0.12) 0px 1px 4px 1px;
          position: fixed !important;
          bottom: 30px !important;
          width: 56px;
          height: 56px;
          right: 30px !important;
          border-radius: 50%;
          background-color: ${hexColor};
          z-index: 9999;
          border: 0px;`
    launcher.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`
    //launcher.innerHTML = `CHAT<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"></svg>`
  
    document.body.appendChild(launcher)
  
  }

function openLauncher() {
    let session = JSON.parse(localStorage.getItem(`_${deploymentId}:gcmcsessionActive`))
    let input = document.getElementById('input')
    console.log(session?.value)
    if (session?.value) {
      console.log('Opening Widget...')
      Genesys(
        'command',
        'Messenger.open',
        {},
        function (o) {
          closeLauncher()
        },
        function (o) {
          Genesys('command', 'Messenger.close')
        }
      )
    } else {
      console.log('showing...')
      input.hidden = false
    }
}

Genesys('subscribe', 'Launcher.ready', function (o) {
  //set the data on start
  Genesys('subscribe', 'MessagingService.started', function () {
    Genesys('command', 'Database.set', {
      messaging: { customAttributes: { token: JSON.parse(localStorage.getItem('_actmu')).value } },
    })
  })

    Genesys("subscribe", "MessagingService.messagesReceived", function({ data }) {

    var message_id;
    if(data.messages[0].direction=="Outbound") {

        let text = data.messages[0].text;
        let result = text.indexOf("](http");
        var idx = 0;

        if(result>0) {

            console.log('found a hyperlink');

            // this means we've found a hyperlink in the bot message coming from Genesys
            $(".mxg-message-bubble.mxg-outbound.false").children() 
                .each(function () { 
  
                idx++; 
                console.log(toString(idx) + ': ' + $this.prop('class'));

            // "this" is the current child 
            // in the loop grabbing this  
            // element in the form of string 
            // and appending it to the  
            // "#output-container" div 
            var element = $(this) 
                    .prop('innerHTML'); 
  
            console.log(toString(idex + ': ' + element));
            //$("#output-container") 
            //        .append(element); }


            console.log(document.getElementById(message_id).innerHTML);
            })
    };
    console.log(data.messages[0].text);
    }});

  //receive disconnected event
  Genesys('subscribe', 'MessagingService.conversationDisconnected', function () {
      if(!conversationEnd){
        conversationEnd = true
        sessionStorage.setItem('conversationEnd', true)
        console.log('end of conversation')
        
        //setTimeout(async function () {
        //  let urls = getUrls()
        //  console.log(urls)
        //}, 15000)
        openCustomPopUp("about:blank","about:blank")
      }
  })
  //receive connected event
  Genesys('subscribe', 'Conversations.started', function () {
    console.log('new conversation')
    conversationEnd = false
    sessionStorage.setItem('conversationEnd', false)
  })
})

function launchGenesys() {
    console.log('Preparing Genesys Widget...');

    $('#wizardContainer').fadeOut();
    setCustomProperties();
    createLauncher();

    // for the workplace demo, just open the messenger
    if(autoLaunch==true) {
      Genesys('command','Messenger.open',{},
        function (o) {
          closeLauncher()
        },
        function (o) {
          Genesys('command', 'Messenger.close')
        }
      )
    }

};

function toggleMessenger(){
    Genesys("command", "Messenger.open", {},
      function(o){},  // if resolved

      function(o){    // if rejected
        Genesys("command", "Messenger.close");
      }
    );
}

function setCustomProperties() {

    var widgetSelected = $(".choice");
    for(var i=0; i<widgetSelected.length; i++){
        var element = widgetSelected.eq(i);

        if(element.hasClass('active')) {
            //do something with element
            switch(element.attr('id')) {
                case "Login": 
                    Genesys('command', 'Database.set', {
                        messaging: {
                        customAttributes: {
                            FIRST_NAME: $('input[name="firstname"]').val(),
                            LAST_NAME: $('input[name="lastname"]').val(),
                            EMAIL: $('input[name="email"]').val(),
                            LAUNCH_KEY: 'MY_ACCOUNT_PRE_LOGIN'
                        },
                        },
                    })
                    break;
                case "General": 
                    Genesys('command', 'Database.set', {
                        messaging: {
                                customAttributes: {
                                FIRST_NAME: $('input[name="firstname"]').val(),
                                LAST_NAME: $('input[name="lastname"]').val(),
                                EMAIL: $('input[name="email"]').val(),
                                LAUNCH_KEY: 'CUSTOM',
                                LIBRARY_ID: $('input[name="libraryId"]').val(),
                                SHELF_TAGS: $('input[name="shelfTags"]').val(),
                                GEM_ID: $('input[name="gemId"]').val(),
                                TARGET_QUEUE:$('input[name="targetQueue"]').val()
                            },
                        },
                    })
                    break;
                case "PSU": 
                    Genesys('command', 'Database.set', {
                        messaging: {
                                customAttributes: {
                                FIRST_NAME: $('input[name="firstname"]').val(),
                                LAST_NAME: $('input[name="lastname"]').val(),
                                EMAIL: $('input[name="email"]').val(),
                                LAUNCH_KEY: 'UNDERWRITING_LIMITw'
                            },
                        },
                    })
                    break;
                case "Workplace": 
                    Genesys('command', 'Database.set', {
                      messaging: {
                              customAttributes: {
                              FIRST_NAME: $('input[name="firstname"]').val(),
                              LAST_NAME: $('input[name="lastname"]').val(),
                              EMAIL: $('input[name="email"]').val(),
                              SCHEME_ID:  $('input[name="schemeId"]').val(),
                              PRODUCT_TYPE: $('input[name="productType"]').val(),
                              POLICIES: $('input[name="policyId"]').val(),
                              VALUATION_CLASS: $('input[name="valueClass"]').val(),
                              LAUNCH_KEY: "clemouk.github.io"
                          },
                      },
                  })
                  autoLaunch=true;
                  break;
                default: 
                  //alert('default')
                  Genesys('command', 'Database.set', {
                    messaging: {
                        customAttributes: {
                            FIRST_NAME: $('input[name="firstname"]').val(),
                            LAST_NAME: $('input[name="lastname"]').val(),
                            EMAIL: $('input[name="email"]').val(),
                        },
                    },
                })                
            }
        };

    };
     
}

async function getUrls() {
  let token = JSON.parse(localStorage.getItem('_actmu')).value
  let data = {
    check: 'lego',
    rowid: token,
    datatableid: datatableId,
  }
  let post = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  console.log('getting results...')
  let results = await post.json()
  console.log(results)
  if (results?.key) {
    openCustomPopUp(results.survey, results.transcript)
  }
  if (results?.error?.status === 404 && retry) {
    console.log('no results... retry in 15sec')
    retry = false
    setTimeout(function () {
      getUrls()
    }, 15000)
  }
}



//Bootstrap iFrame Invite
function openCustomPopUp(survey, transcript) {
  //document.getElementById('transcriptbutton').href = transcript
  //document.getElementById('surveybutton').href = survey
  document.getElementById('CustomPopUpDiv').style = 'z-index: 999999999'
  document.getElementById('CustomPopUp').className = 'toast show'
}

//Bootstrap iFrame Invite
function closeCustomPopUp() {
  document.getElementById('CustomPopUp').className = 'toast hide'
  document.getElementById('CustomPopUpDiv').style = 'z-index: 0'
}