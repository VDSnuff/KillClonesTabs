var tabListBefor = [];
var tabListAfter = [];

//Get list of all opened tabs.
function getTabsListFunc() {
    chrome.windows.getAll({
        populate: true
    }, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                //Test
                //console.log(tab.url + "tabs id: " + tab.id);
                tabListBefor.push({
                    tabUrl: tab.url,
                    tabId: tab.id
                });
            });
        });
    });

    for (var i = 0; i < tabListBefor.length; i++) {
        for ( var j = tabListBefor.length - 1; j > 0; j--) {
            if (tabListBefor[i].tabUrl == tabListBefor[j].tabUrl && i != j) {
                tabListAfter.push(tabListBefor[j].tabUrl.toString());
            }
        }
    }
    console.log(tabListAfter);
}
//Linking with getTabsListFunc function
document.getElementById('btnTarget').onclick = getTabsListFunc;