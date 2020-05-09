<template>
  <div class="map-wrapper">
    <div id="map"></div>
    <div class="button-group">
      <el-button size="small" @click="toggleLayer('vec')">行政图</el-button>
      <el-button size="small" @click="toggleLayer('img')">卫星图</el-button>
      <el-button size="small" @click="toggleLayer('ter')">地形图</el-button>
      <el-button size="small" @click="measure">测距</el-button>
      <el-button size="small" @click="addHeatMap">热力图</el-button>
      <el-button size="small" @click="toggleSingleLayer">单色底图</el-button>
    </div>
    <el-select class="area-select" v-model="area" clearable placeholder="请选择流域分区"
               @change="addAreaLayer" @clear="clearAreaLayer">
      <el-option v-for="area in areas" :key="area" :label="area" :value="area"></el-option>
    </el-select>
    <el-select class="category-select" v-model="category" multiple collapse-tags placeholder="请选择测站类型" @change="toggleVisible">
      <el-option v-for="{ value, label } in categorys" :key="value" :label="label" :value="value"></el-option>
    </el-select>
  </div>
</template>

<script>
  import { Map, View, Overlay, Feature } from 'ol'
  import { Tile as TileLayer, Vector as VectorLayer, Heatmap } from 'ol/layer'
  import { XYZ, Vector as VectorSource } from 'ol/source'
  import { WKT, GeoJSON } from 'ol/format'
  import { Style, Stroke, Fill, Circle, Icon, Text } from 'ol/style'
  import { Draw } from 'ol/interaction'
  import { Point, LineString } from 'ol/geom'
  import { getDistance } from 'ol/sphere'
  import { transform } from 'ol/proj'
  import { unByKey } from 'ol/Observable'
  import mapLayer from '../../static/mapLayer'  // 汉江轮廓和轮廓外
  import drainageBasin from '../../static/drainageBasin'  //  流域分区
  import hanRiver from '../../static/hanRiver.json'  //  汉江流域内
  import reservoir from '../../static/reservoir.json'  //  水库轮廓
  import river from '../../static/river.json'  //  河流轮廓
  import station from '../data/station.json'

  export default {
    name: "Map",
    data() {
      return {
        map: null,
        base: 'tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        normal: 'tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        satellite: 'tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        landform: 'tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        mapLayer: {},
        area: '',
        areas: ['石泉水库以上', '石泉水库至白河水文站', '白河水文站至丹江口', '丹江河流域', '库周流域', '堵河流域'],
        category: [],
        isMeasure: false,
        draw: null,
        tooltipElement: {
          measure: null,
          help: null
        },
        tooltip: {
          measure: null,
          help: null
        },
        sketch: null,    //绘制的要素
        isHeatMap: false,
        timer: null,
        heatData: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 112.40, 31.19 ] }, properties: { weight: 0.9 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.30, 30.60 ] }, properties: { weight: 0.19 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 123.30, 30.60 ] }, properties: { weight: 0.419 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 105.30, 30.60 ] }, properties: { weight: 0.319 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 106.30, 30.60 ] }, properties: { weight: 0.719 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 109.30, 31.60 ] }, properties: { weight: 0.519 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 109.30, 30.60 ] }, properties: { weight: 0.319 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 108.30, 32.60 ] }, properties: { weight: 0.139 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 118.30, 31.60 ] }, properties: { weight: 0.129 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 108.30, 33.60 ] }, properties: { weight: 0.190 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 108.30, 32.60 ] }, properties: { weight: 0.189 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 100.30, 30.60 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 109.30, 30.60 ] }, properties: { weight: 0.119 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 108.30, 31.60 ] }, properties: { weight: 0.200 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 118.30, 30.60 ] }, properties: { weight: 0.300 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.30, 23.60 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 112.214350, 23.3423 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.45656, 22.4545 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.78684, 22.1235 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.43543, 21.4378 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 112.506, 23.234 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.9087, 22.45345 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 113.8764, 23.1234 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 112.4753, 21.948 ] }, properties: { weight: 0.1 }},
            { type: 'Feature', geometry: {type: 'Point', 'coordinates': [ 112.10, 23.789 ] }, properties: { weight: 0.1 }}
          ]
        },
        isSingleLayer: false
      }
    },
    computed: {
      stationObj() {
        return station.default.reduce((obj, item) => {
          const type = item.sttp
          type in obj ? obj[type].push(item) : obj[type] = [item]
          return obj
        }, {})
      },
      categorys() {
        return station.category.map(({ type: value, label }) => ({ value, label }))
      }
    },
    methods: {
      initMap() {
        // 底图
        const base = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.base}`
          })
        })
        // 行政图
        const normal = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.normal}`
          })
        })
        // 卫星图
        const satellite = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.satellite}`
          }),
          visible: false
        })
        // 地形图
        const landform = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.landform}`
          }),
          visible: false
        })

        this.map = new Map({
          target: 'map',
          view: new View({
            projection: 'EPSG:4326',
            center: [110.654, 32.589],
            zoom: 7,
            minZoom: 3,
            maxZoom: 11
          }),
          layers: [landform, satellite, normal, base],
          controls: []
        })
      },
      // 添加汉江流域图层
      addLayer() {
        Promise.resolve(mapLayer).then(res => {
          const WKTFormat = new WKT()
          // 汉江流域轮廓
          const shape = WKTFormat.readFeature(res.result.shape, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:4326'
          })
          // 汉江流域外加上遮罩层
          const layer = WKTFormat.readFeature(res.result.json, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:4326'
          })

          this.map.getView().fit(shape.getGeometry(), {
            size: this.map.getSize(),
            constrainResolution: false,
            padding: [50, 50, 50, 50],
          })
          shape.setStyle(new Style({
            stroke: new Stroke({
              color: '#03956b',
              width: 3
            })
          }))
          layer.setStyle(new Style({
            fill: new Fill({
              color: 'rgba(255,255,255,0.7)'
            })
          }))

          this.mapLayer.vector = new VectorLayer({
            source: new VectorSource()
          })
          this.mapLayer.vector.getSource().addFeature(shape)
          this.mapLayer.vector.getSource().addFeature(layer)
          this.map.addLayer(this.mapLayer.vector)
        })
      },
      // 添加水系图层
      addRiverLayer() {
        const WKTFormat = new WKT()
        const riverGeoFeature = new GeoJSON().readFeatures(river)
        const riverLayer = WKTFormat.readFeature(WKTFormat.writeFeatures(riverGeoFeature), {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })
        const reservoirGeoFeature = new GeoJSON().readFeatures(reservoir)
        const reservoirLayer = WKTFormat.readFeature(WKTFormat.writeFeatures(reservoirGeoFeature), {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })

        riverLayer.setStyle(new Style({
          stroke: new Stroke({ color: '#2d8cf0', width: 2 })
        }))
        reservoirLayer.setStyle(new Style({
          stroke: new Stroke({ color: '#2d8cf0', width: 2 })
        }))
        const riverVector = new VectorLayer({
          source: new VectorSource()
        })
        riverVector.getSource().addFeature(riverLayer)
        riverVector.getSource().addFeature(reservoirLayer)
        this.map.addLayer(riverVector)
      },
      // 添加对应流域遮罩
      addAreaLayer(val) {
        if (!val) { return }

        if ('areaVector' in this.mapLayer) {
          this.mapLayer.areaVector.setVisible(true)
          this.mapLayer.areaVector.getSource().clear()
        } else {
          this.mapLayer.areaVector = new VectorLayer({
            source: new VectorSource()
          })
          this.map.addLayer(this.mapLayer.areaVector)
        }

        const target = drainageBasin.features.find(({ properties: { name } }) => name === val)
        const geoFeature = new GeoJSON().readFeature(target)
        const WKTFormat = new WKT()
        const areaLayer = WKTFormat.readFeature(WKTFormat.writeFeature(geoFeature), {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })

        this.map.getView().fit(areaLayer.getGeometry(), {
          size: this.map.getSize(),
          constrainResolution: false,
          padding: [50, 50, 50, 50],
        })
        areaLayer.setStyle(new Style({
          fill: new Fill({
            color: 'rgba(204, 255, 204, 0.5)'
          }),
          stroke: new Stroke({
            color: '#94ffe0',
            width: 2
          })
        }))
        this.mapLayer.areaVector.getSource().addFeature(areaLayer)
      },
      clearAreaLayer() {
        this.mapLayer.areaVector.setVisible(false)
        this.mapLayer.areaVector.getSource().clear()
      },
      toggleLayer(str) {
        this.map.getLayers().forEach(layer => {
          let source = layer.getSource()
          if (!source.urls || !source.urls.length) { return }
          layer.setVisible(/cva/.test(source.urls[0]) || new RegExp(str).test(source.urls[0]))
        })
      },
      // 添加测站图层
      addStationLayer() {
        station.category.forEach(item => {
          this.mapLayer[item.type] = new VectorLayer({
            source: new VectorSource({
              features: this.getFeatures(item)
            }),
            visible: item.visible || false
          })
          this.map.addLayer(this.mapLayer[item.type])
          if (item.visible) {
            this.category.push(item.type)
          }
        })
      },
      // 获取测站图层特性
      getFeatures({ type, src, color = '#2d8cf0', offset = { x: 0, y: 0 }, scale = 1 }) {
        return this.stationObj[type].map(({ stcd, stnm, lgtd, lttd }) => {
          const feature = new Feature({ stcd, name: stnm, geometry: new Point([lgtd, lttd]) })
          feature.setStyle(new Style({
            image: new Icon({ src, scale, opacity: 1 }),
            text: new Text({
              text: stnm,
              font: 'bold 12px 微软雅黑',
              textAlign: 'left',
              textBaseline: 'top',
              fill: new Fill({ color }),
              stroke: new Stroke({ color: "#eee", width: 2 }),
              offsetX: offset.x,
              offsetY: offset.y
            })
          }))
          return feature
        })
      },
      // 切换测站显示或隐藏
      toggleVisible(vals) {
        this.categorys.forEach(({ value }) => {
            this.mapLayer[value].setVisible(vals.includes(value))
        })
      },
      initMeasureLayer() {
        this.mapLayer.measure = new VectorLayer({
          source: new VectorSource(),
          style: new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new Stroke({
              color: '#ffcc33',
              width: 2
            }),
            image: new Circle({
              radius: 7,
              fill: new Fill({
                color: '#ffcc33'
              })
            })
          })
        })
      },
      measure() {
        this.isMeasure = !this.isMeasure

        if (this.isMeasure) {
          this.map.addLayer(this.mapLayer.measure)
          // 地图容器绑定鼠标移动事件，动态显示帮助提示框内容
          this.map.addEventListener('pointermove', this.pointerMoveHandle)
          this.map.addEventListener('mouseout', () => {
            this.tooltipElement.help.classList.add('hidden')
          })
          this.addInteraction()
          return
        }

        this.map.removeInteraction(this.draw)
        this.mapLayer.measure.getSource().clear()
        this.map.removeLayer(this.mapLayer.measure)
        this.map.removeEventListener('pointermove', this.pointerMoveHandle)
        this.removeMeasureElement()
      },
      // 绘制控件交互功能
      addInteraction() {
        this.draw = new Draw({
          source: this.mapLayer.measure.getSource(),
          type: 'LineString',
          style: new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0.5)',
              lineDash: [10, 10],
              width: 2
            }),
            image: new Circle({
              radius: 5,
              stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
              }),
              fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              })
            })
          })
        })
        this.map.addInteraction(this.draw)
        this.createTooltip({
          type: 'measure',
          className: 'tooltip tooltip-measure',
          offset: [0, -15],
          positioning: 'bottom-center'
        })
        this.createTooltip({
          type: 'help',
          className: 'tooltip hidden',
          offset: [15, 0],
          positioning: 'center-left'
        })

        // 绑定绘制事件
        let listener
        this.draw.on('drawstart', e => {
          this.sketch = e.feature
          listener = this.sketch.getGeometry()
            .on('change', e => {
              let output, geom = e.target
              if (geom instanceof LineString) {
                output = this.formatLength(geom)
                e.coordinate = geom.getLastCoordinate()
              }
              this.tooltipElement.measure.innerHTML = output
              this.tooltip.measure.setPosition(e.coordinate)  // 设置测量工具提示框的显示位置
          })
        })
        this.draw.on('drawend', e => {
          this.tooltipElement.measure.className = 'tooltip tooltip-static'
          this.tooltip.measure.setOffset([0, -7])
          this.sketch = null
          this.createTooltip({
            type: 'measure',
            className: 'tooltip tooltip-measure',
            offset: [0, -15],
            positioning: 'bottom-center'
          })
          unByKey(listener)
        })
      },
      // 创建工具提示框
      createTooltip({ type, className, offset, positioning }) {
        let element = this.tooltipElement[type]
        element = document.createElement('div')
        element.className = className
        this.tooltip[type] = new Overlay({element, offset, positioning})
        this.map.addOverlay(this.tooltip[type])
        this.tooltipElement[type] = element
      },
      // 输出测量长度
      formatLength(line) {
        let sourceProj = this.map.getView().getProjection(),  //地图数据源投影坐标系
          length = 0
        // 通过遍历坐标计算两点之间距离，进而得到整条线的长度
        for (let i = 0, coordinates = line.getCoordinates(); i < coordinates.length - 1; i++) {
          let p1 = transform(coordinates[i], sourceProj, 'EPSG:4326'),
            p2 = transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
          length += getDistance(p1, p2)
        }
        return length > 100 ? `${Math.round(length / 1000)} km` : `${Math.round(length)} m`
      },
      // 鼠标移动事件回调函数
      pointerMoveHandle(e) {
        if (e.dragging) { return }

        this.tooltip.help.setPosition(e.coordinate)
        this.tooltipElement.help.classList.remove('hidden')
        // 提示信息在对话框中显示
        this.tooltipElement.help.innerHTML = this.sketch ? '单击继续绘制，双击结束绘制' : '单击开始绘制'
      },
      // 移除测量和提示框元素
      removeMeasureElement() {
        Object.values(this.tooltipElement).forEach(element => {
          element.parentNode.remove(element)
        })
        Array.from(document.getElementsByClassName('tooltip-static')).forEach(element => {
          element.parentNode.remove(element)
        })
      },
      // 添加热力图
      addHeatMap() {
        this.isHeatMap = !this.isHeatMap

        // 点击偶数次移除热力图图层，清除定时器
        if (!this.isHeatMap) {
          this.map.removeLayer(this.mapLayer.heatMap)
          window.clearInterval(this.timer)
          return
        }

        let features = new GeoJSON().readFeatures(this.heatData, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })
        const source = new VectorSource({ features, wrapX: false })
        this.mapLayer.heatMap = new Heatmap({ source, blur: 15, radius: 10 })
        this.map.addLayer(this.mapLayer.heatMap)

        // 用定时器模拟动态刷新
        this.timer = window.setInterval(() => {
          this.changeHeatData()
          source.clear()
          features = new GeoJSON().readFeatures(this.heatData, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:4326'
          })
          source.addFeatures(features)
        }, 2000)
      },
      // 模拟数据变化
      changeHeatData() {
        this.heatData.features.forEach(item => {
          item.properties.weight = Math.random()
        })
      },
      //  汉江流域内单色底图和天地图切换
      toggleSingleLayer() {
        this.isSingleLayer = !this.isSingleLayer

        if (!this.isSingleLayer) {
          this.map.removeLayer(this.mapLayer.singleVector)
          return
        }

        const target = hanRiver.features[0]
        const geoFeature = new GeoJSON().readFeature(target)
        const WKTFormat = new WKT()
        const hanRiverLayer = WKTFormat.readFeature(WKTFormat.writeFeature(geoFeature), {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })

        hanRiverLayer.setStyle(new Style({
          fill: new Fill({ color: '#ffffff' })
        }))
        this.mapLayer.singleVector = new VectorLayer({
          source: new VectorSource()
        })
        this.mapLayer.singleVector.getSource().addFeature(hanRiverLayer)
        this.map.addLayer(this.mapLayer.singleVector)
      },
    },
    mounted() {
      this.initMap()
      this.addLayer()
      this.addRiverLayer()
      this.addStationLayer()
      this.initMeasureLayer()
    }
  }
</script>

<style scoped>
  .map-wrapper {
    position: relative;
    height: 100%;
  }

  #map {
    height: 100%;
  }

  .button-group {
    position: absolute;
    top: 20px;
    left: 20px;
  }

  .area-select {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  .category-select {
    position: absolute;
    top: 80px;
    right: 20px;
  }
</style>
<style>
  .tooltip {
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    font-size: 14px;
    color: white;
    padding: 4px 8px;
    opacity: 0.7;
    white-space: nowrap;
  }

  .tooltip.hidden {
    display: none;
  }

  .tooltip-measure {
    opacity: 1;
    font-weight: bold;
  }

  .tooltip-static {
    background-color: #ffcc33;
    color: black;
    border: 1px solid white;
  }

  .tooltip-measure:before,
  .tooltip-static:before {
    border-top: 6px solid rgba(0, 0, 0, 0.5);
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    content: "";
    position: absolute;
    bottom: -6px;
    margin-left: -7px;
    left: 50%;
  }

  .tooltip-static:before {
    border-top-color: #ffcc33;
  }
</style>
