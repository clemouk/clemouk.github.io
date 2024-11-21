let gc_socket, gc_token;

function setupWSS() {
  if(localStorage.getItem('_ttecConversationState')!='NEW') {  
    try {
      gc_socket = new WebSocket("wss://webmessaging.euw2.pure.cloud/v1?deploymentId=7082b91f-5ffd-4508-8ff6-b58ff931b058");
      
      gc_socket.onmessage = async function (e) {
          let t = JSON.parse(e.data);
          if ((console.log(t), "SessionResponse" === t.class)) {
            let e = { action: "getJwt", token: gc_token };
            gc_socket.send(JSON.stringify(e));
          }
          "JwtResponse" === t.class && getHistory(t.body.jwt);
      }

      console.log("Waiting for events on wss://webmessaging.euw2.pure.cloud/v1?deploymentId=7082b91f-5ffd-4508-8ff6-b58ff931b058");

      gc_socket.onopen = function () {
          let e = {
            action: "configureSession",
            deploymentId: "7082b91f-5ffd-4508-8ff6-b58ff931b058",
            token: gc_token,
          };
          gc_socket.send(JSON.stringify(e));
      };
    } catch (e) {
      console.error("Websocket error: ", e);
    }
  }
}

async function getHistory(e) {
  try {
    let t = await fetch("https://api.euw2.pure.cloud/api/v2/webmessaging/messages?pageSize=500", {
      headers: { Authorization: `Bearer ${e}` },
    }),
    n = await t.json();
  console.log(n), createPdf(n);
  } catch (err) {
    console.error("getHistory error: ", err);
  }
}

async function createPdf(e) {
  const t = await fetch(
      "https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf"
    ).then((e) => e.arrayBuffer()),
    n = await PDFLib.PDFDocument.create();
  n.registerFontkit(fontkit);
  const i = await n.embedFont(t);
  let o = n.addPage();
  const { width: a, height: c } = o.getSize();
  let g = 150,
    r = 3;
  for (const t of e.entities.reverse()) {
    let e,
      d = 1;
    if (t.content && "Attachment" == t.content[0].contentType) {
      if (
        "Image" == t.content[0].attachment.mediaType &&
        t.content[0].attachment.mime.includes("jpeg")
      ) {
        const i = await fetch(t.content[0].attachment.url).then((e) =>
          e.arrayBuffer()
        );
        (e = await n.embedJpg(i)), e.height > g && (d = g / e.height);
      }
      if (
        "Image" == t.content[0].attachment.mediaType &&
        t.content[0].attachment.mime.includes("png")
      ) {
        const i = await fetch(t.content[0].attachment.url).then((e) =>
          e.arrayBuffer()
        );
        (e = await n.embedPng(i)), e.height > g && (d = g / e.height);
      }
    }
    if (t.text) {
      if (
        (newPageNeeded_rec_txt(o, i, t.text, r, a, c, 12).value &&
          ((o = n.addPage()), (r = 3)),
        "Outbound" == t.direction)
      ) {
        r = agentText(o, i, t.text, r, a, c, 12, t.channel.time);
      }
      if ("Inbound" == t.direction) {
        r = customerText(o, i, t.text, r, a, c, 12, t.channel.time);
      }
    }
    if (e) {
      newPageNeeded_rec_img(o, r, c, e.scale(d).height, 12) &&
        ((o = n.addPage()), (r = 3));
      r = customerImage(o, i, e, d, r, a, c, 12, t.channel.time);
    }
  }
  
  n.setCreationDate(new Date()),
    n.setAuthor("https://www.volkswagen.co.uk"),
    n.setSubject("Messaging Transcript");

  // 21st October 2024 - Mick Hynes
  // this original code didn't work in Safari or Firefox in iOS
  // const d = await n.saveAsBase64({ dataUri: !0 }),
  //   s = document.createElement("a");
  // (s.href = d), (s.download = "transcript.pdf"), s.click(), loadingOff();

  // new code:
  const d = await n.saveAsBase64({ dataUri: false });
  const base64URL = d;//res.data;
  //const binary = atob(base64URL.replace(/\s/g, ''));
  const binary = atob(base64URL);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < len; i += 1) {
    view[i] = binary.charCodeAt(i);
  }
  // create the blob object with content-type "application/pdf"
  const blob = new Blob([view], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const s = document.createElement("a");
  (s.href = url), (s.download = "transcript.pdf"), s.click(), loadingOff();
}

function customerText(e, t, n, i, o, a, c, g) {
  let r = i + 2,
    d = r + 1,
    s = newPageNeeded_rec_txt(e, t, n, i, o, a, c);
  e.drawText("Customer", { x: 20, y: a - i * c, size: c, font: t });
  let h = {
    x: 20,
    y: a - r * c,
    maxWidth: o - 40,
    wordBreaks: [" "],
    font: t,
    size: c,
    lineHeight: c,
  };
  e.drawRectangle({
    x: 10,
    y: a - d * c - s.rec.height + c,
    height: s.rec.height + 20,
    width: s.rec.width + 20,
    color: PDFLib.rgb(0, 0.8, 1),
  }),
    e.drawText(n, h);
  let l = d + s.rec.lineCount;
  return e.drawText(g, { x: 20, y: a - l * c, size: 8, font: t }), l + 1;
}
function customerImage(e, t, n, i, o, a, c, g, r) {
  let d = o + 2 + 1;
  e.drawText("Customer", { x: 20, y: c - o * g, size: g, font: t }),
    e.drawImage(n, {
      x: 20,
      y: c - d * g - n.scale(i).height,
      width: n.scale(i).width,
      height: n.scale(i).height,
    });
  let s = d + n.scale(i).height / g + 1;
  return e.drawText(r, { x: 20, y: c - s * g, size: 8, font: t }), s + 1;
}
function agentText(e, t, n, i, o, a, c, g) {
  let r = i + 2,
    d = r + 1,
    s = newPageNeeded_rec_txt(e, t, n, i, o, a, c);
  e.drawText("Volkswagen Commercial Vehicles", { x: o - 70, y: a - i * c, size: c, font: t });
  let h = {
    x: o - s.rec.width - 20,
    y: a - r * c,
    maxWidth: o - 40,
    wordBreaks: [" "],
    font: t,
    size: c,
    lineHeight: c,
  };
  e.drawRectangle({
    x: o - s.rec.width - 30,
    y: a - d * c - s.rec.height + c,
    height: s.rec.height + 20,
    width: s.rec.width + 20,
    color: PDFLib.rgb(0.8, 0.6, 0),
  }),
    e.drawText(n, h);
  let l = d + s.rec.lineCount;
  return e.drawText(g, { x: o - 120, y: a - l * c, size: 8, font: t }), l + 1;
}
function newPageNeeded_rec_img(e, t, n, i, o) {
  let a = !1;
  return n - (t + 2 + 1) * o - i + o < 5 && (a = !0), a;
}
function newPageNeeded_rec_txt(e, t, n, i, o, a, c) {
  let g = i + 2 + 1,
    r = !1,
    d = drawMultilineText(e, n, {
      maxWidth: o - 40,
      wordBreaks: [" "],
      font: t,
      size: c,
      lineHeight: c,
    });
  return a - g * c - d.height + c < 5 && (r = !0), { value: r, rec: d };
}
function drawMultilineText(e, t, n) {
  const i = PDFLib.breakTextIntoLines(
      t,
      n.wordBreaks || e.doc.defaultWordBreaks,
      n.maxWidth,
      (e) => n.font.widthOfTextAtSize(e, n.size)
    ),
    o = i.length,
    a = o * n.lineHeight;
  return {
    width: Math.max(...i.map((e) => n.font.widthOfTextAtSize(e, n.size))),
    height: a,
    lineCount: o,
  };
}
Genesys("subscribe", "Launcher.ready", function () {
  (gc_token = JSON.parse(
    localStorage.getItem("_7082b91f-5ffd-4508-8ff6-b58ff931b058:actmu")
  ).value)
});
const testPrintIcon = 
    '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><g><rect x="133.875" y="401.625" width="286.875" height="19.125"/><rect x="133.875" y="459" width="286.875" height="19.125"/><path d="M497.25,191.25H459V57.375c0-21.038-17.213-38.25-38.25-38.25H133.875c-21.038,0-38.25,17.212-38.25,38.25V191.25h-38.25C24.862,191.25,0,216.112,0,248.625V420.75c0,32.513,24.862,57.375,57.375,57.375h38.25v19.125c0,21.037,17.212,38.25,38.25,38.25H420.75c21.037,0,38.25-17.213,38.25-38.25v-19.125h38.25c32.513,0,57.375-24.862,57.375-57.375V248.625C554.625,216.112,529.763,191.25,497.25,191.25z M114.75,57.375c0-9.562,7.65-19.125,19.125-19.125H420.75c9.562,0,19.125,7.65,19.125,19.125V191.25H114.75V57.375z M439.875,497.25c0,9.562-7.65,19.125-19.125,19.125H133.875c-9.562,0-19.125-7.65-19.125-19.125V363.375h325.125V497.25z M535.5,420.75c0,21.037-17.213,38.25-38.25,38.25H459V344.25H95.625V459h-38.25c-21.038,0-38.25-17.213-38.25-38.25V248.625c0-21.038,17.212-38.25,38.25-38.25H497.25c21.037,0,38.25,17.212,38.25,38.25V420.75z"/><circle cx="439.875" cy="267.75" r="19.125"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';
const downLoadSvgBlack =
    '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z"/></g></svg>',
  waitingLoadSvgBlack =
    '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,22l-0.01-6L14,12l3.99-4.01L18,2H6v6l4,4l-4,3.99V22H18z M8,7.5V4h8v3.5l-4,4L8,7.5z"/></g></svg>',
  downLoadSvgWhite =
    '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><g><rect fill="none" height="24" width="24"/></g><g><path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z"/></g></svg>',
  waitingLoadSvgWhite =
    '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,22l-0.01-6L14,12l3.99-4.01L18,2H6v6l4,4l-4,3.99V22H18z M8,7.5V4h8v3.5l-4,4L8,7.5z"/></g></svg>';
function displayButton() {
  let e = document.createElement("button");
  (e.onclick = function () {
    loadingOn(), setupWSS();
  }),
    (e.id = "gc_downloadButton"),
    (e.title = "Download Transcript"),
    (e.style = "cursor: pointer;\n      box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 5px -2px, rgba(0, 0, 0, 0.14) 0px 1px 4px 2px, rgba(0, 0, 0, 0.12) 0px 1px 4px 1px;\n      position: fixed !important;\n      bottom: 24px !important;\n      width: 56px;\n      height: 56px;\n      right: 96px !important;\n      border-radius: 50%;\n      background-color: #00B0F0;\n      z-index: 9999;\n      border: 0px;"),
    "white" == gc_iconColor
      ? (e.innerHTML = downLoadSvgWhite)
      : (e.innerHTML = downLoadSvgBlack),
    document.body.appendChild(e);
}
function loadingOn() {
  if(localStorage.getItem("_ttecConversationState")!="NEW") {
    let e = document.getElementById("gc_downloadButton");
    "white" == gc_iconColor
      ? (e.innerHTML = waitingLoadSvgWhite)
      : (e.innerHTML = waitingLoadSvgBlack);
  } else {
    alert("Please start a new conversation before attempting to download the transcript.");
  };
}
function loadingOff() {
  let e = document.getElementById("gc_downloadButton");
  "white" == gc_iconColor
    ? (e.innerHTML = downLoadSvgWhite)
    : (e.innerHTML = downLoadSvgBlack);
}
