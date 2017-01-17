define("DetailView", function(){
    // require("sensitive");
    var Clazz = require("base");
    var DetailView = Clazz.extend({
        _options: {},
        check: function(){
            var isValid = true;

            if(!$("#citySelect").attr("val")) {
                $.alert("最少选一个城市！", function(){
                    $.cms.scrollIntoView($("#citySelect"));
                });
                return false;

            }

            var $title =  $("[name='title']");
            if($title.length && (!$title.val() || $title.hasClass("err"))){
                $.alert("标题必须为0-22.5字", function(){
                    $.cms.scrollIntoView($title);
                });
                return false;
            }


            var $des =  $("[name='desc']");
            if($des.length && (!$des.val() || $des.hasClass("err"))){
                $.alert("描述必须为0-100字", function(){
                    $.cms.scrollIntoView($des);
                });
                return false;
            }

            var $url = $("[name='url']");
            if($url.length && !$url.val()){
                $.alert("url不能为空", function(){
                    $.cms.scrollIntoView($url);
                });
                return false;
            }

            var $pic = $("[name='head_pic']");
            if($pic.length && !$pic.attr("data-value")){
                $.alert("头图不能为空！", function(){
                    $.cms.scrollIntoView($("[name='head_pic']"));
                });
                return false;
            }

            var $pic_sel = $("[name='pic']");
            if($pic_sel.length && !$pic_sel.attr("val")){
                $.alert("请选择头图！", function(){
                    $.cms.scrollIntoView($("[name='pic']"));
                });
                return false;
            }

            return isValid;
        },
        checkIfOpened: function(id, noneedAjax){
            var def = $.Deferred();

            if(noneedAjax) {
                def.resolve(true);

                return def;
            }

            $.ajax({
                url: '/ajax/IsContentBeingRevised',
                data: {
                    content_id: id
                }
            }).then(function(data) {
                if(data && data.data && data.is_being_revised) {
                    def.resolve(false);
                } else {
                    def.resolve(true);
                }
            }, function() {
                def.reject();
            });
            return def;
        },
        getContentDetail: function(id){
            var self = this;
            var def = $.Deferred();

            var params = {
                id: id
            };

            $.ajax({
                'url': self._options["getDetail"],
                'data': params,
                'success': function(data) {
                    data = data.data;
                    def.resolve(data);
                }
            });

            return def;
        },
        getContentId: function(){
            var article_id = this._options.id;
            var self = this;
            if(article_id){
                self.checkIfOpened(article_id, false, "/ajax/IsContentBeingRevised").then(function(canEdited) {
                    if(canEdited) {
                        self.getLists(self._options["type"], article_id).then(function() {
                            self.getContentDetail(article_id, self._options["type"], false).then(function(data) {
                                self.render(data);
                                // self.initEditor();
                                self.initUrl(6, true, $(".relative_add"));
                                $.imgUploader.init($("[name='head_pic']"));
                                // getVerSionMsg(article_id);
                            });
                        });

                    } else {
                        $.alert("文章正在被他人修改");
                    }
                });
            } else {
                // $(document.body).on("click", ".preview", function(e) {
                //     save(true, false, void(0), void(0), true);
                // });
                self.getLists(self._options["type"], article_id).then(function() {
                    // self.initEditor()
                    self.initUrl(6, true, $(".relative_add"));
                    $.imgUploader.init($("[name='head_pic']"));
                });

            }
        },
        getLists: function(type, id){
            var self = this;
            var defer = $.Deferred();
            var count = 0;
            var article_conf = {};
            $.ajax({
                url: '/ajax/GetMyCategories'
            }).then(function(data) {
                $.each(data.data, function(k, v) {
                    if(v.desc == type) {
                        article_conf.id = v.id;
                        article_conf.name = v.name;

                        $("#typeName").html(v.name);
                        $("#typeName").attr('data-value', v.id);

                        return false;
                    }
                });

            }).then(function(data) {
                $.ajax({
                    url: '/ajax/MyTypeSupportingCities',
                    data: {
                        category_id: article_conf.id
                    }
                }).then(function(data) {
                    var tpl = '', options = '';
                    data = data.data[article_conf.id];

                    for(var i in data) {
                        if(data.hasOwnProperty(i)) {
                            tpl += '<label class="checkbox"><input type="checkbox" value="' + i + '" name="city_ids">' + data[i] + '</label>';
                            options += '<li value="'+i+'">' + data[i] + '</li>';
                        }
                    }
                    $("#cityList").html(tpl);
                    $("#citySelect .options").append(options);

                    count++;
                    if(count >= 3) {
                        defer.resolve();
                    }
                });
            }).then(function(data) {
                $.ajax({
                    url: '/ajax/GetLevel1s',
                    data: {
                        category_id: article_conf.id
                    }
                }).then(function(data) {
                    var tpl = '';

                    data = data.data;

                    $.each(data, function(k, v) {
                        tpl += '<li value="' + v.id + '">' + v.name + '</li>';
                    });


                    $("#level1 .options").append(tpl);
                    count++;

                    if(count >= 3) {
                        defer.resolve();
                    }

                });
            }).then(function(data) {
                $.ajax({
                    url: '/ajax/GetProvenaces'
                }).then(function(data) {
                    var tpl = '';
                    data = data.data;
                    $.each(data, function(k, v) {
                        tpl += '<li value="' + v + '">' + v + '</li>';
                    });


                    $("#originSelect .options").append(tpl);

                    count++;
                    if(count >= 3) {
                        defer.resolve();
                    }

                })
            });

            return defer;
        },
        getMarkdown: function(){
            $("#editor_ret").val((window.editor && editor.toMarkDown()) || '');
        },
        getValues: function(){
            var self = this;
            // self.getMarkdown();

            var ret = {};

            $("[name]").each(function() {
                var $m = $(this);
                var val = $.trim($m.val()) || $.trim($m.attr("data-value")) || $.trim($m.attr("val"));
                var isCheckBox = ($m.attr('type') == 'checkbox');
                var isRadio = ($m.attr('type') == 'radio');

                if(isCheckBox || isRadio) {
                    if(!$m.is(":checked")) {
                        return;
                    }
                }

                ret[$m.attr("name")] = (ret[$m.attr("name")] || '');

                if(val && $m.is(":visible")) {

                    ret[$m.attr("name")] = (ret[$m.attr("name")] ? (ret[$m.attr("name")] + ',' + val) : val);
                }
            });

            var $el = $("[name='content']");
            ret.content = $.trim($el.val());

            ret.content_id = self._options["id"];
            ret.id = self._options["id"];

            ret.is_show_head = !!ret.is_show_head;

            if($("[name='is_original_2']").is(":checked")) {
                ret.level1_id = '0';
                ret.level2_id = '0';
                ret.level3_id = '0';

            }
            return ret;
        },
        getVerSionMsg: function(){

        },
        init: function(options, callback){
            this._options = $.extend(options,{
                isLocked: false,
                timer: ""
            });
            this.setDefaultOptions();
            this.setTitle();
            this.getContentId();
            this.initListeners();
            if($.isFunction(callback)){
                callback.apply(this);
            }
        },
        initComponents: function(cb){
            var self = this;
            self.initEditor(cb);
            $.imgUploader.init($("[name='head_pic']"));
        },
        initEditor: function(cb){
            editor = UE.getEditor('myEditor', {
                imgUploadAction: "/ajax/UploadPicForMyself",
                imgFavList: '/ajax/getMyPicsList',
                imgFavListDel: '/ajax/deleteMyPic',
                cityList: '/districtStrategy/getMyCities',
                loupanList: '/ajax/searchImg',
                sugList: '/ajax/SearchEntity',
                imageAllowFiles: [".png", ".jpg", ".jpeg"],
                imageMaxSize: 51200000,
                imageCompressBorder: 1600,
                imageCompressEnable: true,
                linkCardAction: "/ajax/parseInnerLink",
                initialFrameWidth: 600,
                topOffset: 150,
                /*toolbars: [
                    ['fullscreen']
                ],*/
                beforeImgUpload: function(cb) {
                    cb()
                },
                onready: function() {
                    cb && cb();
                }
            });
        },
        initListeners: function(){
            var self = this;
            $("#level1").on("change", function() {
                self.level1Change($(this).attr("val"));
            });

            $("#level2").on("change", function() {
                self.level2Change($(this).attr("val"));
            });

            $(".radio-block input[type='radio']").on("change", function() {
                if($(this).val() === '1') {
                    $(".origin-block").addClass('hide');
                    $(".author-block").removeClass('hide');
                } else {
                    $(".origin-block").removeClass('hide');
                    $(".author-block").addClass('hide');
                }
            });


            //选择无结构
            $("[name='is_original_2']").on("click", function() {
                if($(this).prop("checked")) {
                    $("#level1,#level2,#level3").addClass('hide');
                } else {
                    $("#level1,#level2,#level3").removeClass('hide');
                }
            });

            $(".save-commit").on("click", function() {
                self.save();
            });
        },
        initUrl: function(max_length, checkIntranet, $urlAdd){
            var self = this;
            max_length = max_length || 9;
            var $urlAdd_input = $urlAdd.find("input");
            var val = '', url_title='', url_desc='';

            $urlAdd
            .on("click", ".btn-success, .btn-info", function(e) {
                val = $.trim($urlAdd_input.val());
                url_title = $urlAdd.find("input[name='title']").val() || '';
                url_desc = $urlAdd.find("textarea[name='desc']").val() || '';
                if(!val) {
                    $.alert("url不可为空");
                    return;
                }
                if(!$.cms.isURL(val)) {
                    $.alert("url不合法！");
                    return;
                } else {
                    if(checkIntranet){
                        ///ajax/IsValidLianjiaLink?url=bj.lianjia.com/wenda/xiangqing/11
                        if(!url_title){
                            $.alert("标题不可为空");
                            return;
                        }
                        if(!url_desc){
                            $.alert("描述不可为空");
                            return;
                        }
                        if($urlAdd.find("input[name='title']").hasClass("warning")){
                            $.alert("标题输入有误！");
                            return;
                        }
                        if($urlAdd.find("textarea[name='desc']").hasClass("warning")){
                            $.alert("描述输入有误！");
                            return;
                        }
                        $.ajax({
                            url: '/ajax/IsValidLianjiaLink',
                            data: {
                                url: encodeURIComponent(val)
                            }
                        }).then(function(data) {
                            var originData = JSON.parse($urlAdd.find("[data-name='relative_articles']").attr("data-value")||"[]") || [];
                            var urlObj = {
                                url: val,
                                desc: url_desc,
                                title: url_title
                            }
                            originData.push(urlObj);

                            if(originData.length > max_length) {
                                $.alert("最多只能添加"+max_length+"个！");
                                return;
                            }

                            $urlAdd.find("[data-name='relative_articles']").attr("data-value", JSON.stringify(originData));

                            self.relative_add($urlAdd);

                            $urlAdd_input.val("")
                                         .trigger("keyup");
                            $urlAdd.find("textarea[name='desc']").val("")
                                                                 .trigger("keyup");
                        }, function(data) {
                            $.alert("添加失败，失败原因："+data.errMsg);
                        });
                    }else{
                        $.ajax({
                            url: '/ajax/ParseUrl',
                            data: {
                                url: val,
                                title: url_title,
                                desc: url_desc
                            }
                        }).then(function(data) {
                            var originData = JSON.parse($urlAdd.find("[data-name='relative_articles']").attr("data-value")||"[]") || [];

                            originData.push(data.data);

                            if(originData.length > max_length) {
                                $.alert("最多只能添加"+max_length+"个！");
                                return;
                            }

                            $urlAdd.find("[data-name='relative_articles']").attr("data-value", JSON.stringify(originData));

                            self.relative_add($urlAdd);
                            $urlAdd_input.val("");

                        }, function(data) {
                            $.alert("添加失败，请重试！");
                        });
                    }

                }
            })
            .on("click", ".btn_up", function(e) {
                var originData = JSON.parse($urlAdd.find("[data-name='relative_articles']").attr("data-value")||"[]") || [];
                var index = parseInt($(this).closest('.tr').attr("data-index"), 10);

                var temp = originData[index];
                if(index == 0) {
                    return;
                }
                originData[index] = originData[index-1];
                originData[index-1] = temp;

                $urlAdd.find("[data-name='relative_articles']").attr("data-value", JSON.stringify(originData));

                self.relative_add($urlAdd);
            })
            .on("click", ".btn_down", function(e) {
                var originData = JSON.parse($urlAdd.find("[data-name='relative_articles']").attr("data-value")||"[]") || [];
                var index = parseInt($(this).closest('.tr').attr("data-index"), 10);

                var temp = originData[index];
                if(index == originData.length - 1) {
                    return;
                }

                originData[index] = originData[index+1];
                originData[index+1] = temp;
                $urlAdd.find("[data-name='relative_articles']").attr("data-value", JSON.stringify(originData));
                self.relative_add($urlAdd);
            })
            .on("click", ".btn_del", function(e) {
                var originData = JSON.parse($urlAdd.find("[data-name='relative_articles']").attr("data-value")||"[]") || [];
                var index = parseInt($(this).closest('.tr').attr("data-index"), 10);
                originData.splice(index, 1);

                $urlAdd.find("[data-name='relative_articles']").attr("data-value", JSON.stringify(originData));

                self.relative_add($urlAdd);
            });
        },
        level1Change: function(id){
            var def = $.Deferred();

            if(!id) {
                var tpl = '<li value="">二级结构</li>';
                $("#level2 .options").html(tpl)
                                     .find("li[value='']").click();
                return;
            }

            $.ajax({
                url: '/ajax/GetLevel2s',
                data: {
                    level_id: id
                }
            }).then(function(data) {

                var tpl = '<li value="">二级结构</li>';
                data = data.data;
                $.each(data, function(k, v) {
                    tpl += '<li value="' + v.id + '">' + v.name + '</li>';
                });

                $("#level2 .options").html(tpl);
                def.resolve();

            });

            $("#level3 .options").html('<li value="">三级结构</li>');
            return def;
        },
        level2Change: function(id){
            var def = $.Deferred();

            if(!id) {
                var tpl = '<li value="" >三级结构</li>';

                $("#level3 .options").html(tpl);
            }

            $.ajax({
                url: '/ajax/GetLevel3s',
                data: {
                    level_id: id
                }
            }).then(function(data) {

                var tpl = '<li value="" >三级结构</li>';

                data = data.data;

                $.each(data, function(k, v) {
                    tpl += '<li value="' + v.id + '">' + v.name + '</li>';
                });


                $("#level3 .options").html(tpl);

                def.resolve();

            });

            return def;
        },
        relative_add: function($el){
            var tpl = $("#relativeUrl").html();

            var $content = $el.find("[data-name='relative_articles']");
            var originData = JSON.parse($content.attr("data-value")||"[]") || [];

            $content.find(".tr").remove();

            $content.append($.template(tpl).render({
                data: originData
            }));
        },
        render: function(data){
            var self = this;
            article_id = data.id || self._options["article_id"];

            // citys
            var city = data.city || '';
            $("#citySelect").find(".options li[value='"+city+"']")
                            .click();

            if(data.primary_cate_id === data.child_cate_id) {

                $("[name='is_original_2']").trigger('click');

            }
            var levels = JSON.parse(data.cate_path || '[]');
            if(levels.length && levels[levels.length-1] !== '0') {
                levels.pop();
                levels.reverse();
                if(levels.length) {
                    $("#level1").attr("val", levels[0].id)
                                .find(".selected > span").html(levels[0].name);

                    var level1 = self.level1Change(levels[0].id);
                    var level2 = '';

                    if(level1 && levels[1]) {
                        level1.then(function() {
                            $("#level2").attr("val", levels[1].id);
                        });
                    }
                }
            }else{
                $("[name='is_original_2']").prop("checked", true);
                $("#level1,#level2,#level3").addClass('hide');
            }


            // url
            $("[name='url']").val(data.url)
                             .trigger('keyup');

            // title
            $("[name='title']").val(data.title)
                               .trigger('keyup');

            // zhaiyao
            $("[name='desc']").val(data.desc)
                              .trigger('keyup');

            // head_pic
            if(data.pic) {
                var tpl = '<li><img src="'+data.pic+'"><i>删除</i></li>';
                $("[name='head_pic']").attr("data-value", data.pic);
                $("[name='head_pic'] .file-list").html(tpl);

                $("#head-pic").find(".options li[value='"+data.pic+"']").click();
                $("#preview-img").attr("src", data.pic).show();
            }
            if(data.show_head == '1') {
                $("[name='is_show_head']").prop('checked', true);
            } else {
                $("[name='is_show_head']").prop('checked', false);
            }

            var $urlAddArticle = $(".relative_add_article");
            var $urlAddArticle_input = $urlAddArticle.find("input");


            // relative_article
            var $urlAdd = $(".relative_add");
            $urlAdd.find("[data-name='relative_articles']").attr("data-value", data.related_urls || JSON.stringify([]));
            self.relative_add($urlAdd);
        },
        save: function(){
            var self = this;
            var values = self.getValues() || {};
            values = $.extend(values, {
                'pic': values.head_pic
            })
            if(self.check()) {
                var action = self._options["action"];
                url = self._options[action+"_commit"];
                $.ajax({
                    url: url,
                    data: values,
                    method: 'post'
                }).then(function(data) {
                    $.alert("保存成功！", function(){
                        location.href = self._options["path"];
                    });

                }, function(data) {
                    $.alert("保存失败，失败信息：" + (data && data.errMsg || ''));
                });
            }
        },
        setDefaultOptions: function(){},
        setTitle: function(){
            if(this._options["detail_title"])
                $(".login-msg").prepend('<span class="page--title">'+this._options["detail_title"]+'</span>');
        }
    });
    return DetailView;
});

