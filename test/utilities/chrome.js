const data = {
  sites: [],
};

class TabObject {
  constructor(url) {
    this.url = url;
  }
}

// Start with a blank tab, so activeTab is pointing at something
const tabs = [
  new TabObject('about:blank'),
];

let activeTab = 0;

const chrome = {
  runtime: {
    onInstalled: {
      listener: () => {},

      addListener(callback) {
        chrome.runtime.onInstalled.listener = callback;
      },
    },

    install() {
      chrome.runtime.onInstalled.listener();
    },
  },

  storage: {
    sync: {
      get(defaults, callback) {
        return callback(data);
      },
    },

    onChanged: {
      listener: () => {},

      addListener(callback) {
        chrome.storage.onChanged.listener = callback;
      },
    },

    update(newData) {
      data.sites = newData;

      chrome.storage.onChanged.listener();
    },

    set(newData) {
      data.sites = newData;
    },
  },

  tabs: {
    query(opts, callback) {
      if (opts.active) {
        callback([tabs[activeTab]]);
      } else {
        callback(tabs);
      }
    },

    onActivated: {
      listener: () => {},

      addListener(callback) {
        chrome.tabs.onActivated.listener = callback;
      },
    },

    onUpdated: {
      listener: () => {},

      addListener(callback) {
        chrome.tabs.onUpdated.listener = callback;
      },
    },

    set(urls) {
      const newTabs = urls.map((url) => new TabObject(url));

      tabs.splice(0, Infinity, ...newTabs);
    },

    changeTab(index) {
      activeTab = index;

      chrome.tabs.onActivated.listener();
    },

    newTab() {
      tabs.push(new TabObject('about:blank'));

      chrome.tabs.changeTab(tabs.length - 1);
    },

    closeTab() {
      tabs.splice(activeTab, 1);

      // Make sure that activeTab is pointing at something
      if (tabs.length === 0) {
        tabs.push(new TabObject('about:blank'));
        activeTab = 0;
      } else {
        activeTab = activeTab % tabs.length;
      }

      chrome.tabs.onActivated.listener();
    },

    navigate(url) {
      tabs[activeTab].url = url;

      chrome.tabs.onUpdated.listener();
    },
  },

  browserAction: {
    badgeText: '',

    setBadgeText(options) {
      chrome.browserAction.badgeText = options.text;
    },
  },
};

module.exports = chrome;
