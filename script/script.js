const fadeTime = 500;

function getBuyLink(name) {
    return `https://search.shopping.naver.com/search/all?query=${encodeURI(name)}&frm=NVSHATC`
}

function set_intro() {
    const introImages = getIntroImages();
    for (let i = 0; i < introImages.length; i++) {
		const { name, mainImage } = introImages[i] 

        const sampleImageItem = `
			<a href="${getBuyLink(name)}">
				<img src="${mainImage}" class="intro_examples_image_src" onclick="location.href=\"${getBuyLink(name)}\"">
				<div>${name}</div>
			</a>`;
        
        $("#intro_recent_product").append(sampleImageItem);
    }

    $("#intro_start_btn").click(async function () {
    		init_candidates();
		await fadeOutComponentById("intro");
		await fadeInComponentById("question");
		
		const introQni = getNextQuestionAndImages(undefined, undefined, undefined);
		newQ(introQni);
    });
}

function set_fail() {
	$("#fail_go_intro").click(async function () {
		reset_algorithm();
		reset_query();

		await fadeOutComponentById("fail");
		await fadeInComponentById("intro");
	});
	
	$("#fail .back_button").click(async function () {
		reset_query();
		await fadeOutComponentById("fail");
		await fadeInComponentById("question");
        newQ(undoAnswer());
    });
}

function set_question(){
	init_candidates();

	$("#question .back_button").click(async function(){
		const prevQni = undoAnswer();
		if (prevQni === undefined) {
			await fadeOutComponentById("question");
			reset_query();
			await fadeInComponentById("intro");
		} else {
			newQ(prevQni,true);
		}
	});
	
	for (let i = 1; i <= maxImageLimit; i++) {
		$(`#div${i}`).click(function() {
			const pId = imgpnt[i];
			getNextQuestionAndImages(undefined, pId, undefined);
			gotoResFromImage(pId);
		});
	}
}

function set_result(){
	$("#result .down_button").click(function(){
		var nextData = undoAnswer();
		if(nextData.pId !== undefined){
			newQ(nextData);
		}
		else {
			resultQuitAnimation();
			newQ(nextData);
		}
	});
	
}

function fadeInComponentById(componentId) {
    return new Promise((resolve, reject) => {
        $(`#${componentId}`).fadeIn(fadeTime, resolve);
    });
}

function fadeOutComponentById(componentId) {
    return new Promise((resolve, reject) => {
        $(`#${componentId}`).fadeOut(fadeTime, resolve);
    });
}

// hide all component
$("#intro").hide();
$("#fail").hide();
$("#question").hide();
$("#result").hide();

reset_query();

set_intro();
set_question();
set_result();
set_fail();

$(document).ready(async function() {
    alignimgs(8);
	await fadeInComponentById("intro");
});