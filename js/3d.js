
/* global THREE, document, URL_GLOBULE, URL_CERISE */

var Background = function (scene, backgroundColor, starNumber) {
    this.scene = scene;

    this.backgroundColor = backgroundColor;
    this.starNumber = starNumber;


    var starSize = 20;
    var geometryStar = new THREE.SphereGeometry(starSize, 16, 16);

    var starModele = new THREE.Mesh(geometryStar);

    this.initStars(starModele);
    this.addBigStars(starModele);

    this.scene.background = new THREE.Color(this.backgroundColor);

};

Background.prototype.addBigStars = function (star) {

    this.bigStar = star.clone();

    var randomColor = '#';
    var color = Math.floor(Math.random() * 16777215).toString(16);
    for (var u = 0; u < (6 - color.length); u++) {
        randomColor += '0';
    }
    randomColor += color;
    this.bigStar.material = new THREE.MeshBasicMaterial({color: randomColor, wireframe: true});
    ;


    this.initBigStarPosition(this.bigStar);

    var scale = Math.random() * 400;
    this.bigStar.scale.set(scale, scale, scale);
    this.bigStar.initialScale = scale;

    this.scene.add(this.bigStar);
};

Background.prototype.initStars = function (star) {
    this.stars = [];
    for (var i = 0; i < this.starNumber; i++) {


        var newStar = star.clone();

        var randomColor = '#';
        var color = Math.floor(Math.random() * 16777215).toString(16);
        for (var u = 0; u < (6 - color.length); u++) {
            randomColor += '0';
        }
        randomColor += color;

        var material = new THREE.MeshBasicMaterial({color: randomColor, wireframe: true});
        newStar.material = material;


        this.initStarPosition(newStar);

        var scale = Math.random();
        newStar.scale.set(scale, scale, scale);
        newStar.initialScale = scale;

        this.scene.add(newStar);
        this.stars.push(newStar);
    }


};

Background.prototype.initBigStarPosition = function (star) {
    star.position.x = Math.floor((Math.random() * 6400) + 1) - 3200;
    star.position.y = Math.floor((Math.random() * 8800) + 1) - 400;
    star.position.z = Math.floor((Math.random() * 1000) + 1) - 10;
};

Background.prototype.initStarPosition = function (star) {
    star.position.x = Math.floor((Math.random() * 6400) + 1) - 3200;
    star.position.y = Math.floor((Math.random() * 8800) + 1) - 400;
    star.position.z = Math.floor((Math.random() * 10) + 1) - 10;
};


Background.prototype.animate = function () {
    for (var key in this.stars) {
        this.stars[key].rotation.x += 0.01;
        this.stars[key].rotation.y += 0.01;

        this.animateStarBreath(this.stars[key]);
        this.animateStarSlide(this.stars[key]);
    }

    this.bigStar.rotation.x -= 0.01;
    this.bigStar.rotation.y -= 0.01;
    this.bigStar.rotation.z += 0.01;
    this.animateBigStarSlide();

};



Background.prototype.animateStarBreath = function (star) {
    if (typeof star.inspire === "undefined" || typeof star.expire === "undefined") {
        star.inspire = false;
        star.expire = false;
    }
    if (star.scale.x > star.initialScale - 1) {
        star.expire = true;
        star.inspire = false;
    } else if (star.scale.x <= star.initialScale + 1) {
        star.inspire = true;
        star.expire = false;
    }

    if (star.inspire) {
        star.scale.set(star.scale.x + 0.01, star.scale.y + 0.01, star.scale.z + 0.01);
    }

    if (star.expire) {
        star.scale.set(star.scale.x - 0.01, star.scale.y - 0.01, star.scale.z - 0.01);
    }

};

Background.prototype.animateBigStarSlide = function () {
    this.bigStar.position.y -= 10;


    if (this.bigStar.position.y < -1400) {
        this.bigStar.position.y = 14000;
    }
};

Background.prototype.animateStarSlide = function (star) {
    star.position.y += 10 * (star.position.z - 1);

    if (star.position.y < -400) {
        star.position.y = 8400;
    }
};

var Level = function (ship, side) {
    this.ship = ship;
    this.scene = ship.scene;

    this.level = 1;
    this.maxLevel = 100;

    this.currentXp = 0;
    this.totalXpForNextLevel = 10;

    if (side === 'left') {
        this.position = {x: -3000, y: 100, z: 1000};
    }
    if (side === 'right') {
        this.position = {x: 2000, y: 100, z: 1000};
    }

    this.textLevel = new TextLevel(this, this.level);
    this.barLevel = new BarLevel(this, 0);
};

Level.prototype.update = function () {

    var point1 = {
        x: this.position.x + 0,
        y: this.position.y - 200
    };

    var point2 = {
        x: this.position.x + 0,
        y: this.position.y + -100
    };

    var point3 = {
        x: this.position.x + 1 + (1000 * this.currentXp / this.totalXpForNextLevel),
        y: this.position.y - 100
    };

    var point4 = {
        x: this.position.x + 1 + (1000 * this.currentXp / this.totalXpForNextLevel),
        y: this.position.y + -200
    };

    this.barLevel.levelXPBar.geometry.vertices[0].x = point1.x;
    this.barLevel.levelXPBar.geometry.vertices[0].y = point1.y;

    this.barLevel.levelXPBar.geometry.vertices[1].x = point2.x;
    this.barLevel.levelXPBar.geometry.vertices[1].y = point2.y;

    this.barLevel.levelXPBar.geometry.vertices[2].x = point3.x;
    this.barLevel.levelXPBar.geometry.vertices[2].y = point3.y;

    this.barLevel.levelXPBar.geometry.vertices[3].x = point4.x;
    this.barLevel.levelXPBar.geometry.vertices[3].y = point4.y;

    this.barLevel.levelXPBar.geometry.verticesNeedUpdate = true;



};

var BarLevel = function (levelItem) {


    this.levelItem = levelItem;

    this.addFontBar();
    this.addXPBar();
};

BarLevel.prototype.addFontBar = function () {

    //cadre
    var rectShapeBase = new THREE.Shape();

    var point1 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y - 200
    };

    var point2 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y + -100
    };

    var point3 = {
        x: this.levelItem.position.x + 1000,
        y: this.levelItem.position.y - 100
    };

    var point4 = {
        x: this.levelItem.position.x + 1000,
        y: this.levelItem.position.y + -200
    };

    rectShapeBase.moveTo(point1.x, point1.y);

    rectShapeBase.lineTo(point2.x, point2.y);
    rectShapeBase.lineTo(point3.x, point3.y);
    rectShapeBase.lineTo(point4.x, point4.y);
    rectShapeBase.lineTo(point1.x, point1.y);

    var geometry = rectShapeBase.makeGeometry();
    var material = new THREE.LineBasicMaterial({
        color: 0xffffff
    });

    this.levelFontBar = new THREE.Mesh(geometry, material);
    this.levelFontBar.position.z = this.levelItem.position.z;
    this.levelItem.scene.add(this.levelFontBar);
};

BarLevel.prototype.addXPBar = function () {

    //cadre
    var rectShapeBase = new THREE.Shape();

    var point1 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y - 200
    };

    var point2 = {
        x: this.levelItem.position.x + 0,
        y: this.levelItem.position.y + -100
    };

    var point3 = {
        x: this.levelItem.position.x + 1 + (1000 * this.levelItem.currentXp / this.levelItem.totalXpForNextLevel),
        y: this.levelItem.position.y - 100
    };

    var point4 = {
        x: this.levelItem.position.x + 1 + (1000 * this.levelItem.currentXp / this.levelItem.totalXpForNextLevel),
        y: this.levelItem.position.y + -200
    };

    rectShapeBase.moveTo(point1.x, point1.y);

    rectShapeBase.lineTo(point2.x, point2.y);
    rectShapeBase.lineTo(point3.x, point3.y);
    rectShapeBase.lineTo(point4.x, point4.y);
    rectShapeBase.lineTo(point1.x, point1.y);

    var geometry = rectShapeBase.makeGeometry();
    var material = new THREE.LineBasicMaterial({
        color: 'gold'
    });

    this.levelXPBar = new THREE.Mesh(geometry, material);
    this.levelXPBar.position.z = this.levelItem.position.z;
    this.levelItem.scene.add(this.levelXPBar);
};

var TextLevel = function (levelItem) {
    this.levelItem = levelItem;

    this.textLevel = 'Niveau ' + this.levelItem.level;

    var loader = new THREE.FontLoader();
    var self = this;
    loader.load(URL_FONT, function (font) {
        self.initFont(font);
    });

};

TextLevel.prototype.initFont = function (font) {
    if (!this.font) {
        this.font = font;
    }

    if (this.mesh) {
        this.levelItem.scene.remove(this.mesh);
    }

    var material = new THREE.MeshPhongMaterial({
        color: 0xdddddd
    });

    var textGeom = new THREE.TextGeometry('Niveau ' + this.levelItem.level, {
        size: 160,
        height: 60,
        font: font,
        color: 'red',
        fontName: 'helvetiker',
        weight: 'normal',
        style: 'normal'
    });

    this.mesh = new THREE.Mesh(textGeom, material);

    this.mesh.position.x = this.levelItem.position.x + 100;
    this.mesh.position.y = this.levelItem.position.y;
    this.mesh.position.z = this.levelItem.position.z;


    this.levelItem.scene.add(this.mesh);
};


TextLevel.prototype.update = function () {
    this.initFont(this.font);
};

var LifeBar = function (itemRattached, maxLife, currentLife) {
    this.itemRattached = itemRattached;

    if (!maxLife) {
        maxLife = 10;
    }

    if (!currentLife) {
        currentLife = maxLife;
    }

    this.itemRattached.hp = currentLife;
    this.itemRattached.maxHp = maxLife;

    var material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
            new THREE.Vector3(this.itemRattached.position.x - 200, this.itemRattached.position.y - 400, this.itemRattached.position.z),
            new THREE.Vector3(this.itemRattached.position.x + 200, this.itemRattached.position.y - 400, this.itemRattached.position.z)
            );

    this.line = new THREE.Line(geometry, material);
    this.itemRattached.scene.add(this.line);

    //cadre
    var rectShape = new THREE.Shape();
    rectShape.moveTo(this.itemRattached.position.x - 220, this.itemRattached.position.y - 420);
    rectShape.lineTo(this.itemRattached.position.x - 220, this.itemRattached.position.y - 380);
    rectShape.lineTo(this.itemRattached.position.x + 220, this.itemRattached.position.y - 380);
    rectShape.lineTo(this.itemRattached.position.x + 220, this.itemRattached.position.y - 420);
    rectShape.lineTo(this.itemRattached.position.x - 220, this.itemRattached.position.y - 420);

    var geometry = rectShape.makeGeometry();
    var material = new THREE.MeshBasicMaterial({color: 0x00ffff});
    this.lifeCadre = new THREE.Mesh(geometry, material);
    this.itemRattached.scene.add(this.lifeCadre);


};


LifeBar.prototype.destroy = function () {
    this.itemRattached.scene.remove(this.line);
    this.itemRattached.scene.remove(this.lifeCadre);
};

LifeBar.prototype.updatePosition = function () {

    this.line.geometry.vertices[0].x = this.itemRattached.position.x - 200;
    this.line.geometry.vertices[0].y = this.itemRattached.position.y - 400;
    this.line.geometry.vertices[0].z = this.itemRattached.position.z + 200;

    this.line.geometry.vertices[1].x = this.line.geometry.vertices[0].x + 400 * (this.itemRattached.hp / this.itemRattached.maxHp);
    this.line.geometry.vertices[1].y = this.line.geometry.vertices[0].y;
    this.line.geometry.vertices[1].z = this.line.geometry.vertices[0].z;

    this.line.geometry.verticesNeedUpdate = true;



    this.lifeCadre.geometry.vertices[0].x = this.itemRattached.position.x - 220;
    this.lifeCadre.geometry.vertices[0].y = this.itemRattached.position.y - 420;
    this.lifeCadre.geometry.vertices[0].z = this.itemRattached.position.z + 200;

    this.lifeCadre.geometry.vertices[1].x = this.itemRattached.position.x - 220;
    this.lifeCadre.geometry.vertices[1].y = this.itemRattached.position.y - 380;
    this.lifeCadre.geometry.vertices[1].z = this.itemRattached.position.z + 200;

    this.lifeCadre.geometry.vertices[2].x = this.itemRattached.position.x + 220;
    this.lifeCadre.geometry.vertices[2].y = this.itemRattached.position.y - 380;
    this.lifeCadre.geometry.vertices[2].z = this.itemRattached.position.z + 200;

    this.lifeCadre.geometry.vertices[3].x = this.itemRattached.position.x + 220;
    this.lifeCadre.geometry.vertices[3].y = this.itemRattached.position.y - 420;
    this.lifeCadre.geometry.vertices[3].z = this.itemRattached.position.z + 200;

    this.lifeCadre.geometry.verticesNeedUpdate = true;

};

var Ship = function (scene, mesh, munition) {
    this.mesh = mesh;
    this.scene = scene;
    this.scene.add(this.mesh);

    this.scene.ship = this;
    this.scene.ships.push(this);
    this.position = this.mesh.position;

    this.lastMunitionCreated = null;
    this.scale = 1;
    this.munitions = [];
    this.level = new Level(this, 'right');



    this.atkRange = 10000; //px ?
    this.atkSpeed = 100; //ms

    this.munition = munition;

    this.deplacements = {'up': false, 'down': false, 'left': false, 'right': false};
    this.shooting = false;
    this.munitionSpeed = 200;

    this.addLifeBar();

};



Ship.prototype.addExp = function (exp) {

    for (var i = 1; i <= exp; i++) {
        if ((this.level.currentXp + 1) > this.level.totalXpForNextLevel) {
            this.level.level += 1;
            this.level.textLevel.update();
            this.level.currentXp = 0;
            this.level.totalXpForNextLevel = this.level.level * 10;
        } else {
            this.level.currentXp += 1;
        }
    }
    this.level.update();

};

Ship.prototype.addLifeBar = function () {
    this.lifeBar = new LifeBar(this);
};

Ship.prototype.animateRotation = function () {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;
};

Ship.prototype.animateShoot = function () {
    if (this.shooting) {
        this.attack();
    }
    this.animateMunition();
};


Ship.prototype.animateMunition = function () {

    for (var key in this.munitions) {

        var munition = this.munitions[key];
        var deplacements = munition.deplacementOfShipWhenShooting;

        switch (true) {
            case (deplacements.left && deplacements.right && deplacements.up && deplacements.down):
                break;
            case (deplacements.left && deplacements.right):
                switch (true) {
                    case deplacements.up:
                        munition.position.y += 100;
                        break;
                    case deplacements.down :
                        munition.position.y -= 100;
                        break;
                }
                break;

            case (deplacements.up && deplacements.down) :
                switch (true) {
                    case deplacements.left:
                        munition.position.x -= 100;
                        break;
                    case deplacements.right:
                        munition.position.x += 100;
                        break;
                }
                break;


            case (deplacements.down && deplacements.right):
                munition.position.y -= 50;
                munition.position.x += 50;
                break;
            case (deplacements.up && deplacements.right):
                munition.position.y += 50;
                munition.position.x += 50;
                break;

            case (deplacements.left && deplacements.down):
                munition.position.y -= 50;
                munition.position.x -= 50;
                break;
            case (deplacements.left && deplacements.up):
                munition.position.y += 50;
                munition.position.x -= 50;
                break;

            case (deplacements.right):
                munition.position.x += 100;
                break;

            case (deplacements.left):
                munition.position.x -= 100;
                break;

            case (deplacements.up):
                munition.position.y += 100;
                break;

            case (deplacements.down):
                munition.position.y -= 100;
                break;

        }

        munition.position.y += this.munitionSpeed;


        if (munition.position.y - this.getPosition().y > this.atkRange) {
            this.munitions.splice(key, 1);
            this.scene.remove(munition);
        }

        for (var i in this.scene.ennemies) {
            var ennemi = this.scene.ennemies[i];
            // si l'ennemi est aux meme coordonnées que ma munition
            if (ennemi.isAtSamePositionThan(munition.position)) {
                this.scene.remove(munition);
                this.munitions.splice(key, 1);


                ennemi.hp -= 1;

                if (ennemi.hp < 1) {
                    ennemi.destroy();
                }
            }

            continue;
        }
    }
};

Ship.prototype.animateDeplacements = function () {
    var position = this.mesh.position;
    var deplacements = this.deplacements;

    switch (true) {
        case (deplacements.left && deplacements.right && deplacements.up && deplacements.down):
            break;
        case (deplacements.left && deplacements.right):
            switch (true) {
                case deplacements.up:
                    this.setPosition(position.x, position.y + 100, position.z);
                    break;
                case deplacements.down :
                    this.setPosition(position.x, position.y - 100, position.z);
                    break;
            }
            break;

        case (deplacements.up && deplacements.down) :
            switch (true) {
                case deplacements.left:
                    this.setPosition(position.x - 100, position.y, position.z);
                    break;
                case deplacements.right:
                    this.setPosition(position.x + 100, position.y, position.z);
                    break;
            }
            break;


        case (deplacements.down && deplacements.right):
            this.setPosition(position.x + 50, position.y - 50, position.z);
            break;
        case (deplacements.up && deplacements.right):
            this.setPosition(position.x + 50, position.y + 50, position.z);
            break;

        case (deplacements.left && deplacements.down):
            this.setPosition(position.x - 50, position.y - 50, position.z);
            break;
        case (deplacements.left && deplacements.up):
            this.setPosition(position.x - 50, position.y + 50, position.z);
            break;

        case (deplacements.right):
            this.setPosition(position.x + 100, position.y, position.z);
            break;

        case (deplacements.left):
            this.setPosition(position.x - 100, position.y, position.z);
            break;

        case (deplacements.up):
            this.setPosition(position.x, position.y + 100, position.z);
            break;

        case (deplacements.down):
            this.setPosition(position.x, position.y - 100, position.z);
            break;
    }
};

Ship.prototype.animate = function () {
    this.animateRotation();
    this.animateShoot();
    this.animateDeplacements();
    this.lifeBar.updatePosition();
};

Ship.prototype.getPosition = function () {
    return this.mesh.position;
};

Ship.prototype.setPosition = function (x, y, z) {

    this.minX = -3200;
    this.maxX = 3200;

    this.minY = -400;
    this.maxY = 8400;

    this.minZ = 0;
    this.maxZ = 0;

    if (x < this.minX) {
        x = this.minX;
    }
    if (x > this.maxX) {
        x = this.maxX;
    }

    if (y < this.minY) {
        y = this.minY;
    }
    if (y > this.maxY) {
        y = this.maxY;
    }

    if (z < this.minZ) {
        z = this.minZ;
    }
    if (z > this.maxZ) {
        z = this.maxZ;
    }

    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
};

Ship.prototype.levelUp = function () {
    this.level++;
    this.atkSpeed -= 20;
//    this.atkRange += 100;
};



Ship.prototype.shipGrowDown = function () {
    if (this.scale > 1.000) {
        this.scale -= 0.04;
    }
    this.ship.scale.set(this.scale, this.scale, this.scale);
};

Ship.prototype.shipGrowUp = function () {
    if (this.scale < 2) {
        this.scale += 0.04;
    }
    this.mesh.scale.set(this.scale, this.scale, this.scale);
};



Ship.prototype.canMunitionBeingLaunch = function () {
    return !this.lastMunitionCreated || (+new Date() - this.lastMunitionCreated) > this.atkSpeed;
};

Ship.prototype.attack = function () {

    this.shipGrowUp();

    if (this.canMunitionBeingLaunch()) {
        this.launchMunition();
    }

};




Ship.prototype.launchMunition = function () {
    var munition = this.munition.clone();

    munition.position.x = this.getPosition().x;
    munition.position.y = this.getPosition().y;
    munition.position.z = this.getPosition().z;

    munition.deplacementOfShipWhenShooting = JSON.parse(JSON.stringify(this.deplacements));

    this.scene.add(munition);
    this.munitions.push(munition);

    this.lastMunitionCreated = +new Date();
    return munition;
};

Ship.prototype.shipBreath = function () {
    if (typeof this.inspire === "undefined" || typeof this.expire === "undefined") {
        this.inspire = false;
        this.expire = false;
    }

    if (this.scale > 1.500) {
        this.expire = true;
        this.inspire = false;
    } else if (this.scale <= 1.000) {
        this.inspire = true;
        this.expire = false;
    }


    if (this.inspire) {
        this.scale += 0.010;
    }
    if (this.expire) {
        this.scale -= 0.010;
    }

    this.mesh.scale.set(this.scale, this.scale, this.scale);

};




var Ennemi = function (scene, mesh, popPosition, deplacements) {
    this.mesh = mesh;
    this.scene = scene;
    this.scene.add(this.mesh);

    this.scene.ennemies.push(this);


    this.scale = 1;

    this.mesh.position.x = popPosition.x;
    this.mesh.position.y = popPosition.y;
    this.mesh.position.z = popPosition.z;

    this.position = this.mesh.position;

    this.deplacements = deplacements;
    this.dateFirstMove = +new Date();
    this.maxHp = 6;
    this.hp = 6;

    this.addLifeBar();

};

Ennemi.prototype.addLifeBar = function () {
    this.lifeBar = new LifeBar(this, this.maxHp, this.hp);
};


Ennemi.prototype.getPosition = function () {
    return this.mesh.position;
};


Ennemi.prototype.animate = function () {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;

    var jeton = null;
    for (var u in this.deplacements) {
        if ((+new Date() - this.dateFirstMove) >= u) {
            jeton = u;
        }
    }
    if (jeton) {
        switch (this.deplacements[jeton]) {
            case 'up' :
                this.mesh.position.y += 10;
                break;
            case 'down' :
                this.mesh.position.y -= 10;
                break;
            case 'left' :
                this.mesh.position.x -= 10;
                break;
            case 'right' :
                this.mesh.position.x += 10;
                break;
        }
    }

    if (this.mesh.position.y < -400) {
        this.destroy();
    }

    this.lifeBar.updatePosition();

};

Ennemi.prototype.isAtSamePositionThan = function (position) {
//    return false;
    var radius = this.mesh.geometry.boundingSphere.radius;
    var ePos = this.mesh.position;

    return(
            position.x > (ePos.x - radius) && position.x < (ePos.x + radius)
            && position.y > (ePos.y - radius) && position.y < (ePos.y + radius)
            && position.z > (ePos.z - radius) && position.z < (ePos.z + radius)
            );
};

Ennemi.prototype.destroy = function () {
    this.scene.remove(this.mesh);
    this.lifeBar.destroy();

    this.scene.ship.addExp(2);

    for (var key in this.scene.ennemies) {
        if (this.scene.ennemies[key] === this) {
            this.scene.ennemies.splice(key, 1);
        }
    }

};


/**
 * @description ""
 * @constructor
 * 
 */
var SphereGame = function () {

    this.renderer, this.scene, this.camera, this.mainSphere = null;
    console.log(document.getElementById('3d'));
    this.gameDiv = document.getElementById('3d');

    this.srcMainSphereMaterial = URL_GLOBULE;
    this.srcMunitionMaterial = URL_CERISE;

    var self = this;
    this.animate = function () {

        // on appel la fonction animate() récursivement à chaque frame
        requestAnimationFrame(self.animate);

        self.background.animate();
        self.ship.shipBreath();



        for (var i in self.scene.ships) {
            self.scene.ships[i].animate();
        }
        for (var i in self.scene.ennemies) {
            self.scene.ennemies[i].animate();

        }

        // on fait tourner le cube sur ses axes x et y
        self.ship.mesh.rotation.x += 0.01;
        self.ship.mesh.rotation.y += 0.02;
        // on effectue le rendu de la scène
        self.renderer.render(self.scene, self.camera);
    };



    this.init();
    this.addKeyboardManager();
    this.animate();

};

SphereGame.prototype.init = function () {
    // on initialise le moteur de rendu
    this.renderer = new THREE.WebGLRenderer();

    // si WebGL ne fonctionne pas sur votre navigateur vous pouvez utiliser le moteur de rendu Canvas à la place
    // renderer = new THREE.CanvasRenderer();
    this.renderer.setSize(600, 800);
    this.gameDiv.appendChild(this.renderer.domElement);

    // on initialise la scène
    this.scene = new THREE.Scene();
    this.scene.ennemies = [];
    this.scene.ships = [];

    // on initialise la camera que l’on place ensuite sur la scène
    this.camera = new THREE.PerspectiveCamera(50, 600 / 800, 1, 10000);
    this.camera.position.set(0, 4000, 10000);
    this.scene.add(this.camera);


    this.background = new Background(this.scene, 'black', 100);

    // on créé une sphere à laquelle on définie un matériau puis on l’ajoute à la scène 
    // on créé la sphère et on lui applique une texture sous forme d’image
    var geometry = new THREE.SphereGeometry(200, 32, 32);
    var material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(this.srcMainSphereMaterial), overdraw: true});

    var geometryMunition = new THREE.SphereGeometry(100, 32, 32);
    var materialMunition = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture(this.srcMunitionMaterial), overdraw: true});
    var munition = new THREE.Mesh(geometryMunition, materialMunition);

    this.ship = new Ship(this.scene, new THREE.Mesh(geometry, material), munition);
    this.ships = [];
    this.ships.push(this.ship);


    // on ajoute une lumière blanche
    var lumiere = new THREE.DirectionalLight(0xffffff, 1.0);
    lumiere.position.set(0, 0, 400);
    this.scene.add(lumiere);



    var listOfMove = {0: 'down', 1: 'right', 2: 'up', 3: 'left'};



    this.ennemies = [];

    this.ennemiNumber = 100;

    for (var i = 0; i < this.ennemiNumber; i++) {
        var self = this;
        setTimeout(function () {
            // initialisation ennemi
            var popPosition = {
                x: ((Math.random() * 6400) + 1) - 3200,
                y: 8600,
                z: 0
            };
            var deplacements = {
                0: 'down',
                2000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
                4000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
                6000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
                8000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
                10000: 'down'
            };

            var geometry = new THREE.SphereGeometry(Math.floor((Math.random() * 300) + 100), 32, 32);

            self.ennemies.push(new Ennemi(self.scene, new THREE.Mesh(geometry, material), popPosition, deplacements));
        }, 1000 * i);
    }
    // fin initialisation ennemi
};


SphereGame.prototype.addKeyboardManager = function () {


    var self = this;


    document.onkeyup = function (key) {
        switch (key.keyCode) {
            case  32:
                self.ship.shooting = false;
                break;
            case  37:
                self.ship.deplacements.left = false;
                break;
            case  38:
                self.ship.deplacements.up = false;
                break;
            case  39:
                self.ship.deplacements.right = false;
                break;
            case  40:
                self.ship.deplacements.down = false;
                break;
        }
    };

    document.onkeydown = function (key) {
        switch (key.keyCode) {
            case  32:
                self.ship.shooting = true;
                break;
            case  37:
                self.ship.deplacements.left = true;
                break;
            case  38:
                self.ship.deplacements.up = true;
                break;
            case  39:
                self.ship.deplacements.right = true;
                break;
            case  40:
                self.ship.deplacements.down = true;
                break;
        }
    };

};

var game = new SphereGame();









