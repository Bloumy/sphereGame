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
                    var event = new CustomEvent('shipcreated', {'detail':{'ship': ship}});
                    document.dispatchEvent(event);
                }.bind(this),
                function (xhr) {
                    console.log(xhr.target.responseURL + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                }.bind(this)
                );
    } else {
        ship = new PlayerShip(this.scene, new THREE.Mesh(this.geometryShip, this.materialShip), {'levelPosition': 'left', 'popPosition': null, 'munitionModele': this.munitionShip});
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
