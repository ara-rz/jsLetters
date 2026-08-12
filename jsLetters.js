const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const wordElement = document.getElementById('word');
const word2Element = document.getElementById('word2');
const blindNum = 12;// 背景画像を隠す為の ブライド(縦長の柱状の覆い)の数 
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
let isPause = false; /* ポーズ中は "PAUSE"とかの文字列を入れる */
let animCount = 66;
function animate() {
    if (isPause) {
        if (scoreElement.innerText != isPause) {
            scoreElement.innerText = isPause;
        }
        return
    }
    let rmWords = [];
    for (let i in activeWords) {
        let w = activeWords[i];
        let y = parseFloat(w.letr.style.top); // 現時点のY座標
        y += w.v;// 下に落とす 
        if (y > window.innerHeight + 300) { //充分下まで落ちたので消す
            rmWords.push(i);
        } else {
            w.letr.style.top = y + 'px';
        }
    }
    for (let i in rmWords.reverse()) { // 配列を壊さない様に後ろから削除
        let w = activeWords[rmWords[i]];
        if (w.letr.parentNode) {
            container.removeChild(w.letr);
        }
        activeWords.splice(rmWords[i], 1);
    }
    animCount++;
    if (animCount > 66) {
        dropWord();animCount = 0;
    }
}       

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
    // 落とし始めの 初期左右位置は、ランダムに振る
    letter.style.left = Math.random() * (window.innerWidth - 32) + 'px';
    letter.style.top = "-50px";
    const velocity = 0.5 + Math.random()*1.5; // 1フレーム(16.6msec) で 0.5〜1.5px 落とす
    letter.appendChild(ltMtch); letter.appendChild(ltBase);
    container.appendChild(letter);
    activeWords.push({
        letr: letter,
        v: velocity,
        mtch: ltMtch,
        word: word
    });
}

// 2. アニメーションを自前でやる。60fps前提に 1フレーム16.6msec くらいで定期的にコールする
setInterval(animate, 16.6);

let a2k = Tut() // アルファベット(ABC)の入力を元に、かな(漢字)に変換するメソッド。a2k.feed(keyCode)を連続して呼ぶと、漢字を返す
//const C2a="#$%&'()*+,-./0123456789:;<=>?@abcdefghijklmnopqrstuvwxyz{|}"
//let a2k = function(){this.buf='';this.feed=function(c){return c<35?"^H":C2a.charAt(c-35)};return this}()

// 3. キーボード入力を受け取る
document.addEventListener('keydown', (e) => {
    let kChar = a2k.feed(e.keyCode);/* 複数キー入力によって確定した かな文字(一文字)を返す */
    if (kChar == "") {
        word2Element.innerText = a2k.buf; /* 入力しかけのテンポラリーアルファベット */
        return;
    }/* 未確定の場合すぐリターン */
    if (kChar == "^H") { // BackSpace
        inputWord = inputWord.replace(/.$/,"")
    } else if (kChar == "^G") { // Cancel
        inputWord = '';
    } else if (kChar == "^P") { // Pause or Play
        if (isPause) { // Pause中なので再開
            isPause = false;
            scoreElement.innerText = 'Score: ' + score;
            return;
        } else {
            scoreElement.innerText = isPause = '[PAUSE]';
            return;
        }
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
        let blindI = Math.floor( (parseInt(w.letr.style.left) + 16) *blindNum /window.innerWidth ); // 落下単語が存在したあたりの ブラインドの番号を調べる
/*        if (blindI >= 0 && blindI < blindNum) {
            ;
        } else {
            blindI=10;
        }*/
        w.letr.remove(); // 画面から削除
        activeWords.splice(rmWords[i], 1);
        score += 10;
        let fl = parseFloat(blinds[blindI].style.opacity) - 0.3; // 該当ブラインドを透け透けにしてゆく
        if (fl < 0) fl = 0;
        blinds[blindI].style.opacity = fl.toString();
        bonusIdx++;
    }
    if (preScore != score) { //スコアの変動があった場合(落ち単語のどれかが消えた場合)
//        console.log(" bonusIdx = ", bonusIdx);
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
    word2Element.innerText = a2k.buf; /* 入力しかけのテンポラリーアルファベット */
});

