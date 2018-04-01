chrome.tabs.onUpdated.addListener(checkTabs);
chrome.tabs.onRemoved.addListener(checkTabs);

function checkTabs() {
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
            chrome.browserAction.setIcon({
                path: "images/KillClonesIcon32.png"
            })
        }
        else {
            chrome.browserAction.setIcon({
                path: "images/KillClonesRedIcon32.png"
            })
        }
    });
}