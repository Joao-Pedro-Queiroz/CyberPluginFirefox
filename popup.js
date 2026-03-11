function addList(id, items, formatter = null) {
  const ul = document.getElementById(id);
  ul.innerHTML = "";

  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhum item detectado";
    ul.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = formatter ? formatter(item) : item;
    ul.appendChild(li);
  });
}

function calculateScore(data) {
  let score = 100;

  score -= (data.thirdPartyCount || 0) * 7;
  score -= (data.cookieAnalysis?.thirdParty || 0) * 5;
  score -= (data.cookieAnalysis?.persistent || 0) * 2;

  if (data.localStorageUsed) score -= 10;
  if (data.sessionStorageUsed) score -= 5;
  if (data.indexedDBUsed) score -= 8;
  if ((data.canvasFingerprintSignals || []).length > 0) score -= 20;
  if ((data.cookieSyncSignals || []).length > 0) score -= 15;
  if ((data.hijackingSignals || []).length > 0) score -= 20;

  if (score < 0) score = 0;

  let label = "Alta";
  if (score < 70) label = "Média";
  if (score < 40) label = "Baixa";

  return `${score}/100 (${label})`;
}

async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function render() {
  document.getElementById("status").textContent = "Coletando dados...";

  const tab = await getActiveTab();
  if (!tab?.id) {
    document.getElementById("status").textContent = "Nenhuma aba ativa.";
    return;
  }

  const backgroundData = await browser.runtime.sendMessage({ type: "GET_TAB_ANALYSIS" });

  let pageSignals = {
    localStorageUsed: false,
    sessionStorageUsed: false,
    indexedDBUsed: false,
    localStorageItems: 0,
    sessionStorageItems: 0,
    indexedDBSignals: [],
    canvasFingerprintSignals: [],
    hijackingSignals: []
  };

  try {
    pageSignals = await browser.tabs.sendMessage(tab.id, { type: "GET_PAGE_SIGNALS" });
  } catch {
    // ignora páginas internas
  }

  const data = {
    ...backgroundData,
    ...pageSignals
  };

  document.getElementById("site").textContent = data.mainHost || "-";
  document.getElementById("requests").textContent = data.totalRequests ?? 0;
  document.getElementById("thirdPartyCount").textContent = data.thirdPartyCount ?? 0;
  document.getElementById("score").textContent = calculateScore(data);

  document.getElementById("cookiesTotal").textContent = data.cookieAnalysis?.total ?? 0;
  document.getElementById("cookiesFirstParty").textContent = data.cookieAnalysis?.firstParty ?? 0;
  document.getElementById("cookiesThirdParty").textContent = data.cookieAnalysis?.thirdParty ?? 0;
  document.getElementById("cookiesSession").textContent = data.cookieAnalysis?.session ?? 0;
  document.getElementById("cookiesPersistent").textContent = data.cookieAnalysis?.persistent ?? 0;

  document.getElementById("localStorage").textContent =
    `${data.localStorageUsed ? "Sim" : "Não"} (${data.localStorageItems || 0} itens)`;

  document.getElementById("sessionStorage").textContent =
    `${data.sessionStorageUsed ? "Sim" : "Não"} (${data.sessionStorageItems || 0} itens)`;

  document.getElementById("indexedDB").textContent =
    `${data.indexedDBUsed ? "Sim" : "Não"}`;

  addList("thirdPartyHosts", data.thirdPartyHosts || []);
  addList("canvasSignals", data.canvasFingerprintSignals || []);
  addList(
    "cookieSyncSignals",
    data.cookieSyncSignals || [],
    (item) => `${item.host} - ${item.reason}`
  );
  addList("hijackingSignals", data.hijackingSignals || []);

  document.getElementById("status").textContent = "Análise concluída.";
}

document.getElementById("reload").addEventListener("click", async () => {
  await browser.runtime.sendMessage({ type: "RESET_TAB_ANALYSIS" });
  const tab = await getActiveTab();
  if (tab?.id) {
    await browser.tabs.reload(tab.id);
  }
});

render();