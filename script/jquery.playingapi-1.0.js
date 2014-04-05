/*
    jQuery playingapi v1.0 - 2014-4-1 
    (c) Kevin 21108589@qq.com
	license: http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {
    //默认对象为空
    var defaults = { 
    },
    //基本的一些定义
    error = 'error',
    info = 'info',
    success = 'success',
    zhError = '错误',
    zhErrorCode = '错误代码:',
    zhRequired = '必填',
    zhNoRequired = '非填',
    zhSuccess = '成功:',
    zhInfo = '信息:',
    zhRequest = '请求',
    zhReuqestType = 'HTTP请求方式',
    zhRequestUrl = '请求地址',
    zhUrlParams = '请求参数',
    zhUrlParamsDesc = '参数说明',
    zhResult = '请求结果',
    prefix = 'papi',
    playingapifield = 'playingapifield',
    form = 'form',
    iframe = 'iframe',
    data,
    requiredField,
    isIe = !$.support.leadingWhitespace, // IE7 & IE8
    lable = 'lable',
    input = 'input',
    div = 'div',
    span = 'span',
    textarea = 'textarea',
    descLength = 38,
    
    //playingapi元素对象 基本的元素均在此定义
    playingapielement = {
        requestType: {
            name: zhReuqestType,
            $self: function () {
                var html = $tag(input).addClass("input-xlarge").val("GET").attr("disabled", "").attr("type","text");
                return html;
            }
        },
        requestUrl: {
            name: zhRequestUrl,
            $self: function () {
                var html = $tag(textarea).attr("rows", "2").attr("disabled", "");
                return html;
            }
        },
        urlParams: {
            name: zhUrlParams,
            $self: function () {
                var html = $tag(textarea).attr("rows", "2").attr("disabled", "");
                return html;
            }
        },
        urlParamsDesc: {
            name: zhUrlParamsDesc,
            $self: function () {
                var span1 = $tag(span).addClass("help-inline");
                return span1.append($tag(span).addClass("label label-warning"));
            }
        },
        requestBtn: {
            $self: function () {
                var html = $tag(input).attr("type", "submit").addClass("btn btn-primary").val(zhRequest);
                return html;
            }
        },
        result: {
            name: zhResult,
            $self: function () {
                var html = $tag(div);
                return html;
            }
        }
    };
    //构造函数
    var playingapi = function (element, options) {
        this.init(element, options);
    };
    /**
    *
    *playingapi的配置参数
    *playingapi的元素
    *
    **/
    playingapi.prototype = {
        //初始化
        init: function (element, options) {
            //合并参数
            this.options = $.extend({}, defaults, options);
            //将当前调用的元素定义到this.$element
            this.$element = $(element);
            this.appendHtml();
            this.bindEvent();
        },
        //显示api的内容
        show: function (index) {
            this.clear();
            var thisoption = this.options.list[index];
            this.$requestType.val(thisoption.requestType.toUpperCase()=="GET"?"GET" :"POST");
            this.$requestUrl.val(thisoption.url).attr("title", thisoption.url);
            this.$urlParams.val(thisoption.urlParams).attr("title", thisoption.urlParams);
            this.$urlParamsDesc.text(thisoption.urlDesc);
            var parent = this.$urlParamsDesc.parent().parent().parent();
           
            if (thisoption.urlDesc != "") {
                parent.show();
            } else {
                parent.hide();
            }

            if (thisoption.name != undefined) {
                if (thisoption.name != "") {
                    var html = "";
                    var name, value, desc, json;
                    requiredField = thisoption.requiredName;
                    for (var i = 0; i < thisoption.name.split(',').length; i++) {
                        name = thisoption.name.split(',');
                        value = thisoption.value == undefined ? "" : thisoption.value.split(',');
                        desc = thisoption.desc == undefined ? "" : thisoption.desc.split(',');
                        json = {
                            name: name[i],
                            value: value[i] == undefined ? "" : value[i],
                            desc: desc[i] == undefined ? "" : desc[i]
                        };
                        html += getHelpGroupHtml(json);
                    }
                    var uploadfilename;
                    if (thisoption.uploadfile != undefined) {
                        uploadfilename = thisoption.uploadfile.name.split(',');
                        value = thisoption.uploadfile.value.split(',');
                        for (var j = 0; j < uploadfilename.length; j++) {
                            json = {
                                name: uploadfilename[j],
                                value: value[j]
                            };
                            html += getUploadFileHtml(json);
                        }
                    }
                    //添加缓存数据的dom
                    this.$form.find(".control-group").eq(4).before(html);
                    //填充action当前form
                    this.$form.attr("action", this.$requestUrl.val());
                }
            }
           
        },
        //添加playingapi需要的dom
        appendHtml: function () {
            var tform = $tag(form).attr("method","post").attr("enctype", "multipart/form-data").addClass("bs-docs-example form-horizontal");
            var trequestType = getGroupHtml(playingapielement.requestType);
            var trequestUrl = getGroupHtml(playingapielement.requestUrl);
            var turlParams = getGroupHtml(playingapielement.urlParams);
            var turlParamsDesc = getGroupHtml(playingapielement.urlParamsDesc);
          
            turlParamsDesc.css("display", "none");
            var trequestBtn = getGroupHtml(playingapielement.requestBtn);
            var tiframe = $tag(iframe,iframe).css("display", "none");
            var tresult = getGroupHtml(playingapielement.result);
            this.$element.append(tform.append(trequestType, trequestUrl, turlParams, turlParamsDesc, trequestBtn,tresult, tiframe));
            
            var dataname = "data";
            if (this.$data == undefined) {
                var tdata = $tag(input, dataname).css("display", "none").attr("name", prefix + dataname);
                this.$data = tdata;
                this.$element.append(tdata);
            }

            //定义当前变量
            this.$form = tform;
            this.$iframe = tiframe;
            this.$requestType = trequestType.find(".controls>input");
            this.$requestUrl = trequestUrl.find(".controls>textarea");
            this.$urlParams = turlParams.find(".controls>textarea");
            this.$urlParamsDesc = turlParamsDesc.find(".controls>span>span");
            this.$requestBtn = trequestBtn.find(".controls>input");
            this.$result = tresult.find(".controls>div");
        },
        //绑定事件
        bindEvent: function () {
            var thisobj = this;
            var fnajaxForm = $.fn.ajaxSubmit;
            this.$requestBtn.bind("click", ($.proxy(function () {
                if (thisobj.$urlParams.val() != "") {
                    thisobj.setDataJson();
                    thisobj.$form.append($(thisobj.$data));
                    //如果有用到jquery.form.js就使用该方法
                    if ($.isFunction(fnajaxForm)) {
                        thisobj.$form.ajaxForm({
                            //target: $(thisobj.$iframe),
                            error: function (XMLHttpRequest) {
                                thisobj.showResult({ type: error, info: XMLHttpRequest.status });
                            },
                            success: function (data) {
                                thisobj.showResult({ type: success, info: data });
                            }
                        });
                    } else {
                        //否则使用jquery.$.ajax
                        $.ajax({
                            type: this.$requestType.val(),
                            data: this.$data.attr("id")+"="+this.$data.val(),
                            url: this.$requestUrl.val(),
                            error: function(XMLHttpRequest) {
                                thisobj.showResult({ type: error, info: XMLHttpRequest.status });
                            },
                            success: function(data) {
                                thisobj.showResult({ type: success, info: data });
                            }
                        });
                        //阻止表单提交
                        return false;
                    }
                } else {
                    //阻止表单提交
                    return false;
                }
            },this)));
        },
        //移除临时块
        clear: function() {
            $(".tempclass").remove();
        },
        //将form的数据转换的json保存到data元素
        setDataJson: function() {
            var json = "{";
            var formobj = this.$form.find("." + playingapifield);
            var flen = formobj.length;
          
            formobj.each(function (i) {
                var obj = $(this);
                json += "'" + obj.attr("name") + "'" + ":" + "'" + obj.val() + "'";
                if (i != flen - 1) {
                    json += ",";
                }
                i++;
            });
      
            json += "}";
            this.$data.val(json);
        },
        //显示返回内容
        showResult: function (obj) {
            var html = "<div class=\"alert alert-arg0\" style='width:363px'>arg1</div>";
            var regtype = new RegExp("arg0", "g");
            var reginfo = new RegExp("arg1", "g");
            if (obj != undefined) {
                switch (obj.type) {
                case error:
                    html = html.replace(regtype, error).replace(reginfo, zhErrorCode + obj.info);
                    break;
                case success:
                    html = html.replace(regtype, success).replace(reginfo, zhSuccess + obj.info);
                    break;
                case info:
                    html = html.replace(regtype, info).replace(reginfo, zhInfo + obj.info);
                    break;
                default:
                }
                this.$result.html(html);
//                var offset = this.$result.offset().top;
//                $(window).scrollTop(offset);
            }
        }
    };
    
    /**
   *
   *通用函数
   *
   **/

    //获取css临时的帮助div块
    function getHelpGroupHtml(obj) {
        var html = "<div class='control-group tempclass'>";
        html += "<label class='control-label'>" + obj.name + "</label><div class='controls'><input type='text' name='" + obj.name + "' value='" + obj.value + "'  class='" + playingapifield + "'>";
        eval("var re = /" + obj.name + "/ig;");
        html += "<span class='help-inline'>";
        
        //判断该字段是否必填的,填充"必填",或 "非填"
        if (re.test(requiredField)) {
            html += "&nbsp;<span class='label label-important'>" + zhRequired + "</span>";
        } else {
            html += "&nbsp;<span class='label label-inverse'>" + zhNoRequired + "</span>";
        }
        //过长tip显示
        if (obj.desc.length >= descLength) {
            html += "&nbsp;<span class='label label-info tip' title='" + obj.desc + "'>" + obj.desc.substr(0, descLength) + "..." + "</span>";
        } else {
            html += "&nbsp;<span class='label label-info'>" + obj.desc + "</span>";
        }
        html += "</span></div></div>";
        return html;
    }

    //获取css临时的文件上传div块
    function getUploadFileHtml(obj) {
        var html = '<div class="control-group tempclass">' +
        '<label class="control-label">arg0</label>' +
        '<div class="controls">' +
        '<input type="file" id="arg1" class="input-xlarge ' + playingapifield + '" name="arg1"  value="file"/>' +
        '</div></div>';
        var reg = new RegExp("arg0", "g");
        html = html.replace(reg, obj.name);
        reg = new RegExp("arg1", "g");
        html = html.replace(reg, obj.value);
        return html;
    }
    
    //获取css主要的div块
    function getGroupHtml(element) {
        var $div1 = $tag(div).addClass("control-group");
        var $lable = $tag(lable).addClass("control-label").text(element.name);
        var $div2 = $tag(div).addClass("controls");
        var $elementHtml = element.$self();
        var html = $div1.append($lable);
        html = html.append($div2.append($elementHtml));
        return html;
    }

    //创建jquery对象
    function $tag(tag, id, css) {
        var element = document.createElement(tag);
        if (id) {
            element.id = prefix + id;
        }
        if (css) {
            element.style.cssText = css;
        }
        return $(element);
    };

    $.fn.playingapi = function (option) {
        var args = arguments;
        $(this).each(function() {
            data = $(this).data("playingapi");
            options = (typeof option !== 'object') ? null : option;
            if (!data) {
                //new 一个新的对象 并缓存数据到playingapi
                data = new playingapi(this, options);
                $(this).data("playingapi",data);
            }
            if (typeof option === 'string') {
                //调用option,且参数长度最多为1
                data[option].apply(data, Array.prototype.slice.call(args, 1));
                //把 arguments 当做当前对象
                //也就是说 要调用的是 arguments 的slice 方法，后面的 参数 1 也就成了 slice 的第一个参数slice(1)就是获取所有
            }
        });
    }; 
   
}(window.jQuery));
