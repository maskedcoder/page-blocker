let DATA = null;

function loadModel(cb) {
  if (!DATA) {
    chrome.storage.sync.get({
      sites: [],
    }, (data) => {
      DATA = data.sites;

      cb(data.sites);
    });
  } else {
    cb(DATA);
  }
}

function updateBadge(url) {
  loadModel((data) => {
    const matches = data.filter(site => (new RegExp(site.name)).test(url));
    const filters = matches.reduce((sum, site) => sum + site.rules.split('\n').length, 0);

    chrome.browserAction.setBadgeText({ text: String(filters) });
  });
}

// Pre-load the data on installation
chrome.runtime.onInstalled.addListener(() => {
  loadModel(() => {});
});

// Update the badge when switching to a new tab
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    updateBadge(tabs[0].url);
  });
});

// Update the badge when a tab navigates
chrome.tabs.onUpdated.addListener(() => {
  // But only look at the active tab
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    updateBadge(tabs[0].url);
  });
});

// Reload the data whenever the database changes
chrome.storage.onChanged.addListener(() => {
  DATA = null;
  loadModel(() => {});
});
