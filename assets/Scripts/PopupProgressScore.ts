import { _decorator, Animation, Component, instantiate, Node, ProgressBar, tween, UITransform, v3 } from 'cc';
import { NumberScrolling } from './NumberScrolling';
import { WordSearch } from './WordSearch';
import { GameManager } from './GameManager';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('PopupProgressScore')
export class PopupProgressScore extends Component {

    @property({ type: NumberScrolling, tooltip: "Điểm đạt được qua bài học" })
    private numScore: NumberScrolling = null;
    @property({ type: Node, tooltip: "Ảnh trình độ đạt được của bài học" })
    private imgLevel: Node = null;
    @property({ type: Node, tooltip: "Thanh tiến trình điểm" })
    private progressBar: Node = null;
    @property({ type: Node, tooltip: "Hộp điểm thực nhận" })
    private boxTotalScore: Node = null;
    @property({ type: Node, tooltip: "Hộp chạy hiệu ứng sao" })
    private runStar: Node = null;
    @property({ type: Node, tooltip: "Hộp mốc sao" })
    private boxStar: Node = null;

    private timeAnim = 2; // thời gian chạy anim

    // Reset trạng thái ban đầu
    protected onDisable(): void {
        this.numScore.setValue(0);
        this.imgLevel.children.forEach(e => e.active = false);
        this.progressBar.getComponent(ProgressBar).progress = 0;
        this.boxTotalScore.active = false;
        this.boxTotalScore.getComponentInChildren(NumberScrolling).setValue(0);
        this.boxStar.active = false;
        this.boxStar.children.forEach(child => {
            const pos = child.getPosition();
            pos.x = 0;
            child.setPosition(pos);
        });
        if (this.runStar) {
            const chil = this.runStar.children;
            for (let i = chil.length - 1; i >= 1; i--) {
                chil[i].destroy();
            }
        }
    }

    public runAnimScore(currentScore: number, cb: Function) {
        const { totalTime, maps } = WordSearch.Instance.getDataGameOver();
        this.numScore.setValue(currentScore);

        let totalCorrect = 0;
        let totalQuestions = 0;
        maps.forEach((mapData) => {
            totalQuestions += mapData.wordAnswers.length;
            totalCorrect += mapData.discoveredWords.filter(Boolean).length;
        });
        // Cập nhật điểm
        const percent = Number((totalCorrect / totalQuestions).toFixed(2));
        const score = percent * 100;
        const percentage = GameManager.data.config.passing_score ?? 0;
        const threshold = GameManager.data.config.mastery_threshold ?? 0;
        let num = 0;

        if (score >= threshold) {
            num = 2;
        } else if (score >= percentage) {
            num = 1
        }

        const time = this.timeAnim * percent;

        const node = this.imgLevel.children[num];
        node.active = true;

        const anim = node.getComponent(Animation);
        anim.play();
        anim.once(Animation.EventType.FINISHED, () => {
            if (score > 0) AudioController.Instance.barEnd(true);

            this.numScore.setTime(time);
            this.numScore.to(0);

            let s = this.boxTotalScore.getComponentInChildren(NumberScrolling);
            s.setTime(time);
            s.to(score);

            const pb = this.progressBar.getComponent(ProgressBar);
            tween(pb)
                .to(time, { progress: percent })
                .call(() => {
                    this.scheduleOnce(() => {
                        AudioController.Instance.barEnd(false);
                        cb();
                    }, 1)
                })
                .start();


            const x = this.progressBar.getPosition().x;
            const f = this.progressBar.getComponent(ProgressBar).totalLength * percent;
            const posTarget = x + f;
            const pos = this.boxTotalScore.getPosition();
            this.boxTotalScore.setPosition(v3(x, pos.y, pos.z));
            this.boxTotalScore.active = true;
            tween(this.boxTotalScore)
                .to(time, { position: v3(posTarget, pos.y, pos.z) })
                .start();

            this.boxStar.active = true;
            this.boxStar.children[0].setPosition(v3(pb.totalLength * percentage / 100))
            this.boxStar.children[1].setPosition(v3(pb.totalLength * threshold / 100))

            if (num > 0) {
                this.scheduleOnce(() => {
                    this.boxStar.children[0].getComponent(Animation).play();
                }, this.timeAnim * percentage / 100 + 0.01)
            }

            if (num > 1) {
                this.scheduleOnce(() => {
                    this.boxStar.children[1].getComponent(Animation).play();
                }, this.timeAnim * threshold / 100 + 0.01)
            }

            let c = Math.floor(score / 2);
            for (let i = 0; i < c; i++) {
                const star = instantiate(this.runStar.children[0]);
                star.active = true;
                this.runStar.addChild(star);
                this.scheduleOnce(() => {
                    tween(star)
                        .to(0.4, {
                            worldPosition: this.progressBar.getWorldPosition().clone().add(v3(20, 0, 0)),
                            scale: v3(2, 2, 2)
                        }, { easing: 'quadOut' })
                        .to(0.1, { scale: v3(1.3, 1.3, 1.3) })
                        .call(() => {
                            star.destroy();
                        })
                        .start();
                }, time / c * i)
            }
        });

    }
}


