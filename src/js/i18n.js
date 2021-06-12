let i18n;

if (parent.document.documentElement.lang && parent.document.documentElement.lang.startsWith('en')) {
    i18n = new function () {
        // title
        this.videoReplay = 'Replay'
        this.videoPause = 'Pause'
        this.videoExit = 'Exit'
        this.videoClose = this.videoExit
        this.speedModify = 'Modify speed'
        this.speedReset = 'Click Reset'
        this.rateModify = 'Modify progress'
        this.videoTime = 'Time'
        // 错误提示
        this.errIE = 'IE kernel is not supported at the moment, please change your browser or kernel!'
        this.errFormatPre = 'Temporarily does not support \''
        this.errFormatPost = '\' format video, please select again!'
        this.errRequest = 'Error getting video resources, error code: '
        this.errParserBase = 'Video parsing error: '
        this.errParserUnknown = this.errParserBase + 'Unknown error'
        this.errParserTooLarge = this.errParserBase + 'Too large video'
        this.errParserUnexpectedEnd = this.errParserBase + 'Unexpected end of file'
        this.errParserInvalidFile = this.errParserBase + 'Invalid file'
        this.errParserInvalidEvent = this.errParserBase + 'Invalid event'
        this.errParserInvalidVideoType = this.errParserBase + 'Invalid video type'
        this.errParserInvalidBoardSize = this.errParserBase + 'Invalid board size'
        this.errParserInvalidVideoHeader = this.errParserBase + 'Invalid video header'
        this.errParserInvalidMinePosition = this.errParserBase + 'Invalid mine position'
    };
} else {
    i18n = new function () {
        // title
        this.videoReplay = '重新播放'
        this.videoPause = '暂停播放'
        this.videoExit = '退出播放'
        this.videoClose = this.videoExit
        this.speedModify = '速度调节'
        this.speedReset = '点击复原'
        this.rateModify = '进度调节'
        this.videoTime = '时间'
        // 错误提示
        this.errIE = '暂不支持 IE 内核 ,请更换浏览器或内核！'
        this.errFormatPre = '暂不支持 \''
        this.errFormatPost = '\' 格式录像，请重新选择！'
        this.errRequest = '录像资源获取出错，错误码：'
        this.errParserBase = '录像解析出错：'
        this.errParserUnknown = this.errParserBase + '未知错误'
        this.errParserTooLarge = this.errParserBase + '文件过大'
        this.errParserUnexpectedEnd = this.errParserBase + '意外结尾'
        this.errParserInvalidFile = this.errParserBase + '文件无效'
        this.errParserInvalidEvent = this.errParserBase + '事件无效'
        this.errParserInvalidVideoType = this.errParserBase + '视频类型无效'
        this.errParserInvalidBoardSize = this.errParserBase + '布局无效'
        this.errParserInvalidVideoHeader = this.errParserBase + '文件头无效'
        this.errParserInvalidMinePosition = this.errParserBase + '布雷无效'
    };
}

// 设置 title 属性
$('#videoReplay').attr('title', i18n.videoReplay)
$('#videoPause').attr('title', i18n.videoPause)
$('#videoExit').attr('title', i18n.videoExit)
$('#videoClose').attr('title', i18n.videoClose)
$('#range_speed').attr('title', i18n.speedModify)
$('#speed_value').attr('title', i18n.speedReset)
$('#range_rate').attr('title', i18n.rateModify)
$('#rate_value').attr('title', i18n.videoTime)