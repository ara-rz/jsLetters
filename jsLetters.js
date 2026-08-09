const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const wordElement = document.getElementById('word');
let score = 0;
let activeWords = []; // 現在画面にある単語群を管理
const words = ["abc","def","ghi","jkl"];//'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let inputWord = ""
// 1. ドロップする「単語」を一つ生成する関数
function dropWord() {
    const letter = document.createElement('div');
    const word = words[Math.floor(Math.random() * words.length)];
    letter.innerText = word;
    letter.className = 'letter';
    // ランダムな位置から落とす
    letter.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    // ランダムな速度（3s〜8s）
    const duration = Math.random() * 5 + 3;
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

// 3. キーボード入力を受け取る
document.addEventListener('keydown', (e) => {
    inputWord += e.key;
    // 入力された単語が、現在落下中の単語群のどれかと一致するか確認
    // (ここでは簡単のため、最初に見つかった単語のみ消す)
    const index = activeWords.findIndex(l => l.word === inputWord);
    if (index !== -1) {
        const target = activeWords[index];
        target.element.remove(); // 画面から削除
        activeWords.splice(index, 1); // 配列から削除
        score += 10;
	inputWord = ""
        scoreElement.innerText = 'Score: ' + score;
    }
    wordElement.innerText = inputWord;    
});

