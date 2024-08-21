import { getCurrentTab } from "./utils.js";

const addNewBookmark = (BookmarkElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlElements = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlElements.className = "bookmark-controls";

    newBookmarkElement.id = "bookmark-"+bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    setBookmarkAttributes("play", onPlay, controlElements);
    setBookmarkAttributes("delete", onDelete, controlElements);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlElements);
    BookmarkElement.appendChild(newBookmarkElement);


}

const viewBookmarks = (currentBookmarks = []) => {
    const BookmarkElement = document.getElementById("bookmarks");
    BookmarkElement.innerHTML = "";

    if(currentBookmarks.length>0){
        for(let i = 0; i<currentBookmarks.length; i++){
            const bookmark = currentBookmarks[i];
            addNewBookmark(BookmarkElement, bookmark);
        }
    }
    else{
        BookmarkElement.innerHTML = '<i class = "row">No bookmarks to show</i>';
    }
}

const onPlay = async (e) =>{
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    });
}

const onDelete = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();

    const toDelete = document.getElementById("bookmark-"+bookmarkTime);
    toDelete.parentNode.removeChild(toDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks);
}

const setBookmarkAttributes = (src, eventlistener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/"+src+".png";
    controlElement.addEventListener("click", eventlistener);
    controlParentElement.appendChild(controlElement);
}


document.addEventListener("DOMContentLoaded",async () => {

    const activeTab = await getCurrentTab();

    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo], (obj) => {
            const currentVideoBookmarks = obj[currentVideo]?JSON.parse(obj[currentVideo]):[];

            viewBookmarks(currentVideoBookmarks);
        });
    }
    else{
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class ="title" > This is not a youtube page</div>'
    }

});