var app = new Vue({
  	el: '#App',
  	data: {
    	isShow:1, //设置哪个模块展示
    	monitorUrl:[{ //首页监控地址
    		url:"./video/A地外-22_NVR_2016-08-10 08-30-00_2016-08-10 08-30-20_0.mp4"
    	},{
    		url:"./video/B地外-1_NVR_2016-08-10 08-30-00_2016-08-10 08-30-20_0.mp4"
    	},{
    		url:"./video/B地外-12_NVR_2016-08-10 08-30-00_2016-08-10 08-30-20_0.mp4"
    	},{
    		url:"./video/B地外-13_NVR_2016-08-10 08-30-00_2016-08-10 08-30-20_0.mp4"
    	}],
    	weather:[], //天气
    	studentNum:[], //实时学生数
    	time:{},
    	studentAll:0,
    	carNum:[],   //实时汽车数
    	carAll:0,
    	absenteeism:0,  //旷课人数
    	leave:0, //请假人数
    	late:0, //迟到人数
    	abnormalList:[], //异常学生
    	studentOut:[],  //出校学生
    	studentIn:[],	//入校学生
    	walksNum:0,		//走读生
    	leavesNum:0,	//请假生
    	studentOutInDetail:[], //出入校数据
    	carList:[],//实时车辆数据
    	timeFlag:4,//车流量分析标识  年月日时
    	dormitory:[], //宿舍报表数据
    	dormitoryDetail:[],//不同宿舍楼的详情
    	realCar:[], //实时车辆数据  取前5条
    	screenFlag:false, //全屏标识
    	carDetail:[], //不同月份的车辆详情
    	monitor:[],		//室外监控信息
    	monitorOut:0,	//室外监控数量
    	monitorIn:0,	//室内监控数量
    	monitorCount:[],	//室内监控信息
    	monitorDetail:[],	//室内监控详情
    	floorName:"体育馆",  //监控展示的当前名称
    	monitorName:"摄像头001号",
    	showFlag:false,
    	monitorMUrl:"./video/A地外-22_NVR_2016-08-10 08-30-00_2016-08-10 08-30-20_0.mp4",
    	ops:{  //滚动条设置
    		bar: {
    			vBar: {
			      background: "#000",
			      keepShow:true,
			      opacity: 1,
			      hover: false
			    },
    		}
    	}
  	},
  	mounted(){
  		let _this = this;
  		
  		this.initHome();//默认初始化主页信息
  		//首页时间模块
  		if(this.time){ 
  			clearInterval(_this.time);
  		}
		this.time = setInterval(function(){
			_this.time = new Date();
		},1000)
		//屏幕缩放初始化
		$(window).resize(function () {
		    _this.resizeWidth();
		});
		window.onload=function(){
			$(".loading-pop").fadeOut();
	        _this.resizeWidth();
		}
				
		//地图数据加载
		GlobeEngine.init();
		GlobeEngine.asyncLoadModels();
		GlobeEngine.asyncLoadMonitor(); //打开室外监控点层
		GlobeEngine.asyncLoadStudent(); //打开学生区域标记
		GlobeEngine.addParkingLot('parking', '停车场', 119.413544157165, 25.976865421674, 6, '../img/bz/icon_parking_lot.png');   //打开停车场
		GlobeEngine.addBarrierGate('gate', '道闸', 119.413679811116, 25.976920168456, 6, '../img/bz/icon_barrier_gate.png');      //打开道闸
  	},
  	computed:{
  		//当前时间
  		nowTime(){
  			return API.formatDateHour(this.time);
  		},
  		//星期几
  		week(){
			if (new Date().getDay() == 0) {
                return API.formatDateYear(this.time) + "    星期日";
            } else {
            	return API.formatDateYear(this.time) + "    星期"+ new Date().getDay();
            }
  		},
  	},
  	//过滤器
  	filters: {
  		//返回异常类型
	  	remark(value) {
	  		if(value == 2){
	  			return "迟到"
	  		}else if(value == 3){
	  			return "旷课"
	  		}else if(value == 4){
	  			return "请假"
	  		}
	  	},
	  	//返回性别
	  	sexData(value){
	  		if(value == 1){
	  			return "男"
	  		}else{
	  			return "女"
	  		}
	  	},
	  	//返回时间格式
	  	showTime(value){
	  		return API.formatDateHour(parseInt(value));
	  	},
	  	showAllTime(value){
	  		return API.formatDateTime(parseInt(value));
	  	},
	  	//返回学生状态
	  	showStatus(value){
	  		if(value == 0){
	  			return "出"
	  		}else{
	  			return "进"
	  		}
	  	}
	},
  	methods:{
  		//点击菜单切换不同专题
  		setShow(num){
  			let _this = this;
			if(_this.showFlag){
				_this.isShow = num;
				if(num == 1){
					clearInterval(this.setStudentTime);
					clearInterval(this.setCarTime);
					_this.showFlag = false;
					this.initHome();
					GlobeEngine.setStudentVisiblity(true);
		            GlobeEngine.setCarVisiblity(true);
		            GlobeEngine.setMonitorVisiblity(true);
		
		            GlobeEngine.destroyHandler();
		            GlobeEngine.setMode(Mode.NONE);
	  			}else if(num ==2){
	  				clearInterval(this.setHomeTime);
					clearInterval(this.setCarTime);
					_this.showFlag = false;
					this.initStudent();
					GlobeEngine.setStudentVisiblity(true);
		            GlobeEngine.setCarVisiblity(false);
		            GlobeEngine.setMonitorVisiblity(false);
		            GlobeEngine.destroyHandler();
		            GlobeEngine.setMode(Mode.STUDENT);
	  			}else if(num ==3){
	  				clearInterval(this.setHomeTime);
					clearInterval(this.setStudentTime);
					_this.showFlag = false;
					this.initCar();
					GlobeEngine.setStudentVisiblity(false);
		            GlobeEngine.setCarVisiblity(true);
		            GlobeEngine.setMonitorVisiblity(false);
		            GlobeEngine.destroyHandler();
		            GlobeEngine.setMode(Mode.CAR);
	  			}else if(num ==4){
					this.initMonitor();
					_this.showFlag = false;
					GlobeEngine.setStudentVisiblity(false);
		            GlobeEngine.setCarVisiblity(false);
		            GlobeEngine.setMonitorVisiblity(true);
		            GlobeEngine.destroyHandler();
		            GlobeEngine.setMode(Mode.PICK);
	  			}
  			}
  		},
//		主页
  		initHome() {
  			let _this = this;
  			setTimeout(function(){
  				_this.showFlag = true;
  			},3000)
		  	this.$nextTick(function(){
		  		_this.getApi();
			  	_this.getStudentNum();
			  	_this.getCarNum();
		  		_this.getAbnormal("main1","main2");
		  		_this.getCarVehicles("main4");
		  		_this.getVehicle("main5",3);
		  		_this.getAllDormitoryInfo("main3");
		  	})
		  	if(this.setHomeTime){
		  		clearInterval(this.setHomeTime);
		  	}
		  	this.setHomeTime = setInterval(function(){
			  	_this.getStudentNum();
			  	_this.getCarNum();
		  		_this.getAbnormal("main1","main2");
		  		_this.getCarVehicles("main4");
		  		_this.getVehicle("main5",3);
		  		_this.getAllDormitoryInfo("main3");
		  	},20000)
		  		
		},
		//学生
		initStudent(){
			let _this = this;
			setTimeout(function(){
  				_this.showFlag = true;
  			},3000)
			this.$nextTick(function(){
				_this.getAbnormalDetail(2);
				_this.getOutInSchool();
				_this.getAbnormal("","main6");
		  		_this.getAllDormitoryInfo("main7");
		  		_this.getDormitoryDetail(1);
			})
			if(this.setStudentTime){
				clearInterval(this.setStudentTime);
		  	}
			this.setStudentTime = setInterval(function(){
				_this.getAbnormalDetail(2);
				_this.getOutInSchool();
				_this.getAbnormal("","main6");
		  		_this.getAllDormitoryInfo("main7");
		  		_this.getDormitoryDetail(1);
			},20000)
		},
		//车辆
		initCar(){
			let _this = this;
			setTimeout(function(){
  				_this.showFlag = true;
  			},3000)
			this.$nextTick(function(){
				_this.getCarVehicles("main8");
				_this.getCarByMonth("main9");
				_this.getVehicle("main10",4);
				_this.getAllCarData();
				_this.getRealTimeCar();
				_this.getCarDetailMonth(new Date().getMonth()+1);
			})
			if(this.setCarTime){
		  		clearInterval(this.setCarTime);
		  	}
			this.setCarTime = setInterval(function(){
				_this.getCarVehicles("main8");
				_this.getCarByMonth("main9");
				_this.getVehicle("main10",4);
				_this.getAllCarData();
				_this.getRealTimeCar();
			},20000)
		},
		//监控
		initMonitor(){
			let _this = this;
			setTimeout(function(){
  				_this.showFlag = true;
  			},3000)
			this.$nextTick(function(){
				_this.getMonitor();
				_this.getMonitorOutCount();
				_this.getMonitorDetail(1);
			})
		},
		//获得天气
		getApi(){
			let _this = this;
		    axios.post('./mode/GetRealWeatherAndAQI').then(function (res) {
		    	_this.weather = res.data.data[0];
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获得在校学生总数
		getStudentNum(){
			let _this = this;
		    axios.post('./mode/GetRealRegionStudents').then(function (res) {
		    	 _this.studentAll = 0;
		    	 _this.studentNum = 0;
		    	$.each(res.data.data, function() {
					_this.studentAll += parseInt(this.total_count);
				});
				_this.studentNum = _this.studentAll.toString().split("");
				while(_this.studentNum.length <4){
					_this.studentNum.unshift("0")
				}
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获取实时在校车辆信息数据
		getCarNum(){
			let _this = this;
		  	axios.post('./mode/GetRealSchoolVehicles').then(function (res) {
//		  		console.log(res)
		  		_this.carNum = [];
		  		_this.carAll = 0;
		    	$.each(res.data.data, function() {
					_this.carAll += parseInt(this.total);
				});
				_this.carNum = _this.carAll.toString().split("");
				while(_this.carNum.length <4){
					_this.carNum.unshift("0")
				}
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获取学生异常信息
		getAbnormal(id1,id2){
			let _this = this;
			axios.post('./mode/GetRealAbnormalReport').then(function (res) {
//		  		console.log(res.data.data)
		  		let num = 0;
		  		$.each(res.data.data, function(index) {
					if(this.check_remark != 1){
						num += parseInt(this.total);
						if(this.check_remark  == 2){
							_this.late = this.total
						}else if(this.check_remark  == 3){
							_this.absenteeism = this.total
						}else if(this.check_remark  == 4){
							_this.leave = this.total
						}
					}
				});
				if(id1){
					_this.pictorialChart(id1,[_this.late,_this.absenteeism,_this.leave]);
				}
				if(id2){
					_this.pieChart(id2,num,[_this.late,_this.absenteeism,_this.leave]);
				}
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//车辆性质分析
		getCarVehicles(id){
			let _this = this;
			axios.post('./mode/GetRealSchoolVehiclesCategory').then(function (res) {
		  		let data = [];
		  		$.each(res.data.data, function () {
			        data.push({
			            value: this.total,
			            name: this.car_type
			        })
			    });
		  		_this.funnelChart(id,data);
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//车流统计分析  type 1年2月3日4时
		getVehicle(id,type){
			let _this = this;
			axios.post('./mode/GetVehicleByTimePeriod',{periodType: type}).then(function (res) {
		  		let xdata = [], data = [];
	            $.each(res.data.data, function () {
	                xdata.push(this.time_field);
	                if (!this.total) {
	                    data.push(0);
	                } else {
	                    data.push(this.total);
	                }
	            });
	            _this.lineChart(id,xdata,data);
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//type 异常类型 2 迟到 3 旷课 4请假
		getAbnormalDetail(type) {
//			console.log(type)
		 	let _this = this;
		 	axios.post('./mode/GetRealAbnormalDetail',{abnormalType: type}).then(function (res) {
		 		_this.abnormalList = res.data.data;
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//出入校园
		getOutInSchool(){
			let _this = this;
			axios.post('./mode/GetCardRecord').then(function (res) {
				console.log(res)
				_this.walksNum = 0;
				_this.leavesNum = 0; 
				$.each(res.data.data,function(){
					if (this.extern_record == "是" && this.outin_flag == "刷卡出门") {
                        _this.walksNum++;
                    }else if(this.extern_record == "否" && this.outin_flag == "刷卡出门"){
                        _this.leavesNum++;
                    }
                    if (this.outin_flag == "刷卡出门") {
                    	_this.studentOut.push(this)
                    }else{
                    	_this.studentIn.push(this)
                    }
				})
				_this.studentOutInDetail = _this.studentOut;
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//实时车辆详情
		getAllCarData(){
			let _this = this;
			axios.post('./mode/GetAllCarData').then(function (res) {
				_this.carList = res.data.data;
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//宿舍进出信息
		getAllDormitoryInfo(id){
			let _this = this;
		    axios.post('./mode/GetAllDormitoryInfo').then(function (res) {
		    	_this.dormitory = res.data.data;
		    	let xdata = [];
		    	let ydata1 = [];
		    	let ydata2 = [];
		    	$.each(_this.dormitory,function(){
		    		xdata.push(this.name);
		    		ydata1.push(this.in_count);
		    		ydata2.push(this.out_count);
		    	})
		    	_this.doubleBarChart(id,xdata,ydata1,ydata2);
		  	}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获得宿舍楼详情
		//type 宿舍楼号
		getDormitoryDetail(type){
			let _this = this;
			axios.post('./mode/GetStudent4Dormitory',{dormitoryId:type}).then(function (res) {
			 	_this.dormitoryDetail = res.data.data;
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获得实时车辆信息
		getRealTimeCar(){
			let _this = this;
			axios.post('./mode/GetLastFiveCarInfo').then(function (res) {
//				_this.realCar = [];
//				setTimeout(function(){
//					_this.realCar = res.data.data;
//				},50)
				_this.realCar = res.data.data;
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//历史车辆信息
		getCarByMonth(id){
			let _this = this;
			axios.post('./mode/GetCarHistoryStatistic').then(function (res) {
				let times = [];
				let car =  {};
				let legend = [];
				res.data.data.sort(function(a,b){
					return a.time.charCodeAt(0) - b.time.charCodeAt(0)
				})
			    $.each(res.data.data,function(){
			    	times.push(this.time);
			    	let temporary = JSON.parse(this.data);
			    	$.each(temporary.data, function() {
			    		if (!car[this.car_type]) {
				            car[this.car_type] = {
				              title: this.car_type,
				              items: []
				            }
			            }
			    		car[this.car_type].items.push(this.count);
			    	});
			    })
			    let service = [];
			    $.each(car, function() {
			    	service.push({
			            name: this.title,
			            type: 'bar',
			            stack: '总量',
			            barWidth: 12,
			            data: this.items
			        });
			        legend.push(this.title);
			    });
			    _this.stackedChart(id,times,service,legend)
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//根据月份获得车辆详情
		getCarDetailMonth(month){
			let _this = this;
			axios.post('./mode/GetCarInOutCountByMonth',{month:month}).then(function (res) {
				_this.carDetail = res.data.data;
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获得室外监控数据
		getMonitor(){
			let _this = this;
			axios.post('./mode/GetAllMonitorForUI').then(function (res) {
				_this.monitor = {};
				_this.monitorOut = 0;
				$.each(res.data, function() {
					if(!_this.monitor[this.address]){
						_this.monitor[this.address] = {
				            title: this.address,
				            items:[]
						}
					}
					if(_this.monitor[this.address].title == this.address){
						_this.monitor[this.address].items.push(this)
					}
					_this.monitorOut ++;
				});
//				$.each(res.data.data, function() {
//					let that = this;
//					if(this.pid == -1){
//						_this.monitor[this.name] = {
//			              title: this.name,
//			              id :this.id,
//			              items: []
//			            }
//					}else{
//						$.each(_this.monitor, function() {
//							if(this.id == that.pid){
//								this.items.push(that);
//							}
//						});
//					}
//				});
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获得室内监控信息
		getMonitorOutCount(){
			let _this =this;
			axios.post('./mode/GetMonitorIndoorByRegion').then(function (res) {
				_this.monitorCount = res.data.data;
				let vdata = [];
				let sdata = [];
				_this.monitorIn = 0;
				$.each(_this.monitorCount,function(){
					vdata.push(this.name);
					sdata.push(this.count)
					_this.monitorIn +=  parseInt(this.count)
				})
				_this.hBarChart("main11",vdata,sdata);
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
		//获得室内监控详情
		getMonitorDetail(id){
			let _this = this;
			axios.post('./mode/GetMonitorIndoorByBId',{bId:id}).then(function (res) {
//				console.log(res)
				let x = [];
				let s = [];
				_this.monitorDetail = [];
				$.each(res.data.data,function(){
					x.push({ name:this.name, max: 10 })
					s.push(this.count);
					let item = JSON.parse(this.data).data;
					let name = this.name;
					$.each(item,function(){
						Vue.set(this,"title",name);
						_this.monitorDetail.push(this);
					})
				})
				_this.radarMapChart("main12",x,s);
			}).catch(function (error) {
		    	console.log(error);
		  	});
		},
//		showMonitor(data){
//			if(data.show){
//				Vue.set(data,"show",false)
//			}else if(!data.show){
//				Vue.set(data,"show",true)
//			}
//		},
		//出入校信息切换
		switchStatus(num){
			if(num == 1){
				this.studentOutInDetail = this.studentOut;
			}else{
				this.studentOutInDetail = this.studentIn;
			}
		},
		//年月日时 车流信息切换
		switchTime(num){
			this.getVehicle("main10",num);
			this.timeFlag = num;
		},
		//点击监控出弹窗
		showVideo(vurl){
			let z = '<div class="video-pop"><video src="' + vurl + '" autoplay="autoplay" loop="loop"></video></div>'
            layui.use(['layer'], function () {
                let layer = layui.layer;
                //页面层-自定义
                layer.open({
                    type: 1,
                    title: "视频监控",
                    resize: false,
                    scrollbar: false,
                    area: ['1268px', '800px'],
                    shade: 0.8,
                    skin: 'monitor-class',
                    content: z
                });
            });
		},
		//全屏事件
		screenFull(){
			this.screenFlag = !this.screenFlag;
			if(this.screenFlag){
				API.launchFullscreen();
			}else{
				 API.exitFullscreen();
			}
		},
		//定位
		locateMap(){
			GlobeEngine.flyTo(119.41364195, 25.97813248, 10000);
		},
		showMonitor(name,murl){
			this.monitorName = name;
			this.monitorMUrl = murl;
		},
//		象形图
  		pictorialChart(id,data){
  			if(!this.myChart1){
  				this.myChart1 = echarts.init(document.getElementById(id));
  			}
  			let option = {
		        grid: {
		            left: "20%",
		            top: "5%",
		            bottom: "15%",
		            right: "18%"
		        },
		        tooltip: {
		            trigger: "item",
		            textStyle: {
		                fontSize: 14
		            },
		            formatter: "{b0}:{c0}"
		        },
		        xAxis: {
		            splitLine: { show: false },
		            axisLine: { show: false },
		            axisLabel: { show: false },
		            axisTick: { show: false }
		        },
		        yAxis: [{
		            type: "category",
		            inverse: false,
		            data: ["迟到人数", "旷课人数", "请假人数",],
		            axisLine: { show: false },
		            axisTick: { show: false },
		            axisLabel: {
		                margin: -4,
		                textStyle: {
		                    color: "#fff",
		                    fontSize: 14
		                }
		            }
		        },],
		        series: [{
		            type: "pictorialBar",
		            symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAADYElEQVR4nO2dz0sUYRjHP7tIdAmxQ1LdlhCKMohAIsgiyEuHjkUEFQTlpejS/xCCBB06RBGBBKIG4cGyH0qHBKE9eKyFqBQPRQeNCt06vGNY7bq7szPfeZLnAwuzM+/zgw/DDvMu70wOIVveLscJOwycA44A24CfwAfgKXAbeFVvovlC/o/vuVwuTj+x0FWiYdGbgXvA8RrjHgAXgIVaCbMU3SKr1BhtwEtgZx1jTwI7gG7ga5pNNUO+9pBMuEN9klfYD9xMqZdEsCj6AHAiRtxZYFeyrSSHRdGnYsblCD8jJrEoek8TsbsT6yJhLIrelFFsqlgUPZtRbKpYFP2kidjxxLpIGIuiB4AvMeLmgJGEe0kMi6I/AVdjxPVSx91hVlgUDXAXuEaY16jFMnAJeJhqR01iVTTAdeAYUFxjzBRwCLgl6agJrM51rDAO7AP2EmbxthPO8vfAc2Ams84axLpoCGKLrH1mm8eC6KPAGaAL2Fpj7AZgY7T9DfhRY/wc4eflPmH+OjOynI8uEGbpukXlJ4Dz84V8aWWHcj46q4thFzCNTjJRren2UrlLWPM3WYjuAMYIk/tq2oCx9lK5Q11YLboFGARaxXVX0woMtpfK0uuTWvRFoFNcsxKdhF5kqEX3iuuthbQXtehG/gdMG2kvlm/B1xUuWoSLFmFF9CRwg2TnM4pRzskEc8bGiugR4ArhNjkpJqKcJv51sSJ63eOiRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEWvTHKvs/p1izWu5qvaSCWvTlCvtmgeEUaw5TeUVtpV5SQy16COgBRoHXhMWb3aS7PnAhqjEQ1RwFeuYL+aEUa/5DFmtYHkefOEwQVmcBvKD+FQNvgNN/P+pHiV8MRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEixbhokVYEx3nudGKXE1jTfS6xUWLcNEiXLQIFy3CRYtw0SJctAgXLcJFi3DRIv430eUq2+axJvp7jePPqmzHySXFmuhHwFKVYzNA/6rv/VR/s9BSlMsM1kTPEN4DPkU4I8vAO6APOAgsrhq7GO3ri8aUo5ipKIep1zv9AtipgOACGIrLAAAAAElFTkSuQmCC",
		            symbolRepeat: "fixed",
		            symbolMargin: "-25%",
		            symbolClip: true,
		            symbolSize: 30,
		            symbolPosition: "start",
		            label: {
		                normal: {
		                    show: true,
		                    position: 'right',
		                    color: "#4fc4f6",
		                    fontSize: 14,
		                    formatter: "{c0}人"
		                },
		            },
		            data: data,
		        },
		        {
		            type: "pictorialBar",
		            itemStyle: {
		                normal: {
		                    opacity: 0.3
		                }
		            },
		            animationDuration: 0,
		            symbolRepeat: "fixed",
		            symbolMargin: "-25%",
		            symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAADYElEQVR4nO2dz0sUYRjHP7tIdAmxQ1LdlhCKMohAIsgiyEuHjkUEFQTlpejS/xCCBB06RBGBBKIG4cGyH0qHBKE9eKyFqBQPRQeNCt06vGNY7bq7szPfeZLnAwuzM+/zgw/DDvMu70wOIVveLscJOwycA44A24CfwAfgKXAbeFVvovlC/o/vuVwuTj+x0FWiYdGbgXvA8RrjHgAXgIVaCbMU3SKr1BhtwEtgZx1jTwI7gG7ga5pNNUO+9pBMuEN9klfYD9xMqZdEsCj6AHAiRtxZYFeyrSSHRdGnYsblCD8jJrEoek8TsbsT6yJhLIrelFFsqlgUPZtRbKpYFP2kidjxxLpIGIuiB4AvMeLmgJGEe0kMi6I/AVdjxPVSx91hVlgUDXAXuEaY16jFMnAJeJhqR01iVTTAdeAYUFxjzBRwCLgl6agJrM51rDAO7AP2EmbxthPO8vfAc2Ams84axLpoCGKLrH1mm8eC6KPAGaAL2Fpj7AZgY7T9DfhRY/wc4eflPmH+OjOynI8uEGbpukXlJ4Dz84V8aWWHcj46q4thFzCNTjJRren2UrlLWPM3WYjuAMYIk/tq2oCx9lK5Q11YLboFGARaxXVX0woMtpfK0uuTWvRFoFNcsxKdhF5kqEX3iuuthbQXtehG/gdMG2kvlm/B1xUuWoSLFmFF9CRwg2TnM4pRzskEc8bGiugR4ArhNjkpJqKcJv51sSJ63eOiRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEWvTHKvs/p1izWu5qvaSCWvTlCvtmgeEUaw5TeUVtpV5SQy16COgBRoHXhMWb3aS7PnAhqjEQ1RwFeuYL+aEUa/5DFmtYHkefOEwQVmcBvKD+FQNvgNN/P+pHiV8MRbhoES5ahIsW4aJFuGgRLlqEixbhokW4aBEuWoSLFuGiRbhoES5ahIsW4aJFuGgRLlqEixbhokVYEx3nudGKXE1jTfS6xUWLcNEiXLQIFy3CRYtw0SJctAgXLcJFi3DRIv430eUq2+axJvp7jePPqmzHySXFmuhHwFKVYzNA/6rv/VR/s9BSlMsM1kTPEN4DPkU4I8vAO6APOAgsrhq7GO3ri8aUo5ipKIep1zv9AtipgOACGIrLAAAAAElFTkSuQmCC",
		            symbolSize: 30,
		            symbolPosition: "start",
		            data: data,
		        }]
		    };
		    this.myChart1.setOption(option);
  		},
//		饼图
  		pieChart(id,title,data){
  			let _this = this;
  			if(id =="main6" && !this.myChart6){
  				this.myChart6 = echarts.init(document.getElementById(id));
  			}else if(id =="main2" && !this.myChart2){
  				this.myChart2 = echarts.init(document.getElementById(id));
  			}
		    let option = {
		        color: ["#4fc4f6", "#e64c65", "#fe9801"],
		        title: {
		            text: title,
		            subtext: '异常学生数',
		            left: 'center',
		            y: "42%",
		            textStyle: {
		                color: "#fff",
		                fontSize: 24,
		                fontWeight: "bold"
		            },
		            subtextStyle: {
		                color: "#fff",
		                fontSize: 12
		            }
		        },
		        tooltip: {
		            trigger: 'item',
		            formatter: "{b}: {c} ({d}%)"
		        },
		        legend: {
		            orient: 'horizontal',
		            x: 'center',
		            y: 0,
		            data: ['旷课人数', '请假人数', '迟到人数'],
		            textStyle: {
		                color: "#fff",
		                fontSize: 12
		            }
		        },
		        series: [{
		            name: '访问来源',
		            type: 'pie',
		            radius: ['35%', '60%'],
		            center: ['50%', '55%'],
		            label: {
		                normal: {
		                    formatter: "{b}\n ({d}%)",
		                    show: true,
		                    fontSize: 12
		                }
		            },
		            data: [{
		                value: data[1],
		                name: '旷课人数'
		            },
		            {
		                value: data[2],
		                name: '请假人数'
		            },
		            {
		                value: data[0],
		                name: '迟到人数'
		            },
		            ]
		        },
		        {
		            name: '访问来源222',
		            type: 'pie',
		            radius: ['65%', '67%'],
		            center: ['50%', '55%'],
		            label: {
		                normal: {
		                    show: false,
		                }
		            },
		            data: [{
		                value: 90,
		                name: '三级匹配度',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
		                            offset: 0,
		                            color: "#4fc4f6"
		                        }, {
		                            offset: 1,
		                            color: "#4fc4f6"
		                        }])
		                    }
		                }
		            },]
		        },
		        {
		            name: '访问来源222',
		            type: 'pie',
		            radius: ['67%', '72%'],
		            center: ['50%', '55%'],
		            label: {
		                normal: {
		                    show: false,
		                }
		            },
		            data: [{
		                value: 30,
		                name: '三级匹配度33',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: "rgba(255,255,255,0)",
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度34',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: '#4fc4f6',
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度55',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: "rgba(255,255,255,0)",
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度56',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: '#4fc4f6',
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度57',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: "rgba(255,255,255,0)",
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度57',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: '#4fc4f6',
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度57',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: "rgba(255,255,255,0)",
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            {
		                value: 30,
		                name: '三级匹配度57',
		                tooltip: {
		                    show: false
		                },
		                itemStyle: {
		                    normal: {
		                        color: '#4fc4f6',
		                        label: {
		                            show: false
		                        },
		                        labelLine: {
		                            show: false
		                        }
		                    },
		                }
		            },
		            ]
		        },
		        ]
		    };
		    if(id == "main6"){
  				this.myChart6.setOption(option);
  				this.myChart6.on('click', function (params) {
			        if (params.data.name == "请假人数") {
			            _this.getAbnormalDetail(4);
			        } else if (params.data.name == "旷课人数") {
			            _this.getAbnormalDetail(3);
			        } else if (params.data.name == "迟到人数") {
			           _this.getAbnormalDetail(2);
			        }
			    });
  			}else{
  				this.myChart2.setOption(option);
  			}
  		},
//		双柱状图
  		doubleBarChart(id,x,y1,y2){
  			let _this = this;
  			if(id=="main3" && !this.myChart3){
  				this.myChart3 = echarts.init(document.getElementById(id));
  			}else if(id=="main7" && !this.myChart7){
  				this.myChart7 = echarts.init(document.getElementById(id));
  			}
  			let option = {
		        tooltip: {
		            trigger: 'axis',
		            axisPointer: { // 坐标轴指示器，坐标轴触发有效
		                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
		            }
		        },
		        legend: {
		            data: ['已进人数', '未进人数'],
		            x: 'right',
		            textStyle: {
		                color: "#fff",
		                fontSize: 12
		            }
		        },
		        grid: {
		            left: '3%',
		            right: '4%',
		            bottom: '3%',
		            top: '22%',
		            containLabel: true
		        },
		        xAxis: [{
		            type: 'category',
		            data: x,
		            splitLine: {
		                show: true,
		                lineStyle: {
		                    color: "rgba(255,255,255,0.3)"
		                }
		            },
		            axisTick: {
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLabel: {
		                show: true,
		                textStyle: {
		                    color: 'rgba(255,255,255,0.83)',
		                    fontSize: 12,
		                },
		            },
		        }],
		        yAxis: [{
		            type: 'value',
		            splitLine: {
		                show: true,
		                lineStyle: {
		                    color: "rgba(255,255,255,0.3)"
		                }
		            },
		            axisTick: {
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLabel: {
		                show: true,
		                textStyle: {
		                    color: 'rgba(255,255,255,0.83)',
		                    fontSize: 12,
		                },
		            },
		        }],
		        series: [{
		            name: '已进人数',
		            type: 'bar',
		            data: y1,
		            barWidth: "20",
		            label: {
		                normal: {
		                    show: true,
		                    position: 'top',
		                    color: "#4ab7e5"
		                },
		            },
		            itemStyle: {
		                normal: {
		                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
		                        offset: 0,
		                        color: '#4ab7e5'
		                    }, {
		                        offset: 1,
		                        color: '#254856'
		                    }]),
		                    opacity: 1,
		                }
		            }
		        },
		        {
		            name: '未进人数',
		            type: 'bar',
		            data: y2,
		            barWidth: "20",
		            label: {
		                normal: {
		                    show: true,
		                    position: 'top',
		                    color: "#fe9801"
		                },
		            },
		            itemStyle: {
		                normal: {
		                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
		                        offset: 0,
		                        color: '#fe9801'
		                    }, {
		                        offset: 1,
		                        color: '#5e4c20'
		                    }]),
		                    opacity: 1,
		                }
		            }
		        }
		        ]
		    };
		    if(id=="main3"){
  				this.myChart3.setOption(option);
  			}else{
  				this.myChart7.setOption(option);
  				this.myChart7.on('click', function (params) {
			        if (params.name == "一号宿舍楼") {
			            _this.getDormitoryDetail(1);
			        } else if (params.name == "二号宿舍楼") {
			            _this.getDormitoryDetail(2);
			        } else if (params.name == "三号宿舍楼") {
			            _this.getDormitoryDetail(3);
			        } else if (params.name == "四号宿舍楼") {
			            _this.getDormitoryDetail(4);
			        }
			    });
  			}
  		},
//		漏斗图
  		funnelChart(id,data){
  			if(id == "main4" && !this.myChart4){
  				this.myChart4 = echarts.init(document.getElementById(id));
  			}else if(id == "main8" && !this.myChart8){
  				this.myChart8 = echarts.init(document.getElementById(id));
  			}
		    let option = {
		        color: ['#fe9801', '#e64c65', '#cb5beb', '#51beff', '#008dff',],
		        tooltip: {
		            trigger: 'item',
		            formatter: "{b}: {c} ({d}%)"
		        },
		        series: [{
		            name: '漏斗图',
		            type: 'funnel',
		            x: '5%',
		            y: '0',
		            width: '60%',
		            height: '90%',
		            sort: 'ascending',
		            data: data,
		            itemStyle: {
		                normal: {
		                    borderWidth: 0,
		                    shadowBlur: 30,
		                    shadowOffsetX: 0,
		                    shadowOffsetY: 10,
		                    shadowColor: 'rgba(0, 0, 0, 0.5)'
		                }
		            },
		            label: {
		                normal: {
		                    formatter: function (params) {
		                        return params.name + ' ' + params.percent + '%';
		                    },
		                    position: 'right'
		                }
		            },
		        }
		        ]
		    };
		    if(id == "main4"){
  				this.myChart4.setOption(option);
  			}else{
  				this.myChart8.setOption(option);
  			}
  		},
//		折线图
  		lineChart(id,xdata,data){
  			if(id == "main5" && !this.myChart5){
  				this.myChart5 = echarts.init(document.getElementById(id));
  			}else if(id == "main10" && !this.myChart10){
  				this.myChart10 = echarts.init(document.getElementById(id));
  			}
            let option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '3%',
                    top: '24%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(255,255,255,0.3)"
                        }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 1,
                            type: 'solid',
                        },
                    },
                    axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 1,
                            type: 'solid',
                        },
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: 'rgba(255,255,255,0.83)',
                            fontSize: 12,
                        },
                    },
                    data: xdata
                }],
                yAxis: [{
                    type: 'value',
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(255,255,255,0.3)"
                        }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 1,
                            type: 'solid',
                        },
                    },
                    axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
                        show: true,
                        lineStyle: {
                            color: "#fff",
                            width: 1,
                            type: 'solid',
                        },
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: 'rgba(255,255,255,0.83)',
                            fontSize: 12,
                        },
                    },
                }],
                series: [{
                    name: '车辆数量',
                    type: 'line',
                    areaStyle: {
                        normal: {
                            type: 'default',
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgba(0, 141, 255,1)'
                            }, {
                                offset: 1,
                                color: 'rgba(40, 65, 82,0.9)'
                            }], false)
                        }
                    },
                    data: data
                },
                {
                    name: '车辆数量',
                    type: 'line',
                    color: 'rgba(28, 91, 144,1)',
                    markPoint: {
                        data: [{
                            type: 'max',
                            name: '最大值'
                        },]
                    },
                    data: data
                },
                ]
            };
             if(id == "main5"){
  				this.myChart5.setOption(option);
  			}else{
  				this.myChart10.setOption(option);
  			}
  		},
//		堆叠图
  		stackedChart(id,x,data,legend){
  			let _this =this;
  			if(id == "main9" && !this.myChart9){
  				this.myChart9 = echarts.init(document.getElementById(id));
  			}
  			let option = {
		        color: ['#0284e8', '#62baea', '#b957d6', '#d1495d', '#e78e03'],
		        tooltip: {
		            trigger: 'axis',
		            axisPointer: { // 坐标轴指示器，坐标轴触发有效
		                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
		            }
		        },
		        legend: {
		            data: legend,
		            textStyle: {
		                color: "#FFF",
		                fontSize: 12
		            },
		            itemWidth: 15,
		            top: 0
		        },
		        grid: {
		            left: '3%',
		            right: '4%',
		            bottom: '7%',
		            top: "28%",
		            containLabel: true
		        },
		        xAxis: [{
		            type: 'category',
		            splitLine: {
		                show: true,
		                lineStyle: {
		                    color: "rgba(255,255,255,0.3)"
		                }
		            },
		            axisTick: {
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLabel: {
		                show: true,
		                textStyle: {
		                    color: 'rgba(255,255,255,0.83)',
		                    fontSize: 12,
		                },
		            },
		            data: x
		        }],
		        yAxis: [{
		            type: 'value',
		            splitLine: {
		                show: true,
		                lineStyle: {
		                    color: "rgba(255,255,255,0.3)"
		                }
		            },
		            axisTick: {
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
		                show: true,
		                lineStyle: {
		                    color: "#fff",
		                    width: 1,
		                    type: 'solid',
		                },
		            },
		            axisLabel: {
		                show: true,
		                textStyle: {
		                    color: 'rgba(255,255,255,0.83)',
		                    fontSize: 12,
		                },
		            },
		        }],
		        series: data
		    };
		    this.myChart9.setOption(option);
		    this.myChart9.on('click', function (params) {
		        _this.getCarDetailMonth(params.name);
		    });
  		},
  		//垂直柱状图
  		hBarChart(id,x,data){
  			let _this = this;
  			if(id == "main11" && this.myChart11){
  				return;
  			}
  			let color = ['rgba(18,207,64,1)', 'rgba(18,207,64,0.1)', 'rgba(1,138,249,1)', 'rgba(1,138,249,0.1)', 'rgba(13,143,199,1)', 'rgba(13,143,199,0.1)', 'rgba(203,91,235,1)', 'rgba(203,91,235,0.1)',
        	'rgba(230,76,100,1)', 'rgba(230,76,100,0.1)', 'rgba(235,142,2,1)', 'rgba(235,142,2,0.1)'];
        	this.myChart11 = echarts.init(document.getElementById(id));
		    let option = {
		        color: ['#3398DB'],
		        tooltip: {
		            trigger: 'axis',
		            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
		                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		            }
		        },
		        grid: {
		            left: '10%',
		            right: '10%',
		            bottom: '3%',
		            top: "3%",
		            containLabel: true
		        },
		        xAxis: [
		            {
		                type: 'value',
		                splitLine: {
		                    show: false,
		                },
		                axisTick: {
		                    show: false,
		                },
		                axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
		                    show: false,
		                },
		                axisLabel: {
		                    show: false,
		                },
		            }
		        ],
		        yAxis: [
		            {
		                type: 'category',
		                data: x,
		                splitLine: {
		                    show: false,
		                },
		                axisTick: {
		                    show: false,
		                },
		                axisLine: { //坐标轴轴线相关设置。就是数学上的y轴
		                    show: false,
		                },
		                axisLabel: {
		                    show: true,
		                    textStyle: {
		                        color: 'rgba(255,255,255,0.83)',
		                        fontSize: 12,
		                    },
		                },
		
		            }
		        ],
		        series: [
		            {
		                name: '监控数量',
		                type: 'bar',
		                data: data,
		                barWidth: 20,
		                itemStyle: {
		                    normal: {
		                        show: true,
		                        color: function (params) {
		                            var colorList = [];
		                            var i = 1;
		                            while (i < 12) {
		                                colorList.push({
		                                    type: 'line',
		                                    colorStops: [{
		                                        offset: 0,
		                                        color: color[i] // 0% 处的颜色
		                                    }, {
		                                        offset: 1,
		                                        color: color[i - 1] // 100% 处的颜色
		                                    }],
		                                    globalCoord: false, // 缺省为 false
		                                });
		                                i += 2;
		                            }
		                            return colorList[params.dataIndex]
		                        },
		                        label: {
		                            show: true,
		                            position: 'right',
		                            formatter: '{c}个',
		                            color: "#fff"
		                        },
		                        barBorderRadius: 50,
		                        borderWidth: 0,
		                        borderColor: '#fff',
		                    }
		                },
		            }
		        ]
		    };
		    this.myChart11.setOption(option);
		    this.myChart11.on('click', function (params) {
		    	$.each(_this.monitorCount, function() {
		    		if(this.name == params.name){
		    			_this.getMonitorDetail(this.id);
		    			_this.floorName = this.name
		    		}
		    	});
		    });
  		},
  		//雷达图
  		radarMapChart(id,x,s){
  			if(id == "main12" && !this.myChart12){
  				this.myChart12 = echarts.init(document.getElementById(id));
  			}
		    let option = {
		        tooltip: {},
		        radar: {
		            // shape: 'circle',
		            name: {
		                textStyle: {
		                }
		            },
		            splitArea: {
		                areaStyle: {
		                    color: '	rgba(6,222,249,0.06)',
		                    shadowBlur: 10
		                }
		            },
		            axisLine: {
		                lineStyle: {
		                    color: '#fff'
		                }
		            },
		            splitLine: {
		                lineStyle: {
		                    color: '#fff'
		                }
		            },
		            indicator: x
		        },
		        series: [{
		            type: 'radar',
		            data: [
		                {
		                    value: s,
		                    name: '监控数量'
		                },
		
		            ],
		            areaStyle: {
		                normal: {
		                    color: 'rgba(13, 139, 192,1)',
		                },
		            },
		            lineStyle: {
		                normal: {
		                    color: '#0d8bc0',
		                    type: 'solid',
		                    width: 3
		                },
		                emphasis: {}
		            },
		        }]
		    };
		    this.myChart12.setOption(option);
  		},
//		屏幕尺寸设置
  		resizeWidth() {
		    let ratio = $(window).width() / 1920;
		    $('body').css({
		        "transform": "scale(" + ratio + ")",
		        "transform-origin": "left top",
		        "background-size": "100% 100%",
		
		        "-ms-transform": "scale(" + ratio + ")",
		        "-moz-transform": "scale(" + ratio + ")",
		        "-webkit-transform": "scale(" + ratio + ")",
		        "-o-transform": "scale(" + ratio + ")",
		        "-ms-transform-origin": "left top",
		        "-webkit-transform-origin": "left top",
		        "-moz-transform-origin": "left top",
		        "-o-transform-origin": "left top",
		    });
		}
  	}
})