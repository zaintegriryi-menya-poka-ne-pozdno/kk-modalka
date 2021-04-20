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
                    let mng_name = document.getElementsByClassName('multisuggest__list-item js-multisuggest-item')[1];
                    mng_name = mng_name.dataset.title
                    // $.ajax({
                    //   url: '/api/v2/account?with=users',
                    //   type: 'GET',
                    //   dataType: 'json',
                    //   success: (data) => {
                    //     let arry = [];
                    //     $.each(data, (key, val) => {
                    //       arry.push(val)
                    //     });

                    var qc_field = $("textarea[name='CFV[370497]']").parent()[0];
                    $("textarea[name='CFV[370497]']").css("color", "red");
                    $("textarea[name='CFV[370497]']").removeAttr("placeholder").parent().css("cursor", "pointer").css("width", "20px").css("background", "aquamarine").css("border-radius", "50%").css("height", "20px").css("margin", "5px 0px 0 0");
                    console.log('перед IF (user_group == 216328)');
                    if (user_group == 216328) { //216328 -- kk
                        console.log('ДА это он (user_group == 216328)');
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
                                    $.ajax({
                                        url: hostingurl,
                                        type: 'POST',
                                        datatype: "json",
                                        data: {
                                            "action": "get_qc_fields",
                                            "card_id": curr_card
                                        },
                                        success: function (data) {
                                            console.log('get_qc_fields');
                                            console.log(data);
                                            let rows = '';
                                            for (let obj in data) {
                                                if (obj != 'custom')
                                                    rows += '<tr class="row_for_choose"><td><input type="checkbox" class="checkbox_qc" id="id' + data[obj]['id'] + '" data-id=' + data[obj]['id'] + '></td><td><label for="id' + data[obj]['id'] + '">' + data[obj]['name'] + '</label></td><td class="green" data-id=' + data[obj]['id'] + '>' + data[obj]['plus'] + '</td><td class="red" data-id=' + data[obj]['id'] + '>' + data[obj]['minus'] + '</td></tr>';
                                            }
                                            var html_data = '<table id="modul_table"><tr id="thead"><td><div class="fa fa-check-square-o"></div></td><td>Грех</td><td>Бонус</td><td>Штраф</td></tr>' + rows + '<tr class="summary"><td colspan="2">Итого:</td><td class="green">0</td><td class="red">0</td></tr></table> <br><textarea id="report" style = "color: black;border-radius: 10px;padding: 10px;width: 399px; min-height: 100px !important;max-height: 300px !important;resize: vertical;border: 1px gray solid;word-break: break-word; background: lightyellow;" placeholder="Менеджер не протестовал" disabled>' + data['custom']['report'] + '</textarea><br><textarea placeholder="Напишите комментарий" id="qc_comment">' + data['custom']['notice'] + '</textarea><br><br><button id="save_qc" style="width:420px; cursor: pointer; border-radius: 10px;">Покарать</button><br><br><button id="delete_qc" style="width:420px; cursor: pointer; border-radius: 10px;">Удалить</button>';
                                            console.log('modal = new Modal');
                                            modal = new Modal({
                                                class_name: 'modal-window opened_modal_qc',
                                                init: function($modal_body) {

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
                                                        }).done(() => {
                                                            $.ajax({
                                                                url: hostingurl,
                                                                type: 'POST',
                                                                datatype: 'json',
                                                                data: {
                                                                    "action": "insert warning",
                                                                    "data": {
                                                                        "card_id": curr_card,
                                                                        "comment": comment,
                                                                        "checkbox_name": checkbox_name,
                                                                        "checkbox_val": checkbox_val,
                                                                        "expert_id": curr_user,
                                                                        "mng_id": AMOCRM.data.current_card.main_user,
                                                                        "expert_name": user_name,
                                                                        "mng_name": mng_name,
                                                                        "plus": parseInt(localStorage.getItem("plus_all")),
                                                                        "minus": parseInt(localStorage.getItem("minus_all"))
                                                                    }
                                                                },
                                                                success: (d)=>{
                                                                    console.log(d)
                                                                }
                                                            });
                                                        }).fail(()=>{
                                                            console.log("failed");
                                                        });
                                                        $("#close_qc").trigger("click");
                                                        document.location.reload(true);
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
                                                                            "card_id": curr_card
                                                                        }
                                                                    }
                                                                });
                                                            }

                                                        });
                                                        $("#close_qc").trigger("click");
                                                        document.location.reload(true);
                                                    });
                                                }
                                            });

                                            $.ajax({
                                                url: hostingurl,
                                                type: 'POST',
                                                datatype: 'json',
                                                data: {
                                                    "action": "get_filled_fields",
                                                    "card_id": curr_card
                                                },
                                                success: (data) => {
                                                    $("#qc_comment").val(data[0] ? data[0]['notice'] : '');
                                                    for (let key in data[0]) {
                                                        if (data[0][key] == "1") $(`input[data-id='${key}'`).prop("checked", true);
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
                        qc_field.addEventListener("click", function() {
                            $.ajax({

                                url: hostingurl,
                                type: 'POST',
                                datatype: 'json',
                                data: {
                                    "action": "get_filled_fields_for_manager",
                                    "card_id": curr_card
                                },
                                success: (data) => {

                                    let rows = '';

                                    for (let obj in data) {
                                        if (obj != 'custom')
                                            rows += '<tr class="row_for_choose"><td><p>' + data[obj]['name'] + '</p></td><td class="red">' + data[obj]['minus'] + '</td></tr>';
                                    }
                                    let mng_notice = data['custom']['notice'] !== null ? data['custom']['notice'] : '';
                                    let mng_report = data['custom']['report'] !== null ? data['custom']['report'] : '';
                                    var html_data = '<table id="modul_table"><tr id="thead"><td>Грех</td><td>Штраф</td></tr>' + rows + '<tr class="summary"><td>Итого:</td><td class="red">0</td></tr></table> <br> <textarea id="notice" style = "color: black;border-radius: 10px;padding: 10px;width: 399px; min-height: 100px !important;max-height: 300px !important;resize: vertical;border: 1px gray solid;word-break: break-word; background: lightyellow;" placeholder="Дополнительных замечаний нет" disabled>' + mng_notice + '</textarea> <br>';
                                    if (AMOCRM.data.current_card.main_user == curr_user) html_data += '<textarea placeholder="Напишите протест" id="qc_comment">' + mng_report + '</textarea><br><button id="save_qc" style="width:420px; cursor: pointer; border-radius: 10px;">Опровергнуть</button>';

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
                                                "card_id": curr_card
                                            }
                                        });
                                        $("#close_qc").trigger("click");
                                        document.location.reload(true);
                                    });
                                }
                            });
                        });
                    } // ELSE
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
