//フィールドサイズ
const FIELD_COL = 10;
const FIELD_ROW = 20;

//ブロック一つのサイズ(ピクセル)
const BLOCK_SIZE = 30;

//キャンバスサイズ
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;

//ゲームフィールドの位置
const OFFSET_X = 40;
const OFFSET_Y = 20;

//テトロミノのサイズ
const TETRO_SIZE = 4;

//落ちるスピード
const GAMESPEED = 1000;

//スタート位置
const START_X = FIELD_COL / 2 - TETRO_SIZE / 2
const START_Y = 0;

let can = document.getElementById("can");
let con = can.getContext("2d");
const container = document.getElementById('container');

can.width = 640;
can.height = 640;
can.style.border = '4px solid #555'

const TETRO_TYPES =
    [
        [],             //0.空
        [               //1.I
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [               //2.L
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [               //3.J
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [               //4.T
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [               //5.O
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ], [            //6.Z
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [               //7.S
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
    ];

//画像と効果音
let BGimg;
BGimg = new Image();
BGimg.src = "./images/BG2.png";

let Blimg;
Blimg = new Image();
Blimg.src = "./images/block.png";

//テトロミノ本体
let tetro;

//テトロミノの座標
let tetro_x = START_X;
let tetro_y = START_Y;

//テトロミノの形
let tetro_t;

//次のテトロミノ
let tetro_n;

//フィールドの本体
let field = [];

//ゲームーオーバーフラグ
let over = false;

//消したラインの数
let lines = 0;

//スコア
let score = 0;

let gameInterval;


tetro_t = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
tetro = TETRO_TYPES[tetro_t];

//テトロをネクストで初期化
function setTetro() {
    //ネクストを現在のテトロにする
    tetro_t = tetro_n;
    tetro = TETRO_TYPES[tetro_t];
    tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

    //位置を初期値にする
    tetro_x = START_X;
    tetro_y = START_Y;
}


function startGame() {
    //イニシャライズでスタート
    init();
    // タイトル画面を非表示にし、ゲーム画面を表示
    document.getElementById('title-screen').style.display = 'none';
    can.style.display = "block"
    container.style.display = "block"

    //初期化(initialize)
    function init() {
        //フィールドのクリア
        for (let y = 0; y < FIELD_ROW; y++) {
            field[y] = [];
            for (let x = 0; x < FIELD_COL; x++) {
                field[y][x] = 0;
            }
        }
        //最初のテトロのためのネクスト処理
        tetro_n = Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;

        //テトロをセットし描画して開始
        setTetro();
        drawAll();
        clearInterval(gameInterval);
        gameInterval = setInterval(dropTetoro, GAMESPEED);

    }

    //ブロック一つ描画
    function drawBlock(x, y, c) {
        let px = OFFSET_X + x * BLOCK_SIZE;
        let py = OFFSET_Y + y * BLOCK_SIZE;

        con.drawImage(Blimg,
            c * BLOCK_SIZE, 0, BLOCK_SIZE, BLOCK_SIZE,
            px, py, BLOCK_SIZE, BLOCK_SIZE);

    }

    //描画処理（枠、テトロ）
    function drawAll() {
        //背景描画
        con.drawImage(BGimg, 0, 0);

        //フィールド枠描画
        con.strokeStyle = "rgba(130,40,255,2)"//フィールド枠
        con.strokeRect(OFFSET_X - 2, OFFSET_Y - 2, SCREEN_W + 4, SCREEN_H + 4);
        con.fillStyle = "rgba(0,0,0,0.4)"//フィールド内
        con.fillRect(OFFSET_X, OFFSET_Y, SCREEN_W, SCREEN_H);

        //フィールド描写
        for (let y = 0; y < FIELD_ROW; y++) {
            for (let x = 0; x < FIELD_COL; x++) {
                if (field[y][x]) {
                    drawBlock(x, y, field[y][x]);
                }
            }
        }
        //着地点計算
        let plus = 0;
        while (checkMove(0, plus + 1)) plus++;

        //テトロミノ描画
        for (let y = 0; y < TETRO_SIZE; y++) {
            for (let x = 0; x < TETRO_SIZE; x++) {
                if (tetro[y][x]) {
                    //着地点
                    drawBlock(tetro_x + x, tetro_y + y + plus, 0);
                    //本体
                    drawBlock(tetro_x + x, tetro_y + y, tetro_t);
                }
                //ネクストテトロ
                if (TETRO_TYPES[tetro_n][y][x]) {
                    drawBlock(13 + x, 4 + y, tetro_n);
                }
            }
        }
        drawInfo();
    }

    //インフォメーション表示
    function drawInfo() {
        con.fillStyle = "white";

        s = "NEXT"
        con.font = "50px'Impact'";
        con.fillText(s, 412, 120);

        s = "SCORE";
        con.font = "50px'Impact'";
        con.fillText(s, 410, 350);
        s = "" + score;
        w = con.measureText(s).width;
        con.fillText(s, 560 - w, 425);

        s = "LINES";
        con.font = "50px'Impact'";
        w = con.measureText(s).width;
        con.fillText(s, 414, 525);
        s = "" + lines;
        w = con.measureText(s).width;
        con.fillText(s, 560 - w, 600);

        //ゲームオーバー
        if (over) {
            s = 'GAME OVER';
            con.font = `70px'Impact'`;
            w = con.measureText(s).width;
            let x = SCREEN_W / 2 - w / 2;
            let y = SCREEN_H / 2 - 20;
            con.lineWidth = 4;
            con.strokeText(s, OFFSET_X + x, y);
            con.fillStyle = 'White';
            con.fillText(s, OFFSET_X + x, y);
            Result();

        }
    }


    //ブロックの当たり判定
    function checkMove(mx, my, ntetro) {
        if (ntetro == undefined) ntetro = tetro;
        for (let y = 0; y < TETRO_SIZE; y++) {
            for (let x = 0; x < TETRO_SIZE; x++) {
                if (ntetro[y][x]) {
                    let nx = tetro_x + mx + x;
                    let ny = tetro_y + my + y;
                    if (
                        nx < 0 ||
                        ny >= FIELD_ROW ||
                        nx >= FIELD_COL ||
                        field[ny][nx]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    //テトロミノ回転
    function rotate() {
        let ntetro = [];
        for (let y = 0; y < TETRO_SIZE; y++) {
            ntetro[y] = [];
            for (let x = 0; x < TETRO_SIZE; x++) {
                ntetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
            }
        }
        return ntetro;
    }

    //テトロを固定する
    function fixTetro() {
        for (let y = 0; y < TETRO_SIZE; y++) {
            for (let x = 0; x < TETRO_SIZE; x++) {
                if (tetro[y][x]) {
                    field[tetro_y + y][tetro_x + x] = tetro_t;
                }
            }
        }
    }

    //ブロックの落ちる処理
    function dropTetoro() {
        if (over) return;
        if (checkMove(0, 1)) tetro_y++;
        else {
            fixTetro();
            checkLine();
            setTetro();
            if (!checkMove(0, 0)) {
                over = true;
            }
        }
        drawAll();
    }

    //ライン揃ったら消す
    function checkLine() {
        let linec = 0;
        for (let y = 0; y < FIELD_ROW; y++) {
            let flag = true;
            for (let x = 0; x < FIELD_COL; x++) {
                if (!field[y][x]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                linec++;
                // ラインを削除する処理
                for (let ny = y; ny > 0; ny--) {
                    for (let nx = 0; nx < FIELD_COL; nx++) {
                        field[ny][nx] = field[ny - 1][nx];
                    }
                }
                for (let nx = 0; nx < FIELD_COL; nx++) {
                    field[0][nx] = 0;
                }
            }
        }
        if (linec) {
            lines += linec;
            score += 100 * (2 ** (linec - 1));
        }
    }
    //キーボード処理
    document.onkeydown = function (e) {
        //onkeydown keycode 検索
        if (over) return;

        switch (e.key) {
            case 'ArrowLeft': // 左
                if (checkMove(-1, 0)) tetro_x--;
                break;
                // case 'ArrowUp': // 上
                //     if (checkMove(0, -1)) tetro_y--;
                break;
            case 'ArrowRight': // 右
                if (checkMove(1, 0)) tetro_x++;
                break;
            case 'ArrowDown': // 下
                while (checkMove(0, 1)) tetro_y++;
                break;
            case ' ': // スペース
                let ntetro = rotate();
                if (checkMove(0, 0, ntetro)) tetro = ntetro;
                break;
        }
        drawAll();
    }

    const restartButton = document.getElementById("restartButton");
    const titleButton = document.getElementById("titleButton");

    function Result() {
        const restartButton = document.getElementById("restartButton");
        const titleButton = document.getElementById("titleButton");
        restartButton.style.display = 'block';
        titleButton.style.display = 'block';

        restartButton.addEventListener('click', restartGame);
        titleButton.addEventListener('click', title);
    }

    function restartGame() {
        restartButton.style.display = 'none';
        titleButton.style.display = 'none';
        over = false;
        lines = 0;
        score = 0;
        for (let y = 0; y < FIELD_ROW; y++) {
            field[y] = [];
            for (let x = 0; x < FIELD_COL; x++) {
                field[y][x] = 0;
            }
        }
        setTetro();
        drawAll();
        clearInterval(gameInterval);
        gameInterval = setInterval(dropTetoro, GAMESPEED);
    }

    function title() {
        restartButton.style.display = 'none';
        titleButton.style.display = 'none';
        over = false;
        lines = 0;
        score = 0;
        document.getElementById('title-screen').style.display = 'block';
        can.style.display = 'none';
        container.style.display = 'none';
    }
}