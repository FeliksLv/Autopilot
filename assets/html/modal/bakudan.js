    function Bifrost(myCalendar) { return window.__Bifrost = myCalendar }
    function qaData(emailData) { return window.__qaData = emailData }

    function closeModal() {
      $('#myModal').hide(); // Exibe a modal
      $('#circle').css("display", "flex");
    }

    function openModal() {
      $('#myModal').show(); // Exibe a modal
      $('#circle').hide()
    }

    //Load CDNs
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
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
        link.href = url;
        link.onload = resolve(`Fully loaded: ${url}`);;
        link.onerror = reject(`Loading error: ${url}`);;
        document.head.appendChild(link);
      });
    }

    //Valida o Calendar ID
    async function validarInput() {
      const input = $(".modal-input input").val()
      const msgContainer = document.querySelector(".message-container")
      const message = document.createElement("div")
      let calendarId = document.cookie.match(/calendarKey=(.{52})/);
      //Disable all inputs of modal#1 until the Key validation will be done
      $('.input-modal > input').prop('disabled', true)
      $('#checkButton').prop('disabled', true)

      try {
        await validateKey()
        await insertModal2()
      }
      catch (err) {
        if (err.message === 'INVALID CALENDAR_ID') {
          //Reativa os inputs do modal 1 para refazer a validação
          $('.input-modal > input').prop('disabled', false)
          $('#checkButton').prop('disabled', false)
          //Imprime mensagem de erro
          $(msgContainer).html("")
          $(message).text("Erro: Escreva um ID valido!")
          msgContainer.appendChild(message);
        }
        if (err.message === 'MODAL2 HTML FAILED') {
          console.log('Erro 2')
        }
      }
    }

    function insertModal2() {
      return new Promise(async (resolve, reject) => {
        const selectDiv = document.createElement("div")
        $(selectDiv).addClass("modal-select")
        $('.modal-body').html("")
        $('.modal-body')[0].appendChild(selectDiv)

        //Criacao da div que contem os select
        fetch('https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/assets/html/modal/select.html')
          .then(response => {
            if (!response.ok) { reject(new Error('MODAL2 HTML FAILED')) }
            else { return response.text() }
          }).then(temp => {
            $('.modal-select').html(temp)
            resolve()
          })
      })
    }

    function validateKey() {
      return new Promise(async (resolve, reject) => {
        let calendarKey = document.cookie.match(/calendarKey=(.{52})/)
        console.log(calendarKey)
        if (calendarKey != null && await updateCalendar(calendarKey[1])) {
          resolve();
        }
        reject(new Error("INVALID CALENDAR_ID"))
      })
    }

    function updateCalendar(key) {
      return new Promise(async (resolve, reject) => {
        let timer = 0
        const interval = 200
        $(".myCalendar").remove()
        var script = document.createElement('script');
        $(script).addClass("myCalendar")
        window.__Bifrost ? window.__Bifrost = undefined : null
        script.type = 'text/javascript';
        script.src = `https://script.google.com/a/macros/google.com/s/AKfycbwTbgE5PuM0JhS9duULuJdCkMsAvIoDx-hgeEr_rS4/dev?key=${key}&portal=Bifrost`;
        document.head.appendChild(script);


        while (timer < 4000) {
          if (window.__Bifrost !== undefined && __Bifrost.data.length) {
            console.log(`%cValid Calendar ID`, "color: green")
            console.log(__Bifrost);
            resolve(true)
            return
          }
          await new Promise(resolve => setTimeout(resolve, interval));
          timer += interval
        }
        resolve(false)
      })
    };

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
    function bulkBifrost() {
      return new Promise(async (resolve, reject) => {
        $('[aria-label="Case log"]')[0].click()
        for (const message of $('.active-case-log-container case-message-view')) {
          if ($(message).html().includes('An appointment has been successfully created')) {
            message.querySelector('div > div').click();
            await waitForEntity('.message-body.message-body1', 'extra_information', 'from', message)

            let activeCase = $('[data-case-id]').attr('data-case-id')
            let richContent = message.querySelector('.message-body.message-body1').innerText
            let region = /(?<=\[)(.*?)(?=\])/
            let timezone = richContent.match(region)[0];
            let getName = [...$('tab')].reduce((acc, e) => { return (e.getAttribute('aria-selected') === 'true' ? e.innerText : acc) }, 'DEFAULT')

            window.__caseData = __Bifrost.data.reduce((acc, data) => {
              return (activeCase === data.case_id ? {
                ...data, appointment: moment.tz(data.appointment, 'UTC').tz(timezone).format(('DD/MM/YYYY - hh:mm A')),
                name: getName
              } : acc)
            }, {})

            console.log(__caseData)
            resolve()
          }
        }
        reject(new Error("BIFROST BULK ERROR"))
      })
    }

    function waitForEntity(el, id, type, origin) {
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
        reject(new Error(`%cEntity ${id} was not found`))
      })
    };

    function loadScript(url) {
      return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = resolve(`Fully loaded: ${url}`);
        script.onerror = reject(`Loading error: ${url}`);
        document.head.appendChild(script);
      });
    }


    async function newEmail() {
      return new Promise(async (resolve) => {
        $('[aria-label="Create a write card"]')[0].dispatchEvent(new Event('focus'))
        await waitForEntity('[aria-label="Create new email"]', 'Lateral_bar', 'sel')
        $('[aria-label="Create new email"]')[0].click()
        console.log("%cCreated email", "color: orange")
        resolve()
      })
    };

    async function getActiveCard() {
      return new Promise((resolve, reject) => {
        let cards = getActiveTab().querySelectorAll('card')
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
        reject(new Error(`Entity cards not found`))
      })
    }

    function updateAdresses() {
      return new Promise(async (resolve, reject) => {
        //Update the sender
        let dropdownEmails = 'material-select-dropdown-item[id*="email-address-id--"]';
        await waitForEntity('.address[buttoncontent]', 'dropdownButton', 'from', __activeCard.element)
        __activeCard.element.querySelector('.address[buttoncontent]').click();
        await waitForEntity(dropdownEmails, 'dropdownEmails', 'sel');
        console.log([...document.querySelectorAll(dropdownEmails)]);
        [...document.querySelectorAll(dropdownEmails)].pop().click()
        console.log([...document.querySelectorAll(dropdownEmails)]);
        console.log('depos - resolvido');
        resolve()
        //Update the attendees
      })
    }

    function insertTemplate() {
      return new Promise(async (resolve) => {
        document.querySelector('[aria-label="Insert canned response"]').click()
        await waitForEntity('canned-response-dialog input', 'Canned_response input', 'sel')
        document.querySelector('canned-response-dialog input').value = document.querySelector("#templateEmail").value //DYNAMIC
        __activeCard.selectTemplate = document.querySelector('canned-response-dialog input').value
        document.querySelector('canned-response-dialog input').dispatchEvent(new Event('input'));
        await waitForEntity('material-select-dropdown-item span', 'Canned_response Dropdown', 'sel')
        __activeCard.element.querySelector('#email-body-content-top-content').innerHTML = '<p dir="auto"><br></p>'
        console.log(getSelection().anchorNode)
        document.querySelector('material-select-dropdown-item span').click()
        console.log(getSelection().anchorNode)
        await waitForEntity('.visual-message', 'Canned_response_confirmation', 'sel')
        resolve()
      })
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

    function showSuccess(msg) {
      return new Promise(async (resolve) => {
        $('.alert').on("animationend", (e) => {
          $('.alert').removeClass(["default", "hide"]);
          $('.alert > span:first-child').removeClass(["fa-magic"]);
          $('.alert > span:first-child').addClass("fa-check-circle");
          $('.alert').addClass(["show", "success"]);
          $(".msg").text(msg)
          $('.close-btn').show()
          $('.alert').off()
          resolve()
        })
      })
    }
    function showError(msg) {
      return new Promise(async (resolve) => {
        $('.alert').on("animationend", (e) => {
          $('.alert').removeClass(["default", "hide"]);
          $('.alert > span:first-child').removeClass(["fa-magic"]);
          $('.alert > span:first-child').addClass("fa-exclamation-circle");
          $('.alert').addClass(["show", "error"]);
          $(".msg").text(msg)
          $('.close-btn').show()
          $('.alert').off()
          resolve()
        })
      })
    }
    function removeError() {
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
    function showDefault(msg) {
      return new Promise(async (resolve) => {
        $('.alert').on("animationend", (e) => {
          $('.alert').removeClass(["hide", "error", "success"]);
          $('.alert > span:first-child').removeClass(["fa-exclamation-circle", "fa-check-circle"]);
          $('.alert > span:first-child').addClass("fa-magic");
          $('.alert').addClass(["show", "default"]);
          $(".msg").text(msg)
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
        await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbznkfAXGOVgDS385t_czkBUD9rhLV3o4Xz87vsJmn3YrjajDE5m_BjTaUuABxTmpUJk/exec?portal=qaData");
        await loadCSS('https://code.jquery.com/ui/1.13.2/themes/dark-hive/jquery-ui.css')
      }
      catch (error) {
        console.error('Erro ao carregar CDN');
      }
    }

    /*Authenticated user*/
    function loadModal() {
      return new Promise(async (resolve) => {
        try {
          await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/assets/html/modal/modal.html')
            .then(response => response.text()).then(temp => { $('.modal-container').html(temp) })
          console.log('MODAL 1 INSERTED')
          await validateKey()
          await insertModal2()
          resolve()
        }
        catch (err) { resolve() }
      })
    }

    /*
    async function attachEmail() {
      try {
        await validateKey()
        await new Promise(resolve => setTimeout(resolve, 400));
        console.log(__Bifrost)
        await bulkBifrost()
        await newEmail()
        await getActiveCard()
        await updateAdresses()
        await insertTemplate()
        await autoFill()
        console.log('Autofilled temp');
      }
      catch (error) {
        console.log(error.message)
      }
    };
    */

    async function attachEmail() {
      return new Promise(async (resolve, reject) => {
        try {
          await validateKey()
          await bulkBifrost()
          await newEmail()
          await getActiveCard()
          await updateAdresses()
          await insertTemplate()
          await autoFill()
          resolve()
        }
        catch (error) { reject() }
      })
    };


    (async function main() {
      try {
        await init();
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

        $(window).on("change", handleSelect);
        $(window).on("mouseover", dragModal);
        $(window).on("click", (e) => {
          $(e.target).is('#showTime') ? console.log('ShowTime Clicked')
            : $(e.target).is('#checkButton') ? validarInput()
              : e.target.closest('#closeModal') ? closeModal()
                : e.target.closest('#circle') ? openModal() : null
        });

        //SAVE CALENDAR ID ON COOKIE STORAGE
        $(window).on("input", (e) => {
          if ($(e.target).is('.input-modal > input')) {
            let date = new Date()
            date.setDate(date.getDate() + 400)
            document.cookie = `calendarKey=${$(e.target).val().trim()}; expires=${date.toUTCString()}`
          }
        })

        var modalLoaded = setInterval(() => {
          if ($('#resch_time').length) {
            //MODAL 2 CONFIG
            clearInterval(modalLoaded);
            timePickerConfig()
            $(function () { $("#resch_date").datepicker(dateConfig) })

            $('#showTime').on("click", async () => {
              let selectEmail = document.querySelector('#templateEmail')
              let reschInputs = ['#resch_date', '#resch_time', '#resch_period']

              $('#showTime').html('Carregando<i class="fa fa-cog fa-spin"></i>')
              $('#temp_type, #templateEmail, #resch_date, #resch_time, #resch_period, #showTime').prop('disabled', true)
              $('.alert').removeClass("show")
              $('.alert').addClass("hide")
              showDefault('Trabalhando...')

              try {
                await attachEmail()
                $('.alert').removeClass("show")
                $('.alert').addClass("hide")
                await showSuccess('Execuçao Exitosa!')
                await removeError()
                await showDefault('Aguardando instruçoes')
                $('#temp_type, #templateEmail, #resch_date, #resch_time, #resch_period, #showTime').prop('disabled', false)
                $('#showTime').html('Inserir<i class="fa fa-cog"></i>')
              }
              catch (error) {
                if (selectEmail.value.match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/)
                  && reschInputs.every(input => $(input).val() === '' || $(input).val() === 'default')) {
                  await showError('Preencha todos os campos!')
                  await removeError()
                  await showDefault('Aguardando instruçoes')


                }
              }
            })
          }
        }, 100)
      }
      catch (error) { }
    })();

    async function displayError(msg) {
      await showError(msg)
      await removeError()
      await showDefault('Aguardando instruçoes')
      $('#showTime').prop('disabled', false)
      $('#showTime').html('Inserir<i class="fa fa-cog"></i>')
    }
