"use strict";
let gc_socket, gc_token, gc_icon;
function setupWSS() {
  try {
    (gc_socket = new WebSocket(
      `wss://webmessaging.${gc_region}/v1?deploymentId=${gc_deploymentId}`
    )),
      (gc_socket.onmessage = async function (e) {
        let t = JSON.parse(e.data);
        if ((console.log(t), "SessionResponse" === t.class)) {
          let e = { action: "getJwt", token: gc_token };
          gc_socket.send(JSON.stringify(e));
        }
        "JwtResponse" === t.class && getHistory(t.body.jwt);
      }),
      console.log(
        `Waiting for events on wss://webmessaging.${gc_region}/v1?deploymentId=${gc_deploymentId}`
      ),
      (gc_socket.onopen = function () {
        let e = {
          action: "configureSession",
          deploymentId: `${gc_deploymentId}`,
          token: gc_token,
        };
        gc_socket.send(JSON.stringify(e));
      });
  } catch (e) {
    console.error("Websocket error: ", e);
  }
}
async function getHistory(e) {
  let t = await fetch(`https://api.${gc_region}/api/v2/webmessaging/messages`, {
      headers: { Authorization: `Bearer ${e}` },
    }),
    n = await t.json();
  console.log(n), createPdf(n);
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
    if (t?.content && "Attachment" == t.content[0].contentType) {
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
    n.setAuthor("https://github.com/mcphee11"),
    n.setSubject("Messaging transcript");
  const d = await n.saveAsBase64({ dataUri: !0 }),
    s = document.createElement("a");
  (s.href = d), (s.download = "transcript.pdf"), s.click(), loadingOff();
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
  e.drawText("Genesys", { x: o - 70, y: a - i * c, size: c, font: t });
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
    localStorage.getItem(`_${gc_deploymentId}:actmu`)
  ).value),
    displayButton();
});
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
    (e.title = "Download Chat"),
    (e.style = `cursor: pointer;\n      box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 5px -2px, rgba(0, 0, 0, 0.14) 0px 1px 4px 2px, rgba(0, 0, 0, 0.12) 0px 1px 4px 1px;\n      position: fixed !important;\n      bottom: 24px !important;\n      width: 56px;\n      height: 56px;\n      right: 96px !important;\n      border-radius: 50%;\n      background-color: ${gc_hexColor};\n      z-index: 9999;\n      border: 0px;`),
    "white" == gc_iconColor
      ? (e.innerHTML = downLoadSvgWhite)
      : (e.innerHTML = downLoadSvgBlack),
    document.body.appendChild(e);
}
function loadingOn() {
  let e = document.getElementById("gc_downloadButton");
  "white" == gc_iconColor
    ? (e.innerHTML = waitingLoadSvgWhite)
    : (e.innerHTML = waitingLoadSvgBlack);
}
function loadingOff() {
  let e = document.getElementById("gc_downloadButton");
  "white" == gc_iconColor
    ? (e.innerHTML = downLoadSvgWhite)
    : (e.innerHTML = downLoadSvgBlack);
}
