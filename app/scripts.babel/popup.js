function showSite(name, rules) {
  const wrapper = document.createElement('article');

  const items = rules.map(rule => `<li>${rule}</li>`).join('');

  wrapper.className = 'c-tab  js-tab';

  wrapper.innerHTML = `
<div class="c-single-line c-tab__header  js-tab-header"><h2 class="c-tab__title">${name}</h2></div>
<ul class="c-tab__content  js-tab-content">
  ${items}
</ul>
`;

  document.body.appendChild(wrapper);
}

function showNoSites() {
  const p = document.createElement('p');

  p.textContent = 'There are no active filters for this URL';

  document.body.appendChild(p);
}

function checkSites(sites) {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const url = tabs[0].url;
    const matches = sites.filter(site => (new RegExp(site.name)).test(url));

    if (matches.length) {
      matches.forEach((site) => {
        const rules = site.rules.split(/\n/g);

        showSite(site.name, rules);
      });
    } else {
      showNoSites();
    }

    document.getElementsByClassName('js-url')[0].innerText = url;
  });
}

function loadModel() {
  chrome.storage.sync.get({
    sites: [],
  }, data => checkSites(data.sites));
}

function toggleTab($el) {
  const list = $el.classList;

  if (list.contains('is-active')) {
    list.remove('is-active');
  } else {
    list.add('is-active');
  }
}

document.getElementsByClassName('js-options')[0]
  .addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

document.body.addEventListener('click', (e) => {
  const list = e.target.classList;

  if (list.contains('js-tab-header')) {
    toggleTab(e.target.parentElement);
  }
});

loadModel();
