import 'echarts/map/js/china.js'
import echarts from 'echarts/lib/echarts'

const convertData = function (data, geoCoordMap) {
    let res = [];
    for (let i = 0; i < data.length; i++) {
        let geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value)
            });
        }
    }
    return res;
};

const formatMapData = (data) => {
    if (!data || !data.length) {
        return;
    }
    let geoCoordMapResult = {

    };
    let maxValue = 0;

    let shouldConvertedData = data.map(item => {

        return {
            name: item.name,
            value: item.value
        }
    })

    data.forEach(item => {
        if (parseInt(item.value) > maxValue) {
            maxValue = parseInt(item.value);
        }
        geoCoordMapResult[item.name] = item.loglat;
    })

    let seriesData = convertData(shouldConvertedData, geoCoordMapResult);
    return { seriesData, maxValue };
}



const getMapOption = (data) => {
    let { seriesData, maxValue } = formatMapData(data);
    let mapOption = {
        backgroundColor: '#fff',
        // title: {
        //     top: 20,
        //     text: '会员地理分布统计',
        //     x: 'center',
        //     textStyle: {
        //         color: '#5d95d2'
        //     }
        // },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return params.name + ' : ' + params.value[2];
            }
        },
        legend: {
            orient: 'vertical',
            y: 'bottom',
            x: 'right',
            data: ['会员数'],
            textStyle: {
                color: '#000'
            }
        },
        visualMap: {
            min: 0,
            max: maxValue,
            calculable: true,
            inRange: {
                color: ['#50a3ba', '#eac736', '#d94e5d']
            },
            textStyle: {
                color: '#000'
            }
        },
        geo: {
            map: 'china',
            label: {
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#EFEFEF',
                    borderColor: '#111'
                },
                emphasis: {
                    areaColor: '#cdcdcd'
                }
            }
        },
        series: [
            {
                name: '会员数',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: seriesData,
                symbolSize: 12,
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    emphasis: {
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            }
        ]
    }
    return mapOption;
}

const getScanPieOption = (optionData) => {
    let scanPie = {
        title: {
            // text: '天气情况统计',
            // subtext: '虚构数据',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c}次 ({d}%)"
        },
        // legend: {
        //   // orient: 'vertical',
        //   // top: 'middle',
        //   bottom: 10,
        //   left: 'center',
        //   data: ['西凉', '益州', '兖州', '荆州', '幽州']
        // },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                selectedMode: 'single',
                data: optionData,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    return scanPie
}

const getTrendOption = (result, type) => {

    let title = type == 'attention' ? "关注人数" : "查询次数"
    return {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '5px',
        right: '40px',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: result.keys,
        show: false
      },
      yAxis: {
        show: false
      },
      series: [
        {
          name: title,
          type: 'line',
          stack: '总量',
          data: result.values
        }
      ]
    }
  }


export {
    getMapOption,
    getScanPieOption,
    getTrendOption
}