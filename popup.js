document.getElementById('btnTarget').onclick = testFunc;

function testFunc() {
    chrome.windows.getAll({
        populate: true
    }, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                //collect all of the urls here, I will just log them instead
                console.log(tab.url);
            });
        });
    });
}