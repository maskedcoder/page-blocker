/* eslint-env mocha */

const fs = require('fs');
const vm = require('vm');

const chai = require('chai');
const jsdom = require('jsdom');

const chrome = require('./utilities/chrome');
const fixtures = require('./fixtures/test-env.json');

const expect = chai.expect;

const contentScript = fs.readFileSync('./app/scripts/contentscript.js', 'utf-8');

// jsDom does not currently support Shadow DOM
const polyfill = `
Element.prototype.attachShadow = Element.prototype.attachShadow || function(shadowRootInit) {
  const $element = document.createElement('DIV');
  this.appendChild($element)

  return $element;
};
`;

const jsCode = `${polyfill}${contentScript}`;

const dom = new jsdom.JSDOM(fixtures.page);

const $$ = (selector) => dom.window.document.querySelectorAll(selector);

const $ = (selector) => dom.window.document.querySelector(selector);

const removePageBlock = () => {
  const $el = $('.qa-page-block');

  if ($el) {
    $el.remove();
  }
};

const contentContext = vm.createContext({
  chrome,
  console,
  window: dom.window,
  document: dom.window.document,
  location: dom.window.location,
  Element: dom.window.Element,
});

describe('Content Script', () => {
  before(() => {
    vm.runInContext(jsCode, contentContext, {
      filename: 'app/scripts/contentscript.js',
      displayErrors: true,
    });

    chrome.storage.set(fixtures.storage);
  });

  afterEach(() => {
    removePageBlock();
  });

  it('should handle having no matching sites', () => {
    dom.reconfigure({ url: 'http://test1.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.equal(null);
  });

  it('should handle having a site with no rules', () => {
    dom.reconfigure({ url: 'http://test2.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.equal(null);
  });

  it('should handle having one matching site with one rule', () => {
    dom.reconfigure({ url: 'http://test3.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.not.equal(null);

    const $violations = $$('.qa-rule');

    expect($violations.length).to.equal(1);
    expect($violations[0].textContent).to.equal('html');
  });

  it('should handle having one site with multiple rules', () => {
    dom.reconfigure({ url: 'http://test4.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.not.equal(null);

    const $violations = $$('.qa-rule');

    expect($violations.length).to.equal(3);
    expect($violations[0].textContent).to.equal('html');
    expect($violations[1].textContent).to.equal('head');
    expect($violations[2].textContent).to.equal('body');
  });

  it('should handle having one site with one rule and one without any', () => {
    dom.reconfigure({ url: 'http://test5.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.not.equal(null);

    const $violations = $$('.qa-rule');

    expect($violations.length).to.equal(1);
    expect($violations[0].textContent).to.equal('html');
  });

  it('should handle having two sites with multiple rules each', () => {
    dom.reconfigure({ url: 'http://test6.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.not.equal(null);

    const $violations = $$('.qa-rule');

    expect($violations.length).to.equal(6);
    expect($violations[0].textContent).to.equal('html');
    expect($violations[1].textContent).to.equal('head');
    expect($violations[2].textContent).to.equal('body');
    expect($violations[3].textContent).to.equal('html');
    expect($violations[4].textContent).to.equal('head');
    expect($violations[5].textContent).to.equal('body');
  });

  it('should handle having multiple duplicate sites with one rule in each', () => {
    dom.reconfigure({ url: 'http://test7.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.not.equal(null);

    const $violations = $$('.qa-rule');

    expect($violations.length).to.equal(5);
    expect($violations[0].textContent).to.equal('html');
    expect($violations[1].textContent).to.equal('html');
    expect($violations[2].textContent).to.equal('html');
    expect($violations[3].textContent).to.equal('html');
    expect($violations[4].textContent).to.equal('html');
  });

  it('should go away when the button is clicked', () => {
    dom.reconfigure({ url: 'http://test3.com/' });
    dom.window.initialize();

    expect($('.qa-page-block')).to.not.equal(null);

    $('.qa-dismiss').click();

    expect($('.qa-page-block')).to.equal(null);
  });
});
