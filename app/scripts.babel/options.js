/* global $ */

// Saves options to chrome.storage.sync.

const $ = (selector) => document.querySelector(selector);

function createTableEntry(name) {
  return `
<td>${name}</td>
<td>
  <button class="js-row-edit-site">Edit</button>
  <button class="js-delete-site">Remove</button>
</td>`;
}

let MODEL = [];

function getItem(id) {
  return MODEL.find(item => item.id === id);
}

function deleteItem(id) {
  MODEL = MODEL.filter(item => item.id !== id);
}

function editItem(id, key, value) {
  getItem(id)[key] = value;
}

function generateTable(sites) {
  const $table = $('.js-sites-table');

  const html = sites
    .map((site) => `<tr class="js-site" data-id="${site.id}">${createTableEntry(site.name)}</tr>`)
    .join('');

  $table.innerHTML = html;
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

    $status.textContent = 'Options saved.';

    setTimeout(() => {
      $status.textContent = '';
    }, 750);
  });
}

function getId($el) {
  const parent = $el.parentElement.parentElement;

  return Number(parent.dataset.id);
}

function deleteSite(id) {
  deleteItem(id);
  generateTable(MODEL);
}

function editSite(id) {
  $('.js-add-site').hidden = true;
  $('.js-add-site-input').hidden = true;
  $('.js-edit-site').hidden = false;
  $('.js-edit-site-input').hidden = false;

  $('.js-edit-site-name').value = getItem(id).name;
  $('.js-edit-site-name').dataset.id = id;
}

function editRules(id) {
  const item = getItem(id);

  $('.js-which-site').innerHTML = `Editing site <code>/${item.name}/</code>`;
  $('.js-site-rules').value = item.rules;
  $('.js-save-rules').dataset.id = id;
}

$('.js-add-site').addEventListener('click', () => {
  const name = $('.js-new-site-name').value;

  if (name) {
    try {
      RegExp(name);
    } catch (e) {
      return;
    }

    const item = {
      name,
      id: +new Date(),
      rules: '',
    };

    MODEL.push(item);

    const $el = document.createElement('tr');
    $el.className = 'js-site';
    $el.dataset.id = item.id;

    $el.innerHTML = createTableEntry(item.name);

    $('.js-sites-table').appendChild($el);

    $('.js-new-site-name').value = '';
  }
});

$('.js-edit-site').addEventListener('click', () => {
  const name = $('.js-edit-site-name').value;

  if (name) {
    try {
      RegExp(name);
    } catch (e) {
      return;
    }

    const id = Number($('.js-edit-site-name').dataset.id);

    editItem(id, 'name', name);
    generateTable(MODEL);

    $('.js-add-site').hidden = false;
    $('.js-add-site-input').hidden = false;
    $('.js-edit-site').hidden = true;
    $('.js-edit-site-input').hidden = true;
  }
});

$('.js-save-rules').addEventListener('click', () => {
  const rules = $('.js-site-rules').value;
  const id = Number($('.js-save-rules').dataset.id);

  editItem(id, 'rules', rules);
});

$('.js-save').addEventListener('click', () => saveModel());

$('body').addEventListener('click', (e) => {
  const list = e.target.classList;

  if (list.contains('js-delete-site')) {
    deleteSite(getId(e.target));
  } else if (list.contains('js-row-edit-site')) {
    editSite(getId(e.target));
    editRules(getId(e.target));
  } else if (e.target.parentElement &&
             e.target.parentElement.classList.contains('js-site')) {
    editRules(Number(e.target.parentElement.dataset.id));
  }
});

loadModel();
