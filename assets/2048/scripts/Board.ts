// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import isNumber = cc.js.isNumber;

const {ccclass, property} = cc._decorator;

/**
 *  2048 的棋盘 脚本
 */
@ccclass
export default class Board extends cc.Component {

    /**
     * 棋盘每列的格子数
     */
    @property(cc.Integer)
    size: number = 5;

    @property(cc.Graphics)
    private graphics: cc.Graphics = null; // 用来画棋盘

    private tileWidth: number = 0; // 一个方块的宽度
    private startX: number = 0; // 棋盘左下角
    private startY: number = 0;
    private boardWidth: number = 0; // 棋盘节点宽高
    private boardHeight: number = 0;

    onLoad() {
        this.graphics = new cc.Graphics(); // 初始化 棋盘

    }

    start() {

    }

    // update (dt) {}
}
