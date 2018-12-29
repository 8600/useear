API = {

    /**
     * 字符串转换
     * @param str 字符串
     * @returns {string|XML|*}
     * @constructor
     */
    TransCoder: function (str) {
        str = str.replace(/\</g, "&lt;");
        str = str.replace(/\>/g, "&gt;");
        return str;
    },

    /**
     * 反转码
     * @param str 字符串
     * @returns {string|XML|*}
     * @constructor
     */
    TransCoder2: function (str) {
        str = str.replace(/\&lt;/g, "<");
        str = str.replace(/\&gt;/g, ">");
        return str;
    },

    /**
     * 根据名称获取URL参数值
     * @param name 参数名
     * @returns {*}
     */
    request: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return null;
    },

    /**
     * 根据编号、类型获取省、市、县/区列表
     * @param id
     * @param type
     */
    getCity: function (id, type) {
        $.ajax({
            type: "POST",
            url: "GetRegionByParentId",
            async: false,
            cache: false,
            dataType: "json",
            data: { "parentId": id },
            success: function (result) {
                var z = "";
                if (type == 1) {
                    z += "<option>请选择省</option>"
                    $.each(result, function () {
                        z += "<option value=" + this.region_name + " data-id=" + this.region_id + ">" + this.region_name + "</option>"
                    });
                    $('[name="Province"]').html(z);
                } else if (type == 2) {
                    z += "<option>请选择市</option>"
                    $.each(result, function () {
                        z += "<option value=" + this.region_name + " data-id=" + this.region_id + ">" + this.region_name + "</option>"
                    });
                    $('[lay-filter="City"]').html(z);
                    $('[name="District"]').html("<option>请选择县/区</option>");
                } else {
                    z += "<option>请选择县/区</option>"
                    $.each(result, function () {
                        z += "<option value=" + this.region_name + " data-id=" + this.region_id + ">" + this.region_name + "</option>"
                    });
                    $('[name="District"]').html(z);
                }
            },
            error: function (data) {
                console.log("error:" + data);
            }
        });
    },

    /**
     * 获取字典列表，生成下拉控件
     */
    getDictionaryCategory: function () {
        $.ajax({
            type: "POST",
            url: "GetDictionaryCategory",
            data: null,
            async: false,
            dataType: "json",
            success: function (result) {
                var z = "";
                if (result.state == "success") {
                    z += "<option>请选择分类</option>"
                    $.each(result.data, function () {
                        z += "<option value=" + this.category + " data-id=" + this.category + ">" + this.category + "</option>"
                    });
                    $('[name="Category"]').html(z);
                }
            },
            error: function (data) {
                var data = JSON.parse(data);
                if (data.state == "failed") {
                    LayerEx.error(data.message);
                }
            }
        });
    },

    /**
     * 根据分类名称获取字典列表，生成下拉控件
     */
    getDictionaryList: function (categoryName) {
        $.ajax({
            type: "POST",
            url: "GetDictionaryList",
            data: null,
            async: false,
            dataType: "json",
            data: {
                "categoryName": categoryName
            },
            success: function (result) {
                var z = "";
                if (result.state == "success") {
                    z += "<option>请选择分类</option>"
                    $.each(result.data, function () {
                        z += "<option value=" + this.code + " data-id=" + this.code + ">" + this.name + "</option>"
                    });
                    $('[name="Type"]').html(z);
                }
            },
            error: function (data) {
                var data = JSON.parse(data);
                if (data.state == "failed") {
                    LayerEx.error(data.message);
                }
            }
        });
    },

    /**
     * 获取园区列表，生成下拉控件
     */
    getPark: function () {
        $.ajax({
            type: "POST",
            url: "GetParkList",
            data: null,
            async: false,
            dataType: "json",
            success: function (result) {
                var z = "";
                if (result.state == "success") {
                    z += "<option>请选择园区</option>"
                    $.each(result.data, function () {
                        z += "<option value=" + this.name + " data-id=" + this.id + ">" + this.name + "</option>"
                    });
                    $('[name="Park"]').html(z);
                }
            },
            error: function (data) {
                var data = JSON.parse(data);
                if (data.state == "failed") {
                    LayerEx.error(data.message);
                }
            }
        });
    },

    /**
     * 根据园区编号获取地块信息
     * @param id 园区编号
     */
    getBlock: function (id) {
        $.ajax({
            type: "POST",
            url: "GetBlockList",
            data: {
                "parkId": id
            },
            async: false,
            dataType: "json",
            success: function (result) {
                var z = "";
                if (result.state == "success") {
                    z += "<option>请选择地块</option>"
                    $.each(result.data, function () {
                        z += "<option value=" + this.name + " data-id=" + this.id + ">" + this.name + "</option>"
                    });
                    $('[name="Block"]').html(z);
                }
            },
            error: function (data) {
                var data = JSON.parse(data);
                if (data.state == "failed") {
                    LayerEx.error(data.message);
                }
            }
        });
    },

    /**
     * 根据地块编号获取建筑信息
     * @param id 地块编号
     */
    getBuilding: function (id) {
        $.ajax({
            type: "POST",
            url: "GetBuildingList",
            data: {
                "blockId": id
            },
            async: false,
            dataType: "json",
            success: function (result) {
                //	    	console.log(result)
                var z = "";
                if (result.state == "success") {
                    z += "<option>请选择建筑</option>"
                    $.each(result.data, function () {
                        z += "<option value=" + this.name + " data-id=" + this.id + ">" + this.name + "</option>"
                    });
                    $('[name="Building"]').html(z);
                }
            },
            error: function (data) {
                var data = JSON.parse(data);
                if (data.state == "failed") {
                    LayerEx.error(data.message);
                }
            }
        });
    },

    /**
     * 操作权限
     * @constructor
     */
    GetJurisdiction: function () {
        $.ajax({
            type: "POST",
            url: "GetJurisdiction",
            cache: false,
            dataType: "json",
            success: function (result) {
                if (result.Add == 1) {
                    $("#btnAdd").show();
                }
                if (result.Edit == 1) {
                    $("#btnEdit").show();
                }
                if (result.Del == 1) {
                    $("#btnDel").show();
                }
                if (result.Search == 1) {
                    $("#btnSearch").show();
                }
                if (result.AdvSearch == 1) {
                    $("#btnAdvSearch").show();
                }
            },
            error: function (data) {
                LayerEx.error(data);
            }
        })
    },

    /**
     * 数据权限
     * @constructor
     */
    GetDataRowPurview: function () {
        $.ajax({
            type: "POST",
            url: "GetDataRowPurview",
            cache: false,
            success: function (result) {
                if (result == "root") {
                    dataValue = dataValue2 = "";
                } else {
                    result = JSON.parse(result);
                    if (result.length > 0) {
                        $.each(result, function (index) {
                            dataValue += this.express;
                            dataValue2 += this.express;
                            if (result.length - 1 != index) {
                                dataValue += "or"
                                dataValue2 += "or"
                            }
                        });
                    } else {
                        LayerEx.error('请联系管理员进行数据配置!');
                        return false;
                    }
                }
            },
            error: function (data) {
                LayerEx.error(data);
            }
        });
    },

    /**
     * 异步删除数据
     * @param z
     * @param mes
     * @param url
     */
    deleteData: function (z, mes, url) {
        $.ajax({
            type: "POST",
            url: url,
            async: false,
            cache: false,
            data: { "pValue": z },
            success: function (result) {
                var data = JSON.parse(result);
                if (data.state == "success") {
                    LayerEx.success(mes);
                    API.reload();
                } else if (data.state == "failed") {
                    LayerEx.error(data.message);
                }
            },
            error: function (data) {
                LayerEx.error(data);
            }
        });
    },

    /**
     * 重新加载报表
     */
    reload: function () {
        table.reload("dataTable", {})
        layer.closeAll('iframe');
    },


    /**
     * 格式化时间
     * @param date
     * @returns {*}
     */
    formatDate: function (date) {
        if (date) {
            return (new Date(date)).Format("yyyy-MM-dd");
        } else {
            return "";
        }
    },
    formatDateTime: function (date) {
        if (date) {
            return (new Date(date)).Format("yyyy-MM-dd hh:mm:ss");
        } else {
            return "";
        }
    },
    formatDateHour: function (date) {
        if (date) {
            return (new Date(date)).Format("hh:mm:ss");
        } else {
            return "";
        }
    },
    formatDateYear: function (date) {
        if (date) {
            return (new Date(date)).Format("yyyy年MM月dd日");
        } else {
            return "";
        }
    },
    launchFullscreen:function() {
		var element = document.documentElement;
		if(element.requestFullscreen) {
		    element.requestFullscreen();
		} else if(element.mozRequestFullScreen) {
		    element.mozRequestFullScreen();
		} else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if(element.msRequestFullscreen) {
		    element.msRequestFullscreen();
		}
	},
	exitFullscreen:function() {
	  if(document.exitFullscreen) {
	    document.exitFullscreen();
	  } else if(document.mozCancelFullScreen) {
	    document.mozCancelFullScreen();
	  } else if(document.webkitExitFullscreen) {
	    document.webkitExitFullscreen();
	  }
	}
};





Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        // 月份
        "d+": this.getDate(),
        // 日
        "h+": this.getHours(),
        // 小时
        "m+": this.getMinutes(),
        // 分
        "s+": this.getSeconds(),
        // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // 季度
        S: this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return fmt;
};