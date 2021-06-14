"use strict";

let results = ""; // 录像解析后的 RAW 格式结果
let video = [];//全部鼠标事件
let number = 0;//字符读取进度
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
        pause_avf();
        pause_avf();//走遍两个分支
    });
}

//录像播放错误
function videoError(message) {
    alert(message);
    exitVideo();
}

//结束录像播放并退出录像查看
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
            const strings = row.replaceAll(/\(l?r?m?\)|[()]/g, "").replaceAll(/[ ]{2,}|\./g, " ").trim().split(" ")
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
    video[0].player = data["Player"];
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