require(["esri/Map", "esri/views/MapView"], function(Map, MapView) {
        var map = new Map({
          basemap: "terrain"
        });

        var view = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 8,
          center: [-73, 41.4] // longitude, latitude
        });
      });
