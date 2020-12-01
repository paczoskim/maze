function rotateAndGetX(speed, ang) {
    let rot = rotateVector(speed, -ang);
    rot.y = 0;
    return rotateVector(rot, ang);

    function rotateVector(speed, ang) {
        return {
            x: speed.x * Math.cos(ang) - speed.y * Math.sin(ang),
            y: speed.x * Math.sin(ang) + speed.y * Math.cos(ang),
            val: speed.val
        };
    }
}

function dist(x1, y1, x, y) {
    let dx = x - x1;
    let dy = y - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function distToLine(x, y, sx, sy, ex, ey) {
    let dx = ex - sx;
    let dy = ey - sy;
    let l2 = dx * dx + dy * dy;

    if (l2 == 0)
        return this.dist(x, y, sx, sy);

    let t = ((x - sx) * dx + (y - sy) * dy) / l2;
    t = Math.max(0, Math.min(1, t));

    return this.dist(x, y, sx + t * dx, sy + t * dy);
}

function genLab(a, b) {
    function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function everyEmpty(lab) {
        for (let i = 0; i < lab.fill.length; i++) {
            for (let j = 0; j < lab.fill[i].length; j++) {
                if (lab.fill[i][j] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    function anyEmpty(lab) {
        for (let i = 0; i < lab.fill.length; i++) {
            for (let j = 0; j < lab.fill[i].length; j++) {
                if (lab.fill[i][j] === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function dig(lab, ax, bx) {
        let block = true;
        while (block) {
            switch (randomInt(0, 3)) {
                case 0:
                    if (ax - 1 >= 0 && lab.fill[ax - 1][bx] === 0) {
                        lab.fill[ax][bx] = 1;
                        lab.fill[ax - 1][bx] = 1;
                        lab.horLine[ax][bx] = 0;
                        ax -= 1;
                    } else {
                        block = false;
                    }
                    break;
                case 1:
                    if (bx + 1 < lab.b && lab.fill[ax][bx + 1] === 0) {
                        lab.fill[ax][bx] = 1;
                        lab.fill[ax][bx + 1] = 1;
                        lab.verLine[ax][bx + 1] = 0;
                        bx += 1;
                    } else if (bx + 1 >= lab.b && lab.fill[ax][0] === 0) {
                        lab.fill[ax][bx] = 1;
                        lab.fill[ax][0] = 1;
                        lab.verLine[ax][bx + 1] = 0;
                        lab.verLine[ax][0] = 0;
                        bx = 0;
                    } else {
                        block = false;
                    }
                    break;
                case 2:
                    if (ax + 1 < lab.a && lab.fill[ax + 1][bx] === 0) {
                        lab.fill[ax][bx] = 1;
                        lab.fill[ax + 1][bx] = 1;
                        lab.horLine[ax + 1][bx] = 0;
                        ax += 1;
                    } else {
                        block = false;
                    }
                    break;
                case 3:
                    if (bx - 1 >= 0 && lab.fill[ax][bx - 1] === 0) {
                        lab.fill[ax][bx] = 1;
                        lab.fill[ax][bx - 1] = 1;
                        lab.verLine[ax][bx] = 0;
                        bx -= 1;
                    } else if (bx - 1 < 0 && lab.fill[ax][lab.b - 1] === 0) {
                        lab.fill[ax][bx] = 1;
                        lab.fill[ax][lab.b - 1] = 1;
                        lab.verLine[ax][bx] = 0;
                        lab.verLine[ax][lab.b] = 0;
                        bx = lab.b - 1;
                    } else {
                        block = false;
                    }
                    break;
            }
        }
        return lab;
    }

    let lab = {
        fill: Array(),
        horLine: Array(),
        verLine: Array(),
        a: a,
        b: b,
        point: {
            a: randomInt(0, a - 1),
            b: randomInt(0, b - 1)
        }
    };
    for (let i = 0; i < a; i++) {
        lab.fill.push(Array(b).fill(0));
    }
    for (let i = 0; i < a + 1; i++) {
        lab.horLine.push(Array(b).fill(1));
    }
    for (let i = 0; i < a; i++) {
        lab.verLine.push(Array(b + 1).fill(1));
    }

    let ax = randomInt(0, a - 1);
    let bx = randomInt(0, b - 1);
    while (everyEmpty(lab)) {
        lab = dig(lab, ax, bx);
    }
    while (anyEmpty(lab)) {
        do {
            ax = randomInt(0, a - 1);
            bx = randomInt(0, b - 1);
        } while (lab.fill[ax][bx] === 0);
        lab = dig(lab, ax, bx);
    }
    return lab;
}

let myGameArea = {
    canvas: document.getElementById("myCanvas"),
    ctx: document.getElementById("myCanvas").getContext("2d"),
    width: document.getElementById("screen").offsetWidth,
    height: document.getElementById("screen").offsetHeight,
    minSize: Math.min(document.getElementById("screen").offsetWidth, document.getElementById("screen").offsetHeight) * 0.9,
    touch: {
        toggleDrag: false,
        toggleTap: false,
        xb: 0,
        yb: 0,
        x: 0,
        y: 0
    },
    start: function () {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        player.x = this.width / 2 - this.minSize / 2 + (this.minSize) / (4 * (lab.a + Math.floor(lab.a / 4)));
        player.y = this.height / 2;
        player.xr = dist(myGameArea.width / 2, myGameArea.height / 2, player.x, player.y);
        player.xalfa = Math.atan2(myGameArea.height / 2 - player.y, myGameArea.width / 2 - player.x) + Math.PI;
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.code] = (e.type == "keydown");
        });
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.code] = (e.type == "keydown");
        });
        this.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();
            myGameArea.touch.xb = e.touches[0].clientX;
            myGameArea.touch.yb = e.touches[0].clientY;
        });
        this.canvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            myGameArea.touch.toggleDrag = true;
            myGameArea.touch.x = e.touches[0].clientX;
            myGameArea.touch.y = e.touches[0].clientY;
        });
        this.canvas.addEventListener("touchend", function (e) {
            e.preventDefault();
            if (myGameArea.touch.toggleDrag) {
            }
            if (myGameArea.touch.toggleDrag == false) {
                myGameArea.touch.toggleTap = true;
            }
            myGameArea.touch.toggleDrag = false;
        });
        this.canvas.addEventListener("touchcancel", function (e) {
            e.preventDefault();
            if (myGameArea.touch.toggleDrag) {
            }
            if (myGameArea.touch.toggleDrag == false) {
                myGameArea.touch.toggleTap = true;
            }
            this.touch.toggleDrag = false;
        });
        let alpha = (lab.point.b + 0.5) / lab.b * 2 * Math.PI;
        let r = this.minSize * ((lab.point.a + 0.5) + Math.floor(lab.a / 4)) / (lab.a * 2 + 2 * Math.floor(lab.a / 4));
        this.endPosition = {
            x: this.width / 2 + Math.cos(alpha) * r,
            y: this.height / 2 + Math.sin(alpha) * r
        }
        bounceBall.startBall();
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    drawCircle: function () {
        this.doughnut = Math.floor(lab.a / 4);
        let alpha;
        let r1;
        let r2;
        for (let i = 0; i < lab.horLine.length; i++) {
            for (let j = 0; j < lab.horLine[i].length; j++) {
                if (lab.horLine[i][j] === 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(this.width / 2, this.height / 2, this.minSize * (i + this.doughnut) / (lab.a * 2 + this.doughnut * 2),
                        j / lab.b * 2 * Math.PI,
                        (j + 1) / lab.b * 2 * Math.PI);
                    this.ctx.stroke();
                }
            }
        }
        for (let i = 0; i < lab.verLine.length; i++) {
            for (let j = 0; j < lab.verLine[i].length - 1; j++) {
                if (lab.verLine[i][j] === 1) {
                    alpha = j / lab.b * 2 * Math.PI;
                    r1 = this.minSize * (i + this.doughnut) / (lab.a * 2 + 2 * this.doughnut);
                    r2 = this.minSize * (i + this.doughnut + 1) / (lab.a * 2 + 2 * this.doughnut);
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.width / 2 + Math.cos(alpha) * r1, this.height / 2 + Math.sin(alpha) * r1);
                    this.ctx.lineTo(this.width / 2 + Math.cos(alpha) * r2, this.height / 2 + Math.sin(alpha) * r2);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.beginPath();
        this.ctx.arc(this.endPosition.x, this.endPosition.y, player.r, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();
    },
    drawJoystick: function (fi) {
        this.ctx.beginPath();
        this.ctx.arc(this.touch.xb, this.touch.yb, this.minSize / 10, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "rgba(158, 158, 158,0.4)";
        this.ctx.fill();
        this.ctx.strokeStyle = "rgba(117, 117, 117,0.6)";
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(this.touch.xb + (this.minSize / 10 - this.minSize / 30) * Math.cos(fi),
            this.touch.yb + (this.minSize / 10 - this.minSize / 30) * Math.sin(fi),
            this.minSize / 30, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "rgba(117, 117, 117,0.6)";
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "black";

    }
}

let player = {
    r: myGameArea.minSize / 100,
    speed: {
        x: 0,
        y: 0,
        val: myGameArea.minSize / 200
    },
    drawPlayer: function () {
        if (this.speed.x != 0 || this.speed.y != 0) {
            let speedFragX = this.speed.x / this.speed.val;
            let speedFragY = this.speed.y / this.speed.val;
            for (let i = 0; i < this.speed.val; i++) {
                this.xr = dist(myGameArea.width / 2, myGameArea.height / 2, this.x, this.y);
                this.xalfa = Math.atan2(myGameArea.height / 2 - this.y, myGameArea.width / 2 - this.x) + Math.PI;
                this.speed.x = speedFragX;
                this.speed.y = speedFragY;
                this.checkCollision();
                this.x += this.speed.x;
                this.y += this.speed.y;
            }
        }
        this.xr = dist(myGameArea.width / 2, myGameArea.height / 2, this.x, this.y);
        this.xalfa = Math.atan2(myGameArea.height / 2 - this.y, myGameArea.width / 2 - this.x) + Math.PI;
        myGameArea.ctx.beginPath();
        myGameArea.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        myGameArea.ctx.fill();
        myGameArea.ctx.stroke();
    },
    checkCollision: function () {
        let oneHor = myGameArea.minSize / (lab.a * 2 + myGameArea.doughnut * 2);
        let oneVer = (Math.PI * 2) / lab.b;
        let a = Math.floor(player.xr / oneHor - myGameArea.doughnut);
        let b = Math.floor(player.xalfa / oneVer);
        let alpha1 = b * oneVer;
        let alpha2 = (b + 1) * oneVer;
        let r1 = (a + myGameArea.doughnut) * oneHor;
        let r2 = (a + 1 + myGameArea.doughnut) * oneHor;
        let newX = this.x + this.speed.x;
        let newY = this.y + this.speed.y;
        let newXr = dist(myGameArea.width / 2, myGameArea.height / 2, newX, newY);
        let corner = 0;

        if (a == lab.point.a && b == lab.point.b &&
            dist(newX, newY, myGameArea.endPosition.x, myGameArea.endPosition.y) < player.r * 2) {
            myGameArea.guard = true;
            this.speed.x = 0;
            this.speed.y = 0;
        } else {
            if (lab.verLine[a][b] == 1 &&
                distToLine(newX, newY,
                    myGameArea.width / 2 + Math.cos(alpha1) * r1, myGameArea.height / 2 + Math.sin(alpha1) * r1,
                    myGameArea.width / 2 + Math.cos(alpha1) * r2, myGameArea.height / 2 + Math.sin(alpha1) * r2) <= player.r) {
                this.speed = rotateAndGetX(this.speed, alpha1);
                corner = 1;
            }
            if (lab.verLine[a][b + 1] == 1 &&
                distToLine(newX, newY,
                    myGameArea.width / 2 + Math.cos(alpha2) * r1, myGameArea.height / 2 + Math.sin(alpha2) * r1,
                    myGameArea.width / 2 + Math.cos(alpha2) * r2, myGameArea.height / 2 + Math.sin(alpha2) * r2) <= player.r) {
                this.speed = rotateAndGetX(this.speed, alpha2);
                corner = 1;

            }
            if ((lab.horLine[a][b] == 1 && (newXr - this.r) <= r1) ||
                (lab.horLine[a + 1][b] == 1 && (newXr + this.r) >= r2)) {
                if (corner == 1) {
                    this.speed = {x: 0, y: 0, val: this.speed.val};
                } else {
                    this.speed = rotateAndGetX(this.speed, Math.PI / 2 + this.xalfa);
                    let xx = player.x + player.speed.x;
                    let yy = player.y + player.speed.y;
                    let ang = Math.atan2(myGameArea.height / 2 - yy, myGameArea.width / 2 - xx) + Math.PI;
                    this.speed.x = myGameArea.width / 2 + this.xr * Math.cos(ang) - this.x;
                    this.speed.y = myGameArea.height / 2 + this.xr * Math.sin(ang) - this.y;
                }
            }
            if (lab.verLine[a][b] == 0 && lab.horLine[a][b] == 0) {
                cornerCheck(r1, alpha1);
            }
            if (lab.verLine[a][b] == 0 && lab.horLine[a + 1][b] == 0) {
                cornerCheck(r2, alpha1);
            }
            if (lab.verLine[a][b + 1] == 0 && lab.horLine[a + 1][b] == 0) {
                cornerCheck(r2, alpha2);
            }
            if (lab.verLine[a][b + 1] == 0 && lab.horLine[a][b] == 0) {
                cornerCheck(r1, alpha2);
            }
        }

        function cornerCheck(r12, angle) {
            if (dist(newX, newY, myGameArea.width / 2 + Math.cos(angle) * r12, myGameArea.height / 2 + Math.sin(angle) * r12) <= player.r) {
                let fi = Math.atan2(myGameArea.height / 2 + Math.sin(angle) * r12 - player.y, myGameArea.width / 2 + Math.cos(angle) * r12 - player.x) + Math.PI;
                player.speed = rotateAndGetX(player.speed, fi + Math.PI / 2);
            }
        }
    }
}

let bounceBall = {
    R: myGameArea.minSize / 2,
    H: 600,
    a: 3,
    loss: 1.3,
    startBall: function () {
        this.r = (myGameArea.minSize) / (2 * (lab.a + Math.floor(lab.a / 4))) * Math.floor(lab.a / 4)
        this.h = this.H;
        this.v = 0;
        this.count = 0;
        myGameArea.canvas.addEventListener('click', clickCheck);
        requestAnimationFrame(startScreen);

        function clickCheck(e) {
            if (Math.sqrt(Math.pow(myGameArea.width / 2 - e.clientX, 2) + Math.pow(myGameArea.height / 2 - e.clientY, 2)) <= bounceBall.R) {
                myGameArea.canvas.removeEventListener('click', clickCheck);
                bounceBall.guard = true;
            }
        }
    },
    updateBall: function () {
        this.h -= (this.v + this.a / 2);
        this.v += this.a;
        if (this.h < 0) {
            this.count++;
            this.h = 0;
            this.v = -Math.sqrt(2 * this.a * this.H) / Math.pow(this.loss, this.count);
            if (this.v > -1) {
                this.v = 0;
                return true;
            }
        }
        return false;
    },
    resetBall: function () {
        this.h += this.H / 100;
        if (this.h > this.H) {
            lab = genLab(6, 15);
            player.x = myGameArea.width / 2 - myGameArea.minSize / 2 + (myGameArea.minSize) / (4 * (lab.a + Math.floor(lab.a / 4)));
            player.y = myGameArea.height / 2;
            this.h = this.H;
            this.count = 0;
            let alpha = (lab.point.b + 0.5) / lab.b * 2 * Math.PI;
            let r = myGameArea.minSize * ((lab.point.a + 0.5) + Math.floor(lab.a / 4)) / (lab.a * 2 + 2 * Math.floor(lab.a / 4));
            myGameArea.endPosition = {
                x: myGameArea.width / 2 + Math.cos(alpha) * r,
                y: myGameArea.height / 2 + Math.sin(alpha) * r
            }
            return true;
        } else {
            return false;
        }
    },
    drawStartBall: function () {
        myGameArea.ctx.beginPath();
        myGameArea.ctx.arc(myGameArea.width / 2, myGameArea.height / 2, this.r + (this.R - this.r) * (this.h / (this.H)), 0, 2 * Math.PI, false);
        myGameArea.ctx.fill();
        myGameArea.ctx.stroke();
        let a = bounceBall.R / 2;
        myGameArea.ctx.beginPath();
        myGameArea.ctx.moveTo(myGameArea.width / 2 + Math.sqrt(3) * a / 2, myGameArea.height / 2);
        for (let fi = 0; fi < 2 * Math.PI; fi += Math.PI * 2 / 3) {
            myGameArea.ctx.lineTo(myGameArea.width / 2 + Math.sqrt(3) * a / 2 * Math.cos(fi),
                myGameArea.height / 2 + Math.sqrt(3) * a / 2 * Math.sin(fi));
        }
        myGameArea.ctx.fillStyle = "grey";
        myGameArea.ctx.fill();
        myGameArea.ctx.stroke();
        myGameArea.ctx.fillStyle = "black";
    },
    drawBall: function () {
        myGameArea.ctx.beginPath();
        myGameArea.ctx.arc(myGameArea.width / 2, myGameArea.height / 2, this.r + (this.R - this.r) * (this.h / (this.H)), 0, 2 * Math.PI, false);
        myGameArea.ctx.fill();
        myGameArea.ctx.stroke();
    },
    drawSmallBall: function () {
        myGameArea.ctx.beginPath();
        myGameArea.ctx.arc(myGameArea.width / 2, myGameArea.height / 2, this.r, 0, 2 * Math.PI, false);
        myGameArea.ctx.fill();
        myGameArea.ctx.stroke();
    }

}

function startScreen() {
    myGameArea.clear();
    bounceBall.drawStartBall();
    if (bounceBall.guard == true ||
        (myGameArea.touch.toggleTap == true &&
            dist(myGameArea.touch.xb, myGameArea.touch.yb, myGameArea.width / 2, myGameArea.height / 2) < bounceBall.R)) {
        window.requestAnimationFrame(bouncingScreen);
    } else {
        window.requestAnimationFrame(startScreen);
    }
}

function bouncingScreen() {
    myGameArea.clear();
    bounceBall.drawBall();
    myGameArea.drawCircle();
    player.drawPlayer();
    if (bounceBall.updateBall()) {
        window.requestAnimationFrame(updateGameArea);
    } else {
        window.requestAnimationFrame(bouncingScreen);
    }
}

function updateGameArea() {
    myGameArea.clear();
    player.speed.x = 0;
    player.speed.y = 0;
    if (myGameArea.keys && myGameArea.keys["ArrowLeft"]) {
        player.speed.x = -1;
    }
    if (myGameArea.keys && myGameArea.keys["ArrowRight"]) {
        player.speed.x = 1;
    }
    if (myGameArea.keys && myGameArea.keys["ArrowUp"]) {
        player.speed.y = -1;
    }
    if (myGameArea.keys && myGameArea.keys["ArrowDown"]) {
        player.speed.y = 1;
    }
    if (myGameArea.touch.toggleDrag == true) {
        player.speed.x = myGameArea.touch.x - myGameArea.touch.xb;
        player.speed.y = myGameArea.touch.y - myGameArea.touch.yb;
    }
    let fi = Math.atan2(player.speed.y, player.speed.x);
    if (player.speed.x != 0 || player.speed.y != 0) {
        player.speed.x = player.speed.val * Math.cos(fi);
        player.speed.y = player.speed.val * Math.sin(fi);
    }

    myGameArea.drawCircle();
    player.drawPlayer();
    bounceBall.drawSmallBall();
    if (myGameArea.touch.toggleDrag == true) {
        myGameArea.drawJoystick(fi);
    }
    if (myGameArea.guard == true) {
        myGameArea.guard = false;
        window.requestAnimationFrame(resetScreen);
    } else {
        window.requestAnimationFrame(updateGameArea);
    }

}

function resetScreen() {
    myGameArea.clear();
    bounceBall.drawBall();
    myGameArea.drawCircle();
    player.drawPlayer();
    if (bounceBall.resetBall()) {
        window.requestAnimationFrame(bouncingScreen);
    } else {
        window.requestAnimationFrame(resetScreen);
    }
}

function resizeCanvas() {
    myGameArea.width = document.getElementById("screen").offsetWidth;
    myGameArea.height = document.getElementById("screen").offsetHeight;
    myGameArea.canvas.width = myGameArea.width;
    myGameArea.canvas.height = myGameArea.height;
    let minSize = Math.min(myGameArea.width, myGameArea.height) * 0.9;
    player.r *= minSize / myGameArea.minSize;
    player.xr *= minSize / myGameArea.minSize;
    player.x = (player.xr * Math.cos(player.xalfa) + myGameArea.width / 2);
    player.y = (player.xr * Math.sin(player.xalfa) + myGameArea.height / 2);
    player.speed.val *= minSize / myGameArea.minSize;
    bounceBall.r *= minSize / myGameArea.minSize;
    bounceBall.R *= minSize / myGameArea.minSize;
    myGameArea.minSize = minSize;
    let alpha = (lab.point.b + 0.5) / lab.b * 2 * Math.PI;
    let r = myGameArea.minSize * ((lab.point.a + 0.5) + Math.floor(lab.a / 4)) / (lab.a * 2 + 2 * Math.floor(lab.a / 4));
    myGameArea.endPosition = {
        x: myGameArea.width / 2 + Math.cos(alpha) * r,
        y: myGameArea.height / 2 + Math.sin(alpha) * r
    }
}

let lab = genLab(6, 15);
myGameArea.start();
