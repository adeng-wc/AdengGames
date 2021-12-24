// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

/**
 * 2048 画板中的块对象
 */
@ccclass
export default class Piece extends cc.Component {

    @property(cc.Label)
    public nLabel: cc.Label = null;

    public x: number;
    public y: number;

    private _n: number = 0;

    public get n() {
        return this._n;
    }

    /**
     * 更新 数字，并变色
     */
    public set n(value: number) {
        this._n = value;
        let color: cc.Color;
        let str: string;
        switch (value) {
            case 0:
                color = cc.Color.BLACK;
                // color = new cc.Color().fromHEX("#784212");
                break;
            case 2:
                color = new cc.Color().fromHEX("#784212");
                break;
            case 4:
                color = new cc.Color().fromHEX("#784212");
                break;
            case 8:
                color = new cc.Color().fromHEX("#7E5109");
                break;
            case 16:
                color = new cc.Color().fromHEX("#7D6608");
                break;
            case 32:
                color = new cc.Color().fromHEX("#186A3B");
                break;
            case 64:
                color = new cc.Color().fromHEX("#145A32");
                break;
            case 128:
                color = new cc.Color().fromHEX("#0B5345");
                break;
            case 256:
                color = new cc.Color().fromHEX("#0E6251");
                break;
            case 512:
                color = new cc.Color().fromHEX("#1B4F72");
                break;
            case 1024:
                color = new cc.Color().fromHEX("#154360");
                break;
            case 2048:
                color = new cc.Color().fromHEX("#4A235A");
                break;
            case 4096:
                color = new cc.Color().fromHEX("#512E5F");
                break;
            case 8192:
                color = new cc.Color().fromHEX("#78281F");
                break;
            default:
                color = new cc.Color().fromHEX("#641E16");
                break;
        }
        this.nLabel.string = value.toString();
        this.nLabel.node.color = color;
    }

    public init(x: number, y: number, n: number) {
        this.x = x;
        this.y = y;
        this.n = n;

        this.nLabel.string = n.toString();

        if (n != 0) {
            this.nLabel.string = n.toString();
        } else {
            this.nLabel.string = "";
        }
    }

    /**
     * 生成 初始值
     */
    public randomNumber() {
        this.n = Math.random() < 0.9 ? 2 : 4;
    }

    // onLoad () {}

    start() {

    }
}
