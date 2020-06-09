var yes_button;
var no_button;

var fadeElements =[
    "#result_middle",
    "#result_bottom p",
    "#result_bottom img"
];

function test_enter(){
    setProductImg(imgSource_test[2]);
    setCandidatesImg(imgSource_test);
    setProductname("Pokemon");
    resultEnterAnimation();
}
function test_quit(){
    resultQuitAnimation();
}


function gotoResFromQuestion(pId) {
	var product = products.find(e=>e.pId==pId);
	if(document.getElementById("result").style.display=="none"){
		fadeInComponentById("result");
	}
    setProductImg(product.mainImage);
    setCandidatesImg(product.images);
	setProductname(product.name);
	setNobutton(pId);
	if(document.getElementById("result").style.marginTop!="0%"){
		resultEnterAnimation();
	}
	else {
		hideObjects();
		fadeInResultElements();
	}
}

function gotoResFromImage(pId) {
	var product = products.find(e=>e.pId==pId);
    fadeInComponentById("result");
    setProductImg(product.mainImage);
    setCandidatesImg(product.images);
	setProductname(product.name);
	setBackbutton();
    resultEnterAnimation();
}




function setNobutton(pId){
    $("#result_back").hide();
    $("#result_no").show();
    $("#result_no").click(function(){
        const nextQni = getNextQuestionAndImages(undefined, undefined, pId);
        if(nextQni.pId !== undefined){ // next also result
            fadeOutResultElements();
            newQ(nextQni);
        }
        else{ // next is question
            newQ(nextQni);
            resultQuitAnimation();
        }
    })
}

function setBackbutton(){
    $("#result_no").hide();
    $("#result_back").show();
}

function setProductname(name){
    document.querySelector("#product_text").innerHTML=name;
    document.querySelector("#result_bottom p").innerHTML="Other images of "+ name;

    var nameuri = encodeURI(name)
    var buylink = "https://search.shopping.naver.com/search/all?query="+nameuri+"&frm=NVSHATC"
    yes_button = document.querySelector("#result_yes");
    yes_button.setAttribute("onClick","location.href=\""+buylink+"\"");
}

function setCandidatesImg(imgList){
    var img =  document.querySelectorAll("#result_bottom img");
    img.forEach(function(element,index,array){
        element.setAttribute("src",imgList[index]);
    });
}

function setProductImg(imgsrc){
    var img =  document.querySelector("#product_img");
    img.setAttribute("src",imgsrc);
}

function hideObjects(){
    fadeElements.forEach(element => {
        $(element).hide();
    });
}

function resultEnterAnimation(){
    hideObjects();
    var elem = document.getElementById("result");
    var pos = 100;
    var id = setInterval(frame,5);
    function frame(){
        if (pos==0){
            clearInterval(id);
            fadeInResultElements();
        }
        else {
            pos--;
            elem.style.marginTop = pos+"%";
        }
    }
}

function resultQuitAnimation(){
    fadeOutResultElements();
    setTimeout(doQuitAnimation,fadeElements.length*200+200);
}
function doQuitAnimation(){
    var elem = document.getElementById("result");
    var pos = 0;
    var id = setInterval(frame,5);
    function frame(){
        if (pos==100){
            clearInterval(id);
        }
        else {
            pos++;
            elem.style.marginTop = pos+"%";
        }
    }
}

function fadeInResultElements(){
    fadeElements.forEach(function(element,index,array) {
        $(element).delay(index*200).fadeIn();
    });
}
function fadeOutResultElements(){
    fadeElements.reverse();
    fadeElements.forEach(function(element,index,array) {
        $(element).delay(index*200).fadeOut();
    });
    fadeElements.reverse();
}
