const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const wordElement = document.getElementById('word');
const word2Element = document.getElementById('word2');
const blindNum = 16;// 背景画像を隠す為の ブライド(縦長の柱状の覆い)の数 
let imgIdx = 0;    // スライドショー表示する背景画の現在の番号
let bonusIdx = 0;  // スライドショー変化させる為のカウンター
//const words = ["abc","def","ghi","jkl"];
let score = 0;
let activeWords = []; // 現在画面にある単語群を管理
var blinds = []; // 背景画を隠す為のブラインド(縦長の柱状のものを blindNum個並べる)
for (let ii = 0; ii < blindNum; ii++) {
    blinds[ii] = document.createElement('div');
    blinds[ii].className = 'opaque';
    blinds[ii].style.top = 0;
    blinds[ii].style.width = 100/blindNum + '%'
    blinds[ii].style.left = (window.innerWidth*ii)/blindNum + 'px';
    blinds[ii].style.opacity = "0.94";
    container.appendChild(blinds[ii]);
}
document.body.style.backgroundImage = 'url("'+images[imgIdx]+'")';
let inputWord = ""
// 1. ドロップする「単語」を一つ生成する関数
function dropWord() {
    const letter = document.createElement('div');
    const ltBase = document.createElement('span');
    const ltMtch = document.createElement('span');
    const word = words[Math.floor(Math.random() * words.length)];
    ltBase.innerText = word;
    ltBase.className = 'letterBase';
    ltMtch.className = 'letterMatch';
    ltMtch.innerText = "";
    letter.className = 'letter';
    // ランダムな位置から落とす
    letter.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    // ランダムな速度（10秒〜19秒で落ちる様に…）
    const duration = 10 + Math.random() * 9;
    letter.style.animationDuration = duration + 's';
    letter.appendChild(ltMtch); letter.appendChild(ltBase);
    container.appendChild(letter);
    activeWords.push({
        element: letter,
        mtch: ltMtch,
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
    if (kChar == "") {
        word2Element.innerText = tut.buf; /* 入力しかけのテンポラリーアルファベット */
        return;
    }/* 未確定の場合すぐリターン */
    if (kChar == "^H") { // BackSpace
        inputWord = inputWord.replace(/.$/,"")
    } else if (kChar == "^G") { // Cancel
        inputWord = '';
    } else {
        inputWord += kChar;
    }
    // 入力された単語が、現在落下中の単語群のどれかと一致するか確認
    let rmWords = [];//一致した単語を消す為の準備
    for (var i in activeWords) {
        let w = activeWords[i];
        if (w.word.indexOf(inputWord) == 0) {
            if (inputWord === w.word) { //完全一致した場合は消去予約
                rmWords.push(i);
            } else {
                w.mtch.innerText = inputWord;//入力文字とマッチした先頭部分を色付け表示
            }
        } else {
            w.mtch.innerText = '';
        }
    }
    let preScore = score;
    for (var i in rmWords.reverse()) { //消去予約した単語を消す(画面と配列の両方)(配列がおかしくならない様に、後ろから処理)
        let w = activeWords[rmWords[i]];
        let blindI = Math.floor( (parseInt(w.element.style.left) + 16) *blindNum /window.innerWidth ); // 落下単語が存在したあたりの ブラインドの番号を調べる
        if (blindI >= 0 && blindI < blindNum) {
            ;
        } else {
            blindI=10;
        }
        w.element.remove(); // 画面から削除
        activeWords.splice(rmWords[i], 1);
        score += 10;
        let fl = parseFloat(blinds[blindI].style.opacity) - 0.3; // 該当ブラインドを透け透けにしてゆく
        if (fl < 0) fl = 0;
        blinds[blindI].style.opacity = fl.toString();
        bonusIdx++;
    }
    if (preScore != score) { //スコアの変動があった場合(落ち単語のどれかが消えた場合)
        console.log(" bonusIdx = ", bonusIdx);
        if (bonusIdx > blindNum+6) {
            bonusIdx = 0;
            if (++imgIdx >= images.length) {
                imgIdx = 0;
            }
            document.body.style.backgroundImage = 'url("'+images[imgIdx]+'")'; // 背景画像を一個進める
            for (let i = 0; i < blinds.length; i++) { blinds[i].style.opacity = "0.93"; } //全ブラインドを (ほぼ)不透明にリセット
        } else if (bonusIdx > blindNum+3) { // クリアした単語が 閾値を越えたら、ボーナスで全ブラインドを透明にする
            for (let i = 0; i < blinds.length; i++) { blinds[i].style.opacity = "0.1"; }
        } 
        scoreElement.innerText = 'Score: ' + score;
        inputWord = ""
    }
    wordElement.innerText = inputWord;
    word2Element.innerText = tut.buf; /* 入力しかけのテンポラリーアルファベット */
});

