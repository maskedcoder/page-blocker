function removePageBlock() {
  const $els = Array.from(document.querySelectorAll('.js-page-block'));

  $els.forEach(($el) => {
    $el.parentElement.removeChild($el);
  });
}

function showWarning(violations) {
  document.body.parentElement.className += ' page-block-scroll-lock';

  const style = document.createElement('style');
  style.className = 'js-page-block';

  style.innerHTML = `
.page-block-scroll-lock {
  overflow: hidden !important;
}

#page-block-842381254862 {
  display: block !important;

  visibility: initial !important;
  font: initial !important;
  list-style: initial !important;
  letter-spacing: normal !important;
  text-align: initial !important;
  text-indent: initial !important;
  text-transform: initial !important;
  white-space: initial !important;
  word-spacing: initial !important;
  cursor: default !important;

  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 2147483647 !important;
  overflow-y: scroll !important;

  font-size: 16px !important;
  font-family: Roboto, 'Segoe UI', Tahoma, sans-serif !important;
  color: #000 !important;

  background: #fff !important;
}`;

  const $el = document.createElement('div');
  const shadow = $el.attachShadow({ mode: 'open' });

  $el.className = 'js-page-block  qa-page-block';
  $el.id = 'page-block-842381254862';

  const html = `
<style>
:host {
  contain: content;
}

.page-block__content {
  display: block;
  max-width: 300px;
  margin: 20vh auto;
}
</style>
<div class="page-block__content">
  <p><strong>Are you sure you want to continue?</strong></p>
  <p>This page matches the following selectors:</p>
  <ul>
    ${violations}
  </ul>
  <button class="js-page-block-remove  qa-dismiss">Yes, I'm sure</button>
</div>`;

  shadow.innerHTML = html;

  document.head.appendChild(style);
  document.body.parentElement.appendChild($el);

  shadow.querySelector('.js-page-block-remove')
    .addEventListener('click', () => {
      removePageBlock();
    });
}

function checkSites(sites) {
  const matches = sites.filter(site => (new RegExp(site.name)).test(location.href));

  if (matches) {
    const violations = Array.prototype.concat.apply([], matches.map((site) =>
      site.rules
        .split('\n')
        .filter(rule => {
          if (rule) {
            return document.querySelector(rule);
          }

          return null;
        }))
    ).map(rule => `<li class="qa-rule">${rule}</li>`)
     .join('');

    if (violations.length) {
      showWarning(violations);
    }
  }
}

function loadModel() {
  chrome.storage.sync.get({
    sites: [],
  }, data => checkSites(data.sites));
}

if (window.chrome) {
  loadModel();
} else {
  window.initialize = function initialize() {
    loadModel();
  };
}
