const gridsize = 12.5;
const offsetGrid = [
	[[4,4]],[[2,4],[6,4]],[[4,2],[2,6],[6,6]],[[2,2],[6,2],[2,6],[6,6]],
	[[3,2],[5,2],[2,6],[4,6],[6,6]],[[2,2],[4,2],[6,2],[2,6],[4,6],[6,6]],
	[[2,2],[4,2],[6,2],[1,6],[3,6],[5,6],[7,6]],
	[[1,2],[3,2],[5,2],[7,2],[1,6],[3,6],[5,6],[7,6]]
];

let imgpnt = [-1,-1,-1,-1,-1,-1,-1,-1,-1];

async function newQ(qni){
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
    change_query(qni);

	var curimgs = qni.images;
    const nextPIds = curimgs.map(img => img.pId)
    
    const newimgs = curimgs.filter(img => !imgpnt.includes(img.pId));
    var newPIds = newimgs.map(img => img.pId);
    const disappearPIds = imgpnt.filter(pid => (pid!=-1)&&!(nextPIds.includes(pid)));

    // hide incorrect 
	const disappearPromises = []
	for (let i = 1; i <= 8; i++) {
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

    // move image divs based on imgpnt
	await alignimgs(curimgs.length);

    newPIds = newimgs.map(img => img.pId);
	for (let i = 1; i <= 8; i++) {
        if(newPIds.includes(imgpnt[i])){
            var div = document.getElementById(`div${i}`);
            var img = curimgs.find(x=>x.pId==imgpnt[i]);
	    $("#image_text"+i).text(img.name);
            putImageAndFadeIn(div,i,img.mainImage);
        }
    }

    
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
        $("#wrongdiv"+i).show();
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

function hide_query(callback) {
	return  $(".query").fadeOut(fadeTime, callback);
}

function show_query() {
    return new Promise((resolve, reject) => {
        $(".query").fadeIn(fadeTime, resolve);
    });
}

function reset_query() {
    $(".question").empty();
    $(".choices").empty();
}

function change_query(qni){
    hide_query(async function() {
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
		for (let i = 1; i <= 8; i++) {
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
	for(var i=1 ; i<= 8 ; i++){
        let offset = getOffset(8,i);
        $(`#wrongdiv${i}, #div${i}`).animate({left: offset[0] +"%",top: offset[1] +"%"}, 1);
        $(`#div${i}`).hide();
		imgpnt[i]=-1;
	}
}

function getOffset(number,index){
    let offset = offsetGrid[number-1][index-1];
    return [offset[0]*gridsize, offset[1]*gridsize];
}