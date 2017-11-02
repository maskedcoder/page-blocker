/* eslint-env mocha */

const fs = require('fs');
const vm = require('vm');

const chai = require('chai');
const jsdom = require('jsdom');

const chrome = require('./utilities/chrome');
const fixtures = require('./fixtures/test-env.json');

const expect = chai.expect;

const jsFile = fs.readFileSync('./app/scripts/popup.js', 'utf-8');
const htmlFile = fs.readFileSync('./app/popup.html', 'utf-8');

const dom = new jsdom.JSDOM(htmlFile);

const $$ = (selector) => dom.window.document.querySelectorAll(selector);

const getHeader = ($tab) => $tab.querySelector('.qa-tab-title').textContent;

const $ = (selector) => dom.window.document.querySelector(selector);

const removeTabs = (tabs) => {
  const $tabs = tabs || $$('.qa-tab');

  $tabs.forEach($tab => $tab.remove());
};

const popupContext = vm.createContext({
  chrome,
  console,
  window: dom.window,
  document: dom.window.document,
  location: dom.window.location,
});

describe('Popup', () => {
  before(() => {
    vm.runInContext(jsFile, popupContext, {
      filename: 'app/scripts/popup.js',
      displayErrors: true,
    });

    chrome.tabs.set(fixtures.tabs);

    chrome.storage.set(fixtures.storage);
  });

  afterEach(() => {
    removeTabs();
  });

  it('should handle having no sites', () => {
    chrome.tabs.changeTab(0);
    dom.window.initialize();

    expect($$('.qa-tab').length).to.equal(0);
    expect($$('.qa-rule').length).to.equal(0);
  });

  it('should handle having a site with no rules', () => {
    chrome.tabs.changeTab(1);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(1);
    expect(getHeader($tabs[0])).to.equal('test2');
    expect($$('.qa-rule').length).to.equal(0);
  });

  it('should handle having one site with one rule', () => {
    chrome.tabs.changeTab(2);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(1);
    expect(getHeader($tabs[0])).to.equal('t3');
    expect($$('.qa-rule').length).to.equal(1);
  });

  it('should handle having one site with multiple rules', () => {
    chrome.tabs.changeTab(3);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(1);
    expect(getHeader($tabs[0])).to.equal('4');
    expect($$('.qa-rule').length).to.equal(3);
  });

  it('should handle having one site with one rule and one without any', () => {
    chrome.tabs.changeTab(4);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(2);
    expect(getHeader($tabs[0])).to.equal('test5');
    expect(getHeader($tabs[1])).to.equal('est5');
    expect($$('.qa-rule').length).to.equal(1);
  });

  it('should handle having two sites with multiple rules each', () => {
    chrome.tabs.changeTab(5);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(2);
    expect(getHeader($tabs[0])).to.equal('test6');
    expect(getHeader($tabs[1])).to.equal('6');
    expect($$('.qa-rule').length).to.equal(6);
  });

  it('should handle having multiple duplicate sites with one rule in each', () => {
    chrome.tabs.changeTab(6);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(5);
    expect(getHeader($tabs[0])).to.equal('test7');
    expect(getHeader($tabs[1])).to.equal('test7');
    expect(getHeader($tabs[2])).to.equal('test7');
    expect(getHeader($tabs[3])).to.equal('test7');
    expect(getHeader($tabs[4])).to.equal('test7');
    expect($$('.qa-rule').length).to.equal(5);
  });

  it('should handle sites with a gap in the rules', () => {
    chrome.tabs.changeTab(7);
    dom.window.initialize();

    const $tabs = $$('.qa-tab');

    expect($tabs.length).to.equal(1);
    expect(getHeader($tabs[0])).to.equal('test8');
    expect($$('.qa-rule').length).to.equal(2);
  });

  it('should toggle lists when they are clicked on', () => {
    chrome.tabs.changeTab(3);
    dom.window.initialize();

    // Apparently, jsdom does not implement a layout engine, so I can't really check
    // if things are being shown and hidden, just whether or not classes are present.

    const $tab = $('.qa-tab');
    expect($tab.classList.contains('is-active')).to.equal(false);
    // expect($content.offsetHeight).to.equal(0);

    $('.qa-tab-header').click();
    expect($tab.classList.contains('is-active')).to.equal(true);
    // expect($content.offsetHeight).to.not.equal(0);

    $('.qa-tab-header').click();
    expect($tab.classList.contains('is-active')).to.equal(false);
    // expect($content.offsetHeight).to.equal(0);
  });
});
