require([
  "esri/Map",
  "esri/views/MapView",
  "esri/request",
  "esri/identity/IdentityManager",
  "esri/layers/FeatureLayer",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Legend",
  "esri/widgets/Expand"
],

function(Map, MapView, esriRequest, esriId, FeatureLayer, BasemapGallery, Legend, Expand) {
        var map = new Map({
          basemap: "dark-gray-vector"
        });

        var view = new MapView({
          container: "viewDiv",
          map: map,
          zoom: 13,
          center: [-73.549884, 40.699494] // longitude, latitude
        });

        // temporary way to access private resource; will need to be changed later using either Token-based or OAutho if required
        // https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/
        // https://developers.arcgis.com/javascript/latest/guide/secure-resources/
        // https://developers.arcgis.com/javascript/latest/api-reference/esri-identity-IdentityManager.html
        var url = "https://www.arcgis.com/sharing/rest/generateToken"
        var options = {
        query:{
          f:"json",
          username:"carl.vricella_psegli",
          password:"@phineasjohnson18S",
          referer:"https://www.arcgis.com"
        },
        method:"post",
        responseType:"json"}

        esriRequest(url, options).then(function(response){
          console.log(response.data.token)
          var token = {token:response.data.token,
                       server: "https://www.arcgis.com/sharing/rest"}
          esriId.registerToken(token);
        });

        var popupTemplate = { // autocasts as new PopupTemplate()
         title: "{Name}",
         content:`<ul>
                   <li>Sub Name: {sub_name}</li>
                   <li>Feeder Number: {feeder_name}</li>
                   <li>HC Max (kW): {HC_max_kW}</li>
                   <li>HC Min (kW): {HC_min_kW}</li>
                   <li>Connected DG (kW): {DG_kW}</li>
                   <li>DG in Queue (kW): {dg_in_queue}</li>
                  </ul>`
       };

        var url = `https://services1.arcgis.com/0cYxNkh7FJosf1xi/arcgis/rest/services/oh_primary_wire_hcm/FeatureServer/0`
        var hcm_layer = new FeatureLayer({
          url:url,
          title: "Primary Wire Max Hosting Capacity",
          popupEnabled:true,
          popupTemplate:popupTemplate
        })

        console.log(hcm_layer.popupEnabled)

        map.add(hcm_layer)

        var basemapGallery = new BasemapGallery({
          view:view,
          container: document.createElement("div")
        });

        var legend = new Legend({
          view:view,
          layerInfos:[{
            layer: hcm_layer
          }]
        });


        var basemapExpand = new Expand({
          view:view,
          content:basemapGallery,
          expanded:false
        });

        var legendExpand = new Expand({
          view:view,
          content:legend,
          expanded:false
        })

        console.log(view.popup);
        view.ui.add(basemapExpand, {
          position:"top-right"
        });

        view.ui.add(legendExpand, {
          position:"top-right"
        });

      });
