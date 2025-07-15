//localStorage.clear();

var userInfo = { Name: "", Email: "", Number: "", Phone: "", Message: "" };
var chatState = { Active: false, Visible: false };
var chatConfigOptions = { InputVisible: true, InitialMessage: false, InitialMessageText: "" };
const orgID = '7e563b76-2aa8-4f50-9402-4449fa13d9e6';
const regName = /^[a-zA-Z]+ [a-zA-Z]+$/;
const regPhone = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
const regemail = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
const regemail2 = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const borderColor = 'rgba(0,47,73,0.3)';


const localStorageClear = document.querySelector(".chatOptions-container .localStorageClear-icon");
const formOptions = document.querySelectorAll(".chatOptions-container .form-inputOptions");
const fieldContainer = document.querySelector(".floating-contact-form .form-container .fields-container");
const formInputs = document.querySelectorAll(".floating-contact-form .form-container .form-input");
const contactIcon = document.querySelector(".floating-contact-form .contact-icon");
const formContainer = document.querySelector(".floating-contact-form .form-container");
const submitButton = document.querySelector(".floating-contact-form  input[type='button']");
const minimizeButton = document.querySelector(".floating-contact-form .form-container .minimize-container i[id='minimizeIcon']");



//minimizeIcon
minimizeButton.addEventListener("click", () => {
    formContainer.classList.toggle("active");
});

submitButton.addEventListener("click", () => {
    submitButtonClick();
});

localStorageClear.addEventListener("click", () => {
    clearStorage();
    alert("Storage Cleared");
});

contactIcon.addEventListener("click", () => {
    iconButtonClick();
});
// added for when I pre populate the form.
formInputs.forEach(i => {
    if (i.value != "") {
        //we want to modify the previous element so order matters
        i.previousElementSibling.classList.add("active");
    }
});
//add event listeners to all imputs found
formInputs.forEach(i => {
    //event is on focus
    i.addEventListener("focus", () => {
        //we want to modify the previous element so order matters
        i.previousElementSibling.classList.add("active");
    })
});
//add event listeners to all imputs found
formInputs.forEach(i => {
    //event is on blur / focus removed
    i.addEventListener("blur", () => {
        if (i.value == "") {
            //we want to modify the previous element so order matters
            i.previousElementSibling.classList.remove("active");
        }
    })
});

formOptions.forEach(i => {
    //event is on change / Show Inputs Toggle
    i.addEventListener("change", () => {
        if (i.id == "InputVisible") {
            fieldContainer.classList.toggle("active");
        }
    })
});



function GetOptionsField(iD) {
    for (let i = 0; i < formOptions.length; i++) {
        if (formOptions[i].id == iD) {
            return formOptions[i];
        }
    }
}

function GetInputField(iD) {
    for (let i = 0; i < formInputs.length; i++) {
        if (formInputs[i].id == iD) {
            return formInputs[i];
        }
    }
}
function FixSpaces() {
    for (let i = 0; i < formInputs.length; i++) {
        if (formInputs[i].value != "" && formInputs[i].value != formInputs[i].value.trim()) {
            formInputs[i].value = formInputs[i].value.trim();
        }
    }
}
function ValidateInputField(el, regxv, titleName) {
    if (!regxv.test(el.value)) {
        el.focus();
        // el.style.outline = 'solid';
        el.style.borderColor = 'red';
        // el.previoussibling.value = titleName + ' - Please Fix.';
        return true;
    } else {
        el.style.borderColor = borderColor;
        el.style.outline = 'none';
        //el.previoussibling.value = titleName;
        // el.style.outline = 'none';
        return false;
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
//############ Web form logic Start

//get local storage
function allStorage() {
    var values = [], keys = Object.keys(localStorage), i = keys.length;
    while (i--) {
        values.push(keys[i] + ' -- ' + localStorage.getItem(keys[i]));
    }
    console.log(values);
    return values;
};

window.onbeforeunload = function () {
    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;
    while (i--) {
        if (keys[i].indexOf('gcm') > 0 || keys[i].indexOf('act') > 0) {
            localStorage.removeItem(keys[i]);
        }
    }
};
function clearStorage() {
    keys = Object.keys(localStorage),
        i = keys.length;
    while (i--) {
        if (keys[i].indexOf('gcm') > 0 || keys[i].indexOf('act') > 0) {
            localStorage.removeItem(keys[i]);
            console.log("key cleared");
        }
    }
};




function iconButtonClick() {
    console.log("Icon: chatState: " + chatState.Active + "\nIcon: Visible: " + chatState.Visible);
    chatConfigOptions = {
        InputVisible: GetOptionsField("InputVisible").checked,
        InitialMessage: GetOptionsField("InitialMessage").checked,
        InitialMessageText: GetOptionsField("InitialMessageText").value
    }
    if (chatState.Active) {
        if (chatState.Visible) {
            Genesys("command", "Messenger.close", {},
                function (o) { },  // if resolved
                function (o) { }    // if rejected
            );
        }
        else {
            Genesys("command", "Messenger.open", {},
                function (o) { },  // if resolved
                function (o) { }    // if rejected
            );
        }
    }
    else {
        formContainer.classList.toggle("active");
    }
}

function submitButtonClick() {
    FixSpaces();
    delay(200).then(() => startChat());
}

function startChat() {

    if (chatConfigOptions.InputVisible) {
        userInfo = {
            Name: GetInputField("customer_name").value,
            Email: GetInputField("email").value,
            Message: GetInputField("message").value,
            Number: GetInputField("custCountry").value,
            Phone: GetInputField("custPhone").value
        }
        if (ValidateInputField(GetInputField("name"), regName, 'Name')) { return; }
        if (ValidateInputField(GetInputField("email"), regemail2, 'E-mail')) { return; }

        console.log("Submit was clicked " + userInfo.Name);
        formContainer.classList.toggle("active");
        toggleMessengerWithData();
    }
    else {
        console.log("Submit was clicked No Site Data   " + userInfo.Name);
        formContainer.classList.toggle("active");
        toggleMessengerWithData();
    }

}

function minimizeButtonClick() {
    console.log("minimize was clicked");
}

function WriteLog1(o) {
    console.log("Log: " + o);
}
//############ Web form logic End


	(function (g, e, n, es, ys) {
		g['_genesysJs'] = e;
		g[e] = g[e] || function () {
		(g[e].q = g[e].q || []).push(arguments)
		};
		g[e].t = 1 * new Date();
		g[e].c = es;
		ys = document.createElement('script'); ys.async = 1; ys.src = n; ys.charset = 'utf-8'; document.head.appendChild(ys);
	})(window, 'Genesys', 'https://apps.usw2.pure.cloud/genesys-bootstrap/genesys.min.js', {
		environment: 'prod-usw2',
		deploymentId: orgID
	});


//############ Genesys Events
Genesys("subscribe", "Messenger.ready", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.started", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.oldMessages", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.historyComplete", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.restored", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.sessionCleared", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.reconnecting", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.reconnected", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.conversationReset", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.typingReceived", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.messagesUpdated", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.conversationDisconnected", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "Messenger.closed", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "Messenger.opened", function (o) { genesysEventTracker(o); });
Genesys("subscribe", "MessagingService.messagesReceived", function (o) { genesysEventTracker(o); });

function toggleMessengerWithData() {
    Genesys("command", "Messenger.open", {},
        function (o) { setGenesysData(); },  // if resolved
        function (o) {    // if rejected
            Genesys("command", "Messenger.close");
        }
    );
    if (chatConfigOptions.InitialMessage) {
        if (chatState.Active == false) {
            delay(1000).then(() => sendCustomMessage());
        }
    }
};

function setGenesysData() {
    if (chatConfigOptions.InputVisible) {
        Genesys("command", "Database.set", {
            messaging: {
                customAttributes: {
                    _FirstName: userInfo.Name,
                    _Email: userInfo.Email,
                    _Subject: userInfo.Message,
                    _CusotmerNumber: userInfo.Phone,
                    _UserID: userInfo.Number
                }
            }
        });
    }
};

function sendCustomMessage() {
    if (chatConfigOptions.InitialMessage) {
        Genesys("command", "MessagingService.sendMessage", {
            message: chatConfigOptions.InitialMessageText
        });
    }
};


function genesysEventTracker(o) {
    console.log(o.event + "\n");
    console.log(o);
    console.log("\n");
    if (o.event == 'messagingservice.messagesreceived') {
        console.log("O Type: " + o.data.messages[0].type);
        if (o.data.messages[0].type == 'Event') {
            console.log("O events: " + o.data.messages[0].events[0].presence.type);
            if (o.data.messages[0].events[0].presence.type == 'Disconnect') {
                chatState.Active = false;
            }
            else { chatState.Active = true; }
        }
        else {
            chatState.Active = true;
            if (chatState.Visible == false && o.data.messages[0].type == 'Text') {
                Genesys("command", "Messenger.open", {},
                    function (o) { },  // if resolved
                    function (o) { }    // if rejected
                );
            }
        }
    }
    if (o.event == 'messenger.opened') {
        var alldata = allStorage();
        console.log('start gettting localstorage messenger opened');
        console.log(alldata);
        chatState.Visible = true;
    }
    else if (o.event == 'messenger.closed') {
        chatState.Visible = false;
    }
    if (o.event == 'messagingservice.conversationdisconnected') {
        chatState.Active = false;
    }
    console.log("Chat Active: " + chatState.Active + " Visible = " + chatState.Visible);
}