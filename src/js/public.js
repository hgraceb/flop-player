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
let video_play = false;//change_speed函数中防止多次重置定时器
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
        const img = document.createElement("img");
        img.src = "image/mouse.png";
        const parent = document.getElementById("mouse_point");
        parent.appendChild(img);
        parent.style.display = 'block';
        parent.style.marginLeft = video[0].x + 'px';
        parent.style.marginTop = video[0].y + 'px';
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

function pause_avf() {//暂停
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
function restart_avf() {
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

function change_speed() {//改变速度
    const $rangeSpeed = $('#range_speed');
    const value = $rangeSpeed.val();
    const valStr = value + "% 100%";
    if (video_play === true) pause_avf();
    speed = (value <= 50 ? value / 50 : (value <= 75 ? (value - 50) * 0.16 + 1 : (value - 75) * 0.2 + 5)).toFixed(2);
    $('#speed_value').html(speed + 'x');
    $rangeSpeed.css({
        "background-size": valStr
    })
    if (video_play === false) pause_avf();
}

function reset_speed() {//复位速度为1
    const valStr = 50 + "% 100%";
    if (video_play === true) pause_avf();
    speed = 1;
    $('#speed_value').html('1.00x');
    const $rangeSpeed = $('#range_speed');
    $rangeSpeed.val(50);
    $rangeSpeed.css({
        "background-size": valStr
    })
    if (video_play === false) pause_avf();
}

function change_rate_value() {//改变进度条的value
    const $rangeRate = $('#range_rate');
    const value = $rangeRate.val();
    const valStr = value / 10 + "% 100%";
    if (video_play === true) pause_avf();
    if (video !== 0) $('#rate_value').html((value / 1000 * video[0].realtime).toFixed(2));
    $rangeRate.css({
        "background-size": valStr
    })
}

function change_rate() {//改变播放进度
    const value = $('#rate_value').text();
    if (last_second * 1000 + last_millisecond * 10 < value * 1000) {
        last_second = parseInt(value);
        last_millisecond = value * 100 % 100;
        pause_avf();
    } else {
        container.replay_video();
        pause_avf();
        last_second = parseInt(value);
        last_millisecond = value * 100 % 100;
        pause_avf();
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