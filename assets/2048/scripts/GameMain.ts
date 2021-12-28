// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Board from "./Board";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {

    private boardScript: Board = null;

    onLoad() {
        this.addListeners();
        this.boardScript = this.node.getChildByName("棋盘").getComponent(Board);
    }

    onDestroy(): void {
        this.removeListeners();
    }


    start() {

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
                if (this.boardScript.slideRight() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
            } else if (offsetX < -5) {
                console.log("onTouched:slideLeft(),{}", offsetX);
                if (this.boardScript.slideLeft() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
            }
        } else {
            if (offsetY > 5) {
                console.log("onTouched:slideUp(),{}", offsetY);
                if (this.boardScript.slideUp() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
            } else if (offsetY < -5) {
                console.log("onTouched:slideDown(),{}", offsetY);
                if (this.boardScript.slideDown() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
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
                if (this.boardScript.slideUp() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
                break;
            case 40: //cc.KEY.down:
            case 83: //cc.KEY.s:
                if (this.boardScript.slideDown() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
                break;
            case 37://cc.KEY.left:
            case 65: //cc.KEY.a:
                if (this.boardScript.slideLeft() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
                break;
            case 39://cc.KEY.right:
            case 68: //cc.KEY.d:
                if (this.boardScript.slideRight() && this.boardScript.judgeOver()) {
                    this.boardScript.overGame();
                }
                break;
        }
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
