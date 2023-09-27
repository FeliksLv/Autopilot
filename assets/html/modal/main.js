    function Bifrost(myCalendar) { return window.__Bifrost = myCalendar }
    function qaData(emailData) { return window.__qaData = emailData }
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
    //Get active cases tab
    function getActiveTab() {
      return [...$('write-deck > div > div')].reduce((acc, e) => {
        return ($(e).attr('style') === '' ? e : acc)
      }, null)
    }
    //Creates __caseData responsible for save all data of the current active case 
    async function bulkBifrost() {
      $('[aria-label="Case log"]')[0].click()
      for (const message of $('.active-case-log-container case-message-view')) {
        if ($(message).html().includes('An appointment has been successfully created')) {
          message.querySelector('div > div').click();
          await waitForEntity('.message-body.message-body1', 'extra_information', 'from', message)

          let activeCase = $('[data-case-id]').attr('data-case-id')
          let richContent = message.querySelector('.message-body.message-body1').innerText
          let region = /(?<=\[)(.*?)(?=\])/
          let timezone = richContent.match(region)[0];

          window.__caseData = __Bifrost.reduce((acc, data) => {
            return (activeCase === data.case_id ? {
              ...data, appointment: moment.tz(data.appointment, 'UTC').tz(timezone).format(('DD/MM/YYYY - hh:mm A')),
              name: $("head > title").text().match(/(?<=: )(.*?)(?= - C)/)[0]
            } : acc)
          }, {})

          console.log(__caseData)
        }
      }
    }

    async function waitForEntity(el, id, type, origin) {
      return new Promise(async (resolve) => {
        let timer = 0
        const interval = 500

        while (timer < 5000) {
          if (type === 'sel' && document.querySelectorAll(el)[0]) {
            console.log(`%cSelector ${id} has been found`, "color: orange")
            resolve();
            return
          }
          if (type === 'from' && origin.querySelectorAll(el)[0]) {
            console.log(`%cSelector ${id} has been found`, "color: orange")
            resolve();
            return
          }
          await new Promise(resolve => setTimeout(resolve, interval));
          timer += interval
        }
        throw new Error(`%cEntity ${id} was not found`, "color: red")
      })
    };

    async function newEmail() {
      $('[aria-label="Create a write card"]').dispatchEvent(new Event('focus'))
      await waitForEntity('[aria-label="Create new email"]', 'Lateral_bar', 'sel')
      $('[aria-label="Create new email"]')[0].click()
      console.log("%cCreated email", "color: orange")
    };

    async function getActiveCard() {
      let cards = getActiveTab().querySelectorAll('card')
      return new Promise((resolve) => {
        for (const element of cards) {
          if ($(element).attr('aria-hidden') === 'false') {
            window.__activeCard = {
              'element': element,
              'type': $(element).attr('card-type')
            }
            console.log(`%c${window.__activeCard.type} card detected`, "color: orange")
            resolve()
          }
        }
        throw new Error(`Entity cards not found`)
      })
    }

    async function updateAdresses() {
      //Update the sender
      let dropdownEmails = 'material-select-dropdown-item[id*="email-address-id--"]';
      await waitForEntity('.address[buttoncontent]', 'dropdownButton', 'from', __activeCard.element)
      __activeCard.element.querySelector('.address[buttoncontent]').click();
      await waitForEntity(dropdownEmails, 'dropdownEmails', 'sel');
      [...document.querySelectorAll(dropdownEmails)].pop().click()
      //Update the attendees

    }

    async function insertTemplate() {
      document.querySelector('[aria-label="Insert canned response"]').click()
      console.log(document.querySelectorAll('[aria-label="Insert canned response"]'));
      await waitForEntity('canned-response-dialog input', 'Canned_response input', 'sel')
      document.querySelector('canned-response-dialog input').value = document.querySelector("#templateEmail").value //DYNAMIC
      __activeCard.selectTemplate = document.querySelector('canned-response-dialog input').value
      document.querySelector('canned-response-dialog input').dispatchEvent(new Event('input'));
      await waitForEntity('material-select-dropdown-item span', 'Canned_response Dropdown', 'sel')
      __activeCard.element.querySelector('#email-body-content-top-content').innerHTML = '<p dir="auto"><br></p>'
      document.querySelector('material-select-dropdown-item span').click()
      await waitForEntity('.visual-message', 'Canned_response_confirmation', 'sel')
    }

    async function autoFill() {
      let selectedTemp = __qaData.reduce((acc, e) => {
        return e.crCode === __activeCard.selectTemplate ? e : acc
      })
      if (selectedTemp.inputs.appointment) {
        __activeCard.element.querySelector(selectedTemp.inputs.appointment).innerHTML = __caseData.appointment
      }
      if (selectedTemp.inputs.name) {
        __activeCard.element.querySelector(selectedTemp.inputs.name).innerHTML = __caseData.name
      }
      if (selectedTemp.inputs.phone) {
        __activeCard.element.querySelector(selectedTemp.inputs.phone).innerHTML = __caseData.phone
      }
      if (selectedTemp.inputs.nothing) {
        console.log('No fields');
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


    async function init(resolve) {
      try {
        //await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/assets/html/modal/modal.css")
        await loadCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+Shavian&family=Poppins:wght@300&display=swap')
        await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
        await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadModal()
        await loadScript('https://momentjs.com/downloads/moment.min.js');
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

    async function attachEmail() {
      try {
        await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbwTbgE5PuM0JhS9duULuJdCkMsAvIoDx-hgeEr_rS4/dev?key=b020dnl5md95fvierdeprnv40o@group.calendar.google.com&portal=Bifrost");
        await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbznkfAXGOVgDS385t_czkBUD9rhLV3o4Xz87vsJmn3YrjajDE5m_BjTaUuABxTmpUJk/exec?portal=qaData");
        await bulkBifrost()
        await newEmail()
        await getActiveCard()
        await updateAdresses()
        await insertTemplate()
        await autoFill()
        console.log('Success msg');
      }
      catch (error) {
        console.error('Erro durante a execução em:', error);
      }
    }

    (async function main() {
      try {
        await init()
        console.log(window.jQuery)
        console.log(window.moment)
        console.log(moment.tz.countries())

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
        $('#showTime').on("click", attachEmail);

        $(window).on("change", handleSelect)
        $(window).on("mouseover", dragModal)
      }
      catch (error) {
        console.error('Erro durante a execução em:', error);
      }
    })();
