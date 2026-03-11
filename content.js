(function () {
  const result = {
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
    if (window.localStorage) {
      result.localStorageItems = window.localStorage.length;
      result.localStorageUsed = result.localStorageItems > 0;
    }
  } catch {
    result.localStorageUsed = false;
  }

  try {
    if (window.sessionStorage) {
      result.sessionStorageItems = window.sessionStorage.length;
      result.sessionStorageUsed = result.sessionStorageItems > 0;
    }
  } catch {
    result.sessionStorageUsed = false;
  }

  try {
    if (window.indexedDB) {
      result.indexedDBUsed = true;
      result.indexedDBSignals.push("API IndexedDB disponível no contexto da página");
    }
  } catch {
    result.indexedDBUsed = false;
  }

  try {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      result.canvasFingerprintSignals.push("canvas.toDataURL chamado");
      return originalToDataURL.apply(this, args);
    };

    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (...args) {
      result.canvasFingerprintSignals.push("canvas.toBlob chamado");
      return originalToBlob.apply(this, args);
    };

    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      result.canvasFingerprintSignals.push("context.getImageData chamado");
      return originalGetImageData.apply(this, args);
    };
  } catch {
    // ignora
  }

  try {
    const suspiciousGlobals = [
      "beef",
      "hook",
      "__webdriver_script_fn",
      "_selenium",
      "callPhantom",
      "_phantom"
    ];

    suspiciousGlobals.forEach((key) => {
      if (key in window) {
        result.hijackingSignals.push(`Global suspeita detectada: ${key}`);
      }
    });
  } catch {
    // ignora
  }

  try {
    if (document.querySelectorAll("script").length > 50) {
      result.hijackingSignals.push("Quantidade elevada de scripts na página");
    }
  } catch {
    // ignora
  }

  try {
    const iframes = document.querySelectorAll("iframe");
    if (iframes.length > 10) {
      result.hijackingSignals.push("Quantidade elevada de iframes");
    }
  } catch {
    // ignora
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === "GET_PAGE_SIGNALS") {
      return Promise.resolve(result);
    }
    return undefined;
  });
})();