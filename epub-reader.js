// Assign different page elements to easy-to-use constants
const open_button = document.getElementById("open-button");
const exit_button = document.getElementById("exit-button");
const reader = document.getElementById("viewer");

let open_file;
let rendition;
let historyFile;
let keyListener; 

async function openBook(bookData){
  var book = ePub();
  var title = document.getElementById("title");
  var next = document.getElementById("next");
  var prev = document.getElementById("prev");
  book.open(bookData, "binary");
  rendition = book.renderTo("viewer", {
    flow: "scrolled-doc",
    width: "100%",
    fullsize: true
  });
  let history;
  await rendition.display();
  historyFile = book.key();
  puter.readAppDataFile(`${historyFile}.txt`).then(async (item)=>{
    if(item != undefined || item != null){
      history = await item.text();
      if(history != undefined || history != 'undefined'){
        rendition.display(history);
      }
    }
    else{
      rendition.display();
    }
  });

keyListener = function(e){

    // Left Key
    if ((e.keyCode || e.which) == 37) {
      rendition.prev();
    }

    // Right Key
    if ((e.keyCode || e.which) == 39) {
      rendition.next();
    }

  };

  rendition.on("keyup", keyListener);
  rendition.on("relocated", function(location){

  });

  next.addEventListener("click", function(e){
    rendition.next();
    e.preventDefault();
  }, false);

  prev.addEventListener("click", function(e){
    rendition.prev();
    e.preventDefault();
  }, false);

  document.addEventListener("keyup", keyListener, false);
}

function clearOldView(){
    //clear and remove old view and event listeners
    rendition.clear();
    document.removeEventListener("keyup", keyListener, false);
    const oldElementNext = document.getElementById('next');
    const oldElementPrev = document.getElementById('prev');
    const newElementNext = oldElementNext.cloneNode(true);
    const newElementPrev = oldElementPrev.cloneNode(true);
    oldElementNext.parentNode.replaceChild(newElementNext, oldElementNext);
    oldElementPrev.parentNode.replaceChild(newElementPrev, oldElementPrev);
}
// Sets an event-handler function that is called when an item is opened using this app.
// For example, when user double click on a text file or a text file is dragged and dropped
// onto the Notepad.
puter.onItemsOpened(async function (items) {
  // open_file is now items[0]
  open_file = items[0];

  let blob = await open_file.blob();
  if(rendition){
    clearOldView();
  }
  openBook(blob);
});

//----------------------------------------------------
// 'Open' button clicked
//----------------------------------------------------
open_button.addEventListener("click", async () => {
  // Display the 'Open File Picker' allowing the user to select and open a file from their Puter account
  open_file = await puter.showOpenFilePicker();

  // Load the content of the opened file into the editor

  let blob = await open_file.blob();
  if(rendition){
    clearOldView();
  }
  openBook(blob);
});


//----------------------------------------------------
// 'Exit' button clicked
//----------------------------------------------------
exit_button.addEventListener("click", async (event) => {
  attempt_exit();
});

//----------------------------------------------------
// A function that attempts to exit the app. If there are any unsaved changes,
// it will prompt the user to save the file before exiting.
//----------------------------------------------------
attempt_exit = function() {
  if(historyFile) {
    puter.readAppDataFile(`${historyFile}.txt`).then((item)=>{

      let location = rendition.currentLocation();
      if(item == undefined || item == null){
        puter.saveToAppData(`${historyFile}.txt`, location.start.cfi);
      } else {
        item.write(location.start.cfi);
      }
  
    });
  }

  puter.exit();

}

// Set a handler that is called right before this app's window is about to close.
// For example, when user clicks the close button ('X') on the window.
puter.onWindowClose(function () {
  attempt_exit();
});
