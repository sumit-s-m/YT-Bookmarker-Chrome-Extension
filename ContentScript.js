(() => {
    let currentVideo = "";
    let youtubeLeftControls, youtubePlayer;
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
        chrome.runtime.lastError ;
        const {type, value, videoId} = obj;
        
        if(type === "NEW"){
            currentVideo = videoId;
            newVideoLoaded();
        }
        else if(type === "PLAY"){
            youtubePlayer.currentTime = value;
        }
        else if(type === "DELETE"){
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);

            chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoBookmarks)});

            sendResponse(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo]?JSON.parse(obj[currentVideo]):[])
            })
        })
    }

    const newVideoLoaded = async () => {

        currentVideoBookmarks = await fetchBookmarks();
        
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

        if(!bookmarkBtnExists){

            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];


            youtubeLeftControls.appendChild(bookmarkBtn);

            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);

        }
    }

    const addNewBookmarkEventHandler = async () =>  {
        const currTIme = youtubePlayer.currentTime;

        const bookmark = {
            time: currTIme,
            desc: "Bookmark at "+ getTime(currTIme)
        }

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo] : JSON.stringify([...currentVideoBookmarks, bookmark].sort((a, b) => a.time - b.time))
        });

        currentVideoBookmarks = await fetchBookmarks();


    }

    const getTime = (t)=> {
        var date = new Date(0);
        date.setSeconds(t);

        return date.toISOString().substring(11, 19);

    }

    
    chrome.runtime.sendMessage({ask: "curr_url"}, function(response) {

        const currURL = response.currUrl;

        if(currURL.includes("youtube.com/watch")){
            const queryParameters = currURL.split("?")[1];
            const urlParameters = new URLSearchParams(queryParameters);
            currentVideo = urlParameters.get("v");

            newVideoLoaded();
        }
    });

    
    // newVideoLoaded();

})();