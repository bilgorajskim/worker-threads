import * as THREE from "./three.module.js";

export function runBenchmark(animate) {
    return new Promise((resolve) => {
        let counter = 0;
        let loop = () => {
            animate();
            counter++;
            if (counter >= 600) {
                return resolve();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    });
}

export function makeCanvas(canvas) {
    var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );

			var renderer = new THREE.WebGLRenderer({canvas});

			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            let cubes = [];
            for (let x = 0; x < 100; x++) {
                cubes[x] = new THREE.Mesh( geometry, material );
			    scene.add( cubes[x] );
            }

			camera.position.z = 5;

			var animate = function () {
                for (let x = 0; x < 100; x++) {
                    cubes[x].rotation.x += 0.01;
                    cubes[x].rotation.y += 0.01;
                }

				renderer.render( scene, camera );
			};

	return animate;
}