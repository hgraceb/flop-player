// 使用Zepto替换jQuery会有很多问题，如：没有outerWidth和outerHeight方法，没有找到如何判断动画进行中的方法
import $ from './jquery/jquery-3.6.0.min'
import '../css/mine.css'

let i18n;

function initI18n() {
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
            this.errQuitUnexpectedly = 'Unexpected video playback exit.'
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
            this.errQuitUnexpectedly = '录像播放意外退出'
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
}

initI18n()

"use strict";

//初始化变量
let second = 0;//秒
let millisecond = 0;//毫秒
let int;//定时器
let beginTime = new Date();//开始时间
let speed = 1.00;//录像播放速度
let last_second = 0;//暂停前的second
let last_millisecond;//暂停前的milllisecond
let plan = 0;//模拟事件进度
let stopTime = 0;//当前时间
let stop_minutes = 0;
let stop_seconds = 0;
let stop_milliseconds = 0;
let current = 0;//当前block
let front = 0;//前一个block
let size = 0;//录像事件总长度
let video_play = false;//changeSpeed函数中防止多次重置定时器
let game_level = 0;//判断弹窗位置，只用了一次，可以考虑化简

const EMPTY_FUNCTION = function () {
};

let log = EMPTY_FUNCTION;
let error = EMPTY_FUNCTION;
let time = EMPTY_FUNCTION;
let timeLog = EMPTY_FUNCTION;
let timeEnd = EMPTY_FUNCTION;
let clear = EMPTY_FUNCTION;
if (location.hostname === "localhost" || location.hostname === "hgraceb.github.io") {
    log = function (...data) {
        console.log(...data);
    }
    error = function (...data) {
        console.error(...data);
    }
    time = function (label) {
        console.time(label);
    }
    timeLog = function (label, ...data) {
        console.timeLog(label, ...data);
    }
    timeEnd = function (label) {
        console.timeEnd(label);
    }
    clear = function () {
        console.clear();
    }
}

function reset()//时间重置函数
{
    window.clearInterval(int);
    millisecond = second = 0;

    document.getElementById('RTime').innerText = '0.00';
    document.getElementById('EstTime').innerText = '*';
    document.getElementById('3BV').innerText = '*/*';
    document.getElementById('3BV/s').innerText = '*';
    document.getElementById('Ces').innerText = '0@0';
    document.getElementById('Flags').innerText = '0';
    document.getElementById('STNB').innerText = '*';
    document.getElementById('QG').innerText = '*';
    document.getElementById('Ops').innerText = '*/*';
    document.getElementById('Isls').innerText = '*';
    document.getElementById('Left').innerText = '0@0';
    document.getElementById('Right').innerText = '0@0';
    document.getElementById('Double').innerText = '0@0';
    document.getElementById('Cl').innerText = '0@0';
    document.getElementById('IOE').innerText = '*';
    document.getElementById('Thrp').innerText = '*';
    document.getElementById('Corr').innerText = '*';
    document.getElementById('Path').innerText = '0';
    document.getElementById('RQP').innerText = '*';
}

function start()//开始函数
{
    beginTime = new Date();
    window.clearInterval(int);
    int = setInterval(timer, 10);
    log("start:" + beginTime.getMinutes() + '.' + beginTime.getSeconds() + '.' + beginTime.getMilliseconds());
}

function timer()//计时函数
{
    const date = new Date();
    let stopMinutes = date.getMinutes();
    let stopSeconds = date.getSeconds();
    let stop_milliseconds = date.getMilliseconds();
    if (stop_milliseconds < beginTime.getMilliseconds()) {
        stop_milliseconds += 1000;
        stopSeconds--;
    }
    if (stopSeconds < beginTime.getSeconds()) {
        stopSeconds += 60;
        stopMinutes--;
    }
    if (stopMinutes < beginTime.getMinutes()) {
        stopMinutes += 60;
    }
    second = (stopMinutes - beginTime.getMinutes()) * 60 + (stopSeconds - beginTime.getSeconds());
    millisecond = parseInt((stop_milliseconds - beginTime.getMilliseconds()) / 10);
    if (second < 999) {
        changeTopCount("time_count", second + 1);

        document.getElementById('RTime').innerText = (second + millisecond / 100).toFixed(2);
        document.getElementById('Ces').innerText = ces_count + '@' + (ces_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Left').innerText = left_count + '@' + (left_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Right').innerText = right_count + '@' + (right_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Double').innerText = double_count + '@' + (double_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Cl').innerText = (left_count + right_count + double_count) + '@' + ((left_count + right_count + double_count) / (second + millisecond / 100)).toFixed(2);

    } else if (second > 999) {
        stop();
        lose();
        changeTopCount("time_count", 999);
        document.getElementById('RTime').innerText = '999.99';
    }
}

/**
 * 调整布局
 */
function adjustLayout() {
    // 获取元素节点
    const $border = $('#border');
    const $videoControl = $('#video_control');
    const $videoIframe = $('#video-iframe', parent.document);
    const $videoStage = $('#video-stage', parent.document);

    // 调整播放器宽高
    const widthBorder = $border.outerWidth();
    const widthControl = $videoControl.outerWidth();
    $videoIframe.css("width", (widthBorder > widthControl ? widthBorder : widthControl + 8) + "px");
    $videoIframe.css("height", $border.outerHeight() + $videoControl.outerHeight() + 6 + "px");

    // 当前所在 iframe 居中（可能要考虑手机竖屏，避免播放器位置过低）
    const scrollbarWidth = hasScrollbar(parent.window, parent.document) ? getScrollbarWidth() : 0; // 滚动条宽度
    let top = (parent.window.innerHeight - scrollbarWidth - $videoIframe.outerHeight()) / 2; // 窗口可用高度减去 iframe 高度
    let left = (parent.window.innerWidth - scrollbarWidth - $videoIframe.outerWidth()) / 2;  // 窗口可用宽度减去 iframe 宽度
    $videoIframe.css("margin-top", parent.window.scrollY + (top > 0 ? top : 0) + "px");
    $videoIframe.css("margin-left", parent.window.scrollX + (left > 0 ? left : 0) + "px");

    // 调整遮罩大小为全屏，播放器可能超出屏幕，在 iframe 居中后进行设置，此时 iframe 的 margin-top 和 margin-left 已经更新
    const clientWidth = Math.max(window.parent.document.body.clientWidth, $videoIframe.outerWidth() + parseInt($videoIframe.css("marginLeft")));
    const clientHeight = Math.max(window.parent.document.body.clientHeight, $videoIframe.outerHeight() + parseInt($videoIframe.css("marginTop")));
    $videoStage.css("width", clientWidth + "px");
    $videoStage.css("height", clientHeight + "px");
}

function start_avf(video)//开始函数
{
    timeEnd("录像准备");
    log(video)
    if (video === 0) {
        return false;
    }
    const $markSpan = $('#mark_span');
    $markSpan.html(video[0].player);
    $markSpan.attr('title', $markSpan.html());
    gameover = true;
    size = video[0].size;
    setQuestionMode(video[0].question) // 设置是否启用问号模式

    if (!document.getElementById("mouse_point")) {
        //别再手贱删了，mouse_point放这才能正常初始化container的block
        const div = document.createElement("div");
        div.id = "mouse_point";
        const grandparent = document.getElementById("container");
        grandparent.appendChild(div);
        div.style.display = 'block';
        div.style.marginLeft = video[0].x + 'px';
        div.style.marginTop = video[0].y + 'px';
    }
    document.getElementById("video_control").style.display = "block";

    game_level = video[0].level;
    adjustLayout();

    log("start:" + new Date().getMinutes() + '.' + new Date().getSeconds() + '.' + new Date().getMilliseconds());
    window.clearInterval(int);
    int = setInterval(timer_avf, 0);
    beginTime = 0;//开始时间
    last_second = 0;
    last_millisecond = 0;
    plan = 0;//模拟点击进度
    stopTime = 0;//当前时间
    stop_minutes = 0;
    stop_seconds = 0;
    stop_milliseconds = 0;
    current = 0;//当前block
    front = 0;//前一个block
    video_play = true;
}

function pauseVideo() {//暂停
    if (gameover === false) {
        // UPK模式下禁用暂停按钮
        return
    }
    if (beginTime !== 0) {
        video_play = false;
        window.clearInterval(int);
        beginTime = 0;
        last_millisecond = millisecond;
        last_second = second;
    } else if (document.getElementById("mouse_point") && plan < size) {
        video_play = true;
        window.clearInterval(int);
        int = setInterval(timer_avf, 0);
    }
}

/**
 * 回放录像
 */
function replayVideo() {
    clear();
    time("录像准备");
    if (video === 0) {
        return false;
    }
    if (gameover === true && beginTime === 0 && plan < video[0].size) {
        video_play = true;
        window.clearInterval(int);
        int = setInterval(timer_avf, 0);
        log(plan);
    } else {
        container.replay_video();
    }
}

function changeSpeed() {//改变速度
    const $rangeSpeed = $('#range_speed');
    const value = $rangeSpeed.val();
    const valStr = value + "% 100%";
    if (video_play === true) pauseVideo();
    speed = (value <= 50 ? value / 50 : (value <= 75 ? (value - 50) * 0.16 + 1 : (value - 75) * 0.2 + 5)).toFixed(2);
    $('#speed_value').html(speed + 'x');
    $rangeSpeed.css({
        "background-size": valStr
    })
    if (video_play === false) pauseVideo();
}

function resetSpeed() {//复位速度为1
    const valStr = 50 + "% 100%";
    if (video_play === true) pauseVideo();
    speed = 1;
    $('#speed_value').html('1.00x');
    const $rangeSpeed = $('#range_speed');
    $rangeSpeed.val(50);
    $rangeSpeed.css({
        "background-size": valStr
    })
    if (video_play === false) pauseVideo();
}

function changeRateValue() {//改变进度条的value
    const $rangeRate = $('#range_rate');
    const value = $rangeRate.val();
    const valStr = value / 10 + "% 100%";
    if (video_play === true) pauseVideo();
    if (video !== 0) $('#rate_value').html((value / 1000 * video[0].realtime).toFixed(2));
    $rangeRate.css({
        "background-size": valStr
    })
}

function changeRate() {//改变播放进度
    const value = $('#rate_value').text();
    if (last_second * 1000 + last_millisecond * 10 < value * 1000) {
        last_second = parseInt(value);
        last_millisecond = value * 100 % 100;
        pauseVideo();
    } else {
        container.replay_video();
        pauseVideo();
        last_second = parseInt(value);
        last_millisecond = value * 100 % 100;
        pauseVideo();
    }
}

function timer_avf() {
    if ($('#video-iframe', parent.document).is(":animated")) {
        // 当前还在淡出淡入动画时暂停播放
        window.clearInterval(int);
    }
    if (beginTime === 0) {
        beginTime = new Date();
    }
    stopTime = new Date();
    stop_minutes = stopTime.getMinutes();
    stop_seconds = stopTime.getSeconds();
    stop_milliseconds = stopTime.getMilliseconds();
    if (stop_milliseconds < beginTime.getMilliseconds()) {
        stop_milliseconds += 1000;
        stop_seconds--;
    }
    if (stop_seconds < beginTime.getSeconds()) {
        stop_seconds += 60;
        stop_minutes--;
    }
    if (stop_minutes < beginTime.getMinutes()) {
        stop_minutes += 60;
    }
    second = speed * ((stop_minutes - beginTime.getMinutes()) * 60 + (stop_seconds - beginTime.getSeconds())) + last_second;
    millisecond = speed * (parseInt((stop_milliseconds - beginTime.getMilliseconds()) / 10)) + last_millisecond;
    if ((second * 1000 + millisecond * 10) > video[0].realtime * 1000) {//高倍速时间有延迟，自欺欺人解决法
        if (plan < size) {
            second = video[size - 1].sec;
            millisecond = video[size - 1].hun;
            log('高倍速时间误差: ', 'plan =', plan, ', size =', size);
        } else {
            log('录像播放意外退出: ', 'plan =', plan, ', size =', size);
            // 录像播放意外退出
            videoError(i18n.errQuitUnexpectedly)
        }
    }

    while (plan < size && (second * 1000 + millisecond * 10) >= (video[plan].sec * 1000 + video[plan].hun * 10)) {
        document.getElementById('mouse_point').style.marginLeft = video[plan].x + 'px';
        document.getElementById('mouse_point').style.marginTop = video[plan].y + 'px';
        // document.getElementById('Path').innerText=parseInt(video[plan].path);
        if (video[plan].rows > container.columns || video[plan].columns > container.rows) {
            //mvf录像x和y可能会超出界面范围
            //若超出则只进行鼠标指针操作并退出此次循环
            if (current !== 0) current.change_around_normal();//越界时先判断current是否初始化
            if (video[plan].mouse === "lc") {//lc
                leftClick = true;
                if (rightClick === true) {
                    left_invalid = true;
                }
            } else if (video[plan].mouse === "rc") {//rc
                rightClick = true;
                if (leftClick === true) {
                    left_invalid = true;
                } else {
                    right_invalid = true;
                }
            } else if (video[plan].mouse === "lr") {//lr
                leftClick = false;
                if (rightClick === true) {
                    if (right_invalid === true) {
                        right_invalid = false;
                    }
                }
                left_invalid = false;
                leftClickWithShift = false
            } else if (video[plan].mouse === "rr") {//rr
                rightClick = false;
                right_invalid = false;
                leftClickWithShift = false
            } else if (video[plan].mouse === "mc") {//mc
                middle_invalid = true;
            } else if (video[plan].mouse === "mr") {//mr
                middle_invalid = false;
                leftClickWithShift = false
            } else if (video[plan].mouse === "sc") {
                leftClickWithShift = true
            } else if (video[plan].mouse === "mt") {
                toggleQuestionMode()
            }
            plan++;
            continue;
        }
        front = current;
        current = container.childObject[(video[plan].columns - 1) * container.columns + (video[plan].rows - 1)];

        // 不需要判断 video[plan].mouse==1，只要前后两个方块位置不同即认为有进行移动
        // 如 0.00 时间内的移动事件（mv）没有被记录在录像信息当中，但是可能进行过移动
        if (front !== current) {//mv

            //此判断要在下句判断之前
            //避免执行中键操作时current.change_around_opening()操作之后
            //又执行了front.change_around_normal()导致block样式错误
            if (front !== 0) {
                if ((rightClick === true && leftClick === true) || middle_invalid === true || leftClickWithShift === true) {
                    front.change_around_normal();
                } else if (front.isOpen === false && rightClick === false && leftClick === true) {
                    if (front.getStyle() === "opening" && left_invalid === false) {
                        front.changeStyle("block");
                    }
                }
            }

            if ((rightClick === true && leftClick === true) || middle_invalid === true || leftClickWithShift === true) {
                current.change_around_opening();
            } else if (current.isOpen === false && rightClick === false && leftClick === true) {
                if (current.getStyle() === "block" && left_invalid === false) {
                    current.changeStyle("opening");
                }
            }
        }

        if (video[plan].mouse === "mv") {//mv
            // 空语句，移动事件在前面已经处理过，如果是移动事件则无需进行后面的判断
        } else if (video[plan].mouse === "lc") {//lc
            leftClick = true;
            current.change_around_normal();//复原因为中键改变的block样式
            changeFaceClass("face_click");
            if (rightClick === true) {
                left_invalid = true;
                current.change_around_opening();
            } else if (current.getStyle() === "block" && plan !== 0) {//很迷的判定，下面对应的还要有k==1
                current.changeStyle("opening");
            }
        } else if (video[plan].mouse === "rc") {//rc
            rightClick = true;
            current.change_around_normal();//复原因为中键改变的block样式
            changeFaceClass("face_click");
            if (leftClick === true) {
                left_invalid = true;
                current.change_around_opening();
            } else {
                right_count++;
                if (current.getStyle() === "openedBlockBomb") {
                    if (question === false) {
                        ces_count++;
                        current.changeStyle("block");
                        changeTopCount("mine_count", container.minenumber = container.minenumber + 1);
                    } else {
                        ces_count++;
                        current.changeStyle("question");
                        changeTopCount("mine_count", container.minenumber = container.minenumber + 1);
                    }
                } else if (current.getStyle() === "block") {
                    ces_count++;
                    current.changeStyle("openedBlockBomb");
                    changeTopCount("mine_count", container.minenumber = container.minenumber - 1);
                } else if (current.getStyle() === "question") {
                    ces_count++;
                    current.changeStyle("block");
                } else {
                    right_invalid = true;
                }
            }
        } else if (video[plan].mouse === "lr") {//lr
            leftClick = false;
            changeFaceClass("face_normal");
            if (leftClickWithShift) {
                current.change_around_normal();
                double_count++;
            } else if (rightClick === true) {
                current.change_around_normal();
                double_count++;
                if (right_invalid === true) {
                    right_count--;
                    right_invalid = false;
                }
            } else if (left_invalid === false) {
                left_count++;
            }
            if (current.isOpen === false && rightClick === false && leftClickWithShift === false) {
                //当lr事件直接出现在方块上时，方块没有经过mv事件变为"opening"样式，此时若left_invalid为false也需要打开方块
                if (current.getStyle() === "opening" || current.getStyle() === "question" || (current.getStyle() === "block" && !left_invalid) || plan === 1 || plan === 2) {
                    //同样是很迷的判定
                    //avf可能第二个操作时lr（plan==1）
                    //mvf可能第三个操作是lr（plan==2）
                    current.open();
                }
            } else if ((rightClick === true || leftClickWithShift === true) && current.isOpen === true && current.bombNumAround > 0) {
                current.openaround();
            }
            left_invalid = false;
            leftClickWithShift = false
        } else if (video[plan].mouse === "rr") {//rr
            rightClick = false;
            changeFaceClass("face_normal");
            if (leftClick === true) {
                double_count++;
                if (right_invalid === true) {
                    right_count--;
                }
                current.change_around_normal();
                if (current.isOpen === true && current.bombNumAround > 0) {
                    current.openaround();
                }
            }
            right_invalid = false;
            leftClickWithShift = false
        } else if (video[plan].mouse === "mc") {//mc
            middle_invalid = true;
            current.change_around_opening();
        } else if (video[plan].mouse === "mr") {//mr
            middle_invalid = false;
            double_count++;
            current.change_around_normal();
            if (current.isOpen === true && current.bombNumAround > 0) {
                current.openaround();
            }
            leftClickWithShift = false
        } else if (video[plan].mouse === "sc") {
            // left_click_with_shift
            leftClickWithShift = true
        } else if (video[plan].mouse === "mt") {
            // toggle_question_mark_setting
            toggleQuestionMode()
        }
        plan++;
    }

    document.getElementById('rate_value').innerText = (second + millisecond / 100).toFixed(2);
    document.getElementById('range_rate').value = (((second + millisecond / 100) / video[0].realtime).toFixed(2)) * 1000;
    document.getElementById('range_rate').style = "background-size: " + (((second + millisecond / 100) / video[0].realtime).toFixed(2)) * 100 + "% 100%;";

    changeTopCount("time_count", parseInt(second) + 1);
    document.getElementById('RTime').innerText = (second + millisecond / 100).toFixed(2);

    counters_3BV();
    document.getElementById('Ces').innerText = ces_count + '@' + (ces_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Right').innerText = right_count + '@' + (right_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Left').innerText = left_count + '@' + (left_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Flags').innerText = container.bombNumber - container.minenumber;
    document.getElementById('Double').innerText = double_count + '@' + (double_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Cl').innerText = (left_count + right_count + double_count) + '@' + ((left_count + right_count + double_count) / (second + millisecond / 100)).toFixed(2);
}

function stop()//暂停函数
{
    window.clearInterval(int);
    const date = new Date();
    log("stop:" + date.getMinutes() + '.' + date.getSeconds() + '.' + date.getMilliseconds());
    let stopMinutes = date.getMinutes();
    let stopSeconds = date.getSeconds();
    let stopMilliseconds = date.getMilliseconds();
    if (stopMilliseconds < beginTime.getMilliseconds()) {
        stopMilliseconds += 1000;
        stopSeconds--;
    }
    if (stopSeconds < beginTime.getSeconds()) {
        stopSeconds += 60;
        stopMinutes--;
    }
    if (stopMinutes < beginTime.getMinutes()) {
        stopMinutes += 60;
    }
    log('运行时间:' + ((stopMinutes - beginTime.getMinutes()) * 60 + (stopSeconds - beginTime.getSeconds()) + (stopMilliseconds - beginTime.getMilliseconds()) / 1000).toFixed(2));
}

/**
 * 修改录像控制中对应控件的样式
 *
 * @param id {string}        要修改控件对应的ID
 * @param className {string} 目标样式
 */
function changeControlClass(id, className)//修改顶部笑脸背景
{
    document.getElementById(id).className = className;
}

/**
 * 修改顶部笑脸的样式
 *
 * @param className {string} 目标样式
 */
function changeFaceClass(className) {
    document.getElementById("face").className = className;
}

/**
 * 处理鼠标移出笑脸后的事件
 */
function handleFaceMouseOut() {
    const faceElement = document.getElementById("face")
    // 如果当前笑脸处于点击状态
    if (faceElement.className === 'face_press') {
        // 鼠标移出后将笑脸重置为正常状态
        faceElement.className = "face_normal"
    }
}

/**
 * 修改顶部计时器显示数字（图片）
 *
 * @param id {string} 需要修改的对应控件的 ID
 * @param count 需要显示的数字，小于 -99 只显示后两位数字，大于 999 则不改变当前显示的数字
 */
function changeTopCount(id, count) {
    const hun = parseInt(Math.abs(count) / 100) % 10; // 百位
    const ten = parseInt((Math.abs(count) / 10)) % 10; // 十位
    const unit = Math.abs(count) % 10; // 个位
    const elements = document.getElementById(id).getElementsByTagName("div");
    if (count < -10) {
        elements[0].className = "count_number_minus";
        elements[1].className = "count_number_" + ten;
        elements[2].className = "count_number_" + unit;
    } else if (count < 0) {
        elements[0].className = "count_number_minus";
        elements[1].className = "count_number_0";
        elements[2].className = "count_number_" + unit;
    } else if (count < 10) {
        elements[0].className = "count_number_0";
        elements[1].className = "count_number_0";
        elements[2].className = "count_number_" + unit;
    } else if (count < 100) {
        elements[0].className = "count_number_0";
        elements[1].className = "count_number_" + ten;
        elements[2].className = "count_number_" + unit;
    } else if (count < 1000) {
        elements[0].className = "count_number_" + hun;
        elements[1].className = "count_number_" + ten;
        elements[2].className = "count_number_" + unit;
    }
}

function counters_3BV() {//计算3BV
    let opening = 0;
    let bbbv = 0;
    let bbbv_done = 0;
    let opening_done = 0;
    let island = 0;
    const a = [];
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (let i = 0; i < container.columns * container.rows; i++) {
        if (container.childObject[i].bombNumAround === 0 && container.childObject[i].is_bv) {
            opening++;
            counters_Ops(container.childObject[i], a);
            container.childObject[i].is_bv = true;
        }
    }
    for (let i = 0; i < container.columns * container.rows; i++) {
        if (!container.childObject[i].isBomb && container.childObject[i].is_bv) {
            bbbv++;
            if (container.childObject[i].isOpen) {
                bbbv_done++;
                if (container.childObject[i].bombNumAround === 0) {
                    opening_done++;
                }
            }
        }
    }
    for (let i = 0; i < container.columns * container.rows; i++) {
        if (container.childObject[i].bombNumAround > 0 && container.childObject[i].is_bv) {
            island++;
            countersIslands(container.childObject[i], a);
        }
    }
    document.getElementById('3BV').innerText = bbbv_done + '/' + bbbv;
    document.getElementById('Ops').innerText = opening_done + '/' + opening;
    document.getElementById('Isls').innerText = island;
    if (bbbv_done !== 0) {
        document.getElementById('EstTime').innerText = (bbbv / (bbbv_done * 100 / (second * 100 + millisecond))).toFixed(2);
        document.getElementById('3BV/s').innerText = (bbbv_done * 100 / (second * 100 + millisecond)).toFixed(2);
        document.getElementById('RQP').innerText = ((second + millisecond / 100) * (second + millisecond / 100 + 1) / bbbv_done).toFixed(3);
        if (container.bombNumber === 10) {
            document.getElementById('STNB').innerText = (47.299 / (Math.pow(second + millisecond / 100, 1.7) / bbbv_done)).toFixed(3);
        } else if (container.bombNumber === 40) {
            document.getElementById('STNB').innerText = (153.73 / (Math.pow(second + millisecond / 100, 1.7) / bbbv_done)).toFixed(3);
        } else if (container.bombNumber === 99) {
            document.getElementById('STNB').innerText = (435.001 / (Math.pow(second + millisecond / 100, 1.7) / bbbv_done)).toFixed(3);
        }
        if (plan > 0) document.getElementById('Path').innerText = Math.round(video[plan - 1].path);
        document.getElementById('QG').innerText = (Math.pow(second + millisecond / 100, 1.7) / bbbv_done).toFixed(3);
        document.getElementById('Thrp').innerText = (bbbv_done / ces_count).toFixed(3);
        document.getElementById('Corr').innerText = (ces_count / (left_count + right_count + double_count)).toFixed(3);
        document.getElementById('IOE').innerText = (bbbv_done / (left_count + right_count + double_count)).toFixed(3);
    }
    for (let i = 0; i < container.columns * container.rows; i++) {
        container.childObject[i].is_bv = true;
    }
}

function counters_Ops(block, a) {//计算openings
    block.is_bv = false;
    for (let i = 0; i < a.length; i++) {
        const b = block.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && !b.isBomb && b.is_bv) {
            if (b.bombNumAround === 0) {
                counters_Ops(b, a);
            } else if (b.bombNumAround > 0) {
                b.is_bv = false;
            }
        }
    }
}

function countersIslands(block, a) {//计算islands
    block.is_bv = false;
    for (let i = 0; i < a.length; i++) {
        const b = block.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && b.bombNumAround > 0 && b.is_bv) {
            countersIslands(b, a);
        }
    }
}

function write_counters() {//重写counter
    counters_3BV();
    changeTopCount("time_count", parseInt(second) + 1);
    document.getElementById('RTime').innerText = (second + millisecond / 100).toFixed(2);
    document.getElementById('Flags').innerText = container.bombNumber - container.minenumber;
    document.getElementById('Ces').innerText = ces_count + '@' + (ces_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Left').innerText = left_count + '@' + (left_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Right').innerText = right_count + '@' + (right_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Double').innerText = double_count + '@' + (double_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Cl').innerText = (left_count + right_count + double_count) + '@' + ((left_count + right_count + double_count) / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Path').innerText = path;
}

function question_marks() {//更改问号标记
    if (document.getElementById("question").innerHTML === '标记问号') {
        document.getElementById("question").innerHTML = '取消问号';
        question = true;
    } else if (document.getElementById("question").innerHTML === '取消问号') {
        document.getElementById("question").innerHTML = '标记问号';
        question = false;
    }
}

/**
 * 判断是否是 IE 浏览器
 */
function isIE() {
    return window.ActiveXObject || "ActiveXObject" in window;
}

/**
 * 判断是否有滚动条
 */
function hasScrollbar(window, document) {
    window = window || this.window;
    document = document || this.document;
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
}

/**
 * 计算滚动条宽度，新建一个带有滚动条的 div 元素，计算 offsetWidth 和 clientWidth 的差值
 */
function getScrollbarWidth() {
    const scrollDiv = document.createElement("div");
    scrollDiv.style.cssText = "visibility: hidden;overflow: scroll;";
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
}

/**
 * Optimized event handling
 */
;(function () {
    const throttle = function (type, name, obj) {
        obj = obj || window;
        let running = false;
        const func = function () {
            if (running) {
                return;
            }
            running = true;
            requestAnimationFrame(function () {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    throttle("resize", "parentResize", parent.window);
})();


"use strict";//js真的很严格

//全局变量
var gameover = false;//游戏结束标志
var firstclick = true;//第一次点击
var leftClick = false;//鼠标左键
var rightClick = false;//鼠标右键
var left_count = 0;//左键次数
var right_count = 0;//右键次数
var double_count = 0;//双击次数
var ces_count = 0;//有效点击次数
var right_invalid = false;//消除双击带右键
var left_invalid = false;//消除双击带左键
var middle_invalid = false;//判断中键是否点击
var leftClickWithShift = false;//判断是否按住shift的情况下点击左键，此时放开shift没有影响，在任一按键释放后重置，其中放开左键后相当于双击
var video_invalid = true;//判断是否读取过录像文件并已经记录数据
var reset_begin = false;//判断重开开始计时的时间
var path = 0;//移动距离
var question = false;//是否标记问号

function Container(d, e, f) {
    this.rows = d;//行
    this.columns = e;//列
    this.bombNumber = f;//总雷数
    this.childObject = [];//block
    this.html = null;
    this.minenumber = f;//剩余雷数
    this.level = 1;
}

Container.prototype.init = function (level, columns, rows, bombNumber) {
    reset();
    gameover = false;
    firstclick = true;
    leftClick = false;
    rightClick = false;
    left_invalid = false;
    right_invalid = false;
    middle_invalid = false;
    leftClickWithShift = false;
    left_count = 0;
    right_count = 0;
    double_count = 0;
    ces_count = 0;
    path = 0;
    const container = document.getElementById("container");
    if ((window.orientation === 0 || window.orientation === 180) && (level === 3 || (level === 0 && this.level === 3))) {//手机exp屏幕自适应
        document.getElementsByTagName("meta")[1]["content"] = ('width=device-width, initial-scale=1, user-scalable=no, minimum-scale=' + window.screen.width / 640 + ', maximum-scale=' + window.screen.width / 640 + '');
    } else {
        document.getElementsByTagName("meta")[1]["content"] = ('width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0');
    }
    if (container) {
        if (document.getElementById("mouse_point")) {
            $("div#mouse_point").remove();
        }
        document.getElementById("video_control").style.display = "none";
        const grandparent = document.getElementById("containers");
        for (let i = 0; i < this.rows * this.columns; i++) {
            container.removeChild(container.childNodes[0]);//移除block
        }

        // 自定义
        if (level === 4) {
            this.rows = rows;
            this.columns = columns;
            this.bombNumber = bombNumber;
            this.level = 4;
        }
        // 高级
        else if (level === 3) {
            this.rows = 16;
            this.columns = 30;
            this.bombNumber = 99;
            this.level = 3;
        }
        // 中级
        else if (level === 2) {
            this.rows = 16;
            this.columns = 16;
            this.bombNumber = 40;
            this.level = 2;
        }
        // 初级
        else if (level === 1) {
            this.rows = 8;
            this.columns = 8;
            this.bombNumber = 10;
            this.level = 1;
        }

        // 调整布局和样式
        if (level !== 0) {
            const slideLength = 16; // 边长
            container.setAttribute("style", `width:${slideLength * this.columns}px;height:${slideLength * this.rows}px;`);
            grandparent.setAttribute("style", `width:${18 + slideLength * this.columns}px;height:${106 + slideLength * this.rows}px;`);
            $("#top").css("width", 2 + slideLength * this.columns);
            $("#mine").css("width", 156 + slideLength * this.columns);
            $("#menu").css("width", 18 + slideLength * this.columns);
            $("#mark").css("width", 6 + slideLength * this.columns);
            $("#mark_span").css("width", 6 + slideLength * this.columns);
            const $border = $("#border");
            const $videoControl = $("#video_control");
            const borderWidth = $border.outerWidth();
            const controlWidth = $videoControl.outerWidth() + parseInt($border.css("padding-left")) + parseInt($border.css("padding-right"));
            let marginLeft = 0;
            // 如果游戏区域的宽度大于速度控制条的宽度，则将速度控制条与游戏区域进行左对齐
            if ($("#containers").outerWidth() > $videoControl.outerWidth()) {
                marginLeft = $("#counters").outerWidth() + 6; // 阴影为 3 px
            }
            // 如果计数器和游戏区域的宽度大于速度控制条的宽度，则将速度控制条居中显示
            else if (borderWidth > controlWidth) {
                marginLeft = (borderWidth - controlWidth) / 2;
            }
            $videoControl.css({"margin-top": $border.outerHeight() - 2, "margin-left": marginLeft, "left": 4});
        }

        this.childObject.splice(0, this.childObject.length);
        for (let i = 0; i < this.rows * this.columns; i++) {
            const block = new Block("block", i);
            this.childObject.push(block);
            container.appendChild(block.root);
        }
        //当前frame宽高
        window.parent.document.getElementById('video-iframe').width = document.getElementById('border').offsetWidth;
        window.parent.document.getElementById('video-iframe').height = document.getElementById('border').offsetHeight;

        //加载完成重新显示frame
        window.parent.document.getElementById('video-stage').style.display = 'block';//避免浏览器前进后退重新显示
    } else {
        //首次加载(主界面)时不显示录像iframe
        this.html = document.createElement("div");
        this.html.id = "container";
        for (let i = 0; i < this.rows * this.columns; i++) {
            const block = new Block("block", i);
            this.childObject.push(block);
            this.html.appendChild(block.root);
        }
    }
    changeFaceClass("face_normal");
    changeTopCount("mine_count", this.bombNumber);
    changeTopCount("time_count", 0);
    this.minenumber = this.bombNumber;
};

Container.prototype.add_mark = function () {//添加标识
    const mark = document.createElement("div");
    mark.id = "mark";
    document.getElementById("containers").appendChild(mark);
    const span = document.createElement("span");
    span.id = "mark_span";
    span.innerHTML = "Anonymous!";
    document.getElementById("mark").appendChild(span);//添加子元素
};

Container.prototype.setMine = function (bombId) {
    reset();//重置时间
    log("新游戏布雷，bombId = " + bombId);
    gameover = false;
    leftClick = false;
    rightClick = false;
    let bombs = 0;
    while (true) {
        if (bombs >= this.bombNumber) {
            break;
        }
        const position = Math.floor(Math.random() * this.rows * this.columns);
        if (position !== bombId && this.childObject[position].isBomb !== true) {
            this.childObject[position].isBomb = true;
            bombs++;
        }
    }
    for (let i = 0; i < this.rows * this.columns; i++) {
        const element = this.childObject[i];
        element.neighbors.up = this.childObject[i - this.columns];
        element.neighbors.right = this.childObject[i + 1];
        element.neighbors.down = this.childObject[i + this.columns];
        element.neighbors.left = this.childObject[i - 1];
        element.neighbors.leftUp = this.childObject[i - this.columns - 1];
        element.neighbors.rightUp = this.childObject[i - this.columns + 1];
        element.neighbors.leftDown = this.childObject[i + this.columns - 1];
        element.neighbors.rightDown = this.childObject[i + this.columns + 1];
        if (i / this.columns === 0) {
            element.neighbors.up = null;
            element.neighbors.leftUp = null;
            element.neighbors.rightUp = null;
        } else if (i / this.columns === this.rows - 1) {
            element.neighbors.down = null;
            element.neighbors.leftDown = null;
            element.neighbors.rightDown = null;
        }
        if (i % this.columns === 0) {
            element.neighbors.left = null;
            element.neighbors.leftUp = null;
            element.neighbors.leftDown = null;
        } else if (i % this.columns === this.columns - 1) {
            element.neighbors.right = null;
            element.neighbors.rightUp = null;
            element.neighbors.rightDown = null;
        }
        element.calcBombAround();
    }
    this.childObject[bombId].open();
};

Container.prototype.setVideoMines = function (board) {
    reset();//重置时间
    gameover = true;
    firstclick = false;
    leftClick = false;
    rightClick = false;
    left_invalid = false;
    right_invalid = false;
    middle_invalid = false;
    leftClickWithShift = false;
    left_count = 0;
    right_count = 0;
    double_count = 0;
    ces_count = 0;
    for (let i in board) {
        if (board[i] === 1 || board[i] === "*") {
            this.childObject[i].isBomb = true;
        }
    }
    for (let i = 0; i < this.rows * this.columns; i++) {
        const element = this.childObject[i];
        element.neighbors.up = this.childObject[i - this.columns];
        element.neighbors.right = this.childObject[i + 1];
        element.neighbors.down = this.childObject[i + this.columns];
        element.neighbors.left = this.childObject[i - 1];
        element.neighbors.leftUp = this.childObject[i - this.columns - 1];
        element.neighbors.rightUp = this.childObject[i - this.columns + 1];
        element.neighbors.leftDown = this.childObject[i + this.columns - 1];
        element.neighbors.rightDown = this.childObject[i + this.columns + 1];
        if (i / this.columns === 0) {
            element.neighbors.up = null;
            element.neighbors.leftUp = null;
            element.neighbors.rightUp = null;
        } else if (i / this.columns === this.rows - 1) {
            element.neighbors.down = null;
            element.neighbors.leftDown = null;
            element.neighbors.rightDown = null;
        }
        if (i % this.columns === 0) {
            element.neighbors.left = null;
            element.neighbors.leftUp = null;
            element.neighbors.leftDown = null;
        } else if (i % this.columns === this.columns - 1) {
            element.neighbors.right = null;
            element.neighbors.rightUp = null;
            element.neighbors.rightDown = null;
        }
        element.calcBombAround();
    }
};

Container.prototype.replay_video = function () {
    if (video_invalid === false) {
        container.init(video[0].level, this.columns, this.rows, this.bombNumber);
        container.setVideoMines(video[0].board);
        start_avf(video);
    } else {
        log("录像重放错误");
    }
}

Container.prototype.reset_mine = function () {
    const $markSpan = $('#mark_span');
    $markSpan.html('UPK mode');
    $markSpan.attr('title', $markSpan.html());
    if (left_count !== 0 || gameover === true) {
        if (document.getElementById("mouse_point")) {
            $("div#mouse_point").remove();
        }
        changeTopCount("mine_count", container.minenumber = container.bombNumber);
        reset();//重置时间
        gameover = false;
        firstclick = false;
        leftClick = false;
        rightClick = false;
        left_invalid = false;
        right_invalid = false;
        middle_invalid = false;
        leftClickWithShift = false;
        left_count = 0;
        right_count = 0;
        double_count = 0;
        ces_count = 0;
        reset_begin = true;
        path = 0;
        log("重开布雷");
        for (const i in this.childObject) {
            this.childObject[i].changeStyle("block");
            this.childObject[i].isOpen = false;
            this.childObject[i].is_bv = true;
        }
    } else {
        log('重新布雷无效');
    }
};

function Direction() {
    this.up = null;
    this.right = null;
    this.down = null;
    this.left = null;
    this.leftUp = null;
    this.rightUp = null;
    this.leftDown = null;
    this.rightDown = null;
}

function Block(className, id) {
    this.neighbors = new Direction();
    this.root = null;
    this.isBomb = false;
    this.bombNumAround = -1;
    this.className = className;
    this.id = id;
    this.isOpen = false;
    this.is_bv = true;
    this.init();
}

Block.prototype.calcBombAround = function () {
    if (!this.isBomb) {
        let a = 0;
        for (const key in this.neighbors) {
            if (this.neighbors.hasOwnProperty(key)) {
                const neighbor = this.neighbors[key];
                if (null != neighbor && typeof neighbor !== "function" && neighbor.isBomb) {
                    a++;
                }
            }
        }
        this.bombNumAround = a;
    }
};

const EventUtil = {};
EventUtil.addEvent = function (a, b, c) {
    if (a.addEventListener) {
        a.addEventListener(b, c, false);
    } else if (a.attachEvent) {
        a.attachEvent("on" + b, c);
    } else {
        a["on" + b] = c;
    }
};
EventUtil.removeEvent = function (a, b, c) {
    if (a.removeEventListener) {
        a.removeEventListener(b, c, false);
    } else if (a.detachEvent) {
        a.detachEvent("on" + b, c);
    } else {
        a["on" + b] = null;
    }
};

Block.prototype.init = function () {
    const that = this;
    this.root = document.createElement("div");

    EventUtil.addEvent(this.root, "mouseover", function (a) {
            if (gameover === true) {
                return false;
            }
            if (that.isOpen === false && rightClick === false && leftClick === true) {
                if (that.getStyle() === "block" && left_invalid === false) {
                    that.changeStyle("opening");
                }
            } else if (rightClick === true && leftClick === true) {
                that.change_around_opening();
            } else if (middle_invalid === true) {
                that.change_around_opening();
            }
        }
    );
    EventUtil.addEvent(this.root, "mouseout", function (a) {
            if (gameover === true) {
                return false;
            }
            if (that.isOpen === false && leftClick === true && rightClick === false) {
                if (that.getStyle() === "opening") {
                    that.changeStyle("block");
                }
            } else if (rightClick === true && leftClick === true) {
                that.change_around_normal();
            } else if (middle_invalid === true) {
                that.change_around_normal();
            }
        }
    );

    EventUtil.addEvent(this.root, "mousedown", function (a) {
            if (gameover === true) {
                return false;
            }
            that.change_around_normal();//复原因为中键改变的block样式
            changeFaceClass("face_click");
            if (a.button === 0) {
                if (rightClick === true) {
                    left_invalid = true;
                    that.change_around_opening();
                } else if (that.getStyle() === "block") {
                    that.changeStyle("opening");
                }
            } else if (a.button === 2) {
                if (leftClick === true) {
                    left_invalid = true;
                    that.change_around_opening();
                } else {
                    right_count++;

                    if (that.getStyle() === "openedBlockBomb") {
                        if (question === false) {
                            ces_count++;
                            that.changeStyle("block");
                            changeTopCount("mine_count", container.minenumber = container.minenumber + 1);
                        } else {
                            ces_count++;
                            that.changeStyle("question");
                            changeTopCount("mine_count", container.minenumber = container.minenumber + 1);
                        }
                    } else if (that.getStyle() === "block") {
                        ces_count++;
                        that.changeStyle("openedBlockBomb");
                        changeTopCount("mine_count", container.minenumber = container.minenumber - 1);
                    } else if (that.getStyle() === "question") {
                        ces_count++;
                        that.changeStyle("block");
                    } else {
                        right_invalid = true;
                    }

                }
            } else if (a.button === 1) {
                middle_invalid = true;
                that.change_around_opening();
            }
        }
    );

    EventUtil.addEvent(this.root, "mouseup", function (a) {
            if (gameover === true) {
                return false;
            }
            if (reset_begin === true) {
                reset_begin = false;
                start();
            }
            changeFaceClass("face_normal");
            if (a.button === 0) {
                if (rightClick === true) {
                    that.change_around_normal();
                    double_count++;
                    if (right_invalid === true) {
                        right_count--;
                        right_invalid = false;
                    }
                } else if (left_invalid === false) {
                    left_count++;
                }
                if (that.isOpen === false && rightClick === false && (that.getStyle() === "opening" || that.getStyle() === "question")) {
                    if (firstclick === true) {
                        firstclick = false;
                        container.setMine(that.id);
                        start();
                    } else {
                        that.open();
                    }
                } else if (rightClick === true && that.isOpen === true && that.bombNumAround > 0) {
                    that.openaround();
                }
                left_invalid = false;
            } else if (a.button === 2) {
                if (leftClick === true) {
                    double_count++;
                    if (right_invalid === true) {
                        right_count--;
                    }
                    that.change_around_normal();
                    if (that.isOpen === true && that.bombNumAround > 0) {
                        that.openaround();
                    }
                }
                right_invalid = false;
            } else if (a.button === 1) {
                middle_invalid = false;
                that.change_around_normal();
                that.openaround();
            }
        }
    );
    this.root.setAttribute("class", "block");
    this.root.setAttribute("id", that.id);
    this.changeStyle(this.className);
};

Block.prototype.changeStyle = function (className) {
    this.root.setAttribute("class", className);
};

Block.prototype.change_around_opening = function () {
    if (null != this && typeof (this) != "undefined" && !this.isOpen && this.getStyle() === "block") {
        this.changeStyle("opening");
    }
    const a = [];
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (let i = 0; i < a.length; i++) {
        const neighbor = this.neighbors[a[i]];
        if (null != neighbor && typeof (neighbor) != "undefined" && !neighbor.isOpen && neighbor.getStyle() === "block") {
            neighbor.changeStyle("opening");
        }
    }
};

Block.prototype.change_around_normal = function () {
    if (null != this && typeof (this) != "undefined" && !this.isOpen && this.getStyle() === "opening") {
        this.changeStyle("block");
    }
    const a = [];
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (let i = 0; i < a.length; i++) {
        const neighbor = this.neighbors[a[i]];
        if (null != neighbor && typeof (neighbor) != "undefined" && !neighbor.isOpen && neighbor.getStyle() === "opening") {
            neighbor.changeStyle("block");
        }
    }
};

Block.prototype.getStyle = function () {
    let a = this.root.getAttribute("class");
    if (a == null || typeof (a) == "undefined") {
        a = this.root.getAttribute("className")
    }
    return a;
};

Block.prototype.open = function () {
    ces_count++;
    if (this.bombNumAround === 0) {
        this.changeStyle("opening");
    } else if (this.bombNumAround > 0) {
        this.changeStyle("number_" + this.bombNumAround);
    } else {
        stop();
        this.changeStyle("firstbomb");

        //You Lose!
        lose();
        changeFaceClass("face_cry");
    }
    this.isOpen = true;
    if (this.bombNumAround === 0) {
        const a = [];
        a.push("up");
        a.push("right");
        a.push("down");
        a.push("left");
        a.push("leftUp");
        a.push("rightUp");
        a.push("leftDown");
        a.push("rightDown");
        for (let i = 0; i < a.length; i++) {
            const neighbor = this.neighbors[a[i]];
            if (null != neighbor && typeof (neighbor) != "undefined" && !neighbor.isBomb && !neighbor.isOpen && neighbor.getStyle() !== "openedBlockBomb" && neighbor.getStyle() !== "question") {
                neighbor.open();
                ces_count--;
            }
        }
    }
    this.win();//放在最后面，防止ces_count满足--条件时未--
};

Block.prototype.openaround = function () {
    let count = 0;
    let flag = false;
    const a = [];
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (let i = 0; i < a.length; i++) {
        const neighbor = this.neighbors[a[i]];
        if (null != neighbor && typeof (neighbor) != "undefined" && !neighbor.isOpen && neighbor.getStyle() === "openedBlockBomb")
            count++;
    }
    if (count === this.bombNumAround) {
        for (let i = 0; i < a.length; i++) {
            const neighbor = this.neighbors[a[i]];
            if (null != neighbor && typeof (neighbor) != "undefined" && !neighbor.isOpen && neighbor.getStyle() !== "openedBlockBomb" && neighbor.getStyle() !== "bomb") {
                neighbor.around_open();
                ces_count--;
                flag = true;
            }
        }
        if (flag === true) {
            ces_count++;
        }
    }
    this.win();
};

//跟open()的区别在于没有进行是否胜利的判断
//在openaround()的操作时win()应该在所有格子遍历完成后进行
//否则ces_count可能在stop()之后才完成计数，导致计数错误
//没加标识变量判断那是因为只有此处特殊处理，没必要在别的地方多次初始化
Block.prototype.around_open = function () {
    ces_count++;
    if (this.bombNumAround === 0) {
        this.changeStyle("opening");
    } else if (this.bombNumAround > 0) {
        this.changeStyle("number_" + this.bombNumAround);
    } else {
        stop();
        this.changeStyle("firstbomb");

        //You Lose!
        lose();
        changeFaceClass("face_cry");
    }
    this.isOpen = true;
    if (this.bombNumAround === 0) {
        const a = [];
        a.push("up");
        a.push("right");
        a.push("down");
        a.push("left");
        a.push("leftUp");
        a.push("rightUp");
        a.push("leftDown");
        a.push("rightDown");
        for (let i = 0; i < a.length; i++) {
            const neighbor = this.neighbors[a[i]];
            if (null != neighbor && typeof (neighbor) != "undefined" && !neighbor.isBomb && !neighbor.isOpen && neighbor.getStyle() !== "openedBlockBomb") {
                neighbor.open();
                ces_count--;
            }
        }
    }
};

function lose() {
    if (gameover === true && video !== 0) {
        path = parseInt(video[size - 1].path);
    }
    gameover = true;
    const parent = document.getElementById("container");
    for (let i = 0; i < container.childObject.length; i++) {
        const className = container.childObject[i].root.className;
        if (className === "block" && container.childObject[i].isBomb === true) {
            parent.childNodes[i].className = "bomb";
        } else if (className === "openedBlockBomb" && container.childObject[i].isBomb === false) {
            parent.childNodes[i].className = "wrongflag";
        }
    }
    write_counters();
}

Block.prototype.win = function () {
    const type = document.getElementById('container').getElementsByTagName("div");
    let count = 0;
    for (let i = 0; i < type.length; i++) {
        const a = type[i].className;
        if (a === "opening" || a.startsWith("number_")) {
            count++;
        }
    }
    if (count === container.rows * container.columns - container.bombNumber) {
        stop();
        changeFaceClass("face_sunglasses");
        if (gameover === true && video !== 0) {
            path = parseInt(video[size - 1].path);
        }
        gameover = true;
        log("You Win!");
        const parent = document.getElementById("container");
        for (let i = 0; i < container.childObject.length; i++) {
            const className = container.childObject[i].root.className;
            if (className === "block" || className === "question") {
                parent.childNodes[i].className = "openedBlockBomb";
            }
        }
        write_counters();
    }
}

/**
 * 设置是否启用问号模式
 *
 * @param {boolean} questionMode 是否启用问号模式
 * @todo 设置菜单栏文本显示（如果需要显示菜单栏问号模式选项的话）
 */
function setQuestionMode(questionMode) {
    question = questionMode;
}

/**
 * 切换问号模式启用状态
 */
function toggleQuestionMode() {
    setQuestionMode(!question);
    log('切换问号模式为：' + question)
}

document.onmousedown = function () {
    if (gameover === false) {
        if (event.button === 0) {
            leftClick = true;
        }
        if (event.button === 2) {
            rightClick = true;
        }
    }
}
document.onmouseup = function () {
    if (gameover === false) {
        if (event.button === 0) {
            leftClick = false;
        }
        if (event.button === 2) {
            rightClick = false;
        }
    }
}

// 界面初始化
const container = new Container(8, 8, 10);
container.init(1);
document.getElementById("containers").appendChild(container.html);
document.getElementById("container").style = "width:128px;height:128px;";
container.add_mark();

// Handling resize events
parent.window.addEventListener("parentResize", function () {
    adjustLayout();
});

let results = ""; // 录像解析后的 RAW 格式结果
let video = [];//全部鼠标事件
const fade = 500;//淡入淡出时间

function loadVideo(url) {
    clear(); // 清空控制台日志
    log(`录像路径: '${url}'`);
    time("录像准备");
    results = null;
    const request = new XMLHttpRequest();
    const type = url.substring(url.lastIndexOf('.'), url.length);
    // TODO 先对文件后缀进行判断，不符合条件则直接报错
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.url = url;
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                timeLog("录像准备", "请求录像文件资源");
                const uint8Array = new Uint8Array(request.response);
                try {
                    switch (type) {
                        case ".txt":
                        case ".rawvf":
                            ready();
                            playRawVideo(new TextDecoder('windows-1251').decode(uint8Array));
                            break;
                        case ".avf":
                        case ".mvf":
                        case ".rmv":
                            if (runtimeInitialized) {
                                log('Emscripten 的 Runtime 已准备完成')
                                Module.ccall('parser_' + type.replace(".", ""), 'null', ['number', 'array'], [uint8Array.length, uint8Array]);
                            } else {
                                // 等待 Emscripten 的 Runtime 准备完成
                                log('等待 Emscripten 的 Runtime 准备完成')
                                Module.onRuntimeInitialized = function () {
                                    log('Emscripten 的 Runtime 已准备完成')
                                    Module.ccall('parser_' + type.replace(".", ""), 'null', ['number', 'array'], [uint8Array.length, uint8Array]);
                                };
                            }
                            break;
                        default:
                            videoError(i18n.errFormatPre + type + i18n.errFormatPost);
                    }
                } catch (e) {
                    // 正常解析代码退出程序不额外进行处理
                    if (e.name !== "ExitStatus") {
                        error(e);
                        videoError(e.toString());
                    }
                }
            } else {
                // 录像读取错误，弹出提示信息
                videoError(i18n.errRequest + request.status);
            }
        }
    };
    request.send();
}

Module.onProgress = function (result) {
    results += result;
}

Module.onSuccess = function () {
    timeLog("录像准备", "解析录像文件");
    ready();
    playRawVideo(results);
}

Module.onError = function (errCode, _errMsg) {
    switch (errCode) {
        case 1:
            videoError(i18n.errParserTooLarge)
            break
        case 2:
            videoError(i18n.errParserUnexpectedEnd)
            break
        case 3:
            videoError(i18n.errParserInvalidFile)
            break
        case 4:
            videoError(i18n.errParserInvalidEvent)
            break
        case 5:
            videoError(i18n.errParserInvalidVideoType)
            break
        case 6:
            videoError(i18n.errParserInvalidBoardSize)
            break
        case 7:
            videoError(i18n.errParserInvalidVideoHeader)
            break
        case 8:
            videoError(i18n.errParserInvalidMinePosition)
            break
        default:
            videoError(i18n.errParserUnknown)
            break
    }
}

function ready() {
    $('#video-stage', parent.document).fadeIn(fade);
    $('#video-iframe', parent.document).fadeIn(fade, function () {
        pauseVideo();
        pauseVideo();//走遍两个分支
    });
}

//录像播放错误
function videoError(message) {
    alert(message);
    exitVideo();
}

/**
 * 退出录像播放
 */
function exitVideo() {
    container.init(0);
    $('#video-stage', parent.document).fadeOut(0);
    $('#video-iframe', parent.document).fadeOut(0);
}

/**
 * 播放 RAW 格式（.txt）录像
 *
 * @param result 文件内容
 * @todo 优化录像解析逻辑，用三次正则先将数据进行分类
 * @todo 判断参数合法性，如：player、宽高和雷的数量
 */
function playRawVideo(result) {
    reset();
    video = [];
    timeLog("录像准备", "重置数据");
    const rawArray = result.split("\n");
    const data = {};
    const eventReg = /^-?\d+\.\d+[ ]+(mv|sc|mt|[lrm][cr])[ |\d]+\([ ]*\d+[ ]*\d+[ ]*\)([ ]*\(l?r?m?\))?$/; // 点击和移动事件数据，中间可能没有当前所在行和列的数据
    const normalReg = /^[a-zA-Z_]+?[:][ ]*.*\S$/; // 普通键值对数据
    const boardReg = /^[*0]+$/; // 雷的分布数据
    let count = 0; // 当前事件数
    // 逐行读取数据，同一类型的数据可以不用放到一起
    for (let i = 0; i < rawArray.length; i++) {
        let row = rawArray[i].trim(); // 去除前后空格的单行数据
        // 事件数据一般是最多的，优先进行判断
        if (eventReg.test(row)) {
            const strings = row.replace(/\(l?r?m?\)|[()]/g, "").replace(/[ ]{2,}|\./g, " ").trim().split(" ")
            const previous = video[count - 1]; // 前一个录像事件
            const x = parseInt(strings[strings.length - 2]); // 倒数第二个数据是 x 坐标
            const y = parseInt(strings[strings.length - 1]); // 倒数第一个数据是 y 坐标
            const path = count > 0 ? previous.path + Math.pow((Math.pow(x - previous.x, 2) + Math.pow(y - previous.y, 2)), 0.5) : 0;
            video[count++] = {
                sec: parseInt(strings[0]),
                hun: parseInt(strings[1].substring(0, 2)), // 最多只保留前两位数字
                mouse: strings[2],
                rows: parseInt(x / 16) + 1, // 可能有记录，可能没记录，干脆自己计算了
                columns: parseInt(y / 16) + 1,
                x: x,
                y: y,
                path: path,
            }
        }
        // 然后判断是否属于普通键值对数据
        else if (normalReg.test(row)) {
            data[row.substring(0, row.indexOf(":"))] = row.substring(row.indexOf(":") + 1, row.length).trim();
        }
        // 最后判断是否是雷的分布数据
        else if (boardReg.test(row)) {
            data["Board"] = data["Board"] ? data["Board"] + row : row;
        }
    }

    if ("beginner" === data["Level"].toLowerCase()) {
        video[0].level = 1;
    } else if ("intermediate" === data["Level"].toLowerCase()) {
        video[0].level = 2;
    } else if ("expert" === data["Level"].toLowerCase()) {
        video[0].level = 3;
    } else if ("custom" === data["Level"].toLowerCase()) {
        video[0].level = 4;
    } else {
        throw(`不支持的游戏级别: ${data["Level"]}`);
    }

    video[0].board = [...data["Board"]];
    video[0].player = data["Player"] || 'Anonymous';
    video[0].realtime = (video[video.length - 1].sec * 100 + video[video.length - 1].hun) / 100; // 可能没有 Time 字段数据
    video[0].size = count;
    video[0].question = data["Marks"] && data["Marks"].toLowerCase() === "on";
    video_invalid = false;

    timeLog("录像准备", "解析 RAW 数据");

    container.init(video[0].level, parseInt(data["Width"]), parseInt(data["Height"]), parseInt(data["Mines"]));
    timeLog("录像准备", "录像初始化");

    container.setVideoMines(video[0].board); // 按录像布雷
    start_avf(video);
}

// var direction = "onorientationchange" in window ? "orientationchange" : "resize";
// 代码中监测旋转是用了onorientationchange 函数
// 但是在一些APP或游戏内嵌页面会有该函数不会执行
// orientation获取不到的情况
// 所以如果是内嵌页建议使用resize事件
// 检查宽高变化来检测屏幕是否旋转
// 暂不使用resize,避免调整窗口大小时重复background_reload()
window.addEventListener("orientationchange", function () {
    log('屏幕：' + window.orientation + '度');
    // background_reload();
    if (window.orientation === 90 || window.orientation === -90) {
        document.getElementsByTagName("meta")[1]["content"] = ('width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0');
    } else if (container.level === 3) {
        document.getElementsByTagName("meta")[1]["content"] = ('width=device-width, initial-scale=1, user-scalable=no, minimum-scale=' + window.screen.width / 640 + ', maximum-scale=' + window.screen.width / 640 + '');
    }
}, false);

// 暴露全局变量和方法
window.container = container
window.loadVideo = loadVideo
window.pauseVideo = pauseVideo
window.exitVideo = exitVideo
window.replayVideo = replayVideo
window.changeSpeed = changeSpeed
window.resetSpeed = resetSpeed
window.changeRate = changeRate
window.changeRateValue = changeRateValue
window.changeFaceClass = changeFaceClass
window.handleFaceMouseOut = handleFaceMouseOut
window.changeControlClass = changeControlClass