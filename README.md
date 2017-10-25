# Page Blocker

Page Blocker is a Chrome extension that forces you to click a button before using certain web pages.

For example, if you want to avoid getting stuck in a [wiki-hole](https://www.urbandictionary.com/define.php?term=wiki-hole), you can set rules that will detect any Wikipedia page that belongs to a certain category. When you visit such a page, a message will pop up with a warning (describing what on the page triggered the warning) and a button to dismiss the warning. Hopefully, this is enough to make you think about it and stop, if necessary.

## Usage
Rules are done on a site-by-site basis. First, the extension checks the URL to see if it matches any of the sites you have added. Next, it runs through the list of rules (which are CSS selectors) for that site to see if there are any matching elements. If there are any, the warning page will appear.

All of this happens after the page load, so the underlying page will show up for a few seconds before it gets blocked.

### Sites
Sites are written using [Regular Expressions](https://www.regular-expressions.info/) (regex), which allows very advanced site selectors. The entire URL (including protocol, query, and fragment) will be checked.

For those of you who want to keep it simple, just put a `\` before any symbols (symbols being anything that isn't a letter or number). For example:

- `wikipedia\.org` will match all URLs with `wikipedia.org` anywhere in them
- `www\.youtube\.com\/watch` will match all URLs with `www.youtube.com/watch` in them
- `https\:\/\/google\.com` will look for URLs with `https://google.com` in them

To add a site, click the "ADD" button on the upper right. To edit a site's regex, click the triple dot icon for that site and then click "Edit regex" in the menu that pops up.

### Rules
Each site has its own set of rules, which are based on [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). **There should be only one selector per line.**

CSS selectors find parts of a web page. For example `a` finds all links, `p` finds all paragraphs, and `li` finds all list items. These can be extended with things like attributes, classes, ids, and more.

Examples:

- `a[href="/wiki/Category:Star_Trek:_The_Original_Series_characters"]` (on Wikipedia) will block all pages that have a link to the category "Star Trek: The Original Series characters".
- `.logo-entertainment` (on CNN.com) will block pages where there's an element with the class `logo-entertainment`, which is currently on all pages in the entertainment section.
- `a[href="/channel/UCEgdi0XIXXZ-qJOFPf4JSKw"]` (on YouTube) will currently block all pages where the video is in the Sports category.

You will probably have to [inspect](https://developers.google.com/web/tools/chrome-devtools/) the pages you want to block to determine the correct selector to use.

Here are some resources for learning CSS selectors:

- [CSS Diner](http://cssdiner.com)
- [CSS Tricks](https://css-tricks.com/almanac/selectors/)
- [Khan Academy](https://www.khanacademy.org/computing/computer-programming/html-css/intro-to-css/p/css-basics)
- [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors)

To edit the rules for a site, click the triple-dot icon for that site and then click the "Edit rules" button.

## Building

This extension was developed using [Yeoman](http://yeoman.io)'s [Chrome Extension generator](https://github.com/yeoman/generator-chrome-extension). The generator has [detailed documentation for all of the gulp commands](https://github.com/yeoman/generator-chrome-extension#gulp-tasks), which I highly recommend reading.

Here is a summary of how to set things up:

1. Install [node.js](https://nodejs.org) and [gulp](https://gulpjs.com/)
2. Run `npm install` in the command line to install all the dependencies
3. Run `gulp`
4. Go to chrome://extensions and enable "Developer mode"
5. Click <kbd>Load unpacked extension...</kbd> and point it at the newly created "dist" folder

## License

MIT
