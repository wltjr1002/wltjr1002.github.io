const maxImageLimit = 8;

let answers = [];
let currentQuestionIndex = undefined;

// Input : aId(Number), pId(Number)
// Output :
//      (If reach to question or pId is not undefied)
//          Object{ pId(Number), name(String), mainImage(String), images(String list) }
//      (If failure)
//          undefined
//      (Else)
//          Object{
//              question(Object {
//                  qId(Number),
//                  question(String),
//                  answers(String list),
//              }),
//              images(Object List { pId(Number), name(String), mainImage(String) })
//          }
function getNextQuestionAndImages(answerIndex, chosenPId, excludePId) {
    if (currentQuestionIndex === undefined) {
        currentQuestionIndex = 0;
        
        return getNextData();
    }

    // user click answer
    if (answerIndex !== undefined) {
        answers.push({ questionIndex: currentQuestionIndex, answerIndex });
    }
    // user click product
    else if (chosenPId !== undefined) {
        answers.push({ chosenPId });
        return products.find(p => p.pId === chosenPId);
    }
    // user click no on result page
    else if (excludePId !== undefined) {
        answers.push({ excludePId });
    }

    return getNextData();
}

function isAcceptableScore(score, questionNum) {
    const correctP = score * 100 / questionNum
    return correctP > 50
}

function getNextData() {
    const excludePIds = answers.filter(a => a.excludePId !== undefined).map(a => a.excludePId);
    const qAnswers = answers.filter(a => a.questionIndex !== undefined);
    // if it's beginning
    if (qAnswers.length === 0) {
        return {
            question: questions[currentQuestionIndex],
            // images: getRandomProducts(maxImageLimit)
            //     .map(extractDataFromProduct),
            images: [],
        }
    }

    const leftProducts = products.filter(p => !excludePIds.includes(p.pId));

    // if nothing left, return undefined(fail)
    if (leftProducts.length === 0) {
        return undefined;
    }
    // if only one left, return it
    else if (leftProducts.length === 1) {
        return productScores[0].product;
    }

    // calculate score of products
    const productScores = [];
    for (const product of leftProducts) {
        if (excludePIds.includes(product.pId)) continue;

        let score = 0;
        for (const answer of qAnswers) {
            const productAnswers = product.questions[answer.questionIndex];
            if (productAnswers && productAnswers.includes(answer.answerIndex)) {
                score++;
            }
        }

        productScores.push({ product, score });
    }

    // sort product by score
    sortListByProperty(productScores, "score");
    const topScore = productScores[0].score;
    // if one product has unique highest score, return it
    if (topScore != productScores[1].score) {
        return productScores[0].product;
    }
    
    const candidateProducts = productScores
        .filter(ps => isAcceptableScore(ps.score, qAnswers.length))
        .filter(ps => ps.score === topScore)
        .map(ps => ps.product);
    // if every product has 0 score, return fail
    if (candidateProducts.length === 0) {
        return undefined;
    }

    // calculate the next question
    if (qAnswers.length === questions.length) {// no more question
        return undefined;
    }

    let nextQuestion = undefined;
    
    let lastQuestionIndex = -1;
    for (let i = qAnswers.length - 1; i >= 0; i--) {
        if (qAnswers[i].questionIndex !== undefined) {
            lastQuestionIndex = qAnswers[i].questionIndex;
            break;
        }
    }


    for (let i = lastQuestionIndex + 1; i < questions.length; i++) {
        const candidateProductAnswers = [];
        for (const product of candidateProducts) {
            candidateProductAnswers.push(...product.questions[i]);
        }

        const candidateProductAnswersNum = Array.from(new Set(candidateProductAnswers)).length;
        if (candidateProductAnswersNum > 1) {
            nextQuestion = questions[i];
            break;
        }
    }

    if (nextQuestion === undefined) {
        return undefined;
    }

    // set question index and return
    currentQuestionIndex = nextQuestion.qId;

    // filter nextImages with even number
    const shownProductNum = Math.min(maxImageLimit, candidateProducts.length);

    let shownProductImages = candidateProducts.slice(0, shownProductNum)
        .map(extractDataFromProduct);

    return {
        question: nextQuestion,
        images: shownProductImages,
    }
}

function undoAnswer() {
    if (answers.length === 0) {
        currentQuestionIndex = undefined;
        return undefined;
    } else {
        const lastAnswer = answers.pop();
        // if last action is answering question
        if (lastAnswer.questionIndex !== undefined) {
            currentQuestionIndex = lastAnswer.questionIndex;
        }
        return getNextData();
    }
}

function reset_algorithm() {
    answers = [];
    currentQuestionIndex = undefined;
}

const introImageLimit = 1;

function getIntroImages() {
    return getRandomProducts(introImageLimit);
}

//////////////////////////////////////////////////////////////////////////////

function sortListByProperty(l, p) {
    l.sort(function (a, b) {
        return b[p] - a[p];
    });
}

function extractDataFromProduct(p) {
    return {
        pId: p.pId,
        name: p.name,
        mainImage: p.mainImage,
    }
}

function getRandomProducts(num){
    var arr = [];
    while(arr.length < num){
        var p = products[Math.floor(Math.random()*products.length)];
        if(!arr.includes(p)){
            arr.push(p);
        }
    }
    return arr;
}