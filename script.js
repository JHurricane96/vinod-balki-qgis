const constants = {
    momHouseSprite: {
        x: 0,
        y: 40,
        size: 13
    },
    grandmaHouseSprite: {
        x: 450,
        y: 40,
        size: 13
    },
    forestSprite: {
        x: 295,
        y: 350,
        size: 4
    },
    redRidingHood: {
        startLocation: {
            x: 130,
            y: 130
        },
        spriteSize: {
            width: 32,
            height: 48
        },
        actualSize: {
            width: 32,
            height: 48
        }
    },
    pathWidth: 70,
}

class PathBlock {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkIfInsidePathBlock(x, y) {
        let isInsideX = false;
        let isInsideY = false;
        if (this.height < 0) {
            isInsideY = (y<=this.y && y>=(this.y+this.height));
        } else {
            isInsideY = (y>=this.y && y<=(this.y+this.height));
        }

        if (this.width < 0) {
            isInsideX = (x<=this.x && x>=(this.x+this.width));
        } else {
            isInsideX = (x>=this.x && x<=(this.x+this.width));
        }

        if (isInsideX && isInsideY) {
            return true;
        } else {
            return false;
        }
    }
}

let path = [
    new PathBlock(120,120,310,constants.pathWidth),
    new PathBlock(220,120,constants.pathWidth, 300),
    new PathBlock(220,420,480,constants.pathWidth),
    new PathBlock(700,420+constants.pathWidth,constants.pathWidth, -300),
    new PathBlock(700+constants.pathWidth,120,-200,constants.pathWidth)
]

let isInsideAPath = (x, y) => {
    isInsidePath = false;
    for (var i = 0; i < path.length; i++) {
        isInsidePath = isInsidePath || path[i].checkIfInsidePathBlock(x,y);
    }
    return isInsidePath;
}

class RedRidingHood {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;

        /**
         * State is the direction map
         * Down -> 0
         * Left -> 1
         * Right -> 2
         * Up -> 3
         */
        this.state = 0;
        this.movingDirection = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.speed = 2.25;
        this.animationStep = 0;
        this.animationSpeed = 0.2;
    }

    update() {
        if (this.movingDirection.right) {
            this.x += this.speed;
            if (!isInsideAPath(this.x+constants.redRidingHood.actualSize.width/2, this.y+constants.redRidingHood.actualSize.height)) {
                this.x -= this.speed;
            }

            this.state = 2;
            this.animationStep = (this.animationStep + this.animationSpeed) % 4;
        } else if (this.movingDirection.left) {
            this.x -= this.speed;
            if (!isInsideAPath(this.x+constants.redRidingHood.actualSize.width/2, this.y+constants.redRidingHood.actualSize.height)) {
                this.x += this.speed;
            }

            this.state = 1;
            this.animationStep = (this.animationStep + this.animationSpeed) % 4;
        } else if (this.movingDirection.up) {
            this.y -= this.speed;
            if (!isInsideAPath(this.x+constants.redRidingHood.actualSize.width/2, this.y+constants.redRidingHood.actualSize.height)) {
                this.y += this.speed;
            }

            this.state = 3;
            this.animationStep = (this.animationStep + this.animationSpeed) % 4;
        } else if (this.movingDirection.down) {
            this.y += this.speed;
            if (!isInsideAPath(this.x+constants.redRidingHood.actualSize.width/2, this.y+constants.redRidingHood.actualSize.height)) {
                this.y -= this.speed;
            }

            this.state = 0;
            this.animationStep = (this.animationStep + this.animationSpeed) % 4;
        }
    }
}

let initCanvas = (canvasId) => {
    let canvas = $("#" + canvasId).get(0);
    let ctx = canvas.getContext("2d");

    return ctx;
}

let imageLoader = (imagePath) => {
    return new Promise((resolve, reject) => {
        try {
            let img = new Image();
            img.src = imagePath;
            img.onload = () => {
                resolve(img);
            };
        } catch (e) {
            reject(e);
        }
    })
}

let drawPath = (ctx) => {
    ctx.fillStyle="#afafaf";
    for (var i = 0; i < path.length; i++) {
        path[i].draw(ctx);
    }
}

$(document).ready(async () => {

    let animate = await (async() => {
        // Load canvas, set BG image
        let ctx = initCanvas("main-canvas");

        // Load assets
        let bgImage = await imageLoader('images/bg.jpg');
        let houseSprite = await imageLoader("sprites/houseSprite.png");
        let redRidingHoodSprite = await imageLoader("sprites/redRidingHoodSprite.png");
        let forestSprite = await imageLoader("sprites/forestSprite.png");

        let redRidingHood = new RedRidingHood(
            constants.redRidingHood.startLocation.x,
            constants.redRidingHood.startLocation.y,
            redRidingHoodSprite
        );

        window.addEventListener("keydown", (e) => {
            if (e.keyCode == 37) {
                redRidingHood.movingDirection.left = true;
            } else if (e.keyCode == 39) {
                redRidingHood.movingDirection.right = true;
            } else if (e.keyCode == 38) {
                redRidingHood.movingDirection.up = true;
            } else if (e.keyCode == 40) {
                redRidingHood.movingDirection.down = true;
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.keyCode == 37) {
                redRidingHood.movingDirection.left = false;
            } else if (e.keyCode == 39) {
                redRidingHood.movingDirection.right = false;
            } else if (e.keyCode == 38) {
                redRidingHood.movingDirection.up = false;
            } else if (e.keyCode == 40) {
                redRidingHood.movingDirection.down = false;
            }
        });

        return () => {
            // Clear the canvas
            ctx.clearRect(0, 0, 800, 600);
            ctx.drawImage(bgImage, 0, 0, 800, 600);
            drawPath(ctx);
            ctx.drawImage(
                houseSprite,
                constants.momHouseSprite.x,
                constants.momHouseSprite.y,
                14*constants.momHouseSprite.size,
                11*constants.momHouseSprite.size
            );
            ctx.drawImage(
                houseSprite,
                constants.grandmaHouseSprite.x,
                constants.grandmaHouseSprite.y,
                14*constants.grandmaHouseSprite.size,
                11*constants.grandmaHouseSprite.size
            );

            redRidingHood.update();
            ctx.drawImage(redRidingHoodSprite,
                Math.floor(redRidingHood.animationStep) * constants.redRidingHood.spriteSize.width, // sprite offset
                redRidingHood.state * constants.redRidingHood.spriteSize.height,
                constants.redRidingHood.spriteSize.width,
                constants.redRidingHood.spriteSize.height,
                redRidingHood.x,
                redRidingHood.y,
                constants.redRidingHood.actualSize.width,
                constants.redRidingHood.actualSize.height
            );

            ctx.drawImage(
                forestSprite,
                constants.forestSprite.x,
                constants.forestSprite.y,
                69*constants.forestSprite.size,
                45*constants.forestSprite.size
            );

            requestAnimationFrame(animate);
        }
    })();

    animate();
});
