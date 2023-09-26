  //Load CDNs
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.crossOrigin = 'anonymous'
      script.src = url;
      script.onload = resolve(`Fully loaded: ${url}`);
      script.onerror = reject(`Loading error: ${url}`);
      document.head.appendChild(script);
    });
  }
  //Load CSS
  function loadCSS(url) {
    return new Promise((resolve, reject) => {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous'
      link.href = url;
      link.onload = resolve(`Fully loaded: ${url}`);;
      link.onerror = reject(`Loading error: ${url}`);;
      document.head.appendChild(link);
    });
  }
  //Valida o Calendar ID
  function validarInput() {
    const input = document.querySelector(".modal-input input")
    const msgContainer = document.querySelector(".message-container")
    const valorInput = input.value.trim()
    const mensagem = document.createElement("div")
    const dateConfig = {
      dateFormat: 'dd-mm-yy',
      changeMonth: true,
      changeYear: true,
      minDate: new Date(),
      yearRange: "c-0:c+1",
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    }

    // Verificacao de input
    if (valorInput.includes("@group.calendar.google.com") && valorInput.length === 52) {
      //Criacao da div que contem os select
      const selectDiv = document.createElement("div")
      $(selectDiv).addClass("modal-select")
      $('.modal-body').html("")
      $('.modal-body')[0].appendChild(selectDiv)

      fetch('https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/assets/html/modal/select.html')
        .then(response => response.text()).then(temp => { $('.modal-select').html(temp) })

      var isInserted = setInterval(() => {
        if ($('#resch_time').length) {
          clearInterval(isInserted);
          timePickerConfig()
          $(function () { $("#resch_date").datepicker(dateConfig) })

          $('#showTime').on("click", async () => {
            $('.alert').removeClass("show");
            $('.alert').addClass("hide");
            try {
              await showError()
              await removeError()
              await showDefault()
            }
            catch (err) {
              console.log(err)
            }
          });
        }
      }, 100)

    }
    else {
      $(msgContainer).html("")
      $(mensagem).text("Erro: Escreva um ID valido!")
      msgContainer.appendChild(mensagem);
    }
  }
  //Handles the select tags visibility
  function handleSelect(event) {
    let selectType = document.querySelector('#temp_type')
    let selectEmail = document.querySelector('#templateEmail')
    let reschInputs = ['#resch_date', '#resch_time', '#resch_period']

    if (event.target === $(selectType)[0]) {
      for (option of selectEmail) {
        if ($(selectType).val() === "leadGen") {
          selectEmail.disabled = false
          selectEmail.value = "default"
          option.value.includes("lg") ? $(option).show() : $(option).hide()
        }
        if ($(selectType).val() === "tag") {
          selectEmail.disabled = false
          selectEmail.value = "default"
          option.value.includes("ts") ? $(option).show() : $(option).hide()
        }
        if ($(selectType).val() === "external") {
          console.log('Coming Soon')
        }
        if ($(selectType).val() === "default") {
          selectEmail.disabled = true
          selectEmail.value = "default"
        }
      }
    }

    //Activa el input de reagendamiento apenas para los templates correspondientes
    if (event.target === selectEmail) {
      for (option of [...selectEmail.children].filter(e => e.style.display === '')) {
        selectEmail.value.match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/)
          ? reschInputs.forEach(input => document.querySelector(input).disabled = false)
          : reschInputs.forEach(input => document.querySelector(input).disabled = true)
      }
    }
  }
  //Make the modal draggable
  function dragModal(event) {
    if (event.target.closest('.modal-header')) {
      $("#myModal").draggable({
        disabled: false,
        cursor: "grab",
      })
    }
    else { $("#myModal").draggable({ disabled: true }) }
  }
  //Timepicker config
  function timePickerConfig() {
    for (var hh = 1; hh <= 12; hh++) {
      for (var mm = 0; mm < 60; mm += 15) {
        var formattedHh = hh.toString().padStart(2, '0');
        var formattedMm = mm.toString().padStart(2, '0');
        var fullTime = `${formattedHh}:${formattedMm}`
        var option = document.createElement('option')
        option.value = fullTime;
        option.text = fullTime;
        document.querySelector('#resch_time').appendChild(option);
      }
    }
  }
  async function showSuccess() {
    return new Promise(async (resolve) => {
      $('.alert').on("animationend", (e) => {
        $('.alert').removeClass(["default", "hide"]);
        $('.alert > span:first-child').removeClass(["fa-magic"]);
        $('.alert > span:first-child').addClass("fa-check-circle");
        $('.alert').addClass(["show", "success"]);
        $(".msg").text('Inserido!')
        $('.close-btn').show()
        $('.alert').off()
        resolve()
      })
    })
  }
  async function showError() {
    return new Promise(async (resolve) => {
      $('.alert').on("animationend", (e) => {
        $('.alert').removeClass(["default", "hide"]);
        $('.alert > span:first-child').removeClass(["fa-magic"]);
        $('.alert > span:first-child').addClass("fa-exclamation-circle");
        $('.alert').addClass(["show", "error"]);
        $(".msg").text('Execução interrompida!')
        $('.close-btn').show()
        $('.alert').off()
        resolve()
      })
    })
  }
  async function removeError() {
    return new Promise(async (resolve) => {
      $(".close-btn").on("click", (e) => {
        $('.alert').removeClass("show");
        $('.alert').addClass("hide");
        clearTimeout(closeAlert)
        $('.alert').off()
        resolve()
      })
      var closeAlert = setTimeout(() => {
        $('.close-btn').hide()
        $('.alert').removeClass("show");
        $('.alert').addClass("hide");
        $('.alert').off()
        resolve()
      }, 3000);
    })
  }
  async function showDefault() {
    return new Promise(async (resolve) => {
      $('.alert').on("animationend", (e) => {
        $('.alert').removeClass(["hide", "error", "success"]);
        $('.alert > span:first-child').removeClass(["fa-exclamation-circle", "fa-check-circle"]);
        $('.alert > span:first-child').addClass("fa-magic");
        $('.alert').addClass(["show", "default"]);
        $(".msg").text('Aguardando instruçoes')
        $('.close-btn').hide()
        $('.alert').off()
        resolve()
      })
    })
  }
  async function loadDependencies() {
    try {
      await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/assets/html/modal/modal.css")
      await loadCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+Shavian&family=Poppins:wght@300&display=swap')
      await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
      await loadScript('https://momentjs.com/downloads/moment.min.js');
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadScript("https://code.jquery.com/ui/1.13.2/jquery-ui.min.js");
      await loadScript("https://momentjs.com/downloads/moment-timezone-with-data-10-year-range.min.js");
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadCSS('https://code.jquery.com/ui/1.13.2/themes/dark-hive/jquery-ui.css')
    }
    catch (error) {
      console.error('Erro ao carregar CDN:', error);
    }
  }
  async function loadModal() {
    return fetch('https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/assets/html/modal/modal.html')
      .then(response => response.text()).then(temp => { $('.modal-container').html(temp) })
  }

  (async function main() {
    try {
      await loadDependencies()
      console.log(window.jQuery)
      console.log(window.moment)
      console.log(moment.tz.countries())
      await loadModal()

      // Abrir a modal quando o ícone de notas é clicado
      const noteIcon = document.getElementById("noteIcon");
      const circle = document.getElementById("circle");
      const modal = document.getElementById("myModal");
      const closeModal = document.getElementById("closeModal");
      const checkButton = document.getElementById("checkButton");

      circle.addEventListener("click", () => {
        modal.style.display = "block"; // Exibe a modal
        circle.style.display = "none"
      });
      // Fechar a modal quando o botão de fechar é clicado
      closeModal.addEventListener("click", () => {
        modal.style.display = "none"; // Oculta a modal
        circle.style.display = "flex"
      });
      // Adicionar um evento de clique ao botão "Check"
      $(checkButton).on("click", validarInput);
      $(window).on("change", handleSelect)
      $(window).on("mouseover", dragModal)
    }
    catch (error) {
      console.error('Erro durante a execução em:', error);
    }
  })();
