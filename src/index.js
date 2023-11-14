import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "./scss/main.css";
import Chartist from "chartist"
import "chartist/dist/chartist.css";
import "chartist-plugin-axistitle"
import "chartist-plugin-legend"
import moment from "moment/moment";

import { database } from "./js/database/database"
import { addDoc, collection, doc, getDocs, orderBy, updateDoc } from "firebase/firestore";

const upload_info_request_button = document.querySelector(".upload-req-button");
const voltaje_graph_button = document.querySelector("#graph-voltage-tab");
const current_graph_button = document.querySelector("#graph-current-tab");
const power_graph_button = document.querySelector("#graph-power-tab");
const temperature_graph_button = document.querySelector("#graph-temperature-tab");
const alarms_graph_button = document.querySelector("#graph-alarms-tab");
const modal_loader_file_container = document.querySelector("#staticBackdrop");
const drag_zone_container = document.querySelector(".modal-drop-area");
const drag_zone_loader_contaienr = document.querySelector(".modal-loader");
const helper_text_zone_container =document.querySelector(".middle-text-container");
const input_file_zone_button = document.querySelector(".btn-upload-custom-file");
const input_file_dom = document.querySelector(".file-input")
const error_modal_text_container = document.querySelector(".hidden-alert-text");
const load_input_file_button = document.querySelector(".btn-load-file");

let file_update_, isFileUploadFlag = false;
let voltage_chart, current_chart, power_chart, temperature_chart;
let data_adq_structure = {
    date:[],
    voltajeI: [],
    voltajeO: [],
    currentI: [],
    currentO: [],
    powerI: [], 
    powerO: [],    
    tempA: [],
    tempC: []
}
  
  var alarms_chart = new Chartist.Bar('.ct-a-chart', {
    labels: ['Tensión', 'Corriente', 'Temperatura'],
    series: [
        [5, 4, 3],
    ]
  }, {
    seriesBarDistance: 10,
    plugins: [
        Chartist.plugins.ctAxisTitle({
            axisX: {
                axisTitle: "Variable",
                axisClass: "ct-axis-title",
                offset: {
                  x: 0,
                  y: 50
                },
                textAnchor: "middle"
              },
              axisY: {
                axisTitle: "Alarmas",
                axisClass: "ct-axis-title",
                offset: {
                  x: 0,
                  y: -1
                },
                flipTitle: false
              },
        })
    ]
  })

  window.onload = function(){
    createUpperDom();
  }

  drag_zone_container.addEventListener("drop", (e)=>{
    e.preventDefault();
    drag_zone_container.classList.remove("active")
    const target = e.dataTransfer;
    setttingFileValue(target);
  })

  drag_zone_container.addEventListener("dragover", (e)=>{
    e.preventDefault();
    drag_zone_container.classList.add("active")
  })
  drag_zone_container.addEventListener("dragleave", ()=>{
    drag_zone_container.classList.remove("active")
  })

  voltaje_graph_button.addEventListener("click", ()=>{
    voltage_chart.update()
  });

  current_graph_button.addEventListener("click", ()=>{
    current_chart.update()
  });

  power_graph_button.addEventListener("click", ()=>{
    power_chart.update()
  });

  temperature_graph_button.addEventListener("click", ()=>{
    temperature_chart.update()
  });
  alarms_graph_button.addEventListener("click", ()=>{
    alarms_chart.update()
  });

  input_file_zone_button.addEventListener("click", ()=>{
    input_file_dom.click();
  })

  input_file_dom.addEventListener("change", function (e) {
    const target = e.target;
    setttingFileValue(target);
  });

  load_input_file_button.addEventListener("click", ()=>{
    readFile(file_update_);
    //bootstrap.Modal.getInstance(modal_loader_file_container).hide();
  })

  const setttingFileValue = (target) => {
    const fileName = target.files[0].name;
    const fileSize = target.files[0].size;
    const fileType = target.files[0].type.split("/").pop();
    let sizeInMB = Number.parseFloat(fileSize / (1024 * 1024)).toFixed(2);
    if (sizeInMB > 5) {
      console.log("More than 5MB");
      error_modal_text_container.innerHTML = `
        <span>
            <p>Archivo ${fileName}</p>
            <h5>${fileName} es demasiado pesado, intenta nuevamente</h5>
        </span>
        `;
    } else {
      const fileTypes = ["text/csv","text/plain"]
      if (
        fileTypes.includes(target.files[0].type)
      ) {
        helper_text_zone_container.innerHTML = `
        <span>
            <p>Archivo cargado:</p>
            <h5>${fileName}</h5>
            <p>Tamaño del archivo: ${sizeInMB} MB </p>
        </span>
        `;
        file_update_ = target.files[0];
      } else {
        error_modal_text_container.innerHTML = `
        <span>
            <p>Archivo ${fileName}</p>
            <h5>No tiene una extensión válida, intenta nuevamente</h5>
        </span>
        `;
      }
    }
  };

  function readFile(file){
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async function(event){
      isFileUploadFlag = true;
      drag_zone_loader_contaienr.classList.add("active");
    drag_zone_container.classList.remove("active");
    drag_zone_container.classList.add("hidden");
       let data_string = reader.result.split("\n");
        for (let i = 1; i < data_string.length; i++) {
            const element = data_string[i];
            const elements_value = element.split(";");
            
            if (elements_value.length > 1) { 
                let tranfer_date = moment(elements_value[0]);
                let voltageI_date =   parseFloat(elements_value[1].replace(',', '.'));
                let currentI_date =   parseFloat(elements_value[2].replace(',', '.'));
                let powerI_date = 0;
                let voltageO_date =   parseFloat(elements_value[3].replace(',', '.'));
                let currentO_date =   parseFloat(elements_value[4].replace(',', '.'));
                let powerO_date = parseFloat(elements_value[5].replace(',', '.'));
                let tempA_date = parseFloat(elements_value[6].replace(',', '.'));
                let tempC_date = parseFloat((elements_value[7].split("/")[0]).replace(',', '.'));


                //console.log({tranfer_date, voltageI_date, currentI_date, powerI_date, voltageO_date, currentO_date, powerO_date, tempA_date, tempC_date});
                //console.log({tranfer_date, voltageI_date, currentI_date, powerI_date, voltageO_date, currentO_date, powerO_date, tempA_date, tempC_date});
                 let document_reference = await addDoc(collection(database, "adquisition"), {
                  date: new Date(tranfer_date).getTime(),
                  voltageI: voltageI_date,
                  currentI: currentI_date,
                  powerI: powerI_date,
                  voltageO: voltageO_date,
                  currentO: currentO_date,
                  powerO: powerO_date,
                  tempA: tempA_date,
                  tempC: tempC_date
                });
                let document_id = document_reference.id;
                document_reference = await updateDoc(doc(database, "adquisition", document_id), {
                    id: document_id
                })

            }
       } 
       console.log("done");
    }
    drag_zone_loader_contaienr.classList.remove("active");
    drag_zone_container.classList.remove("hidden");
  }

  async function createUpperDom(){
    const container_prfrmnc_list_parent_dom = document.querySelector(".prfrmnc-group")
    const container_status_list_parent_dom = document.querySelector(".stts-group")

    let data_register_reference = await getDocs(collection(database, "adquisition"), orderBy("date", "desc"));
    data_register_reference.forEach((doc) => {     
      data_adq_structure.date.push(doc.data().date);
      data_adq_structure.voltajeI.push(parseFloat(doc.data().voltageI));
      data_adq_structure.currentI.push(parseFloat(doc.data().currentI));
      data_adq_structure.powerI.push(parseFloat(doc.data().powerI));
      data_adq_structure.voltajeO.push(parseFloat(doc.data().voltageO));
      data_adq_structure.currentO.push(parseFloat(doc.data().currentO));
      data_adq_structure.powerO.push(parseFloat(doc.data().powerO));
      data_adq_structure.tempA.push(parseFloat(doc.data().tempA));
      data_adq_structure.tempC.push(parseFloat(doc.data().tempC))
    });
    let data_size = data_register_reference.size;
    let date_sort = data_adq_structure.date.sort((a, b) => b - a)
      const started_date = moment();
      let last_date = moment(date_sort[date_sort.length - 1]);
      const hoursDifference = started_date.diff(last_date, 'hours');
    
   
    const time_active_dom = `
        <div class="icons-status-block">
            <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-hourglass-bottom" viewBox="0 0 16 16">
                <path d="M2 1.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1-.5-.5zm2.5.5v1a3.5 3.5 0 0 0 1.989 3.158c.533.256 1.011.791 1.011 1.491v.702s.18.149.5.149.5-.15.5-.15v-.7c0-.701.478-1.236 1.011-1.492A3.5 3.5 0 0 0 11.5 3V2h-7z"/>
            </svg>
            </div>
            <div class="status-item_text-container">
            <span>Tiempo activo</span>
            <p class="status-item_text">${hoursDifference} Horas</p>
            </div>
        </div>`;

    const quantity_data_dom = `
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-database-fill-up" viewBox="0 0 16 16">
          <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.354-5.854 1.5 1.5a.5.5 0 0 1-.708.708L13 11.707V14.5a.5.5 0 0 1-1 0v-2.793l-.646.647a.5.5 0 0 1-.708-.708l1.5-1.5a.5.5 0 0 1 .708 0ZM8 1c-1.573 0-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4s.875 1.755 1.904 2.223C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777C13.125 5.755 14 5.007 14 4s-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1Z"/>
          <path d="M2 7v-.839c.457.432 1.004.751 1.49.972C4.722 7.693 6.318 8 8 8s3.278-.307 4.51-.867c.486-.22 1.033-.54 1.49-.972V7c0 .424-.155.802-.411 1.133a4.51 4.51 0 0 0-4.815 1.843A12.31 12.31 0 0 1 8 10c-1.573 0-3.022-.289-4.096-.777C2.875 8.755 2 8.007 2 7Zm6.257 3.998L8 11c-1.682 0-3.278-.307-4.51-.867-.486-.22-1.033-.54-1.49-.972V10c0 1.007.875 1.755 1.904 2.223C4.978 12.711 6.427 13 8 13h.027a4.552 4.552 0 0 1 .23-2.002Zm-.002 3L8 14c-1.682 0-3.278-.307-4.51-.867-.486-.22-1.033-.54-1.49-.972V13c0 1.007.875 1.755 1.904 2.223C4.978 15.711 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.507 4.507 0 0 1-1.3-1.905Z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Datos adquiridos</span>
        <p class="status-item_text">${data_size} Datos</p>
      </div>
    </div>`;

    const alarms_data_dom = `
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Alarmas registradas</span>
        <p class="status-item_text">+5 Alarmas</p>
      </div>
    </div>`;

    
    const container_prfrmnc_list_icon_dom = document.createElement('div');
    container_prfrmnc_list_icon_dom.className="list-icons-status flex-r-s-s";
    container_prfrmnc_list_icon_dom.innerHTML = time_active_dom + alarms_data_dom+quantity_data_dom;
    container_prfrmnc_list_parent_dom.appendChild(container_prfrmnc_list_icon_dom); 



    let status_data_dom = `
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
          <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Tensión de entrada</span>
        <p class="status-item_text">${data_adq_structure.voltajeI[0]} VAC</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
          <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Tensión de salida</span>
        <p class="status-item_text">${data_adq_structure.voltajeO[0]} VDC</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
          <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Corriente de entrada</span>
        <p class="status-item_text">${data_adq_structure.currentI[0]} mA</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
          <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Corriente de salida</span>
        <p class="status-item_text">${data_adq_structure.currentO[0]} mA</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
          <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Potencia de entrada</span>
        <p class="status-item_text">${data_adq_structure.powerI[0]} W</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
          <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Potencia de Salida</span>
        <p class="status-item_text">${data_adq_structure.powerO[0]} W</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-thermometer-half" viewBox="0 0 16 16">
          <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415z"/>
          <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Temperatura Ambiente</span>
        <p class="status-item_text">${data_adq_structure.tempA[0]} °C</p>
      </div>
    </div>
    <div class="icons-status-block">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-thermometer-half" viewBox="0 0 16 16">
          <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415z"/>
          <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
        </svg>
      </div>
      <div class="status-item_text-container">
        <span>Temperatura Carcasa</span>
        <p class="status-item_text">${data_adq_structure.tempC[0]} °C</p>
      </div>
    </div>`


    const container_status_list_icon_dom = document.createElement('div');
    container_status_list_icon_dom.className="list-icons-status flex-r-s-s";
    container_status_list_icon_dom.innerHTML = status_data_dom;
    container_status_list_parent_dom.appendChild(container_status_list_icon_dom); 
    createMiddleDom();
    createCharts();
    createTableData();
  }


  function createMiddleDom(){
    const container_stdstcs_list_parent_dom = document.querySelector(".stdstcs-group")

    let stadistics_data_dom = `
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
            <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Tensión de entrada</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.voltajeI)} VAC</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.voltajeI)} VAC</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.voltajeI)} VAC</p>
        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
            <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Tensión de Salida</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.voltajeO)} VDC</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.voltajeO)} VDC</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.voltajeO)} VDC</p>
        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Corriente de entrada</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.currentI)} mA</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.currentI)} mA</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.currentI)} mA</p>
        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Corriente de salida</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.currentO)} mA</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.currentO)} mA</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.currentO)} mA</p>
        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Potencia de entrada</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.powerI)} W</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.powerI)} W</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.powerI)} W</p>
        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Potencia de salida</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.powerO)} W</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.powerO)} W</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.powerO)} W</p>
        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-thermometer-half" viewBox="0 0 16 16">
            <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415z"/>
            <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Temperatura Ambiente</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.tempA)} °C</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.tempA)} °C</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.tempA)} °C</p>

        </div>
      </div>
      <div class="icons-status-block">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#215ABD" class="bi bi-thermometer-half" viewBox="0 0 16 16">
            <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415z"/>
            <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
          </svg>
        </div>
        <div class="status-item_text-container">
          <span>Temperatura Critica</span>
          <p class="status-item_text">Prom: ${getPromArray(data_adq_structure.tempC)} °C</p>
          <p class="status-item_text">Max: ${Math.max.apply(null, data_adq_structure.tempC)} °C</p>
          <p class="status-item_text">Min: ${Math.min.apply(null, data_adq_structure.tempC)} °C</p>
        </div>
      </div>
    </div>`

    const container_stadistics_list_icon_dom = document.createElement('div');
    container_stadistics_list_icon_dom.className="list-icons-status flex-r-s-s";
    container_stadistics_list_icon_dom.innerHTML = stadistics_data_dom;
    container_stdstcs_list_parent_dom.appendChild(container_stadistics_list_icon_dom); 
  }

  function createCharts(){
    let data_vin_series = []
    let data_vout_series = []
    let data_cin_series = []
    let data_cout_series = []
    let data_pin_series = []
    let data_pout_series = []
    let data_ta_series = []
    let data_tc_series = []

    const chart_options = {
      lineSmooth: Chartist.Interpolation.cardinal({
          fillHoles: true,
        }),
      width: "100%",
      height:400,
      showPoint: false,
      chartPadding: {
        right: 0,
        left: 40,
        bottom: 30
      },
      axisX: {
        type: Chartist.FixedScaleAxis,
        divisor: 5,
        labelInterpolationFnc: function(value) {
          return moment(value).format('HH:mm MMM D');
        }
      },
      low: 0,
      plugins: [
        Chartist.plugins.legend({
          position:"bottom"
        }),
          Chartist.plugins.ctAxisTitle({
              axisX: {
                  axisTitle: "Fecha",
                  axisClass: "ct-axis-title",
                  offset: {
                    x: 0,
                    y: 50
                  },
                  textAnchor: "middle"
                },
                axisY: {
                  axisTitle: "Tensión [V]",
                  axisClass: "ct-axis-title",
                  offset: {
                    x: 0,
                    y: -1
                  },
                  flipTitle: false
                },
          })
      ]
    } 

    for (let i = 0; i < 120; i++) {
      data_vin_series.push({x: data_adq_structure.date[i], y: data_adq_structure.voltajeI[i]})
      data_vout_series.push({x: data_adq_structure.date[i], y: data_adq_structure.voltajeO[i]})
      data_cin_series.push({x: data_adq_structure.date[i], y: data_adq_structure.currentI[i]})
      data_cout_series.push({x: data_adq_structure.date[i], y: data_adq_structure.currentO[i]})
      data_pin_series.push({x: data_adq_structure.date[i], y: data_adq_structure.powerI[i]})
      data_pout_series.push({x: data_adq_structure.date[i], y: data_adq_structure.powerO[i]})
      data_ta_series.push({x: data_adq_structure.date[i], y: data_adq_structure.tempA[i]})
      data_tc_series.push({x: data_adq_structure.date[i], y: data_adq_structure.tempC[i]})
    }

    let chart_v_series = [{
      name: "Tensión de entrada",
      data: data_vin_series
    }, {
      name: "Tensión de salida",
      data:data_vout_series
    }];

    let chart_c_series = [{
      name: "Corriente de entrada",
      data: data_cin_series
    }, {
      name: "Corriente de salida",
      data:data_cout_series
    }];

    let chart_p_series = [{
      name: "Potencia de entrada",
      data: data_pin_series
    }, {
      name: "Potencia de salida",
      data:data_pout_series
    }];

    let chart_temps_series = [{
      name: "Temperatura ambiente",
      data: data_ta_series
    }, {
      name: "Temepratura carcasa",
      data:data_tc_series
    }];
    voltage_chart = new Chartist.Line('.ct-v-chart', {
      series: chart_v_series
    },chart_options );

    current_chart = new Chartist.Line('.ct-c-chart', {
      series: chart_c_series
    }, chart_options);

    power_chart = new Chartist.Line('.ct-p-chart', {
      series: chart_p_series
    }, chart_options);
    temperature_chart = new Chartist.Line('.ct-t-chart', {
      series: chart_temps_series
    }, chart_options);


  }

  function createTableData(){
    let time_data_table = document.querySelector(".time-list-group");
    let vin_data_table = document.querySelector(".vin-list-group");
    let vout_data_table = document.querySelector(".vout-list-group");
    let cin_data_table = document.querySelector(".cin-list-group");
    let cout_data_table = document.querySelector(".cout-list-group");
    let pin_data_table = document.querySelector(".pin-list-group");
    let pout_data_table = document.querySelector(".pout-list-group");
    let ta_data_table = document.querySelector(".tempa-list-group");
    let tc_data_table = document.querySelector(".tempc-list-group");

    for (let i = 0; i < 120; i++) {
      const time_element = data_adq_structure.date[i];
      const vin_element = data_adq_structure.voltajeI[i].toFixed(3) + ' VAC';
      const vout_element = data_adq_structure.voltajeO[i].toFixed(3)+' VDC';
      const cin_element = data_adq_structure.currentI[i].toFixed(3)+' mA';
      const cout_element = data_adq_structure.currentO[i].toFixed(3)+' mA';
      const pin_element = data_adq_structure.powerI[i].toFixed(3)+' W';
      const pout_element = data_adq_structure.powerO[i].toFixed(3)+' W';
      const ta_element = data_adq_structure.tempA[i] + ' °C';
      const tc_element = data_adq_structure.tempC[i]+' °C';

      //Time
      let time_data_table_item = document.createElement("li");
      time_data_table_item.classList.add("list-group-item")
      time_data_table_item.innerHTML= moment(time_element).format("DD MMM. YYYY HH:mm:ss");
      time_data_table.appendChild(time_data_table_item);
      //Vin
      let vin_data_table_item = document.createElement("li");
      vin_data_table_item.classList.add("list-group-item")
      vin_data_table_item.innerHTML= vin_element;
      vin_data_table.appendChild(vin_data_table_item);
      //Vout
      let vout_data_table_item = document.createElement("li");
      vout_data_table_item.classList.add("list-group-item")
      vout_data_table_item.innerHTML= vout_element;
      vout_data_table.appendChild(vout_data_table_item);
      //Cin
      let cin_data_table_item = document.createElement("li");
      cin_data_table_item.classList.add("list-group-item")
      cin_data_table_item.innerHTML= cin_element;
      cin_data_table.appendChild(cin_data_table_item);
      //Cout
      let cout_data_table_item = document.createElement("li");
      cout_data_table_item.classList.add("list-group-item")
      cout_data_table_item.innerHTML= cout_element;
      cout_data_table.appendChild(cout_data_table_item);
      //Pin
      let pin_data_table_item = document.createElement("li");
      pin_data_table_item.classList.add("list-group-item")
      pin_data_table_item.innerHTML= pin_element;
      pin_data_table.appendChild(pin_data_table_item);
      //Pout
      let pout_data_table_item = document.createElement("li");
      pout_data_table_item.classList.add("list-group-item")
      pout_data_table_item.innerHTML= pout_element;
      pout_data_table.appendChild(pout_data_table_item);
      //Ta
      let ta_data_table_item = document.createElement("li");
      ta_data_table_item.classList.add("list-group-item")
      ta_data_table_item.innerHTML= ta_element;
      ta_data_table.appendChild(ta_data_table_item);
      //Tc
      let tc_data_table_item = document.createElement("li");
      tc_data_table_item.classList.add("list-group-item")
      tc_data_table_item.innerHTML= tc_element;
      tc_data_table.appendChild(tc_data_table_item);
    }

  }
 
 function getPromArray(data){
  const sum = data.reduce((acc, current) => acc + current, 0);
  return (sum / data.length).toFixed(2);
 }