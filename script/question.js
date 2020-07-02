const maxImage = 10;
const Xoffset = [12.5,37.5,62.5,87.5,10,30,50,70,90,20,40,60,80];
const Yoffset = [25,50,75];
const offsetGrid = [
	[[6,1]],[[1,1],[2,1]],[[5,1],[6,1],[7,1]],[[0,1],[1,1],[2,1],[3,1]],
	[[4,1],[5,1],[6,1],[7,1],[8,1]],[[5,0],[6,0],[7,0],[5,2],[6,2],[7,2]],
	[[5,0],[6,0],[7,0],[9,2],[10,2],[11,2],[12,2]],
	[[0,0],[1,0],[2,0],[3,0],[0,2],[1,2],[2,2],[3,2]],
	[[9,0],[10,0],[11,0],[12,0],[4,2],[5,2],[6,2],[7,2],[8,2]],
	[[4,0],[5,0],[6,0],[7,0],[8,0],[4,2],[5,2],[6,2],[7,2],[8,2]]
];

let imgpnt = [-1,-1,-1,-1,-1,-1,-1,-1,-1];

async function newQ(qni, reverse=false){
	// 1) go to fail
    if (qni === undefined) {
		await fadeOutComponentById("question");
		await fadeInComponentById("fail");
        return;
	}
	
	// go to result
	if (qni.pId !== undefined) {
		gotoResFromQuestion(qni.pId);
		return;
	}

	// 2) go to question
    change_query(qni, reverse);

	// manipuate candidate images
	var curimgs = qni.images;
    const nextPIds = curimgs.map(img => img.pId)
    
    const newimgs = curimgs.filter(img => !imgpnt.includes(img.pId));
    var newPIds = newimgs.map(img => img.pId);
    const disappearPIds = imgpnt.filter(pid => (pid!=-1)&&!(nextPIds.includes(pid)));

	// hide incorrect
	const disappearPromises = []
	for (let i = 1; i <= maxImage; i++) {
        if(disappearPIds.includes(imgpnt[i])){ // if this img in disappear list
            imgpnt[i] = -1; // empty box
            const disappearPromise = disappearDiv(i);
            disappearPromises.push(disappearPromise);
        }
        if(imgpnt[i]==-1 && newPIds.length>0){
            imgpnt[i] = newPIds.pop();
        }
	}
	await Promise.all(disappearPromises);

	if (curimgs.length === 0) { // no candidate (on first question)
		await appearNoCandidateDiv();
	} else {
		await disappearNoCandidateDiv();
		// move image divs based on imgpnt
		await alignimgs(curimgs.length);
	
		newPIds = newimgs.map(img => img.pId);
		for (let i = 1; i <= maxImage; i++) {
			if(newPIds.includes(imgpnt[i])){
				var div = document.getElementById(`div${i}`);
				var img = curimgs.find(x=>x.pId==imgpnt[i]);
				$("#image_text"+i).text(img.name);
				putImageAndFadeIn(div,i,img.mainImage);
			}
		}
	} 
}

function disappearNoCandidateDiv() {
	return new Promise((resolve, reject) => {
		$("#no_candid_div").fadeOut(400, resolve);
	});
}

function appearNoCandidateDiv() {
	return new Promise((resolve, reject) => {
		$("#no_candid_div").fadeIn(400, resolve);
	});
}

async function putImageAndFadeIn(div, j, mainImage) {
	putimage(j, mainImage);
    $(div).fadeIn(500);
}

function putimage(img_ind, img_url){
    let img = document.getElementById("image"+img_ind);
	img.src = img_url;
}

function disappearDiv(index){
    const i = index;
    return new Promise((resolve, reject) => {
       // $("#wrongdiv"+i).show();
        $("#div"+i).fadeOut(400, 
            (
                function() {
                    putimage(this,"images/image-placeholder.png");
                    resolve();
                }
            ).bind(i)
        );
        $("#wrongdiv"+i).fadeOut(500);
    });
}

function hide_query(reverse,callback) {
	// return $(".query").animate({
	// 	opacity: 0.0,
	// },500,callback)
	$(".query").fadeOut({queue:false, duration:fadeTime});
	if(reverse){
		$(".question").animate({marginLeft:20},{duration:fadeTime, complete:callback});
		$(".question").animate({marginLeft:-20},{duration:1});
	}
	else{
		$(".question").animate({marginLeft:-20},{duration:fadeTime, complete:callback});
		$(".question").animate({marginLeft:20},{duration:1});
	}
	
}

function hide_query_reverse(callback) {
	// return $(".query").animate({
	// 	opacity: 0.0,
	// },500,callback)
	$(".query").fadeOut({queue:false, duration:fadeTime});
	$(".question").animate({marginLeft:20},{duration:fadeTime, complete:callback});
	$(".question").animate({marginLeft:-20},{duration:1});
}

function show_query() {
    return new Promise((resolve, reject) => {
		$(".back_button_bg").show();
		$(".query").fadeIn({queue:false, duration:fadeTime});
		$(".question").animate({marginLeft:0},{duration:fadeTime, complete:resolve});
    });
}

function reset_query() {
	$(".back_button_bg").hide();
    $(".question").empty();
    $(".choices").empty();
}

function change_query(qni, reverse){
    hide_query(reverse,async function() {
		reset_query();
		// set next query
		var query = qni.question;
	
		$(".question").text(query["question"]);
	
		var choices = query["answers"];
		for(var i=0; i<query["answers"].length; i++){
	
			var b = $('<button type="button" class="btn-choice">').text(choices[i]).data("idx", i);
			b.click(function(){
				var idx = $(this).data("idx");
				var nextQni = getNextQuestionAndImages(idx, undefined, undefined);
				newQ(nextQni);
			})
			$(".choices").append(b);
		}
		
		show_query();
	});
}

function alignimgs(number) {
	return new Promise(async (resolve, reject) => {
		const promises = [];
		var imgCount = 0;
		for (let i = 1; i <= maxImage; i++) {
            if (imgpnt[i] == -1) continue;

            //set animation
            imgCount++;
            const offset = getOffset(number,imgCount);
			promises.push(new Promise((resolve, reject) => {
				$(`#wrongdiv${i}, #div${i}`).animate({left: offset[0] +"%",top: offset[1] +"%"}, 500, "swing", resolve);
			})); 
			
		}
		await Promise.all(promises);
		resolve();
	});
}

function init_candidates(){
	for(var i=1 ; i<= maxImage ; i++){
        let offset = getOffset(maxImage,i);
        $(`#wrongdiv${i}, #div${i}`).animate({left: offset[0] +"%",top: offset[1] +"%"}, 1);
        $(`#div${i}`).hide();
		imgpnt[i]=-1;
	}
}

function getOffset(number,index){
    let offset = offsetGrid[number-1][index-1];
    return [Xoffset[offset[0]], Yoffset[offset[1]]];
}