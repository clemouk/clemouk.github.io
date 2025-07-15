  // ====================
    // Helper functions
    // ====================



    function rgbToHex(rgb) {
        const result = rgb.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        if (!result) return rgb; // If the format doesn't match, return the original value.
        function toHex(num) {
          let hex = parseInt(num, 10).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        }
        return "#" + toHex(result[1]) + toHex(result[2]) + toHex(result[3]);
      }
  
      function displayGemColorReport(report) {
    const container = document.getElementById('gemReport');
    container.innerHTML = ""; // Clear previous content
  
    // Create a table.
    const table = document.createElement('table');
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    
    // Create header row.
    const header = document.createElement('tr');
    ['Gem ID', 'Element Tag', 'Property', 'Original', 'Updated'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.padding = "4px";
      header.appendChild(th);
    });
    table.appendChild(header);
  
    // Create rows for each report entry.
    for (let gemId in report) {
      report[gemId].forEach(change => {
        const row = document.createElement('tr');
        [gemId, change.tag, change.property, change.original, change.updated].forEach(cellText => {
          const td = document.createElement('td');
          td.textContent = cellText;
          td.style.padding = "4px";
          row.appendChild(td);
        });
        table.appendChild(row);
      });
    }
  
    container.appendChild(table);
  }
  
  function generateCSVFromReport(report) {
    const rows = [];
    rows.push(["Gem ID", "Element Tag", "Property", "Original", "Updated"].join(","));
    for (let gemId in report) {
      report[gemId].forEach(change => {
        rows.push([gemId, change.tag, change.property, change.original, change.updated].join(","));
      });
    }
    return rows.join("\n");
  }
  
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
      function parseStyleAttributes(styleStr) {
        const styleObj = {};
        if (!styleStr) return styleObj;
        styleStr.split(';').forEach(s => {
          s = s.trim();
          if (!s) return;
          const parts = s.split(':');
          if (parts.length >= 2) {
            const key = parts[0].trim().toLowerCase();
            const value = parts.slice(1).join(':').trim().toLowerCase();
            styleObj[key] = value;
          }
        });
        return styleObj;
      }
  
      function objectToStyleString(styleObj) {
        return Object.entries(styleObj)
                     .map(([k, v]) => `${k}: ${v}`)
                     .join('; ');
      }
  
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
  
      function logMessage(message) {
        const logDiv = document.getElementById("log");
        const p = document.createElement("p");
        p.textContent = message;
        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight;
      }
  
      async function fetchWithRetry(url, options, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
          try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
          } catch (err) {
            logMessage(`Request failed (attempt ${i+1}/${attempts}): ${err}`);
            if (i < attempts - 1) {
              await sleep(2000);
            } else {
              logMessage(`Request permanently failed after ${attempts} attempts: ${err}`);
              return { ok: false };
            }
          }
        }
      }
  
      function isValidUrl(url) {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      }
  
      function extractUrls(htmlContent, baseUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        let urls = [];
        const aTags = doc.querySelectorAll('a[href]');
        aTags.forEach(a => {
          try {
            const fullUrl = new URL(a.getAttribute('href'), baseUrl).href;
            if (isValidUrl(fullUrl)) urls.push(fullUrl);
          } catch (e) { }
        });
        const text = doc.body.textContent;
        const urlPattern = /https?:\/\/[^\s]+/g;
        const foundUrls = text.match(urlPattern) || [];
        foundUrls.forEach(u => { if (isValidUrl(u)) urls.push(u); });
        const wwwPattern = /\bwww\.[^\s]+\.[a-zA-Z]{2,}(?:\/\S*)?/g;
        const foundWww = text.match(wwwPattern) || [];
        foundWww.forEach(w => {
          const candidate = "http://" + w;
          if (isValidUrl(candidate)) urls.push(candidate);
        });
        return Array.from(new Set(urls));
      }

      function updateArticleCopyProgress(current, total) {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        const bar = document.getElementById("articleProgressBar");
        const label = document.getElementById("articleProgressLabel");
      
        if (bar) bar.style.width = `${percent}%`;
        if (label) label.innerText = `Copied ${current} of ${total} articles (${percent}%)`;
      }
      
  
      // ====================
      // API calls (using Shelf.io endpoints)
      // ====================
      const baseUrl = "https://api.shelf.io/";
      async function createFoldersRecursively(node, parentId, createFolderUrl, headers, oldToNewFolderMap) {
        let createdId = parentId;
        if (!node.is_root) {
          const payload = {
            title: node.title,
            parentId: parentId,
            meta: {
              creationLocation: "api",
              creationSource: "api",
              creationType: "single"
            }
          };
          try {
            const response = await fetchWithRetry(createFolderUrl, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to create folder');
            const data = await response.json();
            createdId = data.gem._id;
            logMessage(`Created folder '${node.title}' with id '${createdId}' under parent '${parentId}'.`);
            oldToNewFolderMap[node.gemId] = createdId;
          } catch (e) {
            logMessage(`Failed to create folder for ${node.title}: ${e}`);
            return parentId;
          }
        }
        for (const child of node.children) {
          await createFoldersRecursively(child, createdId, createFolderUrl, headers, oldToNewFolderMap);
        }
        return createdId;
      }
      async function getWikiContent(headers, gemId) {
        const url = `${baseUrl}content/v1/gems/${gemId}/wiki-content`;
        const response = await fetchWithRetry(url, { method: 'GET', headers: headers });
        if (!response.ok) {
          logMessage(`Failed to get wiki content for gem ${gemId}`);
          return "";
        }
        return await response.text();
      }
  
      // For Decision Tree articles, retrieve combined content.
      async function getGemCombinedContent(headers, gemId) {
        const url = `${baseUrl}gems/${gemId}/combined-content?format=html`;
        const response = await fetchWithRetry(url, { method: 'GET', headers: headers });
        if (!response.ok) {
          logMessage(`Failed to get combined content for gem ${gemId}`);
          return null;
        }
        try {
          return await response.json();
        } catch (e) {
          logMessage(`Error parsing combined content JSON for gem ${gemId}: ${e}`);
          return null;
        }
      }
  
      // Decision Tree helper functions:
      async function getDecisionTreeSteps(headers, gemId) {
        const url = `${baseUrl}decision-tree/steps-settings?gemId=${gemId}`;
        const response = await fetchWithRetry(url, { method: 'GET', headers: headers });
        if (!response.ok) {
          logMessage(`Failed to get decision tree steps for gem ${gemId}`);
          return null;
        }
        try {
          return await response.json();
        } catch (e) {
          logMessage(`Error parsing decision tree steps JSON for gem ${gemId}: ${e}`);
          return null;
        }
      }
  
      async function getStepContent(headers, gemId, stepId) {
        const url = `${baseUrl}decision-tree/step?gemId=${gemId}&stepId=${stepId}`;
        const response = await fetchWithRetry(url, { method: 'GET', headers: headers });
        if (!response.ok) {
          logMessage(`Failed to get step content for gem ${gemId}, step ${stepId}`);
          return null;
        }
        try {
          return await response.json();
        } catch (e) {
          logMessage(`Error parsing step content JSON for gem ${gemId}, step ${stepId}: ${e}`);
          return null;
        }
      }
  
      async function updateStepText(headers, gemId, stepId, updatedText) {
        const url = `${baseUrl}decision-tree/step-text-draft?gemId=${gemId}`;
        const patchHeaders = { ...headers, "Content-Type": "application/json" };
        const payload = {
          stepId: stepId,
          text: updatedText
        };
        const response = await fetchWithRetry(url, { method: 'PUT', headers: patchHeaders, body: JSON.stringify(payload) });
        if (!response.ok) {
          logMessage(`Failed to update step text for gem ${gemId}, step ${stepId}`);
          return null;
        }
        try {
          return await response.json();
        } catch (e) {
          logMessage(`Error parsing update step text response for gem ${gemId}, step ${stepId}: ${e}`);
          return null;
        }
      }
  
      async function updateDecisionTreeSteps(headers, gemId, steps) {
        const url = `${baseUrl}decision-tree/steps?gemId=${gemId}`;
        const patchHeaders = { ...headers, "Content-Type": "application/json" };
        const payload = { steps: steps };
        const response = await fetchWithRetry(url, { method: 'PUT', headers: patchHeaders, body: JSON.stringify(payload) });
        if (!response.ok) {
          logMessage(`Failed to update decision tree steps for gem ${gemId}`);
          return null;
        }
        try {
          return await response.json();
        } catch (e) {
          logMessage(`Error parsing update decision tree steps response for gem ${gemId}: ${e}`);
          return null;
        }
      }
  
      function cleanStepsSettings(stepsSettings) {
        const cleanData = JSON.parse(JSON.stringify(stepsSettings)); // deep copy
        function recurseClean(obj) {
          if (obj && typeof obj === "object") {
            if ("textS3Key" in obj) {
              delete obj.textS3Key;
            }
            for (let key in obj) {
              recurseClean(obj[key]);
            }
          }
        }
        recurseClean(cleanData);
        return cleanData;
      }
  
      async function createDraft(headers, gemId) {
        const url = `${baseUrl}drafts`;
        const payload = { operation: "gem-update", gemId: gemId };
        const response = await fetchWithRetry(url, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
        if (!response.ok) {
          logMessage(`Failed to create draft for gem ${gemId}`);
          return null;
        }
        try {
          const data = await response.json();
          return data.draft.id;
        } catch (e) {
          logMessage(`Error parsing draft response for gem ${gemId}: ${e}`);
          return null;
        }
      }
      async function patchDraftWikiContent(headers, draftId, updatedHtml) {
        const url = `${baseUrl}drafts/${draftId}/gem/wiki-content`;
        const patchHeaders = { ...headers, "Content-Type": "text/html" };
        const response = await fetchWithRetry(url, {
          method: 'PATCH',
          headers: patchHeaders,
          body: updatedHtml
        });
        if (!response.ok) {
          logMessage(`Failed to patch wiki content for draft ${draftId}`);
          return false;
        }
        return true;
      }
  
      async function publishDraft(headers, draftId) {
        const url = `${baseUrl}drafts/${draftId}/publish`;
        const response = await fetchWithRetry(url, { method: 'POST', headers: headers });
        if (!response.ok) {
          logMessage(`Failed to publish draft ${draftId}`);
          return false;
        }
        return true;
      }
  
  
      // For Decision Trees: create a draft with discard logic.
      async function createDraftWithDiscardLogic(headers, gemId) {
        const createUrl = `${baseUrl}drafts`;
        const payload = { operation: "gem-update", gemId: gemId };
        let response = await fetchWithRetry(createUrl, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
        if (response.ok) {
          return response;
        }
        if (response.status === 409 || response.status === 403) {
          try {
            const body = await response.json();
            const errorCode = body.error && body.error.code ? body.error.code : "";
            if (errorCode === "GEM_CANNOT_HAVE_MULTIPLE_DRAFTS") {
              logMessage(`Active draft conflict for gem ${gemId}. Fetching existing drafts...`);
              const draftsResp = await getDecisionTreeSteps(headers, gemId);
              if (!draftsResp || !draftsResp.steps || draftsResp.steps.length === 0) {
                logMessage(`No active drafts found for gem ${gemId}. Aborting.`);
                return null;
              }
              let drafts = draftsResp.steps;
              drafts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
              let draftToDiscard = drafts.find(d => d.status !== "published" && d.status !== "discarded");
              if (!draftToDiscard) {
                logMessage(`No active draft to discard for gem ${gemId}.`);
                return null;
              }
              const draftIdToDiscard = draftToDiscard.id;
              logMessage(`Discarding draft ${draftIdToDiscard} for gem ${gemId}...`);
              const discardResp = await discardDraft(headers, draftIdToDiscard);
              if (!discardResp) {
                logMessage(`Failed discarding draft ${draftIdToDiscard} for gem ${gemId}.`);
                return null;
              }
              logMessage(`Re-trying create draft for gem ${gemId} after discard.`);
              response = await fetchWithRetry(createUrl, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
              if (response.ok) {
                return response;
              } else {
                logMessage(`Second attempt to create draft failed for gem ${gemId}.`);
                return null;
              }
            } else {
              logMessage(`Error code ${errorCode} received for gem ${gemId}.`);
              return null;
            }
          } catch (e) {
            logMessage(`Error handling draft conflict for gem ${gemId}: ${e}`);
            return null;
          }
        }
        return null;
      }
  
      async function discardDraft(headers, draftId) {
        const url = `${baseUrl}drafts/${draftId}/discard`;
        const response = await fetchWithRetry(url, { method: 'POST', headers: headers });
        if (!response.ok) {
          logMessage(`Failed to discard draft ${draftId}`);
          return false;
        }
        return true;
      }
  
      // ====================
      // ARTICLE TITLE UPDATE
      // ====================
      async function updateArticleTitle(headers, gemId, newTitle) {
        const url = `${baseUrl}content/v1/gems/${gemId}`;
        const payload = { title: newTitle };
        const response = await fetchWithRetry(url, { method: 'PATCH', headers: headers, body: JSON.stringify(payload) });
        if (!response.ok) {
          logMessage(`Failed to update title for gem ${gemId}`);
          return false;
        }
        logMessage(`Updated title for gem ${gemId} to "${newTitle}"`);
        return true;
      }
  
      // ====================
      // STYLE DISCOVERY
      // ====================
      function discoverStylesFromHTML(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const fontSizes = new Set();
        const h1Colors = new Set();
        const spanColors = new Set();
        const h2Colors = new Set();
        const h2Styles = new Set();
        const h3Colors = new Set();
        const h4Colors = new Set();
        const pColors  = new Set();
        const tableColors = new Set();
  
        const allEls = doc.querySelectorAll('[style]');
        allEls.forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style') || '');
          if (styleObj['font-size']) {
            // fontSizes.add(styleObj['font-size']);
          }
        });
  
        doc.querySelectorAll('h1[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['color']) h1Colors.add(styleObj['color']);
        });
        doc.querySelectorAll('span[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['color']) spanColors.add(styleObj['color']);
        });
  
        doc.querySelectorAll('h2[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['color']) h2Colors.add(styleObj['color']);
        });
  
        doc.querySelectorAll('h3[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['color']) h3Colors.add(styleObj['color']);
        });
        doc.querySelectorAll('h4[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['color']) h4Colors.add(styleObj['color']);
        });
  
        doc.querySelectorAll('p[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['color']) pColors.add(styleObj['color']);
        });
  
        doc.querySelectorAll('table[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['bgcolor']) tableColors.add(styleObj['bgcolor']);
          if (styleObj['color']) tableColors.add(styleObj['color']);
        });
        doc.querySelectorAll('td[style]').forEach(el => {
          const styleObj = parseStyleAttributes(el.getAttribute('style'));
          if (styleObj['bgcolor']) tableColors.add(styleObj['bgcolor']);
          if (styleObj['color']) tableColors.add(styleObj['color']);
          if (styleObj['background-color']) tableColors.add(styleObj['background-color']);
  
        });
        doc.querySelectorAll('table[bgcolor]').forEach(el => {
          let bgcolor = el.getAttribute('bgcolor');
          if (bgcolor) tableColors.add(bgcolor.trim().toLowerCase());
        });
        doc.querySelectorAll('td[bgcolor]').forEach(el => {
          let bgcolor = el.getAttribute('bgcolor');
          if (bgcolor) tableColors.add(bgcolor.trim().toLowerCase());
        });
        doc.querySelectorAll('td[background-color]').forEach(el => {
          let bgcolor = el.getAttribute('background-color');
          if (bgcolor) tableColors.add(bgcolor.trim().toLowerCase());
        });
    
  
        return {
          fontSizes: Array.from(fontSizes),
          h1Colors: Array.from(h1Colors),
          h2Colors: Array.from(h2Colors),
          h2Styles: Array.from(h2Styles),
          h3Colors: Array.from(h3Colors),
          h4Colors: Array.from(h4Colors),
          pColors: Array.from(pColors),
          spanColors: Array.from(spanColors),
          tableColors: Array.from(tableColors)
        };
      }
      async function displayGemStylesDropdown(articles) {
        const container = document.getElementById("gemStylesContainer");
        container.innerHTML = ""; // Clear previous content
        for (const article of articles) {
          // Create a collapsible section using <details> and <summary>
          const details = document.createElement("details");
          const summary = document.createElement("summary");
          summary.textContent = article.title;
          details.appendChild(summary);
    
          // Retrieve the wiki content (for Note articles only; you might skip DTs)
          let wikiHtml = "";
          if (article.gemType && article.gemType.toLowerCase() === "decision tree" || article.gemType && article.gemType.toLowerCase() === "document") {
            // Optionally, you could choose to display DT content differently.
            continue
          } else {
            wikiHtml = await getWikiContent(window.headersGlobal, article.new_gem_id);
          }
    
          const styles = discoverStylesFromHTML(wikiHtml);
          const ul = document.createElement("ul");
          for (const key in styles) {
            if (styles[key].length > 0) {
              const li = document.createElement("li");
              li.textContent = `${key}: ${styles[key].join(", ")}`;
              ul.appendChild(li);
            }
          }
          details.appendChild(ul);
          container.appendChild(details);
        }
      }
      async function discoverAllStyles(headers, articles) {
        const discovered = {
          fontSizes: new Set(),
          h1Colors: new Set(),
          h2Colors: new Set(),
          h2Styles: new Set(),
          h3Colors: new Set(),
          h4Colors: new Set(),
          pColors: new Set(),
          spanColors: new Set(),
          tableColors: new Set()
        };
        for (const article of articles) {
    // Check if this article is a Decision Tree
        if (article.type && article.type.toLowerCase() === "decision tree" ||article.type && article.type.toLowerCase() === "document" ) {
          continue;  // Skip processing for decision tree articles.
        }
        // Otherwise, process wiki articles:
        const wikiHtml = await getWikiContent(headers, article.new_gem_id);
        const articleStyles = discoverStylesFromHTML(wikiHtml);
        articleStyles.fontSizes.forEach(val => discovered.fontSizes.add(val));
        articleStyles.h1Colors.forEach(val => discovered.h1Colors.add(val));
        articleStyles.h2Colors.forEach(val => discovered.h2Colors.add(val));
        articleStyles.h2Styles.forEach(val => discovered.h2Styles.add(val));
        articleStyles.h3Colors.forEach(val => discovered.h3Colors.add(val));
        articleStyles.h4Colors.forEach(val => discovered.h4Colors.add(val));
        articleStyles.spanColors.forEach(val => discovered.spanColors.add(val));
        articleStyles.pColors.forEach(val => discovered.pColors.add(val));
        articleStyles.tableColors.forEach(val => discovered.tableColors.add(val));
      }
        return {
          fontSizes: Array.from(discovered.fontSizes),
          h1Colors: Array.from(discovered.h1Colors),
          h2Colors: Array.from(discovered.h2Colors),
          h2Styles: Array.from(discovered.h2Styles),
          h3Colors: Array.from(discovered.h3Colors),
          h4Colors: Array.from(discovered.h4Colors),
          spanColors: Array.from(discovered.spanColors),
  
          pColors: Array.from(discovered.pColors),
          tableColors: Array.from(discovered.tableColors)
        };
      }
  
      // ====================
      // DYNAMIC STYLE OVERRIDE FORM
      // ====================
      function displayStyleOverrideForm(discovered) {
    const container = document.getElementById("styleOverrideContainer");
    let clientNameHtml = `<div id="clientNameContainer">
      <label>Client Name:
        <input type="text" id="clientName" placeholder="Enter client name">
      </label>
    </div>`;
    container.innerHTML =
      "<h2>Style Overrides</h2>" +
      "<p>Please enter a new value for each discovered style (leave blank for no change).</p>" +
      clientNameHtml;
  
    // ======= Customization: Colors to Exclude and Auto-Override =======
    // Add colors you want to exclude from the override form:
    const excludedColors = ['#ffffff', '#000000', '#e6e6e6', '#d6d6d6', '#c0c0c0', 'initial','rgb(42, 48, 59)', 'transparent',];
    // Map colors you want to automatically override.
    // For example, if a discovered color is "#fff", automatically override it with "#ffffff".
    const autoOverrideColors = {
      '#fff': '#ffffff',
      'rgb(255, 255, 255)': '#ffffff',
      'rgb(220, 58, 35)': '#dc3a23'
    };
    // ====================================================================
  
    let formHtml = "";
  
    // Aggregate all discovered colors from various categories into one set.
    // These keys originally held color values.
    const colorCategories = ['h1Colors', 'h2Colors', 'h3Colors', 'h4Colors', 'pColors', 'tableColors', 'spanColors'];
    const aggregatedColors = new Set();
    colorCategories.forEach(category => {
      discovered[category].forEach(color => {
          let normalizedColor = color.trim().toLowerCase();
            if (normalizedColor.startsWith('rgb(')) {
              normalizedColor = rgbToHex(normalizedColor);
            }
            if (excludedColors.includes(normalizedColor)) return;
            if (autoOverrideColors.hasOwnProperty(normalizedColor)) return;
            aggregatedColors.add(normalizedColor);
          });
        });
  
    if (aggregatedColors.size > 0) {
      formHtml += `<h3>Colors</h3>`;
      aggregatedColors.forEach(color => {
        const safeVal = color.replace(/[^a-z0-9]/gi, '');
        formHtml += `<div class="override-row">
          <label>For color "<strong>${color}</strong>", override to:
            <input type="color" class="override-field" data-category="color" data-old-value="${color}" id="override-color-${safeVal}" value="${color}" onchange="updateColorDisplay(this)">
            <span class="color-display" style="background-color: ${color};"></span>
          </label>
        </div>`;
      });
    }
  
    // Build sections for other non-color styles (like font sizes and H2 styles)
    formHtml += buildSection("Font Size", "fontSizes", discovered.fontSizes);
    formHtml += buildSection("H2 Style", "h2Styles", discovered.h2Styles);
  
    formHtml += `<br><button id="applyOverridesBtn" type="button">Apply Style Overrides & Update Articles</button>`;
    container.innerHTML += formHtml;
    document.getElementById("applyOverridesBtn").addEventListener("click", function(){
      // Pass autoOverrideColors into the processing function.
      processStyleOverrides(autoOverrideColors);
    });
  }
  
  function buildSection(title, categoryKey, discoveredValues) {
    if (!discoveredValues || discoveredValues.length === 0) return "";
    let html = `<h3>${title}</h3>`;
    // Determine input type (for colors we already handled, so this is for non-color properties).
    const inputType = title.toLowerCase().includes("color") && !title.toLowerCase().includes("style")
      ? "color"
      : "text";
    discoveredValues.forEach(val => {
      const safeVal = val.replace(/[^a-z0-9]/gi, '');
      // For non-color values, leave the input empty by default.
      const inputValue = (inputType === "color" && val.startsWith("#")) ? val : "";
      html += `<div class="override-row">
        <label>For ${title} value "<strong>${val}</strong>", override to:
          <input type="${inputType}" class="override-field" data-category="${categoryKey}" data-old-value="${val}" id="override-${categoryKey}-${safeVal}" value="${inputValue}" ${inputType==="color" ? 'onchange="updateColorDisplay(this)"' : ''}>
          ${inputType==="color" ? '<span class="color-display" style="background-color: '+inputValue+';"></span>' : ''}
        </label>
      </div>`;
    });
    return html;
  }
  
  function updateColorDisplay(inputElem) {
    const displaySpan = inputElem.parentElement.querySelector('.color-display');
    if (displaySpan) {
      displaySpan.textContent = inputElem.value;
      displaySpan.style.backgroundColor = inputElem.value;
    }
  }
  function displayGemColorReport(report) {
    const container = document.getElementById('gemReport');
    container.innerHTML = ""; // Clear previous content
  
    // Create a table.
    const table = document.createElement('table');
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    
    // Create header row.
    const header = document.createElement('tr');
    ['Gem ID', 'Element Tag', 'Property', 'Original', 'Updated'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.padding = "4px";
      header.appendChild(th);
    });
    table.appendChild(header);
  
    // Create rows for each report entry.
    for (let gemId in report) {
      report[gemId].forEach(change => {
        const row = document.createElement('tr');
        [gemId, change.tag, change.property, change.original, change.updated].forEach(cellText => {
          const td = document.createElement('td');
          td.textContent = cellText;
          td.style.padding = "4px";
          row.appendChild(td);
        });
        table.appendChild(row);
      });
    }
  
    container.appendChild(table);
  }
    
      // ====================
      // Process Override Form
      // ====================
      function processStyleOverrides(autoOverrideColors) {
    const overrideFields = document.querySelectorAll('.override-field');
    const overrides = {};
  
    overrideFields.forEach(input => {
      const category = input.dataset.category;
      const oldValue = input.dataset.oldValue;
      
      // Defensive checks: if either attribute is missing, skip this input.
      if (!category) {
        console.warn("Missing data-category attribute on input:", input);
        return;
      }
      if (!oldValue) {
        console.warn("Missing data-old-value attribute on input:", input);
        return;
      }
  
      // If no new value is provided, keep the old value.
      let newValue = input.value.trim() || oldValue;
  
      // Ensure the category object exists.
      if (!overrides[category]) {
        overrides[category] = {};
      }
  
      // Map the original value to the new value.
      overrides[category][oldValue] = newValue;
    });
  
    // Merge autoOverrideColors into the color overrides. These will take precedence.
    if (!overrides.color) {
      overrides.color = {};
    }
    Object.keys(autoOverrideColors).forEach(key => {
      overrides.color[key] = autoOverrideColors[key];
    });
  
    console.log('Overrides to be applied:', overrides);
    
    // Use the overrides to update your articles.
    processArticlesWithOverrides(overrides);
  }
      // ====================
      // PHASE 2: Process Articles, Update Links, Styles & Titles
      // ====================
      async function processArticlesWithOverrides(overrideMapping) {
        const contentBlockId = document.getElementById("contentBlockId").value.trim();
        let gemColorReport = {}; // This will accumulate changes keyed by Gem ID
  
        // Build mapping for link replacement.
        const oldToNewMap = {};
        window.oldToNewArticleMap.forEach(item => {
          oldToNewMap[item.old_gem_id] = item.new_gem_id;
        });
        
        let identifiedUrlsMapping = [["Article Title", "Article URL", "Hyperlink", "Old Gem ID in Link", "New Gem ID to Replace With"]];
        let missingAnchors = [["ReferencingGemID", "ReferencingGemTitle", "LinkGemID", "MissingAnchor"]];
        
        for (const item of window.oldToNewArticleMap) {
          const newArticleId = item.new_gem_id;
          const newArticleTitle = item.title;
          const newArticleUrl = item.url
          // Use the gemType property to distinguish DT vs Note.
          const isDecisionTree = item.type && item.type.toLowerCase() === "decision tree";
          let wikiHtml = "";
    
          
          if (item.type && item.type.toLowerCase() === "document") {
  continue        }
          else {
            wikiHtml = await getWikiContent(window.headersGlobal, newArticleId);
          }
    
          const parser = new DOMParser();
          const doc = parser.parseFromString(wikiHtml, 'text/html');
    
          if (contentBlockId) {
            const elems = doc.querySelectorAll('[data-cb-id]');
            elems.forEach(el => {
              const currId = el.getAttribute('data-cb-id');
              if (currId !== "01JCCXQ66NJ9DEY62WNRVKR1J6") {
                el.setAttribute('data-cb-id', contentBlockId);
              }
            });
          }
          const currentOldGemId = item.old_gem_id;
  
          // Update link references.
          const gemidPattern = /^(?:https?:\/\/[^\/]+)?(\/read\/([0-9a-fA-F-]{36})(?:\/?(#[^"'\s]*)?)?)$/;
  const anchorTags = doc.querySelectorAll('a[href*="/read/"]');
  anchorTags.forEach(a => {
    const href = a.getAttribute('href');
    const match = href.match(gemidPattern);
    if (match) {
      const relativeLink = match[1];
      const oldId = match[2];
      const anchor = match[3] || '';
      // If the link is self-referencing, update it to just the anchor.
      if (oldId === currentOldGemId) {
        // If an anchor exists, use it; otherwise, default to '#' (or leave empty as needed).
        const newHref = anchor || "#";
        a.setAttribute('href', newHref);
        logMessage(`Self-link updated: ${href} -> ${newHref}`);
      } else {
        let newId = oldToNewMap[oldId] || (window.oldToNewFolderMap && window.oldToNewFolderMap[oldId]);
        if (newId) {
          const newHref = relativeLink.replace(oldId, newId);
          a.setAttribute('href', newHref);
          logMessage(`Updated link: ${href} -> ${newHref}`);
        } else {
          logMessage(`No mapping found for gem id ${oldId} in link: ${href}`);
        }
      }
    } else {
      logMessage(`Link did not match expected format: ${href}`);
    }
  });
          if (overrideMapping.color) {
    // Select all elements that have a style attribute
  
    doc.querySelectorAll('[style]').forEach(el => {
      let styleObj = parseStyleAttributes(el.getAttribute('style'));
      
      // Check for the "color" property
      if (styleObj['color']) {
        let normalizedColor = styleObj['color'].trim().toLowerCase();
        if (normalizedColor.startsWith('rgb(')) {
                  normalizedColor = rgbToHex(normalizedColor);
                }
        if (overrideMapping.color[normalizedColor]) {
          styleObj['color'] = overrideMapping.color[normalizedColor];
          logMessage(`Updated color for <${el.tagName}> from "${normalizedColor}" to "${styleObj['color']}"`);
            if (!gemColorReport[newArticleId]) gemColorReport[newArticleId] = [];
        gemColorReport[newArticleId].push({
          tag: el.tagName,
          property: 'color',
          original: normalizedColor,
          updated: styleObj['color']
        });
          }
      }
      
      // Now check for the "background-color" property
      if (styleObj['background-color']) {
        let normalizedBg = styleObj['background-color'].trim().toLowerCase();
        if (normalizedBg.startsWith('rgb(')) {
                  normalizedBg = rgbToHex(normalizedBg);
                }
        if (overrideMapping.color[normalizedBg]) {
          styleObj['background-color'] = overrideMapping.color[normalizedBg];
          logMessage(`Updated background-color for <${el.tagName}> from "${normalizedBg}" to "${styleObj['background-color']}"`);
            if (!gemColorReport[newArticleId]) gemColorReport[newArticleId] = [];
        gemColorReport[newArticleId].push({
          tag: el.tagName,
          property: 'background-color',
          original: normalizedBg,
          updated: styleObj['background-color']
        });
          }
      }
      
      // Update the style attribute with the potentially modified styles
      el.setAttribute('style', objectToStyleString(styleObj));
    });
    // Process elements with a bgcolor attribute
  doc.querySelectorAll('[bgcolor]').forEach(el => {
    let bgcolorVal = el.getAttribute('bgcolor');
     
    if (bgcolorVal) {
      let normalizedBg = bgcolorVal.trim().toLowerCase();
      if (normalizedBg.startsWith('rgb(')) {
                  normalizedBg = rgbToHex(normalizedBg);
                }
      if (overrideMapping.color[normalizedBg]) {
        let newColor = overrideMapping.color[normalizedBg];
        el.setAttribute('bgcolor', newColor);
        logMessage(`Updated bgcolor for <${el.tagName}> from "${normalizedBg}" to "${newColor}"`);
        if (!gemColorReport[newArticleId]) gemColorReport[newArticleId] = [];
        gemColorReport[newArticleId].push({
          tag: el.tagName,
          property: 'bgcolor',
          original: normalizedBg,
          updated: newColor
        });
      }
    }
  });
  
    console.log("Gem color update report:", gemColorReport);
  
  
  }
    
          // Now, update content based on article type.
          if (isDecisionTree) {
            //logMessage(`Processing Decision Tree article ${newArticleId}...`);
            // Retrieve the decision tree steps.
            const dtStepsData = await getDecisionTreeSteps(window.headersGlobal, newArticleId);
            if (!dtStepsData || !dtStepsData.steps) {
              logMessage(`Failed to retrieve decision tree steps for gem ${newArticleId}. Skipping.`);
              continue;
            }
            let steps = dtStepsData.steps;
            //logMessage(`Retrieved ${steps.length} steps for Decision Tree article ${newArticleId}.`);
  
            // Loop through each step.
            for (let step of steps) {
              //logMessage(`Processing step ${step.id} (type: ${step.type})`);
              // Retrieve the full step content.
              const stepContentResp = await getStepContent(window.headersGlobal, newArticleId, step.id);
              const stepContent = stepContentResp ? (stepContentResp.step || {}) : {};
              // Use the type from stepContent if available, otherwise fallback to step.type.
              const stepType = stepContent.type || step.type;
  
              // --- For Link steps ---
              if (stepType && stepType.toLowerCase() === "link" && step.url) {
                const dtMatch = step.url.match(/\/read\/([0-9a-fA-F-]{36})(?:\/?(#[^"'\s]*)?)?$/);
                if (dtMatch) {
                  const oldId = dtMatch[1];
                  const anchor = dtMatch[2] || '';
                  let newId = oldToNewMap[oldId] || (window.oldToNewFolderMap && window.oldToNewFolderMap[oldId]);
                  if (newId) {
                    const oldUrl = step.url;
                    step.url = step.url.replace(oldId, newId);
                    //logMessage(`Updated DT link step ${step.id}: ${oldUrl} -> ${step.url}`);
                  } else {
                    //logMessage(`No mapping found for link step gem id ${oldId} in step ${step.id}`);
                  }
                } else {
                  //logMessage(`No DT link match found in step ${step.id} for URL: ${step.url}`);
                }
              }
  
              // --- For Text steps ---
              if (stepContent.text) {
                //logMessage(`Processing DT text for step ${step.id}...`);
                const parserDT = new DOMParser();
                const docDT = parserDT.parseFromString(stepContent.text, 'text/html');
                const anchorTagsDT = docDT.querySelectorAll('a[href*="/read/"]');
                anchorTagsDT.forEach(a => {
                  const href = a.getAttribute('href');
                  const matchDT = href.match(/\/read\/([0-9a-fA-F-]{36})(?:\/?(#[^"'\s]*)?)?$/);
                  if (matchDT) {
                    const oldId = matchDT[1];
                    const anchor = matchDT[2] || '';
                    let newId = oldToNewMap[oldId] || (window.oldToNewFolderMap && window.oldToNewFolderMap[oldId]);
                    if (newId) {
                      const newHref = href.replace(oldId, newId);
                      a.setAttribute('href', newHref);
                      logMessage(`Updated DT anchor in text for step ${step.id}: ${href} -> ${newHref}`);
                    } else {
                      //logMessage(`No mapping found for DT anchor gem id ${oldId} in step ${step.id}`);
                    }
                  } else {
                    //logMessage(`DT link in text did not match expected format: ${href}`);
                  }
                });
                let newHTML = docDT.body.innerHTML;
                if (newHTML !== stepContent.text) {
                  //logMessage(`DT text changed for step ${step.id}. Updating step text...`);
                  stepContent.text = newHTML;
                  const updateResp = await updateStepText(window.headersGlobal, newArticleId, step.id, newHTML);
                  if (updateResp) {
                    //logMessage(`Successfully updated DT step text for step ${step.id}`);
                  } else {
                    //logMessage(`Failed to update DT step text for step ${step.id}`);
                  }
                } else {
                  //logMessage(`No changes detected in DT step text for step ${step.id}`);
                }
              }
            }
            // Clean the steps and push the updated steps.
            const cleaned = cleanStepsSettings({ steps: steps });
            const finalResp = await updateDecisionTreeSteps(window.headersGlobal, newArticleId, cleaned.steps);
            if (finalResp) {
              //logMessage(`Updated decision tree steps for gem ${newArticleId}`);
            } else {
              logMessage(`Failed to update decision tree steps for gem ${newArticleId}`);
            }
          } else {
            // Normal Note article processing.
            // (Retrieve wikiHtml and continue with standard processing.)
          }
  
  
    
          // Serialize updated HTML (for Note articles) and patch & publish.
          wikiHtml = doc.body.innerHTML;
          let draftId = null;
          if (!isDecisionTree) {
            draftId = await createDraft(window.headersGlobal, newArticleId);
          } else {
            // For DT articles, you already updated steps—skip the wiki content patch.
            draftId = null;
          }
    
          if (!isDecisionTree && draftId && await patchDraftWikiContent(window.headersGlobal, draftId, wikiHtml)) {
            if (await publishDraft(window.headersGlobal, draftId)) {
              logMessage(`Updated and published draft for article '${newArticleTitle}' (ID ${newArticleId}).`);
            } else {
              logMessage(`Failed to publish draft for article '${newArticleTitle}' (ID ${newArticleId}).`);
            }
          } else if (!isDecisionTree) {
            logMessage(`Failed to patch or create draft for article '${newArticleTitle}' (ID ${newArticleId}).`);
          }
        } // end for-each article
    
        //const urlsCSV = arrayToCSV(identifiedUrlsMapping);
        //const missingAnchorsCSV = arrayToCSV(missingAnchors);
        //createDownloadLink(urlsCSV, "identified_Wiki_URLs_with_mapping.csv");
        //createDownloadLink(missingAnchorsCSV, "missing_anchors.csv");
        logMessage("All articles updated successfully.");
        displayGemColorReport(gemColorReport);
    document.getElementById("downloadReportBtn").addEventListener("click", function() {
      const csv = generateCSVFromReport(gemColorReport);
      downloadCSV(csv, "gemColorReport.csv");
    });
    
    const clientName = document.getElementById("clientName").value.trim();
        const existingLibraryName = document.getElementById("existingLibraryName").value.trim();  if (clientName && existingLibraryName) {
    for (const article of window.oldToNewArticleMap) {
      let newTitle = article.title;
      if (article.title.includes(existingLibraryName)) {
        newTitle = article.title.replace("Copy of " + existingLibraryName, clientName);
      } else if (article.title.includes("BC - ")) {
        newTitle = article.title.replace("Copy of BC - ", clientName + " - ");
      }
      await updateArticleTitle(window.headersGlobal, article.new_gem_id, newTitle);
    }
  } else {
    logMessage("Client name or Existing Library Name not provided; skipping title update.");
  }
      }
    
      // ====================
      // MAIN PROCESS (Phase 1)
      // ====================
      async function mainProcess() {
        document.getElementById("log").innerHTML = "";
        document.getElementById("styleOverrideContainer").innerHTML = "";
        const articleBar = document.getElementById("articleProgressBar");
        if (articleBar) articleBar.style.width = "0%";
        document.getElementById("progressBar").style.display="none"
        
        const authToken = document.getElementById("authToken").value.trim();
        const sourceLibraryId = document.getElementById("sourceLibraryId").value.trim();
        const destOption = document.querySelector('input[name="destOption"]:checked').value;
        const newLibraryName = document.getElementById("newLibraryName").value.trim();
        let destinationLibraryId = "";
        if (destOption === "existing") {
          destinationLibraryId = document.getElementById("destinationLibraryId").value.trim();
        }
        
        window.headersGlobal = {
          "Authorization": authToken,
          "Content-Type": "application/json"
        };
    
        // Initialize global article mapping array.
        window.oldToNewArticleMap = [];
    
        // Retrieve folders
        const listFoldersUrl = `${baseUrl}search/list-gems`;
        const listFoldersPayload = {
          gemTypes: ["Directory"],
          parentId: [sourceLibraryId],
          size: 50
        };
        const foldersResponse = await fetchWithRetry(listFoldersUrl, {
          method: 'POST',
          headers: window.headersGlobal,
          body: JSON.stringify(listFoldersPayload)
        });
        if (!foldersResponse.ok) {
          logMessage("Failed to retrieve folders.");
          return;
        }
        const foldersData = await foldersResponse.json();
        const gems = foldersData.gems || [];
        const nodes = {};
        gems.forEach(gem => {
          nodes[gem.gemId] = { title: gem.title, gemId: gem.gemId, children: [] };
        });
        const root = {
          title: `Root (Library ${sourceLibraryId})`,
          gemId: sourceLibraryId,
          children: [],
          is_root: true
        };
        gems.forEach(gem => {
          const parents = gem.parentIds || [];
          if (parents.length === 0) {
            root.children.push(nodes[gem.gemId]);
          } else {
            let attached = false;
            for (const parentId of parents) {
              if (parentId === sourceLibraryId) {
                root.children.push(nodes[gem.gemId]);
                attached = true;
                break;
              } else if (nodes[parentId]) {
                nodes[parentId].children.push(nodes[gem.gemId]);
                attached = true;
                break;
              }
            }
            if (!attached) {
              root.children.push(nodes[gem.gemId]);
            }
          }
        });
    
  
        const pinnedContentUrl = "https://api.shelf.io/search/pinned-content-items";
  
        // Array to store the pinned gemIds from both library and folders.
        const pinnedGems = [];
  
        // Helper function to fetch pinned content for a given target and targetId.
        async function fetchPinnedContent(target, targetId) {
          const payload = {
            target: target,
            targetId: targetId,
            searchLanguage: "en",
            size: 5
          };
  
          try {
            const response = await fetchWithRetry(pinnedContentUrl, {
              method: 'POST',
              headers: window.headersGlobal,
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              logMessage(`Failed to retrieve pinned content for ${target} ${targetId}`);
              return;
            }
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              data.items.forEach(item => {
                // Map "library" to "group" as per your requirement.
                const newTarget = target === "library" ? "group" : "folder";
                logMessage(`Pinned content for ${target} ${targetId}: old gemId ${item.externalId}`);
                pinnedGems.push({ oldGemId: item.externalId, target: newTarget });
              });
            } else {
              logMessage(`No pinned content found for ${target} ${targetId}`);
            }
          } catch (error) {
            logMessage(`Error fetching pinned content for ${target} ${targetId}: ${error}`);
          }
        }
  
        // Fetch pinned content for the library itself.
        await fetchPinnedContent("library", sourceLibraryId);
  
        // Fetch pinned content for each folder (directory) returned.
        for (const gem of gems) {
          await fetchPinnedContent("folder", gem.gemId);
        }
  
        // Create new library if necessary.
        if (destOption === "new") {
          const createLibraryUrl = `${baseUrl}content/group-libraries`;
          const createLibraryPayload = {
            title: newLibraryName,
            meta: {
              creationLocation: "api",
              creationSource: "api"
            }
          };
          const createLibraryResponse = await fetchWithRetry(createLibraryUrl, {
            method: 'POST',
            headers: window.headersGlobal,
            body: JSON.stringify(createLibraryPayload)
          });
          if (!createLibraryResponse.ok) {
            logMessage("Failed to create new library.");
            return;
          }
          const newLibrary = await createLibraryResponse.json();
          destinationLibraryId = newLibrary._id;
          logMessage(`Created new library '${newLibraryName}' with ID: ${destinationLibraryId}`);
        } else if (!destinationLibraryId) {
          logMessage("Please provide a destination library ID.");
          return;
        }
    async function addLibraryToUserGroup(){
      let userGroupIds = ["01J01DE1WV7QFC2Z64SXDA31TG","01HZFPXAAWGTYAYAH004KB0N2G"]
      let headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": authToken
    }
    for(let selectedGroupId of userGroupIds){
      try {
        const groupDetailsResponse = await fetch(`https://api.shelf.io/user-groups/${selectedGroupId}`,{ headers
        });
        const groupDetails = await groupDetailsResponse.json();

        if (groupDetailsResponse.status !== 200) {
          console.log("Failed to fetch group details.");
          return;
        }

        const existingLibraries = groupDetails.libraries || [];

        const alreadyExists = existingLibraries.some(lib => lib.libId === destinationLibraryId);
        if (alreadyExists) {
          console.log("Library already exists in the group.");
          return;
        }

        const newLibraryEntry = {
          policyIds: ["shelf/policy#admin"],
          libId: destinationLibraryId,
          role: "admin"
        };

        existingLibraries.push(newLibraryEntry);

        const patchPayload = {
          libraries: existingLibraries
        };

        console.log("PATCH Payload:", patchPayload);

        const patchResponse = await fetch(`https://api.shelf.io/user-groups/${selectedGroupId}/libraries/`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(patchPayload)
        });

        if (patchResponse.status === 200) {
          console.log("Library successfully added to the group.");
        } else {
          console.log("Failed to update the group with new library.");
          console.error(await patchResponse.text());
        }

      } catch (error) {
        console.error("Error:", error);
        console.log("An error occurred while adding library to user group.");
      }
    }
    }
    addLibraryToUserGroup()
  // After replicating folders and creating the folder mapping
        const createFolderUrl = `${baseUrl}content/v1/folders`;
        const oldToNewFolderMap = {};
        await createFoldersRecursively(root, destinationLibraryId, createFolderUrl, window.headersGlobal, oldToNewFolderMap);
        window.oldToNewFolderMap = oldToNewFolderMap;
        logMessage("Folders replicated. Starting article copy...");
  
        // Retrieve articles (both Note and Decision Tree)
        const listArticlesPayload = {
          gemTypes: ["Note", "Decision Tree", "Document"],
          parentId: [sourceLibraryId],
          size: 400
        };
        const articlesResponse = await fetchWithRetry(listFoldersUrl, {
          method: 'POST',
          headers: window.headersGlobal,
          body: JSON.stringify(listArticlesPayload)
        });
        if (!articlesResponse.ok) {
          logMessage("Failed to retrieve articles.");
          return;
        }
        const articlesData = await articlesResponse.json();
  
        const articles = articlesData.gems || [];
        const totalArticles = articles.length;
        let copiedCount = 0;
        document.getElementById("progressBar").style.display="block"

        for (const article of articlesData.gems || []) {

          const oldGemId = article.gemId;
          const oldParentIds = article.parentIds || [];
          let newParentId = destinationLibraryId;
  
          // Loop through each parent ID and pick the first that is in the folder mapping.
          for (const oldParentId of oldParentIds) {
            if (oldToNewFolderMap[oldParentId]) {
              newParentId = oldToNewFolderMap[oldParentId];
              break;
            }
          }
  
          const copyUrl = `${baseUrl}gems/${oldGemId}/copy`;
          const copyPayload = { parentId: newParentId };
          const copyResponse = await fetchWithRetry(copyUrl, {
            method: 'POST',
            headers: window.headersGlobal,
            body: JSON.stringify(copyPayload)
          });
          if (!copyResponse.ok) {
            logMessage(`Failed to copy article ${article.title} (old ID ${oldGemId}).`);
            continue;
          }
  
          const copiedGem = await copyResponse.json();
          const newArticleId = copiedGem.gem._id;
          const newArticleTitle = copiedGem.gem.title;
          // Include gemType in the mapping so we know how to process later.
          const type = copiedGem.gem.type || article.type || "Note";
          const newArticleUrl = copiedGem.gemPageURL;
          window.oldToNewArticleMap.push({
            old_gem_id: oldGemId,
            new_gem_id: newArticleId,
            title: newArticleTitle,
            url: newArticleUrl,
            type: type
          });

          copiedCount++;
          updateArticleCopyProgress(copiedCount, totalArticles);


          logMessage(`Copied article '${article.title}' (old ID ${oldGemId}) to new ID ${newArticleId}.`);
        }
        updateArticleCopyProgress(totalArticles, totalArticles);
        logMessage("All articles copied. Now discovering style attributes across all articles...");
  
        for (const pinnedGem of pinnedGems) {
      // Find the copied article mapping for this pinned gem (using the old gem id).
          const mapping = window.oldToNewArticleMap.find(item => item.old_gem_id === pinnedGem.oldGemId);
          if (!mapping) {
            logMessage(`No copied article found for pinned gem with old ID ${pinnedGem.oldGemId}`);
            continue;
          }
          const newGemId = mapping.new_gem_id;
          const pinPayload = {
            gemIds: [newGemId],
            target: pinnedGem.target  // "group" for library-pinned, "folder" for folder-pinned
          };
          const pinUrl = "https://api.shelf.io/content/v1/gems/pins";
          const pinResponse = await fetchWithRetry(pinUrl, {
            method: 'POST',
            headers: window.headersGlobal,
            body: JSON.stringify(pinPayload)
          });
          if (!pinResponse.ok) {
            logMessage(`Failed to pin gem with new ID ${newGemId} for target ${pinnedGem.target}`);
            continue;
          }
          logMessage(`Pinned gem with new ID ${newGemId} for target ${pinnedGem.target}`);
        }
        //displayGemStylesDropdown(window.oldToNewArticleMap)
        const discovered = await discoverAllStyles(window.headersGlobal, window.oldToNewArticleMap);
        logMessage("Style discovery complete.");
        displayStyleOverrideForm(discovered);
      }
    
      // ====================
      // EVENT LISTENERS
      // ====================
      document.getElementById("newLibraryOption").addEventListener("change", function() {
        document.getElementById("newLibraryDiv").style.display = "block";
        document.getElementById("existingLibraryDiv").style.display = "none";
      });
      document.getElementById("existingLibraryOption").addEventListener("change", function() {
        document.getElementById("newLibraryDiv").style.display = "none";
        document.getElementById("existingLibraryDiv").style.display = "block";
      });
      document.getElementById("appForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        await mainProcess();
      });
      document.getElementById("existingLibraryName").addEventListener("change", function() {
        const selectedValue = document.getElementById("existingLibraryName").value;
        document.getElementById("sourceLibraryId").value = selectedValue;
      });
      document.getElementById("RunScript").addEventListener("click", async function(event) {
        //document.getElementById("RunScript").style
        event.preventDefault();
        await mainProcess();
      });