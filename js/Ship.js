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