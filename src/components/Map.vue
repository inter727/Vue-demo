<template>
  <div id="map"></div>
</template>

<script>
  import { Map, View } from 'ol'
  import TileLayer from 'ol/layer/Tile'
  import SourceXYZ from 'ol/source/XYZ'
  export default {
    name: "Map",
    data() {
      return {
        map: null,
        base: 'tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f',
        normal: 'tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=acdde43f9bf091f2383b721ed1aa581f'
      }
    },
    methods: {
      initMap() {
        let base = new TileLayer({
          visible: true,
          source: new SourceXYZ({url: `http://t${Math.round(Math.random() * 7)}.${this.base}`})
        })
        let normal = new TileLayer({
          visible: true,
          source: new SourceXYZ({url: `http://t${Math.round(Math.random() * 7)}.${this.normal}`})
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
      }
    },
    mounted() {
      this.initMap()
    }
  }
</script>

<style scoped>
  #map {
    height: 100%;
  }
</style>
