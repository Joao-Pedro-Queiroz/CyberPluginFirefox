const tabData = new Map();

let trackerDomains = [];
let userBlockList = [];
let blockedTrackers = [];

async function loadTrackerDomains() {
  try {
    const response = await fetch(browser.runtime.getURL("trackerList.json"));
    const data = await response.json();
    trackerDomains = data.trackers || [];
  } catch (error) {
    console.error("Erro ao carregar trackerList.json:", error);
    trackerDomains = [];
  }
}

async function loadUserBlockList() {
  try {
    const data = await browser.storage.local.get("userBlockList");
    userBlockList = data.userBlockList || [];
  } catch (error) {
    console.error("Erro ao carregar lista do usuário:", error);
    userBlockList = [];
  }
}

loadTrackerDomains();
loadUserBlockList();

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.userBlockList) {
    userBlockList = changes.userBlockList.newValue || [];
  }
});

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function getBaseDomain(hostname) {
  if (!hostname) return "";
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

function isThirdParty(mainHost, requestHost) {
  if (!mainHost || !requestHost) return false;

  const mainBase = getBaseDomain(mainHost);
  const reqBase = getBaseDomain(requestHost);

  return mainBase !== reqBase;
}

function classifyTrackerParty(mainHost, requestHost) {
  return isThirdParty(mainHost, requestHost) ? "Terceira parte" : "Primeira parte";
}

function isTracker(host) {
  if (!host) return false;
  return trackerDomains.some((domain) => host === domain || host.endsWith("." + domain));
}

function isUserBlocked(host) {
  if (!host) return false;
  return userBlockList.some((domain) => {
    const normalized = (domain || "").trim().toLowerCase();
    if (!normalized) return false;
    return host === normalized || host.endsWith("." + normalized);
  });
}

function ensureTab(tabId) {
  if (!tabData.has(tabId)) {
    tabData.set(tabId, {
      mainHost: null,
      requests: [],
      thirdPartyHosts: new Set(),
      cookieSyncSignals: [],
      blockedRequests: [],
      detectedTrackers: new Map()
    });
  }
  return tabData.get(tabId);
}

function hasTrackingIdPattern(url) {
  const patterns = [
    /[?&](id|uid|guid|userid|user_id|deviceid|device_id|partnerid|syncid|matchid|google_gid|fbclid|gclid)=/i,
    /\/sync/i,
    /\/match/i,
    /\/id/i,
    /pixel/i
  ];

  return patterns.some((pattern) => pattern.test(url));
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    const host = getHostname(tab.url);
    tabData.set(tabId, {
      mainHost: host,
      requests: [],
      thirdPartyHosts: new Set(),
      cookieSyncSignals: [],
      blockedRequests: [],
      detectedTrackers: new Map()
    });
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  tabData.delete(tabId);
});

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId < 0) return {};

    const tabInfo = ensureTab(details.tabId);
    const requestHost = getHostname(details.url);

    if (!tabInfo.mainHost && details.documentUrl) {
      tabInfo.mainHost = getHostname(details.documentUrl);
    }

    const thirdParty = isThirdParty(tabInfo.mainHost, requestHost);
    const trackerMatched = isTracker(requestHost);
    const userBlockedMatched = isUserBlocked(requestHost);
    const trackerParty = classifyTrackerParty(tabInfo.mainHost, requestHost);

    const requestRecord = {
      url: details.url,
      host: requestHost,
      type: details.type,
      method: details.method,
      thirdParty,
      trackerMatched,
      userBlockedMatched,
      trackerParty
    };

    tabInfo.requests.push(requestRecord);

    if (thirdParty && requestHost) {
      tabInfo.thirdPartyHosts.add(requestHost);
    }

    if (trackerMatched && requestHost) {
      tabInfo.detectedTrackers.set(requestHost, {
        host: requestHost,
        party: trackerParty
      });
    }

    if (thirdParty && hasTrackingIdPattern(details.url)) {
      tabInfo.cookieSyncSignals.push({
        host: requestHost,
        url: details.url,
        reason: "Requisição third-party com parâmetro típico de identificador"
      });
    }

    if ((trackerMatched || userBlockedMatched) && requestHost) {
      const blockedItem = {
        host: requestHost,
        url: details.url,
        reason: trackerMatched ? "Rastreador conhecido" : "Domínio bloqueado pelo usuário",
        party: trackerParty,
        time: new Date().toISOString(),
        tabId: details.tabId
      };

      tabInfo.blockedRequests.push(blockedItem);
      blockedTrackers.push(blockedItem);

      return { cancel: true };
    }

    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

async function getCookieAnalysis(pageUrl, mainHost) {
  try {
    if (!pageUrl || !pageUrl.startsWith("http")) {
      return {
        total: 0,
        firstParty: 0,
        thirdParty: 0,
        session: 0,
        persistent: 0,
        cookies: []
      };
    }

    const cookies = await browser.cookies.getAll({ url: pageUrl });

    let firstParty = 0;
    let thirdParty = 0;
    let session = 0;
    let persistent = 0;

    const normalized = cookies.map((c) => {
      const domain = (c.domain || "").replace(/^\./, "");
      const is3p = isThirdParty(mainHost, domain);

      if (is3p) thirdParty += 1;
      else firstParty += 1;

      if (c.session) session += 1;
      else persistent += 1;

      return {
        name: c.name,
        domain: domain,
        session: c.session,
        secure: c.secure,
        firstParty: !is3p,
        thirdParty: is3p
      };
    });

    return {
      total: cookies.length,
      firstParty,
      thirdParty,
      session,
      persistent,
      cookies: normalized
    };
  } catch {
    return {
      total: 0,
      firstParty: 0,
      thirdParty: 0,
      session: 0,
      persistent: 0,
      cookies: []
    };
  }
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message?.type === "GET_TAB_ANALYSIS") {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab) return null;

    const tabInfo = ensureTab(tab.id);
    const cookieAnalysis = await getCookieAnalysis(tab.url, tabInfo.mainHost);

    return {
      tabId: tab.id,
      url: tab.url,
      mainHost: tabInfo.mainHost,
      totalRequests: tabInfo.requests.length,
      thirdPartyHosts: Array.from(tabInfo.thirdPartyHosts),
      thirdPartyCount: tabInfo.thirdPartyHosts.size,
      cookieSyncSignals: tabInfo.cookieSyncSignals,
      cookieAnalysis,
      blockedRequests: tabInfo.blockedRequests,
      blockedCount: tabInfo.blockedRequests.length,
      detectedTrackers: Array.from(tabInfo.detectedTrackers.values()),
      detectedTrackerCount: tabInfo.detectedTrackers.size,
      trackerListSize: trackerDomains.length,
      userBlockListSize: userBlockList.length
    };
  }

  if (message?.type === "RESET_TAB_ANALYSIS") {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      tabData.set(tab.id, {
        mainHost: getHostname(tab.url),
        requests: [],
        thirdPartyHosts: new Set(),
        cookieSyncSignals: [],
        blockedRequests: [],
        detectedTrackers: new Map()
      });
    }
    return { ok: true };
  }

  if (message?.type === "OPEN_OPTIONS_PAGE") {
    await browser.runtime.openOptionsPage();
    return { ok: true };
  }

  return undefined;
});