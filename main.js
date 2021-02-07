window.addEventListener('DOMContentLoaded',function(){
    
    const projSrc = {0:{url:"https://finnmaps.org",src:"projImg/finnmaps.png",title:"Finn Maps",
    info:`Full stack mapping application that shows places my dog Finn has been. 
    Uses python w/bottle on the backend and vanilla JS, HTML, CSS with ESRI ArcGIS Javascript API on the front end. 
    The application is hosted on an AWS EC2 instance I manage running RHEL`}, 
    1:{url:"https://cvgeospatial.com/coyote_model",src:"projImg/coyote_model.png",title: "Eastern Coyote HSM",
    info:`Jupyter notebook explaining the creation of a reasuable python script tool that produces a Habitat
    Suitability Model for the Eastern Coyote in the Northeast`}}
    const leftControl = document.getElementById("leftControl");
    const rightControl = document.getElementById("rightControl");
    leftControl.addEventListener("click",function(){
        moveSlideshow("previous",projSrc)
    });
    
    rightControl.addEventListener("click",function(){
        moveSlideshow("next",projSrc)
    });
    
})



function moveSlideshow(direction,projObj){
    let currentImg = document.getElementsByClassName("projImg")[0]
    let idx = parseInt(currentImg.id)
    let getProj = {"next": idx + 1, "previous": idx - 1}
    let newIdx =  getProj[direction]
    
    if ( !(newIdx >= 0 && newIdx <= (Object.keys(projObj).length - 1) )) {
        newIdx = 0
    }
    
    let newProj = projObj[newIdx]
    document.getElementById("projectInfo").innerHTML = newProj.info;
    document.getElementById("projectTitle").innerHTML = newProj.title;
    currentImg.src = newProj.src
    currentImg.parentNode.href = newProj.url
    currentImg.id = newIdx
}


