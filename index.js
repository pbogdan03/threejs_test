(function() {
  var AnimationApp = function(settings) {
    this.settings = {
      width: settings.width || window.innerWidth,
      height: settings.height || window.innerHeight,
      verticalMin: settings.verticalMin || -15,
      verticalMax: settings.verticalMax || 15,
      horizontalMin: settings.horizontalMin || -500,
      horizontalMax: settings.horizontalMax || 500,
      step: settings.step || 1,
      lineSubdivs: settings.lineSubdivs || 6
    };
    this.resolution = new THREE.Vector2(settings.width, settings.height);
    this.theta = 0;
    this.windowHalfX = this.settings.width / 2;
    this.windowHalfY = this.settings.height / 2;
    this.mouseX = 0;
    this.mouseY = 0;
    this.noise = noise;
    this.time = Date.now();

    this.init();
  };

  AnimationApp.prototype.init = function() {
    // Add DOM Stuff
    var el = document.querySelector('#root');
    var container = document.createElement( 'div' );
    el.appendChild( container );

    // Setup this.camera
    this.camera = new THREE.PerspectiveCamera(
      33,
      this.settings.width / this.settings.height,
      1,
      10000
    );
    this.camera.position.z = 700;

    // Setup this.scene and this.renderer
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.autoClear = false;

    // Add the canvas to the DOM
    container.appendChild( this.renderer.domElement );

    // for(var i = 0; i < this.scene.children.length; i++) {
    //   var points = this.scene.children[i].geometry.attributes.position.array;
    //   for(var j = 0; j < points.length; j++) {
    //     if(j % 3 === 0) { //x
    //       points[j + 1] += 100;
    //     }
    //   }
    // }

    // var points = this.scene.children[0].geometry.attributes.position;
    //
    // console.log(this.scene.children[0].geometry.attributes.position);

    // Setup noise seed
    this.noise.seed(Math.random());

    this.addGUI();
    this.animate();
    this.addEvents();
  }

  AnimationApp.prototype.addGUI = function() {
    this.gui = new dat.GUI();

    this.verticalMinCtrl = this.gui.add(this.settings, "verticalMin", -500, 500).step(this.settings.step);
    this.verticalMaxCtrl = this.gui.add(this.settings, "verticalMax", -500, 500).step(this.settings.step);
    this.horizontalMinCtrl = this.gui.add(this.settings, "horizontalMin", -500, 500).step(this.settings.step);
    this.horizontalMaxCtrl = this.gui.add(this.settings, "horizontalMax", -500, 500).step(this.settings.step);
    this.stepCtrl = this.gui.add(this.settings, "step", 0, 10).step(1);
  }

  AnimationApp.prototype.animate = function() {
    requestAnimationFrame(function() {
      return this.animate();
    }.bind(this));
    this.render();
  }

  AnimationApp.prototype.render = function() {
    this.theta = Math.round((Date.now() - this.time) / 100);

    // Animate this.camera based on mouse position
    this.camera.position.x += ( this.mouseX - this.camera.position.x ) * .05;
    this.camera.position.y += ( - this.mouseY + 200 - this.camera.position.y ) * .05;
    this.camera.lookAt( this.scene.position );

    // Clear this.scene on every render
    this.clearScene();
    // Recreate lines in new positions
    for (var i = this.settings.verticalMin; i < this.settings.verticalMax; i++) {
      this.createLine(new THREE.Vector3(0, i * 10, 0), i, this.theta);
    }

    if(this.theta === 10) {

    }
    //
    // if(theta % 20 === 0) {
    //   console.log('iterate: ', iterate);
    //   console.log('noise: ', noise.simplex2(iterate / 100, iterate / 100));
    //   iterate++;
    // }

    // for ( var i = 0; i < this.scene.children.length; i ++ ) {
    //   var object = this.scene.children[ i ];
    //   if ( object instanceof THREE.Mesh ) {
    //     var points = object.geometry.attributes.position.array;
    //
    //     for(var j = 0; j < points.length; j++) {
    //       if(j % 3 === 0) { //x
    //         // console.log(points[j + 1]);
    //         object.geometry.attributes.position.dynamic = true;
    //         points[j + 1] += theta;
    //         object.geometry.verticesNeedUpdate = true;
    //         // console.log(points[j + 1]);
    //       }
    //     }
    //
    //   };
    // }

    this.renderer.render(this.scene, this.camera);
  }

  AnimationApp.prototype.clearScene = function() {
    for(var i = this.scene.children.length - 1; i >= 0; i--) {
      if(this.scene.children[i] instanceof THREE.Mesh) {
        this.scene.remove(this.scene.children[i]);
      }
    }
  }

  AnimationApp.prototype.onDocumentMouseMove = function( event ) {
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
  }

  AnimationApp.prototype.createLine = function(position, index, variation) {
    var geometry = new THREE.Geometry();
    var index, pointPos;

    var points = this.createPoints(this.settings.horizontalMin, this.settings.horizontalMax, this.settings.step, index, variation);
    var curve = new THREE.CatmullRomCurve3(points);

    for(var i = 0; i < points.length * this.settings.lineSubdivs; i++) {
      index = i / (points.length * this.settings.lineSubdivs);
      pointPos = curve.getPoint(index);

      geometry.vertices[i] = new THREE.Vector3(pointPos.x, pointPos.y, pointPos.z);
    }

    var line = new MeshLine();
    line.setGeometry(geometry);

    var material = new MeshLineMaterial({
      color: new THREE.Color(0xffffff),
      resolution: this.resolution,
      lineWidth: 2,
      near: this.camera.near,
      far: this.camera.far,
      depthWrite: false,
      dashArray: new THREE.Vector2(10, 5),
      side: THREE.DoubleSide,
      transparent: true
    });

    var meshline = new THREE.Mesh(line.geometry, material);
    meshline.position.x = position.x;
    meshline.position.y = position.y;
    meshline.position.z = position.z;

    meshline.name = 'line';

    this.scene.add( meshline );
  }

  AnimationApp.prototype.createPoints = function(min, max, step, index, variation) {
    var pointsArr = [];

    for(var i = min, j = max; i<=j; i+=step) {
      if(variation) {
        pointsArr.push(new THREE.Vector3(i, this.noise.perlin2(i / max * 10, index / 10) * 10, 0));
      } else {
        pointsArr.push(new THREE.Vector3(i, 0, 0));
      }
    }

    return pointsArr;
  }

  AnimationApp.prototype.addEvents = function() {
    document.addEventListener( 'mousemove', function(e) {
      return this.onDocumentMouseMove(e);
    }.bind(this), false );

    document.querySelector('.finish-btn').addEventListener('click', function(e) {
      console.log('clicked');
    });
  }

  new AnimationApp({
    width: window.innerWidth,
    height: window.innerHeight,
    verticalMin: -15,
    verticalMax: 15,
    horizontalMin: -500,
    horizontalMax: 500,
    step: 1,
    lineSubdivs: 6
  });
})();
