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