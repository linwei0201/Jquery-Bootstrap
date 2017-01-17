define("ListView", function(){
    var Clazz = require("base");
    var ListView = Clazz.extend({
        _options: {},
        _table : {},
        actions: {
            dateRange: function(params) {

                $(".select").each(function() {
                    var $m = $(this);
                    $m.val('');
                });

                $("input[name='search']").val('');

                if(params == 'seven') {
                    g_conf.s_date = moment().subtract(7, 'days').format('YYYY/MM/DD');
                    g_conf.e_date = moment().subtract(0, 'days').format('YYYY/MM/DD');

                    $('#date_start').html(g_conf.s_date);
                    $('#date_end').html(g_conf.e_date);

                } else {
                    g_conf.s_date = '';
                    g_conf.e_date = '';

                    $('#date_start').html('开始时间');
                    $('#date_end').html('截止时间');
                }

                this.render();
            },
            search: function() {
                this.render();
            },
            clearTime: function(params, jsonStr, $m, e) {
                g_conf.s_date = '';
                g_conf.e_date = '';

                $('#date_start').html('');
                $('#date_end').html('');

                e.stopPropagation();

                this.render();
            },
            curd: function(params, jsonStr, $m) {
                var self = this;
                var commitData = {
                    content_id: JSON.parse($m.closest('.tr').attr("data-json")).id,
                    id: JSON.parse($m.closest('.tr').attr("data-json")).id,
                    action: jsonStr.action
                }
                var msg = "你确定要" + jsonStr.tip + "吗？";
                $.confirm(msg, function(){
                    $.ajax({
                        url: '/' + self._options["type"] + '/' + params,
                        data: commitData,
                        success: function(data){
                            if(!data.errno){
                                $.alert(jsonStr.tip + "成功！", function(){
                                    self.render();
                                });
                            }else if(data.errno == "21602"){
                                $.alert(jsonStr.tip + "失败，包含敏感词：" + data.data.join(","));
                            }else{
                                $.alert(jsonStr.tip + "失败，失败信息：" + data.errMsg);
                            }

                        },
                        error: function(data){
                            $.alert(jsonStr.tip + "失败，失败信息：" + data.errMsg);
                        }
                    })
                })
            },
            putup: function(params, jsonStr, $m){
                var self = this;
                if(!$("#citySelect").attr("val")){
                    $.alert("请选择城市！");
                    return;
                }
                var commitData = {
                    content_id: JSON.parse($m.closest('.tr').attr("data-json")).id,
                    id: JSON.parse($m.closest('.tr').attr("data-json")).id,
                    level1_id: $("#levelSelect").attr("val"),
                    level2_id: $("#levelSelect2").attr("val"),
                    city: $("#citySelect").attr("val")
                }
                var msg = "", suffix="";
                if(jsonStr.tip == "置顶")
                {
                    suffix += this._options["typeName"] +"-"+ $("#citySelect").find(".selected > span").html();
                    if(commitData.level1_id){
                        suffix += "-" + $("#levelSelect").find(".selected > span").html();
                    }
                    if(commitData.level2_id){
                        suffix += "-" + $("#levelSelect2").find(".selected > span").html();
                    }
                    suffix += "下";
                    msg = "你确定要置顶到" + suffix + "?";
                } else if(jsonStr.tip == "取消置顶") {
                    msg = "你确定要取消置顶？"
                }
                $.confirm(msg, function(){
                    $.ajax({
                        'url': '/' + self._options["type"] + '/' + params,
                        'data': commitData,
                        'success': function(data) {
                            $.alert(jsonStr.tip + "成功！", function(){
                               self.render();
                            });
                        },
                        'error': function(data) {
                            $.alert(jsonStr.tip + "失败，失败信息：" + data.errMsg);
                        }
                    })
                })


            }

        },
        init: function(options, callback){
            this._options = options;
            this._table = this.getTable();
            this.setTitle();
            this.getLists();
            this.render();
            this.initListeners();
            if($.isFunction(callback)){
                callback.apply(this);
            }
        },
        setTitle: function(){
            if(this._options["title"])
                $(".login-msg .logout").before('<span class="page--title">'+this._options["title"]+'</span>');

            if(!this._options["label"] || !this._options["btn-url"])
                return;

            $(".big-btn").html(this._options["label"])
                         .attr("href", this._options["btn-url"]);
        },
        getTable: function(){
            var TableView = require("TableView");
            var table = new TableView({});
            table.format = function(data) {

                return data.data;
            };
            return table;
        },
        getLists: function(){
            var self = this;
            if(self._options["channel"]){
                $.ajax({
                    url: self._options["channel"]
                }).then(function(data) {
                    var tpl = '';
                    $.each(data.data, function(k, v) {
                        tpl += '<label class="radio"><input type="radio" name="category_id" value="'+v.id+'"/>'+v.name+'</label>';
                    });
                    $(".pub-tool .pub-channel .content").append(tpl);

                });
            }

            if(this._options["countries"]){
                $.ajax({
                    url: this._options["countries"]
                }).then(function(data) {
                    if(data && data.data) {
                        var ret = '';
                        $.each(data.data, function(k, v){
                            ret += '<li value="' + v.id + '">' + v.name + '</li>';
                        });
                        $("#countrySelect .options").append(ret);
                    }
                });
            }

            //1. city
            if(this._options["cities"]){
                $.ajax({
                    url: this._options["cities"]
                }).then(function(data) {
                    if(data && data.data) {
                        for(var i in data.data) {
                            if(data.data.hasOwnProperty(i)) {
                                var ret = '';
                                var city_checks = '';
                                for(var k in data.data[i]) {
                                    if(data.data[i].hasOwnProperty(k)) {

                                        ret += '<li value="' + k + '">' + data.data[i][k] + '</li>';
                                        city_checks += "<label class='checkbox'><input type='checkbox' name='city_ids' value='"+k+"'>"+data.data[i][k]+"</label>";
                                    }
                                }
                                $("#citySelect .options").append(ret);
                                $("#exportCity .options").append(ret);
                                $(".pub-tool .pub-city .content").append(city_checks);
                            }
                        }
                    }
                });
            }

            //2. level1
            if(this._options["level1"]){
                $.ajax({
                    url: this._options["level1"]
                }).then(function(data) {
                    if(data && data.data) {
                        var ret = '';
                        $.each(data.data, function(k, v) {
                            ret += '<li value="' + v['id'] + '">' + v['name'] + '</li>';
                        });

                        $("#levelSelect .options").append(ret);
                        $("#level1 .options").append(ret);
                    }
                });
            }

            //3. time_picker
            $('#two-inputs').dateRangePicker({
                separator : ' ~ ',
                format: 'YYYY/MM/DD',
                minDays: 0,
                endDate: moment().subtract(0, 'days').format('YYYY-MM-DD'),
                getValue: function()
                {
                    if ($('#date_start').html() && $('#date_end').html() )
                        return $('#date_start').html() + ' ~ ' + $('#date_end').html();
                    else
                        return '';
                },
                setValue: function(s,s1,s2)
                {
                    g_conf.s_date = s1;
                    g_conf.e_date = s2;

                    $('#date_start').html(s1);
                    $('#date_end').html(s2);
                }
            }).on("datepicker-apply", function(e) {
                self.render();
            });


            //4. status
            if(this._options["status"]){
                $.ajax({
                    url: this._options["status"]
                }).then(function(data) {
                    if(data && data.data) {
                        var ret = '';

                        for(var i in data.data) {
                            if(data.data.hasOwnProperty(i)) {
                                ret += '<li value="' + i + '">' + data.data[i] + '</li>';
                            }
                        }

                        $("#statusSelect .options").append(ret);
                    }
                });
            }

            //5. redian => appid
            if(this._options["appid"]){
                $.ajax({
                    url: this._options["appid"]
                }).then(function(data){
                    var list = "";
                    $.each(data.data, function(k, v){
                        list += "<li value='" + k + "'>" + v + "</li>";
                    })
                    $("#appidSelect .options").append(list);

                });
            }

            //6 交易类型，所在流程
            if(self._options["dealTypes"]){
                $.ajax({
                    url: self._options["dealTypes"]
                }).then(function(data){
                    var list = "";
                    $.each(data.data, function(k, v){
                        list += "<li value='" + k + "'>" + v + "</li>";
                    })
                    $("[name='deal_type'] .options").append(list);

                });
            }

            if(self._options["process"]){
                $.ajax({
                    url: self._options["process"]
                }).then(function(data){
                    var list = "";
                    $.each(data.data, function(k, v){
                        list += "<li value='" + k + "'>" + v + "</li>";
                    })
                    $("[name='process'] .options").append(list);

                });
            }

            if(self._options["countries"]){
                $.ajax({
                    "url": self._options["countries"],
                    "dataType": "json"
                }).then(function(data){
                    var tpl = '';
                    $.each(data.data, function(k, v){
                        tpl += '<label class="checkbox"><input type="checkbox" name="country_ids" value="'+v.id+'" />'+v.name+'</label>'
                    });
                    $(".pub-tool .pub-country .content").append(tpl);
                })
            }
        },
        render: function(options){

            var _options = {};
            $(".dropdown:visible").each(function() {
                var $m = $(this);
                _options[$m.attr("name")] = $m.attr("val");
            });
            $(".input").each(function(){
                _options[$(this).attr("name")] = $.trim($(this).val());
            })
            _options.from_time = (g_conf.s_date||'').replace(/\//g, '-');
            _options.to_time = (g_conf.e_date||'').replace(/\//g, '-');

            options = $.extend(_options, options);
            this._table.init({
                url: this._options["search"],
                params: options
            });
        },
        initListeners: function(){
            var self = this;
            //data-action on tables
            $("#main").on("mousedown", "[data-action]", function(e) {
                var router = $(this).attr("data-action");
                var jsonParams = $(this).attr("data-action_json") || '';
                var jsonObj = {

                };

                $.each(jsonParams.split("&"), function(k ,v) {
                    v && (jsonObj[v.split("=")[0]] =v.split("=")[1]);
                });

                self.actions[router].call(self, $(this).attr("data-action_params"), jsonObj, $(this), e);
            });

            //level1changes  //search filters
            $(".dropdown").on("change", function() {

                if($(this).attr("id") == 'levelSelect') {
                    self.getLevel2($(this).attr("val"), $("#levelSelect2"));
                }

                self.render();
            });



            //export button
            $(".export-btn").on("click", function(){
                $(".export-content").popup({}, function(){
                    $('#modal #two-inputs').dateRangePicker({
                        separator : ' ~ ',
                        format: 'YYYY/MM/DD',
                        /*maxDays: 60,
                        startDate: '2016-03-01',*/
                        container: $('#modal .export-content .date-picker-wrap'),
                        minDays: 0,
                        endDate: moment().subtract(0, 'days').format('YYYY-MM-DD'),
                        getValue: function()
                        {
                            if ($('#modal #date_start').html() && $('#modal #date_end').html() )
                                return $('#modal #date_start').html() + ' ~ ' + $('#modal #date_end').html();
                            else
                                return '';
                        },
                        setValue: function(s,s1,s2)
                        {
                            var from_time = (s1||'').replace(/\//g, '-')
                            var to_time = (s2||'').replace(/\//g, '-')
                            $('#modal [name="from_time"]').val(from_time);
                            $('#modal [name="to_time"]').val(to_time);
                            $('#modal #date_start').html(s1);
                            $('#modal #date_end').html(s2);
                        }
                    });

                    //无结构
                    $("#modal [name='no_struct']").on("click", function() {
                        if($(this).prop("checked")) {
                            $("#modal #level1,#modal #level2,#modal #level3").addClass('hide');
                            $("#modal #level1").find('.options li[val=""]').click();
                            $("#modal #level2").find('.options li[val=""]').click();
                        } else {
                            $("#modal #level1,#modal #level2,#modal #level3").removeClass('hide');
                        }
                    });

                    $("#modal .dropdown").on("change", function() {
                        if($(this).attr("id") == "level1")
                            self.getLevel2($(this).attr("val"), $("#modal #level2"));
                        $(this).prev("input").val($(this).attr("val"));
                    });
                    $("#modal #exportCity").on("change", function(){
                        if($(this).attr("val")){
                            $("#modal [type='submit']").attr("disabled", false);
                        }else{
                            $("#modal [type='submit']").attr("disabled", true);
                        }
                    })

                });
            })
        },
        getLevel2: function(id, $level2){
            var ret = '<li value="">二级结构</li>';

            $level2.find(".options").html(ret)
                   .find("li[value='']").click();

            if(!id) {
                return;
            }

            $.ajax({
                url: '/ajax/GetLevel2s',
                data: {
                    level_id: id
                }
            }).then(function(data) {
                if(data && data.data) {
                    $.each(data.data, function(k, v) {
                        ret += '<li value="' + v['id'] + '">' + v['name'] + '</li>';
                    });
                }
                $level2.find(".options").html(ret);
            });
        },
    });
    return ListView;
});

