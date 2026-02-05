import { _decorator, Component, instantiate, Label, Node, Sprite, SpriteFrame } from 'cc';
import { APIManager } from './APIManager';
import { UIControler } from './UIControler';
import { PopupRank_Item } from './PopupRank.Item';
const { ccclass, property } = _decorator;

@ccclass('PopupRank')
export class PopupRank extends Component {

    @property({ type: Node, tooltip: "Bộ top 3 người cao nhất" })
    protected layoutTOP3: Node = null;

    @property({ type: Node, tooltip: "Bộ các thứ tự còn lại" })
    protected layoutBXH: Node = null;

    @property({ type: Node, tooltip: "Bảng xếp hạng của người chơi" })
    protected playerRank: Node = null;

    @property({ type: Node, tooltip: "Các dòng trỏng bảng" })
    protected itemBXH: Node = null;

    // Khởi tạo bảng
    initRankingList() {

        const url = `/webhook-play/leaderboard/alltime/${APIManager.GID}?page=1&limit=100`;
        const data = {
            // "username": APIManager.userDATA?.username,
            // "username": "beonh123",
        };
        APIManager.requestData(`POST`, url, data, res => {
            if (!res) {
                UIControler.instance.onMess(`${url} => ${res}`);
                return;
            }

            const listBXH = res?.data?.board ?? []; // mảng dữ liệu xếp hạng
            for (let i = 0; i < 3; i++) {
                const e = this.layoutTOP3.children[i];
                if (listBXH[i]) {
                    e.active = true;
                    e.getChildByPath("txtName").getComponent(Label).string = this.limitName(listBXH[i].username);
                    // e.getChildByPath("txtTime").getComponent(Label).string = listBXH[i].numTime + "s";
                    e.getChildByPath("txtScore").getComponent(Label).string = listBXH[i].total_score;
                    e.getComponent(PopupRank_Item).setPlayer(false);
                }
            }

            // Số lượng item cho phần còn lại (BXH ngoài top3)
            const remCount = listBXH.length - 3;
            const pool = this.layoutBXH.children;

            // Duyệt qua số lượng item cần hiển thị
            for (let j = 0; j < remCount; j++) {
                let item: Node;
                if (j < pool.length) {
                    item = pool[j];
                    item.active = true;
                } else {
                    item = instantiate(this.itemBXH);
                    item.parent = this.layoutBXH;
                    item.active = true;
                }

                // Cập nhật thông tin cho item
                const rankIndex = j + 3;
                item.getChildByPath("txtRank").getComponent(Label).string = listBXH[rankIndex].top;
                item.getChildByPath("txtName").getComponent(Label).string = this.limitName(listBXH[rankIndex].username);
                // item.getChildByPath("txtTime").getComponent(Label).string = listBXH[rankIndex].numTime + "s";
                item.getChildByPath("txtScore").getComponent(Label).string = listBXH[rankIndex].total_score;
                item.getComponent(PopupRank_Item).setPlayer(false);
            }

            // Ẩn đi những item dư thừa
            if (remCount > 0) {
                for (let k = remCount; k < pool.length; k++) {
                    pool[k].active = false;
                }
            }

            // // Cập nhật thông tin xếp hạng của người chơi
            // this.playerRank.getChildByPath("playerRank").getComponent(Label).string = res.yourInfo.rank;
            // this.playerRank.getChildByPath("playerName").getComponent(Label).string = this.limitName(res.yourInfo.name);
            // // this.playerRank.getChildByPath("playerTime").getComponent(Label).string = res.yourInfo.numTime + "s";
            // this.playerRank.getChildByPath("playerScore").getComponent(Label).string = res.yourInfo.numScore;
            const yourInfo = res?.data?.yourInfo;
            if (!yourInfo) return;

            const top = yourInfo.top;
            let node = null;
            if (top >= 1 && top <= 3) {
                node = this.layoutTOP3.children[top - 1];
            }
            else if (top <= listBXH.length)  {
                const index = top - 4;
                node = this.layoutBXH.children[index];
            }
            if(node){
                node.getComponent(PopupRank_Item).setPlayer(true);
            }
        });
    }

    // Giới hạn text không quá dài
    private limitName(name: string): string {
        const maxLength = 15;
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + ' . . .';
        }
        return name;
    }
}


