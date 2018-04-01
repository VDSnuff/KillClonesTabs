function highlightClones() {
    var tabListBefor = [];
    var tabListAfter = [];
    var tabIndex = [];
    chrome.windows.getAll({
        populate: true
    }, function (windows) {
        windows.forEach(function (window) {
            window.tabs.forEach(function (tab) {
                tabListBefor.push({
                    tabUrl: tab.url,
                    tabId: tab.id,
                    tabIndex: tab.index
                });
            });
        });
        for (var i = 0; i < tabListBefor.length; i++) {
            for (var j = 0; j < tabListBefor.length; j++) {
                if (tabListBefor[i].tabUrl === tabListBefor[j].tabUrl && tabListBefor[i].tabId !== tabListBefor[j].tabId) {
                    tabListAfter.push(tabListBefor[j]);
                }
            }
        }
        console.log(tabListAfter);
        if (tabListAfter.length === 0) {
            document.getElementById("status").innerHTML = "All clear!";
        }
        else {
            for (var e = 0; e < tabListAfter.length; e++) {
                tabIndex.push(tabListAfter[e].tabIndex);
            }
            chrome.tabs.highlight({
                tabs: tabIndex
            });
            document.getElementById("status").innerHTML = "Got something!";
        }
    });
}

function killClones() {
    var tabListBefor = [];
    var tabListAfter = [];
    var tabId = [];
    chrome.windows.getAll({
        populate: true
    }, function (windows) {
        windows.forEach(function (window) {
            window.tabs.forEach(function (tab) {
                tabListBefor.push({
                    tabUrl: tab.url,
                    tabId: tab.id,
                    tabIndex: tab.index
                });
            });
        });
        for (var i = 0; i < tabListBefor.length; i++) {
            for (var j = 0; j < tabListBefor.length; j++) {
                if (tabListBefor[i].tabUrl === tabListBefor[j].tabUrl && tabListBefor[i].tabIndex < tabListBefor[j].tabIndex && tabListBefor[i].tabId !== tabListBefor[j].tabId) {
                    tabListAfter.push(tabListBefor[j]);
                }
            }
        }
        if (tabListAfter.length === 0) {
            document.getElementById("status").innerHTML = "No targets!";
        }
        else {
            for (var e = 0; e < tabListAfter.length; e++) {
                tabId.push(tabListAfter[e].tabId);
            }
            chrome.tabs.remove(tabId);
            document.getElementById("status").innerHTML = "Done!";
        }
    });
}

function pinAll() {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        var isAllPinned = true;
        for (var i in tabs) {
            if (!tabs[i].pinned) {
                isAllPinned = false;
                break;
            }
        }
        if (isAllPinned == true) tabs.reverse();
        for (var j in tabs) {
            chrome.tabs.update(tabs[j].id, { pinned: !isAllPinned });
        }

        if (!allPinned) document.getElementById("status").innerHTML = "All Pinned!";
        else document.getElementById("status").innerHTML = "Unpinned!";
    });
}

function muteAll() {
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
        var allMuted = true;
        for (var i in tabs) {
            if (!tabs[i].mutedInfo.muted) {
                allMuted = false;
                break;
            }
        }
        for (var j in tabs) {
            chrome.tabs.update(tabs[j].id, { muted: !allMuted });
        }

        if (!allMuted) document.getElementById("status").innerHTML = "All Muted!";
        else document.getElementById("status").innerHTML = "Unmuted!";
    });
}

document.getElementById('btnTarget').onclick = highlightClones;
document.getElementById('btnKill').onclick = killClones;
document.getElementById('btnPin').onclick = pinAll;
document.getElementById('btnMuted').onclick = muteAll;