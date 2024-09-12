function clearConv() {

    Genesys('command', 'MessagingService.clearConversation', {}, function () {

        console.info('clear chat success')

    }, function () {

        console.info('clear chat failed')

        startMessengerConversation();

    })



}

function doRedirectToForgerock() {

    let e = localStorage.getItem('frAuthorisationUrl')

        , t = localStorage.getItem('frRedirectUrl');

    const s = new URL(e) + '?client_id=genesysMessagingAdviser&response_type=code&scope=openid email profile&redirect_uri=' + t;

    console.log('URL to Forgerock SCRAM: ' + s),

        console.log('About to redirect to Forgerock'),

        location.href = s

}



function startMessengerConversation() {

    console.info("starting conversation..")

    Genesys("command", "MessagingService.startConversation",

        {},

        function () {

            setGenesysDatabase();

        },

        function () {

            /*rejected callback*/

        }

    );

}



function setGenesysDatabase() {

    Genesys('command', 'Database.set', {

        messaging: {

            customAttributes: {

                agencyNumber: localStorage.getItem('chatAgencyNum'),

                agencyName: localStorage.getItem('chatAgencyAccountName'),

                syndication: localStorage.getItem('chatSyndName'),

                syndicationId: localStorage.getItem('chatSyndId'),

                source: localStorage.getItem('source'),

                originUrl: localStorage.getItem('originUrl'),

                browserType: getBrowserNameAndVer()[0],

                browserVersion: getBrowserNameAndVer()[1],

                deviceType: getDeviceTypeUsed()

            }

        }

    }, function () {

        setTimeout(() => { Genesys('command', 'Messenger.open') }, "500");

    });

    console.info('DataBase set.')

}



function testing() {

    Genesys("subscribe", "MessagingService.ready", function () {

        Genesys('subscribe', 'MessagingService.conversationCleared', function ({ data }) {

            startMessengerConversation();

        });

        Genesys("subscribe", "Messenger.opened", function () {

            'Y' === localStorage.getItem('firstPageAngular') && (console.info('cookie true'), clearConv(), localStorage.setItem('firstPageAngular', 'N'));

        });

    });



}



function genesysChat() {

    var e, n, r, t;

    e = window,

        n = 'Genesys',

        r = {

            environment: 'prod-euw2',

            deploymentId: localStorage.getItem('chatDeploymentId')

        },

        e._genesysJs = n,

        e[n] = e[n] || function () {

            (e[n].q = e[n].q || []).push(arguments)

        }

        ,

        e[n].t = 1 * new Date,

        e[n].c = r,

        (t = document.createElement('script')).async = 1,

        t.src = 'https://apps.euw2.pure.cloud/genesys-bootstrap/genesys.min.js',

        t.charset = 'utf-8',

        document.head.appendChild(t),

        testing(),

        $(document).ready(function () {

            Genesys && (Genesys('subscribe', 'GenesysJS.configurationReceived', function (n) {

                if (console.log('GenesysJS.configurationReceived', n),

                    n) {

                    const { deploymentConfig: o } = n.data || {}

                }

            }),

                Genesys('registerPlugin', 'AuthProvider', n => {

                    console.log('AuthProvider registerPlugin::inside angular webchat.js'),

                        n.registerCommand('getAuthCode', o => {

                            console.log('AuthProvider getAuthCode');

                            const { forceUpdate: r } = o.data || {};

                            if (r)

                                console.log('forced'),

                                    o.resolve();

                            else {

                                const t = {

                                    authCode: localStorage.getItem('brandAuth'),

                                    redirectUri: localStorage.getItem('frRedirectUrl')

                                };

                                console.log('sData::inside webchat.js', t),

                                    o.resolve(t)

                            }

                        }

                        ),

                        n.ready()

                }

                ))

        })

}

function getBrowserNameAndVer() {

    let r, t, i, e = navigator.userAgent, n = navigator.appName, o = '' + parseFloat(navigator.appVersion);

    -1 !== (t = e.indexOf('OPR')) ? (n = 'Opera',

        o = e.substring(t + 4),

        -1 !== (t = e.indexOf('Version')) && (o = e.substring(t + 8))) : -1 !== (t = e.indexOf('Edg')) ? (n = 'Microsoft Edge',

            o = e.substring(t + 4)) : -1 !== (t = e.indexOf('MSIE')) ? (n = 'Microsoft Internet Explorer',

                o = e.substring(t + 5)) : -1 !== (t = e.indexOf('Chrome')) ? (n = 'Chrome',

                    o = e.substring(t + 7)) : -1 !== (t = e.indexOf('Safari')) ? (n = 'Safari',

                        o = e.substring(t + 7),

                        -1 !== (t = e.indexOf('Version')) && (o = e.substring(t + 8))) : -1 !== (t = e.indexOf('Firefox')) ? (n = 'Firefox',

                            o = e.substring(t + 8)) : (r = e.lastIndexOf(' ') + 1) < (t = e.lastIndexOf('/')) && (n = e.substring(r, t),

                                o = e.substring(t + 1),

                                n.toLowerCase() === n.toUpperCase() && (n = navigator.appName)),

        -1 !== (i = o.indexOf(';')) && (o = o.substring(0, i)),

        -1 !== (i = o.indexOf(' ')) && (o = o.substring(0, i));

    let s = ['Unknown', 'Unknown'];

    return n && (s[0] = n),

        n && o && (s[1] = o),

        s

}

function getTablet() {

    const e = navigator.userAgent.toLowerCase();

    return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(e) ? 'Tablet' : 'notTablet'

}

function getDeviceTypeUsed() {

    return 'Tablet' === getTablet() ? 'Tablet' : window.innerWidth < 768 || screen.width < 768 ? 'Mobile' : 'Desktop'

}

