/* global $ */

// Saves options to chrome.storage.sync.

const $ = (selector, $el) => {
  if ($el) {
    return $el.querySelector(selector);
  }

  return document.querySelector(selector);
};

let MODEL = [];

function getItem(id) {
  return MODEL.find(item => item.id === id);
}

function deleteItem(id) {
  MODEL = MODEL.filter(item => item.id !== id);

  $('.js-status').textContent = '\uD83D\uDDD9 Changes must be saved before closing.';
}

function editItem(id, key, value) {
  getItem(id)[key] = value;

  $('.js-status').textContent = '\uD83D\uDDD9 Changes must be saved before closing.';
}

function addItem(item) {
  MODEL.push(item);

  $('.js-status').textContent = '\uD83D\uDDD9 Changes must be saved before closing.';
}

function createTableEntry(id, name) {
  const template = $('.js-site-template').content;

  $('.js-site', template).dataset.id = id;
  $('.js-name', template).innerText = name;

  return document.importNode(template, true);
}

function createBlankEntry() {
  const template = $('.js-no-sites-info').content;

  return document.importNode(template, true);
}

function generateTable(sites) {
  const $table = $('.js-sites-table');

  $table.innerHTML = '';

  if (sites.length) {
    sites
      .map(site => createTableEntry(site.id, site.name))
      .forEach($el => $table.appendChild($el));
  } else {
    $table.appendChild(createBlankEntry());
  }
}

function setModel(sites) {
  MODEL = sites;
  generateTable(sites);
}

function loadModel() {
  chrome.storage.sync.get({
    sites: [],
  }, data => setModel(data.sites));
}

function saveModel() {
  chrome.storage.sync.set({
    sites: MODEL,
  }, () => {
    const $status = $('.js-status');
    $status.classList.add('c-info__good');

    $status.textContent = '\uD83D\uDEC8 Options saved.';

    setTimeout(() => {
      $status.textContent = '';
      $status.classList.remove('c-info__good');
    }, 1000);
  });
}

function getId($el) {
  const parent = $el.parentElement.parentElement.parentElement;

  return Number(parent.dataset.id);
}

function showMenu($el) {
  $('.js-menu', $el.parentElement).classList.add('is-shown');
}

function hideMenu() {
  const $el = $('.js-menu.is-shown');

  if ($el) {
    $el.classList.remove('is-shown');
  }
}

function showDialog() {
  $('.js-dialog').setAttribute('open', 'open');
  $('.js-overlay').classList.add('is-shown');
}

function hideDialog() {
  $('.js-overlay').classList.remove('is-shown');
  $('.js-dialog').removeAttribute('open');
}

function deleteSite(id) {
  deleteItem(id);
  generateTable(MODEL);
}

function editSite(name, id) {
  if (name) {
    try {
      RegExp(name);
    } catch (e) {
      return false;
    }

    editItem(id, 'name', name);
    generateTable(MODEL);

    return true;
  }

  return false;
}

function addSite(name) {
  if (name) {
    try {
      RegExp(name);
    } catch (e) {
      return false;
    }

    const item = {
      name,
      id: +new Date(),
      rules: '',
    };

    addItem(item);

    const $table = $('.js-sites-table');

    const $el = createTableEntry(item.id, item.name);

    $table.appendChild($el);

    const $blankEntry = $('.js-blank-entry');

    if ($blankEntry) {
      $table.removeChild($blankEntry);
    }

    return true;
  }

  return false;
}

function editRules(rules, id) {
  editItem(id, 'rules', rules);

  return true;
}

function showButtonEffect($el, event) {
  const $effect = $('.js-effect', $el);

  if (event) {
    const rect = $el.getBoundingClientRect();

    $effect.style.left = `${event.pageX - rect.left}px`;
    $effect.style.top = `${event.pageY - rect.top}px`;
  } else {
    $effect.style.left = '50%';
    $effect.style.top = '50%';
  }

  $effect.classList.add('is-active');
}

function hideButtonEffect($el) {
  $('.js-effect', $el).classList.remove('is-active');
}

function showEditRulesDialog(id) {
  const template = $('.js-edit-rules-dialog').content;

  const $el = document.importNode(template, true);

  const $dialog = $('.js-dialog');
  const $content = $('.js-dialog-content', $dialog);
  const $title = $('.js-title', $dialog);
  const $accept = $('.js-okay-button', $dialog);

  const $input = $('.js-rules', $el);

  $input.value = getItem(id).rules;

  $content.innerHTML = '';
  $title.innerText = 'Edit site rules';
  $content.appendChild($el);
  $accept.removeAttribute('disabled');

  $accept.onclick = () => {
    if (editRules($input.value, id)) {
      hideDialog();
    }
  };

  showDialog();
  $input.focus();
}

function showEditSiteDialog(id) {
  const template = $('.js-edit-site-dialog').content;

  const $el = document.importNode(template, true);

  const $dialog = $('.js-dialog');
  const $content = $('.js-dialog-content', $dialog);
  const $title = $('.js-title', $dialog);
  const $accept = $('.js-okay-button', $dialog);

  let invalid = true;

  const $input = $('.js-site', $el);

  $input.value = getItem(id).name;

  $input.addEventListener('input', () => {
    if ($input.value !== '' && invalid) {
      $accept.removeAttribute('disabled');
      invalid = false;
    } else if ($input.value === '' && !invalid) {
      $accept.setAttribute('disabled', 'disabled');
      invalid = true;
    }
  });

  $content.innerHTML = '';
  $title.innerText = 'Edit site';
  $content.appendChild($el);
  $accept.removeAttribute('disabled');

  $accept.onclick = () => {
    if (editSite($input.value, id)) {
      hideDialog();
    }
  };

  showDialog();
  $input.focus();
}

$('.js-add-dlg').addEventListener('click', () => {
  const template = $('.js-edit-site-dialog').content;

  const $el = document.importNode(template, true);

  const $dialog = $('.js-dialog');
  const $content = $('.js-dialog-content', $dialog);
  const $title = $('.js-title', $dialog);
  const $accept = $('.js-okay-button', $dialog);

  let invalid = true;

  const $input = $('.js-site', $el);

  $input.addEventListener('input', () => {
    if ($input.value !== '' && invalid) {
      $accept.removeAttribute('disabled');
      invalid = false;
    } else if ($input.value === '' && !invalid) {
      $accept.setAttribute('disabled', 'disabled');
      invalid = true;
    }
  });

  $content.innerHTML = '';
  $title.innerText = 'Add site';
  $accept.setAttribute('disabled', 'disabled');
  $content.appendChild($el);

  $accept.onclick = () => {
    if (addSite($input.value)) {
      hideDialog();
    }
  };

  showDialog();
  $input.focus();
});

$('.js-save').addEventListener('click', () => saveModel());

// Make sure that the button effect is applied twice when
// a button is clicked
let justClicked = false;

$('body').addEventListener('click', (e) => {
  hideMenu();
  const list = e.target.classList;
  justClicked = false;

  if (e.target.tagName === 'BUTTON') {
    showButtonEffect(e.target, e);
    justClicked = true;
  }

  if (list.contains('js-settings')) {
    showMenu(e.target);
  } else if (list.contains('js-close-button')) {
    hideDialog();
  } else if (list.contains('js-delete-site')) {
    deleteSite(getId(e.target));
  } else if (list.contains('js-row-edit-rules')) {
    showEditRulesDialog(getId(e.target));
  } else if (list.contains('js-row-edit-site')) {
    showEditSiteDialog(getId(e.target));
  }
});

$('body').addEventListener('focusin', (e) => {
  const list = e.target.classList;

  // Programmatically setting the focus does not reliably
  // trigger the focusout event for other elements
  document
    .querySelectorAll('.is-active')
    .forEach($el => $el.classList.remove('is-active'));

  if (e.target.tagName === 'BUTTON' && !justClicked) {
    showButtonEffect(e.target);
  }

  if (list.contains('js-input-box')) {
    e.target.parentElement.classList.add('is-focussed');
  }
});

$('body').addEventListener('focusout', (e) => {
  const list = e.target.classList;

  if (e.target.tagName === 'BUTTON') {
    hideButtonEffect(e.target);
  }

  if (list.contains('js-input-box')) {
    e.target.parentElement.classList.remove('is-focussed');
  }
});

$('.js-overlay').addEventListener('click', () => {
  $('.js-dialog').classList.add('is-shaking');

  window.setTimeout(() => {
    $('.js-dialog').classList.remove('is-shaking');
  }, 500);
});

loadModel();
