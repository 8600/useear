

let GlobeAlert = {

    /**
     * 普通消息
     * @param {any} message 消息内容
     */
    alert: function (message) {
        swal({
            text: message,
            confirmButtonText: '确认'
        });
    },

    /**
     * 错误消息
     * @param {any} message 消息内容
     */
    info: function (message) {
        swal({            
            text: message,
            type: 'info',
            confirmButtonText: '确认'
        });

    },

    /**
     * 成功消息
     * @param {any} message 消息内容
     */
    success: function (message) {
        swal({
            text: message,
            type: 'success',
            confirmButtonText: '确认'
        });
    },


    /**
     * 警告消息
     * @param {any} message 消息内容
     */
    warning: function (message) {
        swal({
            text: message,
            type: 'warning',
            confirmButtonText: '确认'
        });
    },

    /**
     * 错误消息
     * @param {any} message 消息内容
     */
    error: function (message) {
        swal({
            text: message,
            type: 'error',
            confirmButtonText: '确认'
        });
    }

};


