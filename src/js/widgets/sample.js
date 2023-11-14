import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "./../../scss/sunshine.css"

import Swiper from 'swiper';
import 'swiper/css';

console.log("sample.js");
const swiper = new Swiper('.swiper', {
    autoplay:true,
    direction: 'vertical',
    loop: true,
    pagination: {
      el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });