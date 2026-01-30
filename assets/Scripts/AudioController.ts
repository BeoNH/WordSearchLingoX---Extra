import { _decorator, Animation, AudioClip, AudioSource, Component, game, instantiate, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

resources.load<AudioClip>("Sounds/silent", (err, data) => {
    if (data) {
        console.warn(`[AudioManager] ⚠️ silent loaded`);
        const cb = (event) => {
            //Audio chạy ngầm
            console.log("👆 Đã chạm vào màn hình!", event);
            game.canvas.removeEventListener('touchend', cb);
            game.canvas.removeEventListener('mouseup', cb);

            const audio = new Audio(data.nativeUrl);
            audio.loop = true;
            audio.volume = 1;
            audio.play().then(() => {
                console.warn(`[AudioManager] ⚠️ play silent`);
            }).catch(err => {
                console.warn(`[AudioManager] ⚠️ play silent failed: ${err}`);
            });

            // Bắt test read của GG
            const text = "";
            const voices = window.speechSynthesis.getVoices();
            const speech = new SpeechSynthesisUtterance(text);
            speech.voice = voices.find(voice => voice.lang.includes("en-US")) || voices.find(voice => voice.lang.includes("en")) || voices[0];
            speech.lang = "en-US";
            // speech.volume = 1;
            speech.rate = 0.8; // Tốc độ đọc (1 là bình thường)
            // speech.pitch = 1; // Cao độ giọng đọc (1 là mặc 

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(speech);
        };
        game.canvas.addEventListener('touchend', cb, { once: true, passive: true });
        game.canvas.addEventListener('mouseup', cb, { once: true, passive: true });
    }
});


@ccclass('AudioController')
export class AudioController extends Component {
    public static Instance: AudioController;

    @property({ type: Node, tooltip: "iconInMenu" })
    private iconMenu: Node = null;
    @property({ type: Node, tooltip: "iconInGame" })
    private iconGame: Node = null;

    volume = 1;

    protected onLoad(): void {
        AudioController.Instance = this;
        this.Click();
    }

    Click() {
        this.volume == 1 ? this.volume = 0 : this.volume = 1;
        // this.node.children.forEach(e => e.getComponent(AudioSource).volume = this.volume)
        this.node.children[0].getComponent(AudioSource).volume = this.volume * 0.5; // Nhạc nền
    }

    protected update(dt: number): void {
        this.iconMenu.children[0].active = this.volume == 0;
        this.iconGame.children[0].active = this.volume == 0;
    }

    A_Click() {
        this.node.getChildByName("click").getComponent(AudioSource).play();
    }

    Clear() {
        this.node.getChildByName("clear").getComponent(AudioSource).play();
    }

    Wrong() {
        const parent = this.node.getChildByName("wrong");
        if (!parent || parent.children.length === 0) return;

        const idx = Math.floor(Math.random() * parent.children.length);
        const child = parent.children[idx];
        const audio = child.getComponent(AudioSource);
        if (audio) audio.play();
    }

    Correct() {
        this.node.getChildByName("correct").getComponent(AudioSource).play();
        // const parent = this.node.getChildByName("conect");
        // if (!parent || parent.children.length === 0) return;

        // const idx = Math.floor(Math.random() * parent.children.length);
        // const child = parent.children[idx];
        // const audio = child.getComponent(AudioSource);
        // if (audio) audio.play();
    }

    timeOver_False() {
        this.node.getChildByName("timeOver").getComponent(AudioSource).play();
    }

    timeEnd() {
        this.node.getChildByName("timing_end").getComponent(AudioSource).play();
    }

    gameWin() {
        this.node.getChildByName("game-win").getComponent(AudioSource).play();
    }

    gameOver() {
        this.node.getChildByName("game_over").getComponent(AudioSource).play();
    }

    barEnd(is: boolean) {
        if (is) {
            this.node.getChildByName("bar_end_game").getComponent(AudioSource).play();
        } else {
            this.node.getChildByName("bar_end_game").getComponent(AudioSource).stop();
        }
    }

    spawn() {
        const audio = this.node.getChildByName("spawn")?.getComponent(AudioSource);
        if (!audio || (audio as any).playing) return;
        audio.play();
    }

    openAnser() {
        this.node.getChildByName("open_anser").getComponent(AudioSource).play();
    }

    hintClick() {
        this.node.getChildByName("hint_sound").getComponent(AudioSource).play();
    }

}


