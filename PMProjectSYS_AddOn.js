// ==UserScript==
// @name         PMProjectSYS
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://*/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    // Your code here...
    //弹出加载层
    $.fn.mask = function (msg) {
        var target = $(this);
        var height = target.get(0).scrollHeight;
        var width = target.width();
        $("<div class='datagrid-mask'>").css({ display: "block", height: height }).appendTo(target);
        $("<div class='datagrid-mask-msg'>").css({ display: "block", left: (width - 190) / 2, top: height - $(window).height() / 2 }).text(msg ? msg : "处理中，请稍候· · ·").appendTo(target);
    }
    //取消加载层  
    $.fn.unmask = function () {
        $(this).children("div.datagrid-mask").remove();
        $(this).children("div.datagrid-mask-msg").remove();
    }
    //展示结果
    function showResult(data) {
        var map = ["/PMProject/style/easyui/themes/icons/cancel.png", "/PMProject/style/easyui/themes/icons/ok.png", "/PMProject/style/easyui/themes/icons/lock.png"];

        var win = $('#win1').window({
            title: '添加结果',
            width: 285,
            height: 350,
            left: ($(window).width() - 190) / 2,
            top: document.body.scrollHeight - $(window).height() / 2 - 180,
            shadow: true,
            modal: true,
            closed: true,
            minimizable: false,
            maximizable: false,
            collapsible: false,
            onClose: function () {
                $('#startTimeHidden').val(data[0].dat);
                $('#endTimeHidden').val(data.pop().dat);
                clearSelect();
                query_button();
            }
        });
        $('#win1').window('open');

        $('#dg1').datagrid({

            nowrap: false,
            striped: true,
            remoteSort: false,
            fitColumns: true,
            height: 340,
            data: data,
            columns: [[{
                field: 'week',
                title: '星期',
                align: 'center',
                width: 90
            }, {
                field: 'dat',
                title: '日期',
                align: 'center',
                width: 90
            }, {
                field: 're',
                title: '结果',
                align: 'center',
                width: 105,
                formatter: function (value, row, index) {
                    return "<img src='" + map[value] + "'/>";
                }
            }]],

        });

    }
    $(function () {
        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js', function () {
            $.getScript('https://cdnjs.cloudflare.com/ajax/libs/moment-range/4.0.2/moment-range.js', function () {
                window['moment-range'].extendMoment(moment);
            });
        });

        $('#date_input3').parent().after(`<input type="text" name="workDate2" id="workDate2" class="text"
							    value='' validtype="date"
								onblur="fEvent('blur',this)"
								onmouseover="fEvent('mouseover',this)"
								onfocus="fEvent('focus',this)" required="true"
								onmouseout="fEvent('mouseout',this)"
								onchange="getTaskByDate()"
								/>
				  			<span  class="calendarspan">
				  			<img id="date_input4" src="/PMProject/style/img/calendar_button.gif" class="calendarimg"/></span>`);
        cal.manageFields("date_input4", "workDate2", "%Y-%m-%d");
        $('.crm_button_sub').prepend(`<input type = "button" value="添加多条" id="addMuti" class="button_blue1_s0"/>`);
        $("#win").after(`<div id="win1" class="easyui-window" closed="true" title="" style="overflow: hidden;"><table id="dg1"></table></div>`);
        $('#addMuti').click(function () {
            if (!($.trim($('#workDate2').val()) && $.trim($('#workDate').val()))) {
                $.messager.alert('提示', '请选择日期!');
                return false;
            }
            $(document.body).mask();
            var range = moment.range($('#workDate').val(), $('#workDate2').val());
            var days = Array.from(range.by("days"), el => el.format('YYYY-MM-DD')).join(","); //2019-04-04,2019-04-05...
            // $.get("http://tool.bitefu.net/jiari/?d=" , function (json) {  //No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://123.126.109.38:60101' is therefore not allowed access.
            $.ajax({
                url: "http://timor.tech/api/holiday/batch",
                data: "d=" + days,
                success: function (json) {
                    var holiday = json.holiday;
                    var urlParams = "verbId=add&projectBaseinfoId=" + $('#projectBaseinfoId').val() + "&longTimeCode=" + $('#longTimeCode').combobox('getValue') + "&workStaffCode=" + $('#workStaffCode').val();
                    var results = [];
                    $.each(json.holiday, (workDate, re) => {
                        var workDate_ = moment(workDate, "YYYY-MM-DD");
                        var week = "周" + $.fn.calendar.defaults.weeks[workDate_.weekday()];
                        if ((re && re.holiday) || (!re && (workDate_.weekday() == 0 || workDate_.weekday() == 6))) {//节假日、周末
                            results.push({ 'week': week, 'dat': workDate, 're': 2 });
                        } else {
                            $.ajax({
                                url: location.origin + location.pathname,
                                data: urlParams + "&workDate=" + workDate,
                                async: false,
                                success: function (htmlStr, opts) {
                                    if (htmlStr.indexOf("保存成功") > -1) {
                                        results.push({ 'week': week, 'dat': workDate, 're': 1 });
                                    } else {
                                        results.push({ 'week': week, 'dat': workDate, 're': 0 });
                                    }

                                },
                                error: function (response, opts) {
                                    results.push({ 'week': week, 'dat': workDate, 're': 0 });
                                }
                            });
                        }
                    }); //$.each
                    //展示结果
                    /*Promise.all(promises).then(function (results) {
                        console.log(results);
                        $(document.body).unmask();
                        showResult(results);
                    });*/
                    $(document.body).unmask();
                    showResult(results);
                }
            });

        });
    });


})();

