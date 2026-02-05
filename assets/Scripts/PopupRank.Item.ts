import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupRank_Item')
export class PopupRank_Item extends Component {

    @property({ type: SpriteFrame, tooltip: "0: default, 1: player" })
    protected itemBgFrames: SpriteFrame[] = [];

    @property(Color)
    protected playerColor: Color = Color.BLACK;

    @property(Color)
    protected defaultColor: Color = Color.WHITE;

    private lbRank: Label;
    private lbName: Label;
    private lbScore: Label;
    private bar: Sprite;

    onLoad() {
        this.lbRank = this.node.getChildByPath("txtRank")?.getComponent(Label);
        this.lbName = this.node.getChildByPath("txtName")?.getComponent(Label);
        this.lbScore = this.node.getChildByPath("txtScore")?.getComponent(Label);
        this.bar = this.node.getChildByPath("bar")?.getComponent(Sprite);
    }

    setPlayer(isPlayer: boolean) {
        const color = isPlayer ? this.playerColor : this.defaultColor;
        const bg = this.itemBgFrames[isPlayer ? 1 : 0];

        this.lbRank && (this.lbRank.color = color);
        this.lbName && (this.lbName.color = color);
        this.lbScore && (this.lbScore.color = color);
        this.bar && (this.bar.spriteFrame = bg);
    }
}


