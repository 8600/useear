

/**
 * 空间量算类
 */
let Measure = {

    earthRadiusMeters: 6371000.0,
    metersPerDegree: 2.0 * Math.PI * this.earthRadiusMeters / 360.0,
    radiansPerDegree: Math.PI / 180.0,
    degreesPerRadian: 180.0 / Math.PI,
    pointArr: [],



    /**
     * 计算经纬度两点间的距离
     * @param {any} lat1
     * @param {any} lng1
     * @param {any} lat2
     * @param {any} lng2
     */
    getFlatternDistance: function (lat1, lng1, lat2, lng2) {
        var EARTH_RADIUS = 6378137.0;    //单位M
        var PI = Math.PI;

        function getRad(d) {
            return d * PI / 180.0;
        }
        var f = getRad((lat1 + lat2) / 2);
        var g = getRad((lat1 - lat2) / 2);
        var l = getRad((lng1 - lng2) / 2);

        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);

        var s, c, w, r, d, h1, h2;
        var a = EARTH_RADIUS;
        var fl = 1 / 298.257;

        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;

        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;

        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;

        return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    },

    /**
     * 计算面积
     * @param {any} points
     */
    sphericalPolygonAreaMeters: function (points) {
        var totalAngle = 0;
        for (var i = 0; i < points.length; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            totalAngle += Measure.calculateAngle(points[i], points[j], points[k]);

        }
        var planarTotalAngle = (points.length - 2) * 180.0;
        var sphericalExcess = totalAngle - planarTotalAngle;
        if (sphericalExcess > 420.0) {
            totalAngle = points.length * 360.0 - totalAngle;
            sphericalExcess = totalAngle - planarTotalAngle;

        } else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
            sphericalExcess = Math.abs(360.0 - sphericalExcess);
        }
        return sphericalExcess * this.radiansPerDegree * this.earthRadiusMeters * this.earthRadiusMeters;
    },

    /**
     * 计算方向
     * @param {any} from 起点
     * @param {any} to 终点
     */
    calculateBearing: function (from, to) {
        var lat1 = from.lat * this.radiansPerDegree;
        var lon1 = from.lon * this.radiansPerDegree;
        var lat2 = to.lat * this.radiansPerDegree;
        var lon2 = to.lon * this.radiansPerDegree;
        var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0) {
            angle += Math.PI * 2.0;

        }
        angle = angle * this.degreesPerRadian;
        return angle;
    },

    /**
     * 计算角度
     * @param {any} p1
     * @param {any} p2
     * @param {any} p3
     */
    calculateAngle: function (p1, p2, p3) {
        var bearing21 = Measure.calculateBearing(p2, p1);
        var bearing23 = Measure.calculateBearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }

};






