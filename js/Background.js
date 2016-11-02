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
