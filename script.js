define(['jquery', 'lib/components/base/modal'], function($, Modal) {
    var CustomWidget = function() {
        var self = this,
            system = self.system;

        this.callbacks = {
            render: function() {
                console.log('this.callbacks');
                return true;
            },
            init: function() {

                var settings = self.get_settings();
                //   Проверяем подключен ли наш файл css
                if ($('link[href="' + settings.path + '/css/forUL.css?v=' + settings.version +'"').length < 1) {
                    //  Подключаем файл style.css передавая в качестве параметра версию виджета
                    $("head").append('<link href="' + settings.path + '/css/forUL.css?v=' + settings.version + '" type="text/css" rel="stylesheet">');
                }
                var settings = self.get_settings();
                //   Проверяем подключен ли наш файл css
                if ($('script[href="' + settings.path + '/css/jsUL.js?v=' + settings.version +'"').length < 1) {
                    //  Подключаем файл style.css передавая в качестве параметра версию виджета
                    $("head").append('<script href="' + settings.path + '/css/jsUL.js?v=' + settings.version + '" type="text/javascript">');
                }
                let hostingurl = 'https://mt-webapp.ru/handler/qualityControl/qualityControl.php';
                // ПОЛУЧАЕМ ИД И ГРУППУ //
                let user_id, user_group;
                console.log('init: function()');
                $.ajax({
                    url: '/api/v2/account?with=users',
                    type: 'GET',
                    dataType: 'json',
                    success: (data) => {
                        console.log(data);
                        user_id = data['current_user'];
                        user_group = data['_embedded']['users'][user_id]['group_id'];
                        localStorage.setItem("user_id",user_id);
                        localStorage.setItem("user_group",user_group);
                    }
                });
                user_id = localStorage.getItem("user_id");
                user_group = localStorage.getItem("user_group");
                console.log(user_id);
                console.log(user_group);
                let user_right = '';
                if (user_group == 216328) { // 216328 - kk
                    localStorage.setItem("user_rights", "admin"); // FIXME: проверить группы
                    console.log('это admin');
                } else {
                    localStorage.setItem("user_rights", "manager");
                    console.log('это manager');
                }
                let alerts = '';
                $.ajax({
                    url: hostingurl,
                    datatype: 'json',
                    type: 'POST',
                    data: {
                        "action": "get_counter",
                        "user": localStorage.getItem("user_id"),
                        "right": localStorage.getItem("user_rights")
                    },
                    success: (data) => {
                        console.log(localStorage.getItem("user_id"));
                        console.log(localStorage.getItem("user_rights"));
                        console.info(data);
                        if (data['count'] == 0) {
                            alerts = "<span id='std_text' style='text-align: center; display: block; width: 100%; height: 100%; color: gray;'>Уведомлений нет</span>"
                        } else {
                            data['leads'].forEach((el) => {
                                alerts += "<div style='cursor: pointer;' class='notification_block' data-notification='" + el['id_lead'] + "'><div class='main alert'>  <div class='wrap'> <div class='notic_text'>В сделке №" + el['id_lead'] + " были обновлены замечания</div> </div></div></div>";
                            });
                        }
                        if (!$("#alert_counter").length) {
                            $("#nav_menu").prepend("<div id='alert_counter' class=''></div>");
                            $("#nav_menu").prepend("<div id='alert_list' style='display: none; top: 80px; left: 80px; padding: 10px; z-index: 99; position: fixed; overflow-y: scroll; overflow-x: hidden; width: 350px; border-radius: 10px; border: 3px solid lightseagreen; background: lightgoldenrodyellow; max-height: 150px;'>" + alerts + "</div>");
                        }
                        if (data['count'] != 0) {
                            $("#alert_counter").addClass("checkme");
                            $("#alert_counter").text(data['count']);
                        } else {
                            $("#alert_counter").removeClass("checkme");
                            $("#alert_counter").text("0");
                        }
                        $("#alert_counter").click(() => {
                            if ($("#alert_list").css("display") == "none") {
                                $("#alert_list").css("display", "block");
                                $("#alert_counter").addClass("active_counter");
                            } else {
                                $("#alert_list").css("display", "none");
                                $("#alert_counter").removeClass("active_counter");
                                //}
                            }
                        });
                        $(".notification_block").on("click", function() { //Уведомление было прочитано
                            let notification_id = $(this).attr("data-notification");
                            $.ajax({
                                url: hostingurl,
                                datatype: 'json',
                                type: 'POST',
                                data: {
                                    "action": "unshow",
                                    "notification_id": notification_id,
                                    "rights": localStorage.getItem("user_rights")
                                }
                            });
                            document.location.href = 'https://tema24.amocrm.ru/leads/detail/' + notification_id + '?tab_id=leads_2241537608968';
                        });

                    },
                    error: function (data) {
                        console.log('get_counter error');
                        console.log(data);
                        console.log(data.responseText);
                    }
                });

                if (AMOCRM.data.current_entity == 'leads') {
                    var curr_card = AMOCRM.data.current_card.id,
                        curr_user = AMOCRM.data.current_card.user.id,
                        user_name = AMOCRM.data.current_card.user.name;

                    // /api/v4/users
                    // $(".linked-form__field .control--select .custom-scroll").css("display: flex;flex-direction: column-reverse;");

                    var qc_field = $("textarea[name='CFV[370497]']").parent()[0];
                    $("textarea[name='CFV[370497]']").css("color", "red");
                    $("textarea[name='CFV[370497]']").removeAttr("placeholder").parent().css("cursor", "pointer").css("width", "20px").css("background", "aquamarine").css("border-radius", "50%").css("height", "20px").css("margin", "5px 0px 0 0");
                    console.log('перед IF (user_group == 216328)');
                    if (user_group == 216328) { //216328 -- kk
                        console.log('ДА это он (user_group == 216328)');
                        $.ajax({
                            url: '/api/v4/users/?page=1&limit=250',
                            datatype: 'json',
                            type: 'GET',
                            success: (data) => {
                                console.log("users");
                                console.log(data);
                                for ($i = 0; $i<data['_embedded']['users'].length;$i++){
                                    if(data['_embedded']['users'][$i]['rights']['is_active'] == 1 && data['_embedded']['users'][$i]['rights']['group_id'] != 216328){
                                        console.log(data['_embedded']['users'][$i]['id']);
                                        console.log(data['_embedded']['users'][$i]['name']);
                                        gg = $(".linked-form__field .control--select .control--select--list--item");
                                        let ggwp = '';
                                        ggwp = '<li data-value="'+data['_embedded']['users'][$i]['id']+'" data-color="" class="control--select--list--item" style=""><span class="control--select--list--item-inner" title="'+data['_embedded']['users'][$i]['name']+'">'+data['_embedded']['users'][$i]['name']+'</span></li>'
                                        $(".linked-form__field .control--select .custom-scroll").append(ggwp);
                                    }
                                }
                            },
                            error: function (data) {
                                console.log('users error');
                                console.log(data);
                                console.log(data.responseText);
                            }
                        });
                        var otv_id = 1,
                            mng_name = '1';
                        otv_id = $("input[name='CFV[577625]']").val();
                        mng_name = $("button[data-value='"+otv_id+"']").text();

                        // if (otv_id1 == 812475) {
                        //     otv_id = 2320036;  //403
                        //     mng_name = '403 РОП Винокуров Василий Валерьевич';
                        // } else if (otv_id1 == 812477) {
                        //     otv_id = 2375017;  // 409
                        //     mng_name = '409 Менеджер Макарова Дарья Дмитриевна';
                        // } else if (otv_id1 == 812479) {
                        //     otv_id = 2375176;  // 413
                        //     mng_name = '413 Менеджер Вошкарин Роман Иванович';
                        // } else if (otv_id1 == 812481) {
                        //     otv_id = 3067300;  // 454
                        //     mng_name = '454 Менеджер Загайнов Даниил Валерьевич';
                        // } else if (otv_id1 == 812483) {
                        //     otv_id = 3067321;  // 460
                        //     mng_name = '460 Менеджер Бордушко Владислав Александрович';
                        // } else if (otv_id1 == 812485) {
                        //     otv_id = 6512170;  // 405
                        //     mng_name = '405 Менеджер Гладышева Маргарита Александровна';
                        // } else if (otv_id1 == 812487) {
                        //     otv_id = 2824618;  // 424
                        //     mng_name = '424 Логист Терещенко Анастасия';
                        // } else if (otv_id1 == 812489) {
                        //     otv_id = 2975461;  // 427
                        //     mng_name = '427 Кассир Якубович Александра Михайловна';
                        // } else if (otv_id1 == 812491) {
                        //     otv_id = 2320654;  // 407
                        //     mng_name = '407 Бухгалтер Шагдарон Баир Сергеевич';
                        // }

                        console.log(otv_id);
                        console.log(curr_user);
                        console.log(mng_name);
                        console.log(otv_id);
                        console.log(curr_card);
                        $.ajax({
                            url: hostingurl,
                            type: 'POST',
                            datatype: 'json',
                            data: {
                                "action": "otvif",
                                "card_id": curr_card,
                                "otv_id": otv_id,
                                "curr_user": curr_user
                            }, success: (data) => {
                                console.log('success otvif');
                                flagprov = data;
                                console.log(data);
                                if (data.length >= 1){
                                    const lastdate = data[data.length - 1].date;
                                    let is_checked = 0,
                                        is_comment, comment = $("#qc_comment").val(),
                                        num_checkboxes = $(".checkbox_qc").length,
                                        checkbox_name = [],
                                        checkbox_val = [];
                                    for (let i = 0; i < num_checkboxes; i++) {
                                        checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                        if ($(".checkbox_qc")[i].checked) { //checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                            checkbox_val.push(1);
                                            is_checked = 1;
                                        } else {
                                            checkbox_val.push(0);
                                        }
                                    }
                                    $.ajax({
                                        url: '/api/v2/leads',
                                        type: 'POST',
                                        dataType: 'json',
                                        data: {
                                            update: [{
                                                id: curr_card,
                                                updated_at: Date.now(),
                                                custom_fields: [{
                                                    id: "370497",
                                                    values: [{
                                                        value: 'Есть'
                                                    }]
                                                },
                                                    {
                                                        id: "371275",
                                                        values: [{
                                                            value: data[lastdate].expert_name
                                                        }]
                                                    },
                                                    {
                                                        id: "371277",
                                                        values: [{
                                                            value: lastdate
                                                        }]
                                                    }
                                                ]
                                            }]
                                        }
                                    });
                                }
                                else{
                                    $.ajax({
                                        url: "/api/v2/leads",
                                        datatype: "json",
                                        type: "post",
                                        data: {
                                            update: [{
                                                id: curr_card,
                                                updated_at: Date.now(),
                                                custom_fields: [{
                                                    id: "370497",
                                                    values: [{
                                                        value: ''
                                                    }]
                                                },
                                                    {
                                                        id: "371275",
                                                        values: [{
                                                            value: ''
                                                        }]
                                                    },
                                                    {
                                                        id: "371277",
                                                        values: [{
                                                            value: ''
                                                        }]
                                                    }
                                                ]
                                            }]
                                        }
                                    });

                                }
                            },
                            error: function (data) {
                                console.log('otvif error');
                                console.log(data);
                                flagprov = data;
                                console.log(data.responseText);
                            }
                        });
                        $("input[name='CFV[577625]']").parent().click(function (e) {
                            otv_id = $("input[name='CFV[577625]']").val();
                            mng_name = $("button[data-value='"+otv_id+"']").text();
                            // if (otv_id1 == 812475) {
                            //     otv_id = 2320036;  //403
                            //     mng_name = '403 РОП Винокуров Василий Валерьевич';
                            // } else if (otv_id1 == 812477) {
                            //     otv_id = 2375017;  // 409
                            //     mng_name = '409 Менеджер Макарова Дарья Дмитриевна';
                            // } else if (otv_id1 == 812479) {
                            //     otv_id = 2375176;  // 413
                            //     mng_name = '413 Менеджер Вошкарин Роман Иванович';
                            // } else if (otv_id1 == 812481) {
                            //     otv_id = 3067300;  // 454
                            //     mng_name = '454 Менеджер Загайнов Даниил Валерьевич';
                            // } else if (otv_id1 == 812483) {
                            //     otv_id = 3067321;  // 460
                            //     mng_name = '460 Менеджер Бордушко Владислав Александрович';
                            // } else if (otv_id1 == 812485) {
                            //     otv_id = 6512170;  // 405
                            //     mng_name = '405 Менеджер Гладышева Маргарита Александровна';
                            // } else if (otv_id1 == 812487) {
                            //     otv_id = 2824618;  // 424
                            //     mng_name = '424 Логист Терещенко Анастасия';
                            // } else if (otv_id1 == 812489) {
                            //     otv_id = 2975461;  // 427
                            //     mng_name = '427 Кассир Якубович Александра Михайловна';
                            // } else if (otv_id1 == 812491) {
                            //     otv_id = 2320654;  // 407
                            //     mng_name = '407 Бухгалтер Шагдарон Баир Сергеевич';
                            // } else {
                            //     otv_id = 1;
                            //     mng_name = '1';
                            // }
                            console.log(otv_id);
                            console.log(curr_user);
                            console.log(mng_name);
                            console.log(otv_id);
                            console.log(curr_card);

                            // console.log($("input[name='CFV[577625]']").val());

                            // console.log($("input[name='CFV[577625]']").attr("value"));
                            // $("input[name='CFV[577625]']").parent().parent().parent().css("display", "none");

                            $.ajax({
                                url: hostingurl,
                                type: 'POST',
                                datatype: 'json',
                                data: {
                                    "action": "otvif",
                                    "card_id": curr_card,
                                    "otv_id": otv_id,
                                    "curr_user": curr_user
                                }, success: (data) => {
                                    console.log('success otvif');
                                    flagprov = data;
                                    console.log(data);
                                    if (data.length >= 1){
                                        const lastdate = data[data.length - 1].date;
                                        var d = new Date(),
                                            curr_date = d.getDate(),
                                            curr_month = d.getMonth() + 1,
                                            curr_year = d.getFullYear(),
                                            curr_hours = d.getHours(),
                                            curr_minutes = d.getMinutes();
                                        let is_checked = 0,
                                            is_comment, comment = $("#qc_comment").val(),
                                            num_checkboxes = $(".checkbox_qc").length,
                                            checkbox_name = [],
                                            checkbox_val = [];
                                        for (let i = 0; i < num_checkboxes; i++) {
                                            checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                            if ($(".checkbox_qc")[i].checked) { //checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                                checkbox_val.push(1);
                                                is_checked = 1;
                                            } else {
                                                checkbox_val.push(0);
                                            }
                                        }
                                        $.ajax({
                                            url: '/api/v2/leads',
                                            type: 'POST',
                                            dataType: 'json',
                                            data: {
                                                update: [{
                                                    id: curr_card,
                                                    updated_at: Date.now(),
                                                    custom_fields: [{
                                                        id: "370497",
                                                        values: [{
                                                            value: 'Есть'
                                                        }]
                                                    },
                                                        {
                                                            id: "371275",
                                                            values: [{
                                                                value: data[lastdate].expert_name
                                                            }]
                                                        },
                                                        {
                                                            id: "371277",
                                                            values: [{
                                                                value: lastdate
                                                            }]
                                                        }
                                                    ]
                                                }]
                                            }
                                        });
                                        // $.ajax({
                                        //     url: hostingurl,
                                        //     type: 'POST',
                                        //     datatype: 'json',
                                        //     data: {
                                        //         "action": "get_filled_fields",
                                        //         "card_id": curr_card
                                        //     },
                                        //     success: (data) => {
                                        //         $("#qc_comment").val(data[0] ? data[0]['notice'] : '');
                                        //         for (let key in data[0]) {
                                        //             if (data[0][key] == "1") $(`input[data-id='${key}'`).prop("checked", true);
                                        //         }
                                        //
                                        //         function summary() {
                                        //             let green = 0,
                                        //                 red = 0;
                                        //             $(".summary .green")[0].innerText = "0";
                                        //             $(".summary .red")[0].innerText = "0";
                                        //             num_checkboxes = $(".checkbox_qc").length;
                                        //             for (let i = 0; i < num_checkboxes; i++) {
                                        //                 if ($($('.row_for_choose input')[i]).prop("checked")) {
                                        //                     green += parseInt($($('.green')[i]).text());
                                        //                     red += parseInt($($('.red')[i]).text());
                                        //                 }
                                        //             }
                                        //             $($(".summary .green")[0]).text(green);
                                        //             $($(".summary .red")[0]).text(red);
                                        //             localStorage.setItem("plus_all", $($(".summary .green")[0]).text());
                                        //             localStorage.setItem("minus_all", $($(".summary .red")[0]).text());
                                        //         }
                                        //         summary();
                                        //         $(".checkbox_qc").on("click", () => {
                                        //             summary();
                                        //         });
                                        //
                                        //     }
                                        // });
                                    }
                                    else{
                                        $.ajax({
                                            url: "/api/v2/leads",
                                            datatype: "json",
                                            type: "post",
                                            data: {
                                                update: [{
                                                    id: curr_card,
                                                    updated_at: Date.now(),
                                                    custom_fields: [{
                                                        id: "370497",
                                                        values: [{
                                                            value: ''
                                                        }]
                                                    },
                                                        {
                                                            id: "371275",
                                                            values: [{
                                                                value: ''
                                                            }]
                                                        },
                                                        {
                                                            id: "371277",
                                                            values: [{
                                                                value: ''
                                                            }]
                                                        }
                                                    ]
                                                }]
                                            }
                                        });

                                    }
                                },
                                error: function (data) {
                                    console.log('otvif error');
                                    console.log(data);
                                    flagprov = data;
                                    console.log(data.responseText);
                                }
                            });
                        });
                        qc_field.addEventListener("click", function() {
                            $.ajax({
                                url: '/api/v2/leads?id=' + curr_card,
                                type: 'GET',
                                dataType: 'json',
                                success: function(data) {
                                    console.log(data);
                                    // let arry = [];
                                    // $.each(data, (key, val) => {
                                    //   arry.push(val)
                                    // });
                                    // if (Object.keys(arry[1].items[0].custom_fields).length && arry[1].items[0].custom_fields[0].id == "370497") {
                                    //   var text_qc = arry[1].items[0].custom_fields[0].values[0].value;
                                    // } else {
                                    //   var text_qc = '';
                                    // }
                                    console.log(hostingurl);
                                    console.log(otv_id);
                                    $.ajax({
                                        url: hostingurl,
                                        type: 'POST',
                                        datatype: "json",
                                        data: {
                                            "action": "get_qc_fields",
                                            "card_id": curr_card,
                                            "mng_id": otv_id
                                        },
                                        success: function (data) {
                                            console.log('get_qc_fields');
                                            console.log(data);
                                            let cats = '';
                                            for (let i = 0; i < data['cat'].length; i++) {
                                                let rows = '';
                                                for (let j = 0; j < data['res'].length; j++) {
                                                    for (let h = 0; h < data['m_m'].length; h++) {
                                                        if (data['cat'][i]['id'] == data['m_m'][h]['id_categori'] && data['m_m'][h]['id_quality'] == data['res'][j]['id']){
                                                            rows += '<tr class="row_for_choose"><td><input type="checkbox" class="checkbox_qc" id="id' + data['res'][j]['id'] + '" data-id=' + data['res'][j]['id'] + '></td><td class="forover"><label for="id' + data['res'][j]['id'] + '">' + data['res'][j]['name'] + '</label></td><td class="green" data-id=' + data['res'][j]['id'] + '>' + data['res'][j]['plus'] + '</td><td class="red" data-id=' + data['res'][j]['id'] + '>' + data['res'][j]['minus'] + '</td></tr>';
                                                        }
                                                    }
                                                }
                                            // <label for="id' + data['cat'][i]['id'] + '">' + data['cat'][i]['name_categori'] + '</label>
                                                cats += '<li>' + data['cat'][i]['name_categori'] + '<ul hidden><table id="modul_table">'  +rows + '</table></ul></li><br>';
                                            }
                                            var html_data = '<span style="font-size: 18px;position: relative;left: 90px;font-weight:bold;">Грех &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Бонус &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Штраф </span><ul class="list" id="list">' + cats + '</ul><table id="modul_table"><tr class="summary"><td colspan="2">Итого:</td><td class="green">0</td><td class="red">0</td></table><br><textarea id="report" style = "color: black;border-radius: 10px;padding: 10px;width: 399px; min-height: 100px !important;max-height: 300px !important;resize: vertical;border: 1px gray solid;word-break: break-word; background: lightyellow;" placeholder="Менеджер не протестовал" disabled>' + data['custom']['report'] + '</textarea><br><textarea placeholder="Напишите комментарий" id="qc_comment">' + data['custom']['notice'] + '</textarea><br><br><button id="save_qc" style="width:420px; cursor: pointer; border-radius: 10px;">Покарать</button><br><br><button id="delete_qc" style="width:420px; cursor: pointer; border-radius: 10px;">Удалить</button>';
                                            console.log('modal = new Modal');
                                            modal = new Modal({
                                                class_name: 'modal-window opened_modal_qc',
                                                init: function ($modal_body) {
                                                    var $this = $(this);
                                                    $modal_body
                                                        .trigger('modal:loaded') //запускает отображение модального окна
                                                        .html(html_data)
                                                        .trigger('modal:centrify') //настраивает модальное окно
                                                        .append('<span class="modal-body__close" id="close_qc"><span class="icon icon-modal-close"></span></span>');
                                                    $("#save_qc").on("click", () => {
                                                        var d = new Date(),
                                                            curr_date = d.getDate(),
                                                            curr_month = d.getMonth() + 1,
                                                            curr_year = d.getFullYear(),
                                                            curr_hours = d.getHours(),
                                                            curr_minutes = d.getMinutes();
                                                        let is_checked = 0,
                                                            is_comment, comment = $("#qc_comment").val(),
                                                            num_checkboxes = $(".checkbox_qc").length,
                                                            checkbox_name = [],
                                                            checkbox_val = [];
                                                        for (let i = 0; i < num_checkboxes; i++) {
                                                            checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                                            if ($(".checkbox_qc")[i].checked) { //checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                                                checkbox_val.push(1);
                                                                is_checked = 1;
                                                            } else {
                                                                checkbox_val.push(0);
                                                            }
                                                        }

                                                        $.ajax({
                                                            url: '/api/v2/leads',
                                                            type: 'POST',
                                                            dataType: 'json',
                                                            data: {
                                                                update: [{
                                                                    id: curr_card,
                                                                    updated_at: Date.now(),
                                                                    custom_fields: [{
                                                                        id: "370497",
                                                                        values: [{
                                                                            value: 'Есть'
                                                                        }]
                                                                    },
                                                                        {
                                                                            id: "371275",
                                                                            values: [{
                                                                                value: user_name
                                                                            }]
                                                                        },
                                                                        {
                                                                            id: "371277",
                                                                            values: [{
                                                                                value: curr_hours + ":" + curr_minutes + ", " + curr_date + "/" + curr_month + "/" + curr_year
                                                                            }]
                                                                        }
                                                                    ]
                                                                }]
                                                            }
                                                        }).done((date) => {
                                                            $.ajax({
                                                                url: hostingurl,
                                                                type: 'POST',
                                                                datatype: 'json',
                                                                data: {
                                                                    "action": "insert_warning",
                                                                    "data": {
                                                                        "card_id": curr_card,
                                                                        "comment": comment,
                                                                        "checkbox_name": checkbox_name,
                                                                        "checkbox_val": checkbox_val,
                                                                        "expert_id": curr_user,
                                                                        "mng_id": otv_id,
                                                                        "expert_name": user_name,
                                                                        "mng_name": mng_name,
                                                                        "plus": parseInt(localStorage.getItem("plus_all")),
                                                                        "minus": parseInt(localStorage.getItem("minus_all"))
                                                                    }
                                                                },
                                                                success: (d)=>{
                                                                    console.log(d);
                                                                    alert("Наказать ?");
                                                                    console.log(d);
                                                                },
                                                                error: function(d){
                                                                    console.log(d);
                                                                    alert("Наказать ?");
                                                                    console.log(d);
                                                                }
                                                            });
                                                        }).fail(()=>{
                                                            alert("Наказать ?");
                                                            console.log("failed");
                                                        });
                                                        window.setTimeout(close,10000 );
                                                        close();
                                                        function close(){
                                                        $("#close_qc").trigger("click");
                                                        document.location.reload(true);
                                                        }
                                                    });

                                                    $("#delete_qc").on("click", () => {
                                                        $.ajax({
                                                            url: "/api/v2/leads",
                                                            datatype: "json",
                                                            type: "post",
                                                            data: {
                                                                update: [{
                                                                    id: curr_card,
                                                                    updated_at: Date.now(),
                                                                    custom_fields: [{
                                                                        id: "370497",
                                                                        values: [{
                                                                            value: ''
                                                                        }]
                                                                    },
                                                                        {
                                                                            id: "371275",
                                                                            values: [{
                                                                                value: ''
                                                                            }]
                                                                        },
                                                                        {
                                                                            id: "371277",
                                                                            values: [{
                                                                                value: ''
                                                                            }]
                                                                        }
                                                                    ]
                                                                }]
                                                            },
                                                            success: () => {
                                                                $.ajax({
                                                                    url: hostingurl,
                                                                    type: 'POST',
                                                                    datatype: 'json',
                                                                    data: {
                                                                        "action": "delete warning",
                                                                        "data": {
                                                                            "card_id": curr_card,
                                                                            "otv_id": otv_id
                                                                        }
                                                                    }
                                                                });
                                                            }

                                                        });
                                                        window.setTimeout(close,10000 );
                                                        close();
                                                        function close(){
                                                            $("#close_qc").trigger("click");
                                                            document.location.reload(true);
                                                        }
                                                    });
                                                }
                                            });
                                            // list.querySelectorAll('li').target.parentNode.querySelector('ul').hidden;
                                            for (let li of list.querySelectorAll('li')) {
                                                let span = document.createElement('span'); /* создание span */
                                                span.classList.add('show'); /* добавление класса для span */
                                                li.prepend(span); /* вставить span внутри li */
                                                span.append(span.nextSibling) /* присоединить к span следующий узел */
                                            }
                                            list.onclick = function(event) {
                                                if (event.target.tagName != 'SPAN') return;
                                                console.log('event');
                                                console.log(event);
                                                let childrenList = event.target.parentNode.querySelector('ul');
                                                console.log('childrenList');
                                                console.log(childrenList);
                                                if (!childrenList) return;
                                                childrenList.hidden = !childrenList.hidden;

                                                if (childrenList.hidden) {
                                                    console.log('if childrenList.hidden');
                                                    console.log(childrenList.hidden);
                                                    // event.target.classList.add('hide');
                                                    // event.target.classList.remove('show');
                                                }

                                                else {
                                                    console.log('else');
                                                    event.target.classList.add('show');
                                                    event.target.classList.remove('hide');
                                                }
                                            }
                                            $.ajax({
                                                url: hostingurl,
                                                type: 'POST',
                                                datatype: 'json',
                                                data: {
                                                    "action": "get_filled_fields",
                                                    "card_id": curr_card,
                                                    "otv_id": otv_id
                                                },
                                                success: (data) => {
                                                    console.log(data);
                                                    let lastpiy = (data.length - 1);
                                                    console.log(lastpiy);
                                                    console.log('get_filled_fields success');
                                                    if (data.length > 1) {
                                                        for ($i = 0;$i<(data.length - 1);$i++) {
                                                            divhistory = $("#report").before("<span id='spandivhistory'></span>");
                                                            let intdivhistory = data[$i]['notice']+'<br>';
                                                            $('#spandivhistory').append(intdivhistory);
                                                        }
                                                    }
                                                    $("#qc_comment").val(data[lastpiy] ? data[lastpiy]['notice'] : '');
                                                    for (let key in data[lastpiy]) {
                                                        if (data[lastpiy][key] == "1") $(`input[data-id='${key}'`).prop("checked", true);
                                                    }

                                                    function summary() {
                                                        let green = 0,
                                                            red = 0;
                                                        $(".summary .green")[0].innerText = "0";
                                                        $(".summary .red")[0].innerText = "0";
                                                        num_checkboxes = $(".checkbox_qc").length;
                                                        for (let i = 0; i < num_checkboxes; i++) {
                                                            if ($($('.row_for_choose input')[i]).prop("checked")) {
                                                                green += parseInt($($('.green')[i]).text());
                                                                red += parseInt($($('.red')[i]).text());
                                                            }
                                                        }
                                                        $($(".summary .green")[0]).text(green);
                                                        $($(".summary .red")[0]).text(red);
                                                        localStorage.setItem("plus_all", $($(".summary .green")[0]).text());
                                                        localStorage.setItem("minus_all", $($(".summary .red")[0]).text());
                                                    }
                                                    summary();
                                                    $(".checkbox_qc").on("click", () => {
                                                        summary();
                                                    });

                                                }
                                            });

                                        },
                                        error: function (data) {
                                            console.log('get_qc_fields error');
                                            console.log(data);
                                            console.log(data.responseText);
                                        }
                                    });
                                }
                            });
                        });
                    } // ЕСЛИ АДМИН, ДЕВЕЛОПЕР ИЛИ КК
                    else { //ЕСЛИ МЕНЕДЖЕР
                        $("input[name='CFV[577625]']").parent().parent().parent().css("display", "none");
                        // let otv_id = AMOCRM.data.current_card.user.id;
                        // if (otv_id == curr_user){
                        //     const lastdate = data[data.length - 1].date;
                        $.ajax({
                            url: hostingurl,
                            type: 'POST',
                            datatype: 'json',
                            data: {
                                "action": "otvif",
                                "card_id": curr_card,
                                "otv_id": user_id,
                                "curr_user": curr_user
                            }, success: (data) => {
                                console.log('success otvif');
                                flagprov = data;
                                console.log(data);
                                if (data.length >= 1){
                                    const lastdate = data[data.length - 1].date;
                                    let is_checked = 0,
                                        is_comment, comment = $("#qc_comment").val(),
                                        num_checkboxes = $(".checkbox_qc").length,
                                        checkbox_name = [],
                                        checkbox_val = [];
                                    for (let i = 0; i < num_checkboxes; i++) {
                                        checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                        if ($(".checkbox_qc")[i].checked) { //checkbox_name.push($(".checkbox_qc")[i].getAttribute("data-id"));
                                            checkbox_val.push(1);
                                            is_checked = 1;
                                        } else {
                                            checkbox_val.push(0);
                                        }
                                    }
                                    $.ajax({
                                        url: '/api/v2/leads',
                                        type: 'POST',
                                        dataType: 'json',
                                        data: {
                                            update: [{
                                                id: curr_card,
                                                updated_at: Date.now(),
                                                custom_fields: [{
                                                    id: "370497",
                                                    values: [{
                                                        value: 'Есть'
                                                    }]
                                                },
                                                    {
                                                        id: "371275",
                                                        values: [{
                                                            value: data[lastdate].expert_name
                                                        }]
                                                    },
                                                    {
                                                        id: "371277",
                                                        values: [{
                                                            value: lastdate
                                                        }]
                                                    }
                                                ]
                                            }]
                                        }
                                    });
                                    // $.ajax({
                                    //     url: hostingurl,
                                    //     type: 'POST',
                                    //     datatype: 'json',
                                    //     data: {
                                    //         "action": "get_filled_fields",
                                    //         "card_id": curr_card
                                    //     },
                                    //     success: (data) => {
                                    //         $("#qc_comment").val(data[0] ? data[0]['notice'] : '');
                                    //         for (let key in data[0]) {
                                    //             if (data[0][key] == "1") $(`input[data-id='${key}'`).prop("checked", true);
                                    //         }
                                    //
                                    //         function summary() {
                                    //             let green = 0,
                                    //                 red = 0;
                                    //             $(".summary .green")[0].innerText = "0";
                                    //             $(".summary .red")[0].innerText = "0";
                                    //             num_checkboxes = $(".checkbox_qc").length;
                                    //             for (let i = 0; i < num_checkboxes; i++) {
                                    //                 if ($($('.row_for_choose input')[i]).prop("checked")) {
                                    //                     green += parseInt($($('.green')[i]).text());
                                    //                     red += parseInt($($('.red')[i]).text());
                                    //                 }
                                    //             }
                                    //             $($(".summary .green")[0]).text(green);
                                    //             $($(".summary .red")[0]).text(red);
                                    //             localStorage.setItem("plus_all", $($(".summary .green")[0]).text());
                                    //             localStorage.setItem("minus_all", $($(".summary .red")[0]).text());
                                    //         }
                                    //         summary();
                                    //         $(".checkbox_qc").on("click", () => {
                                    //             summary();
                                    //         });
                                    //
                                    //     }
                                    // });
                                }
                                else{
                                    $.ajax({
                                        url: "/api/v2/leads",
                                        datatype: "json",
                                        type: "post",
                                        data: {
                                            update: [{
                                                id: curr_card,
                                                updated_at: Date.now(),
                                                custom_fields: [{
                                                    id: "370497",
                                                    values: [{
                                                        value: ''
                                                    }]
                                                },
                                                    {
                                                        id: "371275",
                                                        values: [{
                                                            value: ''
                                                        }]
                                                    },
                                                    {
                                                        id: "371277",
                                                        values: [{
                                                            value: ''
                                                        }]
                                                    }
                                                ]
                                            }]
                                        }
                                    });

                                }
                            },
                            error: function (data) {
                                console.log('otvif error');
                                console.log(data);
                                flagprov = data;
                                console.log(data.responseText);
                            }
                        });
                            qc_field.addEventListener("click", function() {
                                $.ajax({
                                    url: hostingurl,
                                    type: 'POST',
                                    datatype: 'json',
                                    data: {
                                        "action": "get_filled_fields_for_manager",
                                        "card_id": curr_card,
                                        "otv_id": user_id,
                                        "curr_user": curr_user
                                    },
                                    success: (data) => {
                                        console.log('get_filled_fields_for_manager');
                                        console.log(data);
                                        let rows = '';
                                        for (let obj in data) {
                                            if (obj != 'custom')
                                                rows += '<tr class="row_for_choose"><td><p>' + data[obj]['name'] + '</p></td><td class="red">' + data[obj]['minus'] + '</td></tr>';
                                        }
                                        let mng_notice = data['custom']['notice'] !== null ? data['custom']['notice'] : '';
                                        let mng_report = data['custom']['report'] !== null ? data['custom']['report'] : '';
                                        var html_data = '<table id="modul_table"><tr id="thead"><td>Грех</td><td>Штраф</td></tr>' + rows + '<tr class="summary"><td>Итого:</td><td class="red">0</td></tr></table> <br> <textarea id="notice" style = "color: black;border-radius: 10px;padding: 10px;width: 399px; min-height: 100px !important;max-height: 300px !important;resize: vertical;border: 1px gray solid;word-break: break-word; background: lightyellow;" placeholder="Дополнительных замечаний нет" disabled>' + mng_notice + '</textarea> <br>';
                                        // if (AMOCRM.data.current_card.main_user == curr_user)
                                            html_data += '<textarea placeholder="Напишите протест" id="qc_comment">' + mng_report + '</textarea><br><button id="save_qc" style="width:420px; cursor: pointer; border-radius: 10px;">Опровергнуть</button>';

                                        modal = new Modal({
                                            class_name: 'modal-window',
                                            init: function($modal_body) {
                                                var $this = $(this);
                                                $modal_body
                                                    .trigger('modal:loaded') //запускает отображение модального окна
                                                    .html(html_data)
                                                    .trigger('modal:centrify') //настраивает модальное окно
                                                    .append('<span class="modal-body__close" id="close_qc"><span class="icon icon-modal-close"></span></span>');
                                            }
                                        });

                                        let count_red = $(".row_for_choose .red").length,
                                            red_field = $(".row_for_choose .red"),
                                            shtraf = 0;
                                        for (let i = 0; i < count_red; i++) {
                                            shtraf += parseInt(red_field[i].innerText);
                                        }
                                        $(".summary .red")[0].innerText = shtraf;

                                        $("#save_qc").on("click", () => {
                                            $.ajax({
                                                url: hostingurl,
                                                datatype: 'json',
                                                type: 'POST',
                                                data: {
                                                    "action": "insert_report",
                                                    "report": $('#qc_comment').val(),
                                                    "card_id": curr_card,
                                                    "mng_id": user_id
                                                }
                                            });
                                            $("#close_qc").trigger("click");
                                            document.location.reload(true);
                                        });
                                    }
                                });
                            });
                        // }else{
                        //     $.ajax({
                        //         url: "/api/v2/leads",
                        //         datatype: "json",
                        //         type: "post",
                        //         data: {
                        //             update: [{
                        //                 id: curr_card,
                        //                 updated_at: Date.now(),
                        //                 custom_fields: [{
                        //                     id: "370497",
                        //                     values: [{
                        //                         value: ''
                        //                     }]
                        //                 },
                        //                     {
                        //                         id: "371275",
                        //                         values: [{
                        //                             value: ''
                        //                         }]
                        //                     },
                        //                     {
                        //                         id: "371277",
                        //                         values: [{
                        //                             value: ''
                        //                         }]
                        //                     }
                        //                 ]
                        //             }]
                        //         }
                        //     });

                        }
                    // } // ELSE
                    //});
                } //КОНЕЦ if(AMOCRM.data.current_entity == 'leads')
                return true;
            }, //КОНЕЦ init: function()
            destroy: function() {
                return true;
            },
            bind_actions: function() {
                return true;
            },
            settings: function() {
                return true;
            },
            onSave: function() {
                return true;
            },
            destroy: function() {

            },
            contacts: {
                //select contacts in list and clicked on widget name
                selected: function() {}
            },
            leads: {
                //select leads in list and clicked on widget name
                selected: function() {}
            },
            tasks: {
                //select taks in list and clicked on widget name
                selected: function() {}
            }
        };
        return this;
    };

    return CustomWidget;
});
