"use strict";
/*

Så följande:

async function getData(){
const promise = await fetch(URL);
const data = await promise.json();
return data;
}

async function doingSth(){
const data = await getData();
}

*/

//Grab all users, to be used every 30 sec with interval

const userURL = `http://mpp.erikpineiro.se/dbp/sameTaste/users.php`;

const pictureIDURL = `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=11&q=snow`;

const pictureURL = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;

let mainUserFavorites = [];
let userArray = [];
let arrayOfImages = [];
const mainUser = 21;
const testerUser = 666;
let selectedUser = mainUser;

async function grabUsers() {
  const response = await fetch(userURL);
  const data = await response.json();

  return data.message;
}

if (localStorage.length <= 0) {
  ("hej");
  loadingBarPaintingsWindow();
}

setInterval(displayUsers, 30000);
displayUsers();

function userListTimer() {
  let i = 29;
  let timer = document.createElement("div");
  timer.classList.add("timer");
  timer.innerHTML = `Time until refresh: ${i}`;
  setInterval(() => {
    i--;
    timer.innerHTML = `Time until refresh: ${i}`;
  }, 3000);

  document.querySelector("#listOfUsers").append(timer);
  // setTimeout(() => {clearInterval(intervalID)}, 30000)
}

function loadingBarUserList() {
  let blackWindowWithText = document.createElement("div");
  blackWindowWithText.classList.add("loadingScreen");
  blackWindowWithText.innerHTML = `Loading`;

  document.querySelector("#listOfUsers").append(blackWindowWithText);

  setTimeout(function () {
    blackWindowWithText.remove();
  }, 2000);
}

function loadingBarPaintings(domElement) {
  let blackWindowWithText = document.createElement("div");
  blackWindowWithText.classList.add("loadingScreen");
  blackWindowWithText.innerHTML = `Loading`;

  domElement.append(blackWindowWithText);

  setTimeout(function () {
    blackWindowWithText.remove();
  }, 5000);
}

function loadingBarPaintingsWindow() {
  let blackWindowWithText = document.createElement("div");
  blackWindowWithText.classList.add("loadingScreen");
  blackWindowWithText.innerHTML = `Loading`;

  document.querySelector("#paintingWindow").append(blackWindowWithText);

  setTimeout(function () {
    blackWindowWithText.remove();
  }, 5000);
}

async function displayUsers() {
  document.querySelector("#listOfUsers").innerHTML = "";
  let arrayOfUsers = await grabUsers();
  userArray = arrayOfUsers;

  arrayOfUsers.sort((a, b) => a.alias > b.alias);
  loadingBarUserList();
  userListTimer();

  const mainUserFound = arrayOfUsers.find((user) => user.id == mainUser);
  mainUserFavorites = mainUserFound.favs;

  const mainTesterFound = arrayOfUsers.find((user) => user.id == testerUser);

  let intTesterFavs = mainTesterFound.favs.map((element) =>
    parseInt(element, 10)
  );
  const mainTesterCommonFavs = intTesterFavs.filter((element) => {
    return mainUserFavorites.includes(element);
  });

  createMainUser(
    mainUserFound.alias,
    mainUserFound.favs.length,
    mainUserFound.id
  );

  createMainTester(
    mainTesterFound.alias,
    mainTesterFound.favs.length,
    mainTesterCommonFavs.length,
    mainTesterFound.id
  );

  arrayOfUsers = arrayOfUsers.filter(
    (user) => user.id != mainUser && user.id != testerUser
  );

  arrayOfUsers.forEach((user) => {
    let intArrayOfUserFavs = user.favs.map((element) => parseInt(element, 10));

    const userCommonFavs = intArrayOfUserFavs.filter((element) => {
      return mainUserFavorites.includes(element);
    });

    createUserDivs(
      user.alias,
      user.favs.length,
      userCommonFavs.length,
      user.id
    );
  });

  displayPictures();
}

function createMainUser(alias, amountOfFavs, id) {
  let nameTag = document.createElement("div");
  nameTag.innerHTML = `${alias} [${amountOfFavs} ]`;

  if (selectedUser == mainUser) {
    nameTag.classList.add("selected");
  }

  nameTag.classList.add("mainUser");

  nameTag.addEventListener("click", (e) => {
    selectedUser = id;
    //goes through the document and gets any html tag that has the selected class
    let previousSelected = document.querySelector(".selected");
    //if its not undefined then it removes the selected class from the element
    if (previousSelected) {
      previousSelected.classList.remove("selected");
    }
    e.target.classList.add("selected");
    displayPictures();
  });

  document.querySelector("#listOfUsers").append(nameTag);
}

function createMainTester(alias, amountOfFavs, commonFavs, id) {
  let nameTag = document.createElement("div");

  if (selectedUser == id) {
    nameTag.classList.add("selected");
  }

  nameTag.classList.add("mainTester");
  nameTag.innerHTML = `${alias} [${amountOfFavs}] (${commonFavs})`;
  nameTag.addEventListener("click", (e) => {
    selectedUser = id;
    //goes through the document and gets any html tag that has the selected class
    let previousSelected = document.querySelector(".selected");
    //if its not undefined then it removes the selected class from the element
    if (previousSelected) {
      previousSelected.classList.remove("selected");
    }
    e.target.classList.add("selected");
    displayPictures();
  });
  document.querySelector("#listOfUsers").append(nameTag);
}

function createUserDivs(alias, amountOfFavs, commonFavs, id) {
  let nameTag = document.createElement("div");

  if (selectedUser == id) {
    nameTag.classList.add("selected");
  }

  nameTag.innerHTML = `${alias} [${amountOfFavs}] (${commonFavs})`;
  nameTag.classList.add("nameTags");
  nameTag.addEventListener("click", (e) => {
    selectedUser = id;
    //goes through the document and gets any html tag that has the selected class
    let previousSelected = document.querySelector(".selected");
    //if its not undefined then it removes the selected class from the element
    if (previousSelected) {
      previousSelected.classList.remove("selected");
    }
    e.target.classList.add("selected");
    displayPictures();
  });
  document.querySelector("#listOfUsers").append(nameTag);
}

async function grabPictureIDs() {
  const response = await fetch(pictureIDURL);
  const data = await response.json();

  return data.objectIDs;
}

async function savePhotos() {
  let arrayOfPictureIDs = await grabPictureIDs();
  let arrayOfPromises = arrayOfPictureIDs.map((pictureID) =>
    grabPicture(pictureID)
  );

  let arrayOfImageObjects = await Promise.all(arrayOfPromises);

  arrayOfImages = arrayOfImageObjects;
  arrayOfImageObjects.forEach((element) => {
    localStorage.setItem(`${element.objectID}.Title`, element.title);
    localStorage.setItem(
      `${element.objectID}.ImageSmall`,
      element.primaryImageSmall
    );
    localStorage.setItem(
      `${element.objectID}.ArtistName`,
      element.artistDisplayName
    );
  });

  displayPictures();
}

async function grabPicture(pictureID) {
  if (localStorage.getItem(`${pictureID}.Title`)) {
    return {
      objectID: pictureID,
      title: localStorage.getItem(`${pictureID}.Title`),
      primaryImageSmall: localStorage.getItem(`${pictureID}.ImageSmall`),
      artistDisplayName: localStorage.getItem(`${pictureID}.ArtistName`),
    };
  }

  const response = await fetch(pictureURL + pictureID);
  const data = await response.json();

  return data;
}

function findMainUser() {
  let foundMainUser = userArray.find((user) => {
    return user.alias == "Alexander";
  });
  return foundMainUser.id;
}

savePhotos();

async function displayPictures() {
  document.querySelector("#paintingWindow").innerHTML = "";
  let selectedUserID = selectedUser;

  if (selectedUserID != mainUser) {
    let userFavs = userArray.find((user) => user.id == selectedUserID).favs;

    let favPromises = userFavs.map((favs) => grabPicture(favs));

    let response = await Promise.all(favPromises);
    let sortedResponse = response.sort((a, b) => a.title > b.title);

    sortedResponse.forEach((element) => createPictureDOM(element));
  } else {
    let SortedarrayOfImages = arrayOfImages.sort((a, b) => a.title > b.title);

    SortedarrayOfImages.forEach((images) => createPictureDOM(images));
  }
}

function createPictureDOM(picture) {
  let pictureDivWrapper = document.createElement("div");
  let pictureDOM = document.createElement("img");
  let paragraphDOM = document.createElement("p");
  let pictureID = parseInt(picture.objectID, 10);

  if (selectedUser == mainUser) {
    let pictureButton = document.createElement("button");
    pictureButton.classList.add("pictureButtonClick");
    pictureButton.innerHTML = "Add";
    if (mainUserFavorites.includes(picture.objectID)) {
      pictureButton.innerHTML = "Remove";
      pictureDivWrapper.classList.add("favoritePictures");
    }

    pictureButton.addEventListener("click", (e) => {
      if (e.target.innerHTML == "Add") {
        addPictureToFavs(pictureID, e.target.parentElement);
        loadingBarPaintings(e.target.parentElement);
        e.target.parentElement.classList.add("favoritePictures");
        pictureButton.innerHTML = "Remove";
      } else {
        removePictureToFavs(pictureID);
        loadingBarPaintings(e.target.parentElement);
        e.target.parentElement.classList.remove("favoritePictures");
        pictureButton.innerHTML = "Add";
      }
    });

    pictureDivWrapper.append(pictureButton);
  } else {
    if (mainUserFavorites.includes(pictureID)) {
      pictureDOM.classList.add("commonFavoritePictures");
    } else {
      pictureDOM.classList.add("favoritePictures");
    }
  }

  pictureDivWrapper.classList.add("pictureDivs");
  pictureDOM.src = picture.primaryImageSmall;

  paragraphDOM.innerHTML = `${picture.title} by ${picture.artistDisplayName}`;

  pictureDivWrapper.append(pictureDOM);
  pictureDivWrapper.append(paragraphDOM);
  document.querySelector("#paintingWindow").append(pictureDivWrapper);
}

//Adds a favorite painting by calling the api
async function addPictureToFavs(pictureFavID, divWrapper) {
  let URL = await fetch(
    new Request(userURL, {
      method: `PATCH`,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ id: mainUser, addFav: pictureFavID }),
    })
  );
  errorHandler(URL.status, "add", divWrapper);
  displayUsers();
  console.log("Added Picture", pictureFavID);
}

//Removes a favorite painting by calling the api
async function removePictureToFavs(pictureFavID) {
  let URL = await fetch(
    new Request(userURL, {
      method: `PATCH`,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ id: mainUser, removeFav: pictureFavID }),
    })
  );

  errorHandler(URL.status, "remove");
  displayUsers();
  console.log("Remove Picture", pictureFavID);
}

//Handles all promise errors and displays an alert window
function errorHandler(fetch, addOrRemove, divWrapper) {
  if (fetch == 409) {
    divWrapper.classList.remove("favoritePictures");
    window.alert("You have added too many favorites");
  } else if (fetch == 400) {
    window.alert("Bad request");
  } else if (fetch == 404) {
    window.alert("Not found");
  } else if (fetch == 200 && addOrRemove == "remove") {
    window.alert("Removal successful");
  } else if (fetch == 200 && addOrRemove == "add") {
    window.alert("Add successful");
  }
}