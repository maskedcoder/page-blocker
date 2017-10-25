function removePageBlock() {
  const $els = Array.from(document.querySelectorAll('.js-page-block'));

  $els.forEach(($el) => {
    $el.parentElement.removeChild($el);
  });
}

function showWarning(violations) {
  document.body.className += ' page-block-scroll-lock';

  const style = document.createElement('style');
  style.className = 'js-page-block';

  style.innerHTML = `
.page-block-scroll-lock {
  overflow: hidden !important;
}

.page-block {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  background: #fff;
  z-index: 99999;
}

.page-block__content {
  display: block;
  max-width: 300px;
  margin: 20vh auto;
}
`;

  const $el = document.createElement('div');
  $el.className = 'js-page-block page-block';

  const html = `
<div class="page-block__content">
  <p><strong>Are you sure you want to continue?</strong></p>
  <p>This page has the following violations:</p>
  <ul>
    ${violations}
  </ul>
  <button class="js-page-block-remove">Yes, I'm sure</button>
</div>`;

  $el.innerHTML = html;

  document.head.appendChild(style);
  document.body.appendChild($el);

  document.body.querySelector('.js-page-block-remove').addEventListener('click', () => {
    removePageBlock();
  });
}

function checkSites(sites) {
  const matches = sites.filter(site => (new RegExp(site)).test(location.host));

  if (matches) {
    const violations = Array.prototype.concat.apply([], matches.map((site) => {
      const rules = site.rules.replace(/\n/g, ',');

      return Array.from(document.querySelectorAll(rules));
    })).map($el => $el.innerText);

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

loadModel();
