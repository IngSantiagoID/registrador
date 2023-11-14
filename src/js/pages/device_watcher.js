import "./../../scss/device_watcher.css";
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
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const take_photo_button = document.querySelector("#takePhoto");
const last_photo_streaming = document.querySelector("#actually-frame");

let camera_device_id = "";

take_photo_button;

take_photo_button.addEventListener("mouseover", () => {
  take_photo_button.classList.toggle("tg-secondary-container");
  take_photo_button.classList.toggle("tg-on-secondary-container-text");
});

take_photo_button.addEventListener("mouseout", () => {
  take_photo_button.classList.toggle("tg-secondary-container");
  take_photo_button.classList.toggle("tg-on-secondary-container-text");
});

take_photo_button.addEventListener("click", async ()=>{
  const photo_ref = await updateDoc(doc(database, "devices", camera_device_id, "stream-monitor", "Ft5akiPfbLXOtrDUyVyS"),{
    takePictureButton: true,
  } ); 
});

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
      getLastStreamingPhoto(camera_device_id);
      console.log("Device exists");
    }
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

async function getLastStreamingPhoto(device_id){
  let monitor_token = "Ft5akiPfbLXOtrDUyVyS";
  const photo_query = query(
    collection(database, "devices", device_id, "stream-monitor"),
    where("id", "==", monitor_token)
  );

  const unsubscribe = onSnapshot(photo_query, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change.type);
      if (change.type === "modified") {
        console.log("Photo URL",  change.doc.data());
        last_photo_streaming.src = change.doc.data().last_picture;
      }
    });
  });



}
