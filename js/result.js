var yes_button;
var no_button;

var fadeElements =[
    "#result_images_div",
    "#result_answer_div",
    "#result_button_div"
];

function test_quit(){
    resultQuitAnimation();
}


function gotoResFromQuestion(pId) {
	if(document.getElementById("result").style.display=="none"){
		fadeInComponentById("result");
	}
    setProductInfo(pId);
	if(document.getElementById("result").style.marginTop!="0%"){
		resultEnterAnimation();
	}
	else {
		hideObjects();
		fadeInResultElements();
	}
}

function gotoResFromImage(pId) {
    fadeInComponentById("result");
    setProductInfo(pId);
    resultEnterAnimation();
}

function setProductInfo(pId) {
	const { name, mainImage, images } = products.find(e=>e.pId==pId);
    // set main image
    $("#result_images_main_image").attr("src", mainImage);

    // set other images
    $(".result_images_other_image").each(function(index) {
        $(this).attr("src", images[index]);
    });
    
    // set product name
    $("#result_answer_text").html(name);

    // set yes button click event
    const buyLink = `https://search.shopping.naver.com/search/all?query=${encodeURI(name)}&frm=NVSHATC`
    yes_button = document.querySelector("#result_yes");
    yes_button.setAttribute("onClick","location.href=\""+buyLink+"\"");

    // set no button click event    
    $("#result_no").click(function(){
        const nextQni = getNextQuestionAndImages(undefined, undefined, pId);
        if(nextQni !== undefined && nextQni.pId !== undefined){ // next also result
            fadeOutResultElements();
            newQ(nextQni);
        }
        else{ // next is question
            newQ(nextQni);
            resultQuitAnimation();
        }
    });
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
            if(pos>30) pos-= int(pos/10);
            else pos -= 0.5;
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
	    $("#result").hide();
        }
        else {
            pos+=2;
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
        $(element).delay(index*100).fadeOut(200);
    });
    fadeElements.reverse();
}
