const options = { childList: true, subtree: true, attributes: true, characterData: false };
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
    dropdownEmailsContainer: '.pane.material-dropdown-select-popup [aria-activedescendant*="email-address-id"]',
    signature: '#email-body-content-top-content > .replaced:last-child',
    cannedInput: 'canned-response-dialog input',
    cannedDropdown: '.pane.selections.visible material-select-dropdown-item[aria-selected="false"] span',
    createEmail: '[aria-label="Email body"]',
    paneCannedInput: '.pane.modal.visible dynamic-component'
};

//Appscript Dependencies
function Bifrost(myCalendar) { return window.__Bifrost = myCalendar };
function qaData(emailData) { return window.__qaData = emailData };
function userData(users) { return window.__userData = users };
function closeModal() {
    $('#myModal').hide();
    $('#circle').css("display", "flex");
};
function openModal() {
    $('#myModal').show();
    $('#circle').hide();
};
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
};
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
};
//Calendar ID Validation 
async function validateId() {
    const msgContainer = document.querySelector(".message-container");
    const message = document.createElement("div");
    $('.input-modal > input').prop('disabled', true);
    $('#checkButton').prop('disabled', true);
    try {
        await validateKey();
        await insertModal2();
    }
    catch (err) {
        //Reactivates the input fields of modal 1
        if (err === 'INVALID CALENDAR_ID') {
            $('.input-modal > input').prop('disabled', false);
            $('#checkButton').prop('disabled', false);
            $(msgContainer).html("");
            $(message).text("Error: Insert your own Calendar ID!");
            msgContainer.appendChild(message);
        };
        if (err === 'MODAL2 HTML FAILED') {
            $('.input-modal > input').prop('disabled', false);
            $('#checkButton').prop('disabled', false);
            $(msgContainer).html("");
            $(message).text("Server error");
            msgContainer.appendChild(message);
        };
    };
};
function insertModal2() {
    return new Promise(async (resolve, reject) => {
        const selectDiv = document.createElement("div");
        $(selectDiv).addClass("modal-select");
        $('.modal-body').html("");
        $('.modal-body')[0].appendChild(selectDiv);

        await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/html/autopilot.html')
            .then(response => {
                if (!response.ok) { reject('MODAL2 HTML FAILED') }
                else { return response.text() };
            }).then(temp => {
                $('#myModal').css("height", "330px");
                $('.modal-select').html(temp);
                resolve();
            });
    });
};
function validateKey() {
    return new Promise(async (resolve, reject) => {
        let calendarKey = document.cookie.match(/calendarKey=(.{52})/);
        calendarKey != null && await updateCalendar(calendarKey[1]) ? resolve() : reject("INVALID CALENDAR_ID");
    })
};
function updateCalendar(key) {
    return new Promise(async (resolve) => {
        let timer = 0;
        const interval = 200;

        $(".myCalendar").remove();
        var script = document.createElement('script');
        $(script).addClass("myCalendar");

        script.type = 'text/javascript';
        script.src = `https://script.google.com/a/macros/google.com/s/AKfycbwTbgE5PuM0JhS9duULuJdCkMsAvIoDx-hgeEr_rS4/dev?key=${key}&portal=Bifrost`;
        document.head.appendChild(script);
        while (timer < 6000) {
            if (window.__Bifrost !== undefined && __Bifrost.data.length) {
                console.log(`%cValid Calendar ID`, "color: green");
                resolve(true);
                return;
            };
            await new Promise(resolve => setTimeout(resolve, interval));
            timer += interval;
        };
        console.log(`%cProblems requesting these Calendar ID`, "color: red");
        resolve(false);
    });
};
//Handles select tags visibility
function handleSelect(event) {
    let selectType = document.querySelector('#temp_type');
    let selectEmail = document.querySelector('#templateEmail');
    let reschInputs = ['#resch_date', '#resch_time', '#resch_period'];
    if (event.target === selectType) {
        //Default select behavior
        disableFields();
        $(selectEmail).attr('disabled', false);
        $(selectEmail).val('default');
        reschInputs.forEach((input, i) => {
            $(input).attr('disabled', true);
            i === 0 ? $(input).val('') : $(input).val('default');
        });
        //Handle Visibility Options
        for (option of selectEmail) {
            if ($(selectType).val() === "leadGen") { option.value === "oct" ? $(option).show() : $(option).hide() };
            if ($(selectType).val() === "tag") { option.value === "t&s" ? $(option).show() : $(option).hide() };
            if ($(selectType).val() === "shopping") { option.value === "shopping" ? $(option).show() : $(option).hide() };
            if ($(selectType).val() === "external") { option.value === "ext" ? $(option).show() : $(option).hide() };
            if ($(selectType).val() === "default") { option.value.includes("default") ? $(option).show() : $(option).hide() };
        };
    };
    if (event.target === selectEmail) { $('#templateEmail').find(':selected').attr('crCode').match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/) ? handleResch() : noReschedule() };
    if (reschInputs.some(input => event.target === $(input)[0])) {
        if (reschInputs.every(input => $(input).val() !== '' && $(input).val() !== 'default')) { activeFields() }
        else { disableFields() };
    };

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
};
function disableFields() {
    $('#showTime').attr('disabled', true);
    $("#showTime").unbind('mouseenter mouseleave');
    $("#showTime").css("cursor", "not-allowed").css("background-color", "#815c84");
};
function activeFields() {
    $('#showTime').attr('disabled', false);
    $("#showTime").hover(function (e) {
        $(this).css("background-color", e.type === "mouseenter" ? "#85258d" : "#815c84").css("cursor", "pointer");
    });
};
//Make the modal draggable
function dragModal(event) { event.target.closest('.modal-header') ? $("#myModal").draggable({ disabled: false, cursor: "grab" }) : $("#myModal").draggable({ disabled: true }) };
//Timepicker config
function timePickerConfig() {
    for (var hh = 1; hh <= 12; hh++) {
        for (var mm = 0; mm < 60; mm += 15) {
            var formattedHh = hh.toString().padStart(2, '0');
            var formattedMm = mm.toString().padStart(2, '0');
            var fullTime = `${formattedHh}:${formattedMm}`;
            var option = document.createElement('option');
            option.value = fullTime;
            option.text = fullTime;
            document.querySelector('#resch_time').appendChild(option);
        };
    };
};
//Get active cases tab
function getActiveTab() {
    return [...$('write-deck > div > div')].reduce((acc, e) => {
        return ($(e).attr('style') === '' || $(e).attr('style') === undefined ? e : acc);
    });
};
function getAgentData() {
    return new Promise(async (resolve) => {
        if (localStorage.getItem('ca_agent') === null) {
            await waitForMutation('profile-details', 'agent_data', 'sel', ...[,], 'click', $(conf.agentInfo)[0], ...[,]); // true 🎈🎈
            localStorage.setItem('ca_agent', JSON.stringify({
                agent: $('profile-details .name').text().split(' ')[0],
                ldap: JSON.parse(window.clientContext).userEmail
            }));
            resolve();
        }
        else {
            console.log("%cAgent data already declared", "color: green");
            resolve();
        };
    });
};
function bulkBifrost() {
    return new Promise(async (resolve, reject) => {
        try {
            //Get agent data + case number
            let agent_data = JSON.parse(localStorage.getItem('ca_agent'));
            $(conf.caseLog_btn)[0].click();
            var bulkData = { ...agent_data, activeCase: $('[data-case-id]').attr('data-case-id') };

            await waitForMutation('div.open', 'extra_information', 'from', $(conf.logMessages)[0], 'click', 'div > div > div', ...[,], false);
            switch ($(conf.logMessages)[0].querySelector('[debugid="sourceRow"] > span:last-child').innerText) {
                case 'Submitted via Greentea Transfer': __activeCard.category = 'Greentea Transfer'; break;
                case 'Submitted via Help Center Direct to Form':
                //FALL THROUGH
                case 'Submitted via Transfer': __activeCard.category = 'DFA'; break;
                default: __activeCard.category = 'Unidentified';
            };
            __activeCard.caseType = $(conf.logMessages)[0].querySelector('[debugid="sourceRow"] > span:last-child').innerText;
            //If the case will be LT or another one different of the cases above, the tool won't work
            __activeCard.category === "Unidentified" ? reject("UNKNOWN CASE TYPE") : null;

            for (const message of $(conf.logMessages)) {
                if ($(message).html().includes('An appointment has been successfully created')) {
                    await waitForMutation(conf.logMessageContent, 'extra_information', 'from', message, 'click', 'div > div > div', 'An appointment has been successfully created', false);
                    var region = /(?<=\[)(.*?)(?=\])/;
                    var richContent = $(message.querySelector(conf.logMessageContent)).text();
                    //Get Name only returns DEFAULT on tabs other than a case tab
                    console.log(richContent);
                    bulkData.timezone = richContent.match(region)[0];
                    bulkData.name = [...$('action-bar input')].reduce((acc, e, i) => { return (e.value !== '' && i === 0 ? e.value : acc) }, 'DEFAULT_NAME');
                }
                //Extra informations to Non DFA cases
                else if ($(message).html().includes('Review case in Connect Sales') && __activeCard.category === 'Greentea Transfer') {
                    await waitForMutation(conf.logMessageContent, 'extra_information', 'from', message, 'click', 'div > div > div', ...[,], false);
                    let sellerInfo = message.querySelectorAll('.message-body1 [href*="connect.corp.google.com" ]')[1].parentElement.innerText.match(/(?<=by )(.*)(?= and)/)[0].trim();
                    bulkData.sellerInfo = { email: sellerInfo.match(/(?<=\()(.*)(?=\))/)[0], name: sellerInfo.match(/(.*)(?=\()/)[0].trim() };
                    for (const data of $('.message-body.message-body1 tbody > tr')) {
                        $(data.querySelector('td:first-child')).text() === 'Sales Program' ? bulkData.program = $(data.querySelector('td:last-child')).text()
                            : $(data.querySelector('td:first-child')).text() === 'Website' ? bulkData.website = $(data.querySelector('td:last-child')).text() : null;
                    };
                }

                //Extra informations to DFA cases
                else if (__activeCard.category === 'DFA') {
                    const reg = /^[^@]*\.[^@]*$/;
                    /*$(conf.logMessages)[0].querySelector('div > div').click()
                    await waitForEntity(conf.logDfaContent, 'extra_information', 'from', $(conf.logMessages)[0]);
                    */
                    await waitForMutation(conf.logDfaContent, 'extra_information', 'from', $(conf.logMessages)[0], 'click', 'div > div', ...[,], false);
                    bulkData.website = [...$(conf.logMessages)[0].querySelectorAll('a')].reduce((acc, url) => { return (reg.test(url.innerHTML) ? url.innerHTML : acc) }, "DEFAULT_URL");
                };
            };

            //Case Data declaration
            if (__Bifrost.data.find(data => data.case_id === bulkData.activeCase)) {
                console.log('BulkData');
                console.log(bulkData);
                if ($('#templateEmail').find(':selected').attr('crCode').match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/)) {
                    if (__activeCard.category === 'DFA') {
                        let reschAppointment = `${$('#resch_date').val()} ${$('#resch_time').val()} ${$('#resch_period').val()}`;
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(reschAppointment, 'DD-MM-YYYY hh:mm A', 'America/Sao_Paulo').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: 'DFA', sellerInfo: 'none', website: bulkData.website, agent: bulkData.agent
                            } : acc);
                        }, {});

                        console.log('Resch DFA');
                        console.log(__caseData);
                        resolve();
                    }
                    else {
                        let reschAppointment = `${$('#resch_date').val()} ${$('#resch_time').val()} ${$('#resch_period').val()}`;
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(reschAppointment, 'DD-MM-YYYY hh:mm A', 'America/Sao_Paulo').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: bulkData.program, sellerInfo: bulkData.sellerInfo, website: bulkData.website, agent: bulkData.agent
                            } : acc);
                        }, {});

                        console.log('Resch Greentea');
                        console.log(__caseData);
                        resolve();
                    };
                }
                else {
                    if (__activeCard.category === 'DFA') {
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(data.appointment, 'UTC').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: 'DFA', sellerInfo: 'none', website: bulkData.website, agent: bulkData.agent
                            } : acc);
                        }, {});

                        console.log('Regular DFA');
                        console.log(__caseData);
                        resolve();
                    }
                    else {
                        window.__caseData = __Bifrost.data.reduce((acc, data) => {
                            return (bulkData.activeCase === data.case_id ? {
                                ...data, appointment: moment.tz(data.appointment, 'UTC').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
                                name: bulkData.name, program: bulkData.program, sellerInfo: bulkData.sellerInfo, website: bulkData.website, agent: bulkData.agent
                            } : acc)
                        }, {});

                        console.log('Regular Greentea');
                        console.log(__caseData);
                        resolve();
                    };
                };
            }
            else { reject("CASE NOT FOUND") };
        }
        catch (error) { reject(error) };
    });
};
async function getActiveCard() {
    return new Promise(async (resolve, reject) => {
        //Delay to prevent style changes
        await new Promise(resolve => setTimeout(resolve, 1000));
        let cards = getActiveTab().querySelectorAll('card');
        for (const element of cards) {
            if ($(element).is('[card-type="compose"].is-top')) {
                console.log("%cCompose card was found", "color: green");
                window.__activeCard = {
                    'element': element,
                    'type': $(element).attr('card-type'),
                    'selectedTemp': $('#templateEmail').find(':selected').attr('crCode')
                };
                console.log(window.__activeCard);
                resolve();
            };
        };
        reject("EMAIL CARD NOT FOUND");
    });
};

async function updateAdresses() {
    return new Promise(async (resolve, reject) => {
        try {
            await waitForMutation(conf.dropdownEmailsContainer, 'dropdownEmails', 'from', __activeCard.element, 'click', '.address[buttoncontent]', ...[,]);
            //Change to: technical-solutions@google.com
            [...$(`${conf.dropdownEmails} > span`)].forEach(email => { $(email).text() === 'technical-solutions@google.com' ? email.click() : null });
            //Update the attendees
            __activeCard.element.querySelector(conf.showCC_btn) ? await waitForMutation('[aria-label="Enter Cc email address"]', 'emailAdresses', 'from', __activeCard.element, 'click', conf.showCC_btn, ...[,]) : null;
            //Remove default emails
            await removeDefaultEmails();
            //Update all calendar attendees including the seller
            await insertNewEmails();
            console.log("%cModified attendees", "color: green");
            resolve();
        }
        catch (err) {
            console.log(err);
            reject("ERROR UPDATING ADRESSES");
        };
    });
};
function removeDefaultEmails() {
    return new Promise(async (resolve) => {
        for (const emails of __activeCard.element.querySelectorAll(conf.removeEmail_btn)) {
            __activeCard.element.querySelector(conf.removeEmail_btn).click();
            await new Promise(resolve => setTimeout(resolve, 150));
            __activeCard.element.querySelectorAll(conf.removeEmail_btn).length === 0 ? resolve() : null;
        };
    });
};
function insertNewEmails() {
    return new Promise(async (resolve) => {
        let toField = '[aria-label="Enter To email address"]';
        let ccField = '[aria-label="Enter Cc email address"]';
        let bccField = '[aria-label="Enter Bcc email address"]';
        let bccPrograms = ['Olympus', 'PKA', 'pka'];
        let sellerTemps = __qaData.reduce((acc, e) => { return (e.to === 'seller' ? [...acc, e.crCode] : acc) }, []);
        //To seller
        if (sellerTemps.includes(__activeCard.selectedTemp)) {
            console.log("%cTo Seller", "color: orange");
            $(toField).val(__caseData.sellerInfo.email);
            updateInput(toField);
            resolve();
        }
        //To customer
        else {
            console.log("%cTo Customer", "color: orange");
            $(toField).val(__caseData.attendees.toString());
            updateInput(toField);
            if (bccPrograms.some(e => __caseData.program.includes(e))) {
                $(bccField).val(__caseData.sellerInfo.email);
                updateInput(bccField);
                resolve();
            }
            else {
                if (__activeCard.category === 'DFA') { resolve() }
                else {
                    $(ccField).val(__caseData.sellerInfo.email);
                    updateInput(ccField);
                    resolve();
                };
            };
        };

        function updateInput(input) {
            let inputEvent = new Event('input', { bubbles: true });
            let kbEvent = new KeyboardEvent('keydown', { key: ',', keyCode: 188, which: 188 });
            __activeCard.element.querySelector(input).dispatchEvent(kbEvent);
            __activeCard.element.querySelector(input).value += ',';
            __activeCard.element.querySelector(input).dispatchEvent(inputEvent);
        };
    });
};
async function newEmail() {
    return new Promise(async (resolve, reject) => {
        try {
            if ($(conf.writeCard_btn).length) {
                await waitForMutation(conf.newEmail_btn, 'Lateral_bar', 'sel', ...[,], 'focus', $(conf.writeCard_btn)[0], ...[,]);
                await waitForMutation(conf.createEmail, 'New_email_card', 'sel', ...[,], 'click', $(conf.newEmail_btn)[0], ...[,]);
                $(conf.writeCard_btn)[0].dispatchEvent(new Event('blur'), { bubbles: true })
                console.log("%cCreated email", "color: green");
                resolve();
            }
            else { reject("WRONG PAGE") };
        }
        catch (error) { reject(error) };
    });
};
function waitForMutation(el, id, type, origin, event, aim, txt, reuse = true) {
    return new Promise((resolve, reject) => {
        let findMutation = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (txt && mutation.target.innerText.includes(txt)) {
                    if (reuse && mutation.target.closest(el)) {
                        clearInterval(fireNSeek);
                        findMutation.disconnect();
                        console.log(mutation.target.innerText);
                        resolve(); break;
                    };
                    if (type === 'from' && !reuse && $(origin.querySelector(el)).length && mutation.target.closest(el)) {
                        clearInterval(fireNSeek);
                        findMutation.disconnect();
                        console.log(mutation.target.innerText);
                        resolve(); break;
                    };
                }
                else if (typeof txt === 'undefined') {
                    if (reuse && mutation.target.closest(el)) {
                        clearInterval(fireNSeek);
                        findMutation.disconnect();
                        console.log(`%cSelector ${id} has been found`, "color: orange");
                        resolve(); break;
                    };
                    if (type === 'from' && !reuse && $(origin.querySelector(el)).length && mutation.target.closest(el)) {
                        clearInterval(fireNSeek);
                        findMutation.disconnect();
                        console.log(`%cSelector ${id} has been found`, "color: orange");
                        resolve(); break;
                    };
                };
            };
        });
        findMutation.observe(document, options);

        var fireNSeek = setInterval(() => {
            console.log(`%cReinitializing ${event} event`, "color: red");
            if (event === 'click') {
                type === 'from' && event && aim ? origin.querySelector(aim).click()
                    : type === 'sel' && event && aim ? $(aim)[0].click() : null;
            }
            else {
                type === 'from' && event && aim ? origin.querySelector(aim).dispatchEvent(new Event(event), { bubbles: true })
                    : type === 'sel' && event && aim ? $(aim)[0].dispatchEvent(new Event(event), { bubbles: true }) : null;
                // : !event && !aim ? null
            };
        }, 500);
    });
};
function rangeSetter() {
    var $newSelection = $(__activeCard.element.querySelector(conf.emailContent));
    var selection = window.getSelection();
    var range = document.createRange();
    range.setStartBefore($newSelection.first()[0]);
    range.setEndAfter($newSelection.last()[0]);
    selection.removeAllRanges();
    selection.addRange(range);
};
async function gaiaRequestCatcher() {
    return new Promise(resolve => window.onmessage = (request) => {
        if (request.origin === "https://supportcases-pa-googleapis.corp.google.com") {
            var rawData = JSON.parse(JSON.parse(request.data).a[1]).gapiRequest.data.body
            var aureumData = JSON.parse(rawData)
            if (Object.keys(aureumData).length === 5) { resolve(aureumData) }
        }
    })
};

//window.cannedInput1 = '.pane.modal.visible dynamic-component';
function insertTemplate() {
    return new Promise(async (resolve, reject) => {
        // if ($(conf.writeCards).length === 1) {
        if ($('#templateEmail').val() === "ext") {
            var signature = $(__activeCard.element.querySelector(conf.signature)).html();
            //External template
            var temp_data = await getExternalTemp();
            $(__activeCard.element.querySelector(conf.emailTitle)).val(temp_data.title);
            if ($('#templateEmail').find(':selected').attr('crCode').includes('mms')) {
                $(__activeCard.element.querySelector(conf.emailContent)).html(`${temp_data.content}<br/>${signature}`);
                resolve();
            }
            else {
                $(__activeCard.element.querySelector(conf.emailContent)).html(`${temp_data.content}<br/>`);
                resolve();
            };
        }
        else {
            console.log({ 'ActiveElement': __activeCard.element })

            await waitForMutation(conf.paneCannedInput, 'Canned_response input', 'sel', ...[,], 'click', $('[aria-label="Insert canned response"]')[0], ...[,]); // true
            $(conf.cannedInput).val($('#templateEmail').find(':selected').attr('crCode'));

            console.log(`%c${$('#templateEmail').find(':selected').attr('crCode')}`, "color: green");


            await new Promise(resolve => setTimeout(resolve, 3500));
            $(conf.cannedInput)[0].dispatchEvent(new Event('focus', { bubbles: true }));

            $(__activeCard.element.querySelector(conf.emailContent)).html('<p dir="auto"><br></p>');
            await waitForMutation(conf.cannedDropdown, 'Canned_response Dropdown', 'sel', ...[,], 'input', $(conf.cannedInput)[0], ...[,]); // true 🎈🎈

            $('.write-cards-wrapper card').removeClass("spread")
            $('.write-cards-wrapper[style=""] card').addClass("spread")

            var rangeFixer = setInterval(rangeSetter, 1)

            $(conf.cannedDropdown)[0].click()
            window.gaiaBugProtector = await gaiaRequestCatcher();

            await insertedTempAlert();
            console.log("%cCanned response was inserted", "color: green");
            //window.removeEventListener('message', gaiaRequestCatcher)
            clearInterval(rangeFixer)
            resolve();
        };
    });
};
function autoFill() {
    return new Promise(async (resolve) => {
        if ($('#templateEmail').val() === 'ext') {
            //Logic to autofill external temps
            let emailBody = $(__activeCard.element.querySelector(conf.emailContent));
            let emailTitle = $(__activeCard.element.querySelector(conf.emailTitle));
            let replacedTerms = /\{(?:advertiser|url|case_id|phone|agent|meet)\}/g;
            let mapTerms = {
                '{advertiser}': __caseData.name, '{phone}': __caseData.phone,
                '{url}': __caseData.website, '{case_id}': __caseData.case_id,
                '{agent}': __caseData.agent, '{meet}': __caseData.meet
            };
            let content = emailBody.html().replace(replacedTerms, matched => mapTerms[matched]);
            let title = emailTitle.val().replace(replacedTerms, matched => mapTerms[matched]);

            emailBody.html(content);
            emailTitle.val(title);
            resolve();
        }
        else {
            //Logic to autofill canned temps
            let selectedTemp = __qaData.reduce((acc, e) => { return e.crCode === __activeCard.selectedTemp ? e : acc });
            let dupMessages = ['solucoes tecnicas do google', 'soluciones tecnicas de google', 'solucoes tecnicas da google'];

            if (selectedTemp.inputs.appointment) {
                $(__activeCard.element.querySelector(selectedTemp.inputs.appointment)).html(__caseData.appointment);
                $(__activeCard.element.querySelector(selectedTemp.inputs.appointment)).removeClass('field');
            }
            if (selectedTemp.inputs.name) {
                $(__activeCard.element.querySelector(selectedTemp.inputs.name)).html(__caseData.name);
                $(__activeCard.element.querySelector(selectedTemp.inputs.name)).removeClass('field');
            }
            if (selectedTemp.inputs.phone) {
                $(__activeCard.element.querySelector(selectedTemp.inputs.phone)).html(__caseData.phone);
                $(__activeCard.element.querySelector(selectedTemp.inputs.phone)).removeClass('field');
            }
            if (selectedTemp.inputs.nothing) {
                console.log('No fields');
            }
            //Duplicated signature remotion
            for (element of __activeCard.element.querySelectorAll('tr span')) { ($(element).text().includes('{%neo.vendor_partner%}') || $(element).text() === 'Cognizant') ? element.parentElement.remove() : null };
            for (element of __activeCard.element.querySelectorAll('tr > td')) { dupMessages.some(e => element.innerText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") === e) ? element.remove() : null };
            resolve();
        };
        __activeCard.element.querySelector(conf.createEmail).dispatchEvent(new Event('input', { bubbles: true }));
        $('.write-cards-wrapper card').removeClass("spread")
        window.gaiaBugProtector = null
        console.log("%cAutofilled", "color: green");
    });
};
function insertedTempAlert() {
    return new Promise(async (resolve) => {
        var findSelection = setInterval(() => {
            console.log($('.write-cards-wrapper[style=""] card.is-top[card-type="compose"]'));
            if (window.getSelection().anchorNode.closest('.write-cards-wrapper[style=""] card.is-top[card-type="compose"] #email-body-content-top')) {
                clearInterval(findSelection);
                var tempInserted = setInterval(async () => {
                    if ($(__activeCard.element.querySelector('#email-body-content-top-content [role="presentation"]')).length) {
                        clearTimeout(bugProtector);
                        clearInterval(tempInserted);
                        resolve()
                    };
                }, 250);

                var bugProtector = setTimeout(() => {
                    console.log(`%cConnect Cases bugged - Resseting the email insertion...`, "color: red");
                    clearInterval(tempInserted);
                    console.log(window.gaiaBugProtector);
                    $(__activeCard.element.querySelector(conf.emailContent)).html(window.gaiaBugProtector.content);
                    resolve();
                }, 5000);
            };
        }, 1);
    });
};
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
        ];
        for (const item of ext_files) {
            if (item.temp === $('#templateEmail').find(':selected').attr('crCode')) {
                fetch(`https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/templates/${item.file}`)
                    .then(response => {
                        if (!response.ok) { reject('CDN ERROR') }
                        else { return response.text() };
                    }).then(temp => {
                        resolve({ content: `${temp}`, title: item.title });
                    });
            };
        };
    });
};
function showSuccess() {
    return new Promise((resolve) => {
        $('.alert').on("animationend", () => {
            $('.alert').removeClass(["default", "hide"]);
            $('.alert > span:first-child').removeClass(["fa-magic"]);
            $('.alert > span:first-child').addClass("fa-check-circle");
            $('.alert').addClass(["show", "success"]);
            $(".msg").text('Successful execution');
            $('.close-btn').show();
            $('.alert').off();
            gtag('event', 'successfuly_Attached', { send_to: `G-XKDBXFPDXE`, case: __caseData.case_id, category: __activeCard.caseType });
            resolve();
        });
    });
};
function showError(msg) {
    return new Promise((resolve) => {
        $('.alert').on("animationend", () => {
            $('.alert').removeClass(["default", "hide"]);
            $('.alert > span:first-child').removeClass(["fa-magic"]);
            $('.alert > span:first-child').addClass("fa-exclamation-circle");
            $('.alert').addClass(["show", "error"]);
            $(".msg").text(msg);
            $('.close-btn').show();
            $('.alert').off();
            resolve();
        });
    });
};
function removeError() {
    return new Promise((resolve) => {
        $(".close-btn").on("click", (e) => {
            $('.alert').removeClass("show");
            $('.alert').addClass("hide");
            clearTimeout(closeAlert);
            $('.alert').off();
            resolve();
        });
        var closeAlert = setTimeout(() => {
            $('.close-btn').hide();
            $('.alert').removeClass("show");
            $('.alert').addClass("hide");
            $('.alert').off();
            resolve();
        }, 3000);
    });
};
function showDefault(msg = 'Waiting for instructions') {
    return new Promise(async (resolve) => {
        $('.alert').on("animationend", (e) => {
            $('.alert').removeClass(["hide", "error", "success"]);
            $('.alert > span:first-child').removeClass(["fa-exclamation-circle", "fa-check-circle"]);
            $('.alert > span:first-child').addClass("fa-magic");
            $('.alert').addClass(["show", "default"]);
            $(".msg").text(msg);
            $('.close-btn').hide();
            $('.alert').off();
            resolve();
        });
    });
};
function changeSpinner() {
    return new Promise(async (resolve) => {
        let newIcon = '<svg height="40" viewBox="0 0 24 24" width="40" xmlns="http://www.w3.org/2000/svg"><rect height="2" width="2" x="6" y="3"></rect><rect height="2" width="3" x="8" y="19"></rect><rect height="2" width="2" x="16" y="3"></rect><rect height="2" width="3" x="13" y="19"></rect><path d="M20,11V9H18V7H16V5H14V7H10V5H8V7H6V9H4v2H2v8H4V15H6v4H8V16h8v3h2V15h2v4h2V11ZM10,12H8V9h2Zm6,0H14V9h2Z"></path></svg>';
        $('#noteIcon').remove();
        $("#circle").html(newIcon);
        resolve();
    });
};
function fetchLib(url) {
    return new Promise(async (resolve) => {
        try {
            await fetch(`${url}`).then(response => response.text()).then(text => eval(text));
            console.log(`${url} was fully Loaded`);
            resolve();
        }
        catch (err) { console.log(err) };
    });
};
function getCalendarID() {
    return new Promise(async (resolve) => {
        try {
            var waitForUsers = setInterval(() => {
                if (window.__userData !== undefined && __userData.length) {
                    console.log("__userData Found")
                    console.log(__userData)
                    clearInterval(waitForUsers);
                    for (const user_data of window.__userData) {
                        let dec = { ag: window.atob(user_data.ag), id: window.atob(user_data.id) };
                        if (dec.ag === JSON.parse(localStorage.getItem('ca_agent')).ldap.replace('@google.com', '')) {
                            let date = new Date();
                            date.setDate(date.getDate() + 400);
                            document.cookie = `calendarKey=${dec.id}; expires=${date.toUTCString()}; Priority=High`;
                            console.log(`%cCalendar key was summoned`, "color: green");
                            resolve();
                        };
                    };
                };
            }, 100);
        }
        catch (err) { console.log(err) };
    });
};
function init() {
    return new Promise(async (resolve) => {
        try {
            await ga4Setup();
            await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/css/stylesheet.css");
            //await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot_cases@latest/css/kimsaStyle.css");
            await loadCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+Shavian&family=Poppins:wght@300&display=swap');
            await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css");
            await loadCSS('https://code.jquery.com/ui/1.13.2/themes/dark-hive/jquery-ui.css');
            await fetchLib("https://code.jquery.com/jquery-3.7.1.min.js");
            await loadModal();
            await getAgentData();
            await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbzGihijGbY6DGdTrJ_u8tVynxHEq5-Z2rG0FALFWc5lTVUDiLuTBoVK8bEl5A0cWJhqWw/exec?portal=userData");
            await getCalendarID();
            await fetchLib('https://momentjs.com/downloads/moment.min.js');
            await fetchLib("https://code.jquery.com/ui/1.13.2/jquery-ui.min.js");
            await fetchLib("https://momentjs.com/downloads/moment-timezone-with-data-10-year-range.min.js");
            await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbznkfAXGOVgDS385t_czkBUD9rhLV3o4Xz87vsJmn3YrjajDE5m_BjTaUuABxTmpUJk/exec?portal=qaData");
            await changeSpinner();
            resolve();
        }
        catch (error) { console.error('CDN Error') };
    });
};
/*User AUTH*/
function loadModal() {
    return new Promise(async (resolve) => {
        try {
            await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/Autopilot/html/firstModal.html')
                .then(response => response.text()).then(temp => { $('.modal-container').html(temp) });
            console.log("%cModal 1 inserted", "color: green");
            await validateKey();
            console.log("%cValid key was found", "color: green");
            await insertModal2();
            console.log("%cAuthenticated user", "color: green");
            resolve();
        }
        catch (err) {
            console.log(err);
            console.log("%cNew user", "color: green");
            resolve();
        };
    });
};
async function attachEmail() {
    return new Promise(async (resolve, reject) => {
        try {
            await validateKey();
            await newEmail();
            await getActiveCard();
            await bulkBifrost();
            await updateAdresses();
            await insertTemplate();
            await autoFill();
            resolve();
        }
        catch (error) { reject(error) };
    });
};
async function ga4Setup() {
    await loadGA4();
    await new Promise(resolve => setTimeout(resolve, 1500));
    var user = JSON.parse(window.clientContext).userEmail.replace('@google.com', '');
    gtag('config', 'G-XKDBXFPDXE', {
        'debug_mode': true, 'user_id': user, 'user_properties': { 'user_ID': user }
    });
    gtag('event', 'initialized', { send_to: 'G-XKDBXFPDXE' });
};
function loadGA4() {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-XKDBXFPDXE";
        script.onload = resolve(`Fully loaded`);
        script.onerror = reject(`Loading error`);
        document.head.appendChild(script);
    });
};
function saveCookie(element) {
    if ($(element.target).is('.input-modal > input')) {
        let date = new Date();
        date.setDate(date.getDate() + 400);
        document.cookie = `calendarKey=${$(element.target).val().trim()}; expires=${date.toUTCString()}; Priority=High`;
    };
};
async function errorClosure(msg) {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
    await showError(msg);
    await removeError();
    await showDefault();
    $('#temp_type').val('default');
    $('#temp_type, #templateEmail, #showTime').prop('disabled', false);
    $('#temp_type')[0].dispatchEvent(new Event('change', { bubbles: true }));
    $('#showTime').html('INSERT<i class="fa fa-cog"></i>');
    gtag('event', 'error_Attaching', { send_to: `G-XKDBXFPDXE`, case: __caseData.case_id, type: msg, category: __activeCard.caseType });
};
(async function main() {
    await init();
    const dateConfig = {
        dateFormat: 'dd-mm-yy', changeMonth: true, changeYear: true, minDate: new Date(), yearRange: "c-0:c+1", dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S', 'D'], dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'], monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    };
    $(window).on("change", handleSelect);
    $(window).on("mouseover", dragModal);
    $(window).on("input", saveCookie);
    $(window).on("click", (e) => {
        $(e.target).is('#checkButton') ? validateId()
            : e.target.closest('#closeModal') ? closeModal()
                : e.target.closest('#circle') ? openModal()
                    : $(e.target).is('#showTime') ? console.log('Showtime!') : null;
    });

    var modalLoaded = setInterval(() => {
        if ($('#resch_time').length) {
            //MODAL 2 CONFIG
            clearInterval(modalLoaded);
            timePickerConfig();
            $(function () { $("#resch_date").datepicker(dateConfig) });
            $('#showTime').on("click", async () => {
                //Remove Default + Transition
                $('#showTime').html('LOADING<i class="fa fa-cog fa-spin"></i>');
                $('#temp_type, #templateEmail, #resch_date, #resch_time, #resch_period').prop('disabled', true);
                disableFields();
                $('.alert').removeClass("show");
                $('.alert').addClass("hide");
                showDefault('Working...');
                try {
                    await attachEmail();
                    $('.alert').removeClass("show");
                    $('.alert').addClass("hide");
                    await showSuccess();
                    await removeError();
                    await showDefault();

                    $('#temp_type').val('default');
                    $('#temp_type, #templateEmail').prop('disabled', false);
                    $('#temp_type')[0].dispatchEvent(new Event('change', { bubbles: true }));
                    $('#showTime').html('INSERT<i class="fa fa-cog"></i>');
                }
                catch (err) {
                    err === "BIFROST BULK ERROR" ? errorClosure("Error fetching your data")
                        : err === "SEVERAL EMAIL CARDS OPEN" ? errorClosure("Send your other emails!")
                            : err === "ERROR UPDATING ADRESSES" ? errorClosure('Error attaching emails')
                                : err === "WRONG PAGE" ? errorClosure("Focus a case page")
                                    : err === "EMAIL CARD NOT FOUND" ? errorClosure("None card was detected")
                                        : err === "CASE NOT FOUND" ? errorClosure("Case not found on Calendar")
                                            : err === "UNKNOWN CASE TYPE" ? errorClosure("Unknown case type")
                                                : err === "CDN ERROR" ? errorClosure("Unexpected server error") : errorClosure(err);
                };
            });
        };
    }, 100);
})();







































const bubbleEventClick = new Event('click', { bubbles: true });
const bubbleEventFocus = new Event('focus', { bubbles: true });
const bubbleEventBlur = new Event('blur', { bubbles: true });
const bubbleEventInput = new Event('input', { bubbles: true });

const createEmail = (hotkeyString) => {
    // Configura as opções para observar mudanças no documento inteiro
    const opcoes = { childList: true, subtree: true, attributes: true, characterData: true };
    const elements = [];
    const createEmail = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'characterData' && mutation.target.closest(createEmail)) {
                elements.push(mutation.target);
                console.log('Created Email')
                createEmail.disconnect();
                return;
            }
        }
    });

    const functionCreateEmail = () => {
        const buttonCreateCard = document.querySelector('[aria-label="Create a write card"]');
        buttonCreateCard.dispatchEvent(bubbleEventFocus);
        var emailButton = setInterval(() => {
            if (document.querySelector('[aria-label="Create new email"]') !== null) {
                clearInterval(emailButton)
                const buttonCreateEmail = document.querySelector('[aria-label="Create new email"]');
                buttonCreateEmail.dispatchEvent(bubbleEventClick);
                buttonCreateCard.dispatchEvent(bubbleEventBlur);
                createEmail.observe(document, opcoes);
                var mutationSeeker = setInterval(() => {
                    console.log('Interval Started')
                    if (elements.length > 0) {
                        clearInterval(mutationSeeker)

                        console.log('Elementos', elements[0]);
                        const contentTop = elements[0].querySelector('#email-body-content-top',);
                        document.querySelector('[aria-label="Insert canned response"]').click();
                        var inputSeeker = setInterval(() => {
                            if (document.querySelector('canned-response-dialog input') !== null) {
                                clearInterval(inputSeeker)
                                const inputCR = document.querySelector('canned-response-dialog input');
                                console.log(elements);
                                contentTop.innerText = '';
                                inputCR.value = hotkeyString;
                                inputCR.dispatchEvent(bubbleEventInput);
                                elements.length = 0;
                                console.log(document.activeElement)
                                const clickHotKey = new MutationObserver((mutations) => {
                                    for (const mutation of mutations) {
                                        console.log(mutation)
                                        if (mutation.target && mutation.target.innerText.includes('1 match')) {
                                            mutation.target.querySelector('material-select-dropdown-item').dispatchEvent(bubbleEventClick);
                                            clickHotKey.disconnect();
                                            return;
                                        }
                                    }
                                })
                                clickHotKey.observe(document, opcoes);
                                console.log('acabou')
                                return;
                            }
                        }, 100)


                    }
                }, 100)
            }
        }, 100)

    };
    functionCreateEmail(hotkeyString);
}
