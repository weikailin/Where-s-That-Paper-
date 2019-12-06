# Where's That Paper (Firefox)

### Firefox Extension Installation

Because this extension is not signed by Mozilla, the following installation 
may only work on development versions of Firefox (say, Beta or Nightly).
1. Download the wheresthatpaper.xpi file in the xpi branch
(https://github.com/weikailin/Where-s-That-Paper-/blob/xpi/wheresthatpaper.xpi)
1. Go to "about:config" and set "xpinstall.signatures.required" to "false"
1. Go to "Add-ons", "Extensions", "Manage Your Extensions" section, 
click the gear (:gear:) button, and "Install Add-On From File"
1. Open the downloaded file wheresthatpaper.xpi

To try this extension, the following is a temporary way to install, 
but it does not persist after restarting Firefox.
1. Clone all files to a local folder
1. Go to about:debugging#/runtime/this-firefox
1. Click "Load Temporary Add-on..." and select "manifest.json" in the local folder


# Forked from Eylon Yogev

This extension is forked from https://github.com/eylonyogev/Where-s-That-Paper- by Eylon Yogev.
Another Firefox fork https://github.com/vqhuy/Where-s-That-Paper- is made by Vu Quoc Huy.

### Chrome Extension Installation

1. Go to chrome://extensions/
1. Enable "Developer Mode".
1. Click "Load unpacked extension…" and select the `build/browserExt` directory.

# About

The extension appears online in the Chrome Web Store: https://chrome.google.com/webstore/detail/wheres-that-paper/dkjnkdmoghkbkfkafefhbcnmofdbfdio.

It automatically adds viewed academic papers to your favorites. Currently, it supports the following domains:
eprint.iacr.org, arxiv.org, eccc.weizmann.ac.il, epubs.siam.org, research.microsoft.com, citeseerx.ist.psu.edu, ac.els-cdn.com, www.sciencedirect.com, download.springer.com, link.springer.com, delivery.acm.org, proceedings.mlr.press.

For example, when visiting the following webpage: https://eprint.iacr.org/2018/733.pdf the paper will be added to the favorites under a folder called "Papers".
Then, in the searchbox it will appears whenever an author or part of the title in typed in.

Did I miss an important domain? Tell me about it and I'll add it.
