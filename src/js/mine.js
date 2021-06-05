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
    left_count = 0;
    right_count = 0;
    double_count = 0;
    ces_count = 0;
    path = 0;
    const exist = document.getElementById("container");
    if ((window.orientation === 0 || window.orientation === 180) && (level === 3 || (level === 0 && this.level === 3))) {//手机exp屏幕自适应
        document.getElementsByTagName("meta")[1]["content"] = ('width=device-width, initial-scale=1, user-scalable=no, minimum-scale=' + window.screen.width / 640 + ', maximum-scale=' + window.screen.width / 640 + '');
    } else {
        document.getElementsByTagName("meta")[1]["content"] = ('width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0');
    }
    if (exist != null) {
        if (document.getElementById("mouse_point")) {
            $("div#mouse_point").remove();
        }
        document.getElementById("video_control").style.display = "none";
        const parent = document.getElementById("container");
        const grandparent = document.getElementById("containers");
        for (let i = 0; i < this.rows * this.columns; i++) {
            parent.removeChild(parent.childNodes[0]);//移除block
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
            parent.setAttribute("style", `width:${slideLength * this.columns}px;height:${slideLength * this.rows}px;`);
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
            if ($("#containers").outerWidth() > $videoControl.outerWidth()) {
                marginLeft = $("#counters").outerWidth() + 6;
            } else if (borderWidth > controlWidth) {
                marginLeft = (borderWidth - controlWidth) / 2;
            }
            $videoControl.css({"margin-top": $border.outerHeight() - 2, "margin-left": marginLeft, "left": 4});
        }

        this.childObject.splice(0, this.childObject.length);
        for (let i = 0; i < this.rows * this.columns; i++) {
            const block = new Block("block", i);
            this.childObject.push(block);
            document.getElementById("container").appendChild(block.html);
            const img = document.createElement("img");
            document.getElementById(i).appendChild(img);
            // todo 将方块样式初始化放到构造函数中
            block.changeStyle("block");
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
            this.html.appendChild(block.html);
        }
    }
    change_top_image("face", "face_normal");
    change_top_count("mine_count", this.bombNumber);
    change_top_count("time_count", 0);
    this.minenumber = this.bombNumber;
};

Container.prototype.add_mark = function () {//添加标识
    var mark = document.createElement("div");
    mark.id = "mark";
    document.getElementById("containers").appendChild(mark);
    var span = document.createElement("span");
    span.id = "mark_span";
    span.innerHTML = "Anonymous!";
    document.getElementById("mark").appendChild(span);//添加子元素

    for (var i = 0; i < container.rows * container.columns; i++) {//给每个block增加img节点
        var img = document.createElement("img");
        document.getElementById(i).appendChild(img);
    }
};

Container.prototype.set_mine = function (bomb_id) {
    reset();//重置时间
    log("新游戏布雷1111");
    gameover = false;
    leftClick = false;
    rightClick = false;
    var d = 0;
    while (true) {
        if (d >= this.bombNumber) {
            break;
        }
        var e = Math.floor(Math.random() * this.rows * this.columns);
        if (e != bomb_id && this.childObject[e].isBomb != true) {
            this.childObject[e].isBomb = true;
            d++;
        }
    }
    for (var j = 0; j < this.rows * this.columns; j++) {
        var f = this.childObject[j];
        f.neighbors.up = this.childObject[j - this.columns];
        f.neighbors.right = this.childObject[j + 1];
        f.neighbors.down = this.childObject[j + this.columns];
        f.neighbors.left = this.childObject[j - 1];
        f.neighbors.leftUp = this.childObject[j - this.columns - 1];
        f.neighbors.rightUp = this.childObject[j - this.columns + 1];
        f.neighbors.leftDown = this.childObject[j + this.columns - 1];
        f.neighbors.rightDown = this.childObject[j + this.columns + 1];
        if (j / this.columns == 0) {
            f.neighbors.up = null;
            f.neighbors.leftUp = null;
            f.neighbors.rightUp = null;
        } else if (j / this.columns == this.rows - 1) {
            f.neighbors.down = null;
            f.neighbors.leftDown = null;
            f.neighbors.rightDown = null;
        }
        if (j % this.columns == 0) {
            f.neighbors.left = null;
            f.neighbors.leftUp = null;
            f.neighbors.leftDown = null;
        } else if (j % this.columns == this.columns - 1) {
            f.neighbors.right = null;
            f.neighbors.rightUp = null;
            f.neighbors.rightDown = null;
        }
        f.calcBombAround();
    }
    this.childObject[bomb_id].open();
};

Container.prototype.set_viedo_mine = function (board) {
    reset();//重置时间
    gameover = true;
    firstclick = false;
    leftClick = false;
    rightClick = false;
    left_invalid = false;
    right_invalid = false;
    middle_invalid = false;
    left_count = 0;
    right_count = 0;
    double_count = 0;
    ces_count = 0;
    log("录像布雷");
    for (let i in board) {
        if (board[i] === 1 || board[i] === "*") {
            this.childObject[i].isBomb = true;
        }
    }
    for (var j = 0; j < this.rows * this.columns; j++) {
        var f = this.childObject[j];
        f.neighbors.up = this.childObject[j - this.columns];
        f.neighbors.right = this.childObject[j + 1];
        f.neighbors.down = this.childObject[j + this.columns];
        f.neighbors.left = this.childObject[j - 1];
        f.neighbors.leftUp = this.childObject[j - this.columns - 1];
        f.neighbors.rightUp = this.childObject[j - this.columns + 1];
        f.neighbors.leftDown = this.childObject[j + this.columns - 1];
        f.neighbors.rightDown = this.childObject[j + this.columns + 1];
        if (j / this.columns == 0) {
            f.neighbors.up = null;
            f.neighbors.leftUp = null;
            f.neighbors.rightUp = null;
        } else if (j / this.columns == this.rows - 1) {
            f.neighbors.down = null;
            f.neighbors.leftDown = null;
            f.neighbors.rightDown = null;
        }
        if (j % this.columns == 0) {
            f.neighbors.left = null;
            f.neighbors.leftUp = null;
            f.neighbors.leftDown = null;
        } else if (j % this.columns == this.columns - 1) {
            f.neighbors.right = null;
            f.neighbors.rightUp = null;
            f.neighbors.rightDown = null;
        }
        f.calcBombAround();
    }
};

Container.prototype.replay_video = function () {
    if (video_invalid == false) {
        container.init(video[0].level);
        container.set_viedo_mine(video[0].board);
        start_avf(video);
    } else {
        log("录像重放错误");
    }
}

Container.prototype.reset_mine = function () {
    $('#mark_span').html('UPK mode');
    $('#mark_span').attr('title', $('#mark_span').html());
    if (left_count != 0 || gameover == true) {
        if (document.getElementById("mouse_point")) {
            $("div#mouse_point").remove();
        }
        change_top_count("mine_count", container.minenumber = container.bombNumber);
        reset();//重置时间
        gameover = false;
        firstclick = false;
        leftClick = false;
        rightClick = false;
        left_invalid = false;
        right_invalid = false;
        middle_invalid = false;
        left_count = 0;
        right_count = 0;
        double_count = 0;
        ces_count = 0;
        reset_begin = true;
        path = 0;
        log("重开布雷");
        for (var i in this.childObject) {
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
    this.html = null;
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

Block.prototype.init = function () {
    var c = this;
    this.html = document.createElement("div");

    EventUtil.addEvent(this.html, "mouseover", function (a) {
            if (gameover == true) {
                return false;
            }
            if (c.isOpen == false && rightClick == false && leftClick == true) {
                if (c.getStyle() == "block" && left_invalid == false) {
                    c.changeStyle("opening");
                }
            } else if (rightClick == true && leftClick == true) {
                c.change_around_opening();
            } else if (middle_invalid == true) {
                c.change_around_opening();
            }
        }
    );
    EventUtil.addEvent(this.html, "mouseout", function (a) {
            if (gameover == true) {
                return false;
            }
            if (c.isOpen == false && leftClick == true && rightClick == false) {
                if (c.getStyle() == "opening") {
                    c.changeStyle("block");
                }
            } else if (rightClick == true && leftClick == true) {
                c.change_around_normal();
            } else if (middle_invalid == true) {
                c.change_around_normal();
            }
        }
    );

    EventUtil.addEvent(this.html, "mousedown", function (a) {
            if (gameover == true) {
                return false;
            }
            c.change_around_normal();//复原因为中键改变的block样式
            change_top_image("face", "face_click");
            if (a.button == 0) {
                if (rightClick == true) {
                    left_invalid = true;
                    c.change_around_opening();
                } else if (c.getStyle() == "block") {
                    c.changeStyle("opening");
                }
            } else if (a.button == 2) {
                if (leftClick == true) {
                    left_invalid = true;
                    c.change_around_opening();
                } else {
                    right_count++;

                    if (c.getStyle() == "openedBlockBomb") {
                        if (question == false) {
                            ces_count++;
                            c.changeStyle("block");
                            change_top_count("mine_count", container.minenumber = container.minenumber + 1);
                        } else {
                            ces_count++;
                            c.changeStyle("question");
                            change_top_count("mine_count", container.minenumber = container.minenumber + 1);
                        }
                    } else if (c.getStyle() == "block") {
                        ces_count++;
                        c.changeStyle("openedBlockBomb");
                        change_top_count("mine_count", container.minenumber = container.minenumber - 1);
                    } else if (c.getStyle() == "question") {
                        ces_count++;
                        c.changeStyle("block");
                    } else {
                        right_invalid = true;
                    }

                }
            } else if (a.button == 1) {
                middle_invalid = true;
                c.change_around_opening();
            }
        }
    );

    EventUtil.addEvent(this.html, "mouseup", function (a) {
            if (gameover == true) {
                return false;
            }
            if (reset_begin == true) {
                reset_begin = false;
                start();
            }
            change_top_image("face", "face_normal");
            if (a.button == 0) {
                if (rightClick == true) {
                    c.change_around_normal();
                    double_count++;
                    if (right_invalid == true) {
                        right_count--;
                        right_invalid = false;
                    }
                } else if (left_invalid == false) {
                    left_count++;
                }
                if (c.isOpen == false && c.getStyle() == "opening" && rightClick == false && c.getStyle() == "opening") {
                    if (firstclick == true) {
                        firstclick = false;
                        container.set_mine(c.id);
                        start();
                    } else {
                        c.open();
                    }
                } else if (rightClick == true && c.isOpen == true && c.bombNumAround > 0) {
                    c.openaround();
                }
                left_invalid = false;
            } else if (a.button == 2) {
                if (leftClick == true) {
                    double_count++;
                    if (right_invalid == true) {
                        right_count--;
                    }
                    c.change_around_normal();
                    if (c.isOpen == true && c.bombNumAround > 0) {
                        c.openaround();
                    }
                }
                right_invalid = false;
            } else if (a.button == 1) {
                middle_invalid = false;
                c.change_around_normal();
                c.openaround();
            }
        }
    );
    this.html.setAttribute("class", "block");
    this.html.setAttribute("id", c.id);
};

Block.prototype.changeStyle = function (className) {
    this.html.setAttribute("class", className);
    const imgElement = document.getElementById(this.id).getElementsByTagName("img")[0];
    switch (className) {
        case "openedBlockBomb":
            imgElement.src = "image/flag.bmp";
            break;
        case "block":
            imgElement.src = "image/blank.bmp";
            break;
        case "opening":
            imgElement.src = "image/opening.bmp";
            break;
        case "question":
            imgElement.src = "image/question.bmp";
            break;
    }
};

Block.prototype.change = function (a) {
    this.html.setAttribute("style", a);
};

Block.prototype.change_around_opening = function () {
    if (null != this && typeof (this) != "undefined" && !this.isOpen && this.getStyle() == "block") {
        this.changeStyle("opening");
    }
    var a = new Array();
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (var i = 0; i < a.length; i++) {
        var b = this.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && !b.isOpen && b.getStyle() == "block") {
            b.changeStyle("opening");
        }
    }
};

Block.prototype.change_around_normal = function () {
    if (null != this && typeof (this) != "undefined" && !this.isOpen && this.getStyle() == "opening") {
        this.changeStyle("block");
    }
    var a = new Array();
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (var i = 0; i < a.length; i++) {
        var b = this.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && !b.isOpen && b.getStyle() == "opening") {
            b.changeStyle("block");
        }
    }
};

Block.prototype.getStyle = function () {
    var a = this.html.getAttribute("class");
    if (a == null || typeof (a) == "undefined") {
        a = this.html.getAttribute("className")
    }
    return a;
};

Block.prototype.open = function () {
    ces_count++;
    if (this.bombNumAround == 0) {
        this.changeStyle("opening");
    } else if (this.bombNumAround > 0) {
        this.changeStyle("number");
        document.getElementById(this.id).getElementsByTagName("img")[0].src = "image/" + this.bombNumAround + ".bmp";
    } else {
        stop();
        this.changeStyle("firstbomb");
        document.getElementById(this.id).getElementsByTagName("img")[0].src = "image/firstbomb.bmp";

        //You Lose!
        lose();
        change_top_image("face", "face_cry");
    }
    this.isOpen = true;
    if (this.bombNumAround == 0) {
        var a = new Array();
        // JavaScript push() 方法
        // http://www.runoob.com/jsref/jsref-push.html
        a.push("up");
        a.push("right");
        a.push("down");
        a.push("left");
        a.push("leftUp");
        a.push("rightUp");
        a.push("leftDown");
        a.push("rightDown");
        for (var i = 0; i < a.length; i++) {
            var b = this.neighbors[a[i]];
            if (null != b && typeof (b) != "undefined" && !b.isBomb && !b.isOpen && b.getStyle() != "openedBlockBomb" && b.getStyle() != "question") {
                b.open();
                ces_count--;
            }
        }
    }
    this.win();//放在最后面，防止ces_count满足--条件时未--
};

Block.prototype.openaround = function () {
    var count = 0;
    var flag = false;
    var a = new Array();
    a.push("up");
    a.push("right");
    a.push("down");
    a.push("left");
    a.push("leftUp");
    a.push("rightUp");
    a.push("leftDown");
    a.push("rightDown");
    for (var i = 0; i < a.length; i++) {
        var b = this.neighbors[a[i]];
        if (null != b && typeof (b) != "undefined" && !b.isOpen && b.getStyle() == "openedBlockBomb")
            count++;
    }
    if (count == this.bombNumAround) {
        for (var i = 0; i < a.length; i++) {
            var b = this.neighbors[a[i]];
            if (null != b && typeof (b) != "undefined" && !b.isOpen && b.getStyle() != "openedBlockBomb" && b.getStyle() != "bomb") {
                b.around_open();
                ces_count--;
                flag = true;
            }
        }
        if (flag == true) {
            ces_count++;
        }
    }
    this.win();
};

Block.prototype.around_open = function ()
//跟open()的区别在于没有进行是否胜利的判断
//在openaround()的操作时win()应该在所有格子遍历完成后进行
//否则ces_count可能在stop()之后才完成计数，导致计数错误
//没加标识变量判断那是因为只有此处特殊处理，没必要在别的地方多次初始化
{
    ces_count++;
    if (this.bombNumAround == 0) {
        this.changeStyle("opening");
    } else if (this.bombNumAround > 0) {
        this.changeStyle("number");
        document.getElementById(this.id).getElementsByTagName("img")[0].src = "image/" + this.bombNumAround + ".bmp";
    } else {
        stop();
        this.changeStyle("firstbomb");
        document.getElementById(this.id).getElementsByTagName("img")[0].src = "image/firstbomb.bmp";

        //You Lose!
        lose();
        change_top_image("face", "face_cry");
    }
    this.isOpen = true;
    if (this.bombNumAround == 0) {
        var a = new Array();
        a.push("up");
        a.push("right");
        a.push("down");
        a.push("left");
        a.push("leftUp");
        a.push("rightUp");
        a.push("leftDown");
        a.push("rightDown");
        for (var i = 0; i < a.length; i++) {
            var b = this.neighbors[a[i]];
            if (null != b && typeof (b) != "undefined" && !b.isBomb && !b.isOpen && b.getStyle() != "openedBlockBomb") {
                b.open();
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
        const className = container.childObject[i].html.className;
        if (className === "block" && container.childObject[i].isBomb === true) {
            parent.childNodes[i].className = "bomb";
            document.getElementById(i).getElementsByTagName("img")[0].src = "image/bomb.bmp";
        } else if (className === "openedBlockBomb" && container.childObject[i].isBomb === false) {
            parent.childNodes[i].className = "bomb";
            document.getElementById(i).getElementsByTagName("img")[0].src = "image/wrongflag.bmp";
        }
    }
    write_counters();
}

Block.prototype.win = function () {
    const type = document.getElementById('container').getElementsByTagName("div");
    let count = 0;
    for (let i = 0; i < type.length; i++) {
        const a = type[i].className;
        if (a === "opening" || a === "number") {
            count++;
        }
    }
    if (count === container.rows * container.columns - container.bombNumber) {
        stop();
        change_top_image("face", "face_sunglasses");
        if (gameover === true && video !== 0) {
            path = parseInt(video[size - 1].path);
        }
        gameover = true;
        log("You Win!");
        const parent = document.getElementById("container");
        for (let i = 0; i < container.childObject.length; i++) {
            const className = container.childObject[i].html.className;
            if (className === "block" || className === "question") {
                parent.childNodes[i].className = "openedBlockBomb";
                document.getElementById(i).getElementsByTagName("img")[0].src = "image/flag.bmp";
            }
        }
        write_counters();
    }
}

var EventUtil = {};
// addEventListener() 方法
// http://www.runoob.com/js/js-htmldom-eventlistener.html
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

document.onmousedown = function () {
    if (gameover == false) {
        if (event.button == 0) {
            // log("leftdown");
            leftClick = true;
        }
        if (event.button == 2) {
            // log("rightdown");
            rightClick = true;
        }
    }
}
document.onmouseup = function () {
    if (gameover == false) {
        if (event.button == 0) {
            // log("leftup");
            leftClick = false;
        }
        if (event.button == 2) {
            // log("rightup");
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