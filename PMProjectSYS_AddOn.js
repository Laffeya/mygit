// ==UserScript==
// @name         New Userscript
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
    function load() {
        $("<div class=\"datagrid-mask\" style='z-index: 999;'></div>").css({ display: "block", width: "100%", height: $(document).height() }).appendTo("body");
        $("<div class=\"datagrid-mask-msg\" style='z-index: 999;height: 18px; padding-top: 12px; font-size:13px;'></div>").html("处理中，请稍候· · ·").appendTo("body").css({ display: "block", left: ($(document.body).outerWidth(true) - 190) / 2, top: ($(document).height() - 45) / 2 });
    }
    //取消加载层  
    function disLoad() {
        $(".datagrid-mask").remove();
        $(".datagrid-mask-msg").remove();
    }
    //展示结果
    function showResult(data) {
        var map = ["/PMProject/style/easyui/themes/icons/cancel.png", "/PMProject/style/easyui/themes/icons/ok.png", "/PMProject/style/easyui/themes/icons/lock.png"];

        var win = $('#win1').window({
            title: '添加结果',
            width: 285,
            height: 350,
            top: ($(window).height() - 350) * 0.5,
            left: ($(window).width() - 820) * 0.5,
            shadow: true,
            modal: true,
            closed: true,
            minimizable: false,
            maximizable: false,
            collapsible: false,
            onClose: function() {
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
            load();

            var start = moment($('#workDate').val(), 'YYYY-MM-DD').add(-1, 'days');
            var end = moment($('#workDate2').val(), 'YYYY-MM-DD');
            var diff = moment.range(start, end).diff('days');
            if (diff >= 0) {
                var urlParams = "verbId=add&projectBaseinfoId=" + $('#projectBaseinfoId').val() + "&longTimeCode=" + $('#longTimeCode').combobox('getValue') + "&workStaffCode=" + $('#workStaffCode').val();
                var promises = [];
                for (var i = 1; i <= diff; i++) {
                    //$.ajax跟easyui的进度条有冲突，跟【处理中，请稍候· · ·】也有冲突，要等所有的ajax执行完了后才显示进度条或【处理中，请稍候· · ·】
                    /*
                    var workDate_ = start.add(1, 'days');
                    var workDate = workDate_.format('YYYY-MM-DD');
                    if (workDate_.weekday() == 0 || workDate_.weekday() == 6) {//周末
                        results.push([workDate, "2"])
                        continue;
                    }
                    $.ajax({
                        type: "POST",
                        url: location.origin + location.pathname,
                        data: urlParams + "&workDate=" + workDate,
                        async: false,
                        beforeSend: function(XHR){
                            load();
                        },
                        success: function (htmlStr) {
                            debugger;
                            if (htmlStr.indexOf("保存成功") > -1) {
                                results.push([workDate, "1"])
                            } else {
                                results.push([workDate, "0"])
                            }

                        },
                        error: function (data) {
                            results.push([workDate, "0"])
                        },
                        complete:function(){
                            disLoad();
                        }
                    });*/
                    promises.push(new Promise(function (resolve, reject) {
                        var workDate_ = start.add(1, 'days');
                        var workDate = workDate_.format('YYYY-MM-DD');
                        if (workDate_.weekday() == 0 || workDate_.weekday() == 6) {//周末
                            resolve({ 'week': '周' + $.fn.calendar.defaults.weeks[workDate_.weekday()], 'dat': workDate, 're': 2 });
                            return false;
                        }
                        parent.Ext.Ajax.request({
                            url: location.origin + location.pathname,
                            method: 'POST',
                            params: urlParams + "&workDate=" + workDate,
                            success: function (htmlStr, opts) {
                                var paramsObj = parent.Ext.urlDecode(opts.params);
                                var workDate = paramsObj.workDate;
                                var week = "周" + $.fn.calendar.defaults.weeks[moment(workDate, 'YYYY-MM-DD').weekday()];
                                if (htmlStr.responseText.indexOf("保存成功") > -1) {
                                    resolve({ 'week': week, 'dat': workDate, 're': 1 });
                                } else {
                                    resolve({ 'week': week, 'dat': workDate, 're': 0 });
                                }

                            },
                            failure: function (response, opts) {
                                var paramsObj = parent.Ext.urlDecode(opts.params)
                                var workDate = paramsObj.workDate;
                                var week = "周" + $.fn.calendar.defaults.weeks[moment(workDate, 'YYYY-MM-DD').weekday()];
                                resolve({ 'week': week, 'dat': workDate, 're': 0 });
                            }
                        });
                    }));
                }
                //展示结果
                Promise.all(promises).then(function (results) {
                    console.log(results);
                    disLoad();
                    showResult(results);
                });

            }

        });
    });


})();

