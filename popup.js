function highlightClonesFunc() {

    var tabListBeforOne = [];
    var tabListBeforTwo = [];
    var tabListAfter = [];
    var tabIndex = [];

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
 if (tabListAfter.length == 0) {
        document.getElementById("status").innerHTML = "All clear!";    
        }
        else{
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

//Linking with getTabsListFunc function
document.getElementById('btnTarget').onclick = highlightClonesFunc;


function killClonesFunc() {

    var tabListBeforOne = [];
    var tabListBeforTwo = [];
    var tabListAfter = [];
    var tabId = [];

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
                if (tabListBeforOne[i].tabUrl == tabListBeforTwo[j].tabUrl && tabListBeforOne[i].tabIndex < tabListBeforTwo[j].tabIndex && tabListBeforOne[i].tabId != tabListBeforTwo[j].tabId) {
                    tabListAfter.push(tabListBeforTwo[j]);
                }
            }
        }

        if (tabListAfter.length == 0) {
        document.getElementById("status").innerHTML = "No targets!";    
        }
        else{
        for (var e = 0; e < tabListAfter.length; e++) {
            tabId.push(tabListAfter[e].tabId);
        }

        chrome.tabs.remove(tabId);
        document.getElementById("status").innerHTML = "Done!"; 
        }
    });

}

//Linking with killClonesFunc function
document.getElementById('btnKill').onclick = killClonesFunc;