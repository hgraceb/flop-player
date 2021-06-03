"use strict";

//时间
//初始化变量
var second = 0;//秒
var millisecond = 0;//毫秒
var int;//定时器
var begintime = new Date();//开始时间
var speed = 1.00;//录像播放速度
var last_second = 0;//暂停前的second
var last_millisecond;//暂停前的milllisecond
var plan = 0;//模拟事件进度
var stoptime = 0;//当前时间
var stop_minutes = 0;
var stop_seconds = 0;
var stop_milliseconds = 0;
var current = 0;//当前block
var front = 0;//前一个block
var size = 0;//录像事件总长度
var video_play = false;//change_speed函数中防止多次重置定时器
var game_level = 0;//判断弹窗位置，只用了一次，可以考虑化简

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
    begintime = new Date();
    window.clearInterval(int);
    int = setInterval(timer, 10);
    log("start:" + begintime.getMinutes() + '.' + begintime.getSeconds() + '.' + begintime.getMilliseconds());

}

function timer()//计时函数
{
    var stoptime = new Date();
    var stop_minutes = stoptime.getMinutes();
    var stop_seconds = stoptime.getSeconds();
    var stop_milliseconds = stoptime.getMilliseconds();
    if (stop_milliseconds < begintime.getMilliseconds()) {
        stop_milliseconds += 1000;
        stop_seconds--;
    }
    if (stop_seconds < begintime.getSeconds()) {
        stop_seconds += 60;
        stop_minutes--;
    }
    if (stop_minutes < begintime.getMinutes()) {
        stop_minutes += 60;
    }
    second = (stop_minutes - begintime.getMinutes()) * 60 + (stop_seconds - begintime.getSeconds());
    millisecond = parseInt((stop_milliseconds - begintime.getMilliseconds()) / 10);
    if (second < 999) {
        change_top_count("time_count", second + 1);

        document.getElementById('RTime').innerText = (second + millisecond / 100).toFixed(2);
        document.getElementById('Ces').innerText = ces_count + '@' + (ces_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Left').innerText = left_count + '@' + (left_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Right').innerText = right_count + '@' + (right_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Double').innerText = double_count + '@' + (double_count / (second + millisecond / 100)).toFixed(2);
        document.getElementById('Cl').innerText = (left_count + right_count + double_count) + '@' + ((left_count + right_count + double_count) / (second + millisecond / 100)).toFixed(2);

    } else if (second > 999) {
        stop();
        lose();
        change_top_count("time_count", 999);
        document.getElementById('RTime').innerText = 999.99;
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
    const innerWidth = parent.window.innerWidth - scrollbarWidth;
    const innerHeight = parent.window.innerHeight - scrollbarWidth;
    let top = 0;
    let left = 0;
    if (game_level === 3) {
        top = (innerHeight - 412) / 2;
        left = (innerWidth - 644) / 2;
    } else if (game_level === 2) {
        top = (innerHeight - 412) / 2;
        left = (innerWidth - 475) / 2;
    } else if (game_level === 1) {
        top = (innerHeight - 393) / 2;
        left = (innerWidth - 475) / 2;
    }
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
    log(video)
    if (video == 0) {
        return false;
    }
    $('#mark_span').html(video[0].player);
    $('#mark_span').attr('title', $('#mark_span').html());
    gameover = true;
    size = video[0].size;
    // for(i=0;i<1;i++){
    // 	log(video[i]);
    // }


    if (!document.getElementById("mouse_point")) {
        //别再手贱删了，mouse_point放这才能正常初始化container的block
        var div = document.createElement("div");
        div.id = "mouse_point";
        var grandparent = document.getElementById("container");
        grandparent.appendChild(div);
        var img = document.createElement("img");
        img.src = "image/mouse.png";
        var parent = document.getElementById("mouse_point");
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
    begintime = 0;//开始时间
    last_second = 0;
    last_millisecond = 0;
    plan = 0;//模拟点击进度
    stoptime = 0;//当前时间
    stop_minutes = 0;
    stop_seconds = 0;
    stop_milliseconds = 0;
    current = 0;//当前block
    front = 0;//前一个block
    video_play = true;
}

function pause_avf() {//暂停
    if (begintime != 0) {
        video_play = false;
        window.clearInterval(int);
        begintime = 0;
        last_millisecond = millisecond;
        last_second = second;
    } else if (document.getElementById("mouse_point") && plan < size) {
        video_play = true;
        window.clearInterval(int);
        int = setInterval(timer_avf, 0);
    }
}

function restart_avf() {//回访
    if (video == 0) {
        return false;
    }
    if (gameover == true && begintime == 0 && plan < video[0].size) {
        video_play = true;
        window.clearInterval(int);
        int = setInterval(timer_avf, 0);
        log(plan);
    } else {
        container.replay_video();
    }
}

function change_speed() {//改变速度
    var value = $('#range_speed').val();
    var valStr = value + "% 100%";
    if (video_play == true) pause_avf();
    speed = (value <= 50 ? value / 50 : (value <= 75 ? (value - 50) * 0.16 + 1 : (value - 75) * 0.2 + 5)).toFixed(2);
    // restart_avf();
    // $('#speed_value').html(value+'-'+speed+'x');  
    $('#speed_value').html(speed + 'x');
    $('#range_speed').css({
        "background-size": valStr
    })
    if (video_play == false) pause_avf();
}

function reset_speed() {//复位速度为1
    var valStr = 50 + "% 100%";
    if (video_play == true) pause_avf();
    speed = 1;
    $('#speed_value').html('1.00x');
    $('#range_speed').val(50);
    $('#range_speed').css({
        "background-size": valStr
    })
    if (video_play == false) pause_avf();
}

function change_rate_value() {//改变进度条的value
    var value = $('#range_rate').val();
    var valStr = value / 10 + "% 100%";
    if (video_play == true) pause_avf();
    if (video != 0) $('#rate_value').html((value / 1000 * video[0].realtime).toFixed(2));
    $('#range_rate').css({
        "background-size": valStr
    })
}

function change_rate() {//改变播放进度
    var value = $('#rate_value').text();
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
    if (begintime == 0) {
        begintime = new Date();
    }
    stoptime = new Date();
    stop_minutes = stoptime.getMinutes();
    stop_seconds = stoptime.getSeconds();
    stop_milliseconds = stoptime.getMilliseconds();
    if (stop_milliseconds < begintime.getMilliseconds()) {
        stop_milliseconds += 1000;
        stop_seconds--;
    }
    if (stop_seconds < begintime.getSeconds()) {
        stop_seconds += 60;
        stop_minutes--;
    }
    if (stop_minutes < begintime.getMinutes()) {
        stop_minutes += 60;
    }
    second = speed * ((stop_minutes - begintime.getMinutes()) * 60 + (stop_seconds - begintime.getSeconds())) + last_second;
    millisecond = speed * (parseInt((stop_milliseconds - begintime.getMilliseconds()) / 10)) + last_millisecond;
    if ((second * 1000 + millisecond * 10) > video[0].realtime * 1000) {//高倍速时间有延迟，自欺欺人解决法
        second = video[size - 1].sec;
        millisecond = video[size - 1].hun;
        log('录像实际时间:' + second + '.' + millisecond);
    }

    while (plan < size && (second * 1000 + millisecond * 10) >= (video[plan].sec * 1000 + video[plan].hun * 10)) {
        document.getElementById('mouse_point').style.marginLeft = video[plan].x + 'px';
        document.getElementById('mouse_point').style.marginTop = video[plan].y + 'px';
        // document.getElementById('Path').innerText=parseInt(video[plan].path);
        if (video[plan].rows > container.columns || video[plan].columns > container.rows) {
            //mvf录像x和y可能会超出界面范围
            //若超出则只进行鼠标指针操作并退出此次循环
            if (current != 0) current.change_around_normal();//越界时先判断current是否初始化
            if (video[plan].mouse === "lc" || video[plan].mouse === 3) {//lc
                leftClick = true;
                if (rightClick == true) {
                    left_invalid = true;
                }
            } else if (video[plan].mouse === "rc" || video[plan].mouse === 9) {//rc
                rightClick = true;
                if (leftClick == true) {
                    left_invalid = true;
                } else {
                    right_invalid = true;
                }
            } else if (video[plan].mouse === "lr" || video[plan].mouse === 5 || video[plan].mouse === 21) {//lr
                leftClick = false;
                if (rightClick == true) {
                    if (right_invalid == true) {
                        right_invalid = false;
                    }
                }
                left_invalid = false;
            } else if (video[plan].mouse === "rr" || video[plan].mouse === 17 || video[plan].mouse === 145) {//rr
                rightClick = false;
                right_invalid = false;
            } else if (video[plan].mouse === "mc" || video[plan].mouse === 33) {//mc
                middle_invalid = true;
            } else if (video[plan].mouse === "mr" || video[plan].mouse === 65 || video[plan].mouse === 193) {//mr
                middle_invalid = false;
            }
            // log(111);
            plan++;
            continue;
        }
        front = current;
        current = container.childObject[(video[plan].columns - 1) * container.columns + (video[plan].rows - 1)];

        // 不需要判断 video[plan].mouse==1，只要前后两个方块位置不同即认为有进行移动
        // 如 0.00 时间内的移动事件（mv）没有被记录在录像信息当中，但是可能进行过移动
        if (front != current) {//mv

            //此判断要在下句判断之前
            //避免执行中键操作时current.change_around_opening()操作之后
            //又执行了front.change_around_normal()导致block样式错误
            if (front != 0) {
                if (front.isOpen == false && leftClick == true && rightClick == false) {
                    if (front.getStyle() == "opening") {
                        front.changeStyle("block");
                    }
                } else if (rightClick == true && leftClick == true) {
                    front.change_around_normal();
                } else if (middle_invalid == true) {
                    front.change_around_normal();
                }
            }

            if (current.isOpen == false && rightClick == false && leftClick == true) {
                if (current.getStyle() == "block" && left_invalid == false) {
                    current.changeStyle("opening");
                }
            } else if (rightClick == true && leftClick == true) {
                current.change_around_opening();
            } else if (middle_invalid == true) {
                current.change_around_opening();
            }
        }

        if (video[plan].mouse === "mv" || video[plan].mouse === 1) {//mv
            // 空语句，移动事件在前面已经处理过，如果是移动事件则无需进行后面的判断
        } else if (video[plan].mouse === "lc" || video[plan].mouse === 3) {//lc
            leftClick = true;
            current.change_around_normal();//复原因为中键改变的block样式
            change_top_image("face", "face_click");
            if (rightClick == true) {
                left_invalid = true;
                current.change_around_opening();
            } else if (current.getStyle() == "block" && plan != 0) {//很迷的判定，下面对应的还要有k==1
                current.changeStyle("opening");
            }
        } else if (video[plan].mouse === "rc" || video[plan].mouse === 9) {//rc
            rightClick = true;
            current.change_around_normal();//复原因为中键改变的block样式
            change_top_image("face", "face_click");
            if (leftClick == true) {
                left_invalid = true;
                current.change_around_opening();
            } else {
                right_count++;
                if (current.getStyle() == "openedBlockBomb") {
                    if (question == false) {
                        ces_count++;
                        current.changeStyle("block");
                        change_top_count("mine_count", container.minenumber = container.minenumber + 1);
                    } else {
                        ces_count++;
                        current.changeStyle("question");
                        change_top_count("mine_count", container.minenumber = container.minenumber + 1);
                    }
                } else if (current.getStyle() == "block") {
                    ces_count++;
                    current.changeStyle("openedBlockBomb");
                    change_top_count("mine_count", container.minenumber = container.minenumber - 1);
                } else if (current.getStyle() == "question") {
                    ces_count++;
                    current.changeStyle("block");
                } else {
                    right_invalid = true;
                }
            }
        } else if (video[plan].mouse === "lr" || video[plan].mouse === 5 || video[plan].mouse === 21) {//lr
            leftClick = false;
            change_top_image("face", "face_normal");
            if (rightClick == true) {
                current.change_around_normal();
                double_count++;
                if (right_invalid == true) {
                    right_count--;
                    right_invalid = false;
                }
            } else if (left_invalid == false) {
                left_count++;
            }
            if (current.isOpen == false && rightClick == false) {
                //当lr事件直接出现在方块上时，方块没有经过mv事件变为"opening"样式，此时若left_invalid为false也需要打开方块
                if (current.getStyle() == "opening" || (current.getStyle() == "block" && !left_invalid) || plan == 1 || plan == 2) {
                    //同样是很迷的判定
                    //avf可能第二个操作时lr（plan==1）
                    //mvf可能第三个操作是lr（plan==2）
                    current.open();
                }
            } else if (rightClick == true && current.isOpen == true && current.bombNumAround > 0) {
                current.openaround();
            }
            left_invalid = false;
        } else if (video[plan].mouse === "rr" || video[plan].mouse === 17 || video[plan].mouse === 145) {//rr
            rightClick = false;
            change_top_image("face", "face_normal");
            if (leftClick == true) {
                double_count++;
                if (right_invalid == true) {
                    right_count--;
                }
                current.change_around_normal();
                if (current.isOpen == true && current.bombNumAround > 0) {
                    current.openaround();
                }
            }
            right_invalid = false;
        } else if (video[plan].mouse === "mc" || video[plan].mouse === 33) {//mc
            middle_invalid = true;
            current.change_around_opening();
        } else if (video[plan].mouse === "mr" || video[plan].mouse === 65 || video[plan].mouse === 193) {//mr
            middle_invalid = false;
            double_count++;
            current.change_around_normal();
            if (current.isOpen == true && current.bombNumAround > 0) {
                current.openaround();
            }
        }
        plan++;
    }

    document.getElementById('rate_value').innerText = (second + millisecond / 100).toFixed(2);
    document.getElementById('range_rate').value = (((second + millisecond / 100) / video[0].realtime).toFixed(2)) * 1000;
    document.getElementById('range_rate').style = "background-size: " + (((second + millisecond / 100) / video[0].realtime).toFixed(2)) * 100 + "% 100%;";

    change_top_count("time_count", parseInt(second) + 1);
    document.getElementById('RTime').innerText = (second + millisecond / 100).toFixed(2);

    counters_3BV();
    document.getElementById('Ces').innerText = ces_count + '@' + (ces_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Right').innerText = right_count + '@' + (right_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Left').innerText = left_count + '@' + (left_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Flags').innerText = container.bombNumber - container.minenumber;
    document.getElementById('Double').innerText = double_count + '@' + (double_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Cl').innerText = (left_count + right_count + double_count) + '@' + ((left_count + right_count + double_count) / (second + millisecond / 100)).toFixed(2);


    if (second > video[size - 1].sec + 2) {//简单的出错处理,可能出现错误判断导致录像中断的bug，2秒为容错值
        log(second + '.' + speed + '.' + second / speed);
        log("录像播放错误");
        stop();
    }
}

function stop()//暂停函数
{
    window.clearInterval(int);
    var stoptime = new Date();
    log("stop:" + stoptime.getMinutes() + '.' + stoptime.getSeconds() + '.' + stoptime.getMilliseconds());
    var stop_minutes = stoptime.getMinutes();
    var stop_seconds = stoptime.getSeconds();
    var stop_milliseconds = stoptime.getMilliseconds();
    if (stop_milliseconds < begintime.getMilliseconds()) {
        stop_milliseconds += 1000;
        stop_seconds--;
    }
    if (stop_seconds < begintime.getSeconds()) {
        stop_seconds += 60;
        stop_minutes--;
    }
    if (stop_minutes < begintime.getMinutes()) {
        stop_minutes += 60;
    }
    log('运行时间:' + ((stop_minutes - begintime.getMinutes()) * 60 + (stop_seconds - begintime.getSeconds()) + (stop_milliseconds - begintime.getMilliseconds()) / 1000).toFixed(2));
    // second=(stop_minutes-begintime.getMinutes())*60+(stop_seconds-begintime.getSeconds());
    // millisecond=parseInt((stop_milliseconds-begintime.getMilliseconds())/10);
}


function change_top_image(id, name)//修改顶部笑脸背景
{
    document.getElementById(id).getElementsByTagName("img")[0].src = "image/" + name + ".bmp";
}

function change_control_image(count, name)//修改顶部笑脸背景
{
    document.getElementById("video_control").getElementsByTagName("img")[count].src = "image/" + name + ".bmp";
}

function change_top_sunglasses() {//阻止face_sunglasses被强行改成face_normal
    var face = new Array();
    face = document.getElementById("face").getElementsByTagName("img")[0].src.split("/");
    if (face[face.length - 1] != "face_sunglasses.bmp") {
        document.getElementById("face").getElementsByTagName("img")[0].src = "image/face_normal.bmp";
    }
}

function change_top_count(id, count)//修改顶部计时器背景
{
    var a = parseInt(Math.abs(count) / 100) % 10;
    var b = parseInt((Math.abs(count) / 10)) % 10;
    var c = Math.abs(count) % 10;
    // log("count"+count+" a:"+a+" b:"+b+" c:"+c);
    var image = document.getElementById(id).getElementsByTagName("img");
    if (count < -10) {
        image[0].src = "image/number_minus.bmp";
        image[1].src = "image/number_" + b + ".bmp";
        image[2].src = "image/number_" + c + ".bmp";
    } else if (count < 0) {
        image[0].src = "image/number_minus.bmp";
        image[1].src = "image/number_0.bmp";
        image[2].src = "image/number_" + c + ".bmp";
    } else if (count < 10) {
        image[0].src = "image/number_0.bmp";
        image[1].src = "image/number_0.bmp";
        image[2].src = "image/number_" + c + ".bmp";
    } else if (count < 100) {
        image[0].src = "image/number_0.bmp";
        image[1].src = "image/number_" + b + ".bmp";
        image[2].src = "image/number_" + c + ".bmp";
    } else if (count < 1000) {
        image[0].src = "image/number_" + a + ".bmp";
        image[1].src = "image/number_" + b + ".bmp";
        image[2].src = "image/number_" + c + ".bmp";
    }
}

function counters_3BV() {//计算3BV
    var opening = 0;
    var bbbv = 0;
    var bbbv_done = 0;
    var opening_done = 0;
    var island = 0;
    var a = new Array();
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (var i = 0; i < container.columns * container.rows; i++) {
        if (container.childObject[i].bombNumAround == 0 && container.childObject[i].is_bv) {
            opening++;
            counters_Ops(container.childObject[i], a);
            container.childObject[i].is_bv = true;
        }
    }
    for (var i = 0; i < container.columns * container.rows; i++) {
        if (!container.childObject[i].isBomb && container.childObject[i].is_bv) {
            bbbv++;
            if (container.childObject[i].isOpen) {
                bbbv_done++;
                if (container.childObject[i].bombNumAround == 0) {
                    opening_done++;
                }
            }
        }
    }
    for (var i = 0; i < container.columns * container.rows; i++) {
        if (container.childObject[i].bombNumAround > 0 && container.childObject[i].is_bv) {
            island++;
            counters_Isls(container.childObject[i], a);
        }
    }
    document.getElementById('3BV').innerText = bbbv_done + '/' + bbbv;
    document.getElementById('Ops').innerText = opening_done + '/' + opening;
    document.getElementById('Isls').innerText = island;
    if (bbbv_done != 0) {
        document.getElementById('EstTime').innerText = (bbbv / (bbbv_done * 100 / (second * 100 + millisecond))).toFixed(2);
        document.getElementById('3BV/s').innerText = (bbbv_done * 100 / (second * 100 + millisecond)).toFixed(2);
        document.getElementById('RQP').innerText = ((second + millisecond / 100) * (second + millisecond / 100 + 1) / bbbv_done).toFixed(2);
        if (container.bombNumber == 10) {
            document.getElementById('STNB').innerText = (47.299 / (Math.pow(second + millisecond / 100, 1.7) / bbbv_done)).toFixed(2);
        } else if (container.bombNumber == 40) {
            document.getElementById('STNB').innerText = (153.73 / (Math.pow(second + millisecond / 100, 1.7) / bbbv_done)).toFixed(2);
        } else if (container.bombNumber == 99) {
            document.getElementById('STNB').innerText = (435.001 / (Math.pow(second + millisecond / 100, 1.7) / bbbv_done)).toFixed(2);
        }
        if (plan > 0) document.getElementById('Path').innerText = Math.round(video[plan - 1].path);
        document.getElementById('QG').innerText = (Math.pow(second + millisecond / 100, 1.7) / bbbv_done).toFixed(3);
        document.getElementById('Thrp').innerText = (bbbv_done / ces_count).toFixed(3);
        document.getElementById('Corr').innerText = (ces_count / (left_count + right_count + double_count)).toFixed(3);
        document.getElementById('IOE').innerText = (bbbv_done / (left_count + right_count + double_count)).toFixed(3);
    }
    for (var i = 0; i < container.columns * container.rows; i++) {
        container.childObject[i].is_bv = true;
    }
}

function counters_Ops(block, a) {//计算openings
    block.is_bv = false;
    for (var i = 0; i < a.length; i++) {
        var b = block.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && !b.isBomb && b.is_bv) {
            if (b.bombNumAround == 0) {
                counters_Ops(b, a);
            } else if (b.bombNumAround > 0) {
                b.is_bv = false;
            }
        }
    }
}

function counters_Isls(block, a) {//计算islands
    block.is_bv = false;
    for (var i = 0; i < a.length; i++) {
        var b = block.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && b.bombNumAround > 0 && b.is_bv) {
            counters_Isls(b, a);
        }
    }
}

function write_counters() {//重写counter
    counters_3BV();
    change_top_count("time_count", parseInt(second) + 1);
    document.getElementById('RTime').innerText = (second + millisecond / 100).toFixed(2);
    document.getElementById('Flags').innerText = container.bombNumber - container.minenumber;
    document.getElementById('Ces').innerText = ces_count + '@' + (ces_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Left').innerText = left_count + '@' + (left_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Right').innerText = right_count + '@' + (right_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Double').innerText = double_count + '@' + (double_count / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Cl').innerText = (left_count + right_count + double_count) + '@' + ((left_count + right_count + double_count) / (second + millisecond / 100)).toFixed(2);
    document.getElementById('Path').innerText = path;
}

function Mouse_event() {//记录鼠标事件
    this.sec = null;
    this.hun = null;
    this.mouse = null;
    this.rows = null;
    this.columns = null;
    this.x = null;
    this.y = null;
    this.path = null;
}

/**
 * 格式化两位数字
 */
function two_char(n) {//
    return n >= 10 ? n : "0" + n;
}

function question_marks() {//更改问号标记
    if (document.getElementById("question").innerHTML == '标记问号') {
        document.getElementById("question").innerHTML = '取消问号';
        question = true;
    } else if (document.getElementById("question").innerHTML == '取消问号') {
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