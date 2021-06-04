import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

export class Shape_From_File extends Shape {                                   // **Shape_From_File** is a versatile standalone Shape that imports
                                                                               // all its arrays' data from an .obj 3D model file.
    constructor(filename) {
        super("position", "normal", "texture_coord");
        // Begin downloading the mesh. Once that completes, return
        // control to our parse_into_mesh function.
        this.load_file(filename);
    }

    load_file(filename) {                             // Request the external file and wait for it to load.
        // Failure mode:  Loads an empty shape.
        return fetch(filename)
            .then(response => {
                if (response.ok) return Promise.resolve(response.text())
                else return Promise.reject(response.status)
            })
            .then(obj_file_contents => this.parse_into_mesh(obj_file_contents))
            .catch(error => {
                this.copy_onto_graphics_card(this.gl);
            })
    }

    parse_into_mesh(data) {                           // Adapted from the "webgl-obj-loader.js" library found online:
        var verts = [], vertNormals = [], textures = [], unpacked = {};

        unpacked.verts = [];
        unpacked.norms = [];
        unpacked.textures = [];
        unpacked.hashindices = {};
        unpacked.indices = [];
        unpacked.index = 0;

        var lines = data.split('\n');

        var VERTEX_RE = /^v\s/;
        var NORMAL_RE = /^vn\s/;
        var TEXTURE_RE = /^vt\s/;
        var FACE_RE = /^f\s/;
        var WHITESPACE_RE = /\s+/;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var elements = line.split(WHITESPACE_RE);
            elements.shift();

            if (VERTEX_RE.test(line)) verts.push.apply(verts, elements);
            else if (NORMAL_RE.test(line)) vertNormals.push.apply(vertNormals, elements);
            else if (TEXTURE_RE.test(line)) textures.push.apply(textures, elements);
            else if (FACE_RE.test(line)) {
                var quad = false;
                for (var j = 0, eleLen = elements.length; j < eleLen; j++) {
                    if (j === 3 && !quad) {
                        j = 2;
                        quad = true;
                    }
                    if (elements[j] in unpacked.hashindices)
                        unpacked.indices.push(unpacked.hashindices[elements[j]]);
                    else {
                        var vertex = elements[j].split('/');

                        unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 0]);
                        unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 1]);
                        unpacked.verts.push(+verts[(vertex[0] - 1) * 3 + 2]);

                        if (textures.length) {
                            unpacked.textures.push(+textures[((vertex[1] - 1) || vertex[0]) * 2 + 0]);
                            unpacked.textures.push(+textures[((vertex[1] - 1) || vertex[0]) * 2 + 1]);
                        }

                        unpacked.norms.push(+vertNormals[((vertex[2] - 1) || vertex[0]) * 3 + 0]);
                        unpacked.norms.push(+vertNormals[((vertex[2] - 1) || vertex[0]) * 3 + 1]);
                        unpacked.norms.push(+vertNormals[((vertex[2] - 1) || vertex[0]) * 3 + 2]);

                        unpacked.hashindices[elements[j]] = unpacked.index;
                        unpacked.indices.push(unpacked.index);
                        unpacked.index += 1;
                    }
                    if (j === 3 && quad) unpacked.indices.push(unpacked.hashindices[elements[0]]);
                }
            }
        }
        {
            const {verts, norms, textures} = unpacked;
            for (var j = 0; j < verts.length / 3; j++) {
                this.arrays.position.push(vec3(verts[3 * j], verts[3 * j + 1], verts[3 * j + 2]));
                this.arrays.normal.push(vec3(norms[3 * j], norms[3 * j + 1], norms[3 * j + 2]));
                this.arrays.texture_coord.push(vec(textures[2 * j], textures[2 * j + 1]));
            }
            this.indices = unpacked.indices;
        }
        this.normalize_positions(false);
        this.ready = true;
    }

    draw(context, program_state, model_transform, material) {               // draw(): Same as always for shapes, but cancel all
        // attempts to draw the shape before it loads:
        if (this.ready)
            super.draw(context, program_state, model_transform, material);
    }
}

class Pyramid extends Shape {
    constructor() {
        super("position", "normal",);

        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
            [0, 0.414, 0], [-1, -1, 1], [1, -1, 1],
            [0, 0.414, 0], [1, -1, 1], [1, -1, -1],
            [0, 0.414, 0], [1, -1, -1], [-1, -1, -1],
            [0, 0.414, 0], [-1, -1, -1], [-1, -1, 1]);

        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0],
            [0, 2, 2.828], [0, 2, 2.828], [0, 2, 2.828], [0, 2, 2.828],
            [2.818, 2, 0], [2.818, 2, 0], [2.818, 2, 0], [2.818, 2, 0],
            [0, -2, 2.828], [0, -2, 2.828], [0, -2, 2.828], [0, -2, 2.828],
            [-2.828, 2, 0], [-2.828, 2, 0], [-2.828, 2, 0], [-2.828, 2, 0]);


        this.indices.push(0, 1, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
    }
}

export class Fractal extends Scene {
    constructor() {
        // Constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.shapes = {
            cube: new defs.Cube(),
            sphere4: new defs.Subdivision_Sphere(4),
            pyramid: new Pyramid(),
            trunk: new Shape_From_File("assets/tree_trunk.obj"),
            branch: new Shape_From_File("assets/tree_branch.obj")
        };

        this.bgm = new Audio();
        this.bgm.src = 'assets/space.m4a';
        this.bgm.volume = 0.3;

        this.materials = {
            gold: new Material(new defs.Textured_Reflected_Phong(),
                {
                    ambient: 0.17375,
                    diffusivity: 0.5282,
                    specularity: 0.516716,
                    smoothness: 51.2,
                    color: hex_color("#D4AF37")
                }),
            silver: new Material(new defs.Textured_Reflected_Phong(),
                {
                    ambient: 0.19225,
                    diffusivity: 0.50754,
                    specularity: 0.508273,
                    smoothness: 51.2,
                    color: hex_color("#C0C0C0")
                }),
            jade: new Material(new defs.Textured_Reflected_Phong(),
                {
                    ambient: 0.17166,
                    diffusivity: 0.68666,
                    specularity: 0.316228,
                    smoothness: 12.8,
                    color: hex_color("#00A86B")
                }),
            ruby: new Material(new defs.Textured_Reflected_Phong(),
                {
                    ambient: 0.066,
                    diffusivity: 0.23232,
                    specularity: 0.660576,
                    smoothness: 76.8,
                    color: hex_color("#E0115F")
                }),
            snowy: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/snowy.png")}),
            space: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/SPACE.png")}),
            whiteTop: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/whiteTop.png")}),
            whiteGround: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/whiteGround.png")}),
            grassTop: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/grassBG.png")}),
            grassGround: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 0.7, texture: new Texture("assets/grassText.png")}),
            tree_texture: new Material(new defs.Phong_Shader(), {ambient: 0.5, diffusivity: 0.5, color: hex_color("#8B4513")}),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 50), vec3(0, 0, 0), vec3(0, 1, 0));

    }

    make_control_panel() {
        this.key_triggered_button("Level 0", ["Control", "0"], () => this.attachedFlevel = () => 0);
        this.key_triggered_button("Level 1", ["Control", "1"], () => this.attachedFlevel = () => 1);
        this.key_triggered_button("Level 2", ["Control", "2"], () => this.attachedFlevel = () => 2);
        this.key_triggered_button("Level 3", ["Control", "3"], () => this.attachedFlevel = () => 3);
        this.key_triggered_button("Level 4", ["Control", "4"], () => this.attachedFlevel = () => 4);
        this.key_triggered_button("Space environment", ["Control", "s"], () => this.attached = () => "space");
        this.key_triggered_button("Earth environment", ["Control", "e"], () => this.attached = () => "earth");
        this.key_triggered_button("Grass environment", ["Control", "a"], () => this.attached = () => "grass");


        this.key_triggered_button("Cube Fractal", ["Control", "c"], () => this.attachedShpe = () => 100);
        this.key_triggered_button("Pyramid Fractal", ["Control", "p"], () => this.attachedShpe = () => 101);

        this.key_triggered_button("Gold Color", ["Control", "g"], () => this.attachedColor = () => "gold");
        this.key_triggered_button("Silver Color", ["Control", "l"], () => this.attachedColor = () => "silver");
        this.key_triggered_button("Jade Color", ["Control", "j"], () => this.attachedColor = () => "jade");
        this.key_triggered_button("Ruby Color", ["Control", "r"], () => this.attachedColor = () => "ruby");
    }

    display(context, program_state) {
        this.bgm.play();
        // display(): Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            program_state.set_camera(this.initial_camera_location)
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(11, 11, 11, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let envirTransform = Mat4.identity()
            .times(Mat4.scale(500, 500, 500));

        let flatTransform = Mat4.identity()
            .times(Mat4.translation(0, -100, 0))
            .times(Mat4.scale(500, 0.1, 500));



        if (this.attached === undefined) {
            program_state.set_camera(this.initial_camera_location);
            this.shapes.sphere4.draw(context, program_state, envirTransform, this.materials.space);
        }

        if (this.attached !== undefined) {
            let envirmnt = this.attached();
            if (envirmnt == "earth") {
                this.shapes.sphere4.draw(context, program_state, envirTransform, this.materials.snowy);
            } else if (envirmnt == "space") {
                this.shapes.sphere4.draw(context, program_state, envirTransform, this.materials.space);
            } else if (envirmnt == "grass") {
                this.shapes.sphere4.draw(context, program_state, envirTransform, this.materials.grassTop);
                this.shapes.cube.draw(context, program_state, flatTransform, this.materials.grassGround);
            }
        }

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        if (this.attached === undefined || this.attached() !== "white") {
            let pickedMaterial = this.materials.ruby;
            if (this.attachedColor) {
                if (this.attachedColor() == "jade") { // color------------------------------------------------------------------------------------
                    pickedMaterial = this.materials.jade;
                } else if (this.attachedColor() == "silver") {
                    pickedMaterial = this.materials.silver;
                } else if (this.attachedColor() == "gold") {
                    pickedMaterial = this.materials.gold;
                } else if (this.attachedColor() == "ruby") {
                    pickedMaterial = this.materials.ruby;
                } else if (this.attachedColor === undefined) {
                    pickedMaterial = this.materials.ruby;
                }
            }

            var Flevel;
            var width = 10;
            let loc_transform = Mat4.identity();
            if (this.attachedFlevel === undefined) {
                Flevel = 0;
            } else {
                Flevel = this.attachedFlevel();
            }

            if (this.attachedShpe) {
                if (this.attachedShpe() == 100) { // cube-----------------------------------------------------------------

                    var boxes = [];
                    var b = new Box(0, 0, 0, width);
                    boxes.push(b);

                    if (Flevel !== 0) {
                        for (var i = 0; i < Flevel; i++) {
                            var next = [];
                            for (var j = 0; j < boxes.length; j++) {
                                var b = boxes[j];
                                var new_boxes = b.generate();
                                next = next.concat(new_boxes);
                            }
                            boxes = next;
                        }
                    }
                    for (var i = 0; i < boxes.length; i++) {
                        this.shapes.cube.draw(context, program_state, loc_transform.times(Mat4.rotation(0.4 * Math.PI * t, 1, 1, 0)).times(Mat4.translation(boxes[i].pos[0], boxes[i].pos[1], boxes[i].pos[2])).times(Mat4.scale(boxes[i].r, boxes[i].r, boxes[i].r)), pickedMaterial);
                    }
                } else if (this.attachedShpe() == 101) { // pyramid----------------------------------------------------------------------------------------
                    var pyramids = [];

                    var p = new Fractal_pyramid(0, 0, 0, width * 2, Flevel);
                    pyramids.push(p);

                    if (Flevel !== 0) {
                        for (var i = 0; i < Flevel; i++) {
                            var next = [];
                            for (var j = 0; j < pyramids.length; j++) {
                                var b = pyramids[j];
                                var new_pyramids = b.generate();
                                next = next.concat(new_pyramids);
                            }
                            pyramids = next;
                        }
                    }

                    for (var i = 0; i < pyramids.length; i++) {
                        this.shapes.pyramid.draw(context, program_state, loc_transform.times(Mat4.rotation(0.2 * Math.PI * t, 0.5, 1, 1)).times(Mat4.translation(pyramids[i].pos[0], pyramids[i].pos[1], pyramids[i].pos[2])).times(Mat4.scale(pyramids[i].w, pyramids[i].w, pyramids[i].w)), pickedMaterial);
                    }
                }
            } else {
                var boxes = [];
                var b = new Box(0, 0, 0, width);
                boxes.push(b);

                if (Flevel !== 0) {
                    for (var i = 0; i < Flevel; i++) {
                        var next = [];
                        for (var j = 0; j < boxes.length; j++) {
                            var b = boxes[j];
                            var new_boxes = b.generate();
                            next = next.concat(new_boxes);
                        }
                        boxes = next;
                    }
                }
                for (var i = 0; i < boxes.length; i++) {
                    this.shapes.cube.draw(context, program_state, loc_transform.times(Mat4.rotation(0.4 * Math.PI * t, 1, 1, 0)).times(Mat4.translation(boxes[i].pos[0], boxes[i].pos[1], boxes[i].pos[2])).times(Mat4.scale(boxes[i].r, boxes[i].r, boxes[i].r)), pickedMaterial);
                }
            }
        }
    }
}

function Box(x, y, z, r) {
    this.pos = vec3(x, y, z);
    this.r = r;

    this.generate = function() {
        let boxes = [];
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                for (let z = -1; z < 2; z++) {
                    let sum = Math.abs(x) + Math.abs(y) + Math.abs(z);
                    let newR = r / 3;

                    if (sum > 1) {
                        let b = new Box(this.pos[0] + x * newR*2, this.pos[1] + y * newR*2, this.pos[2] + z * newR*2, newR);
                        boxes.push(b)
                    }
                }
            }
        }
        return boxes;
    };
}

function Fractal_pyramid(x, y, z, width, Flevel) {
    this.pos = vec3(x, y, z);
    this.w = width;

    this.generate = function() {
        let pyramids = [];

        let new_width = this.w / 2;
        let height = Math.sqrt(2) / 2 * this.w;

        for (var l = 1; l >=0; l--) {
            for (var x = -1; x <= 1; x++) {
                for (var z = -1; z <= 1; z++) {
                    if ((x === 0 || z === 0) && l !== 1) {
                        continue;
                    }
                    if(l === 1) {
                        let b = new Fractal_pyramid(this.pos[0], this.pos[1]-width/2 + l * height, this.pos[2], new_width, Flevel);
                        pyramids.push(b);
                    } else {
                        let b = new Fractal_pyramid(this.pos[0] + x * new_width, this.pos[1]-width/2 + l * height, this.pos[2] + z * new_width, new_width, Flevel);
                        pyramids.push(b);
                    }
                }
            }
        }
        return pyramids;
    };
}