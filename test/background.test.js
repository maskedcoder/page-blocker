/* eslint-env mocha */

const fs = require('fs');
const vm = require('vm');

const chai = require('chai');

const chrome = require('./utilities/chrome');

const expect = chai.expect;

const code = fs.readFileSync('./app/scripts/background.js', 'utf-8');

const backgroundContext = vm.createContext({
  chrome,
  console,
});

describe('Background', () => {
  before(() => {
    vm.runInContext(code, backgroundContext, {
      filename: 'app/scripts/background.js',
      displayErrors: true,
    });

    chrome.tabs.set(['test1', 'test8', 'test9']);

    chrome.storage.set([
      {
        name: /test2/,
        rules: '',
      },
      {
        name: /test3/,
        rules: 'html',
      },
      {
        name: /test4/,
        rules: 'html\nbody',
      },
      {
        name: /test5/,
        rules: '',
      },
      {
        name: /est5/,
        rules: '',
      },
      {
        name: /test6/,
        rules: 'html',
      },
      {
        name: /est6/,
        rules: '',
      },
      {
        name: /test7/,
        rules: 'html\nbody',
      },
      {
        name: /est7/,
        rules: 'html',
      },
      {
        name: /st7/,
        rules: 'body\nh1\nh2\nh3\nh4\nh5\np\na\ndiv\nhead\nb\ni\nstrong\nem\nheader\nfooter',
      },
      {
        name: /t7/,
        rules: 'html\nbody\nhead',
      },
      {
        name: /test9/,
        rules: 'html',
      },
    ]);

    chrome.runtime.install();
  });

  it('should display 0 when there are no filters', () => {
    chrome.tabs.changeTab(0);
    expect(chrome.browserAction.badgeText).to.equal('0');
  });

  it('should display the correct number when there is one filter', () => {
    chrome.tabs.navigate('test2');
    expect(chrome.browserAction.badgeText).to.equal('0');

    chrome.tabs.navigate('test3');
    expect(chrome.browserAction.badgeText).to.equal('1');

    chrome.tabs.navigate('test4');
    expect(chrome.browserAction.badgeText).to.equal('2');
  });

  it('should display the correct number when there are multiple filters', () => {
    chrome.tabs.navigate('test5');
    expect(chrome.browserAction.badgeText).to.equal('0');

    chrome.tabs.navigate('test6');
    expect(chrome.browserAction.badgeText).to.equal('1');

    chrome.tabs.navigate('test7');
    expect(chrome.browserAction.badgeText).to.equal('22');
  });

  it('should update the number when changing to a different tab', () => {
    chrome.tabs.changeTab(1);
    expect(chrome.browserAction.badgeText).to.equal('0');

    chrome.tabs.changeTab(2);
    expect(chrome.browserAction.badgeText).to.equal('1');
  });

  it('should continue to work when the database updates', () => {
    chrome.storage.update([]);
    chrome.tabs.changeTab(0);
    expect(chrome.browserAction.badgeText).to.equal('0');


    chrome.storage.update([
      {
        name: /test9/,
        rules: 'html',
      },
      {
        name: /test9/,
        rules: 'html\nbody',
      },
    ]);
    chrome.tabs.changeTab(2);
    expect(chrome.browserAction.badgeText).to.equal('3');
  });
});
