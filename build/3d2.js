(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var SphereGame = require('./SphereGame.js');

var textureMaterialUrls = [];
textureMaterialUrls['textures_player_ships'] = ['img/1.jpg'];
textureMaterialUrls['textures_munitions'] = ['img/2.jpg'];
textureMaterialUrls['textures_ennemi_ships'] = ['img/ennemi1.jpg', 'img/ennemi2.jpg', 'img/ennemi3.jpg', 'img/ennemi4.jpg'];
textureMaterialUrls['textures_big_stars'] = ['img/3.JPG', 'img/4.jpg'];


var debug = true;
game = new SphereGame(debug, textureMaterialUrls);










},{"./SphereGame.js":9}],2:[function(require,module,exports){
/* global THREE */

var Background = function (scene, backgroundColor, starNumber, bigStarsSrc) {
    this.scene = scene;

    this.backgroundColor = backgroundColor;
    this.starNumber = starNumber;
    this.srcBigStarMaterials = bigStarsSrc;

    var starSize = 20;
    var geometryStar = new THREE.SphereGeometry(starSize, 16, 16);

    var starModele = new THREE.Mesh(geometryStar);

    this.initStars(starModele);
    this.addBigStars();

    this.scene.background = new THREE.Color(this.backgroundColor);

};

Background.prototype.addBigStars = function () {
    var self = this;
    this.bigStarMaterial = [];
    var textureLoader = new THREE.TextureLoader();
    for (var i = 0; i < this.srcBigStarMaterials.length; i++) {
        textureLoader.load(
                this.srcBigStarMaterials[i],
                function (texture) {
                    texture.minFilter = THREE.LinearFilter;
                    self.bigStarMaterial.push(new THREE.MeshBasicMaterial({map: texture}));

                    if (self.srcBigStarMaterials.length === self.bigStarMaterial.length) {
                        self.createBigStar();
                    }
                },
                function (xhr) {
                    console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                }
        );
    }

};


Background.prototype.createBigStar = function () {
    var starSize = 10000;
    var geometryStar = new THREE.SphereGeometry(starSize, 32, 32);
    this.bigStar = new THREE.Mesh(geometryStar);

    this.initBigStarPosition();

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

Background.prototype.initBigStarPosition = function () {
    this.bigStar.speed = Math.floor(((Math.random() * 40) + 1));

    this.bigStar.position.x = Math.floor((Math.random() * 40000) + 1) - 20000;
    this.bigStar.position.y = 34000;
    this.bigStar.position.z = -15000;

    this.bigStar.scale.set(Math.floor((Math.random() * 10) + 5) / 10, Math.floor((Math.random() * 10) + 5) / 10, Math.floor((Math.random() * 10) + 5) / 10);

    this.bigStar.material = this.bigStarMaterial[Math.round((Math.random() * (this.bigStarMaterial.length - 1)) + 0)];

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
    if (this.bigStar) {
        this.bigStar.rotation.x -= 0.01;
        this.bigStar.rotation.y -= 0.01;
        this.bigStar.rotation.z += 0.01;
        this.animateBigStarSlide();
    }


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
    this.bigStar.position.y -= this.bigStar.speed;
    var self = this;
    if (this.bigStar.position.y < -24000) {

        setTimeout(function () {
            self.initBigStarPosition();
        }, 4000);
    }
};

Background.prototype.animateStarSlide = function (star) {
    star.position.y += 10 * star.position.z;

    if (star.position.y < -10000) {
        star.position.y = 20000;
    }
};


module.exports = Background;

},{}],3:[function(require,module,exports){
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


    var geometry = new THREE.ShapeGeometry(rectShapeBase);

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

    var geometry = new THREE.ShapeGeometry(rectShapeBase);
    var material = new THREE.LineBasicMaterial({
        color: 'gold'
    });

    this.levelXPBar = new THREE.Mesh(geometry, material);
    this.levelXPBar.position.z = this.levelItem.position.z;
    this.levelItem.scene.add(this.levelXPBar);
};

module.exports = BarLevel;
},{}],4:[function(require,module,exports){
var Ship = require('./Ship.js');

var EnnemiShip = function (scene, mesh, parameters) {

    this.ship = new Ship(scene, mesh, parameters);


    if (!this.ship.scene.ennemies) {
        this.ship.scene.ennemies = [];
    }
    this.ship.scene.ennemies.push(this);


    if (parameters) {

        if (parameters['popPosition']) {
            this.ship.popPosition = parameters['popPosition'];
        } else {
            this.ship.popPosition = this.getDefaultPopPosition();
        }


        if (parameters['autoDeplacements']) {
            this.ship.autoDeplacements = parameters['autoDeplacements'];
        } else {
            this.ship.autoDeplacements = this.getDefaultAutoDeplacements();
        }

        if (parameters['gainExp']) {
            this.gainExp = parameters['gainExp'];
        } else {
            this.gainExp = this.getDefaultGainExp();
        }

    }

    this.ship.initStartPosition(this.ship.popPosition);
    this.ship.addLifeBar();

    return this.ship;
};


EnnemiShip.prototype.getDefaultGainExp = function () {
    if (this.gainExp) {
        return this.gainExp;
    }

    return 1;
};

EnnemiShip.prototype.getDefaultAutoDeplacements = function () {
    if (this.autoDeplacements) {
        return this.autoDeplacements;
    }
    var listOfMove = {0: 'down', 1: 'right', 2: 'up', 3: 'left'};
    return {
        0: 'down',
        2000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        4000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        6000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        8000: listOfMove[Math.floor(((Math.random() * 4) + 1) - 1)],
        10000: 'down'
    };
};

/**
 * @description Renvoie la position de la position initiale d'un ennemi
 * actuellement le comportement est : random sur l'axe x, tout en haut sur l'axe y, 0 sur l'axe z
 * @returns {object}
 */
EnnemiShip.prototype.getDefaultPopPosition = function () {
    if (this.ship.popPosition) {
        return this.ship.popPosition;
    }

    return {
        x: ((Math.random() * (this.ship.scene.gameBoundLimit.maxX - this.ship.scene.gameBoundLimit.minX)) + 1) + this.ship.scene.gameBoundLimit.minX,
        y: this.ship.scene.gameBoundLimit.maxY,
        z: this.ship.scene.gameBoundLimit.minZ
    };
};


EnnemiShip.prototype.setPosition = function (x, y, z) {

    if (x < this.ship.scene.gameBoundLimit.minX) {
        x = this.ship.scene.gameBoundLimit.minX;
    }
    if (x > this.ship.scene.gameBoundLimit.maxX) {
        x = this.ship.scene.gameBoundLimit.maxX;
    }

    if (y < this.ship.scene.gameBoundLimit.minY) {
        y = this.ship.scene.gameBoundLimit.minY;
    }
    if (y > this.ship.scene.gameBoundLimit.maxY) {
        y = this.ship.scene.gameBoundLimit.maxY;
    }

    if (z < this.ship.scene.gameBoundLimit.minZ) {
        z = this.ship.scene.gameBoundLimit.minZ;
    }
    if (z > this.ship.scene.gameBoundLimit.maxZ) {
        z = this.ship.scene.gameBoundLimit.maxZ;
    }

    this.ship.mesh.position.x = x;
    this.ship.mesh.position.y = y;
    this.ship.mesh.position.z = z;
};



EnnemiShip.prototype.animate = function () {
    this.ship.animateAutoDeplacements();
    this.ship.lifeBar.updatePosition();
};



EnnemiShip.prototype.destroy = function (ship) {

    if (ship) {
        ship.addExp(this.gainExp);
    }
    this.ship.scene.remove(this.ship.mesh);
    this.lifeBar.destroy();

    for (var key in this.ship.scene.ennemies) {
        if (this.ship.scene.ennemies[key] === this) {
            this.ship.scene.ennemies.splice(key, 1);
        }
    }

};


module.exports = EnnemiShip;
},{"./Ship.js":8}],5:[function(require,module,exports){
var TextLevel = require('./TextLevel.js');
var BarLevel = require('./BarLevel.js');

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

module.exports = Level;
},{"./BarLevel.js":3,"./TextLevel.js":10}],6:[function(require,module,exports){
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
            new THREE.Vector3(this.itemRattached.mesh.position.x - 200, this.itemRattached.mesh.position.y - 400, this.itemRattached.mesh.position.z),
            new THREE.Vector3(this.itemRattached.mesh.position.x + 200, this.itemRattached.mesh.position.y - 400, this.itemRattached.mesh.position.z)
            );

    this.line = new THREE.Line(geometry, material);
    this.itemRattached.scene.add(this.line);

    //cadre
    var rectShape = new THREE.Shape();
    rectShape.moveTo(this.itemRattached.mesh.position.x - 220, this.itemRattached.mesh.position.y - 420);
    rectShape.lineTo(this.itemRattached.mesh.position.x - 220, this.itemRattached.mesh.position.y - 380);
    rectShape.lineTo(this.itemRattached.mesh.position.x + 220, this.itemRattached.mesh.position.y - 380);
    rectShape.lineTo(this.itemRattached.mesh.position.x + 220, this.itemRattached.mesh.position.y - 420);
    rectShape.lineTo(this.itemRattached.mesh.position.x - 220, this.itemRattached.mesh.position.y - 420);


    var geometry = new THREE.ShapeGeometry(rectShape);
    var material = new THREE.MeshBasicMaterial({color: 0x00ffff});
    this.lifeCadre = new THREE.Mesh(geometry, material);
    this.itemRattached.scene.add(this.lifeCadre);


};


LifeBar.prototype.destroy = function () {
    this.itemRattached.scene.remove(this.line);
    this.itemRattached.scene.remove(this.lifeCadre);
};

LifeBar.prototype.updatePosition = function () {

    this.line.geometry.vertices[0].x = this.itemRattached.mesh.position.x - 200;
    this.line.geometry.vertices[0].y = this.itemRattached.mesh.position.y - 400;
    this.line.geometry.vertices[0].z = this.itemRattached.mesh.position.z + 200;

    this.line.geometry.vertices[1].x = this.line.geometry.vertices[0].x + 400 * (this.itemRattached.hp / this.itemRattached.maxHp);
    this.line.geometry.vertices[1].y = this.line.geometry.vertices[0].y;
    this.line.geometry.vertices[1].z = this.line.geometry.vertices[0].z;

    this.line.geometry.verticesNeedUpdate = true;



    this.lifeCadre.geometry.vertices[0].x = this.itemRattached.mesh.position.x - 220;
    this.lifeCadre.geometry.vertices[0].y = this.itemRattached.mesh.position.y - 420;
    this.lifeCadre.geometry.vertices[0].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.vertices[1].x = this.itemRattached.mesh.position.x - 220;
    this.lifeCadre.geometry.vertices[1].y = this.itemRattached.mesh.position.y - 380;
    this.lifeCadre.geometry.vertices[1].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.vertices[2].x = this.itemRattached.mesh.position.x + 220;
    this.lifeCadre.geometry.vertices[2].y = this.itemRattached.mesh.position.y - 380;
    this.lifeCadre.geometry.vertices[2].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.vertices[3].x = this.itemRattached.mesh.position.x + 220;
    this.lifeCadre.geometry.vertices[3].y = this.itemRattached.mesh.position.y - 420;
    this.lifeCadre.geometry.vertices[3].z = this.itemRattached.mesh.position.z + 200;

    this.lifeCadre.geometry.verticesNeedUpdate = true;

};

module.exports = LifeBar;

},{}],7:[function(require,module,exports){
var Ship = require('./Ship.js');
var Level = require('./Level.js');

/* global THREE, document */

var PlayerShip = function (scene, mesh, parameters) {
    this.ship = new Ship(scene, mesh, parameters);

    if (!this.ship.scene.playerShips) {
        this.ship.scene.playerShips = [];
    }

    this.ship.scene.playerShips.push(this);


    if (parameters) {

        if (parameters['popPosition']) {
            this.ship.popPosition = parameters['popPosition'];
        } else {
            this.ship.popPosition = this.getDefaultPopPosition();
        }

        if (parameters['levelPosition']) {
            this.levelPosition = parameters['levelPosition'];
        } else {
            this.levelPosition = 'right';
        }

        if (parameters['munitionModele']) {
            this.ship.munitionModele = parameters['munitionModele'];
        } else {
            this.ship.munitionModele = this.ship.getDefaultMunitionModele();
        }

    }

    this.ship.initStartPosition(this.ship.popPosition);

    this.level = new Level(this.ship, this.levelPosition);
    this.ship.addLifeBar();

    return this.ship;
};

PlayerShip.prototype.getDefaultPopPosition = function () {
    if (this.ship.popPosition) {
        return this.ship.popPosition;
    }

    return {
        x: (this.ship.scene.gameBoundLimit.maxX - this.ship.scene.gameBoundLimit.minX) / 2,
        y: this.ship.scene.gameBoundLimit.minY,
        z: this.ship.scene.gameBoundLimit.minZ
    };
};


PlayerShip.prototype.destroy = function () {
    this.ship.scene.remove(this.ship.mesh);
    this.lifeBar.destroy();

    for (var key in this.ship.scene.playerShips) {
        if (this.ship.scene.playerShips[key] === this) {
            this.finishAnimateMunitionThenDestroy = true;
            this.shooting = false;
        }
    }

};

PlayerShip.prototype.destroyMunition = function (keyToRemove) {

    this.ship.scene.remove(this.ship.munitions[keyToRemove]);
    this.ship.munitions.splice(keyToRemove, 1);
};

PlayerShip.prototype.addExp = function (exp) {

    for (var i = 1; i <= exp; i++) {
        if ((this.level.currentXp + 1) > this.level.totalXpForNextLevel) {
            this.levelUp();
        } else {
            this.level.currentXp += 1;
        }
    }
    this.level.update();

};




PlayerShip.prototype.cameraFollowShip = function () {

    var x = (this.ship.scene.camera.position.x - (this.ship.scene.camera.position.x - this.ship.mesh.position.x) / 10);
    if (Math.round(this.ship.scene.camera.position.x) - Math.round(this.ship.mesh.position.x) === 0) {
        x = this.ship.mesh.position.x;
    }

    var y = (this.ship.scene.camera.position.y - (this.ship.scene.camera.position.y - this.ship.mesh.position.y) / 10);
    if (Math.round(this.ship.scene.camera.position.y) - Math.round(this.ship.mesh.position.y) === 0) {
        y = this.ship.mesh.position.y;
    }

    this.ship.scene.camera.position.set(x, y, this.ship.scene.camera.position.z);

};

PlayerShip.prototype.cameraFixed = function () {

    var x = (this.ship.scene.camera.position.x - (this.ship.scene.camera.position.x - this.ship.scene.initialCameraPosition.x) / 10);
    if (Math.round(this.ship.scene.camera.position.x) - Math.round(this.ship.scene.initialCameraPosition.x) === 0) {
        x = this.ship.scene.initialCameraPosition.x;
    }

    var y = (this.ship.scene.camera.position.y - (this.ship.scene.camera.position.y - this.ship.scene.initialCameraPosition.y) / 10);
    if (Math.round(this.ship.scene.camera.position.y) - Math.round(this.ship.scene.initialCameraPosition.y) === 0) {
        y = this.ship.scene.initialCameraPosition.y;
    }

    var z = this.ship.scene.camera.position.z;
    if (this.ship.scene.ships.length !== 1) {
        z = this.ship.scene.initialCameraPosition.z;
    }
    this.ship.scene.camera.position.set(x, y, z);

    if (this.ship.scene.camera.RotationXSinceInitial !== this.initialRotationX) {
        var rotation = this.ship.scene.camera.RotationXSinceInitial * (-1);
        this.ship.scene.camera.rotateX(rotation);
        this.ship.scene.camera.RotationXSinceInitial += rotation;
    }


};


PlayerShip.prototype.animateCamera = function () {

    if (!this.ship.scene.followShip) {
        this.cameraFixed();
    } else {
        this.cameraFollowShip();
    }
};




PlayerShip.prototype.animate = function () {

    this.ship.animateRotation();
    this.ship.shipBreath();
    this.ship.animateCollision();
    this.ship.animateShoot();
    this.ship.animateDeplacements();
    
};



module.exports = PlayerShip;
},{"./Level.js":5,"./Ship.js":8}],8:[function(require,module,exports){
var LifeBar = require('./LifeBar.js');

/* global THREE, document */

var Ship = function (scene, mesh, parameters) {
    this.mesh = mesh;
    this.scene = scene;
    this.scene.add(this.mesh);

//    this.scene.ships.push(this);

    this.dateCreation = +new Date();
    this.maxHp = 6;
    this.hp = 6;

    this.scale = 1;
    this.scaleBreathMax = 1.500;
    this.scaleBreathMin = 1.000;



    this.lastMunitionCreated = null;
    this.munitions = [];

    this.atkRange = 10000; //px ?
    this.atkSpeed = 200; //ms

    this.munitionDamage = 1;
    this.shooting = false;
    this.munitionSpeed = 150;
    this.munitionSpeedMax = 300;

    this.deplacements = {'up': false, 'down': false, 'left': false, 'right': false};
    this.mouseShooting = {'rightUp': false, 'leftUp': false};

};


Ship.prototype.getDefaultMunitionModele = function () {
    if (this.munitionModele) {
        return this.munitionModele;
    }


    var munitionSize = 100;
    var munitionGeometry = new THREE.SphereGeometry(munitionSize, 32, 32);
    var munitionMaterial = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});

    var munitionModele = new THREE.Mesh(munitionGeometry);
    munitionModele.material = munitionMaterial;

    return munitionModele;
};

Ship.prototype.initStartPosition = function (position) {
    if (this.mesh) {
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
    }
};

Ship.prototype.destroy = function () {
    this.scene.remove(this.mesh);
    this.lifeBar.destroy();

    for (var key in this.scene.playersShips) {
        if (this.scene.playersShips[key] === this) {
            this.finishAnimateMunitionThenDestroy = true;
            this.shooting = false;
        }
    }

};

Ship.prototype.destroyMunition = function (keyToRemove) {
    this.scene.remove(this.munitions[keyToRemove]);
    this.munitions.splice(keyToRemove, 1);
};

Ship.prototype.addExp = function (exp) {

    for (var i = 1; i <= exp; i++) {
        if ((this.level.currentXp + 1) > this.level.totalXpForNextLevel) {
            this.levelUp();
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

    if (this.munitions.length > 0) {
        this.animateMunition();
    } else if (this.finishAnimateMunitionThenDestroy) {
        for (var key in this.scene.ships) {
            if (this.scene.ships[key] === this) {
                this.scene.ships.splice(key, 1);
            }
        }
    }

};


Ship.prototype.animateMunition = function () {

    for (var key in this.munitions) {

        var munition = this.munitions[key];
        var deplacements = munition.deplacementOfShipWhenShooting;
        var mouseShooting = this.mouseShooting;


        switch (true) {
            case (mouseShooting.leftUp):
//                munition.position.y += 50;
                munition.position.x -= 100;
                break;
            case (mouseShooting.rightUp):
//                munition.position.y += 50;
                munition.position.x += 100;
                ;
                break;
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


        if (munition.position.y - this.mesh.position.y > this.atkRange) {
            this.destroyMunition(key);
        }

        for (var i in this.scene.ennemies) {
       
            var ennemi = this.scene.ennemies[i];
            // si l'ennemi est aux meme coordonnées que ma munition
            if (ennemi.ship.isAtSamePositionThan(munition.position)) {

                this.destroyMunition(key);

                ennemi.ship.hp -= this.munitionDamage;


                if (ennemi.ship.hp < this.munitionDamage) {
                    ennemi.ship.destroy(this);
                }
            }

            continue;
        }
    }
};


Ship.prototype.cameraFollowShip = function () {

    var x = (this.scene.camera.position.x - (this.scene.camera.position.x - this.position.x) / 10);
    if (Math.round(this.scene.camera.position.x) - Math.round(this.position.x) === 0) {
        x = this.position.x;
    }

    var y = (this.scene.camera.position.y - (this.scene.camera.position.y - this.position.y) / 10);
    if (Math.round(this.scene.camera.position.y) - Math.round(this.position.y) === 0) {
        y = this.position.y;
    }

    this.scene.camera.position.set(x, y, this.scene.camera.position.z);

};

Ship.prototype.cameraFixed = function () {

    var x = (this.scene.camera.position.x - (this.scene.camera.position.x - this.scene.initialCameraPosition.x) / 10);
    if (Math.round(this.scene.camera.position.x) - Math.round(this.scene.initialCameraPosition.x) === 0) {
        x = this.scene.initialCameraPosition.x;
    }

    var y = (this.scene.camera.position.y - (this.scene.camera.position.y - this.scene.initialCameraPosition.y) / 10);
    if (Math.round(this.scene.camera.position.y) - Math.round(this.scene.initialCameraPosition.y) === 0) {
        y = this.scene.initialCameraPosition.y;
    }

    var z = this.scene.camera.position.z;
    if (this.scene.ships.length !== 1) {
        z = this.scene.initialCameraPosition.z;
    }
    this.scene.camera.position.set(x, y, z);

    if (this.scene.camera.RotationXSinceInitial !== this.initialRotationX) {
        var rotation = this.scene.camera.RotationXSinceInitial * (-1);
        this.scene.camera.rotateX(rotation);
        this.scene.camera.RotationXSinceInitial += rotation;
    }


};


Ship.prototype.animateCamera = function () {

    if (!this.scene.followShip) {
        this.cameraFixed();
    } else {
        this.cameraFollowShip();
    }
};


Ship.prototype.animateDeplacements = function () {
    var position = this.mesh.position;
    var deplacements = this.deplacements;

//    var isShipDeplacementEnded = this.mouse.x !== position.x || this.mouse.y !== position.y;
//
//
//    if ((this.mouseIn || isShipDeplacementEnded) && !this.isInCOllision) {
//        deplacements.left = false;
//        deplacements.right = false;
//        deplacements.up = false;
//        deplacements.down = false;
//        if (((this.mouse.x - position.x < this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) < 0) || ((this.mouse.x - position.x < -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) > 0)) {
//            deplacements.left = true;
//        }
//
//        if (((this.mouse.x - position.x > -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) < 0) || ((this.mouse.x - position.x > this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) > 0)) {
//            deplacements.right = true;
//        }
//        if (((this.mouse.y - position.y < this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) < 0) || ((this.mouse.y - position.y < -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) > 0)) {
//            deplacements.down = true;
//        }
//
//        if (((this.mouse.y - position.y > -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) < 0) || ((this.mouse.y - position.y > this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) > 0)) {
//            deplacements.up = true;
//        }
//    }


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


    var shipIsMoving = deplacements.up || deplacements.right || deplacements.left || deplacements.down;

    var cameraIsFixed = ((this.scene.initialCameraPosition.x === this.scene.camera.position.x) && (this.scene.initialCameraPosition.y === this.scene.camera.position.y) && (this.scene.initialCameraPosition.z === this.scene.camera.position.z));
    var cameraIsFollowingShip = (this.mesh.position.x === this.scene.camera.position.x && this.mesh.position.y === this.scene.camera.position.y && this.scene.initialCameraPosition.z !== this.scene.camera.position.z);

    if (shipIsMoving || (!this.scene.followShip && !cameraIsFixed) || (this.scene.followShip && !cameraIsFollowingShip)) {
        this.animateCamera();
    }
};



Ship.prototype.animateAutoDeplacements = function () {

    var jeton = null;
    for (var u in this.autoDeplacements) {
        if ((+new Date() - this.dateCreation) >= u) {
            jeton = u;
        }
    }
    
    if (jeton) {
        switch (this.autoDeplacements[jeton]) {
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
};


Ship.prototype.animateRepousse = function (fromPosition) {
    var x, y, z;
    if (fromPosition.x > this.mesh.position.x) {
        x = -300;
    } else {
        x = 300;
    }
    if (fromPosition.y > this.mesh.position.y) {
        y = -300;
    } else {
        y = 300;
    }
    if (fromPosition.z > this.mesh.position.z) {
        z = -300;
    } else {
        z = 300;
    }

    this.setPosition(x + this.mesh.position.x, y + this.mesh.position.y, z + this.mesh.position.z - z);
};


Ship.prototype.animateCollision = function () {

    this.isInCOllision = false;

    var ennemies = this.scene.ennemies;

    for (var key in ennemies) {
        if (this === ennemies[key].ship) {
            continue;
        }
        if (ennemies[key].ship.isAtSamePositionThan(this.mesh.position)) {
//            this.hp--;
            if (this.hp <= 0) {
                this.destroy();
            } else {
                this.animateRepousse(ennemies[key].ship.mesh.position);
                ennemies[key].ship.animateRepousse(this.mesh.position);
                this.isInCOllision = true;
            }
            continue;
        }
    }
    var ships = this.scene.playerShips;

    for (var key in ships) {
        if (ships[key].ship.isAtSamePositionThan(this.mesh.position)) {
            if (this === ships[key].ship) {
                continue;
            }
            this.hp--;
            if (this.hp <= 0) {
                this.destroy();
            } else {
                this.animateRepousse(ships[key].ship.mesh.position);
                ships[key].ship.animateRepousse(this.mesh.position);
                this.isInCOllision = true;
            }
            continue;
        }
    }

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
    this.level.level += 1;
    this.level.textLevel.update();
    this.level.currentXp = 0;
    this.level.totalXpForNextLevel = this.level.level * 10;
    this.munitionDamage = this.level.level;
    this.atkSpeed -= 10;
    if (this.munitionSpeed < this.munitionSpeedMax) {
        this.munitionSpeed += 5;
    }
};

Ship.prototype.isAtSamePositionThan = function (position) {

    var radius = this.mesh.geometry.boundingSphere.radius * this.scale * 1.5;
    var ePos = this.mesh.position;

    return(
            position.x > (ePos.x - radius) && position.x < (ePos.x + radius)
            && position.y > (ePos.y - radius) && position.y < (ePos.y + radius)
            && position.z > (ePos.z - radius) && position.z < (ePos.z + radius)
            );
};



Ship.prototype.shipGrowDown = function () {
    if (this.scale > 1.000) {
        this.scale -= 0.04;
    }
    this.scale.set(this.scale, this.scale, this.scale);
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
    var munition = this.munitionModele.clone();

    munition.position.x = this.mesh.position.x;
    munition.position.y = this.mesh.position.y;
    munition.position.z = this.mesh.position.z;

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

    if (this.scale > this.scaleBreathMax) {
        this.expire = true;
        this.inspire = false;
    } else if (this.scale <= this.scaleBreathMin) {
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

module.exports = Ship;
},{"./LifeBar.js":6}],9:[function(require,module,exports){
var Background = require("./Background.js");
var PlayerShip = require("./PlayerShip.js");
var EnnemiShip = require("./EnnemiShip.js");


/**
 * @description ""
 * @constructor
 * 
 */
var SphereGame = function (debug, textureMaterialUrls) {

    if (debug) {
        var stats = new Stats();
        stats.showPanel(1);
        document.body.appendChild(stats.dom);
    }
    this.renderer, this.scene, this.mainSphere = null;
    this.gameDiv = document.getElementById('3d');

    this.srcMainSphereMaterial = textureMaterialUrls['textures_player_ships'][0];
    this.srcMunitionMaterial = textureMaterialUrls['textures_munitions'][0];
    this.srcEnnemiesMaterial = textureMaterialUrls['textures_ennemi_ships'];
    this.bigStarsSrc = textureMaterialUrls['textures_big_stars'];
    this.pause = false;




    this.animate = function () {

        if (debug) {
            stats.end();
        }

        // on appel la fonction animate() récursivement à chaque frame
        requestAnimationFrame(this.animate);

//        var time = performance.now() / 1000;
        if (debug) {
            stats.begin();
        }

        if (this.pause) {
            return;
        }

        this.background.animate();


        for (var i in this.scene.playerShips) {
            this.scene.playerShips[i].animate();
        }

        for (var i in this.scene.ennemies) {
            this.scene.ennemies[i].animate();
        }


        // on effectue le rendu de la scène
        this.renderer.render(this.scene, this.scene.camera);
    }.bind(this);

    this.init();

    this.animate();
};

SphereGame.prototype.init = function () {
    // on initialise le moteur de rendu
    this.renderer = new THREE.WebGLRenderer();

    // si WebGL ne fonctionne pas sur votre navigateur vous pouvez utiliser le moteur de rendu Canvas à la place
    // renderer = new THREE.CanvasRenderer();
    this.size = {
        width: window.innerWidth,
        heigth: window.innerHeight
    };

    this.renderer.setSize(this.size.width, this.size.heigth);
    this.gameDiv.appendChild(this.renderer.domElement);


    window.onresize = function (e) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.scene.camera.aspect = window.innerWidth / window.innerHeight;
        this.scene.camera.updateProjectionMatrix();
    }.bind(this);



    // on initialise la scène
    this.scene = new THREE.Scene();

    var initialCameraPosition = {x: 0, y: 4000, z: 10000};
    this.scene.initialCameraPosition = initialCameraPosition;

    var gameBoundLimit = {
        'minX': -3200,
        'maxX': 3200,
        'minY': -400,
        'maxY': 8400,
        'minZ': 0,
        'maxZ': 0
    };
    this.scene.gameBoundLimit = gameBoundLimit;

    // on initialise la camera que l’on place ensuite sur la scène
    this.scene.camera = new THREE.PerspectiveCamera(50, this.size.width / this.size.heigth, 1, 50000);
    this.scene.camera.position.set(this.scene.initialCameraPosition.x, this.scene.initialCameraPosition.y, this.scene.initialCameraPosition.z);
    this.scene.add(this.scene.camera);


    this.scene.camera.initialRotationX = 0.00;
    this.scene.camera.RotationXSinceInitial = 0.00;
    this.scene.camera.initialRotationY = 0.00;
    this.scene.camera.RotationYSinceInitial = 0.00;
    this.scene.camera.initialRotationZ = 0.00;
    this.scene.camera.RotationZSinceInitial = 0.00;


    this.scene.followShip = false;



    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
    if (document.attachEvent) {

        document.attachEvent("on" + mousewheelevt, function (e) {
            if (this.pause) {
                return;
            }
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            this.cameraZoom(delta * -100);
        }.bind(this));

    } else if (document.addEventListener) {

        document.addEventListener(mousewheelevt, function (e) {
            if (this.pause) {
                return;
            }
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            this.cameraZoom(delta * -100);
        }.bind(this), false);

    }

    this.initBgm();

    this.background = new Background(this.scene, 'black', 100, this.bigStarsSrc);

    this.allowSecondPlayer = false;
    this.scene.ships = [];
    this.playersNumbers = 0;

    this.textureLoader = new THREE.TextureLoader();

    this.textureLoader.load(
            this.srcMainSphereMaterial,
            function (texture) {
                this.createShip(texture);
            }.bind(this),
            function (xhr) {
                console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            }
    );

    if (document.attachEvent) {
        document.attachEvent("shipcreated", function (e) {
            this.playerShip1 = e.detail.ship;
            this.addKeyboardManager();
//            self.addMouseManager();
        }.bind(this));

    } else if (document.addEventListener) {

        document.addEventListener("shipcreated", function (e) {
            this.playerShip1 = e.detail.ship;
            this.addKeyboardManager();
//            self.addMouseManager();
        }.bind(this), false);

    }

    // on ajoute une lumière blanche
    var lumiere = new THREE.DirectionalLight(0xffffff, 1.0);
    lumiere.position.set(0, 0, 400);
    this.scene.add(lumiere);

    this.ennemiesMaterials = [];

    for (var i = 0; i < this.srcEnnemiesMaterial.length; i++) {
        this.textureLoader.load(
                this.srcEnnemiesMaterial[i],
                function (texture) {
                    texture.minFilter = THREE.LinearFilter;
                    this.ennemiesMaterials.push(new THREE.MeshBasicMaterial({map: texture}));

                    if (this.srcEnnemiesMaterial.length === this.ennemiesMaterials.length) {
                        this.createEnnemies();
                    }
                }.bind(this),
                function (xhr) {
                    console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                }.bind(this)
                );
    }

};


SphereGame.prototype.createEnnemies = function () {
    var listOfMove = {0: 'down', 1: 'right', 2: 'up', 3: 'left'};

    this.ennemiNumber = 1;

    var self = this;

    for (var i = 0; i < this.ennemiNumber; i++) {
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

            new EnnemiShip(self.scene, new THREE.Mesh(geometry, self.ennemiesMaterials[Math.round(Math.random() * (self.ennemiesMaterials.length - 1)) ]), {'popPosition': popPosition, 'autoDeplacements': null, 'gainExp': 4});
        }, 1000 * i);
    }
};

SphereGame.prototype.createShip = function (texture) {
    var ship = null;
    texture.minFilter = THREE.LinearFilter;
    this.geometryShip = new THREE.SphereGeometry(200, 32, 32);
    this.materialShip = new THREE.MeshBasicMaterial({
        map: texture
    });

    if (!this.munitionShip) {
        // créer les munitions 
        this.textureLoader.load(
                this.srcMunitionMaterial,
                function (textureMun) {

                    this.createMunitionTexture(textureMun);
                    ship = new PlayerShip(this.scene, new THREE.Mesh(this.geometryShip, this.materialShip), {'levelPosition': 'left', 'popPosition': null, 'munitionModele': this.munitionShip});
                    console.log('a');
                    console.log(ship);
                    var event = new CustomEvent('shipcreated', {'detail':{'ship': ship}});
                    document.dispatchEvent(event);
                }.bind(this),
                function (xhr) {
                    console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                }.bind(this)
                );
    } else {
        ship = new PlayerShip(this.scene, new THREE.Mesh(this.geometryShip, this.materialShip), {'levelPosition': 'left', 'popPosition': null, 'munitionModele': this.munitionShip});
        console.log('b');
        var event = new CustomEvent('shipcreated', {'detail':{'ship': ship}});
        document.dispatchEvent(event);
    }

//    this.playersNumbers++;
};

SphereGame.prototype.createMunitionTexture = function (texture) {
    texture.minFilter = THREE.LinearFilter;
    var geometryMunition = new THREE.SphereGeometry(100, 32, 32);
    var materialMunition = new THREE.MeshBasicMaterial({
        map: texture
    });
    this.munitionShip = new THREE.Mesh(geometryMunition, materialMunition);
};

SphereGame.prototype.cameraZoom = function (value) {

    if (this.scene.camera.position.z < 10000 && !this.playerShip2) {
        this.scene.followShip = true;
    } else {
        this.scene.followShip = false;
    }


    if (value > 0) {
        if (this.scene.camera.position.z <= 10000) {
            if (value + this.scene.camera.position.z > 10000) {
                this.scene.camera.position.z = 10000;
            } else {
                this.scene.camera.position.z = value + this.scene.camera.position.z;
            }

        }

    } else {
        if (this.scene.camera.position.z >= 5000) {

            if (value + this.scene.camera.position.z < 5000) {
                this.scene.camera.position.z = 5000;
            } else {
                this.scene.camera.position.z = value + this.scene.camera.position.z;
            }

        }
    }

    this.playerShip1.animateCamera();
};

SphereGame.prototype.tooglePause = function () {
    this.pause = !this.pause;
};

SphereGame.prototype.initBgm = function () {

    this.listener = new THREE.AudioListener();
    this.scene.camera.add(this.listener);


    this.bgm1 = new THREE.Audio(this.listener);
    this.bgm1.setLoop(true);
    this.scene.add(this.bgm1);

    var self = this;
    this.audioLoader = new THREE.AudioLoader();


    this.audioLoader.load(
            'bgm/bgm1.ogg',
            function (audioBuffer) {
                self.bgm1.setBuffer(audioBuffer);
                self.bgm1.play();
            },
            function (xhr) {
                console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            }
    );

};

SphereGame.prototype.addMouseManager = function () {
    var playerShip1 = this.playerShip1;

    playerShip1.sensibilityMouseX = 3;
    playerShip1.sensibilityMouseY = 11;
    playerShip1.mouse = {};
    playerShip1.mouseIn = false;



    document.onmouseenter = function (key) {
        playerShip1.mouseIn = true;
        playerShip1.mouse.x = ((key.clientX / window.innerWidth) * 2 - 1) * 13000 * (playerShip1.sensibilityMouseX / 10);
        playerShip1.mouse.y = (2 - (key.clientY / window.innerHeight) * 2) * 4400 * (playerShip1.sensibilityMouseY / 10);
    };
    document.onmouseleave = function (key) {
        playerShip1.mouseIn = false;
    };
    document.onmousemove = function (key) {
        playerShip1.mouse.x = ((key.clientX / window.innerWidth) * 2 - 1) * 13000 * (playerShip1.sensibilityMouseX / 10);
        playerShip1.mouse.y = (2 - (key.clientY / window.innerHeight) * 2) * 4400 * (playerShip1.sensibilityMouseY / 10);
    };

    document.addEventListener("touchstart", function (key) {
        key.preventDefault();

        playerShip1.mouse.x = ((key.touches[0].pageX / window.innerWidth) * 2 - 1) * 13000 * (playerShip1.sensibilityMouseX / 10);
        playerShip1.mouse.y = (2 - (key.touches[0].pageY / window.innerHeight) * 2) * 4400 * (playerShip1.sensibilityMouseY / 10);
        playerShip1.shooting = true;
        playerShip1.mouseIn = true;
    }, false);

    document.addEventListener("touchend", function (key) {
        key.preventDefault();
        playerShip1.mouseIn = false;
        playerShip1.shooting = false;
    }, false);

    document.addEventListener("touchmove", function (key) {
        key.preventDefault();
        playerShip1.mouse.x = ((key.touches[0].pageX / window.innerWidth) * 2 - 1) * 13000 * (playerShip1.sensibilityMouseX / 10);
        playerShip1.mouse.y = (2 - (key.touches[0].pageY / window.innerHeight) * 2) * 4400 * (playerShip1.sensibilityMouseY / 10);
    }, false);



    this.gameDiv.onmousedown = function (key) {
        playerShip1.shooting = true;
    };
    this.gameDiv.onmouseup = function (key) {
        playerShip1.shooting = false;
    };
};

SphereGame.prototype.addKeyboardManager = function () {

    document.onkeyup = function (key) {
        switch (key.keyCode) {
            case  27:
                this.tooglePause();
                break;
            case  32:
                this.playerShip1.shooting = false;
                break;
            case  37:
                this.playerShip1.deplacements.left = false;
                break;
            case  38:
                this.playerShip1.deplacements.up = false;
                break;
            case  39:
                this.playerShip1.deplacements.right = false;
                break;
            case  40:
                this.playerShip1.deplacements.down = false;
                break;

//            case  17:
//                if (self.playerShip2) {
//                    self.playerShip2[1].shooting = false;
//                 }
//                break;
//            case  81:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.left = false;
//                }
//                break;
//            case  90:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.up = false;
//                }
//                break;
//            case  68:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.right = false;
//                }
//                break;
//            case  83:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.down = false;
//                }
//                break;
//
        }
    }.bind(this);

    document.onkeydown = function (key) {
        this.playerShip1.mouseIn = false;
        switch (key.keyCode) {
            case 32:
                this.playerShip1.shooting = true;
                break;
            case  37:
                this.playerShip1.deplacements.left = true;
                break;
            case  38:
                this.playerShip1.deplacements.up = true;
                break;
            case  39:
                this.playerShip1.deplacements.right = true;
                break;
            case  40:
                this.playerShip1.deplacements.down = true;
                break;

//            case  17:
//                if (self.allowSecondPlayer) {
//                    if (!self.scene.ship2) {
//                        self.ships[1] = new Ship(self.scene, new THREE.Mesh(self.geometryShip, self.materialShip), self.munitionShip, 'right');
//
//                    } else {
//                        self.ships[1].shooting = true;
//                    }
//                }
//                break;
//            case  81:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.left = true;
//                }
//                break;
//            case  90:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.up = true;
//                }
//                break;
//            case  68:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.right = true;
//                }
//                break;
//            case  83:
//                if (self.scene.ship2) {
//                    self.ships[1].deplacements.down = true;
//                }
//                break;
        }
    }.bind(this);

};

module.exports = SphereGame;

},{"./Background.js":2,"./EnnemiShip.js":4,"./PlayerShip.js":7}],10:[function(require,module,exports){
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

module.exports = TextLevel;
},{}]},{},[1]);
