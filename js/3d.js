//THREE.PerspectiveCamera.prototype.rotate = function (angle, radius) {
//    this.angle = angle;
//    this.position.x = radius * Math.cos(this.angle);
//    this.position.z = radius * Math.sin(this.angle);
//    this.angle += 0.01;
//};

/* global THREE, document, URL_SHIP_SPHERE,URL_BIG_STARS, URL_CERISE, URL_FONT,URLS_ENNEMIES, URL_MUNITION */

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

var Ship = function (scene, mesh, munition, levelPosition) {
    this.mesh = mesh;
    this.scene = scene;
    this.scene.add(this.mesh);

    this.scene.ships.push(this);

    this.position = this.mesh.position;

    this.lastMunitionCreated = null;
    this.scale = 1;
    this.munitions = [];
    this.level = new Level(this, levelPosition);

    this.atkRange = 10000; //px ?
    this.atkSpeed = 200; //ms

    this.munition = munition;
    this.munitionDamage = this.level.level;

    this.deplacements = {'up': false, 'down': false, 'left': false, 'right': false};
    this.mouseShooting = {'rightUp': false, 'leftUp': false};
    this.shooting = false;
    this.munitionSpeed = 150;
    this.munitionSpeedMax = 300;

    this.addLifeBar();

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


        if (munition.position.y - this.getPosition().y > this.atkRange) {
            this.destroyMunition(key);
        }

        for (var i in this.scene.ennemies) {
            var ennemi = this.scene.ennemies[i];
            // si l'ennemi est aux meme coordonnées que ma munition
            if (ennemi.isAtSamePositionThan(munition.position)) {

                this.destroyMunition(key);

                ennemi.hp -= this.munitionDamage;

                if (ennemi.hp < this.munitionDamage) {
                    ennemi.destroy(this);
                }
            }

            continue;
        }
    }
};

Ship.prototype.animateDeplacements = function () {
    var position = this.mesh.position;




    var deplacements = this.deplacements;


    if (this.mouseIn) {
        deplacements.left = false;
        deplacements.right = false;
        deplacements.up = false;
        deplacements.down = false;
        if (((this.mouse.x - this.position.x < this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) < 0) || ((this.mouse.x - this.position.x < -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) > 0)) {
            deplacements.left = true;
        }

        if (((this.mouse.x - this.position.x > -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) < 0) || ((this.mouse.x - this.position.x > this.mesh.geometry.toJSON().radius / 2) && (this.mouse.x * -1) > 0)) {
            deplacements.right = true;
        }
        if (((this.mouse.y - this.position.y < this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) < 0) || ((this.mouse.y - this.position.y < -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) > 0)) {
            deplacements.down = true;
        }

        if (((this.mouse.y - this.position.y > -this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) < 0) || ((this.mouse.y - this.position.y > this.mesh.geometry.toJSON().radius / 2) && (this.mouse.y * -1) > 0)) {
            deplacements.up = true;
        }
    }


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
    var cameraIsFollowingShip = (this.position.x === this.scene.camera.position.x && this.position.y === this.scene.camera.position.y && this.scene.initialCameraPosition.z !== this.scene.camera.position.z);

    if (shipIsMoving || (!this.scene.followShip && !cameraIsFixed) || (this.scene.followShip && !cameraIsFollowingShip)) {
        this.animateCamera();
    }
};

Ship.prototype.animate = function () {
    this.animateRotation();
    this.shipBreath();
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
    this.gainExpAtDestruction = 2;

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

Ennemi.prototype.destroy = function (ship) {

    if (ship) {
        ship.addExp(this.gainExpAtDestruction);
    }
    this.scene.remove(this.mesh);
    this.lifeBar.destroy();

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

    this.renderer, this.scene, this.mainSphere = null;
    this.gameDiv = document.getElementById('3d');

    this.srcMainSphereMaterial = URL_SHIP_SPHERE;
    this.srcMunitionMaterial = URL_MUNITION;
    this.srcEnnemiesMaterial = URLS_ENNEMIES;
    this.bigStarsSrc = URL_BIG_STARS;
    this.pause = false;

    var self = this;
    this.animate = function () {

        // on appel la fonction animate() récursivement à chaque frame
        requestAnimationFrame(self.animate);

        if (self.pause) {
            return;
        }

        self.background.animate();


        for (var i in self.scene.ships) {
            self.scene.ships[i].animate();
        }

        for (var i in self.scene.ennemies) {
            self.scene.ennemies[i].animate();
        }


        // on effectue le rendu de la scène
        self.renderer.render(self.scene, self.scene.camera);
    };



    this.init();
//    this.addKeyboardManager();
//    this.addMouseManager();


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

    // on initialise la scène
    this.scene = new THREE.Scene();

    this.scene.ennemies = [];


    this.scene.initialCameraPosition = {x: 0, y: 4000, z: 10000};


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

    var self = this;

    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
    if (document.attachEvent) {

        document.attachEvent("on" + mousewheelevt, function (e) {
            if (self.pause) {
                return;
            }
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            self.cameraZoom(delta * -100);
        });

    } else if (document.addEventListener) {

        document.addEventListener(mousewheelevt, function (e) {
            if (self.pause) {
                return;
            }
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            self.cameraZoom(delta * -100);
        }, false);

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
                self.createShip(texture);
            },
            function (xhr) {
                console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            }
    );

    if (document.attachEvent) {

        document.attachEvent("shipcreated", function (e, ship) {
//            self.addKeyboardManager();
            self.addMouseManager();
        });

    } else if (document.addEventListener) {

        document.addEventListener("shipcreated", function (e, er) {
            //    self.addKeyboardManager();
            self.addMouseManager();
        }, false);

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
                    self.ennemiesMaterials.push(new THREE.MeshBasicMaterial({map: texture}));

                    if (self.srcEnnemiesMaterial.length === self.ennemiesMaterials.length) {
                        self.createEnnemies();
                    }
                },
                function (xhr) {
                    console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                }
        );
    }

};


SphereGame.prototype.createEnnemies = function () {
    var listOfMove = {0: 'down', 1: 'right', 2: 'up', 3: 'left'};

    this.ennemiNumber = 100;

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

            new Ennemi(self.scene, new THREE.Mesh(geometry, self.ennemiesMaterials[Math.round(Math.random() * (self.ennemiesMaterials.length - 1)) ]), popPosition, deplacements);
        }, 1000 * i);
    }
};

SphereGame.prototype.createShip = function (texture) {
    texture.minFilter = THREE.LinearFilter;
    this.geometryShip = new THREE.SphereGeometry(200, 32, 32);
    this.materialShip = new THREE.MeshBasicMaterial({
        map: texture
    });

    if (!this.munitionShip) {
        var self = this;
        // créer les munitions 
        this.textureLoader.load(
                this.srcMunitionMaterial,
                function (textureMun) {

                    self.createMunitionTexture(textureMun);
                    self.ship = new Ship(self.scene, new THREE.Mesh(self.geometryShip, self.materialShip), self.munitionShip, 'left');
                    var event = new Event('shipcreated', [this.ship]);
                    document.dispatchEvent(event);
                },
                function (xhr) {
                    console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                }
        );
    } else {
        this.ship = new Ship(this.scene, new THREE.Mesh(this.geometryShip, this.materialShip), this.munitionShip, 'left');
        var event = new Event('shipcreated', [this.ship]);
        document.dispatchEvent(event);
    }

    this.playersNumbers++;
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

    if (this.scene.camera.position.z < 10000 && !this.ship2) {
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

    this.ship.animateCamera();
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

    this.ship.sensibilityMouseX = 10;
    this.ship.sensibilityMouseY = 10;
    this.ship.mouse = {};
    this.ship.mouseIn = false;
    var ship = this.ship;

    document.onmouseenter = function (key) {
        ship.mouseIn = true;
        ship.mouse.x = ((key.clientX / window.innerWidth) * 2 - 1) * 13000 * (ship.sensibilityMouseX / 10);
        ship.mouse.y = (2 - (key.clientY / window.innerHeight) * 2) * 4400 * (ship.sensibilityMouseY / 10);
    };
    document.onmouseleave = function (key) {
        ship.mouseIn = false;
    };
    document.onmousemove = function (key) {
        ship.mouse.x = ((key.clientX / window.innerWidth) * 2 - 1) * 13000 * (ship.sensibilityMouseX / 10);
        ship.mouse.y = (2 - (key.clientY / window.innerHeight) * 2) * 4400 * (ship.sensibilityMouseY / 10);
    };
    this.gameDiv.onmousedown = function (key) {
        ship.shooting = true;
    };
    this.gameDiv.onmouseup = function (key) {
        ship.shooting = false;
    };
};

SphereGame.prototype.addKeyboardManager = function () {
    var self = this;

    document.onkeyup = function (key) {
        switch (key.keyCode) {
            case  27:
                self.tooglePause();
                break;
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

            case  17:
                if (self.scene.ship2) {
                    self.ship2.shooting = false;
                 }
                break;
            case  81:
                if (self.scene.ship2) {
                    self.ship2.deplacements.left = false;
                }
                break;
            case  90:
                if (self.scene.ship2) {
                    self.ship2.deplacements.up = false;
                }
                break;
            case  68:
                if (self.scene.ship2) {
                    self.ship2.deplacements.right = false;
                }
                break;
            case  83:
                if (self.scene.ship2) {
                    self.ship2.deplacements.down = false;
                }
                break;

        }
    };

    document.onkeydown = function (key) {
        self.ship.mouseIn = false;
        switch (key.keyCode) {
            case 32:
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

            case  17:
                if (self.allowSecondPlayer) {
                    if (!self.scene.ship2) {
                        self.ship2 = new Ship(self.scene, new THREE.Mesh(self.geometryShip, self.materialShip), self.munitionShip, 'right');

                    } else {
                        self.ship2.shooting = true;
                    }
                }
                break;
            case  81:
                if (self.scene.ship2) {
                    self.ship2.deplacements.left = true;
                }
                break;
            case  90:
                if (self.scene.ship2) {
                    self.ship2.deplacements.up = true;
                }
                break;
            case  68:
                if (self.scene.ship2) {
                    self.ship2.deplacements.right = true;
                }
                break;
            case  83:
                if (self.scene.ship2) {
                    self.ship2.deplacements.down = true;
                }
                break;
        }
    };

};

var game = new SphereGame();









