<template>
  <div class="map-wrapper">
    <div id="map"></div>
    <div class="button-group">
      <el-button size="small" @click="toggleLayer('vec')">行政图</el-button>
      <el-button size="small" @click="toggleLayer('img')">卫星图</el-button>
      <el-button size="small" @click="toggleLayer('ter')">地形图</el-button>
    </div>
  </div>
</template>

<script>
  import { Map, View } from 'ol'
  import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
  import { XYZ, Vector as VectorSource } from 'ol/source'
  import { WKT } from 'ol/format'
  import { Style, Stroke, Fill } from 'ol/style'
  import mapLayer from '../../static/mapLayer'

  export default {
    name: "Map",
    data() {
      return {
        map: null,
        base: 'tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        normal: 'tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        satellite: 'tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        landform: 'tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        mapLayer: {}
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
</style>
