// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Piece from "./Piece";
import isNumber = cc.js.isNumber;

const { ccclass, property } = cc._decorator;

/**
 *  2048 的棋盘 脚本
 */
@ccclass
export default class Board extends cc.Component {

    @property(cc.Integer)
    colsSum: number = 4; // 棋盘列数
    @property(cc.Integer)
    rowsSum: number = 4; // 棋盘行数

    // 需要在当前节点上添加 Graphics 组件，并在脚本中赋值
    @property(cc.Graphics)
    private graphics: cc.Graphics = null; // 用来画棋盘
    @property(cc.Prefab)
    private piecePrefab: cc.Prefab = null; // 画不了文字，只能用prefab了

    @property(cc.Node)
    private gameOverNode: cc.Node = null;
    @property(cc.Node)
    private buttons: cc.Node = null;
    @property(cc.Node)
    private score: cc.Node = null;


    private scoreNum: number = 0;  // 等分
    private tileWidth: number = 0; // 一个方块的宽度
    private startX: number = 0; // 棋盘左下角
    private startY: number = 0;
    private boardWidth: number = 0; // 棋盘节点宽高
    private boardHeight: number = 0;

    public pieceMap: Array<Array<Piece>>;  // 棋盘坐标中对应的 块

    /**
     * 初始化 基础 坐标数据
     */
    private initPostion() {
        // 设置 重新开始按钮位置
        var restartNode = this.gameOverNode.getChildByName("restart");
        restartNode.x = cc.view.getVisibleSize().width / 2;
        restartNode.y = cc.view.getVisibleSize().height / 2;
        restartNode.opacity = 255;

        // 1. 根据屏幕尺寸计算格子宽度，取较小的尺寸
        var width = cc.view.getVisibleSize().width / (this.colsSum + 1);
        var width2 = cc.view.getVisibleSize().height / (this.rowsSum + 1);
        this.tileWidth = width < width2 ? width : width2;
        // 棋盘的宽高
        this.boardWidth = this.tileWidth * this.colsSum;
        this.boardHeight = this.tileWidth * this.rowsSum;

        // 设置 棋盘的 坐标和大小
        this.node.x = (cc.view.getVisibleSize().width - this.boardWidth) / 2;;
        this.node.y = (cc.view.getVisibleSize().height - this.boardHeight) / 2;
        this.node.width = this.boardWidth;
        this.node.height = this.boardHeight;

        // 设置 按钮组的坐标
        this.buttons.x = this.node.x + this.boardWidth / 2;
        this.buttons.y = this.node.y - 60;

        // 设置分数节点
        this.score.x = this.node.x + this.boardWidth / 2;
        this.score.y = this.node.y + this.boardHeight + this.tileWidth;
        this.score.getComponent(cc.Label).string = "当前记录：" + this.scoreNum.toString();
    }

    onLoad() {
        // 1. 设置基础坐标数据
        this.initPostion();

        // 3. 画棋盘
        this.graphics.clear();

        // this.graphics.fillRect(startX);

        this.graphics.strokeColor = cc.Color.BLUE;
        // 遍历每列
        for (let x = 0; x < this.colsSum + 1; x++) {
            // 移动路径起点到坐标(x, y)。
            this.graphics.moveTo(this.startX + x * this.tileWidth, this.startY);
            // 绘制直线路径。
            this.graphics.lineTo(this.startX + x * this.tileWidth, this.startY + this.boardHeight);
            // 根据当前的画线样式，绘制当前或已经存在的路径。
            this.graphics.stroke();
        }
        // 遍历每行
        for (let y = 0; y < this.rowsSum + 1; y++) {
            this.graphics.moveTo(this.startX, this.startY + y * this.tileWidth);
            this.graphics.lineTo(this.startX + this.boardWidth, this.startY + y * this.tileWidth);
            this.graphics.stroke();
        }

        // 4. 初始化 二维数组 
        this.pieceMap = [];
        for (let x = 0; x < this.colsSum; x++) {
            this.pieceMap[x] = [];
            for (let y = 0; y < this.rowsSum; y++) {
                let pieceNode: cc.Node = cc.instantiate(this.piecePrefab);
                pieceNode.width = this.tileWidth;
                pieceNode.height = this.tileWidth;
                pieceNode.parent = this.node;
                pieceNode.x = this.startX + x * this.tileWidth + this.tileWidth / 2;
                pieceNode.y = this.startY + y * this.tileWidth + this.tileWidth / 2;

                let scriptClass = pieceNode.getComponent(Piece);
                this.pieceMap[x][y] = scriptClass;
                scriptClass.init(x, x, 0);
            }
        }

        // 5. 绑定事件
        this.addListeners();
    }

    onDestroy(): void {
        this.removeListeners();
    }

    /**
     * 游戏重置
     */
    public reset() {
        this.gameOverNode.active = false;

        for (let x = 0; x < this.colsSum; x++) {
            for (let y = 0; y < this.rowsSum; y++) {
                this.pieceMap[x][y].n = 0;
            }
        }
        for (let i = 0; i < 2; i++) {
            this.newPiece();
        }

        this.scoreNum = 0;
        this.score.getComponent(cc.Label).string = "当前记录：" + this.scoreNum.toString();
    }

    /**
     * 1. 将二维数组，转成一维数组
     * 2. 获取一维数组中的随机数，然后针对某个格子生成随机数
     */
    newPiece() {
        let zeroPieces = [];
        for (let x = 0; x < this.colsSum; x++) {
            for (let y = 0; y < this.rowsSum; y++) {
                // 等于 0 才放入一维数组中
                if (this.pieceMap[x][y].n === 0) {
                    zeroPieces.push(this.pieceMap[x][y]);
                }
            }
        }
        let n = Math.floor(Math.random() * zeroPieces.length);
        zeroPieces[n].randomNumber();
        console.log("newPiece start: {}, {}", zeroPieces[n].x, zeroPieces[n].y);
    }

    /**
     * 启动的时候调佣
     */
    start() {
        this.reset();
    }


    /**
     * 触摸事件
     * 
     * @param event 
     */
    onTouched(event: cc.Event.EventTouch) {
        console.log("EventTouch:", event);

        let startPos = event.getStartLocation();
        let endPos = event.getLocation();
        let offsetX = endPos.x - startPos.x;
        let offsetY = endPos.y - startPos.y;
        if (Math.abs(offsetX) > Math.abs(offsetY)) {
            if (offsetX > 5) {
                console.log("onTouched:slideRight(),{}", offsetX);
                if (this.slideRight() && this.judgeOver()) {
                    this.overGame();
                }
            } else if (offsetX < -5) {
                console.log("onTouched:slideLeft(),{}", offsetX);
                if (this.slideLeft() && this.judgeOver()) {
                    this.overGame();
                }
            }
        } else {
            if (offsetY > 5) {
                console.log("onTouched:slideUp(),{}", offsetY);
                if (this.slideUp() && this.judgeOver()) {
                    this.overGame();
                }
            } else if (offsetY < -5) {
                console.log("onTouched:slideDown(),{}", offsetY);
                if (this.slideDown() && this.judgeOver()) {
                    this.overGame();
                }
            }
        }
    }

    /**
     * 按钮事件 
     * 
     * @param event 
     */
    onKey(event: cc.Event.EventKeyboard) {
        console.log("EventKeyboard:", event.keyCode);

        // 新版本 cc.Key 没有了，也没有备注新的枚举类
        switch (event.keyCode) {
            case 38:  // UP
            case 87:   // cc.KEY.w:
                if (this.slideUp() && this.judgeOver()) {
                    this.overGame();
                }
                break;
            case 40: //cc.KEY.down:
            case 83: //cc.KEY.s:
                if (this.slideDown() && this.judgeOver()) {
                    this.overGame();
                }
                break;
            case 37://cc.KEY.left:
            case 65: //cc.KEY.a:
                if (this.slideLeft() && this.judgeOver()) {
                    this.overGame();
                }
                break;
            case 39://cc.KEY.right:
            case 68: //cc.KEY.d:
                if (this.slideRight() && this.judgeOver()) {
                    this.overGame();
                }
                break;
        }
    }

    /**
     * 游戏结束
     */
    overGame() {
        this.gameOverNode.active = true;

        console.log("游戏结束");
    }

    /**
     * 右移、合并
     */
    slideRight(): boolean {
        console.log("slideRight start");

        let isMove = false;

        // 1. 同一行的数据进行，合并
        for (let y = 0; y < this.rowsSum; y++) {
            // 遍历 行
            for (let x = this.colsSum - 1; x >= 0; x--) {
                // 从后面开始 再遍历 行 中的 列
                if (this.pieceMap[x][y].n == 0) {
                    continue;
                }

                // 因为是右移，只需要判断 该节点左边是否有相同，相同就合并
                for (let x0 = x - 1; x0 >= 0; x0--) {
                    if (this.pieceMap[x0][y].n === 0) {
                        continue;
                    } else if (this.pieceMap[x][y].n === this.pieceMap[x0][y].n) {
                        let newScore = this.pieceMap[x][y].n * 2;
                        this.pieceMap[x][y].n = newScore;
                        this.pieceMap[x0][y].n = 0;
                        isMove = true;
                        this.updateScore(newScore);
                        break;
                    } else {
                        break;
                    }
                }
            }
        }

        // 2. 右边移动
        for (let y = 0; y < this.rowsSum; y++) {
            for (let x = this.colsSum - 1; x >= 0; x--) {
                // 从右边开始，不为 0 ，不需要移动
                if (this.pieceMap[x][y].n !== 0) {
                    continue;
                }

                // [x][y].n = 0， 它左边的格子需要移动
                for (let x0 = x - 1; x0 >= 0; x0--) {
                    if (this.pieceMap[x0][y].n === 0) {
                        continue;
                    } else {
                        // [x0][y].n 是找到的、左边不为0的数字
                        this.pieceMap[x][y].n = this.pieceMap[x0][y].n;
                        this.pieceMap[x0][y].n = 0;
                        isMove = true;
                        break;
                    }
                }
            }
        }

        //有tile移动才添加新的tile
        if (isMove) {
            this.newPiece();
        }

        return isMove;
    }
    /**
     * 左移、合并
     */
    slideLeft(): boolean {
        console.log("slideLeft start");
        //左滑F
        //合并
        let isMove = false;
        for (let y = 0; y < this.rowsSum; y++) {
            for (let x = 0; x < this.colsSum; x++) {
                if (this.pieceMap[x][y].n === 0) {
                    continue;
                }
                for (let x0 = x + 1; x0 < this.colsSum; x0++) {
                    if (this.pieceMap[x0][y].n === 0) {
                        continue;
                    } else if (this.pieceMap[x][y].n === this.pieceMap[x0][y].n) {
                        let newScore = this.pieceMap[x][y].n * 2;
                        this.pieceMap[x][y].n = newScore;
                        this.pieceMap[x0][y].n = 0;
                        isMove = true;
                        this.updateScore(newScore);
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
        //移动
        for (let y = 0; y < this.rowsSum; y++) {
            for (let x = 0; x < this.colsSum; x++) {
                if (this.pieceMap[x][y].n !== 0) {
                    continue;
                }
                for (let x0 = x + 1; x0 < this.rowsSum; x0++) {
                    if (this.pieceMap[x0][y].n === 0) {
                        continue;
                    } else {
                        this.pieceMap[x][y].n = this.pieceMap[x0][y].n;
                        this.pieceMap[x0][y].n = 0;
                        isMove = true;
                        break;
                    }
                }
            }
        }
        if (isMove) {
            this.newPiece();
        }
        return isMove;
    }
    /**
     * 下移、合并
     */
    slideDown(): boolean {
        console.log("slideDown start");
        //下滑
        //合并
        let isMove = false;
        for (let x = 0; x < this.colsSum; x++) {
            for (let y = 0; y < this.rowsSum; y++) {
                if (this.pieceMap[x][y].n === 0) {
                    continue;
                }
                for (let y0 = y + 1; y0 < this.rowsSum; y0++) {
                    if (this.pieceMap[x][y0].n === 0) {
                        continue;
                    } else if (this.pieceMap[x][y].n === this.pieceMap[x][y0].n) {
                        let newScore = this.pieceMap[x][y].n * 2;
                        this.pieceMap[x][y].n = newScore;
                        this.pieceMap[x][y0].n = 0;
                        isMove = true;
                        this.updateScore(newScore);
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
        //移动
        for (let x = 0; x < this.colsSum; x++) {
            for (let y = 0; y < this.rowsSum; y++) {
                if (this.pieceMap[x][y].n !== 0) {
                    continue;
                }
                for (let y0 = y + 1; y0 < this.rowsSum; y0++) {
                    if (this.pieceMap[x][y0].n === 0) {
                        continue;
                    } else {
                        this.pieceMap[x][y].n = this.pieceMap[x][y0].n;
                        this.pieceMap[x][y0].n = 0;
                        isMove = true;
                        break;
                    }
                }
            }
        }
        if (isMove) {
            this.newPiece();
        }
        return isMove;
    }
    /**
     * 上移、合并
     */
    slideUp(): boolean {
        console.log("slideUp start");
        //上滑
        //合并
        let isMove = false;
        for (let x = 0; x < this.colsSum; x++) {
            for (let y = this.rowsSum - 1; y >= 0; y--) {
                if (this.pieceMap[x][y].n === 0) {
                    continue;
                }
                for (let y0 = y - 1; y0 >= 0; y0--) {
                    if (this.pieceMap[x][y0].n === 0) {
                        continue;
                    } else if (this.pieceMap[x][y].n === this.pieceMap[x][y0].n) {
                        let newScore = this.pieceMap[x][y].n * 2;
                        this.pieceMap[x][y].n = newScore;
                        this.pieceMap[x][y0].n = 0;
                        isMove = true;
                        this.updateScore(newScore);
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
        //移动
        for (let x = 0; x < this.colsSum; x++) {
            for (let y = this.rowsSum - 1; y >= 0; y--) {
                if (this.pieceMap[x][y].n != 0) {
                    continue;
                }
                for (let y0 = y - 1; y0 >= 0; y0--) {
                    if (this.pieceMap[x][y0].n == 0) {
                        continue;
                    } else {
                        this.pieceMap[x][y].n = this.pieceMap[x][y0].n;
                        this.pieceMap[x][y0].n = 0;
                        isMove = true;
                        break;
                    }
                }
            }
        }
        if (isMove) {
            this.newPiece();
        }
        return isMove;
    }

    // 更新分数
    updateScore(newScore: number) {
        if (newScore > this.scoreNum) {
            this.scoreNum = newScore;
            this.score.getComponent(cc.Label).string = "当前记录：" + this.scoreNum.toString();
        }
    }

    /**
     * 判断游戏是否结束
     * 
     * @returns 
     */
    judgeOver(): boolean {
        for (let y = 0; y < this.rowsSum; y++) {
            for (let x = 0; x < this.colsSum; x++) {
                // 有一个不为 0 
                if (this.pieceMap[x][y].n === 0) {
                    return false;
                }
                // 如果，列上有2个相同的数组，也表示没有结束
                if (x <= this.colsSum - 2 && this.pieceMap[x][y].n === this.pieceMap[x + 1][y].n) {
                    return false;
                }
                if (y <= this.rowsSum - 2 && this.pieceMap[x][y].n === this.pieceMap[x][y + 1].n) {
                    return false;
                }
            }
        }
        return true;
    }

    private addListeners() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouched, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKey, this);
    }

    private removeListeners() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouched, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKey, this);
    }

    // update (dt) {}
}
