//TO DO:
// server side python scripts
// add new layer to house finns current location
// get rid of editing
// republish layer on agol, publish user information table sep. So it can't be viewed or edited.


require([
  "esri/views/MapView",
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/popup/RelatedRecordsInfo",
  "esri/widgets/Editor",
  "esri/widgets/Expand",
  "esri/request",
  "esri/widgets/Legend"
],
  function(MapView,Map,FeatureLayer,RelatedRecordsInfo,Editor,Expand,esriRequest,Legend) {

  var map = new Map({
    basemap:"osm"
  });

  var view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-72.991659,40.902234],
    zoom:9
  });

  const relatedRecords = new RelatedRecordsInfo({
    showRelatedRecords:true,
    orderByFields:{
      field:"ticks_found",
      order:"asc"
    }
  });


  const places_template = {
    title: "{name}",
    content:[
      {
        type:"attachments",
        displayType: "preview"
      },
      {
        type:"fields",
        fieldInfos:[
          {
            fieldName: "relationships/0/ticks_found",
            label: "Ticks Found?"
          },
          {
            fieldName:"finn_rank",
            label:"Finn Ranking"
          },
          {
            fieldName:"visited",
            label:"Visited?"
          }
        ]
      }
    ],

  relatedRecordsInfo: relatedRecords
  }

  var finnPlaces = new FeatureLayer({
    url:"https://services2.arcgis.com/O48sbyo4drQXsscH/arcgis/rest/services/Finn_Maps_HFS/FeatureServer/0"
  });


  var visitData = new FeatureLayer({
    url:"https://services2.arcgis.com/O48sbyo4drQXsscH/arcgis/rest/services/Finn_Maps_HFS/FeatureServer/1"
  });

  var userInfo = new FeatureLayer({
    url:"https://services2.arcgis.com/O48sbyo4drQXsscH/arcgis/rest/services/Finn_Maps_HFS/FeatureServer/2"
  });

  finnPlaces.outFields = ["*"];
  visitData.outFIelds = ["*"];




// create variables in global scope that are used throughout application
let relatedData = {};
const sidebar = document.getElementById("sidebar");
const headerTitle = document.getElementById("headerTitle");
const headerSubTitle = document.getElementById('headerSubTitle');
const visitInfo = document.getElementById("visitInfo");
const visitAttachments = document.getElementById("visitAttachments");
const nextVisitButton = document.getElementById("nextVisit");
const nextAttachButton = document.getElementById("nextAttach");
const visitHeader = document.getElementById("visitHeader");
const placeInfo = document.getElementById("placeInfo");
const visitDate = document.createElement("p");
const noImgVid = document.createElement("p");
const noParagraph = document.createElement("p");
const rankText = document.createElement("p")

noImgVid.id = "noImgVid";
visitDate.id = "visitDate";
rankText.id = "finnRank";
rankText.innerHTML = "Finn Ranking: "
noParagraph.innerHTML = "Finn Didin't Record Any Information Yet About This Visit!"
noImgVid.innerHTML = "Finn Didin't Take Any Photos or Videos During This Visit!"

 view.on("click", function (event) {
   clearSideBar()
   createSidebar(event);
 });

 nextVisitButton.addEventListener("click", function(event){
   nextVisit(relatedData);
 });

 nextAttachButton.addEventListener("click", function(event){
   nextAttach(relatedData);
  });

/** Clears the sidebar if anywhere different is clicked on the map from the last click */
 function clearSideBar() {
   visitAttachments.innerHTML = " ";
   visitInfo.innerHTML = " ";
   nextVisitButton.style.display = "none";
   nextAttachButton.style.display = "none";
   visitHeader.innerHTML = " ";
   visitDate.innerHTML = " ";
 };

/** initializes the sidebar when a Finn place is clicked on the map */
 function updateSidebar(relatedData) {
   visitHeader.style.display = 'flex';
   visitHeader.appendChild(visitDate);
   let relatedDataKeys = Object.keys(relatedData)
   // If related data is empty let the user no by displaying
   // noImgVid and noParagraph elements. This will happen if
   // There are no related features to query when this function is
   // called by queryRelatedFetures().
   // Then return.
   if (relatedDataKeys.length === 0) {
     visitAttachments.append(noImgVid);
     visitInfo.append(noParagraph);
     return
   } else {
     let attachments = relatedData[relatedDataKeys[0]].attachments
     if (!(attachments.length === 0)) {
       visitAttachments.append(attachments[0]);
     } else {
       visitAttachments.append(noImgVid);
     }
   }
   visitInfo.append(relatedData[relatedDataKeys[0]].visit_paragraph);
   nextVisitButton.style.display = "block";
   nextAttachButton.style.display = "block";
   visitDate.innerHTML = relatedData[relatedDataKeys[0]].date_of_visit;
 };

/** nextVisit() controls how the user clicks through visits associated with each Finn Place.
 * It's triggered when a user clicks on the "nextVisitButton" which is creatd with the
 * updateSidebar() function.
 * @param {object} relatedData - the relatedData object created by queryRelatedFetures()
 */
 function nextVisit(relatedData) {
   // Initialize the various variables needed to render the relevant visit information.
   // the index variables current_idx and next_idx exist to ensure the proper visit information
   // is displayed and that the user doesn't step outside of the index range. If the next_idx
   // is equal to the number of available keys we know that we are at the end of the array and
   // need to go back tot he start.
   let visit_paragraph = visitInfo.children[0]
   let visit_attachment = visitAttachments.children[0]
   let relatedDataKeys = Object.keys(relatedData);
   // current_idx tells nextVisit where in the array of visit info stored in relatedData
   // the index position is currently at (i.e. before we got to the next visit)
   let current_idx = relatedDataKeys.indexOf(`${visit_paragraph.id}`)
   // We know that we want to go to the next index position in the array
   // so increment by one.
   let next_idx = current_idx + 1
   // Then this if ensures that if we are going to be outside the index range
   // on the next visit, go back to the first position (i.e. 0)
   if (relatedDataKeys.length === next_idx) { next_idx = 0 }
   let visit = relatedData[relatedDataKeys[next_idx]]
   visit_paragraph.replaceWith(visit.visit_paragraph);
   visitDate.innerHTML = visit.date_of_visit;
   // One last check, need to make sure we actually have attachments for the current visit.
   // if not then the noImgVid element stores some text to let the user know.
   if(!(visit.attachments.length === 0)) {
      visit_attachment.replaceWith(visit.attachments[0]);
   } else {
     visit_attachment.replaceWith(noImgVid);
   }
 }

 function nextAttach(relatedData) {
   let visit_paragraph = visitInfo.children[0]
   let current_oid = parseInt(visit_paragraph.id);
   let visit_attachment = visitAttachments.children[0]
   let relatedDataKeys = Object.keys(relatedData);
   let current_idx = relatedDataKeys.indexOf(`${visit_paragraph.id}`)
   let attachments = relatedData[current_oid].attachments;
   if(!(attachments.length === 0)){
     let attach_idx = attachments.indexOf(visit_attachment);

     if(attach_idx + 1 === attachments.length) {
          visit_attachment.replaceWith(attachments[0])
     } else {
          visit_attachment.replaceWith(attachments[attach_idx+1])
        };
   }
 }

 function addRankStars (ranking) {
     let breakpoint = 1;
     if (ranking) {
       visitHeader.appendChild(rankText);
       for (x of Array(ranking).keys()) {
         let span = document.createElement("span")
         span.className = "fa fa-star checked"
         visitHeader.appendChild(span)
         if (breakpoint === ranking ) {
           break
         }
         breakpoint++;
       }
     }
 }

 let highlight;
 function createSidebar(screenPoint) {
   relatedData = {};
   view.hitTest(screenPoint).then(function(response){
     if(response.results.length === 0) {
       // Remove highlight if anywhere on map is clicked.
       highlight.remove();
       headerTitle.innerHTML = "Finn Maps";
       headerSubTitle.innerHTML = "Click any of the points on the map to view details on Finn's many Adventures!";
       visitHeader.style.display = "none";
       return
     }
     let graphic = response.results[0].graphic
     // Highlights feature when clicked, removes highlight if
     // new feature is clicked.
     view.whenLayerView(graphic.layer).then(function(layerView){
       if (highlight) {
         highlight.remove();
      }
       highlight = layerView.highlight(graphic);
     });
     headerTitle.innerHTML = graphic.attributes.name;
     placeInfo.innerHTML = graphic.attributes.comment;
     headerSubTitle.innerHTML = "";
     addRankStars(graphic.attributes.finn_rank);
     return graphic.attributes.OBJECTID
   }).then(function(objectId) {
       // Query the for the related features for the features ids found
       return finnPlaces.queryRelatedFeatures({
         outFields: ["OBJECTID","date_of_visit","ticks_found","num_ticks_found","note","Photos And Files"],
         relationshipId: finnPlaces.relationships[0].id,
         objectIds: objectId
       });
     }).then(function (relatedFeatureSetByObjectId) {
       let relatedFeatureSetKeys = Object.keys(relatedFeatureSetByObjectId);
       if (relatedFeatureSetKeys.length === 0){
         updateSidebar(relatedData);
       } else {
       relatedFeatureSetKeys.forEach(function(objectId) {
         // get the attributes of the FeatureSet
         const relatedFeatureSet = relatedFeatureSetByObjectId[objectId];
         // Map over the feature set to create an object containing visit data for for each
         // visit related to a point clicked on the map. For the first instance of a visit
         // add an element to the DOM containing it.
         relatedFeatureSet.features.map(function (feature) {

           let visit_date = feature.attributes.date_of_visit;
           let date = new Date(visit_date)
           let formatted_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
           let oid = feature.attributes.OBJECTID
           let ticks_found = feature.attributes.ticks_found
           let num_ticks_found = feature.attributes.num_ticks_found
           let note = feature.attributes.note

           relatedData[oid] = {date_of_visit:formatted_date,
                              ticks_found:ticks_found,
                              num_ticks_found:num_ticks_found,
                              note:note,
                              attachments:[]};

           let visit_paragraph = document.createElement("p")
           visit_paragraph.id = feature.attributes.OBJECTID
           visit_paragraph.innerHTML = feature.attributes.note
           relatedData[feature.attributes.OBJECTID].visit_paragraph = visit_paragraph;
         });

         let relatedDataKeys = Object.keys(relatedData);
         // Get the attachments for each related feature
         relatedDataKeys.forEach(function(objectId) {
           visitData.queryAttachments({
             //apparently ios videos somehow go from mov to quicktime
             attachmentTypes: ["image/jpeg","video/mp4","video/quicktime"],
             objectIds:objectId
           }).then(function(attachmentIds){
             let attach_num = 1;
             Object.keys(attachmentIds).forEach(function(id){
               const attachments = attachmentIds[id];
               attachments.forEach(function(attachment){
                 let contentType = attachment.contentType;
                 if ((contentType === "video/mp4" || contentType === "video/quicktime")){
                   ele_type = "video";
                 }else{
                   ele_type = "img";
                 }
                 let ele = document.createElement(ele_type)
                 if (ele_type === "video"){ele.controls = true}
                 ele.className = "queryImg";
                 ele.id = `visitAttach${attach_num}`;
                 attach_num++
                 ele.src = attachment.url
                 relatedData[id].attachments.push(ele);
               })
             })
           })
         })
        setTimeout(function(){updateSidebar(relatedData)},1000);
     })
   }
    }).catch(function(error){
      console.log(error);
    });
   };

   const editor = new Editor({
     view:view,
     layerInfos: [{
       view: view,
       layer: finnPlaces, // pass in the feature layer
       fieldConfig: [ // Specify which fields to configure
         {
           name: "name",
           label: "Place Name"
         }],
   enabled: true, // default is true, set to false to disable editing functionality
   addEnabled: true, // default is true, set to false to disable the ability to add a new feature
   updateEnabled: false, // default is true, set to false to disable the ability to edit an existing feature
   deleteEnabled: false // default is true, set to false to disable the ability to delete features
 }]
});

  const legend = new Legend({
    view: view,
    layerInfos: [{
      layer: finnPlaces,
      title: " "
    }]
  });

  const legendExpand = new Expand({
    expandIconClass: "esri-icon-key",
    view: view,
    content: legend,
    mode:"auto",
    expandTooltip:"View Map View",
    collapseTooltip:"Close Map Key"
  });

const editorExpand = new Expand({
  expandIconClass: "esri-icon-edit",
  view: view,
  content: editor,
  mode:"auto",
  expandTooltip:"Add a Place For Finn To Visit",
  collapseTooltip:"Close Editor"
});



  view.ui.add(editorExpand, "top-right");
  view.ui.add(legendExpand, "top-right");

  map.add(finnPlaces);

  const formContainer = document.getElementById("formContainer");
  const submitForm = document.getElementById("submitFormBtn");
  const form = document.getElementsByName("submitForm")[0];
  const openForm = document.getElementById("openForm");
  const closeForm = document.getElementById("closeForm");
  const overlay = document.getElementById("overlay");

  submitForm.addEventListener("click", function(event){
    let name = document.getElementById("name").value
    let email = document.getElementById("email").value
    let phone_number = document.getElementById("phone_number").value
    // let notify = document.getElementById("notify").value
    // Currently if you fill out the form you are agreeing to notifications, could change later.
    let data = {"id":2, "adds":[{ "attributes":{ "name":name, "email":email, "phone_number":phone_number, "notify":"1"}}]}
    data = JSON.stringify(data);
    const userInformation = `https://services2.arcgis.com/O48sbyo4drQXsscH/arcgis/rest/services/Finn_Maps_HFS/FeatureServer/applyEdits?f=json&edits=[${data}]`

    esriRequest(userInformation,{
      responseType:"json",
      method:"post"
    }).then(function(response){
      console.log(response.data);
    }).catch(function(err){
      console.log(err)
    });
    form.reset();
  });

  openForm.addEventListener("click", function(event){
    formContainer.style.display = "flex";
    overlay.style.display= "block";
  });

  closeForm.addEventListener("click", function(event){
    formContainer.style.display = "none";
    overlay.style.display = "none";
  });


});
