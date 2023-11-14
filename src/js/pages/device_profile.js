import "./../../scss/device_page.css";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import moment from "moment";
import { auth, database } from "./../database/database";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { bannerMenu } from "./../widgets/_banner_header";

const appContainer = document.querySelector(".app-container");
const headerContainer = document.querySelector(".header");
const sideBarMenuContainer = document.querySelector(".sidebar");
const noDeviceIdUrl = document.querySelector(".no-device-found-content");
const main_app_container = document.querySelector(".main-content");
const triggerTabList = document.querySelectorAll(".navitem");
const tiggerSideBarMenu = document.querySelector(".toggle-sidemenu-icon");
const floatingMenuLinks = document.querySelectorAll(".nav-floating-menu-link");
const grid_gallery = document.querySelector(".grid-images-container");
const side_menu_icon_action = document.querySelectorAll(".icon-action-content");
const side_menu_rounded_icon = document.querySelector(".toggle-bg-color");
const side_menu_stream_action_button = document.querySelector(
  "#stream-link-device"
);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let camera_device_id = "",
  isDeviceActive = false,
  pictures_collection = [];

triggerTabList.forEach((triggerEl) => {
  const tabTrigger = new bootstrap.Tab(triggerEl);
  triggerEl.addEventListener("click", (event) => {
    event.preventDefault();
    tabTrigger.show();
    console.log("tigger day");
    console.log(pickerFilter);
    getReportData(getLimitDate(pickerFilter));
  });
});

tiggerSideBarMenu.addEventListener("click", () => {
  sideBarMenuContainer.classList.toggle("open-menu");
  tiggerSideBarMenu.classList.toggle("toggle-menu-open");
  side_menu_rounded_icon.classList.toggle("tg-on-primary");
  side_menu_rounded_icon.classList.toggle("tg-secondary-container");
});

side_menu_icon_action.forEach((icon_action) => {
  icon_action.addEventListener("mouseover", () => {
    icon_action.classList.toggle("tg-secondary-container");
  });

  icon_action.addEventListener("mouseout", () => {
    icon_action.classList.toggle("tg-secondary-container");
  });
});

side_menu_stream_action_button.addEventListener("click", () => {
  if (isDeviceActive) {
    window.location.assign(
      "http://localhost:8080/cameras/watcher.html?id=1OGOvvbiG0vbEi5OIUCr"
    );
  }
});

/* floatingMenuLinks.forEach((link) => {
  if (link.classList.contains("active")) {
    //link.classList.add("tg-primary-container");
    link.classList.add("tg-primary");
  } else {
    link.classList.remove("tg-primary");
    //link.classList.remove("tg-primary-container");
  }
  link.addEventListener("click", () => {
    console.log(link.classList.contains("active"));
    if (link.classList.contains("active")) {
      link.classList.add("tg-primary");
    } else {
      link.classList.remove("tg-primary");
      //link.classList.remove("tg-primary-container");
    }
  });
}); */

window.onload = async () => {
  var device_id_query = urlParams.has("id");
  if (!device_id_query) {
    //noDeviceIdUrl.classList.add("show-content");
    //main_app_container.classList.remove("show-content");
  } else {
    //noDeviceIdUrl.classList.remove("show-content");
    //main_app_container.classList.add("show-content");
    camera_device_id = device_id_query = urlParams.get("id");
    if (checkIDCameraDevice(camera_device_id)) {
      console.log("Device exists");
      getDeviceProfile(camera_device_id);
      getAllPicturesDevice(camera_device_id);
      //bannerMenu(headerContainer, "AGP-F1 V1.0", "");
    }

    /*       checkSingInUser();
      sideBarMenu(appContainer);
      
      devicePresentation(await getDeviceMetada(device_id_query));
      getICALastUpdate(device_id_query);
      getLastHourEfficiency(device_id_query); */
  }
};

async function checkIDCameraDevice(device_id) {
  if (device_id != "") {
    const camera_device_query = doc(database, "devices", device_id);
    const camera_device_snap = await getDoc(camera_device_query);
    if (camera_device_snap.exists()) {
      return true;
    }
    return false;
  }
}

async function getDeviceProfile(device_id) {
  const profile_query = query(
    collection(database, "devices"),
    where("id", "==", device_id)
  );

  const profile_querySnapshot = await getDocs(profile_query);
  let profile_obj = {
    name: "",
    id: "",
    picture: "",
    last_update: "",
  };

  profile_querySnapshot.forEach((doc) => {
    profile_obj = {
      id: doc.data().id,
      name: doc.data().name,
      picture: doc.data().picture,
      last_update: doc.data().last_update,
      status: doc.data().status,
    };
    isDeviceActive = doc.data().status;
    createProfileDevice(profile_obj, document.querySelector(".nav-uppper"));
  });

  const unsubscribe = onSnapshot(profile_query, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change.type);
      if (change.type === "modified") {
        document.querySelector(".nav-uppper").innerHTML = "";
        console.log("Modified city: ", change.doc.data());
        let data = change.doc.data();
        profile_obj = {
          id: data.id,
          name: data.name,
          picture: data.picture,
          last_update: data.last_update,
          status: data.status,
        };
        isDeviceActive = data.status;
        createProfileDevice(profile_obj, document.querySelector(".nav-uppper"));
      }
    });
  });
}

async function getAllPicturesDevice(device_id) {
  const pictures_query = query(
    collection(database, "devices", device_id, "pictures")
  );

  const pictures_querySnapshot = await getDocs(pictures_query);
  pictures_querySnapshot.forEach((doc) => {
    pictures_collection.push(doc.data());
  });
  createGridPictures(grid_gallery);
}

function createProfileDevice(profile_obj, parent_dom) {
  const profileHTML = `
    <h4 class="section-title headline-medium tg-on-surface-text">
    Green Dev.
  </h4>
  <figure>
    <img
      src="${profile_obj.picture}"
      alt=""
      id="profile-device"
    />
  </figure>
  <div class="content-metadata-device tg-on-primary">
    <h2 class="title-device headline-large" id="title-device">
    <span class="circle-status-content">
    <span class="pulsating-circle-status ${
      profile_obj.status ? "tg-status-on" : "tg-status-off"
    }"></span> 
    </span>
    ${profile_obj.name} 
    </h2>
    <div class="id-device title-medium" id="id-device">
    ${profile_obj.id}
    </div>
    <div
      class="last-update-text title-medium"
      id="last-update-device"
    >
    ${moment(profile_obj.last_update).fromNow()}
    </div>
  </div>
  `;
  const profileContainer = document.createElement("div");
  profileContainer.classList.add("wrapper-up", "flex-c-c-c");
  profileContainer.innerHTML = profileHTML;
  parent_dom.appendChild(profileContainer);
}

function createGridPictures(parent_dom) {
  if (pictures_collection.length > 0) {
    pictures_collection.forEach((element) => {
      let picture_link = element.link;
      const pictureHTML = `
            <figure>
                <img src = ${element.base64}
            </figure>
    
        `;
      const pictureDOM = document.createElement("div");
      pictureDOM.classList.add("grid-img-item");
      pictureDOM.innerHTML = pictureHTML;
      parent_dom.appendChild(pictureDOM);
      if (
        picture_link != undefined &&
        picture_link.includes("firebasestorage")
      ) {
        const pictureHTML = `
            <figure>
                <img src = ${element.link}
            </figure>
    
        `;
      }
    });
  }
}
