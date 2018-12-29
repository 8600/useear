/**==============================================================
 * JS脚本名称: monitor.js
 * 版本号： V1.0.0
 * 创建人: GlenRiver
 * 创建时间: 2018/6/1  11:27:49
 * 功能描述: 视频监控处理
 *
 ================================================================*/

// 显示室内监控位置信息
function showMonitorIndoor(buildingName) {
    layui.use(['layer'], function () {
        let layer = layui.layer;
        //页面层-自定义
        layer.open({
            type: 2,
            title: "视频监控",
            resize: false,
            scrollbar: false,
            area: ['1268px', '846px'],
            offset: ['80px', '330px'],
            skin: 'monitor-class',
            content: "../Default/MonitorIndoor?buildingName=" + buildingName
        });
    });
    
}