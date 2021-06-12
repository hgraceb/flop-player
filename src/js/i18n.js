let i18n;

if (parent.document.documentElement.lang && parent.document.documentElement.lang.startsWith('en')) {
    i18n = new function () {
        this.videoReplay = "Replay"
        this.videoPause = "Pause"
        this.videoExit = "Exit"
        this.videoClose = this.videoExit
        this.speedModify = "Modify speed"
        this.speedReset = "Click Reset"
        this.rateModify = "Modify progress"
        this.videoTime = "Time"
    };
} else {
    i18n = new function () {
        this.videoReplay = "重新播放"
        this.videoPause = "暂停播放"
        this.videoExit = "退出播放"
        this.videoClose = this.videoExit
        this.speedModify = "速度调节"
        this.speedReset = "点击复原"
        this.rateModify = "进度调节"
        this.videoTime = "时间"
    };
}

$("#videoReplay").attr("title", i18n.videoReplay)
$("#videoPause").attr("title", i18n.videoPause)
$("#videoExit").attr("title", i18n.videoExit)
$("#videoClose").attr("title", i18n.videoClose)
$("#range_speed").attr("title", i18n.speedModify)
$("#speed_value").attr("title", i18n.speedReset)
$("#range_rate").attr("title", i18n.rateModify)
$("#rate_value").attr("title", i18n.videoTime)