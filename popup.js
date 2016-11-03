var tabListBeforOne = [];
var tabListBeforTwo = [];
var tabListAfter = [];
var tabIndex = [];

function highlightClonesFunc() {

    chrome.windows.getAll({
        populate: true
    }, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                //Test
                tabListBeforOne.push({
                    tabUrl: tab.url,
                    tabId: tab.id,
                    tabIndex: tab.index
                });
                tabListBeforTwo.push({
                    tabUrl: tab.url,
                    tabId: tab.id,
                    tabIndex: tab.index
                });
            });
        });

        for (var i = 0; i < tabListBeforOne.length; i++) {
            for (var j = 0; j < tabListBeforTwo.length; j++) {
                if (tabListBeforOne[i].tabUrl == tabListBeforTwo[j].tabUrl && tabListBeforOne[i].tabId != tabListBeforTwo[j].tabId) {
                    tabListAfter.push(tabListBeforTwo[j]);
                }
            }
        }

        //Test 
        //console.log(tabListAfter);

        for (var e = 0; e < tabListAfter.length; e++) {
            tabIndex.push(tabListAfter[e].tabIndex);
        }

        chrome.tabs.highlight({
            tabs: tabIndex
        });
    });
}

//Linking with getTabsListFunc function
document.getElementById('btnTarget').onclick = highlightClonesFunc;


function killClonesFunc (){
    
     chrome.windows.getAll({
        populate: true
    }, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                //Test
                tabListBeforOne.push({
                    tabUrl: tab.url,
                    tabId: tab.id,
                    tabIndex: tab.index
                });
                tabListBeforTwo.push({
                    tabUrl: tab.url,
                    tabId: tab.id,
                    tabIndex: tab.index
                });
            });
        });

        for (var i = 0; i < tabListBeforOne.length; i++) {
            for (var j = 0; j < tabListBeforTwo.length; j++) {
                if (tabListBeforOne[i].tabUrl == tabListBeforTwo[j].tabUrl && tabListBeforOne[i].tabId != tabListBeforTwo[j].tabId) {
                    tabListAfter.push(tabListBeforTwo[j]);
                }
            }
        }

        //Test 
        //console.log(tabListAfter);

        for (var e = 0; e < tabListAfter.length; e++) {
            tabIndex.push(tabListAfter[e].tabIndex);
        }

        chrome.tabs.remove([2311]);
    });
    
}

//Linking with killClonesFunc function
document.getElementById('btnKill').onclick = killClonesFunc;