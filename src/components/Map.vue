<template>
  <div id="map"></div>
</template>

<script>
  import { Map, View } from 'ol'
  import TileLayer from 'ol/layer/Tile'
  import VectorLayer from 'ol/layer/Vector'
  import XYZSource from 'ol/source/XYZ'
  import VectorSource from 'ol/source/Vector'
  import WKTFormat from 'ol/format/WKT'
  import Style from 'ol/style/Style'
  import Stroke from 'ol/style/Stroke'
  import Fill from 'ol/style/Fill'
  import mapLayer from '../../static/mapLayer'

  export default {
    name: "Map",
    data() {
      return {
        map: null,
        base: 'tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        normal: 'tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        mapLayer: {}
      }
    },
    methods: {
      initMap() {
        const base = new TileLayer({
          visible: true,
          source: new XYZSource({url: `http://t${Math.round(Math.random() * 7)}.${this.base}`})
        })
        const normal = new TileLayer({
          visible: true,
          source: new XYZSource({url: `http://t${Math.round(Math.random() * 7)}.${this.normal}`})
        })
        this.map = new Map({
          target: 'map',
          view: new View({
            projection: 'EPSG:4326',
            center: [110.654, 32.589],
            zoom: 7,
            minZoom: 7
          }),
          layers: [normal, base],
          controls: []
        })
      },
      addLayer() {
        Promise.resolve(mapLayer).then(res => {
          const format = new WKTFormat()
          const shape = format.readFeature(res.result.shape, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:4326'
          })
          const layer = format.readFeature(res.result.json, {
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
      }
    },
    mounted() {
      this.initMap()
      this.addLayer()
    }
  }
</script>

<style scoped>
  #map {
    height: 100%;
  }
</style>
