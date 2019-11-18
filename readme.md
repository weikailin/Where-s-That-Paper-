# Where's That Paper (Firefox)

### Firefox Extension Installation

1. Clone all files to a local folder
1. Go to about:debugging#/runtime/this-firefox
1. Click "Load Temporary Add-on..." and select "manifest.json" in the local folder

(The following is forked from https://github.com/eylonyogev/Where-s-That-Paper-)

### Chrome Extension Installation

1. Go to chrome://extensions/
1. Enable "Developer Mode".
1. Click "Load unpacked extension�" and select the `build/browserExt` directory.

# About

The extension appears online in the Chrome Web Store: https://chrome.google.com/webstore/detail/wheres-that-paper/dkjnkdmoghkbkfkafefhbcnmofdbfdio.

It automatically adds viewed academic papers to your favorites. Currently, it supports the following domains:
eprint.iacr.org, arxiv.org, eccc.weizmann.ac.il, epubs.siam.org, research.microsoft.com, citeseerx.ist.psu.edu, ac.els-cdn.com, www.sciencedirect.com, download.springer.com, link.springer.com, delivery.acm.org, proceedings.mlr.press.

For example, when visiting the following webpage: https://eprint.iacr.org/2018/733.pdf the paper will be added to the favorites under a folder called "Papers".
Then, in the searchbox it will appears whenever an author or part of the title in typed in.

Did I miss an important domain? Tell me about it and I'll add it.