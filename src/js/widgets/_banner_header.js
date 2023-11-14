export function bannerMenu(dom_parent, device_nikname, user_metadata) {
  console.log("here");
  const bannerMenuHTML = `
        <div class="app-bar flex-between-center default">
          <div class="left">
            <button class="mobile-navbar-toggle">
              <span class="flex-center default">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-list"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                  />
                </svg>
              </span>
            </button>
            <div class="device-metadata">
              <div class="wrapper flex-center">
              <p class="device-title">Dispositivo: </p>
                  <p class="device-nickname">${device_nikname}</p>
              </div>
            </div>
          </div>
          <div class="right flex-nojc-center">
            <a href="#" class="app-bar-doc-link">Documentación</a>
            <div class="alerts-content">
              <button
                class="alert-icon-content"
                type="button"
                aria-expanded="false"
                aria-label="Abrir panel de alertas"
                aria-haspopup="true"
              >
                <span class="fas-button">
                  <i class="fas fa-bell"></i>
                  <span class="dot tigger-pulse"></span>
                </span>
              </button>
            </div>
            <tairq-profile>
              <div class="area-prfile-visible">
                <div class="container-profile">
                  <a
                    href="#"
                    class="pic-profile-link"
                    aria-label="Cuenta SmarThinks de..."
                  >
                    <img
                      src="${
                        user_metadata.photo
                          ? user_metadata.photo
                          : `https://tairq.smarthinkscorp.com/assets/not-user.png`
                      }"
                      aria-hidden="true"
                      class="pic-img"
                    />
                  </a>
                </div>
              </div>
            </tairq-profile>
          </div>
        </div>
      `;
  const bannerMenuContainer = document.createElement("tgreen-appbar");
  bannerMenuContainer.innerHTML = bannerMenuHTML;
  dom_parent.appendChild(bannerMenuContainer);

  const navbar_dom = document.querySelector(".app-bar");
  const burger_menu_icon = document.querySelector(".mobile-navbar-toggle");
  burger_menu_icon.addEventListener("click", () => {
    document.querySelector(".nav-bar").classList.toggle("navbar-open");
  });
  window.onscroll = () => {
    if (
      document.body.scrollTop >= 80 ||
      document.documentElement.scrollTop >= 80
    ) {
      navbar_dom.classList.add("onscroll-navbar");
    } else {
      navbar_dom.classList.remove("onscroll-navbar");
    }
  };
}
