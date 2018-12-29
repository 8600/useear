
let GlobeEngine = {
    viewer: null,
    scene: null,
    camera: null,
    clock: null,
    timeline: null,
    vecLayer: null,
    imgLayer: null,
    annoLayer: null,
    roadLayer: null,

    pointTemp: [],
    entitiesTemp: [],
    lonTemp: [],
    latTemp: [],

    handler: null,

    models: new HashTable(),    //三维模型
    monitors: new HashTable(),  //室外监控点位
    gate: new HashTable(), //道闸、
    parking: new HashTable(), //停车场
    students: new HashTable(), //学生

    infoDiv: null,
    infoWidth: 300,
    infoHeight: 500,
    position1: null,
    position2: null,
    cartesian2: null,

    /**
    * 初始化三维
    * @param {any} container 地图容器
    */
    init: function () {
        this.viewer = new Cesium.Viewer('cesiumContainer', {
            animation: true,    //是否创建动画小器件，左下角仪表
            baseLayerPicker: false, //是否显示图层选择控件,自定义图层必须关闭
            fullscreenButton: false,    //是否显示全屏按钮
            geocoder: false,    //是否显示geocoder小器件，右上角查询按钮
            homeButton: false,  //是否显示Home按钮
            infoBox: false,     //是否显示点击要素之后显示的信息
            sceneModePicker: false,//是否显示3D/2D选择器
            selectionIndicator: true,//是否显示选取指示器组件
            timeline: true,   //是否显示时间轴
            navigationHelpButton: false, //是否显示右上角的帮助按钮
            scene3DOnly: true,  //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
            navigationInstructionsInitiallyVisible: false,
            showRenderLoopErrors: false,
            shadows: false, //阴影
            //Google Maps影像
            imageryProvider: new Cesium.UrlTemplateImageryProvider({
                url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali"
            }),
            //Google Maps矢量
            //imageryProvider: new Cesium.UrlTemplateImageryProvider({
            //    url: "http://mt1.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile"
            //}),
            //天地图影像
            //imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
            //    url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
            //    layer: "tdtBasicLayer",
            //    style: "default",
            //    format: "image/jpeg",
            //    tileMatrixSetID: "GoogleMapsCompatible",
            //    show: false
            //}),
//             terrainProvider: new Cesium.CesiumTerrainProvider({
//                 url: 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
//                 requestVertexNormals: true //地形光照效果
//                 //requestWaterMask: true  //启用水体效果
//             })
        });
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;

        //this.viewer.clock.multiplier = 0.1 * 60 * 60;
        this.viewer.scene.globe.enableLighting = true;  //启用光照效果
        //this.viewer.scene.globe.lightingFadeInDistance = 9000000.0;
        //this.viewer.scene.globe.lightingFadeOutDistance  = 100.0;

        //this.viewer.animation.container.style.visibility = 'visible';
        this.viewer.animation.container.style.visibility = 'hidden';
        //this.viewer.timeline.container.style.visibility = 'visible';
        this.viewer.timeline.container.style.visibility = 'hidden';

        let startTime = Cesium.JulianDate.fromIso8601("2018-06-12T06:00:00Z");
        let stopTime = Cesium.JulianDate.fromIso8601("2018-06-12T08:00:00Z");
        this.viewer.timeline.zoomTo(startTime, stopTime);

        this.clock = this.viewer.clock;
        this.clock.startTime = startTime;
        this.clock.stopTime = stopTime;
        this.clock.currentTime = startTime;
        this.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

        this.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(119.413935221201, 25.973872901260, 180.0),
            orientation: {
                heading: Cesium.Math.toRadians(0.0), // 方向
                pitch: Cesium.Math.toRadians(-30.0),// 倾斜角度
                roll: 0
            }
        });


        //this.camera.changed.addEventListener(function (movement) {
        //    let picth = Cesium.Math.toRadians(-15.0);
        //    if (GlobeEngine.camera.pitch >= picth)
        //    {
        //        GlobeEngine.camera.setView({
        //            destination: GlobeEngine.camera.position,
        //            orientation: {
        //                heading: GlobeEngine.camera.heading, // 方向
        //                pitch: Cesium.Math.toRadians(-15.0),// 倾斜角度
        //                roll: GlobeEngine.camera.roll
        //            }
        //        });
        //    }

        //    //console.log("position:" + GlobeEngine.camera.position);
        //    //console.log("direction:" + GlobeEngine.camera.direction);
        //    //console.log("up:" + GlobeEngine.camera.up);
        //    //console.log("fov:" + GlobeEngine.camera.frustum.fov);
        //    //console.log("near:" + GlobeEngine.camera.frustum.near);
        //    //console.log("far:" + GlobeEngine.camera.frustum.far);
        //    //console.log("heading:" + GlobeEngine.camera.heading);
        //    //console.log("pitch:" + GlobeEngine.camera.pitch);
        //    //console.log("roll:" + GlobeEngine.camera.roll);            
        //});

        console.log("initialize globe engine success.");
        $("#cesiumContainer").append('<div id="trackPopUp" style="display: block;"></div>')
    },

    /**
     * 坐标位置
     */
    initCoords: function () {
        try {
            //得到当前三维场景的椭球体
            let ellipsoid = this.scene.globe.ellipsoid;
            let longitude = null;
            let latitude = null;
            let height = null;
            let cartesian = null;
            // 定义当前场景的画布元素的事件处理
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
            this.handler.setInputAction(function (movement) {
                //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
                cartesian = GlobeEngine.viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                if (cartesian) {
                    //将笛卡尔坐标转换为地理坐标
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                    //将弧度转为度的十进制度表示
                    longitude = Cesium.Math.toDegrees(cartographic.longitude);
                    latitude = Cesium.Math.toDegrees(cartographic.latitude);
                    //获取相机高度
                    height = Math.ceil(GlobeEngine.viewer.camera.positionCartographic.height);

                    $("#divPos").html('经度：' + longitude.toFixed(12) + '  纬度：' + latitude.toFixed(12) + '  高度：' + height + '');

                    //相机数据,控制穿入地下
                    //let p = Cesium.Math.toDegrees(GlobeEngine.camera.pitch);
                    //if (p > -20) {
                    //    GlobeEngine.viewer.camera.setView({
                    //        orientation: {
                    //            heading: GlobeEngine.camera.heading,    // east, default value is 0.0 (north)
                    //            pitch: Cesium.Math.toRadians(-20),      // default value (looking down)
                    //            roll: GlobeEngine.camera.roll           // default value
                    //        }
                    //    });
                    //}
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            //设置鼠标滚动事件的处理函数，这里负责监听高度值变化
            this.handler.setInputAction(function (wheelment) {
                height = Math.ceil(GlobeEngine.viewer.camera.positionCartographic.height);
                $("#divPos").html('经度：' + longitude.toFixed(12) + '  纬度：' + latitude.toFixed(12) + '  高度：' + height + '');
            }, Cesium.ScreenSpaceEventType.WHEEL);

        } catch (e) {
            console.log("function initCoords exception, error:" + e.message);
        }
    },

    /**
     * 初始化键盘操作
     */
    initKeyboard: function () {
        try {
            this.scene.canvas.setAttribute('tabindex', '0');
            this.scene.canvas.onclick = function () {
                GlobeEngine.scene.canvas.focus();
                console.log("设置画布焦点.");
            };

            // 禁用默认的事件处理程序
            // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
            this.scene.screenSpaceCameraController.enableRotate = false;
            // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
            this.scene.screenSpaceCameraController.enableTranslate = false;
            // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
            this.scene.screenSpaceCameraController.enableZoom = false;
            // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
            this.scene.screenSpaceCameraController.enableTilt = false;
            // 如果为true，则允许用户使用免费外观。如果错误，摄像机视图方向只能通过转换或旋转进行更改。此标志仅适用于3D和哥伦布视图模式。
            this.scene.screenSpaceCameraController.enableLook = false;

            let startMousePosition;     // 鼠标开始位置
            let mousePosition;          // 鼠标位置
            let MouseFlag = {           // 鼠标状态标志
                LOOKING: false,
                MOVE_FORWARD: false,    //向前
                MOVE_BACKWARD: false,   //向后
                MOVE_UP: false,         //向上
                MOVE_DOWN: false,       //向下
                MOVE_LEFT: false,       //向左
                MOVE_RIGHT: false       //向右
            }

            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

            // 接收用户鼠标（手势）事件
            this.handler.setInputAction(function (movement) {
                // 处理鼠标按下事件
                // movement: 接收值为一个对象，含有鼠标单击的x，y坐标
                MouseFlag.LOOKING = true;
                // 设置鼠标当前位置
                mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

            this.handler.setInputAction(function (movement) {
                // 处理鼠标移动事件
                // 更新鼠标位置
                mousePosition = movement.endPosition;
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            this.handler.setInputAction(function (position) {
                // 处理鼠标左键弹起事件
                MouseFlag.LOOKING = false;
            }, Cesium.ScreenSpaceEventType.LEFT_UP);

            // 根据键盘按键返回标志
            function getFlagForKeyCode(keyCode) {
                switch (keyCode) {
                    case 'W'.charCodeAt(0):
                        return 'MOVE_FORWARD';
                    case 'S'.charCodeAt(0):
                        return 'MOVE_BACKWARD';
                    case 'Q'.charCodeAt(0):
                        return 'MOVE_UP';
                    case 'E'.charCodeAt(0):
                        return 'MOVE_DOWN';
                    case 'D'.charCodeAt(0):
                        return 'MOVE_RIGHT';
                    case 'A'.charCodeAt(0):
                        return 'MOVE_LEFT';
                    default:
                        return undefined;
                }
            }

            // 监听键盘按下事件
            document.addEventListener('keydown', function (e) {
                // 获取键盘返回的标志
                var flagName = getFlagForKeyCode(e.keyCode);
                if (typeof flagName !== 'undefined') {
                    MouseFlag[flagName] = true;
                }
            }, false);

            // 监听键盘弹起时间
            document.addEventListener('keyup', function (e) {
                // 获取键盘返回的标志
                var flagName = getFlagForKeyCode(e.keyCode);
                if (typeof flagName !== 'undefined') {
                    MouseFlag[flagName] = false;
                }
            }, false);

            // 对onTick事件进行监听
            // onTick事件：根据当前配置选项，从当前时间提前计时。应该每个帧都调用tick，而不管动画是否发生。
            // 简单的说就是每过一帧都会执行这个事件
            this.viewer.clock.onTick.addEventListener(function (clock) {
                // 获取实例的相机对象
                let camera = GlobeEngine.viewer.camera;

                if (MouseFlag.LOOKING) {
                    // 获取画布的宽度
                    let width = canvas.clientWidth;
                    // 获取画布的高度
                    let height = canvas.clientHeight;

                    // Coordinate (0.0, 0.0) will be where the mouse was clicked.
                    let x = (mousePosition.x - startMousePosition.x) / width;
                    let y = -(mousePosition.y - startMousePosition.y) / height;
                    let lookFactor = 0.05;

                    camera.lookRight(x * lookFactor);
                    camera.lookUp(y * lookFactor);
                }

                // 获取相机高度
                // cartesianToCartographic(): 将笛卡尔坐标转化为地图坐标，方法返回Cartographic对象，包含经度、纬度、高度
                var cameraHeight = GlobeEngine.scene.globe.ellipsoid.cartesianToCartographic(camera.position).height;
                var moveRate = cameraHeight / 100.0;

                // 如果按下键盘就移动
                if (MouseFlag.MOVE_FORWARD) {
                    camera.moveForward(moveRate);
                }
                if (MouseFlag.MOVE_BACKWARD) {
                    camera.moveBackward(moveRate);
                }
                if (MouseFlag.MOVE_UP) {
                    camera.moveUp(moveRate);
                }
                if (MouseFlag.MOVE_DOWN) {
                    camera.moveDown(moveRate);
                }
                if (MouseFlag.MOVE_LEFT) {
                    camera.moveLeft(moveRate);
                }
                if (MouseFlag.MOVE_RIGHT) {
                    camera.moveRight(moveRate);
                }
            });

        } catch (e) {
            console.log("function initKeyboard exception, error:" + e.message);
        }
    },

    /**
     * 切换至矢量图(天地图)
     */
    switchToVecMap: function () {
        if (this.vecLayer == null) {
            this.vecLayer = this.viewer.imageryLayers.addImageryProvider(
                new Cesium.WebMapTileServiceImageryProvider({
                    url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
                    layer: "tdtVecBasicLayer",
                    style: "default",
                    format: "image/jpeg",
                    tileMatrixSetID: "GoogleMapsCompatible",
                    show: false
                }));
        }
        else {
            alert('矢量图已加载！')
        }
    },

    /**
     * 切换至卫星图(卫星图)
     */
    switchToImgMap: function () {
        //if (this.vecLayer != null && this.vecLayer != "undefined" && this.viewer.imageryLayers.contains(this.vecLayer)) {
        //    this.viewer.imageryLayers.remove(this.vecLayer);
        //    this.vecLayer = null;
        //}
        try {
            if (this.imgLayer == null) {
                this.imgLayer = this.viewer.imageryLayers.addImageryProvider(
                    new Cesium.WebMapTileServiceImageryProvider({
                        url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
                        layer: "tdtBasicLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                        show: false
                    }));
            }
            else {
                alert('影像图已加载！')
            }
        } catch (e) {

        }
    },


    /**
     * 添加路网层到图上
     */
    addRoadLayerToMap: function () {
        if (this.roadLayer == null) {
            this.roadLayer = this.viewer.imageryLayers.addImageryProvider
                (new Cesium.WebMapTileServiceImageryProvider({
                    url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
                    layer: "tdtImgAnnoLayer",
                    style: "default",
                    format: "image/jpeg",
                    tileMatrixSetID: "GoogleMapsCompatible",
                    show: false
                }));
        } else {
            this.viewer.imageryLayers.remove(this.roadLayer);
            this.roadLayer = null;
        }

    },


    position: function () {
        //得到当前三维场景的椭球体
        let ellipsoid = this.scene.globe.ellipsoid;
        let entity = this.viewer.entities.add({
            label: {
                show: false
            }
        });
        let longitudeString = null;
        let latitudeString = null;
        let height = null;
        let cartesian = null;
        // 定义当前场景的画布元素的事件处理
        handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
        //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
        handler.setInputAction(function (movement) {
            //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
            cartesian = GlobeEngine.viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesian) {
                //将笛卡尔坐标转换为地理坐标
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                //将弧度转为度的十进制度表示
                longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                //获取相机高度
                height = Math.ceil(GlobeEngine.viewer.camera.positionCartographic.height);
                entity.position = cartesian;
                entity.label.show = true;
                entity.label.text = '经度：' + longitudeString + '  纬度：' + latitudeString + "  高度：" + height + '';
            } else {
                entity.label.show = false;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //设置鼠标滚动事件的处理函数，这里负责监听高度值变化
        handler.setInputAction(function (wheelment) {
            height = Math.ceil(GlobeEngine.viewer.camera.positionCartographic.height);
            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text = '经度：' + longitudeString + '  纬度：' + latitudeString + "  高度：" + height + '';
        }, Cesium.ScreenSpaceEventType.WHEEL);
    },


    /**
     * 新增标注点
     * @param {any} lon 经度
     * @param {any} lat 纬度
     * @param {any} text 标注名称
     */
    addLabel: function (lon, lat, text) {
        this.viewer.entities.add({
            name: 'labelName',
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 10),
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2
            },
            label: {
                text: text,
                font: '14pt monospace',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.VRButton,
                pixelOffset: new Cesium.Cartesian2(0, 20)
            }
        });
    },

    /**
     * 新增三维模型到场景中
     * @param {any} lon 经度
     * @param {any} lat 纬度
     * @param {any} height 高度
     * @param {any} model 模型URL
     */
    addModel: function (lon, lat, height, model) {
        console.log("新增三维模型,经度：" + lon + " 纬度：" + lat + " 高度：" + height + " 模型地址：" + model);
        //var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        //    Cesium.Cartesian3.fromDegrees(lon, lat, height));
        //var model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
        //    url: model,
        //    modelMatrix: modelMatrix,
        //    scale: 10,
        //    maximumScreenSpaceError: 16 // default value
        //}));

        var model3d = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            model: {
                uri: model,
                scale: 16,
            }
        });
        //this.viewer.trackedEntity = model3d;
    },

    add3DTiled: function () {
        var tileset = this.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: '../../Scripts/Cesuim/Model/Batchedbarrel/tileset.json'
        }));
        this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0));
    },

    /**
     * 定位到指定位置
     * @param {any} lon 经度
     * @param {any} lat 纬度
     * @param {any} height 高度
     */
    flyTo: function (lon, lat, height) {
        //console.log("飞行指定点,经度：" + lon + " 纬度：" + lat + " 高度：" + height);
        this.viewer.camera.flyTo({
            //destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            //orientation: {
            //    heading: Cesium.Math.toRadians(180.0),
            //    pitch: Cesium.Math.toRadians(-30.0),
            //    roll: 0.0
            //}
            destination: Cesium.Cartesian3.fromDegrees(119.413935221201, 25.973872901260, 180.0),
            orientation: {
                heading: Cesium.Math.toRadians(0.0), // 方向
                pitch: Cesium.Math.toRadians(-30.0),// 倾斜角度
                roll: 0
            }
        });
    },


    /**
     * 在地图上绘制点
     * @param {any} point
     */
    drawPoint: function (point) {
        try {
            let entity = this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.CHARTREUSE
                }
            });

            this.entitiesTemp.push(entity);
        } catch (e) {
            console.log("function drawPoint exception, error:" + e.message);
        }
    },

    /**
     * 绘制线段
     * @param {any} start 起点
     * @param {any} end 终点
     * @param {any} show 是否显示距离
     */
    drawLine: function (start, end, show) {
        try {
            let entity = this.viewer.entities.add({
                polyline: {
                    positions: [
                        Cesium.Cartesian3.fromDegrees(start.lon, start.lat),
                        Cesium.Cartesian3.fromDegrees(end.lon, end.lat)
                    ],
                    width: 10.0,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        color: Cesium.Color.CHARTREUSE.withAlpha(0.5)
                    })
                }
            });

            this.entitiesTemp.push(entity);

            if (show) {
                let w = Math.abs(start.lon - end.lon);
                let h = Math.abs(start.lat - end.lat);
                let offsetV = w >= h ? 0.0005 : 0;
                let offsetH = w < h ? 0.001 : 0;
                let distance = Measure.getFlatternDistance(start.lat, start.lon, end.lat, end.lon);

                entity = this.viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(((start.lon + end.lon) / 2) + offsetH, ((start.lat + end.lat) / 2) + offsetV),
                    label: {
                        text: distance.toFixed(3) + '米',
                        font: '22px Helvetica',
                        fillColor: Cesium.Color.WHITE
                    }
                });

                this.entitiesTemp.push(entity);
            }
        } catch (e) {
            console.log("function drawLine exception, error:" + e.message);
        }
    },

    /**
     * 绘制面
     * @param {any} points 坐标点集合
     */
    drawPolygon: function (points) {
        try {
            let pArray = [];
            for (let i = 0; i < points.length; i++) {
                pArray.push(points[i].lon);
                pArray.push(points[i].lat);
            }

            let entity = this.viewer.entities.add({
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(pArray)),
                    material: Cesium.Color.CHARTREUSE.withAlpha(.5)
                }
            });
            this.entitiesTemp.push(entity);
        } catch (e) {
            console.log("function drawPolygon exception, error:" + e.message);
        }
    },


    /**
     * 根据颜色名称获取通道
     * @param {any} colorName 颜色名称
     * @param {any} alpha Alpha值
     */
    getColor: function (colorName, alpha) {
        try {
            let color = Cesium.Color[colorName.toUpperCase()];
            return Cesium.Color.fromAlpha(color, parseFloat(alpha));
        } catch (e) {
            console.log("function getColor exception, error:" + e.message);
        }
    },

    /**
     * 检查点是否在多边形内
     * @param {any} point 检查点
     * @param {any} polygon 多边形点集合
     */
    checkPointInPolygon: function (point, polygon) {
        let c = false;
        for (c = false, i = -1, l = polygon.length, j = l - 1; ++i < l; j = i) {
            ((polygon[i].lat <= point.lat && point.lat < polygon[j].lat) ||
                (polygon[j].lat <= point.lat && point.lat < polygon[i].lat)) &&
                (point.lon < (polygon[j].lon - polygon[i].lon) * (point.lat - polygon[i].lat) / (polygon[j].lat - polygon[i].lat) + polygon[i].lon) &&
                (c = !c);
        }
        return c;
    },


    /**
     * 移动绘制点
     * @param {any} entity
     */
    remove: function (entity) {
        this.viewer.entities.remove(entity);
    },

    /**
     * 销毁事件
     */
    destroyHandler: function () {
        if (this.handler != null) {
            this.handler.destroy();
        }
    },

    /**
     * 
     * @param {any} message
     * @param {any} close
     */
    setTips: function (message, close) {
        try {
            if (close) {
                let entity = this.viewer.entities.getById('tip');
                if (entity != null || entity != "undefined") {
                    this.viewer.entities.remove(entity);
                }
            } else {
                //得到当前三维场景的椭球体
                let ellipsoid = this.scene.globe.ellipsoid;

                let entity = this.viewer.entities.getById('tip');
                if (entity == null || entity == "undefined") {
                    entity = this.viewer.entities.add({
                        id: 'tip',
                        label: {
                            show: false,
                            font: '12px Helvetica',
                        }
                    });
                }
                let longitudeString = null;
                let latitudeString = null;
                let height = null;
                let cartesian = null;
                // 定义当前场景的画布元素的事件处理
                handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
                //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
                handler.setInputAction(function (movement) {
                    //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
                    cartesian = GlobeEngine.viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                    if (cartesian) {
                        //将笛卡尔坐标转换为地理坐标
                        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                        //将弧度转为度的十进制度表示
                        longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                        latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                        //获取相机高度
                        height = Math.ceil(GlobeEngine.viewer.camera.positionCartographic.height);
                        entity.position = cartesian;
                        entity.label.show = true;
                        entity.label.text = message;
                    } else {
                        entity.label.show = false;
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
        } catch (e) {
            console.log("function getColor exception, error:" + e.message);
        }
    },

    /**
     * 设置地图绘制模式
     * @param {any} mode 绘制模式
     */
    setMode: function (mode) {
        if (mode == Mode.POINT) {
            console.log("绘制点");
            this.pointTemp = [];
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                if (cartesian) {
                    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    GlobeEngine.pointTemp.push({ lon: longitudeString, lat: latitudeString });

                    let length = GlobeEngine.pointTemp.length;
                    GlobeEngine.drawPoint(GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 1]);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //右击清除绘制图形
            this.handler.setInputAction(function (click) {
                GlobeEngine.pointTemp = [];
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        else if (mode == Mode.LINE) {
            console.log("绘制线");
            this.pointTemp = [];
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                if (cartesian) {
                    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    GlobeEngine.pointTemp.push({ lon: longitudeString, lat: latitudeString });

                    let length = GlobeEngine.pointTemp.length;
                    GlobeEngine.drawPoint(GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 1]);

                    if (length > 1) {
                        GlobeEngine.drawLine(GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 2], GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 1], true);
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //右击清除绘制图形
            this.handler.setInputAction(function (click) {
                console.log("右键清除方法被调用！");
                console.log(GlobeEngine.pointTemp.length);
                GlobeEngine.pointTemp = [];
                console.log(GlobeEngine.pointTemp.length);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        else if (mode == Mode.POLYGON) {
            console.log("绘制面");
            this.pointTemp = [];
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                if (cartesian) {
                    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    GlobeEngine.pointTemp.push({ lon: longitudeString, lat: latitudeString });

                    let length = GlobeEngine.pointTemp.length;
                    GlobeEngine.drawPoint(GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 1]);

                    if (length > 1) {
                        GlobeEngine.drawLine(GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 2], GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 1], false);
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //右击清除绘制图形
            this.handler.setInputAction(function (click) {
                let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                if (cartesian) {
                    let length = GlobeEngine.pointTemp.length;
                    if (length < 3) {
                        GlobeAlert.info("请选择3个以上的点，再结束绘制面命令！");
                    }
                    else {
                        GlobeEngine.drawLine(GlobeEngine.pointTemp[0], GlobeEngine.pointTemp[GlobeEngine.pointTemp.length - 1], false);
                        GlobeEngine.drawPolygon(GlobeEngine.pointTemp);
                        //highLightAssetsInArea(tempPoints); 高亮选择模型
                        GlobeAlert.info("多边形面积：" + Measure.sphericalPolygonAreaMeters(GlobeEngine.pointTemp).toFixed(3) + " 平方米");
                        GlobeEngine.pointTemp = [];
                    }
                }
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        else if (mode == Mode.CIRCLE) {
            console.log("绘制圆");
            this.pointTemp = [];
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                if (cartesian) {
                    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    GlobeEngine.pointTemp.push({ lon: longitudeString, lat: latitudeString });

                    let length = GlobeEngine.pointTemp.length;

                    if (length == 1) {
                        GlobeEngine.drawPoint(GlobeEngine.pointTemp[0]);
                    } else if (length == 2) {
                        GlobeEngine.drawPoint(GlobeEngine.pointTemp[1]);
                        GlobeEngine.drawLine(GlobeEngine.pointTemp[0], GlobeEngine.pointTemp[1], true);

                        let distance = Measure.getFlatternDistance(GlobeEngine.pointTemp[0].lat, GlobeEngine.pointTemp[0].lon, GlobeEngine.pointTemp[1].lat, GlobeEngine.pointTemp[1].lon);
                        let entity = GlobeEngine.viewer.entities.add({
                            position: Cesium.Cartesian3.fromDegrees(GlobeEngine.pointTemp[0].lon, GlobeEngine.pointTemp[0].lat),
                            ellipse: {
                                semiMinorAxis: distance,
                                semiMajorAxis: distance,
                                height: 0,
                                material: Cesium.Color.fromRandom({ alpha: 0.8 })
                            }
                        });

                        GlobeEngine.entitiesTemp.push(entity);

                        //高亮圈内模型
                        //for (var i = 0; i < loadedModels.length; i++) {
                        //    for (var j = 0; j < models.length; j++) {
                        //        if (loadedModels[i].id == models[j].id && getFlatternDistance(models[j].lat, models[j].lon, tempPoints[0].lat, tempPoints[0].lon) <= distance) {
                        //            loadedModels[i].color = Cesium.Color.SPRINGGREEN;
                        //        }
                        //    }
                        //}

                        setTimeout(function () {
                            let area = (Math.PI * distance * distance).toFixed(3);
                            GlobeAlert.alert("面积是：" + area + " 平方米", 500);
                        });

                        GlobeEngine.pointTemp = [];//清空

                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        else if (mode == Mode.SQUARE) {
            console.log("绘制矩形");
            this.pointTemp = [];
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                if (cartesian) {
                    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    GlobeEngine.pointTemp.push({ lon: longitudeString, lat: latitudeString });

                    let length = GlobeEngine.pointTemp.length;

                    if (length == 1) {
                        GlobeEngine.drawPoint(GlobeEngine.pointTemp[0]);
                    } else if (length == 2) {
                        let distance = Measure.getFlatternDistance(GlobeEngine.pointTemp[0].lat, GlobeEngine.pointTemp[0].lon, GlobeEngine.pointTemp[1].lat, GlobeEngine.pointTemp[1].lon);
                        let entity = GlobeEngine.viewer.entities.add({
                            rectangle: {
                                coordinates: Cesium.Rectangle.fromDegrees(GlobeEngine.pointTemp[0].lon, GlobeEngine.pointTemp[0].lat, GlobeEngine.pointTemp[1].lon, GlobeEngine.pointTemp[1].lat),
                                material: new Cesium.StripeMaterialProperty({
                                    evenColor: Cesium.Color.WHITE,
                                    oddColor: Cesium.Color.BLUE,
                                    repeat: 5
                                })
                            }
                            //position: Cesium.Cartesian3.fromDegrees(),
                            //rectangle: {                                
                            //    height: 0,
                            //    material: Cesium.Color.fromRandom({ alpha: 0.8 })
                            //}
                        });

                        GlobeEngine.entitiesTemp.push(entity);

                        //高亮矩形内模型
                        //for (var i = 0; i < loadedModels.length; i++) {
                        //    for (var j = 0; j < models.length; j++) {
                        //        if (loadedModels[i].id == models[j].id && getFlatternDistance(models[j].lat, models[j].lon, tempPoints[0].lat, tempPoints[0].lon) <= distance) {
                        //            loadedModels[i].color = Cesium.Color.SPRINGGREEN;
                        //        }
                        //    }
                        //}

                        GlobeEngine.pointTemp = [];//清空
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        else if (mode == Mode.PICK) {
            console.log("点选建筑，监控专题");
            this.pointTemp = [];
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let pick = GlobeEngine.scene.pick(click.position);
                if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh)) {
                    //console.log(pick.node._model.id);
                    //console.log(pick.node);
                    //console.log(pick.mesh);
                    let key = pick.node._model.id;
                    if (GlobeEngine.models.containsKey(key) && key.indexOf("All") != -1) {
                        GlobeEngine.unHighLightModel();
                        GlobeEngine.highLightModel(key);


                        // 室内监控测试
                        if (typeof showMonitorIndoor === "function") {
                            //showMonitorIndoor("GymnasiumParking");
                            showMonitorIndoor(key.split("All")[0]);
                        }

                        //let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                        //if (cartesian) {
                        //    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        //    let lon = Cesium.Math.toDegrees(cartographic.longitude);
                        //    let lat = Cesium.Math.toDegrees(cartographic.latitude);
                        //    GlobeEngine.viewer.camera.flyTo({
                        //        destination: Cesium.Cartesian3.fromDegrees(parseFloat(lon), parseFloat(lat) - 0.01, 2000.0),
                        //        orientation: {
                        //            direction: new Cesium.Cartesian3(0.5437275903005284, -0.8386290220423197, -0.03258329225728158),
                        //            up: new Cesium.Cartesian3(0.05520718287689969, -0.00299987805272847, 0.9984704140286108)
                        //        },
                        //        complete: function () {
                        //            if (confirm("你选择的是" + key + "，是否查看详细模型？")) {
                        //                //LoadBim(modelBimId);
                        //            }
                        //            GlobeEngine.unHighLightModel();
                        //        },
                        //    });
                        //}
                    } else {    //点到非建筑楼层，取消高亮
                        GlobeEngine.destroyHandler();
                        GlobeEngine.unHighLightModel();
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        else if (mode == Mode.STUDENT) {
            //console.log("学生专题");
            //this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            //this.handler.setInputAction(function (click) {
            //    let pick = GlobeEngine.scene.pick(click.position);
            //    //console.log(pick.id._id); //点位唯一标识
            //    if (Cesium.defined(pick) && GlobeEngine.students.containsKey(pick.id._id)) {

            //        console.log(pick);
            //        let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
            //        if (cartesian) {
            //            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //            let lon = Cesium.Math.toDegrees(cartographic.longitude);
            //            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            //            let height = cartographic.height;
            //            let picks = Cesium.SceneTransforms.wgs84ToWindowCoordinates(GlobeEngine.scene, cartesian);

            //            //console.log("x:" + picks.x + "  y:" + picks.y);
            //            GlobeEngine.position1 = {
            //                x: picks.x,
            //                y: picks.y
            //            };

            //            GlobeEngine.cartesian2 = cartesian;

            //            if (GlobeEngine.infoDiv) {
            //                console.log("气泡未关闭！");
            //                return false;
            //            } else {
            //                infoDiv = window.document.createElement("div");
            //                infoDiv.id = "trackPopUp";
            //                infoDiv.style.display = "none";

            //                infoDiv.innerHTML = '<div class="map-pop carp" id="trackPopUpContent">\
            //                	<div class="pop-title">教学楼A栋</div>\
            //                	<div class="pop-content">\
            //                		<div class="item"><em>学生总数:</em> <span>1235<abbr>人</abbr></span></div>\
            //                		<div class="item"><em>男生:</em><span>581<abbr>人</abbr></span></div>\
            //                		<div class="item"><em>女生:</em><span>700<abbr>人</abbr></span></div>\
            //                	</div>\
            //                </div>'

            //                window.document.getElementById("cesiumContainer").appendChild(infoDiv);
            //                window.document.getElementById("trackPopUp").style.display = "block";
            //            }
            //        }
            //    } else {
            //        window.document.getElementById("trackPopUp").style.display = "none;";
            //        //GlobeEngine.cartesian2 = null;
            //        console.log("未选中标记");
            //    }
            //}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            //this.scene.postRender.addEventListener(function () {

            //    if (GlobeEngine.cartesian2 != null) {
            //        if (GlobeEngine.position1 != GlobeEngine.position2) {
            //            GlobeEngine.position2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(GlobeEngine.scene, GlobeEngine.cartesian2);
            //            //console.log("2. old x:" + GlobeEngine.position1.x + "old y:" + GlobeEngine.position1.y + "new x:" + GlobeEngine.position2.x + "new y:" + GlobeEngine.position2.y);

            //            var popw = document.getElementById("trackPopUpContent").offsetWidth;
            //            var poph = document.getElementById("trackPopUpContent").offsetHeight;

            //            var trackPopUpContent_ = window.document.getElementById("trackPopUpContent");
            //            var left = GlobeEngine.position2.x - (popw / 2);
            //            var top = GlobeEngine.position2.y - (poph - 10);
            //            trackPopUpContent_.style.left = left + "px";
            //            trackPopUpContent_.style.top = top + "px";
            //        }
            //    }
            //});
        }
        else if (mode == Mode.CAR) {
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            this.handler.setInputAction(function (click) {
                let pick = GlobeEngine.scene.pick(click.position);
                console.log(pick.id._id); //点位唯一标识
                if (Cesium.defined(pick) && (GlobeEngine.parking.containsKey(pick.id._id) || GlobeEngine.gate.containsKey(pick.id._id))) {

                    console.log(pick);
                    let cartesian = GlobeEngine.viewer.camera.pickEllipsoid(click.position, GlobeEngine.scene.globe.ellipsoid);
                    if (cartesian) {
                        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        let lon = Cesium.Math.toDegrees(cartographic.longitude);
                        let lat = Cesium.Math.toDegrees(cartographic.latitude);
                        let height = cartographic.height;
                        let picks = Cesium.SceneTransforms.wgs84ToWindowCoordinates(GlobeEngine.scene, cartesian);
                        let carhtml = "";
                        //console.log("x:" + picks.x + "  y:" + picks.y);
                        GlobeEngine.position1 = {
                            x: picks.x,
                            y: picks.y
                        };

                        GlobeEngine.cartesian2 = cartesian;

                        if (GlobeEngine.infoDiv) {
                            console.log("气泡未关闭！");
                            return false;
                        } else {
                            //GlobeEngine.infoDiv = window.document.createElement("div");
                            //GlobeEngine.infoDiv.id = "trackPopUp";
                            //GlobeEngine.infoDiv.style.display = "none";

                            if (GlobeEngine.parking.containsKey(pick.id._id)) { //停车场
                                carhtml = '<div class="map-pop carp">\
                            	<div class="pop-title">停车场B</div>\
                            	<div class="pop-content">\
                            		<div class="item"><em>总车位:</em> <span>2208<abbr>辆</abbr></span></div>\
                            		<div class="item"><em>剩余车位:</em><span>305<abbr>辆</abbr></span></div>\
                            		<div class="item"><em>使用车位:</em><span>1903<abbr>辆</abbr></span></div>\
                            	</div>\
                            </div>'
                            } else if (GlobeEngine.gate.containsKey(pick.id._id)) { //道闸
                                carhtml = '<div class="map-pop carp2">\
                                	<div class="pop-title">西校门倒闸口</div>\
                                	<div class="pop-content">\
                                		<img src="../img/bz/car_img.png"/>\
                                		<div class="p-right">\
                                 		<div class="item"><em>车主:</em> <span>赵某某</span></div>\
                                 		<div class="item"><em>车牌:</em><span>闽A2W343</span></div>\
                                 		<div class="item"><em>状态:</em><span>进入</span></div>\
                                 		<div class="item"><em>时间:</em><span>12:22</span></div>\
                                 	</div>\
                                	</div>\
                                </div>'
                            }
                            $("#trackPopUp").html(carhtml);
                            //window.document.getElementById("cesiumContainer").appendChild(GlobeEngine.infoDiv);
                            //window.document.getElementById("trackPopUp").style.display = "block";
                        }
                    }
                } else {
                    //GlobeEngine.infoDiv = "";
                    //window.document.getElementById("trackPopUp").style.display = "none;";
                    $("#trackPopUp").html("");
                    //GlobeEngine.cartesian2 = null;
                    console.log("未选中标记");
                }

            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            this.scene.postRender.addEventListener(function () {

                if (GlobeEngine.cartesian2 != null) {
                    if (GlobeEngine.position1 != GlobeEngine.position2) {
                        GlobeEngine.position2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(GlobeEngine.scene, GlobeEngine.cartesian2);
                        //console.log("2. old x:" + GlobeEngine.position1.x + "old y:" + GlobeEngine.position1.y + "new x:" + GlobeEngine.position2.x + "new y:" + GlobeEngine.position2.y);
                        var popw = $(".map-pop").width();
                        var poph = $(".map-pop").height();

                        //var trackPopUpContent_ = window.document.getElementById("trackPopUpContent");
                        var left = GlobeEngine.position2.x - (popw / 2);
                        var top = GlobeEngine.position2.y - (poph - 10);
                        //trackPopUpContent_.style.left = left + "px";
                        //trackPopUpContent_.style.top = top + "px";
                        $(".map-pop").css({
                            "left": left,
                            "top": top
                        })
                    }
                }
            });
        }
        else if (mode == Mode.CLEAR) {
            console.log("清除所有绘制图形");
            try {
                for (let i = GlobeEngine.entitiesTemp.length - 1; i >= 0; i--) {
                    GlobeEngine.remove(GlobeEngine.entitiesTemp[i]);
                    GlobeEngine.entitiesTemp.splice(i, 1);
                }
            } catch (e) {
                console.log("清除图形异常：" + e.message);
                GlobeAlert.error("清除图形异常：" + e.message);
            }

        }
    },


    /**
     * 设置学生专题标记可见性
     */
    setStudentVisiblity: function (value) {
        try {
            let studentKeys = GlobeEngine.students.getKeys();
            for (let k = 0; k < studentKeys.length; k++) {
                if (GlobeEngine.students.containsKey(studentKeys[k])) {
                    let p = GlobeEngine.students.getValue(studentKeys[k]);
                    p.show = value;
                }
            }
        } catch (e) {
            console.log("function setStudentVisiblity exception, error:" + e.message);
        }
    },


    /**
    * 设置车辆专题标记可见性
    */
    setCarVisiblity: function (value) {
        try {
            let parkingKeys = GlobeEngine.parking.getKeys();
            for (let k = 0; k < parkingKeys.length; k++) {
                if (GlobeEngine.parking.containsKey(parkingKeys[k])) {
                    let p = GlobeEngine.parking.getValue(parkingKeys[k]);
                    p.show = value;
                }
            }

            let gateKeys = GlobeEngine.gate.getKeys();
            for (let k = 0; k < gateKeys.length; k++) {
                if (GlobeEngine.gate.containsKey(gateKeys[k])) {
                    let p = GlobeEngine.gate.getValue(gateKeys[k]);
                    p.show = value;
                }
            }
        } catch (e) {
            console.log("function setCarVisiblity exception, error:" + e.message);
        }
    },

    /**
    * 设置室外监控专题标记可见性
    */
    setMonitorVisiblity: function (value) {
        try {
            let monitorKeys = GlobeEngine.monitors.getKeys();
            for (let k = 0; k < monitorKeys.length; k++) {
                if (GlobeEngine.monitors.containsKey(monitorKeys[k])) {
                    let p = GlobeEngine.monitors.getValue(monitorKeys[k]);
                    p.show = value;
                }
            }
        } catch (e) {
            console.log("function setMonitorVisiblity exception, error:" + e.message);
        }
    },

    /**
     * 异步加载精细模型
     */
    asyncLoadModels: function () {
        try {
            $.ajax({
                type: "GET",
                url: "./mode/GetAllModelForLayUIXTree",
                async: false,
                cache: false,
                beforeSend: function (xhr, options) {
                    //$("#divMesage").html('开始从服务器获取数据，请稍后...');
                    //if (1 == 1) //just an example
                    //{
                    //    xhr.abort(); // 停止请求
                    //}
                },
                complete: function () {
                    //  设置 进度条到80%
                    //$("#divMesage").html('执行complete，请稍后...');
                },
                success: function (result) {
                    //$("#divMesage").html('执行success，请稍后...');
                    let treeData = $.parseJSON(result);
                    GlobeEngine.recursiveLoadModel(treeData);
                    //layui.use(['form'], function () {
                    //    var form = layui.form;

                    //    var treeLayer = new layuiXtree({
                    //        elem: 'treeLayer',
                    //        form: form,
                    //        data: treeData,
                    //        isopen: false,  //加载完毕后的展开状态，默认值：true
                    //        ckall: false,   //启用全选功能，默认值：false
                    //        ckallback: function () { },
                    //        icon: {
                    //            //open: "&#xe7a0;",   //节点打开的图标
                    //            //close: "&#xe622;",  //节点关闭的图标
                    //            //end: "&#xe621;"     //末尾节点的图标
                    //        },
                    //        color: {
                    //            //open: "#EE9A00",    //节点图标打开的颜色
                    //            //close: "#EEC591",   //节点图标关闭的颜色
                    //            //end: "#828282"      //末级节点图标的颜色
                    //        },
                    //        click: function (data) {  //节点选中状态改变事件监听，全选框有自己的监听事件                               
                    //            var nodes = treeLayer.GetChildrenNodes(data);
                    //            if (nodes.getSize() > 0) {
                    //                var keys = nodes.getKeys();
                    //                for (var i = 0; i < keys.length; i++) {
                    //                    //console.log(keys[i]);
                    //                    if (GlobeEngine.models.containsKey(keys[i])) {
                    //                        let p = GlobeEngine.models.getValue(keys[i]);
                    //                        p.show = !p.show;
                    //                    }
                    //                }
                    //            } else {    //叶子节点执行本身
                    //                if (GlobeEngine.models.containsKey(data.value)) {
                    //                    let p = GlobeEngine.models.getValue(data.value);
                    //                    p.show = !p.show;
                    //                }
                    //            }
                    //        }
                    //    });
                    //});
                },
                error: function (data) {
                    alert("error:" + data);
                }
            });
        } catch (e) {
            console.log("function asyncLoadModels exception, error:" + e.message);
        }
    },

    /**
     * 递归加载模型数据
     */
    recursiveLoadModel: function (node) {
        try {
            for (let k = 0; k < node.length; k++) {
                let o = node[k];
                if (o.data.length == 0) {    //叶子节点，加载模型
                    if (o.model_url == "" || o.model_url == "undefined") {
                        console.log("节点[" + o.title + "]的模型地址为空，请检查！");
                    }
                    else {
                        //GlobeEngine.addModel(119.41364195, 25.97813248 + 0.5, -500, o.model_url);
                        //setTimeout(function () { }, 1000); //暂停1秒
                        //let lon = 119.41364195;
                        //let lat = 25.97813248 + 0.5;
                        //let height = -500;

                        let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
                            Cesium.Cartesian3.fromDegrees(o.lon, o.lat, o.height));
                        let model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
                            id: o.value,
                            name: o.title,
                            url: o.model,
                            modelMatrix: modelMatrix,
                            scale: o.scale,
                            allowPicking: true,
                            //minimumPixelSize: 100,
                            //maximumScale: 2000,
                            debugWireframe: false,
                            //color: Cesium.Color.fromAlpha(Cesium.Color.GREEN, parseFloat(0.8)),//模型颜色，透明度
                            //silhouetteColor: Cesium.Color.fromAlpha(Cesium.Color.GREEN, parseFloat(0.5)),//轮廓线
                            //colorBlendMode: Cesium.ColorBlendMode.MIX,//模型样式['Highlight', 'Replace', 'Mix']
                            maximumScreenSpaceError: 16 // default value
                        }));
                        GlobeEngine.models.add(o.value, model); //全局变量，用于树节点选择控制模型
                        //console.log("load 3d model, lon：" + o.lon + " lat：" + o.lat + " height：" + o.height + " model url：" + o.model);
                    }
                }
                else {
                    GlobeEngine.recursiveLoadModel(o.data);
                }
            }
        } catch (e) {
            console.log("function recursiveLoadModel exception, error:" + e.message);
        }
    },


    /**
     * 异步加载监控点
     */
    asyncLoadMonitor: function () {
        try {
            $.ajax({
                type: "GET",
                url: "./mode/GetAllMonitorForUI",
                async: false,
                cache: false,
                success: function (result) {
                    //console.log(result);
                    let monitorData = $.parseJSON(result);
                    //                  console.log(monitorData);
                    for (let k = 0; k < monitorData.length; k++) {
                        if (monitorData[k].lon.length > 0 && monitorData[k].lat.length > 0) {
                            GlobeEngine.addMonitor(monitorData[k]);
                        }
                    }
                },
                error: function (data) {
                    alert("error:" + data);
                }
            });
        } catch (e) {
            console.log("function asyncLoadMonitor exception, error:" + e.message);
        }
    },

    /**
     * 添加单个监控点
     */
    addMonitor: function (data) {
        try {
            if (!GlobeEngine.monitors.containsKey(data.code)) {
                let image = new Image();
                image.onload = function () {
                    let monitor = GlobeEngine.viewer.entities.add({
                        id: data.code,
                        name: data.name,
                        position: Cesium.Cartesian3.fromDegrees(data.lon, data.lat, data.height),
                        billboard: {
                            scaleByDistance: new Cesium.NearFarScalar(800, 0.8, 800, 0.0),
                            image: image
                        },
                        label: {
                            text: data.name,
                            font: '16px sans-serif',
                            showBackground: true,
                            backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
                            backgroundPadding: new Cesium.Cartesian2(1, 1),
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            pixelOffset: new Cesium.Cartesian2(0.0, -image.height / 3.4),
                            scaleByDistance: new Cesium.NearFarScalar(800, 1.0, 800, 0.0),
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth: 2
                        }
                    });
                    GlobeEngine.monitors.add(data.code, monitor);
                };
                image.src = data.url;
            }
        } catch (e) {
            console.log("function addMonitor exception, error:" + e.message);
        }
    },

    /**
     * 异步加载区域学生数
     */
    asyncLoadStudent: function () {
        try {
            $.ajax({
                type: "GET",
                url: "./mode/GetRealRegionStudents",
                async: false,
                cache: false,
                success: function (result) {
                    //console.log(result);
                    let studentData = $.parseJSON(result);
                    if (studentData.state == "success") {
                        for (let k = 0; k < studentData.data.length; k++) {
                            if (studentData.data[k].lon.length > 0 && studentData.data[k].lat.length > 0) {
                                GlobeEngine.addStudent(studentData.data[k]);
                            }
                        }
                    } else {
                        alert(studentData.message);
                    }
                },
                error: function (data) {
                    alert("error:" + data);
                }
            });
        } catch (e) {
            console.log("function asyncLoadStudent exception, error:" + e.message);
        }
    },

    /**
     * 添加单个学生区域点
     */
    addStudent: function (data) {
        try {
            if (!GlobeEngine.students.containsKey(data.id)) {
                var color = Cesium.Color.fromRandom({
                    minimumRed: 1,
                    minimumGreen: 1,
                    minimumBlue: 1,
                    alpha: 1.0
                });

                let image = new Image();
                image.onload = function () {
                    let student = GlobeEngine.viewer.entities.add({
                        id: data.id,
                        name: data.total_count,
                        position: Cesium.Cartesian3.fromDegrees(data.lon, data.lat, data.height),
                        billboard: {
                            scaleByDistance: new Cesium.NearFarScalar(800, 1.0, 800, 0.0),
                            image: image
                        },
                        label: {
                            text: data.total_count,
                            //font: '16px Helvetica',
                            font: '16px sans-serif',
                            fillColor: color,
                            showBackground: true,
                            backgroundColor: new Cesium.Color(13 / 255, 57 / 255, 88 / 255, 1),
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            backgroundPadding: new Cesium.Cartesian2(0, 0),
                            pixelOffset: new Cesium.Cartesian2(25, 5),
                            //pixelOffsetScaleByDistance: new Cesium.NearFarScalar(200, 1.0, 1000, 0.0),
                            scaleByDistance: new Cesium.NearFarScalar(800, 1.0, 800, 0.0),
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth: 2
                        }
                    });
                    GlobeEngine.students.add(data.id, student);
                };
                image.src = data.icon_url;
            }
        } catch (e) {
            console.log("function addMonitor exception, error:" + e.message);
        }
    },

    /**
     * 新增一个标记
     */
    addTag: function (id, name, lon, lat, height, url) {
        try {
            if (!GlobeEngine.parking.containsKey(id)) {
                let image = new Image();
                image.onload = function () {
                    let pos = GlobeEngine.viewer.entities.add({
                        id: id,
                        name: name,
                        position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
                        billboard: {
                            scaleByDistance: new Cesium.NearFarScalar(200, 1.0, 1000, 0.0),
                            image: image
                        },
                        label: {
                            text: name,
                            font: '16px sans-serif',
                            //font: '12pt monospace',
                            showBackground: true,
                            backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            pixelOffset: new Cesium.Cartesian2(0.0, -image.height / 1.5),
                            pixelOffsetScaleByDistance: new Cesium.NearFarScalar(200, 1.0, 1000, 0.0),
                            scaleByDistance: new Cesium.NearFarScalar(200, 1.0, 1000, 0.0),
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth: 2
                        }
                    });
                    GlobeEngine.parking.add(id, pos);
                };
                image.src = url;
            }
        } catch (e) {
            console.log("function addParking exception, error:" + e.message);
        }
    },

    /**
     * 停车场
     */
    addParkingLot: function (id, name, lon, lat, height, url) {
        try {
            if (!GlobeEngine.parking.containsKey(id)) {
                let image = new Image();
                image.onload = function () {
                    let pos = GlobeEngine.viewer.entities.add({
                        id: id,
                        name: name,
                        position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
                        billboard: {
                            scaleByDistance: new Cesium.NearFarScalar(800, 0.8, 800, 0.0),
                            image: image
                        },
                        label: {
                            text: name,
                            font: '16px sans-serif',
                            showBackground: true,
                            backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
                            backgroundPadding: new Cesium.Cartesian2(0, 0),
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            pixelOffset: new Cesium.Cartesian2(0.0, -image.height / 3.4),
                            scaleByDistance: new Cesium.NearFarScalar(800, 1.0, 800, 0.0),
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth: 2
                        }
                    });
                    GlobeEngine.parking.add(id, pos);
                };
                image.src = url;
            }
        } catch (e) {
            console.log("function addParkingLot exception, error:" + e.message);
        }
    },

    /**
     * 道闸
     */
    addBarrierGate: function (id, name, lon, lat, height, url) {
        try {
            if (!GlobeEngine.gate.containsKey(id)) {
                let image = new Image();
                image.onload = function () {
                    let pos = GlobeEngine.viewer.entities.add({
                        id: id,
                        name: name,
                        position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
                        billboard: {
                            scaleByDistance: new Cesium.NearFarScalar(800, 0.8, 800, 0.0),
                            image: image
                        },
                        label: {
                            text: name,
                            font: '16px sans-serif',
                            showBackground: true,
                            backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
                            backgroundPadding: new Cesium.Cartesian2(0, 0),
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            pixelOffset: new Cesium.Cartesian2(0.0, -image.height / 3.4),
                            scaleByDistance: new Cesium.NearFarScalar(800, 1.0, 800, 0.0),
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth: 2
                        }
                    });
                    GlobeEngine.gate.add(id, pos);
                };
                image.src = url;
            }
        } catch (e) {
            console.log("function addBarrierGate exception, error:" + e.message);
        }
    },


    loadGeoJson: function () {

        this.viewer.dataSources.add(Cesium.GeoJsonDataSource.load('Models/map.geojson'));
    },

    loadKml: function () {

        this.viewer.dataSources.add(Cesium.KmlDataSource.load('Models/map.kml'));
    },

    /**
     * 高亮模型
     */
    highLightModel: function (modelId) {
        try {
            if (GlobeEngine.models.containsKey(modelId)) {
                let p = GlobeEngine.models.getValue(modelId);
                p.color = Cesium.Color.SPRINGGREEN; //高亮颜色
            }
        } catch (e) {
            console.log("function highLightModel exception, error:" + e.message);
        }
    },

    /**
     * 取消高亮模型
     */
    unHighLightModel: function () {
        try {
            let keys = GlobeEngine.models.getKeys();
            for (let k = 0; k < keys.length; k++) {
                let p = GlobeEngine.models.getValue(keys[k]);
                p.color = {
                    red: 1,
                    green: 1,
                    blue: 1,
                    alpha: 1
                };
            }
        } catch (e) {
            console.log("function unHighLightModel exception, error:" + e.message);
        }
    }

};




function zoomToExtent() {

    view.camera.setView({
        destination: Cesium.Rectangle.fromDegrees(119.41364195 - 0.5, 25.97813248 - 0.5, 119.41364195 + 0.5, 25.97813248 + 0.5),
        orientation: {
            heading: Cesium.Math.toRadians(20.0), // 方向
            pitch: Cesium.Math.toRadians(-90.0),// 倾斜角度
            roll: 0
        }
    });
}


if (typeof Mode == "undefined") {
    var Mode = {
        NONE: 0,
        POINT: 1,
        LINE: 2,
        POLYGON: 3,
        CIRCLE: 4,
        SQUARE: 5,
        PICK: 6,    //点选建筑,室外监控
        STUDENT: 7, //学生专题
        CAR: 8,     //车辆专题
        CLEAR: 99
    }
}

window.GlobeEngine = GlobeEngine;

