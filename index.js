(function() {
  var el = document.querySelector('#root');

  var mouseX = 0, mouseY = 0,
    windowHalfX = window.innerWidth / 2,
	  windowHalfY = window.innerHeight / 2,
    resolution = new THREE.Vector2(window.innerWidth, window.innerHeight),
		camera, scene, renderer, material, composer;

  init();
  animate();
  addEvents();

  function init() {
    var i, container;
    container = document.createElement( 'div' );
    el.appendChild( container );
    camera = new THREE.PerspectiveCamera(
      33,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 700;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    for(var i = -10, j = 10; i < j; i++) {
      var position = new THREE.Vector3(0, i * 10, 0);
      createLine(position);
    }

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    for(var i = 0; i < scene.children.length; i++) {
      var points = scene.children[i].geometry.attributes.position.array;
      for(var j = 0; j < points.length; j++) {
        if(j % 3 === 0) { //x
          points[j + 1] += 100;
        }
      }
    }
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    var time = Date.now() * 0.005;

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
    camera.lookAt( scene.position );
    var time = Date.now() * 0.0005;
    for ( var i = 0; i < scene.children.length; i ++ ) {
      var object = scene.children[ i ];
      if ( object instanceof THREE.Line ) object.rotation.y = time * ( i % 2 ? 1 : -1 );
    }
    renderer.render(scene, camera);
  }

  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }

  function createLine(position) {
    var geometry = new THREE.Geometry();

    var curve = new THREE.SplineCurve(createPoints(-100, 100, 10));

    var path = new THREE.Path( curve.getPoints( 50 ) );
    geometry = path.createPointsGeometry( 50 );

    var line = new MeshLine();
    line.setGeometry(geometry);

    var material = new MeshLineMaterial({
      color: new THREE.Color(0xffffff),
      resolution: resolution,
      lineWidth: 2,
      near: camera.near,
      far: camera.far,
      depthWrite: false,
      dashArray: new THREE.Vector2(10, 5),
      side: THREE.DoubleSide,
      transparent: true
    });

    var meshline = new THREE.Mesh(line.geometry, material);
    meshline.position.x = position.x;
    meshline.position.y = position.y;
    meshline.position.z = position.z;

    scene.add( meshline );
  }

  function createPoints(min, max, step) {
    var pointsArr = [];

    for(var i = min, j = max; i<=j; i+=step) {
      pointsArr.push(new THREE.Vector3(i, 0, 0));
    }

    return pointsArr;
  }

  function addEvents() {
    document.querySelector('.finish-btn').addEventListener('click', function(e) {
      console.log('clicked');
    });
  }
})();
