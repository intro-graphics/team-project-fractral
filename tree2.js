import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

let PI = Math.PI;
let lengths = [5];
let XYangles = [0];
let YZangles = [0];
let XY_prev_angles = [0];
let YZ_prev_angles = [0];
let depth = getRandomInt(2, 7);
let num_branches = [];
let total_num_branches = 0;
let x = getRandomInt(-25, 25);
let z = getRandomInt(-25, 25);


for (let i = 0; i < depth; i++) {
    num_branches.push(2 ** i);
    total_num_branches = total_num_branches + (2 ** i);
}

for (let i = 1; i < depth; i++) {
    let count = 0;
    let temp_length = getRandomInt(2, 8-depth);
    let temp_angle = PI/getRandomInt(3, 9);
    let temp_angle2 = PI/getRandomInt(3, 9);
    // let temp_angle2 = 0;


    for (let j = 0; j < num_branches[i]; j++) {
        lengths.push(temp_length);

        if (j % 2 === 1) {
            let tempXY = XY_prev_angles[0] + temp_angle;
            XYangles.push(tempXY);
            XY_prev_angles.push(tempXY);

            let tempYZ = YZ_prev_angles[0] + temp_angle2;
            YZangles.push(tempYZ);
            YZ_prev_angles.push(tempYZ);

            count += 1;
        } else {
            let tempXY = XY_prev_angles[0] - temp_angle;
            XYangles.push(tempXY);
            XY_prev_angles.push(tempXY);

            let tempYZ = YZ_prev_angles[0] + temp_angle2;
            YZangles.push(tempYZ);
            YZ_prev_angles.push(tempYZ);

            count += 1;
        }

        if (count === 2) {
            count = 0;
            XY_prev_angles.shift();
            YZ_prev_angles.shift();
        }
    }
}

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
export class Tree2 extends Scene {
    constructor() {
        // Constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.shapes = {
            cube: new defs.Cube(),
            plane: new defs.Square(),
            trunk: new Shape_From_File("assets/tree_trunk.obj"),
            branch: new Shape_From_File("assets/tree_branch.obj")
        };


        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#53350A")}),

            soil: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#836539")}),
            oak: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/oak_bark.png")}),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 60), vec3(0, 10, 0), vec3(0, 1, 0));
    }

    make_control_panel() {

    }


    display(context, program_state) {
        // display(): Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            program_state.set_camera(this.initial_camera_location)
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time, dt = program_state.animation_delta_time / 1000;

        let identity = Mat4.identity();

        let locations = [vec3(0,lengths[0],0)];
        let endpoints = [vec3(0, 2*lengths[0], 0)];

        let count = 0;
        for (let i = 1; i < total_num_branches; i++) {

            let angle1 = XYangles[i];
            let angle2 = YZangles[i];
            let temp_angle = .1;

            let prev_x = endpoints[0][0];
            let prev_y = endpoints[0][1];
            let prev_z = endpoints[0][2];


            let branch_y = lengths[i];

            let temp_x = -branch_y  * Math.sin(angle1);
            let temp_y = branch_y * Math.cos(angle1);

            let new_x = temp_x * Math.cos(angle2);
            let new_y = temp_y;
            let new_z = -temp_x * Math.sin(angle2);

            let end_y = 2 * lengths[i]

            let temp_end_x = -end_y  * Math.sin(angle1);
            let temp_end_y = end_y * Math.cos(angle1);

            let new_end_x = temp_end_x * Math.cos(angle2);
            let new_end_y = temp_end_y;
            let new_end_z = -temp_end_x * Math.sin(angle2);

            // locations.push(vec3(endpoints[0][0] - lengths[i] * Math.sin(XYangles[i]), endpoints[0][1] + lengths[i] * Math.cos(XYangles[i]),0))
            // endpoints.push(vec3(endpoints[0][0] - 2*lengths[i] * Math.sin(XYangles[i]), endpoints[0][1] + 2*lengths[i] * Math.cos(XYangles[i]),0))

            locations.push(vec3(prev_x + new_x, prev_y + new_y, prev_z + new_z));
            endpoints.push(vec3(prev_x + new_end_x, prev_y + new_end_y, prev_z + new_end_z));


            count++;

            if(count == 2) {
                endpoints.shift();
                count = 0;
            }
        }

        let plane_transform = identity.times(Mat4.scale(500, 500, 500)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0));
        this.shapes.plane.draw(context, program_state, plane_transform, this.materials.soil)
        for(let i = 0; i < total_num_branches; i++) {
            if(i === 0) {
                let transform = identity.times(Mat4.translation(x, 0, z)).times(Mat4.translation(locations[i][0], locations[i][1], locations[i][2])).times(Mat4.rotation(XYangles[i], 0,0,1))
                .times(Mat4.scale(1, lengths[i], 1));
                this.shapes.trunk.draw(context, program_state, transform, this.materials.test)
            } else {
                let transform = identity.times(Mat4.translation(x, 0, z)).times(Mat4.translation(locations[i][0], locations[i][1], locations[i][2]))
                    .times(Mat4.rotation(YZangles[i], 0, 1, 0))
                    .times(Mat4.rotation(XYangles[i], 0,0,1))
                    .times(Mat4.scale(0.8, lengths[i], 0.8));
                this.shapes.branch.draw(context, program_state, transform, this.materials.test)
            }
        }
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}