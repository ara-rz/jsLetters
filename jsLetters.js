const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const wordElement = document.getElementById('word');
const word2Element = document.getElementById('word2');
//const words = ["abc","def","ghi","jkl"];
let score = 0;
let activeWords = []; // 現在画面にある単語群を管理
var blinds = []; // 背景画を隠す為のブラインド(縦長の柱状のものを20個並べる)
for (let ii = 0; ii < 20; ii++) {
    blinds[ii] = document.createElement('div');
    blinds[ii].className = 'opaque';
    blinds[ii].style.top = 0;
    blinds[ii].style.left = (window.innerWidth*ii)/20 + 'px';
    blinds[ii].style.opacity = "0.94";
    container.appendChild(blinds[ii]);
}
let inputWord = ""
// 1. ドロップする「単語」を一つ生成する関数
function dropWord() {
    const letter = document.createElement('div');
    const word = words[Math.floor(Math.random() * words.length)];
    letter.innerText = word;
    letter.className = 'letter';
    // ランダムな位置から落とす
    letter.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    // ランダムな速度（10秒〜19秒で落ちる様に…）
    const duration = 10 + Math.random() * 9;
    letter.style.animationDuration = duration + 's';
    container.appendChild(letter);
    activeWords.push({
        element: letter,
        word: word
    });
    // 下まで到達したら削除
    setTimeout(() => {
        if (letter.parentNode) {
            container.removeChild(letter);
            activeWords = activeWords.filter(l => l.element !== letter);
        }
    }, duration * 1000);
}

// 2. 文字を定期的に生成 (1000==1秒ごと)
setInterval(dropWord, 2000);
let tut = Tut()
// 3. キーボード入力を受け取る
document.addEventListener('keydown', (e) => {
    let kChar = tut.feed(e.keyCode);/* 複数キー入力によって確定した かな文字(一文字)を返す */
    //kChar = e.key
    console.log("kChar : ", kChar);
    if (kChar == "") {
        word2Element.innerText = tut.buf; /* 入力しかけのテンポラリーアルファベット */
        return;
    }/* 未確定の場合すぐリターン */
    if (kChar == "^H") { // BackSpace
        inputWord = inputWord.replace(/.$/,"")
    } else if (kChar == "^G") { // Cancel
        inputWord = '';
    } else {
        inputWord += kChar; //inputWord += e.key;
    }
    // 入力された単語が、現在落下中の単語群のどれかと一致するか確認
    // (ここでは簡単のため、最初に見つかった単語のみ消す)
    const index = activeWords.findIndex(l => l.word === inputWord);
    if (index !== -1) {
        const target = activeWords[index];
        let idx = Math.floor( (parseInt(target.element.style.left) + inputWord.length*32/2) *20 /window.innerWidth ); /* 落下単語が存在したあたりの ブラインドの番号を調べる */
        //console.log(" idx = ", idx);
        if (idx >= 0 && idx < 20) {
            ;
        } else {
            idx=10;
        }
        target.element.remove(); // 画面から削除
        activeWords.splice(index, 1); // 配列から削除
        score += 10;
        inputWord = ""
        scoreElement.innerText = 'Score: ' + score;
        blinds[idx].style.opacity = "0.2"; /* 該当ブラインドを透明にする */
    }
    wordElement.innerText = inputWord;
    word2Element.innerText = tut.buf; /* 入力しかけのテンポラリーアルファベット */
});

