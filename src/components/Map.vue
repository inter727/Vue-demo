<template>
  <div class="map-wrapper">
    <div id="map"></div>
    <div class="button-group">
      <el-button size="small" @click="toggleLayer('vec')">行政图</el-button>
      <el-button size="small" @click="toggleLayer('img')">卫星图</el-button>
      <el-button size="small" @click="toggleLayer('ter')">地形图</el-button>
    </div>
    <el-select class="area-select" v-model="area" clearable placeholder="请选择流域分区"
               @change="addAreaLayer" @clear="clearAreaLayer">
      <el-option v-for="area in areas" :key="area" :label="area" :value="area"></el-option>
    </el-select>
  </div>
</template>

<script>
  import { Map, View } from 'ol'
  import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
  import { XYZ, Vector as VectorSource } from 'ol/source'
  import { WKT, GeoJSON } from 'ol/format'
  import { Style, Stroke, Fill } from 'ol/style'
  import mapLayer from '../../static/mapLayer'
  import drainageBasin from '../../static/drainageBasin'

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
        areas: ['石泉水库以上', '石泉水库至白河水文站', '白河水文站至丹江口', '丹江河流域', '库周流域', '堵河流域']
      }
    },
    methods: {
      initMap() {
        const base = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.base}`
          })
        })
        const normal = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.normal}`
          })
        })
        const satellite = new TileLayer({
          source: new XYZ({
            url: `http://t${Math.round(Math.random() * 7)}.${this.satellite}`
          }),
          visible: false
        })
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
            minZoom: 7
          }),
          layers: [landform, satellite, normal, base],
          controls: []
        })
      },
      addLayer() {
        Promise.resolve(mapLayer).then(res => {
          const WKTFormat = new WKT()
          const shape = WKTFormat.readFeature(res.result.shape, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:4326'
          })
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
      }
    },
    mounted() {
      this.initMap()
      this.addLayer()
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
</style>
