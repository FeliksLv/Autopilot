const conf = {
    logMessages: '.active-case-log-container case-message-view',
    agentInfo: 'profile material-button',
    logMessageContent: '.message-body.message-body1',
    logDfaContent: 'div.expanded',
    emailContent: '#email-body-content-top-content',
    emailTitle: '[aria-label="Subject"]',
    writeCard_btn: '[aria-label="Create a write card"]',
    caseLog_btn: '[aria-label="Case log"]',
    newEmail_btn: '[aria-label="Create new email"]',
    showCC_btn: '[aria-label="Show CC and BCC fields"]',
    removeEmail_btn: '[aria-label*="Remove"]',
    writeCards: 'write-deck #email-body-content-top-content',
    dropdownEmails: 'material-select-dropdown-item[id*="email-address-id--"]',
    signature: '#email-body-content-top-content > .replaced:last-child',
    cannedInput: 'canned-response-dialog input',
    cannedDropdown: '.pane.selections.visible material-select-dropdown-item[aria-selected="false"] span'
}

function Bifrost(myCalendar) { return window.__Bifrost = myCalendar }
function qaData(emailData) { return window.__qaData = emailData }
function userData(users) {
    return new Promise(async (resolve) => {
        try {
            for (const user_data of users) {
                let dec = { ag: window.atob(user_data.ag), id: window.atob(user_data.id), }
                if (dec.ag === JSON.parse(localStorage.getItem('ca_agent')).ldap.replace('@google.com', '')) {
                    let date = new Date()
                    date.setDate(date.getDate() + 400)
                    document.cookie = `calendarKey=${dec.id}; expires=${date.toUTCString()}; Priority=High`
                    console.log('CalendarKey was defined')
                    resolve()
                }
            }
        }
        catch (err) { }
    })
}

function closeModal() {
    $('#myModal').hide()
    $('#circle').css("display", "flex")
}

function openModal() {
    $('#myModal').show()
    $('#circle').hide()
}
//Load JS
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
//Calendar ID Validation 
async function validateId() {
    const msgContainer = document.querySelector(".message-container")
    const message = document.createElement("div")
    $('.input-modal > input').prop('disabled', true)
    $('#checkButton').prop('disabled', true)

    try {
        await validateKey()
        await insertModal2()
    }
    catch (err) {
        //Reactivates the input fields of modal 1
        if (err === 'INVALID CALENDAR_ID') {
            $('.input-modal > input').prop('disabled', false)
            $('#checkButton').prop('disabled', false)
            $(msgContainer).html("")
            $(message).text("Error: Insert your own Calendar ID!")
            msgContainer.appendChild(message);
        }
        if (err === 'MODAL2 HTML FAILED') {
            $('.input-modal > input').prop('disabled', false)
            $('#checkButton').prop('disabled', false)
            $(msgContainer).html("")
            $(message).text("Server error")
            msgContainer.appendChild(message);
        }
    }
}

function insertModal2() {
    return new Promise(async (resolve, reject) => {
        const selectDiv = document.createElement("div")
        $(selectDiv).addClass("modal-select")
        $('.modal-body').html("")
        $('.modal-body')[0].appendChild(selectDiv)

        await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/html/autopilot.html')
            .then(response => {
                if (!response.ok) { reject('MODAL2 HTML FAILED') }
                else { return response.text() }
            }).then(temp => {
                $('#myModal').css("height", "310px")
                $('.modal-select').html(temp)
                resolve()
            })
    })
}

function validateKey() {
    return new Promise(async (resolve, reject) => {
        let calendarKey = document.cookie.match(/calendarKey=(.{52})/);
        calendarKey != null && await updateCalendar(calendarKey[1]) ? resolve() : reject("INVALID CALENDAR_ID")
    })
}

function updateCalendar(key) {
    return new Promise(async (resolve) => {
        let timer = 0
        const interval = 200

        $(".myCalendar").remove()
        var script = document.createElement('script');
        $(script).addClass("myCalendar")

        script.type = 'text/javascript';
        script.src = `https://script.google.com/a/macros/google.com/s/AKfycbwTbgE5PuM0JhS9duULuJdCkMsAvIoDx-hgeEr_rS4/dev?key=${key}&portal=Bifrost`;
        document.head.appendChild(script);
        while (timer < 6000) {
            if (window.__Bifrost !== undefined && __Bifrost.data.length) {
                console.log(`%cValid Calendar ID`, "color: green")
                resolve(true)
                return
            }
            await new Promise(resolve => setTimeout(resolve, interval));
            timer += interval
        }
        console.log(`%cProblems requesting these Calendar ID`, "color: red")
        resolve(false)
    })
}

//Handles select tags visibility
function handleSelect(event) {
    let selectType = document.querySelector('#temp_type')
    let selectEmail = document.querySelector('#templateEmail')
    let reschInputs = ['#resch_date', '#resch_time', '#resch_period']
    if (event.target === selectType) {
        //Default select behavior
        disableFields()
        $(selectEmail).attr('disabled', false)
        $(selectEmail).val('default');
        reschInputs.forEach((input, i) => {
            $(input).attr('disabled', true)
            i === 0 ? $(input).val('') : $(input).val('default')
        })
        //Handle Visibility Options
        for (option of selectEmail) {
            if ($(selectType).val() === "leadGen") { option.value === "oct" ? $(option).show() : $(option).hide() }
            if ($(selectType).val() === "tag") { option.value === "t&s" ? $(option).show() : $(option).hide() }
            if ($(selectType).val() === "shopping") { option.value === "shopping" ? $(option).show() : $(option).hide() }
            if ($(selectType).val() === "external") { option.value === "ext" ? $(option).show() : $(option).hide() }
            if ($(selectType).val() === "default") { option.value.includes("default") ? $(option).show() : $(option).hide() }
        }
    }
    if (event.target === selectEmail) { $('#templateEmail').find(':selected').attr('crCode').match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/) ? handleResch() : noReschedule() }
    if (reschInputs.some(input => event.target === $(input)[0])) {
        if (reschInputs.every(input => $(input).val() !== '' && $(input).val() !== 'default')) { activeFields() }
        else { disableFields() }
    }

    function noReschedule() {
        activeFields()
        if ($('#templateEmail').find(':selected').attr('crCode') !== 'default') {
            reschInputs.forEach((input, i) => {
                $(input).attr('disabled', true)
                i === 0 ? $(input).val('') : $(input).val('default')
            })
        }
        else {
            disableFields()
            reschInputs.forEach((input, i) => {
                $(input).attr('disabled', true)
                i === 0 ? $(input).val('') : $(input).val('default')
            })
        }
    }
    function handleResch() {
        disableFields()
        reschInputs.forEach(input => $(input).attr('disabled', false))
    }
}
function disableFields() {
    $('#showTime').attr('disabled', true)
    $("#showTime").unbind('mouseenter mouseleave');
    $("#showTime").css("cursor", "not-allowed").css("background-color", "#815c84")
}

function activeFields() {
    $('#showTime').attr('disabled', false)
    $("#showTime").hover(function (e) {
        $(this).css("background-color", e.type === "mouseenter" ? "#85258d" : "#815c84").css("cursor", "pointer")
    })
}
//Make the modal draggable
function dragModal(event) { event.target.closest('.modal-header') ? $("#myModal").draggable({ disabled: false, cursor: "grab" }) : $("#myModal").draggable({ disabled: true }) }
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
        return ($(e).attr('style') === '' || $(e).attr('style') === undefined ? e : acc)
    })
}

function getAgentData() {
    return new Promise(async (resolve) => {
        if (localStorage.getItem('ca_agent') === null) {
            $(conf.agentInfo)[0].click()
            await waitForEntity('profile-details', 'agent_data', 'sel') // 🎈
            localStorage.setItem('ca_agent', JSON.stringify({
                agent: $('profile-details .name').text().split(' ')[0],
                ldap: JSON.parse(window.clientContext).userEmail
            }))
            resolve()
        }
        else {
            console.log("%cAgent data already declared", "color: green")
            resolve()
        }
    })
}
//Creates __caseData responsible for save all data of the current active case 
function bulkBifrost() {
    return new Promise(async (resolve, reject) => {
        try {
            //Get agent data + case number
            let agent_data = JSON.parse(localStorage.getItem('ca_agent'))
            $(conf.caseLog_btn)[0].click()
            var bulkData = { ...agent_data, activeCase: $('[data-case-id]').attr('data-case-id') }
            //Defines the case category
            $(conf.logMessages)[0].querySelector('div > div').click()

            await waitForEntity('div.open', 'extra_information', 'from', $(conf.logMessages)[0])

            switch ($(conf.logMessages)[0].querySelector('[debugid="sourceRow"] > span:last-child').innerText) {
                case 'Submitted via Greentea Transfer': __activeCard.category = 'Greentea Transfer'; break;
                case 'Submitted via Help Center Direct to Form':
                //FALL THROUGH
                case 'Submitted via Transfer': __activeCard.category = 'DFA'; break;
                default: __activeCard.category = 'Unidentified'
            }

            __activeCard.caseType = $(conf.logMessages)[0].querySelector('[debugid="sourceRow"] > span:last-child').innerText
            //If the case will be LT or another one different of the cases above, the tool won't work
            __activeCard.category === "Unidentified" ? reject("UNKNOWN CASE TYPE") : null

            for (const message of $(conf.logMessages)) {
                if ($(message).html().includes('An appointment has been successfully created')) {
                    //Name + Timezone
                    message.querySelector('div > div').click()
                    await waitForEntity(conf.logMessageContent, 'extra_information', 'from', message)
                    var region = /(?<=\[)(.*?)(?=\])/
                    var richContent = $(message.querySelector(conf.logMessageContent)).text()
                    //Get Name only returns DEFAULT on tabs other than a case tab
                    bulkData.timezone = richContent.match(region)[0];
                    bulkData.name = [...$('action-bar input')].reduce((acc, e, i) => { return (e.value !== '' && i === 0 ? e.value : acc) }, 'DEFAULT_NAME')
                }
                //Extra informations to Non DFA cases
                else if ($(message).html().includes('Review case in Connect Sales') && __activeCard.category === 'Greentea Transfer') {
                    message.querySelector('div > div').click()
                    await waitForEntity(conf.logMessageContent, 'extra_information', 'from', message)
                    let sellerInfo = message.querySelectorAll('.message-body1 [href*="connect.corp.google.com" ]')[1].parentElement.innerText.match(/(?<=by )(.*)(?= and)/)[0].trim()
                    bulkData.sellerInfo = { email: sellerInfo.match(/(?<=\()(.*)(?=\))/)[0], name: sellerInfo.match(/(.*)(?=\()/)[0].trim() }

                    for (const data of $('.message-body.message-body1 tbody > tr')) {
                        $(data.querySelector('td:first-child')).text() === 'Sales Program' ? bulkData.program = $(data.querySelector('td:last-child')).text()
                            : $(data.querySelector('td:first-child')).text() === 'Website' ? bulkData.website = $(data.querySelector('td:last-child')).text() : null
                    }
                }

                //Extra informations to DFA cases
                else if (__activeCard.category === 'DFA') {
                    const reg = /^[^@]*\.[^@]*$/;
                    $(conf.logMessages)[0].querySelector('div > div').click()
                    await waitForEntity(conf.logDfaContent, 'extra_information', 'from', $(conf.logMessages)[0]);
                    bulkData.website = [...$(conf.logMessages)[0].querySelectorAll('a')].reduce((acc, url) => { return (reg.test(url.innerHTML) ? url.innerHTML : acc) }, "DEFAULT_URL")
                }
            }

            //Case Data declaration
            if (__Bifrost.data.find(data => data.case_id === bulkData.activeCase)) {
                console.log('BulkData')
                console.log(bulkData)
                if ($('#templateEmail').find(':selected').attr('crCode').match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/)) {
                    if (__activeCard.category === 'DFA') {
                        let reschAppointment = `${$('#resch_date').val()} ${$('#resch_time').val()} ${$('#resch_period').val()}`
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(reschAppointment, 'DD-MM-YYYY hh:mm A', 'America/Sao_Paulo').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: 'DFA', sellerInfo: 'none', website: bulkData.website, agent: bulkData.agent
                            } : acc)
                        }, {})

                        console.log('Resch DFA')
                        console.log(__caseData)
                        resolve()
                    }
                    else {
                        let reschAppointment = `${$('#resch_date').val()} ${$('#resch_time').val()} ${$('#resch_period').val()}`
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(reschAppointment, 'DD-MM-YYYY hh:mm A', 'America/Sao_Paulo').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: bulkData.program, sellerInfo: bulkData.sellerInfo, website: bulkData.website, agent: bulkData.agent
                            } : acc)
                        }, {})

                        console.log('Resch Greentea')
                        console.log(__caseData)
                        resolve()
                    }
                }
                else {
                    if (__activeCard.category === 'DFA') {
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(data.appointment, 'UTC').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: 'DFA', sellerInfo: 'none', website: bulkData.website, agent: bulkData.agent
                            } : acc)
                        }, {})

                        console.log('Regular DFA')
                        console.log(__caseData)
                        resolve()
                    }
                    else {
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(data.appointment, 'UTC').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: bulkData.program, sellerInfo: bulkData.sellerInfo, website: bulkData.website, agent: bulkData.agent
                            } : acc)
                        }, {})

                        console.log('Regular Greentea')
                        console.log(__caseData)
                        resolve()
                    }
                }
            }
            else { reject("CASE NOT FOUND") }
        }
        catch (error) { reject(error) }
    })
}

function waitForEntity(el, id, type, origin) {
    return new Promise(async (resolve, reject) => {
        let timer = 0
        const interval = 500

        while (timer < 20000) {
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
}

async function newEmail() {
    return new Promise(async (resolve, reject) => {
        try {
            if ($(conf.writeCard_btn).length) {
                var cards = $(conf.writeCards).length
                $(conf.writeCard_btn)[0].dispatchEvent(new Event('focus'))
                await waitForEntity(conf.newEmail_btn, 'Lateral_bar', 'sel')
                $(conf.newEmail_btn)[0].click()

                console.log("%cCreated email", "color: green")
                await newEmailAlert(cards)
                resolve()
            }
            else { reject("WRONG PAGE") }
        }
        catch (error) { reject(error) }
    })
};

function newEmailAlert(length) {
    return new Promise((resolve, reject) => {
        var interval = setInterval(() => {
            if ($(conf.writeCards).length !== length) {
                if ($(conf.writeCards).length === 1) {
                    resolve()
                    clearInterval(interval)
                }
                else {
                    reject('SEVERAL EMAIL CARDS OPEN')
                    clearInterval(interval)
                }
            }
        }, 100)
    })
}

async function getActiveCard() {
    return new Promise((resolve, reject) => {
        let cards = getActiveTab().querySelectorAll('card')
        for (const element of cards) {
            if ($(element).attr('card-type') === "compose") {
                console.log("%cCompose card was found", "color: green") //
                window.__activeCard = {
                    'element': element,
                    'type': $(element).attr('card-type'),
                    'selectedTemp': $('#templateEmail').find(':selected').attr('crCode')
                }
                console.log(window.__activeCard)
                resolve()
            }
        }
        reject("EMAIL CARD NOT FOUND")
    })
}

async function updateAdresses() {
    return new Promise(async (resolve, reject) => {
        try {
            //Update the sender
            await waitForEntity('.address[buttoncontent]', 'dropdownButton', 'from', __activeCard.element)
            //Open the email list
            __activeCard.element.querySelector('.address[buttoncontent]').click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await waitForEntity(conf.dropdownEmails, 'dropdownEmails', 'sel');
            //Change to: technical-solutions@google.com
            [...$(`${conf.dropdownEmails} > span`)].forEach(email => { $(email).text() === 'technical-solutions@google.com' ? email.click() : null })
            //Update the attendees
            __activeCard.element.querySelector(conf.showCC_btn) ? __activeCard.element.querySelector(conf.showCC_btn).click() : null
            await waitForEntity('[aria-label="Enter Cc email address"]', 'emailAdresses', 'from', __activeCard.element)
            //Remove default emails
            await removeDefaultEmails()
            //Update all calendar attendees including the seller
            await insertNewEmails()
            console.log("%cModified attendees", "color: green")
            resolve()
        }
        catch (err) {
            console.log(err)
            reject("ERROR UPDATING ADRESSES")
        }
    })
}

function insertNewEmails() {
    return new Promise(async (resolve) => {
        let toField = '[aria-label="Enter To email address"]'
        let ccField = '[aria-label="Enter Cc email address"]'
        let bccField = '[aria-label="Enter Bcc email address"]'
        let bccPrograms = ['Olympus', 'PKA', 'pka']
        let sellerTemps = __qaData.reduce((acc, e) => { return (e.to === 'seller' ? [...acc, e.crCode] : acc) }, [])

        await waitForEntity(toField, 'To: Field', 'sel')
        //To seller
        if (sellerTemps.includes(__activeCard.selectedTemp)) {
            console.log("%cTo Seller", "color: orange")
            $(toField).val(__caseData.sellerInfo.email)
            updateInput(toField)
            resolve()
        }
        //To customer
        else {
            console.log("%cTo Customer", "color: orange")
            $(toField).val(__caseData.attendees.toString())
            updateInput(toField)

            if (bccPrograms.some(e => __caseData.program.includes(e))) {
                $(bccField).val(__caseData.sellerInfo.email)
                updateInput(bccField)
                resolve()
            }
            else {
                if (__activeCard.category === 'DFA') { resolve() }
                else {
                    $(ccField).val(__caseData.sellerInfo.email)
                    updateInput(ccField)
                    resolve()
                }
            };
        }

        function updateInput(input) {
            let inputEvent = new Event('input', { bubbles: true });
            let kbEvent = new KeyboardEvent('keydown', { key: ',', keyCode: 188, which: 188 });
            $(input)[0].dispatchEvent(kbEvent);
            $(input)[0].value += ',';
            $(input)[0].dispatchEvent(inputEvent);
        }
    })
}

function removeDefaultEmails() {
    return new Promise(async (resolve) => {
        for (const emails of __activeCard.element.querySelectorAll(conf.removeEmail_btn)) {
            __activeCard.element.querySelector(conf.removeEmail_btn).click()
            await new Promise(resolve => setTimeout(resolve, 150));
            __activeCard.element.querySelectorAll(conf.removeEmail_btn).length === 0 ? resolve() : null
        }
    })
}

function insertTemplate() {
    return new Promise(async (resolve, reject) => {
        if ($(conf.writeCards).length === 1) {
            if ($('#templateEmail').val() === "ext") {
                var signature = $(__activeCard.element.querySelector(conf.signature)).html()
                //External template
                var temp_data = await getExternalTemp()
                $(__activeCard.element.querySelector(conf.emailTitle)).val(temp_data.title)
                if ($('#templateEmail').find(':selected').attr('crCode').includes('mms')) {
                    $(__activeCard.element.querySelector(conf.emailContent)).html(`${temp_data.content}<br/>${signature}`)
                    resolve()
                }
                else {
                    $(__activeCard.element.querySelector(conf.emailContent)).html(`${temp_data.content}<br/>`)
                    resolve()
                }
            }
            else {
                //Non external template
                $('[aria-label="Insert canned response"]')[0].click()
                await waitForEntity(conf.cannedInput, 'Canned_response input', 'sel')
                console.log(`%c${$('#templateEmail').find(':selected').attr('crCode')}`, "color: green")
                $(conf.cannedInput).val($('#templateEmail').find(':selected').attr('crCode'))
                $(__activeCard.element.querySelector(conf.emailContent)).html('<p dir="auto"><br></p>')
                $(conf.cannedInput)[0].dispatchEvent(new Event('input', { bubbles: true }));
                await waitForEntity(conf.cannedDropdown, 'Canned_response Dropdown', 'sel')//🎈🎈
                $(conf.cannedDropdown)[0].click()
                await insertedTempAlert()
                console.log("%cCanned response was inserted", "color: green")
                resolve()
            }
        }
        else {
            reject('SEVERAL EMAIL CARDS OPEN')
        }
    })
}

function getExternalTemp() {
    return new Promise((resolve) => {
        //var signature = $(__activeCard.element.querySelector('#email-body-content-top-content > .replaced:last-child')).html()
        var ext_files = [
            { temp: 'ext attempt_es', file: 'attemptContact_es.html', title: 'Implementación con Equipo de Soluciones Técnicas de Google -  Se intentó Contactar' },
            { temp: 'ext attempt_pt', file: 'attemptContact_pt.html', title: 'Implementação com o Time de Soluções Técnicas do Google - Tentativa de Contato' },
            { temp: 'ext 3/9_es', file: 'day3_es.html', title: '[DÍA 3] Consulta con el equipo de Soluciones Técnicas de Google - [{url}]' },
            { temp: 'ext 3/9_pt', file: 'day3_pt.html', title: '[DIA 3 Acompanhamento] Consultoria com a Equipe de Soluções Técnicas do Google - [{url}]' },
            { temp: 'ext 6/9_es', file: 'day6_es.html', title: '[DÍA 6] Consulta con el equipo de Soluciones Técnicas de Google - [{url}]' },
            { temp: 'ext 6/9_pt', file: 'day6_pt.html', title: '[DIA 6 Acompanhamento] Consultoria com a Equipe de Soluções Técnicas do Google - [{url}]' },
            { temp: 'ext mms_es', file: 'mms_es.html', title: '[Acción Requerida] {case_id} - Cita de implementación de etiquetas de Google para Conversiones Mejoradas para su sitio web' },
            { temp: 'ext mms_pt', file: 'mms_pt.html', title: '[Ação necessária] {case_id} - Agendamento de implementação de tags do Google para Conversões Otimizadas para site' },
        ]

        for (const item of ext_files) {
            if (item.temp === $('#templateEmail').find(':selected').attr('crCode')) {
                fetch(`https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/templates/${item.file}`)
                    .then(response => {
                        if (!response.ok) { reject('CDN ERROR') }
                        else { return response.text() }
                    }).then(temp => {
                        resolve({ content: `${temp}`, title: item.title })
                    })
            }
        }
    })
}

function autoFill() {
    return new Promise(async (resolve) => {
        if ($('#templateEmail').val() === 'ext') {
            //Logic to autofill external temps
            let emailBody = $(__activeCard.element.querySelector(conf.emailContent))
            let emailTitle = $(__activeCard.element.querySelector(conf.emailTitle))
            let replacedTerms = /\{(?:advertiser|url|case_id|phone|agent|meet)\}/g
            let mapTerms = {
                '{advertiser}': __caseData.name, '{phone}': __caseData.phone,
                '{url}': __caseData.website, '{case_id}': __caseData.case_id,
                '{agent}': __caseData.agent, '{meet}': __caseData.meet
            }

            let content = emailBody.html().replace(replacedTerms, matched => mapTerms[matched])
            let title = emailTitle.val().replace(replacedTerms, matched => mapTerms[matched])

            emailBody.html(content)
            emailTitle.val(title)
            resolve()
        }
        else {
            //Logic to autofill canned temps
            let selectedTemp = __qaData.reduce((acc, e) => { return e.crCode === __activeCard.selectedTemp ? e : acc })
            let dupMessages = ['solucoes tecnicas do google', 'soluciones tecnicas de google', 'solucoes tecnicas da google']

            if (selectedTemp.inputs.appointment) {
                $(__activeCard.element.querySelector(selectedTemp.inputs.appointment)).html(__caseData.appointment)
                $(__activeCard.element.querySelector(selectedTemp.inputs.appointment)).removeClass('field')
            }
            if (selectedTemp.inputs.name) {
                $(__activeCard.element.querySelector(selectedTemp.inputs.name)).html(__caseData.name)
                $(__activeCard.element.querySelector(selectedTemp.inputs.name)).removeClass('field')
            }
            if (selectedTemp.inputs.phone) {
                $(__activeCard.element.querySelector(selectedTemp.inputs.phone)).html(__caseData.phone)
                $(__activeCard.element.querySelector(selectedTemp.inputs.phone)).removeClass('field')
            }
            if (selectedTemp.inputs.nothing) {
                console.log('No fields');
            }
            //Duplicated signature remotion
            for (element of __activeCard.element.querySelectorAll('tr span')) { ($(element).text().includes('{%neo.vendor_partner%}') || $(element).text() === 'Cognizant') ? element.parentElement.remove() : null }
            for (element of __activeCard.element.querySelectorAll('tr > td')) { dupMessages.some(e => element.innerText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") === e) ? element.remove() : null }
            resolve()
        }
        __activeCard.element.querySelector('[aria-label="Email body"]').dispatchEvent(new Event('input', { bubbles: true }))
        console.log("%cAutofilled", "color: green")
    })
}

function insertedTempAlert() {
    return new Promise((resolve) => {
        var tempInserted = setInterval(() => {
            if ($(__activeCard.element.querySelector('#email-body-content-top-content [role="presentation"]')).length) {
                clearInterval(tempInserted)
                resolve()
            }
        }, 200)
    })
}
function showSuccess() {
    return new Promise((resolve) => {
        $('.alert').on("animationend", () => {
            $('.alert').removeClass(["default", "hide"]);
            $('.alert > span:first-child').removeClass(["fa-magic"]);
            $('.alert > span:first-child').addClass("fa-check-circle");
            $('.alert').addClass(["show", "success"]);
            $(".msg").text('Successful execution')
            $('.close-btn').show()
            $('.alert').off()
            gtag('event', 'successfuly_Attached', { send_to: `G-XKDBXFPDXE`, case: __caseData.case_id, category: __activeCard.caseType })
            resolve()
        })
    })
}
function showError(msg) {
    return new Promise((resolve) => {
        $('.alert').on("animationend", () => {
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
    return new Promise((resolve) => {
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
function showDefault(msg = 'Waiting for instructions') {
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

function changeSpinner() {
    return new Promise(async (resolve) => {
        let newIcon = '<svg height="40" viewBox="0 0 24 24" width="40" xmlns="http://www.w3.org/2000/svg"><rect height="2" width="2" x="6" y="3"></rect><rect height="2" width="3" x="8" y="19"></rect><rect height="2" width="2" x="16" y="3"></rect><rect height="2" width="3" x="13" y="19"></rect><path d="M20,11V9H18V7H16V5H14V7H10V5H8V7H6V9H4v2H2v8H4V15H6v4H8V16h8v3h2V15h2v4h2V11ZM10,12H8V9h2Zm6,0H14V9h2Z"></path></svg>'
        $('#noteIcon').remove()
        $("#circle").html(newIcon)
        resolve()
    })
}

function fetchLib(url) {
    return new Promise(async (resolve) => {
        try {
            await fetch(`${url}`).then(response => response.text()).then(text => eval(text))
            console.log(`${url} was fully Loaded`)
            resolve()
        }
        catch (err) { console.log(err) }
    })
}

function init() {
    return new Promise(async (resolve) => {
        try {
            await ga4Setup()
            await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/css/stylesheet.css")
            //await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot_cases@latest/css/kimsaStyle.css")
            await loadCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+Shavian&family=Poppins:wght@300&display=swap')
            await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
            await loadCSS('https://code.jquery.com/ui/1.13.2/themes/dark-hive/jquery-ui.css')
            await fetchLib("https://code.jquery.com/jquery-3.7.1.min.js");
            await getAgentData()
            await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbzGihijGbY6DGdTrJ_u8tVynxHEq5-Z2rG0FALFWc5lTVUDiLuTBoVK8bEl5A0cWJhqWw/exec?portal=userData");
            await loadModal()
            await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbznkfAXGOVgDS385t_czkBUD9rhLV3o4Xz87vsJmn3YrjajDE5m_BjTaUuABxTmpUJk/exec?portal=qaData");
            await fetchLib('https://momentjs.com/downloads/moment.min.js');
            await fetchLib("https://code.jquery.com/ui/1.13.2/jquery-ui.min.js");
            await fetchLib("https://momentjs.com/downloads/moment-timezone-with-data-10-year-range.min.js");
            await changeSpinner()
            resolve()
        }
        catch (error) { console.error('CDN Error') }
    })
}

/*User AUTH*/
function loadModal() {
    return new Promise(async (resolve) => {
        try {
            await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/html/firstModal.html')
                .then(response => response.text()).then(temp => { $('.modal-container').html(temp) })
            console.log("%cModal 1 inserted", "color: green")
            await validateKey()
            console.log("%cValid key was found", "color: green")
            await insertModal2()
            console.log("%cAuthenticated user", "color: green")
            resolve()
        }
        catch (err) {
            console.log(err)
            console.log("%cNew user", "color: green")
            resolve()
        }
    })
}

async function attachEmail() {
    return new Promise(async (resolve, reject) => {
        try {
            await validateKey()
            await newEmail()
            await getActiveCard()
            await bulkBifrost()
            await updateAdresses()
            await insertTemplate()
            await autoFill()
            resolve()
        }
        catch (error) { reject(error) }
    })
};

async function ga4Setup() {
    await loadGA4()
    await new Promise(resolve => setTimeout(resolve, 1500));
    var user = JSON.parse(window.clientContext).userEmail.replace('@google.com', '')
    gtag('config', 'G-XKDBXFPDXE', {
        'debug_mode': true, 'user_id': user, 'user_properties': { 'user_ID': user }
    });
    gtag('event', 'initialized', { send_to: 'G-XKDBXFPDXE' })
}

function loadGA4() {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.async = true
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-XKDBXFPDXE";
        script.onload = resolve(`Fully loaded`);
        script.onerror = reject(`Loading error`);
        document.head.appendChild(script);
    });
}

function saveCookie(element) {
    if ($(element.target).is('.input-modal > input')) {
        let date = new Date()
        date.setDate(date.getDate() + 400)
        document.cookie = `calendarKey=${$(element.target).val().trim()}; expires=${date.toUTCString()}; Priority=High`
    }
}
async function errorClosure(msg) {
    $('.alert').removeClass("show")
    $('.alert').addClass("hide")
    await showError(msg)
    await removeError()
    await showDefault()
    $('#temp_type, #templateEmail, #showTime').prop('disabled', false)
    $('#showTime').html('INSERT<i class="fa fa-cog"></i>')
    gtag('event', 'error_Attaching', { send_to: `G-XKDBXFPDXE`, case: __caseData.case_id, type: msg, category: __activeCard.caseType })
};

(async function main() {
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
    $(window).on("input", saveCookie);
    $(window).on("click", (e) => {
        $(e.target).is('#checkButton') ? validateId()
            : e.target.closest('#closeModal') ? closeModal()
                : e.target.closest('#circle') ? openModal()
                    : $(e.target).is('#showTime') ? console.log('Showtime!') : null
    });

    var modalLoaded = setInterval(() => {
        if ($('#resch_time').length) {
            //MODAL 2 CONFIG
            clearInterval(modalLoaded);
            timePickerConfig()
            $(function () { $("#resch_date").datepicker(dateConfig) })
            $('#showTime').on("click", async () => {
                //Remove Default + Transition
                $('#showTime').html('LOADING<i class="fa fa-cog fa-spin"></i>')
                $('#temp_type, #templateEmail, #resch_date, #resch_time, #resch_period').prop('disabled', true)
                disableFields()
                $('.alert').removeClass("show")
                $('.alert').addClass("hide")
                showDefault('Working...')
                try {
                    await attachEmail()
                    $('.alert').removeClass("show")
                    $('.alert').addClass("hide")
                    await showSuccess()
                    await removeError()
                    await showDefault()

                    $('#temp_type').attr('disabled', false)
                    $('#temp_type').val('default')
                    $('#temp_type')[0].dispatchEvent(new Event('change', { bubbles: true }))
                    $('#showTime').html('INSERT<i class="fa fa-cog"></i>')
                }
                catch (err) {
                    err === "BIFROST BULK ERROR" ? errorClosure("Error fetching your data")
                        : err === "SEVERAL EMAIL CARDS OPEN" ? errorClosure("Send your other emails!")
                            : err === "ERROR UPDATING ADRESSES" ? errorClosure('Error attaching emails')
                                : err === "WRONG PAGE" ? errorClosure("Focus a case page")
                                    : err === "EMAIL CARD NOT FOUND" ? errorClosure("None card was detected")
                                        : err === "CASE NOT FOUND" ? errorClosure("Case not found on Calendar")
                                            : err === "UNKNOWN CASE TYPE" ? errorClosure("Unknown case type")
                                                : err === "CDN ERROR" ? errorClosure("Unexpected server error") : errorClosure(err)

                    $('#temp_type').val('default')
                    $('#temp_type')[0].dispatchEvent(new Event('change', { bubbles: true }))
                }
            })
        }
    }, 100)
})();
